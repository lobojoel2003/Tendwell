<script lang="ts">
	import { onMount } from 'svelte';
	import LetterPreview from '#lib/components/LetterPreview.svelte';
	import { letterAsText, prepareLetter } from '#lib/letters.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	// Start from what was posted (no-JS preview) or what we could fill in for you.
	const startingValues = (): Record<string, string> => {
		const start: Record<string, string | undefined> = form?.values ?? data.initial;
		return Object.fromEntries(data.letter.fields.map((f) => [f.id, start[f.id] ?? '']));
	};
	let values = $state(startingValues());

	const prepared = $derived(prepareLetter(data.letter, values));
	let enhanced = $state(false);
	let copied = $state(false);
	onMount(() => (enhanced = true));

	async function copyText() {
		await navigator.clipboard.writeText(letterAsText(prepared));
		copied = true;
		setTimeout(() => (copied = false), 2500);
	}
</script>

<svelte:head>
	<title>{data.letter.title} · Letters · Tendwell</title>
	<meta name="description" content={data.letter.summary} />
</svelte:head>

<div class="container">
	<p class="small no-print"><a href="/letters">← All letters</a></p>
	<h1>{data.letter.title}</h1>
	<p class="lede">{data.letter.summary}</p>
	{#if data.plan}
		<p class="note small">
			We’ve filled in what we know from the plan for {data.plan.personName}. Check it’s right.
		</p>
	{/if}

	<div class="layout">
		<form method="POST" action="?/preview" class="fields no-print" aria-label="Letter details">
			<p class="small muted">
				Addressed to: {data.letter.recipient}. Fields marked “optional” can be left blank.
			</p>
			{#each data.letter.fields as field (field.id)}
				<div class="field">
					<label for="f-{field.id}">
						{field.label}
						{#if !field.required}<span class="hint">(optional)</span>{/if}
					</label>
					{#if field.help}<span class="hint" id="h-{field.id}">{field.help}</span>{/if}
					{#if field.type === 'textarea'}
						<textarea
							id="f-{field.id}"
							name={field.id}
							rows="3"
							required={field.required}
							placeholder={field.placeholder}
							aria-describedby={field.help ? `h-${field.id}` : undefined}
							bind:value={values[field.id]}></textarea>
					{:else}
						<input
							id="f-{field.id}"
							name={field.id}
							type={field.type}
							required={field.required}
							placeholder={field.placeholder}
							aria-describedby={field.help ? `h-${field.id}` : undefined}
							autocomplete={field.id === 'sender_name'
								? 'name'
								: field.id === 'sender_email'
									? 'email'
									: field.id === 'sender_phone'
										? 'tel'
										: 'off'}
							bind:value={values[field.id]}
						/>
					{/if}
				</div>
			{/each}

			<div class="actions sticky">
				<button class="button" type="submit" formaction="/letters/{data.letter.slug}/pdf">
					Download PDF
				</button>
				{#if enhanced}
					<button class="button secondary" type="button" onclick={copyText}>
						{copied ? 'Copied' : 'Copy as text'}
					</button>
					<button class="button quiet" type="button" onclick={() => window.print()}>Print</button>
				{:else}
					<button class="button secondary" type="submit" formnovalidate>Update preview</button>
				{/if}
			</div>
			<p class="small muted" aria-live="polite">
				{#if prepared.missing.length}
					Still needed: {prepared.missing.map((f) => f.label.toLowerCase()).join(', ')}.
				{:else}
					Everything needed is filled in.
				{/if}
			</p>
		</form>

		<section class="preview" aria-label="Preview">
			<p class="eyebrow no-print">Preview</p>
			<LetterPreview letter={prepared} />
			<p class="small muted no-print tip">
				Tip: send a copy of the death certificate, not the original, unless they ask for one. Keep a
				note of when you sent it.
			</p>
		</section>
	</div>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 22rem) minmax(0, 1fr);
		gap: 2.5rem;
		margin-top: 2rem;
		align-items: start;
	}
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
	.preview {
		position: sticky;
		top: 1rem;
	}
	@media (max-width: 900px) {
		.preview {
			position: static;
		}
	}
	.sticky {
		position: sticky;
		bottom: 0;
		background: var(--bg);
		padding-block: 0.8rem;
		border-top: 1px solid var(--line);
	}
	.tip {
		margin-top: 1rem;
	}
	@media print {
		.layout {
			display: block;
		}
		h1,
		.lede,
		.note {
			display: none;
		}
	}
</style>
