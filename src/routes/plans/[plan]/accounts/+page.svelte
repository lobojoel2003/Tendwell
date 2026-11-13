<script lang="ts">
	import { enhance } from '$app/forms';
	import { accountKinds, accountStatuses, firstName, type AccountStatus } from '#lib/plan.js';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const names = $derived(Object.fromEntries(data.members.map((m) => [m.id, m.name])));
	const userId = $derived(data.user!.id);
	const groups = $derived(
		(Object.keys(accountStatuses) as AccountStatus[]).map((status) => ({
			status,
			label: accountStatuses[status],
			accounts: data.accounts.filter((a) => a.status === status)
		}))
	);
	const nextStatus: Record<AccountStatus, { value: AccountStatus; label: string } | null> = {
		to_contact: { value: 'contacted', label: 'I’ve contacted them' },
		contacted: { value: 'closed', label: 'It’s closed' },
		closed: null
	};

	const letterLink = (a: { letter: string | null; name: string; reference: string }) => {
		if (!a.letter) return null;
		const query = [
			['plan', data.plan.id],
			['recipient_name', a.name],
			...(a.reference ? [['account_number', a.reference]] : [])
		]
			.map(([k, v]) => `${k}=${encodeURIComponent(v)}`)
			.join('&');
		return `/letters/${a.letter}?${query}`;
	};
</script>

<svelte:head>
	<title>Accounts · {data.plan.personName} · Tendwell</title>
</svelte:head>

