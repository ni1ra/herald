import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	if (session.role !== 'superuser' && session.role !== 'superadmin') {
		return json({ error: 'Forbidden' }, { status: 403 });
	}

	const [
		[{ count: total_tenants }],
		[{ count: total_users }],
		[{ count: total_messages }],
		[{ count: total_domains }],
		tenants,
		users
	] = await Promise.all([
		sql`SELECT COUNT(*)::int AS count FROM herald_tenants`,
		sql`SELECT COUNT(*)::int AS count FROM herald_users`,
		sql`SELECT COUNT(*)::int AS count FROM herald_messages`,
		sql`SELECT COUNT(*)::int AS count FROM herald_domains`,
		sql`
			SELECT id, name, slug, plan, created_at
			FROM herald_tenants
			ORDER BY created_at DESC
			LIMIT 50
		`,
		sql`
			SELECT id, email, role, tenant_id, created_at
			FROM herald_users
			ORDER BY created_at DESC
			LIMIT 50
		`
	]);

	return json({
		stats: {
			total_tenants,
			total_users,
			total_messages,
			total_domains
		},
		tenants,
		users
	});
};
