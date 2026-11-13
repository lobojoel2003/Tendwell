<script lang="ts">
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>Letters · Tendwell</title>
	<meta
		name="description"
		content="Free letter templates for telling banks, utilities, landlords and others about a death. Download as PDF."
	/>
</svelte:head>

<div class="container">
	<p class="eyebrow">Letters</p>
	<h1>Letters you can send</h1>
	<p class="lede">
		Fill in a few details, check the preview, and download a PDF to print or attach to an email.
		What you type isn’t saved anywhere.
	</p>

	<ul class="grid letters">
		{#each data.letters as letter (letter.slug)}
			<li>
				<a class="card item" href="/letters/{letter.slug}{data.query}">
					<span class="title">{letter.title}</span>
					<span class="small muted">{letter.summary}</span>
					<span class="small to">To: {letter.recipient}</span>
				</a>
			</li>
		{/each}
	</ul>

	<p class="muted small more">
		Many organizations also have an online form or a bereavement phone line. A letter is still
		useful as a record of what you asked for, and when.
	</p>
</div>

<style>
	.letters {
		list-style: none;
		padding: 0;
		margin: 2rem 0;
	}
	.item {
		display: flex;
		flex-direction: column;
		gap: 0.4rem;
		height: 100%;
		color: inherit;
		text-decoration: none;
	}
	.item:hover {
		border-color: var(--accent);
	}
	.title {
		font-family: var(--serif);
		font-weight: 600;
		font-size: 1.2rem;
		color: var(--ink);
	}
	.to {
		margin-top: auto;
		color: var(--ink-faint);
	}
	.more {
		max-width: 40rem;
	}
</style>