<div class="layout">
	<div>
		<h1>Accounts and subscriptions</h1>
		<p class="lede">
			Add them as you find them: a bank statement, a card in a wallet, an email receipt. Then close
			them one at a time.
		</p>

		{#if data.accounts.length === 0}
			<div class="panel empty">
				<p><strong>Not sure where to start?</strong> Places people often find accounts:</p>
				<ul class="small">
					<li>Bank statements: look for regular payments going out</li>
					<li>Their email inbox: search for “receipt”, “renewal” or “subscription”</li>
					<li>Their wallet or purse, and any paperwork at home</li>
					<li>Their phone: apps, and the subscriptions list in the app store settings</li>
				</ul>
			</div>
		{/if}

		{#each groups as group (group.status)}
			{#if group.accounts.length}
				<section class="group" aria-labelledby="g-{group.status}">
					<h2 id="g-{group.status}">
						{group.label} <span class="count">{group.accounts.length}</span>
					</h2>
					<ul class="accounts">
						{#each group.accounts as account (account.id)}
							<li class="card account" class:closed={account.status === 'closed'}>
								<div class="info">
									<h3>{account.name}</h3>
									<p class="small muted">
										{accountKinds[account.kind]}{#if account.reference}&nbsp;· ref. {account.reference}{/if}
										{#if account.assigneeId === userId}· <strong>You’re handling this</strong>
										{:else if account.assigneeId}· {firstName(
												names[account.assigneeId] ?? 'Someone'
											)} is handling this{/if}
									</p>
									{#if account.notes}<p class="small notes">{account.notes}</p>{/if}
								</div>
								<form method="POST" class="controls" use:enhance>
									<input type="hidden" name="account" value={account.id} />
									{#if nextStatus[account.status]}
										<button
											class="button small"
											formaction="?/status"
											name="status"
											value={nextStatus[account.status]?.value}
										>
											{nextStatus[account.status]?.label}
										</button>
									{:else}
										<button
											class="button quiet small"
											formaction="?/status"
											name="status"
											value="contacted">Reopen</button
										>
									{/if}
									{#if account.status !== 'closed'}
										{#if account.assigneeId === userId}
											<button
												class="button quiet small"
												formaction="?/claim"
												name="assign"
												value="none">Hand back</button
											>
										{:else if !account.assigneeId}
											<button
												class="button secondary small"
												formaction="?/claim"
												name="assign"
												value="me">I’ll handle it</button
											>
										{/if}
										{@const link = letterLink(account)}
										{#if link}<a class="button quiet small" href={link}>Write a letter</a>{/if}
									{/if}
									<details class="more">
										<summary class="button quiet small">More</summary>
										<div class="more-panel">
											<label for="n-{account.id}" class="small">Notes</label>
											<textarea id="n-{account.id}" name="notes" rows="2">{account.notes}</textarea>
											<div class="actions">
												<button class="button secondary small" formaction="?/notes"
													>Save notes</button
												>
												<button class="button danger small" formaction="?/delete">Remove</button>
											</div>
										</div>
									</details>
								</form>
							</li>
						{/each}
					</ul>
				</section>
			{/if}
		{/each}
	</div>

	<aside>
		<form method="POST" action="?/add" class="card add" use:enhance>
			<h2>Add an account</h2>
			{#if form && 'error' in form && form.error}<p class="form-error" role="alert">
					{form.error}
				</p>{/if}
			{#if form && 'added' in form}<p class="form-success" role="status">
					Added {form.added}.
				</p>{/if}
			<div class="field">
				<label for="name">Name</label>
				<input
					id="name"
					name="name"
					type="text"
					required
					maxlength="120"
					placeholder="Chase checking, Netflix, gas…"
				/>
			</div>
			<div class="field">
				<label for="kind">Kind</label>
				<select id="kind" name="kind">
					{#each Object.entries(accountKinds) as [value, label] (value)}
						<option {value}>{label}</option>
					{/each}
				</select>
			</div>
			<div class="field">
				<label for="reference">Reference <span class="hint">(optional)</span></label>
				<span class="hint" id="ref-hint"
					>The last four digits are enough. Please don’t store full card numbers.</span
				>
				<input
					id="reference"
					name="reference"
					type="text"
					maxlength="60"
					aria-describedby="ref-hint"
					autocomplete="off"
				/>
			</div>
			<div class="field">
				<label for="notes">Notes <span class="hint">(optional)</span></label>
				<textarea id="notes" name="notes" rows="2" maxlength="1000"></textarea>
			</div>
			<button class="button" type="submit">Add to the list</button>
		</form>
	</aside>
</div>

<style>
	.layout {
		display: grid;
		grid-template-columns: minmax(0, 1fr) 20rem;
		gap: 2.5rem;
		align-items: start;
	}
	@media (max-width: 900px) {
		.layout {
			grid-template-columns: 1fr;
		}
	}
	.empty ul {
		margin: 0;
		padding-left: 1.2rem;
	}
	.group {
		margin-top: 2rem;
	}
	.group h2 {
		font-size: 1.2rem;
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}
	.count {
		font-family: var(--sans);
		font-size: 0.85rem;
		background: var(--surface-2);
		border-radius: 999px;
		padding: 0.1rem 0.55rem;
		color: var(--ink-soft);
	}
	.accounts {
		list-style: none;
		padding: 0;
		margin: 0;
		display: grid;
		gap: 0.75rem;
	}
	.account {
		display: grid;
		grid-template-columns: 1fr auto;
		gap: 0.75rem 1rem;
		align-items: start;
	}
	@media (max-width: 640px) {
		.account {
			grid-template-columns: 1fr;
		}
	}
	.account h3 {
		font-family: var(--sans);
		font-size: 1.05rem;
		margin: 0;
	}
	.account p {
		margin: 0.15rem 0 0;
	}
	.notes {
		white-space: pre-line;
		color: var(--ink-soft);
	}
	.closed {
		background: var(--surface-2);
		box-shadow: none;
	}
	.closed h3 {
		color: var(--ink-soft);
		text-decoration: line-through;
		text-decoration-color: var(--line-strong);
	}
	.controls {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem;
		justify-content: flex-end;
		align-items: flex-start;
	}
	.more {
		position: relative;
	}
	.more summary {
		list-style: none;
	}
	.more summary::-webkit-details-marker {
		display: none;
	}
	.more-panel {
		margin-top: 0.5rem;
		min-width: 16rem;
		display: grid;
		gap: 0.4rem;
	}
	aside {
		position: sticky;
		top: 1rem;
	}
	@media (max-width: 900px) {
		aside {
			position: static;
			order: -1;
		}
	}
	.add h2 {
		font-size: 1.2rem;
	}
</style>
