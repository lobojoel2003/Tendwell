import { requirePlan } from '#lib/server/guards.js';
import { listAccounts, noteCounts, planItems, recentActivity } from '#lib/server/plans.js';
import { taskActions } from '#lib/server/task-actions.js';
import { getContent } from '#lib/server/content.js';
import { chooseFocus } from '#lib/plan.js';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	const { user, plan } = requirePlan(event);
	const items = planItems(plan);
	const focus = chooseFocus(items, user.id);
	const accounts = listAccounts(plan.id);
	const phase = getContent().phases.find((p) => p.id === focus.currentPhase) ?? null;
	const settledRecently = items
		.filter((i) => i.status !== 'todo' && i.updatedAt)
		.sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
		.slice(0, 3);

	return {
		focus,
		phase,
		total: items.length,
		settledRecently,
		notes: Object.fromEntries(noteCounts(plan.id)),
		activity: recentActivity(plan.id, 6),
		accounts: {
			open: accounts.filter((a) => a.status !== 'closed').length,
			closed: accounts.filter((a) => a.status === 'closed').length
		},
		welcome: event.url.searchParams.has('welcome'),
		olderPlan:
			plan.dateOfDeath !== null &&
			Date.now() - Date.parse(plan.dateOfDeath) > 21 * 24 * 60 * 60 * 1000
	};
};

export const actions: Actions = { ...taskActions };
