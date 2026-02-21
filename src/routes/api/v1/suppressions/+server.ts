import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
	const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50')));
	const offset = (page - 1) * limit;

	const [{ count: total }] = await sql`
		SELECT COUNT(*)::int AS count
		FROM herald_suppressions
		WHERE tenant_id = ${session.tenantId}
	`;

	const suppressions = await sql`
		SELECT id, email, reason, created_at
		FROM herald_suppressions
		WHERE tenant_id = ${session.tenantId}
		ORDER BY created_at DESC
		LIMIT ${limit} OFFSET ${offset}
	`;

	return json({ suppressions, total });
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { email, reason } = await request.json();
	if (!email) return json({ error: 'email is required' }, { status: 400 });

	const [suppression] = await sql`
		INSERT INTO herald_suppressions (tenant_id, email, reason)
		VALUES (${session.tenantId}, ${email}, ${reason || 'manual'})
		RETURNING id, email, reason, created_at
	`;

	return json({ suppression }, { status: 201 });
};
