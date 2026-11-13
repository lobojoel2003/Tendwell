<script lang="ts">
	import type { PreparedLetter } from '#lib/letters.js';

	let { letter }: { letter: PreparedLetter } = $props();
</script>

<div class="paper" aria-label="Letter preview">
	{#if letter.senderLines.length}
		<p class="block">
			{#each letter.senderLines as line, i (i)}
				{#if i === 0}<strong>{line}</strong>{:else}{line}{/if}<br />
			{/each}
		</p>
	{:else}
		<p class="block placeholder">Your name and address</p>
	{/if}
	<p class="block">{letter.date}</p>
	{#if letter.recipientLines.length}
		<p class="block">
			{#each letter.recipientLines as line, i (i)}{line}<br />{/each}
		</p>
	{:else}
		<p class="block placeholder">Their name and address</p>
	{/if}
	<p class="block"><strong>Re: {letter.subject}</strong></p>
	{#each letter.paragraphs as paragraph, i (i)}
		<p>
			{#each paragraph as line, j (j)}{line}{#if j < paragraph.length - 1}<br />{/if}{/each}
		</p>
	{/each}
	{#if letter.enclosures.length}
		<p class="enclosures">
			<strong>{letter.enclosures.length === 1 ? 'Enclosure' : 'Enclosures'}</strong><br />
			{#each letter.enclosures as item, i (i)}• {item}<br />{/each}
		</p>
	{/if}
</div>

<style>
	.paper {
		background: #fffefb;
		color: #1d1c1a;
		font-family: 'Times New Roman', Times, var(--serif);
		font-size: 0.98rem;
		line-height: 1.5;
		padding: 2.2rem 2.4rem;
		border-radius: 6px;
		border: 1px solid var(--line);
		box-shadow:
			0 1px 1px rgb(0 0 0 / 0.04),
			0 10px 30px rgb(60 50 40 / 0.12);
		min-height: 28rem;
		overflow-wrap: anywhere;
	}
	.paper p {
		margin: 0 0 0.9rem;
	}
	.block {
		margin-bottom: 1.2rem !important;
	}
	.placeholder {
		color: #9a948b;
		font-style: italic;
	}
	.enclosures {
		margin-top: 1.2rem !important;
	}
	@media (max-width: 520px) {
		.paper {
			padding: 1.4rem 1.2rem;
		}
	}
</style>
