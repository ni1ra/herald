import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { createHash } from 'node:crypto';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const keys = await sql`
		SELECT id, key_prefix, label, created_at
		FROM herald_api_keys
		WHERE tenant_id = ${session.tenantId}
		ORDER BY created_at DESC
	`;

	return json({ keys });
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { label } = await request.json();
	if (!label) return json({ error: 'label is required' }, { status: 400 });

	const rawKey = 'hk_' + crypto.randomUUID().replace(/-/g, '');
	const key_hash = createHash('sha256').update(rawKey).digest('hex');
	const key_prefix = rawKey.slice(0, 11) + '...';

	const [api_key] = await sql`
		INSERT INTO herald_api_keys (tenant_id, key_hash, key_prefix, label)
		VALUES (${session.tenantId}, ${key_hash}, ${key_prefix}, ${label})
		RETURNING id, key_prefix, label, created_at
	`;

	return json({
		key: rawKey,
		api_key,
		warning: 'Store this key securely. It will not be shown again.'
	}, { status: 201 });
};
