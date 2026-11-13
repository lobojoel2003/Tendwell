<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	let busy = $state(false);
</script>

<svelte:head>
	<title>Sign in · Tendwell</title>
</svelte:head>

<div class="narrow auth">
	<h1>Welcome back</h1>
	<p class="lede">Sign in to see your plans.</p>

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
			<label for="password">Password</label>
			<input
				id="password"
				name="password"
				type="password"
				autocomplete="current-password"
				required
			/>
		</div>
		<button class="button" type="submit" disabled={busy}>{busy ? 'One moment…' : 'Sign in'}</button>
	</form>

	<p>New here? <a href="/signup?next={encodeURIComponent(data.next)}">Create an account</a></p>
	<details class="small muted">
		<summary>Forgotten your password?</summary>
		<p>
			Tendwell doesn’t send emails, so the person who runs this site can reset it for you. If you
			were invited to a plan, you can also ask for a new invite and create a fresh account.
		</p>
	</details>
</div>

<style>
	.auth form {
		margin: 1.5rem 0;
	}
	details summary {
		cursor: pointer;
	}
</style>
