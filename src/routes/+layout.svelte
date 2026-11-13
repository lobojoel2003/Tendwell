<script lang="ts">
	import '../app.css';
	import Header from '#lib/components/Header.svelte';
	import Footer from '#lib/components/Footer.svelte';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<title>Tendwell — a gentle guide after a death</title>
	<meta
		name="description"
		content="Tendwell shows you only what matters this week after someone dies, explains each step in plain words, and lets family share the work."
	/>
</svelte:head>

<a class="skip-link" href="#main">Skip to main content</a>

<Header user={data.user} />

<main id="main" tabindex="-1">
	{@render children()}
</main>

<Footer />

<style>
	.skip-link {
		position: absolute;
		left: 1rem;
		top: 1rem;
		z-index: 10;
		background: var(--surface);
		padding: 0.5rem 0.9rem;
		border-radius: var(--radius-small);
		box-shadow: var(--shadow);
		transform: translateY(-200%);
		opacity: 0;
	}
	.skip-link:focus {
		transform: none;
		opacity: 1;
	}
	main:focus {
		outline: none;
	}
</style>
