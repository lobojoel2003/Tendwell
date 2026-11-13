<script lang="ts">
	import StepCard from '#lib/components/StepCard.svelte';
	import Activity from '#lib/components/Activity.svelte';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const names = $derived(Object.fromEntries(data.members.map((m) => [m.id, m.name])));
	const userId = $derived(data.user!.id);
	const others = $derived(data.members.filter((m) => m.id !== userId));
</script>

<svelte:head>
	<title>This week · {data.plan.personName} · Tendwell</title>
</svelte:head>

<div class="week">
	<div class="main">
		{#if data.welcome}
			<div class="note welcome" role="status">
				<p>
					<strong>Your plan is ready.</strong> There’s no need to look at everything. Start with the three
					things below, or simply come back when you’re ready.
				</p>
				{#if others.length === 0}
					<p class="small">
						Sharing the work? <a href="/plans/{data.plan.id}/people">Invite family or a friend</a>.
					</p>
				{/if}
			</div>
		{/if}

		{#if form && 'status' in form && form.status === 'done'}
			<p class="form-success" role="status">Done. That’s one less thing to carry.</p>
		{/if}

		{#if data.focus.now.length}
			<p class="eyebrow">{data.phase?.title ?? 'This week'}</p>
			<h1>
				For now, just {data.focus.now.length === 1
					? 'this one thing'
					: data.focus.now.length === 2
						? 'these two things'
						: 'these three things'}
			</h1>
			<p class="lede">
				Everything else can wait. If today isn’t the day, that’s alright too. This will be here
				tomorrow.
			</p>
			{#if data.olderPlan && data.focus.settled === 0}
				<p class="note small">
					Some of these may already be taken care of. Tap “Done” on anything that is, or look
					through
					<a href="/plans/{data.plan.id}/tasks">everything</a> and tick off what’s finished.
				</p>
			{/if}
			<ol class="steps">
				{#each data.focus.now as item, i (item.id)}
					<li>
						<StepCard
							{item}
							planId={data.plan.id}
							{userId}
							{names}
							number={i + 1}
							notes={data.notes[item.id] ?? 0}
						/>
					</li>
				{/each}
			</ol>
			{#if data.focus.remaining > 0}
				<p class="muted after">
					When you’re ready, there are more steps in
					<a href="/plans/{data.plan.id}/tasks">everything</a>. No rush.
				</p>
			{/if}
		{:else}
			<h1>Nothing needs you right now</h1>
			<p class="lede">
				{#if data.focus.othersHandling.length || data.focus.resting.length}
					The open steps are either being handled by someone else or resting until later. Take a
					breath.
				{:else}
					Every step in this plan is taken care of. That’s a great deal of love and work. Be gentle
					with yourself.
				{/if}
			</p>
		{/if}

		{#if data.focus.othersHandling.length}
			<section class="section">
				<h2>Being handled by others</h2>
				<ul class="steps">
					{#each data.focus.othersHandling as item (item.id)}
						<li>
							<StepCard
								{item}
								planId={data.plan.id}
								{userId}
								{names}
								showSummary={false}
								notes={data.notes[item.id] ?? 0}
							/>
						</li>
					{/each}
				</ul>
			</section>
		{/if}

		{#if data.focus.resting.length}
			<section class="section">
				<h2>Resting until next week</h2>
				<ul class="steps">
					{#each data.focus.resting as item (item.id)}
						<li><StepCard {item} planId={data.plan.id} {userId} {names} showSummary={false} /></li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>

	<aside class="side">
		<section class="panel">
			<h2>So far</h2>
			<p class="big">{data.focus.settled}</p>
			<p class="muted small">
				{data.focus.settled === 1 ? 'thing taken care of' : 'things taken care of'}. Each one
				counts.
			</p>
			{#if data.settledRecently.length}
				<ul class="recent small">
					{#each data.settledRecently as item (item.id)}
						<li>✓ {item.title}</li>
					{/each}
				</ul>
			{/if}
		</section>

		<section class="panel">
			<h2>Accounts</h2>
			{#if data.accounts.open + data.accounts.closed === 0}
				<p class="small muted">
					Keep a list of bank accounts, bills and subscriptions as you find them.
				</p>
			{:else}
				<p class="small muted">{data.accounts.closed} closed · {data.accounts.open} still open</p>
			{/if}
			<a class="button secondary small" href="/plans/{data.plan.id}/accounts">Open the list</a>
		</section>

		<section class="panel">
			<h2>Together</h2>
			<p class="small">
				{#if others.length}
					Shared with {others.map((m) => m.name).join(', ')}.
				{:else}
					Just you, for now.
				{/if}
			</p>
			<a class="button secondary small" href="/plans/{data.plan.id}/people">
				{others.length ? 'See people' : 'Invite someone'}
			</a>
			{#if data.activity.length}
				<h3 class="small-heading">Recently</h3>
				<Activity entries={data.activity} {userId} />
			{/if}
		</section>
	</aside>
</div>

<style>
	.week {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 19rem;
		gap: 2.5rem;
		align-items: start;
	}
	@media (max-width: 900px) {
		.week {
			grid-template-columns: 1fr;
		}
	}
	.welcome p:last-child {
		margin-bottom: 0;
	}
	.welcome {
		margin-bottom: 1.5rem;
	}
	.steps {
		list-style: none;
		padding: 0;
		margin: 1.5rem 0 0;
		display: grid;
		gap: 0.9rem;
	}
	.after {
		margin-top: 1.5rem;
	}
	.section {
		margin-top: 2.5rem;
	}
	.section h2 {
		font-size: 1.25rem;
	}
	.side {
		display: grid;
		gap: 1rem;
	}
	.side h2 {
		font-size: 1.1rem;
		margin-bottom: 0.4rem;
	}
	.big {
		font-family: var(--serif);
		font-size: 2.6rem;
		line-height: 1;
		margin: 0.2rem 0 0.2rem;
		color: var(--accent-strong);
	}
	.recent {
		list-style: none;
		padding: 0;
		margin: 0.75rem 0 0;
		color: var(--ink-soft);
	}
	.recent li {
		margin-bottom: 0.25rem;
	}
	.small-heading {
		font-family: var(--sans);
		font-size: 0.95rem;
		margin: 1.25rem 0 0.25rem;
	}
</style>
