import { redirect } from '@sveltejs/kit';
import { clearSessionCookie, deleteSession } from '#lib/server/auth.js';
import type { RequestHandler } from './$types';

export const POST: RequestHandler = ({ locals, cookies }) => {
	if (locals.sessionId) deleteSession(locals.sessionId);
	clearSessionCookie(cookies);
	redirect(303, '/');
};
