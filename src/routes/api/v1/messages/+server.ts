import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import sql from '$lib/server/db';
import { validateSession } from '$lib/server/auth';

export const GET: RequestHandler = async ({ cookies, url }) => {
	const session = await validateSession(cookies.get('herald_session'));
	if (!session) {
		return json({ error: 'Unauthorized' }, { status: 401 });
	}

	const tenantId = session.tenantId;
	const status = url.searchParams.get('status');
	const tag = url.searchParams.get('tag');
	const page = Math.max(1, parseInt(url.searchParams.get('page') ?? '1'));
	const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') ?? '20')));
	const offset = (page - 1) * limit;

	let countResult;
	let messages;

	if (status && tag) {
		[countResult] = await sql`SELECT COUNT(*)::int AS total FROM herald_messages WHERE tenant_id = ${tenantId} AND status = ${status} AND tag = ${tag}`;
		messages = await sql`SELECT id, from_email, to_email, subject, status, tag, metadata, created_at, delivered_at FROM herald_messages WHERE tenant_id = ${tenantId} AND status = ${status} AND tag = ${tag} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
	} else if (status) {
		[countResult] = await sql`SELECT COUNT(*)::int AS total FROM herald_messages WHERE tenant_id = ${tenantId} AND status = ${status}`;
		messages = await sql`SELECT id, from_email, to_email, subject, status, tag, metadata, created_at, delivered_at FROM herald_messages WHERE tenant_id = ${tenantId} AND status = ${status} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
	} else if (tag) {
		[countResult] = await sql`SELECT COUNT(*)::int AS total FROM herald_messages WHERE tenant_id = ${tenantId} AND tag = ${tag}`;
		messages = await sql`SELECT id, from_email, to_email, subject, status, tag, metadata, created_at, delivered_at FROM herald_messages WHERE tenant_id = ${tenantId} AND tag = ${tag} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
	} else {
		[countResult] = await sql`SELECT COUNT(*)::int AS total FROM herald_messages WHERE tenant_id = ${tenantId}`;
		messages = await sql`SELECT id, from_email, to_email, subject, status, tag, metadata, created_at, delivered_at FROM herald_messages WHERE tenant_id = ${tenantId} ORDER BY created_at DESC LIMIT ${limit} OFFSET ${offset}`;
	}

	return json({
		data: messages,
		total: countResult.total,
		page,
		limit,
		pages: Math.ceil(countResult.total / limit)
	});
};
