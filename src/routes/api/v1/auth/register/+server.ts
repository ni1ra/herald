import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { hashPassword } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies }) => {
	let body: { email?: string; password?: string; name?: string; org_name?: string };
	try {
		body = await request.json();
	} catch {
		return json({ error: 'Invalid JSON body' }, { status: 400 });
	}

	const { email, password, name, org_name } = body;

	if (!email || !password || !name || !org_name) {
		return json({ error: 'All fields are required: email, password, name, org_name' }, { status: 400 });
	}

	if (password.length < 8) {
		return json({ error: 'Password must be at least 8 characters' }, { status: 400 });
	}

	const slug = org_name
		.toLowerCase()
		.replace(/[^a-z0-9]+/g, '-')
		.replace(/^-|-$/g, '');

	const [existingEmail] = await sql`
		SELECT id FROM herald_users WHERE email = ${email} LIMIT 1
	`;
	if (existingEmail) {
		return json({ error: 'Email already registered' }, { status: 409 });
	}

	const [existingSlug] = await sql`
		SELECT id FROM herald_tenants WHERE slug = ${slug} LIMIT 1
	`;
	if (existingSlug) {
		return json({ error: 'Organization name already taken' }, { status: 409 });
	}

	const passwordHash = await hashPassword(password);

	const result = await sql.begin(async (tx) => {
		const [tenant] = await tx`
			INSERT INTO herald_tenants (name, slug)
			VALUES (${org_name}, ${slug})
			RETURNING id, name, slug
		`;

		const [user] = await tx`
			INSERT INTO herald_users (tenant_id, email, password_hash, name, role)
			VALUES (${tenant.id}, ${email}, ${passwordHash}, ${name}, 'owner')
			RETURNING id, email, name, role
		`;

		const token = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

		await tx`
			INSERT INTO herald_sessions (user_id, tenant_id, token, expires_at)
			VALUES (${user.id}, ${tenant.id}, ${token}, ${expiresAt})
		`;

		return { user, tenant, token, expiresAt };
	});

	cookies.set('herald_session', result.token, {
		path: '/',
		httpOnly: true,
		secure: true,
		sameSite: 'lax',
		expires: result.expiresAt
	});

	return json({
		user: {
			id: result.user.id,
			email: result.user.email,
			name: result.user.name,
			role: result.user.role
		},
		tenant: {
			id: result.tenant.id,
			name: result.tenant.name,
			slug: result.tenant.slug
		}
	}, { status: 201 });
};
