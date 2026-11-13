import { describe, expect, it } from 'vitest';
import { appliesTo, chooseFocus, formatDate, timeAgo, type PlanItem } from './plan.js';

const item = (id: string, overrides: Partial<PlanItem> = {}): PlanItem => ({
	id,
	title: id,
	summary: '',
	phase: 'first-days',
	phaseRank: 1,
	order: 10,
	custom: false,
	status: 'todo',
	assigneeId: null,
	snoozedUntil: null,
	updatedAt: null,
	updatedBy: null,
	...overrides
});

describe('appliesTo', () => {
	it('keeps steps with no conditions', () => {
		expect(appliesTo({}, { married: 'no' })).toBe(true);
	});
	it('hides a step only when the answer clearly rules it out', () => {
		expect(appliesTo({ married: 'yes' }, { married: 'no' })).toBe(false);
		expect(appliesTo({ married: 'yes' }, { married: 'yes' })).toBe(true);
	});
	it('keeps the step when unsure or unanswered', () => {
		expect(appliesTo({ married: 'yes' }, { married: 'unsure' })).toBe(true);
		expect(appliesTo({ married: 'yes' }, {})).toBe(true);
	});
	it('needs every condition to hold', () => {
		expect(appliesTo({ married: 'yes', vehicle: 'yes' }, { married: 'yes', vehicle: 'no' })).toBe(
			false
		);
	});
});

describe('chooseFocus', () => {
	const now = Date.UTC(2026, 10, 13);

	it('shows at most three things, in order', () => {
		const items = ['a', 'b', 'c', 'd', 'e'].map((id, i) => item(id, { order: i }));
		const focus = chooseFocus(items, 'me', now);
		expect(focus.now.map((i) => i.id)).toEqual(['a', 'b', 'c']);
		expect(focus.remaining).toBe(2);
	});

	it('puts my own steps first and leaves others’ steps out', () => {
		const items = [
			item('a', { order: 1 }),
			item('b', { order: 2, assigneeId: 'sam' }),
			item('c', { order: 3, assigneeId: 'me' })
		];
		const focus = chooseFocus(items, 'me', now);
		expect(focus.now.map((i) => i.id)).toEqual(['c', 'a']);
		expect(focus.othersHandling.map((i) => i.id)).toEqual(['b']);
	});

	it('moves earlier phases ahead, then real deadlines', () => {
		const items = [
			item('later', { phaseRank: 2, order: 1, timeSensitive: 'Deadline' }),
			item('plain', { phaseRank: 1, order: 5 }),
			item('deadline', { phaseRank: 1, order: 9, timeSensitive: 'Deadline' })
		];
		expect(chooseFocus(items, 'me', now).now.map((i) => i.id)).toEqual([
			'deadline',
			'plain',
			'later'
		]);
	});

	it('rests snoozed steps until their time comes', () => {
		const items = [item('a', { snoozedUntil: now + 1000 }), item('b')];
		const focus = chooseFocus(items, 'me', now);
		expect(focus.now.map((i) => i.id)).toEqual(['b']);
		expect(focus.resting.map((i) => i.id)).toEqual(['a']);
		expect(chooseFocus(items, 'me', now + 2000).now.map((i) => i.id)).toEqual(['a', 'b']);
	});

	it('counts finished and skipped steps as settled', () => {
		const items = [
			item('a', { status: 'done' }),
			item('b', { status: 'skipped' }),
			item('c', { phase: 'later', phaseRank: 4 })
		];
		const focus = chooseFocus(items, 'me', now);
		expect(focus.settled).toBe(2);
		expect(focus.currentPhase).toBe('later');
	});
});

describe('dates', () => {
	it('formats ISO dates without timezone drift', () => {
		expect(formatDate('2026-01-01')).toBe('January 1, 2026');
		expect(formatDate('2026-11-13', 'short')).toBe('Nov 13, 2026');
		expect(formatDate(null)).toBe('');
	});
	it('describes recent times softly', () => {
		const now = Date.now();
		expect(timeAgo(now - 30_000, now)).toBe('just now');
		expect(timeAgo(now - 5 * 60_000, now)).toBe('5 minutes ago');
		expect(timeAgo(now - 26 * 3600_000, now)).toBe('yesterday');
	});
});
