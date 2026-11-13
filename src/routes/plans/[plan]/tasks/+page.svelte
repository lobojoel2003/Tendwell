<script lang="ts">
	import { enhance } from '$app/forms';
	import StepCard from '#lib/components/StepCard.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const names = $derived(Object.fromEntries(data.members.map((m) => [m.id, m.name])));
	const userId = $derived(data.user!.id);
</script>

<svelte:head>
	<title>Everything · {data.plan.personName} · Tendwell</title>
</svelte:head>

<div class="head">
	<div>
		<h1>Everything, when you’re ready</h1>
		<p class="lede">
			The whole plan in one place. It’s long, and that’s normal. Most families take months, and
			plenty of steps won’t apply.
		</p>
	</div>
	<div class="actions no-print">
		<a
			class="button secondary small"
			href="?show=all"
			aria-current={data.show === 'all' ? 'true' : undefined}
		>
			All ({data.counts.all})
		</a>
		<a
			class="button secondary small"
			href="?show=open"
			aria-current={data.show === 'open' ? 'true' : undefined}
		>
			Still open ({data.counts.open})
		</a>
		<button class="button quiet small" type="button" onclick={() => window.print()}>Print</button>
	</div>
</div>

{#each data.phases as phase (phase.id)}
	<section class="phase" aria-labelledby="ph-{phase.id}">
		<h2 id="ph-{phase.id}">{phase.title}</h2>
		<p class="muted">{phase.description}</p>
		{#if phase.items.length}
			<ul class="steps">
				{#each phase.items as item (item.id)}
					<li>
						<StepCard
							{item}
							planId={data.plan.id}
							{userId}
							{names}
							notes={data.notes[item.id] ?? 0}
						/>
					</li>
				{/each}
			</ul>
		{:else}
			<p class="small muted">Nothing open here.</p>
		{/if}
	</section>
{/each}

<section class="card add no-print" aria-labelledby="add-heading">
	<h2 id="add-heading">Add your own step</h2>
	<p class="muted small">
		For anything particular to your family: a club to tell, a car to collect, a promise to keep.
	</p>
	<form method="POST" action="?/add" use:enhance>
		{#if form && 'addError' in form}<p class="form-error" role="alert">{form.addError}</p>{/if}
		{#if form && 'added' in form}<p class="form-success" role="status">
				Added “{form.added}”.
			</p>{/if}
		<div class="field">
			<label for="title">What needs doing?</label>
			<input id="title" name="title" type="text" required maxlength="120" />
		</div>
		<div class="field">
			<label for="details">Details <span class="hint">(optional)</span></label>
			<textarea id="details" name="details" rows="2" maxlength="1000"></textarea>
		</div>
		<div class="field">
			<label for="phase">When?</label>
			<select id="phase" name="phase">
				{#each data.phases as phase, i (phase.id)}
					<option value={phase.id} selected={i === 1}>{phase.title}</option>
				{/each}
			</select>
		</div>
		<button class="button secondary" type="submit">Add step</button>
	</form>
</section>

<style>
	.head {
		display: flex;
		justify-content: space-between;
		gap: 1.5rem;
		flex-wrap: wrap;
		align-items: flex-end;
	}
	.head .actions a[aria-current] {
		background: var(--accent-soft);
		border-color: var(--accent);
	}
	.phase {
		margin-top: 2.5rem;
	}
	.steps {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0;
		display: grid;
		gap: 0.75rem;
	}
	.add {
		margin-top: 3rem;
		max-width: 40rem;
	}
</style>
