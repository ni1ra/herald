import { redirect } from '@sveltejs/kit';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = async ({ cookies, fetch }) => {
	const session = cookies.get('herald_session');
	if (!session) throw redirect(302, '/auth/login');

	const res = await fetch('/api/v1/auth/me', {
		headers: { Cookie: `herald_session=${session}` }
	});

	if (!res.ok) throw redirect(302, '/auth/login');

	return { user: await res.json() };
};
