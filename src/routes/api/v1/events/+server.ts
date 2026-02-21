import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const tenantId = session.tenantId;
	const type = url.searchParams.get('type');
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')));
	const offset = (page - 1) * limit;

	let events;
	let countResult;

	if (type) {
		[countResult] = await sql`
			SELECT COUNT(*)::int AS total FROM herald_events
			WHERE tenant_id = ${tenantId} AND type = ${type}
		`;
		events = await sql`
			SELECT e.id, e.type, e.message_id, e.data, e.created_at
			FROM herald_events e
			WHERE e.tenant_id = ${tenantId} AND e.type = ${type}
			ORDER BY e.created_at DESC
			LIMIT ${limit} OFFSET ${offset}
		`;
	} else {
		[countResult] = await sql`
			SELECT COUNT(*)::int AS total FROM herald_events
			WHERE tenant_id = ${tenantId}
		`;
		events = await sql`
			SELECT e.id, e.type, e.message_id, e.data, e.created_at
			FROM herald_events e
			WHERE e.tenant_id = ${tenantId}
			ORDER BY e.created_at DESC
			LIMIT ${limit} OFFSET ${offset}
		`;
	}

	return json({
		events,
		total: countResult.total
	});
};
