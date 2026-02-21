import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { authenticateApiKey } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request }) => {
	const auth = await authenticateApiKey(request);
	if (!auth) {
		return json({ error: 'Invalid API key' }, { status: 401 });
	}

	const tenantId = auth.tenantId;

	let body: {
		messages?: Array<{
			from: string;
			to: string;
			subject: string;
			html_body?: string;
			text_body?: string;
			tag?: string;
		}>;
	};

	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { messages } = body;

	if (!messages || !Array.isArray(messages) || messages.length === 0) {
		return json({ error: 'messages array is required and must not be empty' }, { status: 400 });
	}

	if (messages.length > 100) {
		return json({ error: 'Maximum 100 messages per batch' }, { status: 400 });
	}

	for (let i = 0; i < messages.length; i++) {
		const msg = messages[i];
		if (!msg.from || !msg.to || !msg.subject) {
			return json({ error: `Message at index ${i} missing required fields: from, to, subject` }, { status: 400 });
		}
	}

	const messageIds: string[] = [];

	await sql.begin(async (tx) => {
		for (const msg of messages) {
			const [inserted] = await tx`
				INSERT INTO herald_messages (
					tenant_id, from_email, to_email, subject,
					html_body, text_body, tag, status
				)
				VALUES (
					${tenantId}, ${msg.from}, ${msg.to}, ${msg.subject},
					${msg.html_body ?? null}, ${msg.text_body ?? null},
					${msg.tag ?? null}, 'sent'
				)
				RETURNING id
			`;

			messageIds.push(inserted.id);

			// Simulate delivery
			await tx`
				UPDATE herald_messages
				SET status = 'delivered', delivered_at = NOW()
				WHERE id = ${inserted.id}
			`;

			// Create events
			await tx`
				INSERT INTO herald_events (tenant_id, message_id, type)
				VALUES
					(${tenantId}, ${inserted.id}, 'sent'),
					(${tenantId}, ${inserted.id}, 'delivered')
			`;
		}
	});

	return json({
		sent: messageIds.length,
		message_ids: messageIds
	}, { status: 201 });
};
