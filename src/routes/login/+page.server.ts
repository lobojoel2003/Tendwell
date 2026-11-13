import { fail, redirect } from '@sveltejs/kit';
import { authenticate, createSession, safeNext, setSessionCookie } from '#lib/server/auth.js';
import { authLimiter } from '#lib/server/rate-limit.js';
import { text } from '#lib/server/forms.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	const next = safeNext(url.searchParams.get('next'));
	if (locals.user) redirect(303, next);
	return { next };
};

export const actions: Actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const form = await request.formData();
		const email = text(form, 'email', 254);
		const password = String(form.get('password') ?? '').slice(0, 200);
		const next = safeNext(text(form, 'next', 500));

		const key = `login:${getClientAddress()}`;
		if (!authLimiter.hit(key)) {
			return fail(429, {
				email,
				error: 'That’s a lot of attempts. Please wait a few minutes and try again.'
			});
		}
		const user = await authenticate(email, password);
		if (!user)
			return fail(400, { email, error: 'That email and password don’t match. Please try again.' });

		authLimiter.reset(key);
		const session = createSession(user.id);
		setSessionCookie(cookies, session.token, session.expires, url.protocol === 'https:');
		redirect(303, next);
	}
};
