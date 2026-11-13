<script lang="ts">
	import { formatDate } from '#lib/plan.js';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const editUrl = $derived(
		`https://github.com/lobojoel2003/Tendwell/edit/main/content/guides/${data.guide.slug}.md`
	);
</script>

<svelte:head>
	<title>{data.guide.title} · Tendwell</title>
	<meta name="description" content={data.guide.summary} />
</svelte:head>

<article class="narrow">
	<p class="small"><a href="/guides">← All guides</a></p>
	<h1>{data.guide.title}</h1>
	<p class="lede">{data.guide.summary}</p>
	<p class="small muted">
		{data.guide.minutes} min read · Last reviewed {formatDate(data.guide.reviewed)}
	</p>

	<div class="prose body">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- content comes from reviewed Markdown in the repository -->
		{@html data.guide.html}
	</div>

	{#if data.guide.links.length}
		<section class="links">
			<h2>Useful pages elsewhere</h2>
			<ul>
				{#each data.guide.links as link (link.url)}
					<li><a href={link.url} rel="noopener noreferrer" target="_blank">{link.title}</a></li>
				{/each}
			</ul>
		</section>
	{/if}

	{#if data.steps.length}
		<section class="panel steps">
			<h2>Steps this guide helps with</h2>
			<ul>
				{#each data.steps as step (step.id)}
					<li><a href="/checklist/{step.id}">{step.title}</a></li>
				{/each}
			</ul>
		</section>
	{/if}

	<footer class="end">
		{#if data.next}
			<p>Next: <a href="/guides/{data.next.slug}">{data.next.title}</a></p>
		{/if}
		<p class="small muted no-print">
			Something wrong or out of date? <a href={editUrl} rel="noopener noreferrer"
				>Suggest a change</a
			>. This guide is general information, not legal or financial advice. Rules vary by state.
		</p>
	</footer>
</article>

<style>
	.body {
		margin-top: 2rem;
	}
	.links,
	.steps {
		margin-top: 2.5rem;
	}
	.links h2,
	.steps h2 {
		font-size: 1.1rem;
		font-family: var(--sans);
	}
	.steps ul,
	.links ul {
		margin: 0;
		padding-left: 1.1rem;
	}
	.end {
		margin-top: 2.5rem;
		padding-top: 1.25rem;
		border-top: 1px solid var(--line);
	}
</style>
