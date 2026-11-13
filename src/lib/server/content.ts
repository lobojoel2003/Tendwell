import { z } from 'zod';
import {
	guideFrontMatterSchema,
	letterFrontMatterSchema,
	phaseSchema,
	questionSchema,
	regionSchema,
	taskFrontMatterSchema,
	type LetterField,
	type Phase,
	type Question,
	type Region
} from '#lib/content/schema.js';
import {
	ContentError,
	parseYamlFile,
	readingMinutes,
	renderMarkdown,
	slugFromPath,
	splitFrontMatter,
	validate
} from '#lib/content/parse.js';
import { sharedLetterFields } from '#lib/content/letter-fields.js';
import { templateFieldIds } from '#lib/content/template.js';

/**
 * Loads everything in /content at build time. Vite inlines the files, so the
 * running server never reads the folder from disk.
 */

export interface Task {
	id: string;
	title: string;
	phase: string;
	order: number;
	summary: string;
	timeSensitive?: string;
	effort?: 'minutes' | 'hour' | 'hours' | 'weeks';
	oftenDoneBy?: string;
	appliesIf: Record<string, 'yes' | 'no'>;
	regions: string[];
	guides: string[];
	letters: string[];
	links: { title: string; url: string }[];
	html: string;
	custom?: false;
}

export interface Guide {
	slug: string;
	title: string;
	summary: string;
	order: number;
	regions: string[];
	reviewed: string;
	links: { title: string; url: string }[];
	minutes: number;
	html: string;
}

export interface Letter {
	slug: string;
	title: string;
	summary: string;
	order: number;
	regions: string[];
	recipient: string;
	subject: string;
	fields: LetterField[];
	enclosures: string[];
	template: string;
}

export interface Content {
	regions: Region[];
	phases: Phase[];
	questions: Question[];
	tasks: Task[];
	guides: Guide[];
	letters: Letter[];
}

type Files = Record<string, string>;

