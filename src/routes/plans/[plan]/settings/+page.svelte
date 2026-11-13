<script lang="ts">
	import { enhance } from '$app/forms';
	import Questions from '#lib/components/Questions.svelte';
	import { todayIso } from '#lib/letters.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
</script>

<svelte:head>
	<title>Settings · {data.plan.personName} · Tendwell</title>
</svelte:head>

<div class="narrow stack">
	<h1>Plan settings</h1>

	<form
		method="POST"
		action="?/save"
		class="stack"
		use:enhance={() =>
			async ({ update }) =>
				update({ reset: false })}
	>
		{#if form && 'error' in form && form.error}<p class="form-error" role="alert">
				{form.error}
			</p>{/if}
		{#if form && 'saved' in form}<p class="form-success" role="status">
				Saved. The plan has been updated.
			</p>{/if}
		<section class="card">
			<div class="field">
				<label for="person_name">Who this plan is for</label>
				<input
					id="person_name"
					name="person_name"
					type="text"
					required
					value={data.plan.personName}
				/>
			</div>
			<div class="field">
				<label for="date_of_death">When they died <span class="hint">(optional)</span></label>
				<input
					id="date_of_death"
					name="date_of_death"
					type="date"
					max={todayIso()}
					value={data.plan.dateOfDeath ?? ''}
				/>
			</div>
		</section>
		<section class="card">
			<h2>About their situation</h2>
			<p class="muted small">
				Changing these adds or hides steps. Anything you’ve already done is remembered.
			</p>
			<Questions questions={data.questions} answers={data.plan.answers} />
		</section>
		<div><button class="button" type="submit">Save changes</button></div>
	</form>

	{#if data.plan.role === 'owner'}
		<details class="card danger-zone">
			<summary><strong>Delete this plan</strong></summary>
			<form method="POST" action="?/delete" use:enhance>
				<p class="muted">
					This removes the plan, its notes and its accounts list for everyone in it. It can’t be
					undone.
				</p>
				{#if form && 'deleteError' in form}<p class="form-error" role="alert">
						{form.deleteError}
					</p>{/if}
				<label class="confirm">
					<input type="checkbox" name="confirm" value="yes" />
					I understand. Delete the plan for {data.plan.personName}.
				</label>
				<button class="button danger" type="submit">Delete plan</button>
			</form>
		</details>
	{/if}
</div>

<style>
	h2 {
		font-size: 1.2rem;
	}
	.danger-zone summary {
		cursor: pointer;
	}
	.danger-zone form {
		margin-top: 1rem;
	}
	.confirm {
		display: flex;
		gap: 0.5rem;
		align-items: center;
		font-weight: 500;
		margin-bottom: 1rem;
	}
</style>
