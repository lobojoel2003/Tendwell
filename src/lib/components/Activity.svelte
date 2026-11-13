<script lang="ts">
	import { firstName, timeAgo } from '#lib/plan.js';

	type Entry = {
		id: number;
		kind: string;
		subject: string;
		createdAt: number;
		userId: string | null;
		userName: string | null;
	};
	let { entries, userId }: { entries: Entry[]; userId: string } = $props();

	const who = (e: Entry) =>
		e.userId === userId ? 'You' : e.userName ? firstName(e.userName) : 'Someone';
	const verbs: Record<string, string> = {
		created: 'started this plan',
		done: 'finished',
		skipped: 'set aside as not needed',
		claimed: 'is taking care of',
		added: 'added a step:',
		note: 'left a note on',
		joined: 'joined the plan',
		account_added: 'added an account:',
		account_closed: 'closed'
	};
</script>

<ul class="activity">
	{#each entries as e (e.id)}
		<li>
			<span>
				<strong>{who(e)}</strong>
				{e.kind === 'claimed' && e.userId === userId
					? 'are taking care of'
					: (verbs[e.kind] ?? e.kind)}
				{#if e.subject}<span class="subject">“{e.subject}”</span>{/if}
			</span>
			<span class="small muted when">{timeAgo(e.createdAt)}</span>
		</li>
	{/each}
</ul>

<style>
	.activity {
		list-style: none;
		margin: 0;
		padding: 0;
	}
	li {
		display: flex;
		justify-content: space-between;
		gap: 1rem;
		padding: 0.55rem 0;
		border-bottom: 1px solid var(--line);
		font-size: 0.95rem;
	}
	li:last-child {
		border-bottom: 0;
	}
	.when {
		white-space: nowrap;
	}
	.subject {
		color: var(--ink-soft);
	}
</style>
