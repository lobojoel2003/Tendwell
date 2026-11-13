<script lang="ts">
	import { page } from '$app/state';
	import Logo from './Logo.svelte';

	let { user }: { user: { name: string } | null } = $props();

	const links = [
		{ href: '/checklist', label: 'Checklist' },
		{ href: '/guides', label: 'Guides' },
		{ href: '/letters', label: 'Letters' }
	];

	const current = (href: string) =>
		page.url.pathname === href || page.url.pathname.startsWith(href + '/');
</script>

<header class="site">
	<div class="container bar">
		<a class="brand" href="/" aria-label="Tendwell home">
			<Logo size={34} />
			<span>Tendwell</span>
		</a>
		<nav aria-label="Main">
			<ul>
				{#each links as link (link.href)}
					<li>
						<a href={link.href} aria-current={current(link.href) ? 'page' : undefined}
							>{link.label}</a
						>
					</li>
				{/each}
				{#if user}
					<li>
						<a class="pill" href="/plans" aria-current={current('/plans') ? 'page' : undefined}
							>Your plans</a
						>
					</li>
				{:else}
					<li>
						<a href="/login" aria-current={current('/login') ? 'page' : undefined}>Sign in</a>
					</li>
				{/if}
			</ul>
		</nav>
	</div>
</header>

<style>
	header {
		border-bottom: 1px solid var(--line);
		background: color-mix(in srgb, var(--bg) 92%, transparent);
	}
	.bar {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;
		padding-block: 0.9rem;
	}
	.brand {
		display: inline-flex;
		align-items: center;
		gap: 0.6rem;
		font-family: var(--serif);
		font-size: 1.35rem;
		font-weight: 600;
		color: var(--ink);
		text-decoration: none;
	}
	ul {
		display: flex;
		flex-wrap: wrap;
		gap: 0.25rem 0.4rem;
		list-style: none;
		margin: 0;
		padding: 0;
		align-items: center;
	}
	nav a {
		display: inline-block;
		padding: 0.4rem 0.75rem;
		border-radius: 999px;
		color: var(--ink-soft);
		text-decoration: none;
		font-weight: 500;
	}
	nav a:hover {
		color: var(--ink);
		background: var(--surface-2);
	}
	nav a[aria-current='page'] {
		color: var(--ink);
		background: var(--surface-2);
	}
	nav a.pill {
		color: var(--accent-strong);
		border: 1px solid var(--line-strong);
	}
	@media (max-width: 600px) {
		.bar {
			gap: 0.5rem;
			padding-block: 0.7rem 0.6rem;
		}
		.brand {
			font-size: 1.2rem;
		}
		nav {
			width: 100%;
		}
		ul {
			flex-wrap: nowrap;
			justify-content: space-between;
			gap: 0.1rem;
		}
		nav a {
			padding: 0.3rem 0.55rem;
			font-size: 0.95rem;
		}
	}
</style>
