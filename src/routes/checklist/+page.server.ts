import { getContent, inRegion } from '#lib/server/content.js';
import { taskSummary } from '#lib/server/views.js';
import { appliesTo, type Answers } from '#lib/plan.js';
import type { PageServerLoad } from './$types';

export const load: PageServerLoad = ({ url }) => {
	const { tasks, phases, questions, regions } = getContent();
	const region = regions[0].id;
	const answers: Answers = {};
	for (const q of questions) {
		const value = url.searchParams.get(q.id);
		if (value === 'yes' || value === 'no' || value === 'unsure') answers[q.id] = value;
	}
	const visible = tasks.filter((t) => inRegion(t, region) && appliesTo(t.appliesIf, answers));
	return {
		region: regions[0],
		questions,
		answers,
		tailored: Object.keys(answers).length > 0,
		total: tasks.filter((t) => inRegion(t, region)).length,
		phases: phases.map((p) => ({
			...p,
			tasks: visible.filter((t) => t.phase === p.id).map(taskSummary)
		}))
	};
};
