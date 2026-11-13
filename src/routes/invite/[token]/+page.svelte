<script lang="ts">
	import { page } from '$app/state';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
	const here = $derived(encodeURIComponent(page.url.pathname));
</script>

<svelte:head>
	<title>You’ve been invited · Tendwell</title>
</svelte:head>

<div class="narrow">
	<p class="eyebrow">An invitation</p>
	<h1>
		{data.invite.invitedBy ?? 'Someone'} has asked you to help with the plan for {data.invite
			.personName}
	</h1>
	<p class="lede">
		You’ll see the same steps they do, and you can take some on. Nobody has to carry this alone.
	</p>

	{#if data.user}
		<form method="POST" class="card">
			<p>You’re signed in as <strong>{data.user.name}</strong>.</p>
			<button class="button" type="submit">Join the plan</button>
		</form>
	{:else}
		<div class="card">
			<p>To join, create a free account or sign in. It takes a minute.</p>
			<div class="actions">
				<a class="button" href="/signup?next={here}">Create an account</a>
				<a class="button secondary" href="/login?next={here}">I have an account</a>
			</div>
		</div>
	{/if}
</div>

<style>
	.card {
		margin-top: 1.5rem;
	}
</style>
