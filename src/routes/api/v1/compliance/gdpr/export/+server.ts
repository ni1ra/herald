import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const messages = await sql`
		SELECT m.id, m.to_email, m.subject, m.status, m.created_at,
			m.delivered_at, m.opened_at, m.clicked_at, m.bounced_at, m.complained_at
		FROM herald_messages m
		WHERE m.tenant_id = ${session.tenantId}
		ORDER BY m.created_at DESC
	`;

	await sql`
		INSERT INTO herald_audit_log (tenant_id, user_id, action, entity_type, entity_id)
		VALUES (${session.tenantId}, ${session.userId}, 'gdpr_export', 'tenant', ${session.tenantId})
	`;

	return json({
		type: 'email_export',
		messages,
		exported_at: new Date().toISOString()
	});
};
