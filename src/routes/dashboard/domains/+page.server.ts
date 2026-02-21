import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const session = cookies.get('herald_session');
	const headers = { Cookie: `herald_session=${session}` };

	const res = await fetch('/api/v1/domains', { headers });
	if (!res.ok) return { domains: [] };

	const data = await res.json();
	return { domains: data.domains || [] };
};
