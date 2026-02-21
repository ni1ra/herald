import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const [tenant] = await sql`
		SELECT id, name, slug, plan, created_at
		FROM herald_tenants
		WHERE id = ${session.tenantId}
	`;

	if (!tenant) return json({ error: 'Tenant not found' }, { status: 404 });

	return json({ tenant });
};
