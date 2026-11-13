<script lang="ts">
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const base = $derived(`/plans/${data.plan.id}`);
	const tabs = $derived([
		{ href: base, label: 'This week', exact: true },
		{ href: `${base}/tasks`, label: 'Everything' },
		{ href: `${base}/accounts`, label: 'Accounts' },
		{ href: `${base}/people`, label: 'People' },
		{ href: `${base}/settings`, label: 'Settings' }
	]);
	const isCurrent = (tab: { href: string; exact?: boolean }) =>
		tab.exact ? page.url.pathname === tab.href : page.url.pathname.startsWith(tab.href);
</script>

<div class="container">
	<div class="plan-head">
		<p class="eyebrow">
			<a href="/plans">Your plans</a>
		</p>
		<p class="title">Looking after things for <strong>{data.plan.personName}</strong></p>
		<nav aria-label="Plan" class="tabs no-print">
			{#each tabs as tab (tab.href)}
				<a href={tab.href} aria-current={isCurrent(tab) ? 'page' : undefined}>{tab.label}</a>
			{/each}
		</nav>
	</div>
	{@render children()}
</div>

<style>
	.plan-head {
		border-bottom: 1px solid var(--line);
		margin-bottom: 2rem;
	}
	.eyebrow a {
		color: inherit;
		text-decoration: none;
	}
	.eyebrow a:hover {
		text-decoration: underline;
	}
	.title {
		font-family: var(--serif);
		font-size: 1.25rem;
		margin: 0 0 0.75rem;
	}
	.tabs {
		display: flex;
		gap: 0.2rem;
		overflow-x: auto;
		margin-bottom: -1px;
	}
	.tabs {
		scrollbar-width: none;
	}
	.tabs a {
		padding: 0.55rem 0.9rem;
		color: var(--ink-soft);
		text-decoration: none;
		border-bottom: 2px solid transparent;
		white-space: nowrap;
		font-weight: 500;
	}
	.tabs a:hover {
		color: var(--ink);
	}
	@media (max-width: 600px) {
		.tabs a {
			padding: 0.5rem 0.6rem;
			font-size: 0.95rem;
		}
	}
	.tabs a[aria-current='page'] {
		color: var(--ink);
		border-bottom-color: var(--accent);
	}
</style>
