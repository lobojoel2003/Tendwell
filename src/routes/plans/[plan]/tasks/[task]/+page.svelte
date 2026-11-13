<script lang="ts">
	import { enhance } from '$app/forms';
	import TaskDetails from '#lib/components/TaskDetails.svelte';
	import { firstName, formatTimestamp, isResting, timeAgo } from '#lib/plan.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const names = $derived(Object.fromEntries(data.members.map((m) => [m.id, m.name])));
	const userId = $derived(data.user!.id);
	const item = $derived(data.item);
	const mine = $derived(item.assigneeId === userId);
	const owner = $derived(item.assigneeId ? (names[item.assigneeId] ?? 'Someone') : null);
	const resting = $derived(isResting(item, Date.now()));
	let noteBody = $state('');
</script>

<svelte:head>
	<title>{item.title} · {data.plan.personName} · Tendwell</title>
</svelte:head>

<div class="layout">
	<article>
		<p class="small no-print"><a href="/plans/{data.plan.id}">← This week</a></p>
		<h1>{item.title}</h1>
		{#if data.task}
			<TaskDetails task={data.task} letterQuery={data.letterQuery} />
		{:else}
			<p class="badge">Added by your family</p>
			{#if data.customDetails}<p class="custom">{data.customDetails}</p>{/if}
		{/if}
	</article>

	<aside class="side no-print">
		<section class="card state" aria-labelledby="state-heading">
			<h2 id="state-heading">Where this is</h2>
			<p>
				{#if item.status === 'done'}
					<span class="badge done">Done</span>
					{#if item.updatedBy && names[item.updatedBy]}by {firstName(names[item.updatedBy])}{/if}
				{:else if item.status === 'skipped'}
					<span class="badge">Not needed</span>
				{:else if mine}
					<span class="badge calm">You’re on this</span>
				{:else if owner}
					<span class="badge calm">{firstName(owner)} is on this</span>
				{:else}
					Nobody has taken this on yet.
				{/if}
				{#if resting && item.snoozedUntil}<br /><span class="small muted"
						>Resting until {formatTimestamp(item.snoozedUntil)}.</span
					>{/if}
			</p>

			<form
				method="POST"
				use:enhance={() =>
					async ({ update }) =>
						update({ reset: false })}
			>
				<input type="hidden" name="task" value={item.id} />
				<div class="buttons">
					{#if item.status === 'todo'}
						<button class="button" formaction="?/status" name="status" value="done"
							>✓ Mark as done</button
						>
						{#if mine}
							<button class="button secondary" formaction="?/claim" name="assign" value="none"
								>Hand it back</button
							>
						{:else}
							<button class="button secondary" formaction="?/claim" name="assign" value="me">
								{owner ? 'Take this on instead' : 'I’ll take this'}
							</button>
						{/if}
						{#if resting}
							<button class="button quiet" formaction="?/snooze" name="wake" value="1"
								>Bring it back now</button
							>
						{:else}
							<button class="button quiet" formaction="?/snooze" name="wake" value="0"
								>Not this week</button
							>
						{/if}
						<button class="button quiet" formaction="?/status" name="status" value="skipped"
							>This doesn’t apply</button
						>
					{:else}
						<button class="button secondary" formaction="?/status" name="status" value="todo"
							>Undo</button
						>
					{/if}
				</div>
			</form>
		</section>

		<section class="card notes" aria-labelledby="notes-heading">
			<h2 id="notes-heading">Notes for each other</h2>
			{#if data.notes.length}
				<ul>
					{#each data.notes as note (note.id)}
						<li>
							<p class="who small">
								<strong
									>{note.userId === userId
										? 'You'
										: note.userName
											? firstName(note.userName)
											: 'Someone'}</strong
								>
								<span class="muted">· {timeAgo(note.createdAt)}</span>
							</p>
							<p class="body">{note.body}</p>
							{#if note.userId === userId}
								<form method="POST" action="?/deleteNote" use:enhance>
									<input type="hidden" name="note" value={note.id} />
									<button class="link small" type="submit">Delete</button>
								</form>
							{/if}
						</li>
					{/each}
				</ul>
			{:else}
				<p class="small muted">
					Phone numbers, reference numbers, who you spoke to. Anything that helps whoever picks this
					up next.
				</p>
			{/if}
			<form
				method="POST"
				action="?/note"
				use:enhance={() =>
					async ({ result, update }) => {
						await update();
						if (result.type === 'success') noteBody = '';
					}}
			>
				{#if form && 'noteError' in form}<p class="form-error" role="alert">
						{form.noteError}
					</p>{/if}
				<label for="note-body" class="visually-hidden">Add a note</label>
				<textarea
					id="note-body"
					name="body"
					rows="3"
					maxlength="2000"
					placeholder="Add a note…"
					bind:value={noteBody}
					required></textarea>
				<button class="button secondary small" type="submit">Save note</button>
			</form>
		</section>

		{#if item.custom}
			<form method="POST" action="?/deleteStep" class="remove">
				<button class="button quiet small" type="submit">Remove this step</button>
			</form>
		{/if}
	</aside>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 21rem;
		gap: 2.5rem;
		align-items: start;
	}
	@media (max-width: 960px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
	.custom {
		white-space: pre-line;
		margin-top: 1rem;
		max-width: var(--measure);
	}
	.side {
		display: grid;
		gap: 1rem;
		position: sticky;
		top: 1rem;
	}
	@media (max-width: 960px) {
		.side {
			position: static;
		}
	}
	.side h2 {
		font-size: 1.1rem;
	}
	.buttons {
		display: grid;
		gap: 0.5rem;
	}
	.notes ul {
		list-style: none;
		padding: 0;
		margin: 0 0 1rem;
	}
	.notes li {
		border-bottom: 1px solid var(--line);
		padding: 0.6rem 0;
	}
	.notes .who {
		margin: 0 0 0.15rem;
	}
	.notes .body {
		margin: 0;
		white-space: pre-line;
		overflow-wrap: anywhere;
	}
	.notes textarea {
		margin-bottom: 0.6rem;
		min-height: 4.5rem;
	}
	.link {
		background: none;
		border: 0;
		padding: 0;
		color: var(--ink-faint);
		text-decoration: underline;
	}
	.remove {
		text-align: right;
	}
</style>
