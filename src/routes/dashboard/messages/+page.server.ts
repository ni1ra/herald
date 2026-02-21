import type { PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ cookies, fetch, url }) => {
	const session = cookies.get('herald_session');
	const headers = { Cookie: `herald_session=${session}` };

	const page = url.searchParams.get('page') || '1';
	const status = url.searchParams.get('status') || '';
	const tag = url.searchParams.get('tag') || '';

	let apiUrl = `/api/v1/messages?page=${page}&limit=20`;
	if (status) apiUrl += `&status=${status}`;
	if (tag) apiUrl += `&tag=${tag}`;

	const res = await fetch(apiUrl, { headers });
	if (!res.ok) return { messages: [], total: 0, page: 1, pages: 1 };

	const data = await res.json();
	return {
		messages: data.data || [],
		total: data.total || 0,
		page: data.page || 1,
		pages: data.pages || 1
	};
};
