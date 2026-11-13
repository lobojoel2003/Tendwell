<script lang="ts">
	import type { Answers } from '#lib/plan.js';

	let {
		questions,
		answers = {}
	}: { questions: { id: string; question: string; help?: string }[]; answers?: Answers } = $props();

	const choices = [
		['yes', 'Yes'],
		['no', 'No'],
		['unsure', 'Not sure']
	] as const;
</script>

<div class="questions">
	{#each questions as q (q.id)}
		<fieldset>
			<legend>{q.question}</legend>
			{#if q.help}<p class="hint">{q.help}</p>{/if}
			<div class="choices">
				{#each choices as [value, label] (value)}
					<label>
						<input type="radio" name="q_{q.id}" {value} checked={answers[q.id] === value} />
						{label}
					</label>
				{/each}
			</div>
		</fieldset>
	{/each}
</div>

<style>
	.questions {
		display: grid;
		gap: 0.25rem 2rem;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
	}
	.hint {
		margin: 0.1rem 0 0;
	}
</style>
