import { fail, type RequestEvent } from '@sveltejs/kit';
import { requirePlan } from './guards';
import { getCustomTask, setAssignee, setSnooze, setStatus, type Plan } from './plans';
import { getTask, inRegion } from './content';
import { appliesTo } from '#lib/plan.js';

const DAY = 24 * 60 * 60 * 1000;

/** Finds a step in this plan: one from the checklist, or one the family added. */
export function findStep(plan: Plan, taskId: string): { id: string; title: string } | null {
	const task = getTask(taskId);
	if (task && inRegion(task, plan.region) && appliesTo(task.appliesIf, plan.answers)) {
		return { id: task.id, title: task.title };
	}
	const custom = getCustomTask(plan.id, taskId);
	return custom ? { id: custom.id, title: custom.title } : null;
}

async function stepFromForm(event: RequestEvent) {
	const { user, plan } = requirePlan(event);
	const form = await event.request.formData();
	const step = findStep(plan, String(form.get('task') ?? ''));
	return { user, plan, form, step };
}

/** The actions behind every “Done”, “I’ll take this” and “Not this week” button. */
export const taskActions = {
	status: async (event: RequestEvent) => {
		const { user, plan, form, step } = await stepFromForm(event);
		if (!step) return fail(404, { error: 'We couldn’t find that step.' });
		const status = String(form.get('status'));
		if (status !== 'done' && status !== 'skipped' && status !== 'todo')
			return fail(400, { error: 'Unknown status.' });
		setStatus(plan.id, step.id, status, user.id, step.title);
		return { updated: step.id, status };
	},
	claim: async (event: RequestEvent) => {
		const { user, plan, form, step } = await stepFromForm(event);
		if (!step) return fail(404, { error: 'We couldn’t find that step.' });
		const assign = form.get('assign') === 'me' ? user.id : null;
		setAssignee(plan.id, step.id, assign, user.id, step.title);
		return { updated: step.id };
	},
	snooze: async (event: RequestEvent) => {
		const { user, plan, form, step } = await stepFromForm(event);
		if (!step) return fail(404, { error: 'We couldn’t find that step.' });
		const wake = form.get('wake') === '1';
		setSnooze(plan.id, step.id, wake ? null : Date.now() + 7 * DAY, user.id);
		return { updated: step.id };
	}
};
