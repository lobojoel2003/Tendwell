import { requirePlan } from '#lib/server/guards.js';
import { listMembers } from '#lib/server/plans.js';
import type { LayoutServerLoad } from './$types';

export const load: LayoutServerLoad = (event) => {
	// Reading the path makes this run again on every page of the plan, so the
	// list of people (and the plan's name) is never stale after someone joins.
	void event.url.pathname;
	const { plan } = requirePlan(event);
	const members = listMembers(plan.id).map((m) => ({ id: m.id, name: m.name, role: m.role }));
	return { plan, members };
};
