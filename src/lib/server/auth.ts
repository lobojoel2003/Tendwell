import type { Cookies } from '@sveltejs/kit';
import { db } from './db';
import { hashToken, newId, newToken } from './ids';
import { hashPassword, verifyPassword } from './password';

export interface SessionUser {
	id: string;
	email: string;
	name: string;
}

export const SESSION_COOKIE = 'tendwell_session';
const DAY = 24 * 60 * 60 * 1000;
const SESSION_LENGTH = 30 * DAY;
const RENEW_WHEN_LEFT = 15 * DAY;

export function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

export function findUserByEmail(email: string) {
	return db()
		.prepare<[string], SessionUser & { password_hash: string }>(
			'SELECT id, email, name, password_hash FROM users WHERE email = ?'
		)
		.get(normalizeEmail(email));
}

export async function createUser(input: {
	email: string;
	name: string;
	password: string;
}): Promise<SessionUser> {
	const user = { id: newId(), email: normalizeEmail(input.email), name: input.name.trim() };
	const passwordHash = await hashPassword(input.password);
	db()
		.prepare(
			'INSERT INTO users (id, email, name, password_hash, created_at) VALUES (?, ?, ?, ?, ?)'
		)
		.run(user.id, user.email, user.name, passwordHash, Date.now());
	return user;
}

/** Checks a password. Always does the same amount of work, so timing doesn't reveal which emails exist. */
export async function authenticate(email: string, password: string): Promise<SessionUser | null> {
	const user = findUserByEmail(email);
	const ok = await verifyPassword(password, user?.password_hash ?? DUMMY_HASH);
	if (!user || !ok) return null;
	return { id: user.id, email: user.email, name: user.name };
}

// A valid hash of a random password, used when the email isn't registered.
const DUMMY_HASH =
	'scrypt$16384$8$1$c2FsdHNhbHRzYWx0c2FsdA$' +
	'AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA';

export async function setPassword(userId: string, password: string) {
	db()
		.prepare('UPDATE users SET password_hash = ? WHERE id = ?')
		.run(await hashPassword(password), userId);
}

export async function checkPassword(userId: string, password: string) {
	const row = db()
		.prepare<[string], { password_hash: string }>('SELECT password_hash FROM users WHERE id = ?')
		.get(userId);
	return row ? verifyPassword(password, row.password_hash) : false;
}

export function createSession(userId: string): { token: string; expires: Date } {
	const token = newToken();
	const now = Date.now();
	const expires = now + SESSION_LENGTH;
	db()
		.prepare('INSERT INTO sessions (id, user_id, created_at, expires_at) VALUES (?, ?, ?, ?)')
		.run(hashToken(token), userId, now, expires);
	return { token, expires: new Date(expires) };
}

/** Looks up a session token, renewing it when it's more than halfway through its life. */
export function validateSession(
	token: string
): { user: SessionUser; sessionId: string; renewedUntil?: Date } | null {
	const sessionId = hashToken(token);
	const row = db()
		.prepare<[string], SessionUser & { expires_at: number }>(
			`SELECT users.id, users.email, users.name, sessions.expires_at
			 FROM sessions JOIN users ON users.id = sessions.user_id
			 WHERE sessions.id = ?`
		)
		.get(sessionId);
	if (!row) return null;
	const now = Date.now();
	if (row.expires_at <= now) {
		db().prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
		return null;
	}
	const user = { id: row.id, email: row.email, name: row.name };
	if (row.expires_at - now < RENEW_WHEN_LEFT) {
		const expires = now + SESSION_LENGTH;
		db().prepare('UPDATE sessions SET expires_at = ? WHERE id = ?').run(expires, sessionId);
		return { user, sessionId, renewedUntil: new Date(expires) };
	}
	return { user, sessionId };
}

export function deleteSession(sessionId: string) {
	db().prepare('DELETE FROM sessions WHERE id = ?').run(sessionId);
}

export function deleteOtherSessions(userId: string, keepSessionId: string) {
	db().prepare('DELETE FROM sessions WHERE user_id = ? AND id != ?').run(userId, keepSessionId);
}

export function purgeExpiredSessions() {
	db().prepare('DELETE FROM sessions WHERE expires_at <= ?').run(Date.now());
}

export function setSessionCookie(cookies: Cookies, token: string, expires: Date, secure: boolean) {
	cookies.set(SESSION_COOKIE, token, {
		path: '/',
		httpOnly: true,
		sameSite: 'lax',
		secure,
		expires
	});
}

export function clearSessionCookie(cookies: Cookies) {
	cookies.delete(SESSION_COOKIE, { path: '/' });
}

/** Only allow redirects to paths on this site. */
export function safeNext(value: string | null | undefined, fallback = '/plans'): string {
	if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\'))
		return fallback;
	return value;
}
