import { error } from '@sveltejs/kit';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, params }) => {
	const session = cookies.get('herald_session');
	const headers = { Cookie: `herald_session=${session}` };

	const res = await fetch(`/api/v1/messages/${params.id}`, { headers });

	if (!res.ok) {
		if (res.status === 404) throw error(404, 'Message not found');
		throw error(res.status, 'Failed to load message');
	}

	const data = await res.json();
	return { message: data.message };
};
