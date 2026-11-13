import { fail } from '@sveltejs/kit';
import { requirePlan } from '#lib/server/guards.js';
import { addCustomTask, noteCounts, planItems } from '#lib/server/plans.js';
import { taskActions } from '#lib/server/task-actions.js';
import { getContent } from '#lib/server/content.js';
import { text } from '#lib/server/forms.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	const { plan } = requirePlan(event);
	const items = planItems(plan);
	const show = event.url.searchParams.get('show') === 'open' ? 'open' : 'all';
	const phases = getContent().phases.map((p) => ({
		id: p.id,
		title: p.title,
		description: p.description,
		items: items.filter((i) => i.phase === p.id && (show === 'all' || i.status === 'todo'))
	}));
	return {
		phases,
		show,
		counts: {
			all: items.length,
			open: items.filter((i) => i.status === 'todo').length
		},
		notes: Object.fromEntries(noteCounts(plan.id))
	};
};

export const actions: Actions = {
	...taskActions,
	add: async (event) => {
		const { user, plan } = requirePlan(event);
		const form = await event.request.formData();
		const title = text(form, 'title', 120);
		const details = text(form, 'details', 1000);
		const phases = getContent().phases.map((p) => p.id);
		const phase = phases.includes(String(form.get('phase')))
			? String(form.get('phase'))
			: (phases[1] ?? phases[0]);
		if (!title) return fail(400, { addError: 'Please give the step a short name.' });
		addCustomTask(plan.id, { title, details, phase }, user.id);
		return { added: title };
	}
};
