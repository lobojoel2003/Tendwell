import { error } from '@sveltejs/kit';
import { getLetter } from '#lib/server/content.js';
import { letterDefinition } from '#lib/server/letters.js';
import { getPlan } from '#lib/server/plans.js';
import { pickValues } from '#lib/letters.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params, url, locals }) => {
	const letter = getLetter(params.slug);
	if (!letter) error(404, 'We couldn’t find that letter.');
	const definition = letterDefinition(letter);

	// Values can be passed in the link (for example from the accounts list) …
	const initial = pickValues(definition, (id) => url.searchParams.get(id) ?? undefined);

	// … and a plan fills in what it already knows.
	const planId = url.searchParams.get('plan');
	const plan = planId && locals.user ? getPlan(planId, locals.user.id) : null;
	if (locals.user) initial.sender_name ||= locals.user.name;
	if (locals.user?.email) initial.sender_email ||= locals.user.email;
	if (plan) {
		initial.deceased_name ||= plan.personName;
		if (plan.dateOfDeath) initial.date_of_death ||= plan.dateOfDeath;
	}

	return {
		letter: definition,
		initial,
		plan: plan ? { id: plan.id, personName: plan.personName } : null
	};
};

export const actions: Actions = {
	// Used when JavaScript is off: shows the preview with what was typed.
	preview: async ({ request, params }) => {
		const letter = getLetter(params.slug);
		if (!letter) error(404, 'We couldn’t find that letter.');
		const form = await request.formData();
		return { values: pickValues(letterDefinition(letter), (id) => form.get(id) ?? undefined) };
	}
};
