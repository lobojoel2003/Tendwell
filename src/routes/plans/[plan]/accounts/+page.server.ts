import { fail } from '@sveltejs/kit';
import { requirePlan } from '#lib/server/guards.js';
import {
	addAccount,
	deleteAccount,
	getAccount,
	listAccounts,
	updateAccount
} from '#lib/server/plans.js';
import { getContent } from '#lib/server/content.js';
import { text } from '#lib/server/forms.js';
import { accountKinds, accountStatuses, type AccountKind, type AccountStatus } from '#lib/plan.js';
import type { Actions, PageServerLoad } from './$types';

/** Which letter fits which kind of account. */
const letterFor: Record<AccountKind, string[]> = {
	bank: ['notify-bank'],
	card: ['close-account', 'notify-bank'],
	utility: ['notify-utility'],
	phone: ['notify-utility', 'cancel-subscription'],
	subscription: ['cancel-subscription'],
	insurance: ['claim-life-insurance', 'close-account'],
	government: ['close-account'],
	digital: ['close-account'],
	other: ['close-account']
};

export const load: PageServerLoad = (event) => {
	const { plan } = requirePlan(event);
	const letters = new Set(getContent().letters.map((l) => l.slug));
	const accounts = listAccounts(plan.id).map((a) => ({
		...a,
		letter: letterFor[a.kind]?.find((slug) => letters.has(slug)) ?? null
	}));
	return { accounts };
};

const isKind = (v: string): v is AccountKind => v in accountKinds;
const isStatus = (v: string): v is AccountStatus => v in accountStatuses;

export const actions: Actions = {
	add: async (event) => {
		const { user, plan } = requirePlan(event);
		const form = await event.request.formData();
		const name = text(form, 'name', 120);
		const kind = text(form, 'kind', 20);
		const reference = text(form, 'reference', 60);
		const notes = text(form, 'notes', 1000);
		if (!name)
			return fail(400, { error: 'Please add a name, like “Chase checking” or “Netflix”.' });
		addAccount(plan.id, { name, kind: isKind(kind) ? kind : 'other', reference, notes }, user.id);
		return { added: name };
	},
	status: async (event) => {
		const { user, plan } = requirePlan(event);
		const form = await event.request.formData();
		const id = text(form, 'account', 40);
		const status = text(form, 'status', 20);
		if (!getAccount(plan.id, id) || !isStatus(status))
			return fail(400, { error: 'We couldn’t update that.' });
		updateAccount(plan.id, id, { status }, user.id);
		return { updated: id };
	},
	claim: async (event) => {
		const { user, plan } = requirePlan(event);
		const form = await event.request.formData();
		const id = text(form, 'account', 40);
		if (!getAccount(plan.id, id)) return fail(400, { error: 'We couldn’t update that.' });
		updateAccount(
			plan.id,
			id,
			{ assignee_id: form.get('assign') === 'me' ? user.id : null },
			user.id
		);
		return { updated: id };
	},
	notes: async (event) => {
		const { user, plan } = requirePlan(event);
		const form = await event.request.formData();
		const id = text(form, 'account', 40);
		if (!getAccount(plan.id, id)) return fail(400, { error: 'We couldn’t update that.' });
		updateAccount(plan.id, id, { notes: text(form, 'notes', 1000) }, user.id);
		return { updated: id };
	},
	delete: async (event) => {
		const { plan } = requirePlan(event);
		const id = text(await event.request.formData(), 'account', 40);
		deleteAccount(plan.id, id);
		return { deleted: id };
	}
};
