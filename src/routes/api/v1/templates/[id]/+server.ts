import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

function extractVariables(subject: string, html_body: string, text_body: string): string[] {
	const combined = `${subject || ''} ${html_body || ''} ${text_body || ''}`;
	const matches = combined.match(/\{\{(\w+)\}\}/g);
	if (!matches) return [];
	const unique = [...new Set(matches.map((m) => m.replace(/\{\{|\}\}/g, '')))];
	return unique;
}

export const GET: RequestHandler = async ({ cookies, params }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const [template] = await sql`
		SELECT id, name, subject, html_body, text_body, variables, version, created_at, updated_at
		FROM herald_templates
		WHERE id = ${params.id} AND tenant_id = ${session.tenantId} AND active = true
	`;

	if (!template) return json({ error: 'Template not found' }, { status: 404 });

	return json({ template });
};

export const PUT: RequestHandler = async ({ cookies, params, request }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { name, subject, html_body, text_body } = await request.json();
	if (!name || !subject) return json({ error: 'name and subject are required' }, { status: 400 });

	const variables = extractVariables(subject, html_body || '', text_body || '');

	const [template] = await sql`
		UPDATE herald_templates
		SET name = ${name},
			subject = ${subject},
			html_body = ${html_body || null},
			text_body = ${text_body || null},
			variables = ${sql.array(variables)},
			version = version + 1,
			updated_at = NOW()
		WHERE id = ${params.id} AND tenant_id = ${session.tenantId} AND active = true
		RETURNING id, name, subject, html_body, text_body, variables, version, created_at, updated_at
	`;

	if (!template) return json({ error: 'Template not found' }, { status: 404 });

	return json({ template });
};

export const DELETE: RequestHandler = async ({ cookies, params }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const result = await sql`
		UPDATE herald_templates
		SET active = false, updated_at = NOW()
		WHERE id = ${params.id} AND tenant_id = ${session.tenantId} AND active = true
		RETURNING id
	`;

	if (result.length === 0) return json({ error: 'Template not found' }, { status: 404 });

	return json({ deleted: true });
};
