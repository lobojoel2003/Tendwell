import { error, redirect } from '@sveltejs/kit';
import { findInvite, isMember, joinPlan } from '#lib/server/plans.js';
import { requireUser } from '#lib/server/guards.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, locals }) => {
	const invite = findInvite(params.token);
	if (!invite) error(404, 'This invite link has expired or been turned off. Ask for a new one.');
	if (locals.user && isMember(invite.planId, locals.user.id))
		redirect(303, `/plans/${invite.planId}`);
	return { invite: { personName: invite.personName, invitedBy: invite.invitedBy } };
};

export const actions: Actions = {
	default: (event) => {
		const user = requireUser(event);
		const invite = findInvite(event.params.token);
		if (!invite) error(404, 'This invite link has expired or been turned off. Ask for a new one.');
		joinPlan(invite.planId, user.id);
		redirect(303, `/plans/${invite.planId}?welcome=1`);
	}
};
