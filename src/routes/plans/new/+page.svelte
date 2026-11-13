<script lang="ts">
	import { enhance } from '$app/forms';
	import Questions from '#lib/components/Questions.svelte';
	import { todayIso } from '#lib/letters.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let busy = $state(false);
</script>

<svelte:head>
	<title>Start a plan · Tendwell</title>
</svelte:head>

<div class="narrow">
	<p class="small"><a href="/plans">← Your plans</a></p>
	<h1>Start a plan</h1>
	<p class="lede">Just a name is enough to begin. You can change anything later.</p>

	<form
		method="POST"
		use:enhance={() => {
			busy = true;
			return async ({ update }) => {
				await update();
				busy = false;
			};
		}}
	>
		{#if form?.error}<p class="form-error" role="alert">{form.error}</p>{/if}
		<section class="card">
			<div class="field">
				<label for="person_name">Who is this plan for?</label>
				<span class="hint" id="name-hint">
					What you called them is fine. Their full name helps us fill in letters for you.
				</span>
				<input
					id="person_name"
					name="person_name"
					type="text"
					required
					value={form?.personName}
					aria-describedby="name-hint"
				/>
			</div>
			<div class="field">
				<label for="date_of_death">When did they die? <span class="hint">(optional)</span></label>
				<input id="date_of_death" name="date_of_death" type="date" max={todayIso()} />
			</div>
			{#if data.regions.length > 1}
				<div class="field">
					<label for="region">Where did they live?</label>
					<select id="region" name="region">
						{#each data.regions as region (region.id)}
							<option value={region.id}>{region.name}</option>
						{/each}
					</select>
				</div>
			{:else}
				<input type="hidden" name="region" value={data.regions[0].id} />
				<p class="small muted">
					Tendwell’s steps currently follow {data.regions[0].name} rules. Many apply anywhere.
				</p>
			{/if}
		</section>

		<section class="card">
			<h2>A little more, if you’d like</h2>
			<p class="muted">
				These help us leave out steps that don’t apply. Skip any you don’t know. If you’re not sure,
				we’ll keep the step in, just in case.
			</p>
			<Questions questions={data.questions} />
		</section>

		<div class="actions">
			<button class="button" type="submit" disabled={busy}
				>{busy ? 'One moment…' : 'Create the plan'}</button
			>
		</div>
	</form>
</div>

<style>
	form {
		display: grid;
		gap: 1.25rem;
		margin-top: 1.5rem;
	}
	h2 {
		font-size: 1.25rem;
	}
</style>
