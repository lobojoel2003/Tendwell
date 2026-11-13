import { error, redirect, type RequestEvent } from '@sveltejs/kit';
import { getPlan, type Plan } from './plans';
import type { SessionUser } from './auth';

/** Sends people to sign in (and back again afterwards) when a page needs an account. */
export function requireUser(event: Pick<RequestEvent, 'locals' | 'url'>): SessionUser {
	if (!event.locals.user) {
		const next = event.url.pathname + event.url.search;
		redirect(303, `/login?next=${encodeURIComponent(next)}`);
	}
	return event.locals.user;
}

/** Loads a plan the signed-in person belongs to. Others get a plain 404, so plans can't be discovered. */
export function requirePlan(event: Pick<RequestEvent, 'locals' | 'url' | 'params'>): {
	user: SessionUser;
	plan: Plan;
} {
	const user = requireUser(event);
	const id = (event.params as Record<string, string>).plan;
	const plan = id ? getPlan(id, user.id) : null;
	if (!plan) error(404, 'We couldn’t find that plan.');
	return { user, plan };
}

export function requireOwner(event: Pick<RequestEvent, 'locals' | 'url' | 'params'>) {
	const result = requirePlan(event);
	if (result.plan.role !== 'owner')
		error(403, 'Only the person who started this plan can do that.');
	return result;
}
