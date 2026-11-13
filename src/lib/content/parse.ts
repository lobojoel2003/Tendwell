import { Marked } from 'marked';
import { parse as parseYaml } from 'yaml';
import type { z } from 'zod';

export class ContentError extends Error {
	constructor(
		public file: string,
		message: string
	) {
		super(`${file}: ${message}`);
		this.name = 'ContentError';
	}
}

/** Splits a Markdown file into its YAML front matter and body. */
export function splitFrontMatter(source: string, file: string): { data: unknown; body: string } {
	const text = source.replace(/^\uFEFF/, '').replace(/\r\n/g, '\n');
	const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
	if (!match) {
		throw new ContentError(file, 'the file must start with front matter between two "---" lines');
	}
	let data: unknown;
	try {
		data = parseYaml(match[1]);
	} catch (e) {
		throw new ContentError(file, `the front matter is not valid YAML (${(e as Error).message})`);
	}
	return { data: data ?? {}, body: match[2].trim() };
}

export function parseYamlFile(source: string, file: string): unknown {
	try {
		return parseYaml(source);
	} catch (e) {
		throw new ContentError(file, `not valid YAML (${(e as Error).message})`);
	}
}

/** Validates data with a schema and turns any problem into a readable message. */
export function validate<S extends z.ZodType>(schema: S, data: unknown, file: string): z.output<S> {
	const result = schema.safeParse(data);
	if (!result.success) {
		const problems = result.error.issues
			.map((issue) => {
				const where = issue.path.length ? issue.path.join('.') : 'front matter';
				return `  - ${where}: ${issue.message}`;
			})
			.join('\n');
		throw new ContentError(file, `please fix:\n${problems}`);
	}
	return result.data;
}

const marked = new Marked({
	gfm: true,
	breaks: false,
	renderer: {
		link({ href, title, tokens }) {
			const text = this.parser.parseInline(tokens);
			const external = /^https?:\/\//.test(href);
			const titleAttr = title ? ` title="${escapeHtml(title)}"` : '';
			const rel = external ? ' rel="noopener noreferrer" target="_blank"' : '';
			const hint = external ? '<span class="visually-hidden"> (opens in a new tab)</span>' : '';
			return `<a href="${escapeHtml(href)}"${titleAttr}${rel}>${text}${hint}</a>`;
		}
	}
});

export function renderMarkdown(markdown: string): string {
	return marked.parse(markdown, { async: false }) as string;
}

export function escapeHtml(value: string): string {
	return value
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/** Roughly how long a piece of writing takes to read, in minutes. */
export function readingMinutes(markdown: string): number {
	const words = markdown.split(/\s+/).filter(Boolean).length;
	return Math.max(1, Math.round(words / 200));
}

export function slugFromPath(path: string): string {
	const name = path.split('/').pop() ?? path;
	return name.replace(/\.(md|ya?ml)$/, '');
}
