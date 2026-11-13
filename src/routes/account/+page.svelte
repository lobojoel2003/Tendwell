<script lang="ts">
	import { enhance } from '$app/forms';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const message = (section: string) => (form?.section === section ? form : null);
</script>

<svelte:head>
	<title>Your account · Tendwell</title>
</svelte:head>

<div class="narrow stack">
	<p class="small"><a href="/plans">← Your plans</a></p>
	<h1>Your account</h1>
	<p class="muted">Signed in as {data.account.email}.</p>

	<form method="POST" action="?/name" class="card" use:enhance>
		<h2>Your name</h2>
		{#if message('name')?.error}<p class="form-error" role="alert">{message('name')?.error}</p>{/if}
		{#if message('name')?.success}<p class="form-success" role="status">
				{message('name')?.success}
			</p>{/if}
		<div class="field">
			<label for="name">Name shown to others in your plans</label>
			<input
				id="name"
				name="name"
				type="text"
				required
				value={data.account.name}
				autocomplete="name"
			/>
		</div>
		<button class="button secondary" type="submit">Save</button>
	</form>

	<form method="POST" action="?/password" class="card" use:enhance>
		<h2>Change password</h2>
		{#if message('password')?.error}<p class="form-error" role="alert">
				{message('password')?.error}
			</p>{/if}
		{#if message('password')?.success}<p class="form-success" role="status">
				{message('password')?.success}
			</p>{/if}
		<div class="field">
			<label for="current">Current password</label>
			<input id="current" name="current" type="password" autocomplete="current-password" required />
		</div>
		<div class="field">
			<label for="next">New password</label>
			<input
				id="next"
				name="next"
				type="password"
				autocomplete="new-password"
				minlength="8"
				required
			/>
		</div>
		<button class="button secondary" type="submit">Change password</button>
	</form>

	<form method="POST" action="/logout" class="card">
		<h2>Sign out</h2>
		<p class="muted">You can sign back in any time. Your plans stay as they are.</p>
		<button class="button secondary" type="submit">Sign out</button>
	</form>

	<details class="card">
		<summary><strong>Delete your account</strong></summary>
		<form method="POST" action="?/delete" use:enhance>
			<p class="muted">
				This removes your account. Plans only you belong to are deleted. Plans you share are kept
				for the others, and passed to the next person if you started them.
			</p>
			{#if message('delete')?.error}<p class="form-error" role="alert">
					{message('delete')?.error}
				</p>{/if}
			<div class="field">
				<label for="delete-password">Your password, to confirm</label>
				<input
					id="delete-password"
					name="password"
					type="password"
					autocomplete="current-password"
					required
				/>
			</div>
			<button class="button danger" type="submit">Delete my account</button>
		</form>
	</details>
</div>

<style>
	details summary {
		cursor: pointer;
	}
	details form {
		margin-top: 1rem;
	}
</style>
