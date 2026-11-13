<script lang="ts">
	import TaskDetails from '#lib/components/TaskDetails.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<svelte:head>
	<title>{data.task.title} · Tendwell</title>
	<meta name="description" content={data.task.summary} />
</svelte:head>

<article class="narrow">
	<p class="small"><a href="/checklist">← The whole checklist</a></p>
	<h1>{data.task.title}</h1>
	<TaskDetails task={data.task} />

	<aside class="panel cta no-print">
		<p>
			<strong>Doing this with family?</strong> Start a plan to tick things off, take on steps, and leave
			notes for each other.
		</p>
		<a class="button" href={data.user ? '/plans/new' : '/signup'}>Start a plan</a>
	</aside>
</article>

<style>
	.cta {
		margin-top: 2.5rem;
		display: flex;
		gap: 1rem;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
	}
	.cta p {
		margin: 0;
		max-width: 28rem;
	}
</style>
