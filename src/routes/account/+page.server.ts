import { fail, redirect } from '@sveltejs/kit';
import {
	checkPassword,
	clearSessionCookie,
	deleteOtherSessions,
	setPassword
} from '#lib/server/auth.js';
import { requireUser } from '#lib/server/guards.js';
import { MIN_PASSWORD, text } from '#lib/server/forms.js';
import { db } from '#lib/server/db/index.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	const user = requireUser(event);
	return { account: user };
};

export const actions: Actions = {
	name: async (event) => {
		const user = requireUser(event);
		const name = text(await event.request.formData(), 'name', 80);
		if (!name) return fail(400, { section: 'name', error: 'Please enter a name.' });
		db().prepare('UPDATE users SET name = ? WHERE id = ?').run(name, user.id);
		return { section: 'name', success: 'Saved.' };
	},
	password: async (event) => {
		const user = requireUser(event);
		const form = await event.request.formData();
		const current = String(form.get('current') ?? '');
		const next = String(form.get('next') ?? '');
		if (!(await checkPassword(user.id, current))) {
			return fail(400, { section: 'password', error: 'Your current password isn’t right.' });
		}
		if (next.length < MIN_PASSWORD || next.length > 200) {
			return fail(400, {
				section: 'password',
				error: `Please choose at least ${MIN_PASSWORD} characters.`
			});
		}
		await setPassword(user.id, next);
		deleteOtherSessions(user.id, event.locals.sessionId!);
		return {
			section: 'password',
			success: 'Password changed. Other devices have been signed out.'
		};
	},
	delete: async (event) => {
		const user = requireUser(event);
		const form = await event.request.formData();
		if (!(await checkPassword(user.id, String(form.get('password') ?? '')))) {
			return fail(400, { section: 'delete', error: 'Your password isn’t right.' });
		}
		db().transaction(() => {
			// Plans you started and share with nobody else are removed with you.
			db()
				.prepare(
					`DELETE FROM plans WHERE id IN (
						SELECT plan_id FROM members WHERE user_id = ? AND role = 'owner'
					) AND (SELECT COUNT(*) FROM members m WHERE m.plan_id = plans.id) = 1`
				)
				.run(user.id);
			// Shared plans you started pass to the longest-standing other member.
			const owned = db()
				.prepare<[string], { plan_id: string }>(
					`SELECT plan_id FROM members WHERE user_id = ? AND role = 'owner'`
				)
				.all(user.id);
			for (const { plan_id } of owned) {
				db()
					.prepare(
						`UPDATE members SET role = 'owner' WHERE plan_id = ? AND user_id = (
							SELECT user_id FROM members WHERE plan_id = ? AND user_id != ? ORDER BY joined_at LIMIT 1
						)`
					)
					.run(plan_id, plan_id, user.id);
			}
			db().prepare('DELETE FROM users WHERE id = ?').run(user.id);
		})();
		clearSessionCookie(event.cookies);
		redirect(303, '/?goodbye=1');
	}
};
