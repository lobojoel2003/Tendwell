<script lang="ts">
	import { effortLabels } from '#lib/plan.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Tendwell — a gentle guide after a death</title>
</svelte:head>

{#if data.goodbye}
	<p class="container note goodbye" role="status">
		Your account has been deleted. Take good care of yourself.
	</p>
{/if}

<section class="hero container">
	<div class="intro">
		<p class="eyebrow">A gentle guide after a death</p>
		<h1>There’s a lot to sort out. You don’t have to do it all at once.</h1>
		<p class="lede">
			Tendwell shows you only what matters this week, explains each step in plain words, and lets
			your family share the work.
		</p>
		<div class="actions">
			{#if data.user}
				<a class="button" href="/plans">Go to your plans</a>
			{:else}
				<a class="button" href="/signup">Start a plan together</a>
			{/if}
			<a class="button secondary" href="/checklist">Just read, no account needed</a>
		</div>
		<p class="small muted reassure">Free and open source. No ads, and nothing to sell you.</p>
	</div>

	<aside class="preview card" aria-labelledby="three-heading">
		<p class="eyebrow">This week</p>
		<h2 id="three-heading">For now, just these three things</h2>
		<ol>
			{#each data.firstThree as task (task.id)}
				<li>
					<a href="/checklist/{task.id}">{task.title}</a>
					<p class="small muted">{task.summary}</p>
					{#if task.effort}<span class="badge">{effortLabels[task.effort]}</span>{/if}
				</li>
			{/each}
		</ol>
		<p class="small muted later">Everything else can wait. It will be here when you’re ready.</p>
	</aside>
</section>

<section class="container pillars" aria-label="How Tendwell helps">
	<div class="pillar">
		<h2>One week at a time</h2>
		<p>
			Instead of a list of {data.counts.tasks} things, you see the few that matter now. Set anything aside
			with “not this week”. Only real deadlines are marked, and calmly.
		</p>
	</div>
	<div class="pillar">
		<h2>Plain-word guides</h2>
		<p>
			Death certificates, benefits, banks, digital accounts. Each step says why it matters, how to
			do it, and what you can safely leave for later.
		</p>
	</div>
	<div class="pillar">
		<h2>Shared with family</h2>
		<p>
			Invite siblings or friends to the same plan. Anyone can say “I’ll take this”, so nobody does
			the same call twice and nobody carries it all alone.
		</p>
	</div>
</section>

<section class="container letters panel">
	<div>
		<h2>Letters, ready to send</h2>
		<p>
			Fill in a few details and download a clear, polite letter as a PDF: for banks, utilities,
			subscriptions, landlords and more. {data.counts.letters} templates so far.
		</p>
	</div>
	<a class="button secondary" href="/letters">Browse letters</a>
</section>

<section class="container guides">
	<h2>Start with a guide</h2>
	<div class="grid">
		{#each data.guides as guide (guide.slug)}
			<a class="card guide" href="/guides/{guide.slug}">
				<h3>{guide.title}</h3>
				<p class="small muted">{guide.summary}</p>
				<span class="small muted">{guide.minutes} min read</span>
			</a>
		{/each}
	</div>
	<p><a href="/guides">All {data.counts.guides} guides</a></p>
</section>

<style>
	.goodbye {
		margin-bottom: 1.5rem;
	}
	.hero {
		display: grid;
		gap: 2.5rem;
		grid-template-columns: 1.15fr 1fr;
		align-items: start;
		padding-block: 1.5rem 3rem;
	}
	@media (max-width: 860px) {
		.hero {
			grid-template-columns: 1fr;
		}
	}
	.intro h1 {
		font-size: clamp(2.1rem, 1.5rem + 2.4vw, 3.1rem);
		max-width: 20ch;
	}
	.reassure {
		margin-top: 1rem;
	}
	.preview h2 {
		font-size: 1.35rem;
	}
	.preview ol {
		margin: 0.5rem 0 0;
		padding: 0;
		list-style: none;
		counter-reset: three;
	}
	.preview li {
		counter-increment: three;
		position: relative;
		padding: 0.9rem 0 0.9rem 2.6rem;
		border-top: 1px solid var(--line);
	}
	.preview li::before {
		content: counter(three);
		position: absolute;
		left: 0;
		top: 0.95rem;
		width: 1.8rem;
		height: 1.8rem;
		border-radius: 50%;
		background: var(--accent-soft);
		color: var(--accent-strong);
		font-weight: 700;
		display: grid;
		place-items: center;
		font-size: 0.9rem;
	}
	.preview li a {
		font-weight: 600;
		font-size: 1.05rem;
	}
	.preview li p {
		margin: 0.2rem 0 0.4rem;
	}
	.later {
		margin: 0.5rem 0 0;
		padding-top: 0.8rem;
		border-top: 1px solid var(--line);
	}
	.pillars {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 16rem), 1fr));
		gap: 2rem;
		padding-block: 2rem 3rem;
	}
	.pillar h2 {
		font-size: 1.3rem;
	}
	.pillar p {
		color: var(--ink-soft);
	}
	.letters {
		display: flex;
		gap: 1.5rem;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		margin-bottom: 3rem;
	}
	.letters p {
		margin: 0;
		max-width: 40rem;
		color: var(--ink-soft);
	}
	.guide {
		text-decoration: none;
		color: inherit;
		display: block;
	}
	.guide:hover {
		border-color: var(--accent);
	}
	.guide h3 {
		color: var(--ink);
		font-size: 1.15rem;
	}
	.guides p:last-child {
		margin-top: 1.25rem;
	}
</style>
