import { getContent } from '#lib/server/content.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	guides: getContent().guides.map((g) => ({
		slug: g.slug,
		title: g.title,
		summary: g.summary,
		minutes: g.minutes
	}))
});
