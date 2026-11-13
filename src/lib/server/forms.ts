import type { Answers } from '#lib/plan.js';
import type { Question } from '#lib/content/schema.js';

export const text = (form: FormData, key: string, max = 200) =>
	String(form.get(key) ?? '')
		.replace(/\r\n/g, '\n')
		.trim()
		.slice(0, max);

export const isEmail = (value: string) =>
	/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value) && value.length <= 254;

/** Accepts YYYY-MM-DD dates that exist and aren't in the future. */
export function isoDate(value: string): string | null | 'invalid' {
	if (!value) return null;
	if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return 'invalid';
	const date = new Date(`${value}T00:00:00Z`);
	if (Number.isNaN(date.getTime()) || date.toISOString().slice(0, 10) !== value) return 'invalid';
	if (date.getTime() > Date.now() + 36 * 60 * 60 * 1000) return 'invalid';
	return value;
}

export function readAnswers(form: FormData, questions: Question[]): Answers {
	const answers: Answers = {};
	for (const q of questions) {
		const value = form.get(`q_${q.id}`);
		if (value === 'yes' || value === 'no' || value === 'unsure') answers[q.id] = value;
	}
	return answers;
}

export const MIN_PASSWORD = 8;
