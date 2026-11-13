import { fail, redirect } from '@sveltejs/kit';
import {
	createSession,
	createUser,
	findUserByEmail,
	safeNext,
	setSessionCookie
} from '#lib/server/auth.js';
import { authLimiter } from '#lib/server/rate-limit.js';
import { MIN_PASSWORD, isEmail, text } from '#lib/server/forms.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ locals, url }) => {
	const next = safeNext(url.searchParams.get('next'));
	if (locals.user) redirect(303, next);
	return { next };
};

export const actions: Actions = {
	default: async ({ request, cookies, url, getClientAddress }) => {
		const form = await request.formData();
		const name = text(form, 'name', 80);
		const email = text(form, 'email', 254);
		const password = String(form.get('password') ?? '');
		const next = safeNext(text(form, 'next', 500));
		const values = { name, email };

		if (!authLimiter.hit(`signup:${getClientAddress()}`)) {
			return fail(429, {
				...values,
				error: 'That’s a lot of attempts. Please wait a few minutes and try again.'
			});
		}
		if (!name)
			return fail(400, { ...values, error: 'Please tell us your name. A first name is fine.' });
		if (!isEmail(email))
			return fail(400, { ...values, error: 'That email address doesn’t look quite right.' });
		if (password.length < MIN_PASSWORD) {
			return fail(400, {
				...values,
				error: `Please choose a password of at least ${MIN_PASSWORD} characters.`
			});
		}
		if (password.length > 200) return fail(400, { ...values, error: 'That password is too long.' });
		if (findUserByEmail(email)) {
			return fail(400, {
				...values,
				error: 'There’s already an account with that email. Try signing in instead.'
			});
		}

		const user = await createUser({ name, email, password });
		const session = createSession(user.id);
		setSessionCookie(cookies, session.token, session.expires, url.protocol === 'https:');
		redirect(303, next === '/plans' ? '/plans/new' : next);
	}
};
