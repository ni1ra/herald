import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const session = cookies.get('herald_session');
	const res = await fetch('/api/v1/suppressions', {
		headers: { Cookie: `herald_session=${session}` }
	});
	if (!res.ok) return { suppressions: [], total: 0 };
	return await res.json();
};
