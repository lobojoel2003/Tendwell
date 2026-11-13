import { error } from '@sveltejs/kit';
import { getContent, getGuide } from '#lib/server/content.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const guide = getGuide(params.slug);
	if (!guide) error(404, 'We couldn’t find that guide.');
	const { guides, tasks } = getContent();
	const index = guides.indexOf(guide);
	const next = guides[index + 1];
	return {
		guide,
		next: next ? { slug: next.slug, title: next.title } : null,
		steps: tasks
			.filter((t) => t.guides.includes(guide.slug))
			.map((t) => ({ id: t.id, title: t.title }))
	};
};
