import { requireUser } from '#lib/server/guards.js';
import { listPlans } from '#lib/server/plans.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = (event) => {
	const user = requireUser(event);
	return { plans: listPlans(user.id) };
};
