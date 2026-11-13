<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Guides · Tendwell</title>
	<meta
		name="description"
		content="Plain-word guides to what happens after a death: certificates, benefits, banks, digital accounts and looking after yourself."
	/>
</svelte:head>

<div class="container">
	<p class="eyebrow">Guides</p>
	<h1>Plain words for hard weeks</h1>
	<p class="lede">
		Short guides you can read on your phone, in any order. No account needed. Written and checked by
		volunteers, and open for anyone to improve.
	</p>

	<ol class="list">
		{#each data.guides as guide, i (guide.slug)}
			<li>
				<a class="card item" href="/guides/{guide.slug}">
					<span class="number" aria-hidden="true">{i + 1}</span>
					<span>
						<span class="title">{guide.title}</span>
						<span class="small muted summary">{guide.summary}</span>
						<span class="small muted">{guide.minutes} min read</span>
					</span>
				</a>
			</li>
		{/each}
	</ol>
</div>

<style>
	.list {
		list-style: none;
		padding: 0;
		margin: 2rem 0 0;
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fill, minmax(min(100%, 22rem), 1fr));
	}
	.item {
		display: flex;
		gap: 1rem;
		height: 100%;
		color: inherit;
		text-decoration: none;
	}
	.item:hover {
		border-color: var(--accent);
	}
	.number {
		flex: none;
		width: 2rem;
		height: 2rem;
		border-radius: 50%;
		display: grid;
		place-items: center;
		background: var(--accent-soft);
		color: var(--accent-strong);
		font-weight: 700;
		font-size: 0.9rem;
	}
	.title {
		display: block;
		font-family: var(--serif);
		font-weight: 600;
		font-size: 1.2rem;
		color: var(--ink);
		margin-bottom: 0.25rem;
	}
	.summary {
		display: block;
		margin-bottom: 0.4rem;
	}
</style>
