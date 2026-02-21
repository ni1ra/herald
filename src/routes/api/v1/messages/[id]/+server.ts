import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies, params }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const tenantId = session.tenantId;
	const messageId = params.id;

	const [message] = await sql`
		SELECT id, from_email, to_email, subject, html_body, text_body,
			status, tag, metadata, template_id, template_variables,
			created_at, delivered_at
		FROM herald_messages
		WHERE id = ${messageId} AND tenant_id = ${tenantId}
		LIMIT 1
	`;

	if (!message) {
		return json({ error: 'Message not found' }, { status: 404 });
	}

	const events = await sql`
		SELECT id, type, data, created_at
		FROM herald_events
		WHERE message_id = ${messageId}
		ORDER BY created_at ASC
	`;

	return json({
		message: {
			...message,
			events
		}
	});
};
