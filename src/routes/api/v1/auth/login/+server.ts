import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { verifyPassword, bruteForceCheck, recordFailedAttempt } from '$lib/server/auth';

export const POST: RequestHandler = async ({ request, cookies, getClientAddress }) => {
	try {
		const ip = getClientAddress();

		if (bruteForceCheck(ip)) {
			return json({ error: 'Too many login attempts. Try again later.' }, { status: 429 });
		}

		let body: { email?: string; password?: string };
		try {
			body = await request.json();
		} catch {
			return json({ error: 'Invalid JSON body' }, { status: 400 });
		}

		const { email, password } = body;

		if (!email || !password) {
			return json({ error: 'Email and password are required' }, { status: 400 });
		}

		const [user] = await sql`
			SELECT
				u.id,
				u.email,
				u.name,
				u.role,
				u.password_hash,
				t.id AS tenant_id,
				t.name AS tenant_name,
				t.slug AS tenant_slug
			FROM herald_users u
			JOIN herald_tenants t ON t.id = u.tenant_id
			WHERE u.email = ${email}
			LIMIT 1
		`;

		if (!user) {
			recordFailedAttempt(ip);
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		const valid = await verifyPassword(password, user.password_hash);
		if (!valid) {
			recordFailedAttempt(ip);
			return json({ error: 'Invalid email or password' }, { status: 401 });
		}

		const token = crypto.randomUUID();
		const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

		await sql`
			INSERT INTO herald_sessions (user_id, tenant_id, token, expires_at)
			VALUES (${user.id}, ${user.tenant_id}, ${token}, ${expiresAt})
		`;

		cookies.set('herald_session', token, {
			path: '/',
			httpOnly: true,
			secure: true,
			sameSite: 'lax',
			expires: expiresAt
		});

		return json({
			user: {
				id: user.id,
				email: user.email,
				name: user.name,
				role: user.role
			},
			tenant: {
				id: user.tenant_id,
				name: user.tenant_name,
				slug: user.tenant_slug
			}
		});
	} catch (err) {
		console.error('Login error:', err);
		return json({ error: 'Login failed', detail: String(err) }, { status: 500 });
	}
};
