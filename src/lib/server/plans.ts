import { db } from './db';
import { getContent, inRegion } from './content';
import { hashToken, newId, newToken } from './ids';
import { appliesTo, type Answers, type PlanItem, type TaskStatus } from '#lib/plan.js';
import type { AccountKind, AccountStatus } from '#lib/plan.js';

export interface Plan {
	id: string;
	personName: string;
	dateOfDeath: string | null;
	region: string;
	answers: Answers;
	createdAt: number;
	role: 'owner' | 'member';
}

export interface Member {
	id: string;
	name: string;
	email: string;
	role: 'owner' | 'member';
	joinedAt: number;
}

interface PlanRow {
	id: string;
	person_name: string;
	date_of_death: string | null;
	region: string;
	answers: string;
	created_at: number;
	role: 'owner' | 'member';
}

const toPlan = (row: PlanRow): Plan => ({
	id: row.id,
	personName: row.person_name,
	dateOfDeath: row.date_of_death,
	region: row.region,
	answers: safeJson(row.answers),
	createdAt: row.created_at,
	role: row.role
});

function safeJson(text: string): Answers {
	try {
		const value = JSON.parse(text);
		return value && typeof value === 'object' ? value : {};
	} catch {
		return {};
	}
}

export function listPlans(userId: string) {
	return db()
		.prepare<[string], PlanRow & { members: number }>(
			`SELECT plans.*, members.role,
				(SELECT COUNT(*) FROM members m WHERE m.plan_id = plans.id) AS members
			 FROM plans JOIN members ON members.plan_id = plans.id
			 WHERE members.user_id = ?
			 ORDER BY plans.updated_at DESC`
		)
		.all(userId)
		.map((row) => ({ ...toPlan(row), members: row.members }));
}

export function getPlan(planId: string, userId: string): Plan | null {
	const row = db()
		.prepare<[string, string], PlanRow>(
			`SELECT plans.*, members.role FROM plans
			 JOIN members ON members.plan_id = plans.id AND members.user_id = ?
			 WHERE plans.id = ?`
		)
		.get(userId, planId);
	return row ? toPlan(row) : null;
}

