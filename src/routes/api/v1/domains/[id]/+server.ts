import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies, params }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const [domain] = await sql`
		SELECT id, domain, verified, verified_at, verification_token, dkim_selector, dkim_public_key, spf_record, created_at
		FROM herald_domains
		WHERE id = ${params.id} AND tenant_id = ${session.tenantId}
	`;

	if (!domain) return json({ error: 'Domain not found' }, { status: 404 });

	return json({
		domain: domain.domain,
		verified: domain.verified,
		dns_records: {
			dkim: {
				type: 'TXT',
				name: `${domain.dkim_selector}._domainkey.${domain.domain}`,
				value: domain.dkim_public_key
			},
			spf: {
				type: 'TXT',
				name: domain.domain,
				value: domain.spf_record
			},
			verification: {
				type: 'TXT',
				name: `_herald-verify.${domain.domain}`,
				value: domain.verification_token
			}
		}
	});
};

export const DELETE: RequestHandler = async ({ cookies, params }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const result = await sql`
		DELETE FROM herald_domains
		WHERE id = ${params.id} AND tenant_id = ${session.tenantId}
		RETURNING id
	`;

	if (result.length === 0) return json({ error: 'Domain not found' }, { status: 404 });

	return json({ deleted: true });
};

export const PATCH: RequestHandler = async ({ cookies, params }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const [domain] = await sql`
		UPDATE herald_domains
		SET verified = true, verified_at = NOW()
		WHERE id = ${params.id} AND tenant_id = ${session.tenantId}
		RETURNING id, domain, verified, verified_at, dkim_selector, spf_record, created_at
	`;

	if (!domain) return json({ error: 'Domain not found' }, { status: 404 });

	return json({ domain });
};
