import { describe, expect, it } from 'vitest';
import { getContent } from '#lib/server/content.js';
import { renderTemplate, toParagraphs } from './template';

/**
 * Run with `npm run content:check`. If you're editing content, this is the
 * test that tells you which file needs a fix.
 */
describe('content in /content', () => {
	const content = getContent();

	it('loads and validates every file', () => {
		expect(content.tasks.length).toBeGreaterThan(0);
		expect(content.guides.length).toBeGreaterThan(0);
		expect(content.letters.length).toBeGreaterThan(0);
	});

	it('has steps in every phase', () => {
		for (const phase of content.phases) {
			expect(
				content.tasks.some((t) => t.phase === phase.id),
				`phase ${phase.id} is empty`
			).toBe(true);
		}
	});

	it('uses unique task orders within a phase', () => {
		const seen = new Map<string, string>();
		for (const t of content.tasks) {
			const key = `${t.phase}:${t.order}`;
			expect(seen.get(key), `${t.id} and ${seen.get(key)} share order ${t.order}`).toBeUndefined();
			seen.set(key, t.id);
		}
	});

	it('keeps "time sensitive" rare, so it still means something', () => {
		const flagged = content.tasks.filter((t) => t.timeSensitive).length;
		expect(flagged / content.tasks.length).toBeLessThanOrEqual(0.35);
	});

	it('renders every letter with all fields filled in', () => {
		for (const letter of content.letters) {
			const values = Object.fromEntries(letter.fields.map((f) => [f.id, `[${f.id}]`]));
			values.today = 'November 13, 2026';
			const text = renderTemplate(letter.template, values);
			expect(text, letter.slug).not.toMatch(/\{\{|\}\}/);
			expect(toParagraphs(text).length, letter.slug).toBeGreaterThan(2);
		}
	});

	it('renders every letter with only required fields filled in', () => {
		for (const letter of content.letters) {
			const values = Object.fromEntries(
				letter.fields.filter((f) => f.required).map((f) => [f.id, `[${f.id}]`])
			);
			const text = renderTemplate(letter.template, values);
			expect(text, letter.slug).not.toMatch(/\{\{|\}\}/);
		}
	});

	it('only links to secure https pages', () => {
		for (const item of [...content.tasks, ...content.guides]) {
			for (const link of item.links) expect(link.url.startsWith('https://')).toBe(true);
			const id = 'id' in item ? item.id : item.slug;
			expect(item.html, id).not.toMatch(/href="http:\/\//);
		}
	});
});
