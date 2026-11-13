<script lang="ts">
	import { effortLabels } from '#lib/plan.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const shown = $derived(data.phases.reduce((n, p) => n + p.tasks.length, 0));
</script>

<svelte:head>
	<title>The checklist · Tendwell</title>
	<meta
		name="description"
		content="Everything that may need doing after a death, gently ordered from the first days to later on."
	/>
</svelte:head>

<div class="container">
	<header class="intro">
		<p class="eyebrow">The whole checklist · {data.region.name}</p>
		<h1>Everything that may need doing, in a gentle order</h1>
		<p class="lede">
			You won’t need all of these, and very few are urgent. Read at your own pace. To tick things
			off and share them with family, <a href={data.user ? '/plans/new' : '/signup'}>start a plan</a
			>.
		</p>
	</header>

	<details class="tailor panel" open={data.tailored}>
		<summary>
			<strong>Make the list fit your situation</strong>
			<span class="muted small">(optional, nothing is saved)</span>
		</summary>
		<form method="GET" class="questions">
			{#each data.questions as q (q.id)}
				<fieldset>
					<legend>{q.question}</legend>
					<div class="choices">
						{#each [['yes', 'Yes'], ['no', 'No'], ['unsure', 'Not sure']] as [value, label] (value)}
							<label>
								<input type="radio" name={q.id} {value} checked={data.answers[q.id] === value} />
								{label}
							</label>
						{/each}
					</div>
				</fieldset>
			{/each}
			<div class="actions">
				<button class="button" type="submit">Show my list</button>
				{#if data.tailored}<a class="button quiet" href="/checklist">Clear answers</a>{/if}
			</div>
		</form>
	</details>

	{#if data.tailored}
		<p class="muted">
			Showing {shown} of {data.total} steps. If you weren’t sure, we kept the step in.
		</p>
	{/if}

	{#each data.phases as phase (phase.id)}
		{#if phase.tasks.length}
			<section class="phase" aria-labelledby="phase-{phase.id}">
				<h2 id="phase-{phase.id}">{phase.title}</h2>
				<p class="muted">{phase.description}</p>
				<ul class="tasks">
					{#each phase.tasks as task (task.id)}
						<li class="card">
							<a href="/checklist/{task.id}" class="title">{task.title}</a>
							<p class="small muted">{task.summary}</p>
							<div class="badges">
								{#if task.timeSensitive}<span class="badge attention">Has a deadline</span>{/if}
								{#if task.effort}<span class="badge">{effortLabels[task.effort]}</span>{/if}
							</div>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	{/each}
</div>

<style>
	.intro {
		margin-bottom: 1.5rem;
	}
	.tailor {
		margin-bottom: 2rem;
	}
	.tailor summary {
		cursor: pointer;
		display: flex;
		gap: 0.6rem;
		align-items: baseline;
		flex-wrap: wrap;
	}
	.questions {
		margin-top: 1.25rem;
		display: grid;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 19rem), 1fr));
		gap: 0 2rem;
	}
	.questions .actions {
		grid-column: 1 / -1;
	}
	.phase {
		margin-top: 2.5rem;
	}
	.tasks {
		list-style: none;
		padding: 0;
		margin: 1rem 0 0;
		display: grid;
		gap: 0.9rem;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 20rem), 1fr));
	}
	.tasks li {
		display: flex;
		flex-direction: column;
		gap: 0.3rem;
	}
	.tasks p {
		margin: 0;
	}
	.title {
		font-weight: 650;
		font-size: 1.05rem;
	}
	.badges {
		display: flex;
		gap: 0.4rem;
		flex-wrap: wrap;
		margin-top: auto;
		padding-top: 0.3rem;
	}
</style>
