import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	return json({
		user: {
			id: session.userId,
			email: session.email,
			name: session.name,
			role: session.role
		},
		tenant: {
			id: session.tenantId,
			name: session.tenantName
		}
	});
};
