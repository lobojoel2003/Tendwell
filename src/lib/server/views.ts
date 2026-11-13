import { getContent, getGuide, getLetter, type Task } from './content';

/** A step with its related guides and letters, ready for a page to show. */
export function taskView(task: Task) {
	const { phases } = getContent();
	return {
		...task,
		phaseTitle: phases.find((p) => p.id === task.phase)?.title ?? task.phase,
		relatedGuides: task.guides.flatMap((slug) => {
			const g = getGuide(slug);
			return g ? [{ slug: g.slug, title: g.title, minutes: g.minutes }] : [];
		}),
		relatedLetters: task.letters.flatMap((slug) => {
			const l = getLetter(slug);
			return l ? [{ slug: l.slug, title: l.title }] : [];
		})
	};
}
export type TaskView = ReturnType<typeof taskView>;

export const taskSummary = (t: Task) => ({
	id: t.id,
	title: t.title,
	summary: t.summary,
	phase: t.phase,
	effort: t.effort,
	timeSensitive: t.timeSensitive,
	appliesIf: t.appliesIf
});
