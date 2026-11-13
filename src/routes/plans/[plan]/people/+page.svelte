<script lang="ts">
	import { enhance } from '$app/forms';
	import { formatTimestamp } from '#lib/plan.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();
	const userId = $derived(data.user!.id);
	let copied = $state(false);

	async function copy(link: string) {
		await navigator.clipboard.writeText(link);
		copied = true;
		setTimeout(() => (copied = false), 2500);
	}
</script>

<svelte:head>
	<title>People · {data.plan.personName} · Tendwell</title>
</svelte:head>

<div class="narrow stack">
	<h1>Sharing the work</h1>
	<p class="lede">
		Siblings, a partner, a close friend. Anyone in the plan can see every step, say “I’ll take
		this”, and leave notes.
	</p>

	{#if form && 'error' in form && form.error}<p class="form-error" role="alert">
			{form.error}
		</p>{/if}

	<section class="card">
		<h2>In this plan</h2>
		<ul class="people">
			{#each data.members as member (member.id)}
				<li>
					<span>
						<strong>{member.name}</strong>{#if member.id === userId}&nbsp;(you){/if}
						{#if member.role === 'owner'}<span class="badge">Started the plan</span>{/if}
					</span>
					{#if data.plan.role === 'owner' && member.id !== userId}
						<form method="POST" action="?/remove" use:enhance>
							<input type="hidden" name="member" value={member.id} />
							<button class="button quiet small" type="submit">Remove</button>
						</form>
					{/if}
				</li>
			{/each}
		</ul>
	</section>

	<section class="card">
		<h2>Invite someone</h2>
		<p class="muted">
			Create a private link and send it however suits you: a text, an email, a family group chat. It
			works for 14 days, for anyone who has it, so share it only with people you trust.
		</p>
		{#if form && 'link' in form && form.link}
			<div class="invite" role="status">
				<label for="invite-link" class="small">Your invite link</label>
				<input
					id="invite-link"
					type="text"
					readonly
					value={form.link}
					onfocus={(e) => e.currentTarget.select()}
				/>
				<div class="actions">
					<button class="button secondary small" type="button" onclick={() => copy(form.link)}>
						{copied ? 'Copied' : 'Copy link'}
					</button>
					<span class="small muted">Works until {formatTimestamp(form.expiresAt)}.</span>
				</div>
			</div>
		{:else}
			<form method="POST" action="?/invite" use:enhance>
				<button class="button" type="submit">Create an invite link</button>
			</form>
		{/if}

		{#if data.invites.length}
			<h3 class="small-heading">Links that still work</h3>
			<ul class="invites small">
				{#each data.invites as invite (invite.id)}
					<li>
						<span>
							Created {formatTimestamp(invite.createdAt)}{#if invite.createdBy}&nbsp;by {invite.createdBy}{/if}
							· until {formatTimestamp(invite.expiresAt)}
						</span>
						<form method="POST" action="?/revoke" use:enhance>
							<input type="hidden" name="invite" value={invite.id} />
							<button class="button quiet small" type="submit">Turn off</button>
						</form>
					</li>
				{/each}
			</ul>
		{/if}
	</section>

	<section class="panel">
		<h2>Some ways families share the load</h2>
		<ul class="small">
			<li>One person handles money and accounts; another handles people and the service.</li>
			<li>Whoever lives closest takes the house; whoever is good on the phone takes the calls.</li>
			<li>Leave a note on each step with what you learned, so nobody has to ask twice.</li>
		</ul>
		<p class="small"><a href="/guides/sharing-the-work">Read: sharing the work</a></p>
	</section>

	{#if data.plan.role !== 'owner'}
		<form method="POST" action="?/leave">
			<button class="button quiet small" type="submit">Leave this plan</button>
		</form>
	{/if}
</div>

<style>
	h2 {
		font-size: 1.2rem;
	}
	.people,
	.invites {
		list-style: none;
		padding: 0;
		margin: 0;
	}
	.people li,
	.invites li {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.55rem 0;
		border-bottom: 1px solid var(--line);
	}
	.people li:last-child,
	.invites li:last-child {
		border-bottom: 0;
	}
	.people .badge {
		margin-left: 0.4rem;
	}
	.invite {
		display: grid;
		gap: 0.5rem;
	}
	.invite input {
		max-width: none;
		font-family: ui-monospace, SFMono-Regular, Menlo, monospace;
		font-size: 0.9rem;
	}
	.small-heading {
		font-family: var(--sans);
		font-size: 0.95rem;
		margin-top: 1.5rem;
	}
	.panel ul {
		padding-left: 1.2rem;
	}
</style>
