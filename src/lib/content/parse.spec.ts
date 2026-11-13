import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import {
	ContentError,
	readingMinutes,
	renderMarkdown,
	splitFrontMatter,
	validate
} from './parse.js';

describe('splitFrontMatter', () => {
	it('separates YAML from the body', () => {
		const { data, body } = splitFrontMatter('---\ntitle: Hello\n---\n\nBody text\n', 'x.md');
		expect(data).toEqual({ title: 'Hello' });
		expect(body).toBe('Body text');
	});
	it('handles Windows line endings', () => {
		expect(splitFrontMatter('---\r\na: 1\r\n---\r\nB', 'x.md').body).toBe('B');
	});
	it('explains a missing front matter block', () => {
		expect(() => splitFrontMatter('# No front matter', 'content/tasks/x.md')).toThrow(
			/content\/tasks\/x\.md: the file must start/
		);
	});
	it('explains invalid YAML', () => {
		expect(() => splitFrontMatter('---\ntitle: [oops\n---\n', 'x.md')).toThrow(ContentError);
	});
});

describe('validate', () => {
	it('names the file and the field to fix', () => {
		const schema = z.object({ title: z.string().min(5) });
		expect(() => validate(schema, { title: 'Hi' }, 'content/guides/a.md')).toThrow(
			/content\/guides\/a\.md: please fix:\n {2}- title:/
		);
	});
});

describe('renderMarkdown', () => {
	it('opens outside links in a new tab, safely', () => {
		const html = renderMarkdown('[SSA](https://www.ssa.gov/)');
		expect(html).toContain('rel="noopener noreferrer" target="_blank"');
		expect(html).toContain('(opens in a new tab)');
	});
	it('keeps inside links as they are', () => {
		expect(renderMarkdown('[Guides](/guides)')).toContain('<a href="/guides">Guides</a>');
	});
});

it('estimates reading time', () => {
	expect(readingMinutes('word '.repeat(1000))).toBe(5);
	expect(readingMinutes('short')).toBe(1);
});
