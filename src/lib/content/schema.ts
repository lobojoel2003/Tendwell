import { z } from 'zod';

/**
 * Schemas for everything under /content.
 *
 * Volunteers edit Markdown and YAML files in that folder. These schemas are the
 * contract: `npm run content:check` validates every file against them, and the
 * build refuses to start if a file is invalid, with a message that says which
 * file and which field to fix.
 */

const slug = z
	.string()
	.regex(
		/^[a-z0-9]+(?:-[a-z0-9]+)*$/,
		'use lowercase words joined by hyphens, like "close-bank-accounts"'
	);

const fieldId = z
	.string()
	.regex(
		/^[a-z][a-z0-9_]*$/,
		'use lowercase letters, numbers and underscores, like "account_number"'
	);

export const answerValues = ['yes', 'no', 'unsure'] as const;
export type Answer = (typeof answerValues)[number];

export const regionSchema = z.object({
	id: slug,
	name: z.string().min(2),
	description: z.string().optional()
});
export type Region = z.infer<typeof regionSchema>;

export const phaseSchema = z.object({
	id: slug,
	title: z.string().min(3),
	short: z.string().min(2),
	description: z.string().min(10),
	order: z.number().int()
});
export type Phase = z.infer<typeof phaseSchema>;

export const questionSchema = z.object({
	id: fieldId,
	question: z.string().min(5),
	help: z.string().optional()
});
export type Question = z.infer<typeof questionSchema>;

const linkSchema = z.object({
	title: z.string().min(2),
	url: z.url({ protocol: /^https$/, error: 'links must start with https://' })
});

const regionList = z.array(z.string()).min(1).default(['all']);

export const effortValues = ['minutes', 'hour', 'hours', 'weeks'] as const;

export const taskFrontMatterSchema = z
	.object({
		title: z.string().min(5).max(80),
		phase: slug,
		order: z.number().int().min(0),
		summary: z.string().min(20).max(320),
		/**
		 * Only for real deadlines. Write it as a calm, factual sentence.
		 * Example: "Family members usually have 60 days to choose COBRA coverage."
		 */
		time_sensitive: z.string().min(10).max(240).optional(),
		effort: z.enum(effortValues).optional(),
		often_done_by: z.string().max(80).optional(),
		applies_if: z.record(fieldId, z.enum(['yes', 'no'])).default({}),
		regions: regionList,
		guides: z.array(slug).default([]),
		letters: z.array(slug).default([]),
		links: z.array(linkSchema).default([])
	})
	.strict();
export type TaskFrontMatter = z.infer<typeof taskFrontMatterSchema>;

export const guideFrontMatterSchema = z
	.object({
		title: z.string().min(5).max(90),
		summary: z.string().min(20).max(320),
		order: z.number().int().min(0),
		regions: regionList,
		reviewed: z.iso.date({ error: 'use a date like 2026-11-01' }),
		links: z.array(linkSchema).default([])
	})
	.strict();
export type GuideFrontMatter = z.infer<typeof guideFrontMatterSchema>;

export const letterFieldTypes = ['text', 'textarea', 'date', 'email', 'tel'] as const;

export const customLetterFieldSchema = z
	.object({
		id: fieldId,
		label: z.string().min(2),
		type: z.enum(letterFieldTypes).default('text'),
		required: z.boolean().default(false),
		help: z.string().optional(),
		placeholder: z.string().optional()
	})
	.strict();
export type LetterField = z.infer<typeof customLetterFieldSchema>;

export const letterFrontMatterSchema = z
	.object({
		title: z.string().min(5).max(90),
		summary: z.string().min(20).max(320),
		order: z.number().int().min(0),
		regions: regionList,
		/** Who the letter is addressed to, in plain words. */
		recipient: z.string().min(3).max(120),
		/** Subject line. May use {{placeholders}}. */
		subject: z.string().min(5).max(160),
		/** Either the id of a shared field (see src/lib/content/letter-fields.ts) or a custom field. */
		fields: z.array(z.union([fieldId, customLetterFieldSchema])).min(1),
		enclosures: z.array(z.string()).default([])
	})
	.strict();
export type LetterFrontMatter = z.infer<typeof letterFrontMatterSchema>;
