import { getContent } from '#lib/server/content.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const { tasks, guides, letters, phases } = getContent();
	const first = phases[0]?.id;
	return {
		firstThree: tasks
			.filter((t) => t.phase === first && Object.keys(t.appliesIf).length === 0)
			.slice(0, 3)
			.map((t) => ({ id: t.id, title: t.title, summary: t.summary, effort: t.effort })),
		guides: guides
			.slice(0, 4)
			.map((g) => ({ slug: g.slug, title: g.title, summary: g.summary, minutes: g.minutes })),
		goodbye: url.searchParams.has('goodbye'),
		counts: { tasks: tasks.length, guides: guides.length, letters: letters.length }
	};
};
