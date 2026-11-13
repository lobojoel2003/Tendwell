import { fail, redirect } from '@sveltejs/kit';
import { requireUser } from '#lib/server/guards.js';
import { createPlan } from '#lib/server/plans.js';
import { getContent } from '#lib/server/content.js';
import { isoDate, readAnswers, text } from '#lib/server/forms.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	requireUser(event);
	const { questions, regions } = getContent();
	return { questions, regions };
};

export const actions: Actions = {
	default: async (event) => {
		const user = requireUser(event);
		const form = await event.request.formData();
		const { questions, regions } = getContent();
		const personName = text(form, 'person_name', 120);
		const date = isoDate(text(form, 'date_of_death', 10));
		const region = regions.some((r) => r.id === form.get('region'))
			? String(form.get('region'))
			: regions[0].id;
		const answers = readAnswers(form, questions);

		if (!personName) {
			return fail(400, {
				personName,
				error: 'Please add a name. “Mum”, “Grandad” or their full name are all fine.'
			});
		}
		if (date === 'invalid') {
			return fail(400, {
				personName,
				error: 'That date doesn’t look right. You can leave it blank.'
			});
		}
		const id = createPlan({ personName, dateOfDeath: date, region, answers }, user.id);
		redirect(303, `/plans/${id}?welcome=1`);
	}
};
