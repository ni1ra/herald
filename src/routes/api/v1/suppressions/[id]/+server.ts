import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const DELETE: RequestHandler = async ({ cookies, params }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const result = await sql`
		DELETE FROM herald_suppressions
		WHERE id = ${params.id} AND tenant_id = ${session.tenantId}
		RETURNING id
	`;

	if (result.length === 0) return json({ error: 'Suppression not found' }, { status: 404 });

	return json({ deleted: true });
};
