import { fail, redirect } from '@sveltejs/kit';
import { requireOwner, requirePlan } from '#lib/server/guards.js';
import { deletePlan, updatePlan } from '#lib/server/plans.js';
import { getContent } from '#lib/server/content.js';
import { isoDate, readAnswers, text } from '#lib/server/forms.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	requirePlan(event);
	return { questions: getContent().questions };
};

export const actions: Actions = {
	save: async (event) => {
		const { plan } = requirePlan(event);
		const form = await event.request.formData();
		const personName = text(form, 'person_name', 120);
		const date = isoDate(text(form, 'date_of_death', 10));
		if (!personName) return fail(400, { error: 'Please keep a name for the plan.' });
		if (date === 'invalid') return fail(400, { error: 'That date doesn’t look right.' });
		updatePlan(plan.id, {
			personName,
			dateOfDeath: date,
			answers: readAnswers(form, getContent().questions)
		});
		return { saved: true };
	},
	delete: async (event) => {
		const { plan } = requireOwner(event);
		const form = await event.request.formData();
		if (form.get('confirm') !== 'yes') {
			return fail(400, { deleteError: 'Please tick the box to confirm.' });
		}
		deletePlan(plan.id);
		redirect(303, '/plans');
	}
};
