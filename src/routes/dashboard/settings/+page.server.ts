import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const session = cookies.get('herald_session');
	const res = await fetch('/api/v1/settings', {
		headers: { Cookie: `herald_session=${session}` }
	});
	if (!res.ok) return { tenant: null };
	return await res.json();
};
