<script lang="ts">
	import { effortLabels } from '#lib/plan.js';
	import type { TaskView } from '#lib/server/views.js';

	let { task, letterQuery = '' }: { task: TaskView; letterQuery?: string } = $props();
</script>

<div class="meta">
	<span class="badge calm">{task.phaseTitle}</span>
	{#if task.effort}<span class="badge">{effortLabels[task.effort]}</span>{/if}
	{#if task.oftenDoneBy}<span class="badge">{task.oftenDoneBy}</span>{/if}
</div>

{#if task.timeSensitive}
	<p class="deadline" role="note">
		<span class="badge attention">Has a deadline</span>
		{task.timeSensitive}
	</p>
{/if}

<p class="lede summary">{task.summary}</p>

{#if task.html}
	<div class="prose">
		<!-- eslint-disable-next-line svelte/no-at-html-tags -- content comes from reviewed Markdown in the repository -->
		{@html task.html}
	</div>
{/if}

{#if task.relatedLetters.length || task.relatedGuides.length || task.links.length}
	<div class="related">
		{#if task.relatedLetters.length}
			<section>
				<h2>Letters that help</h2>
				<ul>
					{#each task.relatedLetters as letter (letter.slug)}
						<li><a href="/letters/{letter.slug}{letterQuery}">{letter.title}</a></li>
					{/each}
				</ul>
			</section>
		{/if}
		{#if task.relatedGuides.length}
			<section>
				<h2>Read more</h2>
				<ul>
					{#each task.relatedGuides as guide (guide.slug)}
						<li>
							<a href="/guides/{guide.slug}">{guide.title}</a>
							<span class="muted small">· {guide.minutes} min</span>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
		{#if task.links.length}
			<section>
				<h2>Useful pages elsewhere</h2>
				<ul>
					{#each task.links as link (link.url)}
						<li>
							<a href={link.url} rel="noopener noreferrer" target="_blank">{link.title}</a>
						</li>
					{/each}
				</ul>
			</section>
		{/if}
	</div>
{/if}

<style>
	.meta {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		margin-bottom: 1rem;
	}
	.deadline {
		display: flex;
		flex-wrap: wrap;
		gap: 0.6rem;
		align-items: baseline;
		background: var(--attention-soft);
		color: var(--ink);
		padding: 0.75rem 1rem;
		border-radius: var(--radius-small);
		max-width: var(--measure);
	}
	.summary {
		max-width: var(--measure);
	}
	.related {
		display: grid;
		gap: 1.5rem;
		grid-template-columns: repeat(auto-fit, minmax(min(100%, 14rem), 1fr));
		margin-top: 2.5rem;
		padding-top: 1.5rem;
		border-top: 1px solid var(--line);
	}
	.related h2 {
		font-size: 1.05rem;
		font-family: var(--sans);
	}
	.related ul {
		margin: 0;
		padding-left: 1.1rem;
	}
	.related li {
		margin-bottom: 0.35rem;
	}
</style>
