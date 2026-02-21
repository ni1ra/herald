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
		from?: string;
		to?: string;
		subject?: string;
		html_body?: string;
		text_body?: string;
		tag?: string;
		metadata?: Record<string, unknown>;
		template_id?: string;
		template_variables?: Record<string, string>;
	};

	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	let { from, to, subject, html_body, text_body } = body;
	const { tag, metadata, template_id, template_variables } = body;

	if (!from || !to) {
		return json({ error: 'from and to are required' }, { status: 400 });
	}

	// Template substitution
	if (template_id) {
		const [template] = await sql`
			SELECT subject, html_body, text_body
			FROM herald_templates
			WHERE id = ${template_id} AND tenant_id = ${tenantId}
			LIMIT 1
		`;

		if (!template) {
			return json({ error: 'Template not found' }, { status: 404 });
		}

		const vars = template_variables || {};
		const substitute = (text: string | null): string | null => {
			if (!text) return text;
			return text.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
		};

		subject = substitute(template.subject) ?? subject;
		html_body = substitute(template.html_body) ?? html_body;
		text_body = substitute(template.text_body) ?? text_body;
	}

	if (!subject) {
		return json({ error: 'subject is required (or provide a template with subject)' }, { status: 400 });
	}

	// Check suppression list
	const [suppressed] = await sql`
		SELECT id FROM herald_suppressions
		WHERE tenant_id = ${tenantId} AND email = ${to}
		LIMIT 1
	`;

	if (suppressed) {
		return json({ error: 'Recipient is suppressed', suppressed: true }, { status: 422 });
	}

	// Insert message
	const [message] = await sql`
		INSERT INTO herald_messages (
			tenant_id, from_email, to_email, subject,
			html_body, text_body, template_id, template_variables,
			tag, metadata, status
		)
		VALUES (
			${tenantId}, ${from}, ${to}, ${subject},
			${html_body ?? null}, ${text_body ?? null},
			${template_id ?? null},
			${template_variables ? sql.json(template_variables) : null}::jsonb,
			${tag ?? null},
			${metadata ? sql.json(metadata) : null}::jsonb,
			'sent'
		)
		RETURNING id
	`;

	// Simulate delivery
	await sql`
		UPDATE herald_messages
		SET status = 'delivered', delivered_at = NOW()
		WHERE id = ${message.id}
	`;

	// Create events
	await sql`
		INSERT INTO herald_events (tenant_id, message_id, type)
		VALUES
			(${tenantId}, ${message.id}, 'sent'),
			(${tenantId}, ${message.id}, 'delivered')
	`;

	return json({
		message_id: message.id,
		status: 'delivered'
	}, { status: 201 });
};
