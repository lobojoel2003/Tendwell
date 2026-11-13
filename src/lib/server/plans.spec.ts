import { beforeEach, describe, expect, it } from 'vitest';
import { openDatabase, useDatabase } from './db/index.js';
import { createUser, createSession, validateSession, deleteSession } from './auth.js';
import {
	addAccount,
	addCustomTask,
	addNote,
	createInvite,
	createPlan,
	deletePlan,
	findInvite,
	getPlan,
	joinPlan,
	listAccounts,
	listMembers,
	listNotes,
	planItems,
	recentActivity,
	removeMember,
	revokeInvite,
	setAssignee,
	setSnooze,
	setStatus,
	updateAccount
} from './plans.js';
import { chooseFocus } from '#lib/plan.js';
import { getContent } from './content.js';

let db: ReturnType<typeof openDatabase>;

beforeEach(() => {
	db = openDatabase(':memory:');
	useDatabase(db);
});

const person = (name: string) =>
	createUser({ name, email: `${name.toLowerCase()}@example.com`, password: 'password123' });

describe('sessions', () => {
	it('signs in and out', async () => {
		const user = await person('Ana');
		const { token } = createSession(user.id);
		const session = validateSession(token);
		expect(session?.user.email).toBe('ana@example.com');
		deleteSession(session!.sessionId);
		expect(validateSession(token)).toBeNull();
	});
	it('does not store the raw token', async () => {
		const user = await person('Ana');
		const { token } = createSession(user.id);
		expect(db.prepare('SELECT COUNT(*) AS n FROM sessions WHERE id = ?').get(token)).toEqual({
			n: 0
		});
	});
});

describe('plans', () => {
	it('belong only to their members', async () => {
		const ana = await person('Ana');
		const ben = await person('Ben');
		const id = createPlan(
			{ personName: 'Mum', dateOfDeath: '2026-11-01', region: 'us', answers: {} },
			ana.id
		);
		expect(getPlan(id, ana.id)?.role).toBe('owner');
		expect(getPlan(id, ben.id)).toBeNull();
	});

	it('leaves out steps the answers rule out', async () => {
		const ana = await person('Ana');
		const withPets = createPlan(
			{ personName: 'A', dateOfDeath: null, region: 'us', answers: { pets: 'yes' } },
			ana.id
		);
		const noPets = createPlan(
			{ personName: 'B', dateOfDeath: null, region: 'us', answers: { pets: 'no' } },
			ana.id
		);
		const petSteps = getContent()
			.tasks.filter((t) => t.appliesIf.pets === 'yes')
			.map((t) => t.id);
		expect(petSteps.length).toBeGreaterThan(0);
		const ids = (planId: string) => planItems(getPlan(planId, ana.id)!).map((i) => i.id);
		expect(ids(withPets)).toEqual(expect.arrayContaining(petSteps));
		for (const step of petSteps) expect(ids(noPets)).not.toContain(step);
	});

	it('tracks done, claimed and resting steps', async () => {
		const ana = await person('Ana');
		const id = createPlan(
			{ personName: 'Mum', dateOfDeath: null, region: 'us', answers: {} },
			ana.id
		);
		const plan = getPlan(id, ana.id)!;
		const [first, second, third] = planItems(plan);

		setStatus(id, first.id, 'done', ana.id, first.title);
		setAssignee(id, second.id, ana.id, ana.id, second.title);
		setSnooze(id, third.id, Date.now() + 60_000, ana.id);

		const items = planItems(plan);
		const focus = chooseFocus(items, ana.id);
		expect(focus.settled).toBe(1);
		expect(focus.now[0].id).toBe(second.id);
		expect(focus.resting.map((i) => i.id)).toEqual([third.id]);
		expect(recentActivity(id).map((a) => a.kind)).toEqual(['claimed', 'done', 'created']);
	});

	it('includes steps the family adds, with notes', async () => {
		const ana = await person('Ana');
		const id = createPlan(
			{ personName: 'Mum', dateOfDeath: null, region: 'us', answers: {} },
			ana.id
		);
		const own = addCustomTask(
			id,
			{ title: 'Return library books', details: '', phase: 'later' },
			ana.id
		);
		const plan = getPlan(id, ana.id)!;
		expect(planItems(plan).find((i) => i.id === own)?.custom).toBe(true);
		addNote(id, own, ana.id, 'Three books, due Friday', 'Return library books');
		expect(listNotes(id, own).map((n) => n.body)).toEqual(['Three books, due Friday']);
	});
});

describe('sharing', () => {
	it('lets someone join with an invite link, until it is turned off', async () => {
		const ana = await person('Ana');
		const ben = await person('Ben');
		const id = createPlan(
			{ personName: 'Dad', dateOfDeath: null, region: 'us', answers: {} },
			ana.id
		);
		const { token } = createInvite(id, ana.id);
		const invite = findInvite(token);
		expect(invite).toMatchObject({ planId: id, personName: 'Dad', invitedBy: 'Ana' });

		joinPlan(id, ben.id);
		joinPlan(id, ben.id); // joining twice is harmless
		expect(listMembers(id).map((m) => [m.name, m.role])).toEqual([
			['Ana', 'owner'],
			['Ben', 'member']
		]);

		const inviteId = db.prepare<[], { id: string }>('SELECT id FROM invites').get()!.id;
		revokeInvite(id, inviteId);
		expect(findInvite(token)).toBeUndefined();
	});

	it('hands steps back when someone leaves', async () => {
		const ana = await person('Ana');
		const ben = await person('Ben');
		const id = createPlan(
			{ personName: 'Dad', dateOfDeath: null, region: 'us', answers: {} },
			ana.id
		);
		joinPlan(id, ben.id);
		const step = planItems(getPlan(id, ana.id)!)[0];
		setAssignee(id, step.id, ben.id, ben.id, step.title);
		removeMember(id, ben.id);
		expect(planItems(getPlan(id, ana.id)!)[0].assigneeId).toBeNull();
		expect(getPlan(id, ben.id)).toBeNull();
	});
});

describe('accounts', () => {
	it('moves from “to contact” to closed, and is removed with the plan', async () => {
		const ana = await person('Ana');
		const id = createPlan(
			{ personName: 'Dad', dateOfDeath: null, region: 'us', answers: {} },
			ana.id
		);
		addAccount(id, { name: 'Gas', kind: 'utility', reference: '', notes: '' }, ana.id);
		const [gas] = listAccounts(id);
		expect(gas.status).toBe('to_contact');
		updateAccount(id, gas.id, { status: 'closed' }, ana.id);
		expect(listAccounts(id)[0].status).toBe('closed');
		expect(recentActivity(id)[0]).toMatchObject({ kind: 'account_closed', subject: 'Gas' });

		deletePlan(id);
		expect(db.prepare('SELECT COUNT(*) AS n FROM accounts').get()).toEqual({ n: 0 });
	});
});
