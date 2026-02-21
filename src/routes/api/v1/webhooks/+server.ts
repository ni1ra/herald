import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const webhooks = await sql`
		SELECT id, url, events, created_at
		FROM herald_webhooks
		WHERE tenant_id = ${session.tenantId}
		ORDER BY created_at DESC
	`;

	return json({ webhooks });
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { url, events } = await request.json();
	if (!url) return json({ error: 'url is required' }, { status: 400 });
	if (!events || !Array.isArray(events) || events.length === 0) {
		return json({ error: 'events array is required' }, { status: 400 });
	}

	const secret = crypto.randomUUID();

	const [webhook] = await sql`
		INSERT INTO herald_webhooks (tenant_id, url, events, secret)
		VALUES (${session.tenantId}, ${url}, ${sql.array(events)}, ${secret})
		RETURNING id, url, events, created_at
	`;

	return json({
		webhook: { ...webhook, secret },
		warning: 'Store the signing secret securely. It will not be shown again.'
	}, { status: 201 });
};
