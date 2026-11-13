<script lang="ts">
	import { page } from '$app/state';
</script>

<svelte:head>
	<title>{page.status === 404 ? 'Not found' : 'Something went wrong'} · Tendwell</title>
</svelte:head>

<div class="narrow">
	<p class="eyebrow">{page.status}</p>
	<h1>{page.status === 404 ? 'This page isn’t here' : 'Something went wrong'}</h1>
	<p class="lede">{page.error?.message ?? 'Please try again in a moment.'}</p>
	<p>
		Nothing you did caused this.
		{#if page.status === 404}It may have moved, or the link may be incomplete.{:else}Your plan is
			safe.{/if}
	</p>
	<div class="actions">
		<a class="button" href="/">Go to the start</a>
		<a class="button secondary" href="/checklist">See the checklist</a>
	</div>
</div>