export function createPlan(
	input: { personName: string; dateOfDeath: string | null; region: string; answers: Answers },
	userId: string
): string {
	const id = newId();
	const now = Date.now();
	db().transaction(() => {
		db()
			.prepare(
				`INSERT INTO plans (id, person_name, date_of_death, region, answers, created_by, created_at, updated_at)
				 VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
			)
			.run(
				id,
				input.personName,
				input.dateOfDeath,
				input.region,
				JSON.stringify(input.answers),
				userId,
				now,
				now
			);
		db()
			.prepare(`INSERT INTO members (plan_id, user_id, role, joined_at) VALUES (?, ?, 'owner', ?)`)
			.run(id, userId, now);
		logActivity(id, userId, 'created', '');
	})();
	return id;
}

export function updatePlan(
	planId: string,
	input: { personName: string; dateOfDeath: string | null; answers: Answers }
) {
	db()
		.prepare(
			'UPDATE plans SET person_name = ?, date_of_death = ?, answers = ?, updated_at = ? WHERE id = ?'
		)
		.run(input.personName, input.dateOfDeath, JSON.stringify(input.answers), Date.now(), planId);
}

export function deletePlan(planId: string) {
	db().prepare('DELETE FROM plans WHERE id = ?').run(planId);
}

function touch(planId: string) {
	db().prepare('UPDATE plans SET updated_at = ? WHERE id = ?').run(Date.now(), planId);
}

export function listMembers(planId: string): Member[] {
	return db()
		.prepare<[string], Member>(
			`SELECT users.id, users.name, users.email, members.role, members.joined_at AS joinedAt
			 FROM members JOIN users ON users.id = members.user_id
			 WHERE members.plan_id = ? ORDER BY members.role DESC, members.joined_at`
		)
		.all(planId);
}

export function removeMember(planId: string, userId: string) {
	db().transaction(() => {
		db().prepare('DELETE FROM members WHERE plan_id = ? AND user_id = ?').run(planId, userId);
		// Hand their open steps back to the group, so nothing is quietly forgotten.
		db()
			.prepare(
				`UPDATE task_states SET assignee_id = NULL WHERE plan_id = ? AND assignee_id = ? AND status = 'todo'`
			)
			.run(planId, userId);
		db()
			.prepare('UPDATE accounts SET assignee_id = NULL WHERE plan_id = ? AND assignee_id = ?')
			.run(planId, userId);
	})();
}

/* ---------------------------------------------------------------- steps */

interface StateRow {
	task_id: string;
	status: TaskStatus;
	assignee_id: string | null;
	snoozed_until: number | null;
	updated_by: string | null;
	updated_at: number;
}

interface CustomRow {
	id: string;
	title: string;
	details: string;
	phase: string;
	created_at: number;
}

/** Every step that applies to this plan, with its current state. */
export function planItems(plan: Plan): PlanItem[] {
	const content = getContent();
	const phaseRank = new Map(content.phases.map((p) => [p.id, p.order]));
	const states = new Map(
		db()
			.prepare<[string], StateRow>('SELECT * FROM task_states WHERE plan_id = ?')
			.all(plan.id)
			.map((row) => [row.task_id, row])
	);
	const withState = (
		base: Omit<PlanItem, 'status' | 'assigneeId' | 'snoozedUntil' | 'updatedAt' | 'updatedBy'>
	) => {
		const state = states.get(base.id);
		return {
			...base,
			status: state?.status ?? 'todo',
			assigneeId: state?.assignee_id ?? null,
			snoozedUntil: state?.snoozed_until ?? null,
			updatedAt: state?.updated_at ?? null,
			updatedBy: state?.updated_by ?? null
		} satisfies PlanItem;
	};

	const fromContent = content.tasks
		.filter((t) => inRegion(t, plan.region) && appliesTo(t.appliesIf, plan.answers))
		.map((t) =>
			withState({
				id: t.id,
				title: t.title,
				summary: t.summary,
				phase: t.phase,
				phaseRank: phaseRank.get(t.phase) ?? 99,
				order: t.order,
				timeSensitive: t.timeSensitive,
				effort: t.effort,
				custom: false
			})
		);

	const custom = listCustomTasks(plan.id).map((t) =>
		withState({
			id: t.id,
			title: t.title,
			summary: t.details,
			phase: t.phase,
			phaseRank: phaseRank.get(t.phase) ?? 99,
			order: 10_000 + t.created_at / 1e13,
			custom: true
		})
	);

	return [...fromContent, ...custom].sort(
		(a, b) => a.phaseRank - b.phaseRank || a.order - b.order || a.title.localeCompare(b.title)
	);
}

export function getState(planId: string, taskId: string): StateRow | undefined {
	return db()
		.prepare<[string, string], StateRow>(
			'SELECT * FROM task_states WHERE plan_id = ? AND task_id = ?'
		)
		.get(planId, taskId);
}

function upsertState(
	planId: string,
	taskId: string,
	userId: string,
	change: Partial<{ status: TaskStatus; assignee_id: string | null; snoozed_until: number | null }>
) {
	const current = getState(planId, taskId);
	const next = {
		status: change.status ?? current?.status ?? 'todo',
		assignee_id: 'assignee_id' in change ? change.assignee_id : (current?.assignee_id ?? null),
		snoozed_until:
			'snoozed_until' in change ? change.snoozed_until : (current?.snoozed_until ?? null)
	};
	db()
		.prepare(
			`INSERT INTO task_states (plan_id, task_id, status, assignee_id, snoozed_until, updated_by, updated_at)
			 VALUES (@plan_id, @task_id, @status, @assignee_id, @snoozed_until, @updated_by, @updated_at)
			 ON CONFLICT (plan_id, task_id) DO UPDATE SET
				status = excluded.status, assignee_id = excluded.assignee_id,
				snoozed_until = excluded.snoozed_until, updated_by = excluded.updated_by,
				updated_at = excluded.updated_at`
		)
		.run({ plan_id: planId, task_id: taskId, ...next, updated_by: userId, updated_at: Date.now() });
	touch(planId);
}

export function setStatus(
	planId: string,
	taskId: string,
	status: TaskStatus,
	userId: string,
	title: string
) {
	upsertState(planId, taskId, userId, { status, snoozed_until: null });
	if (status === 'done') logActivity(planId, userId, 'done', title);
	if (status === 'skipped') logActivity(planId, userId, 'skipped', title);
}

export function setAssignee(
	planId: string,
	taskId: string,
	assigneeId: string | null,
	userId: string,
	title: string
) {
	upsertState(planId, taskId, userId, { assignee_id: assigneeId, snoozed_until: null });
	if (assigneeId) logActivity(planId, assigneeId, 'claimed', title);
}

export function setSnooze(planId: string, taskId: string, until: number | null, userId: string) {
	upsertState(planId, taskId, userId, { snoozed_until: until });
}

export function listCustomTasks(planId: string) {
	return db()
		.prepare<[string], CustomRow>(
			'SELECT * FROM custom_tasks WHERE plan_id = ? ORDER BY created_at'
		)
		.all(planId);
}

export function getCustomTask(planId: string, taskId: string) {
	return db()
		.prepare<[string, string], CustomRow>('SELECT * FROM custom_tasks WHERE plan_id = ? AND id = ?')
		.get(planId, taskId);
}

export function addCustomTask(
	planId: string,
	input: { title: string; details: string; phase: string },
	userId: string
) {
	const id = `own-${newId()}`;
	db()
		.prepare(
			'INSERT INTO custom_tasks (id, plan_id, title, details, phase, created_by, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
		)
		.run(id, planId, input.title, input.details, input.phase, userId, Date.now());
	logActivity(planId, userId, 'added', input.title);
	touch(planId);
	return id;
}

export function deleteCustomTask(planId: string, taskId: string) {
	db().transaction(() => {
		db().prepare('DELETE FROM custom_tasks WHERE plan_id = ? AND id = ?').run(planId, taskId);
		db().prepare('DELETE FROM task_states WHERE plan_id = ? AND task_id = ?').run(planId, taskId);
		db().prepare('DELETE FROM notes WHERE plan_id = ? AND task_id = ?').run(planId, taskId);
	})();
}

/* ---------------------------------------------------------------- notes */

export interface Note {
	id: string;
	body: string;
	createdAt: number;
	userId: string | null;
	userName: string | null;
}

export function listNotes(planId: string, taskId: string): Note[] {
	return db()
		.prepare<[string, string], Note>(
			`SELECT notes.id, notes.body, notes.created_at AS createdAt, notes.user_id AS userId, users.name AS userName
			 FROM notes LEFT JOIN users ON users.id = notes.user_id
			 WHERE notes.plan_id = ? AND notes.task_id = ? ORDER BY notes.created_at`
		)
		.all(planId, taskId);
}

export function noteCounts(planId: string): Map<string, number> {
	return new Map(
		db()
			.prepare<[string], { task_id: string; n: number }>(
				'SELECT task_id, COUNT(*) AS n FROM notes WHERE plan_id = ? GROUP BY task_id'
			)
			.all(planId)
			.map((r) => [r.task_id, r.n])
	);
}

export function addNote(
	planId: string,
	taskId: string,
	userId: string,
	body: string,
	title: string
) {
	db()
		.prepare(
			'INSERT INTO notes (id, plan_id, task_id, user_id, body, created_at) VALUES (?, ?, ?, ?, ?, ?)'
		)
		.run(newId(), planId, taskId, userId, body, Date.now());
	logActivity(planId, userId, 'note', title);
	touch(planId);
}

export function deleteNote(planId: string, noteId: string, userId: string) {
	db()
		.prepare('DELETE FROM notes WHERE plan_id = ? AND id = ? AND user_id = ?')
		.run(planId, noteId, userId);
}

/* ------------------------------------------------------------- accounts */

export interface Account {
	id: string;
	name: string;
	kind: AccountKind;
	status: AccountStatus;
	reference: string;
	notes: string;
	assigneeId: string | null;
	updatedAt: number;
}

export function listAccounts(planId: string): Account[] {
	return db()
		.prepare<[string], Account>(
			`SELECT id, name, kind, status, reference, notes, assignee_id AS assigneeId, updated_at AS updatedAt
			 FROM accounts WHERE plan_id = ? ORDER BY created_at`
		)
		.all(planId);
}

export function getAccount(planId: string, accountId: string) {
	return listAccounts(planId).find((a) => a.id === accountId);
}

export function addAccount(
	planId: string,
	input: { name: string; kind: AccountKind; reference: string; notes: string },
	userId: string
) {
	const now = Date.now();
	db()
		.prepare(
			`INSERT INTO accounts (id, plan_id, name, kind, status, reference, notes, created_by, created_at, updated_at)
			 VALUES (?, ?, ?, ?, 'to_contact', ?, ?, ?, ?, ?)`
		)
		.run(newId(), planId, input.name, input.kind, input.reference, input.notes, userId, now, now);
	logActivity(planId, userId, 'account_added', input.name);
	touch(planId);
}

export function updateAccount(
	planId: string,
	accountId: string,
	change: Partial<{ status: AccountStatus; assignee_id: string | null; notes: string }>,
	userId: string
) {
	const account = getAccount(planId, accountId);
	if (!account) return;
	const next = {
		status: change.status ?? account.status,
		assignee_id: 'assignee_id' in change ? change.assignee_id : account.assigneeId,
		notes: change.notes ?? account.notes
	};
	db()
		.prepare(
			'UPDATE accounts SET status = ?, assignee_id = ?, notes = ?, updated_at = ? WHERE id = ? AND plan_id = ?'
		)
		.run(next.status, next.assignee_id, next.notes, Date.now(), accountId, planId);
	if (change.status === 'closed' && account.status !== 'closed') {
		logActivity(planId, userId, 'account_closed', account.name);
	}
	touch(planId);
}

export function deleteAccount(planId: string, accountId: string) {
	db().prepare('DELETE FROM accounts WHERE id = ? AND plan_id = ?').run(accountId, planId);
}

/* -------------------------------------------------------------- invites */

const INVITE_DAYS = 14;

export function createInvite(planId: string, userId: string): { token: string; expiresAt: number } {
	const token = newToken();
	const now = Date.now();
	const expiresAt = now + INVITE_DAYS * 24 * 60 * 60 * 1000;
	db()
		.prepare(
			'INSERT INTO invites (id, plan_id, created_by, created_at, expires_at) VALUES (?, ?, ?, ?, ?)'
		)
		.run(hashToken(token), planId, userId, now, expiresAt);
	return { token, expiresAt };
}

export function listInvites(planId: string) {
	return db()
		.prepare<
			[string, number],
			{ id: string; createdAt: number; expiresAt: number; createdBy: string | null }
		>(
			`SELECT invites.id, invites.created_at AS createdAt, invites.expires_at AS expiresAt, users.name AS createdBy
			 FROM invites LEFT JOIN users ON users.id = invites.created_by
			 WHERE invites.plan_id = ? AND invites.revoked_at IS NULL AND invites.expires_at > ?
			 ORDER BY invites.created_at DESC`
		)
		.all(planId, Date.now());
}

export function revokeInvite(planId: string, inviteId: string) {
	db()
		.prepare('UPDATE invites SET revoked_at = ? WHERE id = ? AND plan_id = ?')
		.run(Date.now(), inviteId, planId);
}

export function findInvite(token: string) {
	return db()
		.prepare<[string, number], { planId: string; personName: string; invitedBy: string | null }>(
			`SELECT invites.plan_id AS planId, plans.person_name AS personName, users.name AS invitedBy
			 FROM invites JOIN plans ON plans.id = invites.plan_id
			 LEFT JOIN users ON users.id = invites.created_by
			 WHERE invites.id = ? AND invites.revoked_at IS NULL AND invites.expires_at > ?`
		)
		.get(hashToken(token), Date.now());
}

export function isMember(planId: string, userId: string) {
	return Boolean(
		db().prepare('SELECT 1 FROM members WHERE plan_id = ? AND user_id = ?').get(planId, userId)
	);
}

export function joinPlan(planId: string, userId: string) {
	if (isMember(planId, userId)) return;
	db()
		.prepare(`INSERT INTO members (plan_id, user_id, role, joined_at) VALUES (?, ?, 'member', ?)`)
		.run(planId, userId, Date.now());
	logActivity(planId, userId, 'joined', '');
	touch(planId);
}

/* ------------------------------------------------------------- activity */

export type ActivityKind =
	| 'created'
	| 'done'
	| 'skipped'
	| 'claimed'
	| 'added'
	| 'note'
	| 'joined'
	| 'account_added'
	| 'account_closed';

export function logActivity(
	planId: string,
	userId: string | null,
	kind: ActivityKind,
	subject: string
) {
	db()
		.prepare(
			'INSERT INTO activity (plan_id, user_id, kind, subject, created_at) VALUES (?, ?, ?, ?, ?)'
		)
		.run(planId, userId, kind, subject, Date.now());
}

export function recentActivity(planId: string, limit = 8) {
	return db()
		.prepare<
			[string, number],
			{
				id: number;
				kind: ActivityKind;
				subject: string;
				createdAt: number;
				userId: string | null;
				userName: string | null;
			}
		>(
			`SELECT activity.id, activity.kind, activity.subject, activity.created_at AS createdAt,
				activity.user_id AS userId, users.name AS userName
			 FROM activity LEFT JOIN users ON users.id = activity.user_id
			 WHERE activity.plan_id = ? ORDER BY activity.created_at DESC, activity.id DESC LIMIT ?`
		)
		.all(planId, limit);
}
