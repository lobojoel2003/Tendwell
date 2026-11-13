<script lang="ts">
	import { formatDate } from '#lib/plan.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Your plans · Tendwell</title>
</svelte:head>

<div class="narrow">
	<p class="eyebrow">Hello, {data.user?.name}</p>
	<h1>Your plans</h1>

	{#if data.plans.length}
		<ul class="plans">
			{#each data.plans as plan (plan.id)}
				<li>
					<a class="card plan" href="/plans/{plan.id}">
						<span class="name">{plan.personName}</span>
						<span class="small muted">
							{#if plan.dateOfDeath}Died {formatDate(plan.dateOfDeath)} ·{/if}
							{plan.members === 1 ? 'Just you' : `${plan.members} people`}
							{#if plan.role === 'owner'}· You started this plan{/if}
						</span>
					</a>
				</li>
			{/each}
		</ul>
		<p><a class="button secondary" href="/plans/new">Start another plan</a></p>
	{:else}
		<div class="panel empty">
			<p>
				A plan keeps track of what’s done and what’s next, for one person who has died. You can
				share it with family.
			</p>
			<a class="button" href="/plans/new">Start a plan</a>
		</div>
	{/if}

	<p class="small muted account"><a href="/account">Your account</a></p>
</div>

<style>
	.plans {
		list-style: none;
		padding: 0;
		margin: 1.5rem 0;
		display: grid;
		gap: 0.9rem;
	}
	.plan {
		display: flex;
		flex-direction: column;
		gap: 0.2rem;
		color: inherit;
		text-decoration: none;
	}
	.plan:hover {
		border-color: var(--accent);
	}
	.name {
		font-family: var(--serif);
		font-size: 1.35rem;
		font-weight: 600;
	}
	.empty {
		margin-top: 1.5rem;
	}
	.account {
		margin-top: 2.5rem;
	}
</style>
