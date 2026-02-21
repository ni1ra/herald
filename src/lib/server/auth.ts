import { createHash } from 'node:crypto';
import bcrypt from 'bcryptjs';
import sql from './db';


// ─── Interfaces ─────────────────────────────────────────────────────────────

export interface SessionUser {
	userId: string;
	email: string;
	name: string;
	role: string;
	tenantId: string;
	tenantName: string;
}

export interface ApiKeyIdentity {
	tenantId: string;
}

// ─── Brute Force Protection ─────────────────────────────────────────────────
// In-memory rate limiting: 5 failed attempts per 15-minute window per IP.

const WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

interface AttemptRecord {
	count: number;
	windowStart: number;
}

const attempts = new Map<string, AttemptRecord>();

/**
 * Returns true if the IP is currently blocked (>= 5 failed attempts in window).
 */
export function bruteForceCheck(ip: string): boolean {
	const now = Date.now();
	const record = attempts.get(ip);

	if (!record) return false;

	// Window expired — clear and allow
	if (now - record.windowStart > WINDOW_MS) {
		attempts.delete(ip);
		return false;
	}

	return record.count >= MAX_ATTEMPTS;
}

/**
 * Records a failed login attempt for the given IP.
 */
export function recordFailedAttempt(ip: string): void {
	const now = Date.now();
	const record = attempts.get(ip);

	if (!record || now - record.windowStart > WINDOW_MS) {
		attempts.set(ip, { count: 1, windowStart: now });
	} else {
		record.count++;
	}
}

// ─── Password Hashing ──────────────────────────────────────────────────────

/**
 * Hash a plaintext password with bcrypt (12 rounds).
 */
export async function hashPassword(password: string): Promise<string> {
	return bcrypt.hash(password, 12);
}

/**
 * Verify a plaintext password against a bcrypt hash.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
	return bcrypt.compare(password, hash);
}

// ─── Session Validation ─────────────────────────────────────────────────────

/**
 * Validates a session cookie and returns the authenticated user, or null.
 * Queries herald_sessions joined with herald_users and herald_tenants.
 */
export async function validateSession(token: string | undefined): Promise<SessionUser | null> {
	if (!token) return null;
	const sessionId = token;

	const rows = await sql`
		SELECT
			u.id        AS user_id,
			u.email     AS email,
			u.name      AS name,
			u.role      AS role,
			t.id        AS tenant_id,
			t.name      AS tenant_name
		FROM herald_sessions s
		JOIN herald_users   u ON u.id = s.user_id
		JOIN herald_tenants t ON t.id = u.tenant_id
		WHERE s.token = ${sessionId}
		  AND s.expires_at > NOW()
	`;

	if (rows.length === 0) return null;

	const row = rows[0];
	return {
		userId: row.user_id,
		email: row.email,
		name: row.name,
		role: row.role,
		tenantId: row.tenant_id,
		tenantName: row.tenant_name
	};
}

// ─── API Key Authentication ─────────────────────────────────────────────────

/**
 * Authenticates an API request via the X-API-Key header.
 * The key is SHA-256 hashed before lookup (we only store hashes).
 * Emails are tenant-scoped — no projectId needed.
 */
export async function authenticateApiKey(request: Request): Promise<ApiKeyIdentity | null> {
	const apiKey = request.headers.get('X-API-Key');
	if (!apiKey) return null;

	const keyHash = createHash('sha256').update(apiKey).digest('hex');

	const rows = await sql`
		SELECT tenant_id
		FROM herald_api_keys
		WHERE key_hash = ${keyHash}
	`;

	if (rows.length === 0) return null;

	return {
		tenantId: rows[0].tenant_id
	};
}
