import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch }) => {
	const session = cookies.get('herald_session');
	const headers = { Cookie: `herald_session=${session}` };

	const res = await fetch('/api/v1/templates', { headers });
	if (!res.ok) return { templates: [] };

	const data = await res.json();
	return { templates: data.templates || [] };
};
