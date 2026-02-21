import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, parent }) => {
	const session = cookies.get('herald_session');
	const { user } = await parent();

	if (user?.user?.role !== 'superuser' && user?.user?.role !== 'superadmin' && user?.user?.role !== 'owner') {
		return { admin: null };
	}

	const res = await fetch('/api/v1/admin/overview', {
		headers: { Cookie: `herald_session=${session}` }
	});

	if (!res.ok) return { admin: null };
	return { admin: await res.json() };
};
