<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let busy = $state(false);
</script>

<svelte:head>
	<title>Start a plan · Tendwell</title>
</svelte:head>

<div class="narrow auth">
	<h1>Start a plan</h1>
	<p class="lede">
		An account lets you keep track of what’s done and share the plan with family. Reading the guides
		never needs one.
	</p>

	<form
		method="POST"
		class="card"
		use:enhance={() => {
			busy = true;
			return async ({ update }) => {
				await update();
				busy = false;
			};
		}}
	>
		{#if form?.error}<p class="form-error" role="alert">{form.error}</p>{/if}
		<input type="hidden" name="next" value={data.next} />
		<div class="field">
			<label for="name">Your name</label>
			<span class="hint" id="name-hint">This is how you’ll appear to others in your plan.</span>
			<input
				id="name"
				name="name"
				type="text"
				autocomplete="name"
				required
				value={form?.name}
				aria-describedby="name-hint"
			/>
		</div>
		<div class="field">
			<label for="email">Email</label>
			<input
				id="email"
				name="email"
				type="email"
				autocomplete="email"
				required
				value={form?.email}
			/>
		</div>
		<div class="field">
			<label for="password">Choose a password</label>
			<span class="hint" id="password-hint"
				>At least 8 characters. A short phrase is easy to remember.</span
			>
			<input
				id="password"
				name="password"
				type="password"
				autocomplete="new-password"
				minlength="8"
				required
				aria-describedby="password-hint"
			/>
		</div>
		<button class="button" type="submit" disabled={busy}
			>{busy ? 'One moment…' : 'Create account'}</button
		>
		<p class="small muted fine">
			We only use your email to sign you in. We never send marketing, and we never share it.
		</p>
	</form>

	<p>Already have an account? <a href="/login?next={encodeURIComponent(data.next)}">Sign in</a></p>
</div>

<style>
	.auth form {
		margin: 1.5rem 0;
	}
	.fine {
		margin: 1rem 0 0;
	}
</style>
