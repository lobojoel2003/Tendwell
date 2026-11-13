/**
 * Pure planning logic, shared by the server and the pages. No database here,
 * so it is easy to test.
 */

export type Answer = 'yes' | 'no' | 'unsure';
export type Answers = Partial<Record<string, Answer>>;
export type TaskStatus = 'todo' | 'done' | 'skipped';
export type Effort = 'minutes' | 'hour' | 'hours' | 'weeks';

export interface PlanItem {
	id: string;
	title: string;
	summary: string;
	phase: string;
	phaseRank: number;
	order: number;
	timeSensitive?: string;
	effort?: Effort;
	custom: boolean;
	status: TaskStatus;
	assigneeId: string | null;
	snoozedUntil: number | null;
	updatedAt: number | null;
	updatedBy: string | null;
}

/**
 * A step is hidden only when someone has clearly answered a question the other way.
 * "Not sure" and unanswered questions keep the step, because it's gentler to
 * see something you can skip than to miss something you needed.
 */
export function appliesTo(appliesIf: Record<string, 'yes' | 'no'>, answers: Answers): boolean {
	for (const [question, needed] of Object.entries(appliesIf)) {
		const answer = answers[question];
		if (answer && answer !== 'unsure' && answer !== needed) return false;
	}
	return true;
}

export const isResting = (item: PlanItem, now: number) =>
	item.status === 'todo' && item.snoozedUntil !== null && item.snoozedUntil > now;

const byPriority = (a: PlanItem, b: PlanItem) =>
	a.phaseRank - b.phaseRank ||
	Number(!a.timeSensitive) - Number(!b.timeSensitive) ||
	a.order - b.order ||
	a.title.localeCompare(b.title);

export interface Focus {
	/** "For now, just these three things." */
	now: PlanItem[];
	/** Open steps someone else has said they'll take care of. */
	othersHandling: PlanItem[];
	/** Steps set aside with "not this week". */
	resting: PlanItem[];
	/** How many steps are finished or not needed. */
	settled: number;
	/** Open steps, not counting the ones above. */
	remaining: number;
	/** The phase of the earliest open step, if any. */
	currentPhase: string | null;
}

export function chooseFocus(items: PlanItem[], userId: string, now = Date.now(), limit = 3): Focus {
	const open = items.filter((i) => i.status === 'todo');
	const awake = open.filter((i) => !isResting(i, now)).sort(byPriority);
	const mine = awake.filter((i) => i.assigneeId === userId);
	const unclaimed = awake.filter((i) => i.assigneeId === null);
	const othersHandling = awake.filter((i) => i.assigneeId !== null && i.assigneeId !== userId);
	const focus = [...mine, ...unclaimed].slice(0, limit);
	return {
		now: focus,
		othersHandling,
		resting: open.filter((i) => isResting(i, now)),
		settled: items.length - open.length,
		remaining: mine.length + unclaimed.length - focus.length,
		currentPhase: [...open].sort(byPriority)[0]?.phase ?? null
	};
}

export const effortLabels: Record<Effort, string> = {
	minutes: 'A few minutes',
	hour: 'About an hour',
	hours: 'A few hours',
	weeks: 'Over a few weeks'
};

export const accountKinds = {
	bank: 'Bank or credit union',
	card: 'Credit card or loan',
	utility: 'Utility',
	phone: 'Phone or internet',
	subscription: 'Subscription or membership',
	insurance: 'Insurance',
	government: 'Government or benefits',
	digital: 'Email or social media',
	other: 'Something else'
} as const;
export type AccountKind = keyof typeof accountKinds;

export const accountStatuses = {
	to_contact: 'Still to contact',
	contacted: 'Contacted, waiting to hear back',
	closed: 'Closed or transferred'
} as const;
export type AccountStatus = keyof typeof accountStatuses;

/** Formats an ISO date (YYYY-MM-DD) for people, without timezone surprises. */
export function formatDate(
	iso: string | null | undefined,
	style: 'long' | 'short' = 'long'
): string {
	if (!iso) return '';
	const [y, m, d] = iso.split('-').map(Number);
	if (!y || !m || !d) return iso;
	const date = new Date(Date.UTC(y, m - 1, d));
	return date.toLocaleDateString('en-US', {
		timeZone: 'UTC',
		year: 'numeric',
		month: style === 'long' ? 'long' : 'short',
		day: 'numeric'
	});
}

export function formatTimestamp(ms: number): string {
	return new Date(ms).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/** "just now", "3 days ago": soft relative times for the activity list. */
export function timeAgo(ms: number, now = Date.now()): string {
	const minutes = Math.round((now - ms) / 60000);
	if (minutes < 2) return 'just now';
	if (minutes < 60) return `${minutes} minutes ago`;
	const hours = Math.round(minutes / 60);
	if (hours < 24) return hours === 1 ? 'an hour ago' : `${hours} hours ago`;
	const days = Math.round(hours / 24);
	if (days < 14) return days === 1 ? 'yesterday' : `${days} days ago`;
	return formatTimestamp(ms);
}

export const firstName = (name: string) => name.trim().split(/\s+/)[0] || name;
