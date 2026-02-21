import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const domains = await sql`
		SELECT id, domain, verified, verified_at, dkim_selector, spf_record, created_at
		FROM herald_domains
		WHERE tenant_id = ${session.tenantId}
		ORDER BY created_at DESC
	`;

	return json({ domains });
};

export const POST: RequestHandler = async ({ cookies, request }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) return json({ error: 'Unauthorized' }, { status: 401 });

	const { domain } = await request.json();
	if (!domain) return json({ error: 'domain is required' }, { status: 400 });

	const verification_token = crypto.randomUUID();
	const dkim_selector = 'herald';
	const dkim_public_key = `v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQ${crypto.randomUUID().replace(/-/g, '')}`;
	const spf_record = 'v=spf1 include:herald.eurostack.eu ~all';

	const [inserted] = await sql`
		INSERT INTO herald_domains (tenant_id, domain, verification_token, dkim_selector, dkim_public_key, spf_record)
		VALUES (${session.tenantId}, ${domain}, ${verification_token}, ${dkim_selector}, ${dkim_public_key}, ${spf_record})
		RETURNING id, domain, verified, verified_at, dkim_selector, spf_record, created_at
	`;

	return json({
		domain: {
			...inserted,
			dns_records: {
				dkim: {
					type: 'TXT',
					name: `${dkim_selector}._domainkey.${domain}`,
					value: dkim_public_key
				},
				spf: {
					type: 'TXT',
					name: domain,
					value: spf_record
				},
				verification: {
					type: 'TXT',
					name: `_herald-verify.${domain}`,
					value: verification_token
				}
			}
		}
	}, { status: 201 });
};
