/**
 * A deliberately tiny template language for letters, so volunteers can
 * read and edit templates without learning a programming language.
 *
 *   {{deceased_name}}                     inserts a value
 *   {{#if account_number}}…{{/if}}        keeps the text only if a value was given
 *   {{#unless account_number}}…{{/unless}} keeps the text only if it was left blank
 */

export type Values = Record<string, string | undefined>;

// Matches an innermost block: one whose body contains no other block.
const BLOCK = /\{\{#(if|unless)\s+([a-z][a-z0-9_]*)\s*\}\}((?:(?!\{\{#)[\s\S])*?)\{\{\/\1\}\}/g;
const VALUE = /\{\{\s*([a-z][a-z0-9_]*)\s*\}\}/g;

export function renderTemplate(template: string, values: Values): string {
	let output = template;
	// Resolve innermost blocks first, repeatedly, so nesting works.
	for (let i = 0; i < 10 && BLOCK.test(output); i++) {
		BLOCK.lastIndex = 0;
		output = output.replace(BLOCK, (_, kind: string, key: string, inner: string) => {
			const present = Boolean(values[key]?.trim());
			return (kind === 'if' ? present : !present) ? inner : '';
		});
	}
	return output.replace(VALUE, (_, key: string) => values[key]?.trim() ?? '');
}

/** Field ids a template refers to, used to check templates against their declared fields. */
export function templateFieldIds(template: string): string[] {
	const ids = new Set<string>();
	for (const match of template.matchAll(/\{\{\s*(?:#(?:if|unless)\s+)?([a-z][a-z0-9_]*)\s*\}\}/g)) {
		ids.add(match[1]);
	}
	return [...ids];
}

/**
 * Turns rendered letter text into paragraphs. Blank lines separate paragraphs;
 * single line breaks inside a paragraph are kept (useful for addresses and sign-offs).
 * Empty paragraphs, which appear when an {{#if}} block is dropped, are removed.
 */
export function toParagraphs(text: string): string[][] {
	return text
		.replace(/\r\n/g, '\n')
		.split(/\n\s*\n/)
		.map((block) =>
			block
				.split('\n')
				.map((line) => line.trimEnd())
				.filter(
					(line, index, lines) => line.trim() !== '' || (index > 0 && index < lines.length - 1)
				)
		)
		.filter((lines) => lines.some((line) => line.trim() !== ''));
}
