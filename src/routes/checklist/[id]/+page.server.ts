import { error } from '@sveltejs/kit';
import { getTask } from '#lib/server/content.js';
import { taskView } from '#lib/server/views.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ params }) => {
	const task = getTask(params.id);
	if (!task) error(404, 'We couldn’t find that step.');
	return { task: taskView(task) };
};
