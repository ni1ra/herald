import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const days = Math.min(90, Math.max(1, parseInt(url.searchParams.get('days') || '7')));

	const [
		[{ count: sent }],
		[{ count: delivered }],
		[{ count: opened }],
		[{ count: clicked }],
		[{ count: bounced }],
		[{ count: complained }],
		daily_volume
	] = await Promise.all([
		sql`
			SELECT COUNT(*)::int AS count FROM herald_messages
			WHERE tenant_id = ${session.tenantId}
			AND status != 'queued'
			AND created_at > NOW() - ${days + ' days'}::interval
		`,
		sql`
			SELECT COUNT(*)::int AS count FROM herald_messages
			WHERE tenant_id = ${session.tenantId}
			AND (status = 'delivered' OR delivered_at IS NOT NULL)
			AND created_at > NOW() - ${days + ' days'}::interval
		`,
		sql`
			SELECT COUNT(*)::int AS count FROM herald_messages
			WHERE tenant_id = ${session.tenantId}
			AND opened_at IS NOT NULL
			AND created_at > NOW() - ${days + ' days'}::interval
		`,
		sql`
			SELECT COUNT(*)::int AS count FROM herald_messages
			WHERE tenant_id = ${session.tenantId}
			AND clicked_at IS NOT NULL
			AND created_at > NOW() - ${days + ' days'}::interval
		`,
		sql`
			SELECT COUNT(*)::int AS count FROM herald_messages
			WHERE tenant_id = ${session.tenantId}
			AND (bounced_at IS NOT NULL OR status = 'bounced')
			AND created_at > NOW() - ${days + ' days'}::interval
		`,
		sql`
			SELECT COUNT(*)::int AS count FROM herald_messages
			WHERE tenant_id = ${session.tenantId}
			AND (complained_at IS NOT NULL OR status = 'complained')
			AND created_at > NOW() - ${days + ' days'}::interval
		`,
		sql`
			SELECT DATE(created_at) AS date, COUNT(*)::int AS count
			FROM herald_messages
			WHERE tenant_id = ${session.tenantId}
			AND created_at > NOW() - ${days + ' days'}::interval
			GROUP BY DATE(created_at)
			ORDER BY date ASC
		`
	]);

	const delivery_rate = sent > 0 ? Math.round((delivered / sent) * 10000) / 100 : 0;
	const open_rate = delivered > 0 ? Math.round((opened / delivered) * 10000) / 100 : 0;
	const click_rate = delivered > 0 ? Math.round((clicked / delivered) * 10000) / 100 : 0;
	const bounce_rate = sent > 0 ? Math.round((bounced / sent) * 10000) / 100 : 0;

	return json({
		sent,
		delivered,
		opened,
		clicked,
		bounced,
		complained,
		delivery_rate,
		open_rate,
		click_rate,
		bounce_rate,
		daily_volume
	});
};
