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

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const templates = await sql`
		SELECT id, name, subject, html_body, text_body, variables, version, created_at, updated_at
		FROM herald_templates
		WHERE tenant_id = ${session.tenantId} AND active = true
		ORDER BY created_at DESC
	`;

	return json({ templates });
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { name, subject, html_body, text_body } = await request.json();
	if (!name || !subject) return json({ error: 'name and subject are required' }, { status: 400 });

	const variables = extractVariables(subject, html_body || '', text_body || '');

	const [template] = await sql`
		INSERT INTO herald_templates (tenant_id, name, subject, html_body, text_body, variables)
		VALUES (${session.tenantId}, ${name}, ${subject}, ${html_body || null}, ${text_body || null}, ${sql.array(variables)})
		RETURNING id, name, subject, html_body, text_body, variables, version, created_at, updated_at
	`;

	return json({ template }, { status: 201 });
};
