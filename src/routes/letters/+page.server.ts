import { getContent } from '#lib/server/content.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => ({
	query: url.searchParams.get('plan')
		? `?plan=${encodeURIComponent(url.searchParams.get('plan')!)}`
		: '',
	letters: getContent().letters.map((l) => ({
		slug: l.slug,
		title: l.title,
		summary: l.summary,
		recipient: l.recipient
	}))
});
