import type { LetterField } from '#lib/content/schema.js';
import { renderTemplate, toParagraphs, type Values } from '#lib/content/template.js';
import { formatDate } from '#lib/plan.js';

/** What the page needs to fill in and preview a letter. Safe to send to the browser. */
export interface LetterDefinition {
	slug: string;
	title: string;
	summary: string;
	recipient: string;
	subject: string;
	fields: LetterField[];
	enclosures: string[];
	template: string;
}

export interface PreparedLetter {
	senderLines: string[];
	date: string;
	recipientLines: string[];
	subject: string;
	paragraphs: string[][];
	enclosures: string[];
	missing: LetterField[];
}

const lines = (value: string | undefined) =>
	(value ?? '')
		.split('\n')
		.map((l) => l.trim())
		.filter(Boolean);

export function todayIso(now = new Date()): string {
	const pad = (n: number) => String(n).padStart(2, '0');
	return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}

/** Keeps only the values a letter declares, trimmed and length-limited. */
export function pickValues(
	letter: Pick<LetterDefinition, 'fields'>,
	input: (id: string) => unknown
): Values {
	const values: Values = {};
	for (const field of letter.fields) {
		const raw = input(field.id);
		if (typeof raw !== 'string') continue;
		const max = field.type === 'textarea' ? 1000 : 200;
		values[field.id] = raw.replace(/\r\n/g, '\n').trim().slice(0, max);
	}
	return values;
}

export function prepareLetter(
	letter: LetterDefinition,
	input: Values,
	today = todayIso()
): PreparedLetter {
	const values: Values = { ...input };
	for (const field of letter.fields) {
		if (field.type === 'date' && values[field.id]) values[field.id] = formatDate(values[field.id]);
		if (field.type === 'textarea' && values[field.id]) {
			values[field.id] = lines(values[field.id]).join('\n');
		}
	}
	values.today = formatDate(today);

	const senderLines = [
		...lines(values.sender_name),
		...lines(values.sender_address),
		...lines(values.sender_email),
		...lines(values.sender_phone)
	];
	const recipientLines = [...lines(values.recipient_name), ...lines(values.recipient_address)];

	return {
		senderLines,
		date: values.today,
		recipientLines,
		subject: renderTemplate(letter.subject, values).replace(/\s+/g, ' ').trim(),
		paragraphs: toParagraphs(renderTemplate(letter.template, values)),
		enclosures: letter.enclosures,
		missing: letter.fields.filter((f) => f.required && !input[f.id]?.trim())
	};
}

/** A file name like "tendwell-notify-bank-2026-11-13.pdf". */
export const letterFileName = (slug: string, today = todayIso()) => `tendwell-${slug}-${today}.pdf`;

/** The letter as plain text, for pasting into an email or a web form. */
export function letterAsText(letter: PreparedLetter): string {
	const parts = [
		letter.senderLines.join('\n'),
		letter.date,
		letter.recipientLines.join('\n'),
		`Re: ${letter.subject}`,
		...letter.paragraphs.map((p) => p.join('\n'))
	];
	if (letter.enclosures.length) {
		parts.push(`Enclosed:\n${letter.enclosures.map((e) => `- ${e}`).join('\n')}`);
	}
	return parts.filter(Boolean).join('\n\n');
}
