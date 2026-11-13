<script lang="ts">
	import { enhance } from '$app/forms';
	import { effortLabels, firstName, formatTimestamp, isResting, type PlanItem } from '#lib/plan.js';

	let {
		item,
		planId,
		userId,
		names,
		number,
		notes = 0,
		showSummary = true
	}: {
		item: PlanItem;
		planId: string;
		userId: string;
		names: Record<string, string>;
		number?: number;
		notes?: number;
		showSummary?: boolean;
	} = $props();

	let busy = $state(false);
	const resting = $derived(isResting(item, Date.now()));
	const mine = $derived(item.assigneeId === userId);
	const owner = $derived(item.assigneeId ? (names[item.assigneeId] ?? 'Someone') : null);
	const settled = $derived(item.status !== 'todo');
</script>

<article class="step card" class:settled class:numbered={number !== undefined} data-step={item.id}>
	{#if number !== undefined}<span class="number" aria-hidden="true">{number}</span>{/if}
	<div class="body">
		<h3>
			<a href="/plans/{planId}/tasks/{item.id}">{item.title}</a>
		</h3>
		{#if showSummary && item.summary && !settled}<p class="summary">{item.summary}</p>{/if}
		<div class="badges">
			{#if item.status === 'done'}
				<span class="badge done"
					>Done{#if item.updatedBy && names[item.updatedBy]}&nbsp;by {firstName(
							names[item.updatedBy]
						)}{/if}</span
				>
			{:else if item.status === 'skipped'}
				<span class="badge">Not needed</span>
			{:else}
				{#if item.timeSensitive}<span class="badge attention" title={item.timeSensitive}
						>Has a deadline</span
					>{/if}
				{#if mine}<span class="badge calm">You’re on this</span>
				{:else if owner}<span class="badge calm">{firstName(owner)} is on this</span>{/if}
				{#if resting && item.snoozedUntil}<span class="badge"
						>Resting until {formatTimestamp(item.snoozedUntil)}</span
					>{/if}
				{#if item.effort}<span class="badge">{effortLabels[item.effort]}</span>{/if}
				{#if item.custom}<span class="badge">Added by your family</span>{/if}
			{/if}
			{#if notes}<span class="badge">{notes} {notes === 1 ? 'note' : 'notes'}</span>{/if}
		</div>
	</div>

	<form
		method="POST"
		class="controls no-print"
		use:enhance={() => {
			busy = true;
			return async ({ update }) => {
				await update({ reset: false });
				busy = false;
			};
		}}
	>
		<input type="hidden" name="task" value={item.id} />
		{#if settled}
			<button
				class="button quiet small"
				formaction="?/status"
				name="status"
				value="todo"
				disabled={busy}
			>
				Undo
			</button>
		{:else}
			<button class="button small" formaction="?/status" name="status" value="done" disabled={busy}>
				<span aria-hidden="true">✓</span> Done
			</button>
			{#if mine}
				<button
					class="button secondary small"
					formaction="?/claim"
					name="assign"
					value="none"
					disabled={busy}
				>
					Hand back
				</button>
			{:else if !owner}
				<button
					class="button secondary small"
					formaction="?/claim"
					name="assign"
					value="me"
					disabled={busy}
				>
					I’ll take this
				</button>
			{/if}
			{#if resting}
				<button
					class="button quiet small"
					formaction="?/snooze"
					name="wake"
					value="1"
					disabled={busy}
				>
					Bring back
				</button>
			{:else}
				<button
					class="button quiet small"
					formaction="?/snooze"
					name="wake"
					value="0"
					disabled={busy}
				>
					Not this week
				</button>
			{/if}
		{/if}
	</form>
</article>

<style>
	.step {
		display: grid;
		grid-template-columns: 1fr;
		gap: 0.75rem 1rem;
		align-items: start;
		padding: 1.1rem 1.25rem;
	}
	.step.numbered {
		grid-template-columns: auto 1fr;
	}
	.step.numbered .controls {
		grid-column: 2;
	}
	@media (max-width: 520px) {
		.step.numbered .controls {
			grid-column: 1 / -1;
		}
	}
	.number {
		width: 2.1rem;
		height: 2.1rem;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: var(--accent-soft);
		color: var(--accent-strong);
		font-weight: 700;
	}
	h3 {
		font-family: var(--sans);
		font-size: 1.08rem;
		font-weight: 650;
		margin: 0.1rem 0 0.25rem;
	}
	h3 a {
		color: var(--ink);
		text-decoration: none;
	}
	h3 a:hover {
		text-decoration: underline;
	}
	.summary {
		margin: 0 0 0.5rem;
		color: var(--ink-soft);
		font-size: 0.97rem;
	}
	.badges {
		display: flex;
		flex-wrap: wrap;
		gap: 0.35rem;
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
	}
	.settled {
		background: var(--surface-2);
		box-shadow: none;
	}
	.settled h3 a {
		color: var(--ink-soft);
	}
</style>
