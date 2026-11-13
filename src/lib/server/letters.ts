import type { Letter } from './content';
import type { LetterDefinition } from '#lib/letters.js';

export const letterDefinition = (l: Letter): LetterDefinition => ({
	slug: l.slug,
	title: l.title,
	summary: l.summary,
	recipient: l.recipient,
	subject: l.subject,
	fields: l.fields,
	enclosures: l.enclosures,
	template: l.template
});
