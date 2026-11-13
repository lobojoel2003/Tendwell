import { error, fail, redirect } from '@sveltejs/kit';
import { requirePlan } from '#lib/server/guards.js';
import {
	addNote,
	deleteCustomTask,
	deleteNote,
	getCustomTask,
	listNotes,
	planItems
} from '#lib/server/plans.js';
import { findStep, taskActions } from '#lib/server/task-actions.js';
import { getTask } from '#lib/server/content.js';
import { taskView } from '#lib/server/views.js';
import { text } from '#lib/server/forms.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	const { plan } = requirePlan(event);
	const step = findStep(plan, event.params.task);
	if (!step) error(404, 'We couldn’t find that step in this plan.');
	const item = planItems(plan).find((i) => i.id === step.id)!;
	const task = getTask(step.id);
	const custom = task ? null : getCustomTask(plan.id, step.id);
	return {
		item,
		task: task ? taskView(task) : null,
		customDetails: custom?.details ?? '',
		notes: listNotes(plan.id, step.id),
		letterQuery: `?plan=${plan.id}`
	};
};

export const actions: Actions = {
	...taskActions,
	note: async (event) => {
		const { user, plan } = requirePlan(event);
		const step = findStep(plan, event.params.task);
		if (!step) return fail(404, { noteError: 'We couldn’t find that step.' });
		const body = text(await event.request.formData(), 'body', 2000);
		if (!body) return fail(400, { noteError: 'The note is empty.' });
		addNote(plan.id, step.id, user.id, body, step.title);
		return { noted: true };
	},
	deleteNote: async (event) => {
		const { user, plan } = requirePlan(event);
		const id = text(await event.request.formData(), 'note', 40);
		deleteNote(plan.id, id, user.id);
		return { noteDeleted: true };
	},
	deleteStep: async (event) => {
		const { plan } = requirePlan(event);
		if (!getCustomTask(plan.id, event.params.task))
			return fail(400, { error: 'Only steps your family added can be removed.' });
		deleteCustomTask(plan.id, event.params.task);
		redirect(303, `/plans/${plan.id}/tasks`);
	}
};