export function buildContent(files: {
	regions: Files;
	phases: Files;
	questions: Files;
	tasks: Files;
	guides: Files;
	letters: Files;
}): Content {
	const one = (group: Files, name: string) => {
		const entries = Object.entries(group);
		if (entries.length !== 1) throw new ContentError(`content/${name}`, 'file is missing');
		return entries[0];
	};

	const [regionsPath, regionsSource] = one(files.regions, 'regions.yaml');
	const regions = validate(
		z.array(regionSchema).min(1),
		parseYamlFile(regionsSource, regionsPath),
		regionsPath
	);

	const [phasesPath, phasesSource] = one(files.phases, 'phases.yaml');
	const phases = validate(
		z.array(phaseSchema).min(1),
		parseYamlFile(phasesSource, phasesPath),
		phasesPath
	).sort((a, b) => a.order - b.order);

	const [questionsPath, questionsSource] = one(files.questions, 'questions.yaml');
	const questions = validate(
		z.array(questionSchema),
		parseYamlFile(questionsSource, questionsPath),
		questionsPath
	);

	const regionIds = new Set(['all', ...regions.map((r) => r.id)]);
	const phaseIds = new Set(phases.map((p) => p.id));
	const questionIds = new Set(questions.map((q) => q.id));

	const guides: Guide[] = Object.entries(files.guides).map(([path, source]) => {
		const { data, body } = splitFrontMatter(source, path);
		const meta = validate(guideFrontMatterSchema, data, path);
		checkRegions(meta.regions, regionIds, path);
		if (!body) throw new ContentError(path, 'the guide has no text below the front matter');
		return {
			slug: slugFromPath(path),
			...meta,
			minutes: readingMinutes(body),
			html: renderMarkdown(body)
		};
	});
	guides.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

	const letters: Letter[] = Object.entries(files.letters).map(([path, source]) => {
		const { data, body } = splitFrontMatter(source, path);
		const meta = validate(letterFrontMatterSchema, data, path);
		checkRegions(meta.regions, regionIds, path);
		if (!body) throw new ContentError(path, 'the letter has no text below the front matter');
		const fields = meta.fields.map((field) => {
			if (typeof field !== 'string') return field;
			const shared = sharedLetterFields[field];
			if (!shared) {
				throw new ContentError(
					path,
					`"${field}" is not a shared field. Use one of ${Object.keys(sharedLetterFields).join(', ')}, or describe it with id and label.`
				);
			}
			return shared;
		});
		const declared = new Set([...fields.map((f) => f.id), 'today']);
		const seen = new Set<string>();
		for (const f of fields) {
			if (seen.has(f.id)) throw new ContentError(path, `field "${f.id}" is listed twice`);
			seen.add(f.id);
		}
		for (const id of [...templateFieldIds(body), ...templateFieldIds(meta.subject)]) {
			if (!declared.has(id)) {
				throw new ContentError(
					path,
					`the letter uses {{${id}}} but "${id}" is not in its fields list`
				);
			}
		}
		return { slug: slugFromPath(path), ...meta, fields, template: body };
	});
	letters.sort((a, b) => a.order - b.order || a.title.localeCompare(b.title));

	const guideSlugs = new Set(guides.map((g) => g.slug));
	const letterSlugs = new Set(letters.map((l) => l.slug));

	const tasks: Task[] = Object.entries(files.tasks).map(([path, source]) => {
		const { data, body } = splitFrontMatter(source, path);
		const meta = validate(taskFrontMatterSchema, data, path);
		checkRegions(meta.regions, regionIds, path);
		if (!phaseIds.has(meta.phase)) {
			throw new ContentError(
				path,
				`phase "${meta.phase}" is not one of ${[...phaseIds].join(', ')}`
			);
		}
		for (const key of Object.keys(meta.applies_if)) {
			if (!questionIds.has(key)) {
				throw new ContentError(
					path,
					`applies_if uses "${key}", which is not a question in questions.yaml`
				);
			}
		}
		for (const g of meta.guides) {
			if (!guideSlugs.has(g))
				throw new ContentError(path, `guide "${g}" does not exist in content/guides`);
		}
		for (const l of meta.letters) {
			if (!letterSlugs.has(l))
				throw new ContentError(path, `letter "${l}" does not exist in content/letters`);
		}
		return {
			id: slugFromPath(path),
			title: meta.title,
			phase: meta.phase,
			order: meta.order,
			summary: meta.summary,
			timeSensitive: meta.time_sensitive,
			effort: meta.effort,
			oftenDoneBy: meta.often_done_by,
			appliesIf: meta.applies_if,
			regions: meta.regions,
			guides: meta.guides,
			letters: meta.letters,
			links: meta.links,
			html: body ? renderMarkdown(body) : ''
		};
	});
	const phaseOrder = new Map(phases.map((p) => [p.id, p.order]));
	tasks.sort(
		(a, b) =>
			(phaseOrder.get(a.phase) ?? 0) - (phaseOrder.get(b.phase) ?? 0) ||
			a.order - b.order ||
			a.title.localeCompare(b.title)
	);

	return { regions, phases, questions, tasks, guides, letters };
}

function checkRegions(list: string[], known: Set<string>, path: string) {
	for (const r of list) {
		if (!known.has(r))
			throw new ContentError(path, `region "${r}" is not in regions.yaml (or "all")`);
	}
}

let cached: Content | undefined;

export function getContent(): Content {
	cached ??= buildContent({
		regions: import.meta.glob<string>('/content/regions.yaml', {
			query: '?raw',
			import: 'default',
			eager: true
		}),
		phases: import.meta.glob<string>('/content/phases.yaml', {
			query: '?raw',
			import: 'default',
			eager: true
		}),
		questions: import.meta.glob<string>('/content/questions.yaml', {
			query: '?raw',
			import: 'default',
			eager: true
		}),
		tasks: import.meta.glob<string>('/content/tasks/*.md', {
			query: '?raw',
			import: 'default',
			eager: true
		}),
		guides: import.meta.glob<string>('/content/guides/*.md', {
			query: '?raw',
			import: 'default',
			eager: true
		}),
		letters: import.meta.glob<string>('/content/letters/*.md', {
			query: '?raw',
			import: 'default',
			eager: true
		})
	});
	return cached;
}

export const inRegion = (item: { regions: string[] }, region: string) =>
	item.regions.includes('all') || item.regions.includes(region);

export function getTask(id: string) {
	return getContent().tasks.find((t) => t.id === id);
}

export function getGuide(slug: string) {
	return getContent().guides.find((g) => g.slug === slug);
}

export function getLetter(slug: string) {
	return getContent().letters.find((l) => l.slug === slug);
}
