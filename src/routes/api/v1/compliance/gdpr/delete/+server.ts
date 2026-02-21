import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const POST: RequestHandler = async ({ cookies, request }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { email } = await request.json();
	if (!email) return json({ error: 'email is required' }, { status: 400 });

	await sql`
		DELETE FROM herald_events
		WHERE message_id IN (
			SELECT id FROM herald_messages
			WHERE to_email = ${email} AND tenant_id = ${session.tenantId}
		)
	`;

	await sql`
		DELETE FROM herald_messages
		WHERE to_email = ${email} AND tenant_id = ${session.tenantId}
	`;

	await sql`
		DELETE FROM herald_suppressions
		WHERE email = ${email} AND tenant_id = ${session.tenantId}
	`;

	await sql`
		INSERT INTO herald_audit_log (tenant_id, user_id, action, entity_type, entity_id)
		VALUES (${session.tenantId}, ${session.userId}, 'gdpr_delete', 'email', ${email})
	`;

	return json({ deleted: true, email });
};
