import { redirect } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies }) => {
	const session = cookies.get('herald_session');
	if (session) {
		// If logged in, redirect to dashboard
		try {
			throw redirect(302, '/dashboard');
		} catch (e) {
			throw e;
		}
	}
	return {};
};
