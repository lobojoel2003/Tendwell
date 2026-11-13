import type { Handle, HandleServerError } from '@sveltejs/kit/hooks';
import { building } from '$app/env';
import {
	SESSION_COOKIE,
	clearSessionCookie,
	purgeExpiredSessions,
	setSessionCookie,
	validateSession
} from '#lib/server/auth.js';
import { db } from '#lib/server/db/index.js';

if (!building) {
	// Open the database (and run migrations) when the server starts, not on the first visit.
	db();
	purgeExpiredSessions();
	setInterval(purgeExpiredSessions, 6 * 60 * 60 * 1000).unref();
}

const PRIVATE_PATHS = ['/plans', '/invite', '/account', '/login', '/signup'];

export const handle: Handle = async ({ event, resolve }) => {
	event.locals.user = null;
	event.locals.sessionId = null;

	const token = event.cookies.get(SESSION_COOKIE);
	if (token) {
		const session = validateSession(token);
		if (session) {
			event.locals.user = session.user;
			event.locals.sessionId = session.sessionId;
			if (session.renewedUntil) {
				setSessionCookie(
					event.cookies,
					token,
					session.renewedUntil,
					event.url.protocol === 'https:'
				);
			}
		} else {
			clearSessionCookie(event.cookies);
		}
	}

	const response = await resolve(event);

	response.headers.set('X-Content-Type-Options', 'nosniff');
	response.headers.set('X-Frame-Options', 'DENY');
	response.headers.set(
		'Permissions-Policy',
		'camera=(), microphone=(), geolocation=(), interest-cohort=()'
	);
	// Invite links carry a secret, so never send the page address to other sites.
	// ("no-referrer" would also blank the Origin header on form posts and break CSRF checks.)
	response.headers.set('Referrer-Policy', 'same-origin');
	if (PRIVATE_PATHS.some((p) => event.url.pathname.startsWith(p))) {
		response.headers.set('Cache-Control', 'private, no-store');
		response.headers.set('X-Robots-Tag', 'noindex');
	}
	return response;
};

export const handleError: HandleServerError = (input) => {
	if (input.kind === 'framework' && input.error.status === 404) {
		return { message: 'We couldn’t find that page.' };
	}
	if (input.kind === 'unknown') {
		console.error(
			`[tendwell] ${input.event.request.method} ${input.event.url.pathname}`,
			input.error
		);
		return { message: 'Something went wrong on our side.' };
	}
};
