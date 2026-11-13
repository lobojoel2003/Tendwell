import { fail, redirect } from '@sveltejs/kit';
import { requirePlan } from '#lib/server/guards.js';
import { createInvite, listInvites, removeMember, revokeInvite } from '#lib/server/plans.js';
import { text } from '#lib/server/forms.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	const { plan } = requirePlan(event);
	return { invites: listInvites(plan.id) };
};

export const actions: Actions = {
	invite: (event) => {
		const { user, plan } = requirePlan(event);
		const { token, expiresAt } = createInvite(plan.id, user.id);
		return { link: `${event.url.origin}/invite/${token}`, expiresAt };
	},
	revoke: async (event) => {
		const { plan } = requirePlan(event);
		revokeInvite(plan.id, text(await event.request.formData(), 'invite', 100));
		return { revoked: true };
	},
	remove: async (event) => {
		const { user, plan } = requirePlan(event);
		if (plan.role !== 'owner')
			return fail(403, { error: 'Only the person who started the plan can remove people.' });
		const id = text(await event.request.formData(), 'member', 40);
		if (id === user.id)
			return fail(400, {
				error: 'You can’t remove yourself. Delete the plan in Settings instead.'
			});
		removeMember(plan.id, id);
		return { removed: true };
	},
	leave: (event) => {
		const { user, plan } = requirePlan(event);
		if (plan.role === 'owner') {
			return fail(400, {
				error: 'You started this plan, so you can’t leave it. You can delete it in Settings.'
			});
		}
		removeMember(plan.id, user.id);
		redirect(303, '/plans');
	}
};
