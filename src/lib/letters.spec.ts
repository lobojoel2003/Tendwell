import { describe, expect, it } from 'vitest';
import {
	letterAsText,
	letterFileName,
	pickValues,
	prepareLetter,
	type LetterDefinition
} from './letters.js';

const letter: LetterDefinition = {
	slug: 'test-letter',
	title: 'Test',
	summary: 'A test letter',
	recipient: 'Someone',
	subject: 'About {{deceased_name}}',
	enclosures: ['A copy of the death certificate'],
	fields: [
		{ id: 'sender_name', label: 'Your name', type: 'text', required: true },
		{ id: 'sender_address', label: 'Your address', type: 'textarea', required: false },
		{ id: 'recipient_name', label: 'Organization', type: 'text', required: true },
		{ id: 'deceased_name', label: 'Their name', type: 'text', required: true },
		{ id: 'date_of_death', label: 'Date', type: 'date', required: true },
		{ id: 'account_number', label: 'Account', type: 'text', required: false }
	],
	template:
		'Dear team,\n\n{{deceased_name}} died on {{date_of_death}}.{{#if account_number}} Account {{account_number}}.{{/if}}\n\nSincerely,\n\n{{sender_name}}'
};

describe('prepareLetter', () => {
	const values = {
		sender_name: 'Priya Shah',
		sender_address: '12 Elm St\n\n  Springfield ',
		recipient_name: 'Bank',
		deceased_name: 'Margaret Shah',
		date_of_death: '2026-11-02'
	};

	it('formats dates and builds the address blocks', () => {
		const p = prepareLetter(letter, values, '2026-11-13');
		expect(p.date).toBe('November 13, 2026');
		expect(p.senderLines).toEqual(['Priya Shah', '12 Elm St', 'Springfield']);
		expect(p.recipientLines).toEqual(['Bank']);
		expect(p.subject).toBe('About Margaret Shah');
		expect(p.paragraphs[1]).toEqual(['Margaret Shah died on November 2, 2026.']);
		expect(p.missing).toEqual([]);
	});

	it('lists required fields that are still empty', () => {
		const p = prepareLetter(letter, { sender_name: 'Priya' });
		expect(p.missing.map((f) => f.id)).toEqual([
			'recipient_name',
			'deceased_name',
			'date_of_death'
		]);
	});

	it('can be copied as plain text', () => {
		const text = letterAsText(prepareLetter(letter, values, '2026-11-13'));
		expect(text).toContain('Re: About Margaret Shah');
		expect(text).toContain('Enclosed:\n- A copy of the death certificate');
	});
});

describe('pickValues', () => {
	it('keeps declared fields only, trimmed and limited', () => {
		const input: Record<string, unknown> = {
			sender_name: '  Ana  ',
			other: 'x',
			deceased_name: 'y'.repeat(500)
		};
		const values = pickValues(letter, (id) => input[id]);
		expect(values).toEqual({ sender_name: 'Ana', deceased_name: 'y'.repeat(200) });
	});
});

it('names downloaded files clearly', () => {
	expect(letterFileName('notify-bank', '2026-11-13')).toBe('tendwell-notify-bank-2026-11-13.pdf');
});
