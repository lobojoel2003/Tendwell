<script lang="ts">
	import { buildInfo, versionLabel } from '#lib/build-info.js';
</script>

<footer class="site">
	<div class="container inner">
		<div class="support">
			<p>
				<strong>If you need someone to talk to right now</strong>, you can call or text
				<a href="tel:988">988</a> in the US, any time. It’s free and confidential.
			</p>
		</div>
		<div class="meta">
			<nav aria-label="Footer">
				<a href="/about">About</a>
				<a href="/about#privacy">Privacy</a>
				<a href="/about#contribute">Help improve the guides</a>
				<a href="https://github.com/lobojoel2003/Tendwell" rel="noopener noreferrer">Source code</a>
			</nav>
			<p class="small muted">
				Tendwell is free and open source. Code under
				<a href="https://www.gnu.org/licenses/agpl-3.0.html" rel="noopener noreferrer">AGPL-3.0</a>;
				guides under
				<a href="https://creativecommons.org/licenses/by-sa/4.0/" rel="noopener noreferrer"
					>CC BY-SA 4.0</a
				>. This is general information, not legal or financial advice.
			</p>
			<p class="small muted version" title="Commit {buildInfo.commit}">{versionLabel}</p>
		</div>
	</div>
</footer>

<style>
	footer {
		border-top: 1px solid var(--line);
		background: var(--surface-2);
		padding-block: 2rem 2.5rem;
	}
	.inner {
		display: grid;
		gap: 1.5rem;
	}
	.support p {
		margin: 0;
		max-width: 44rem;
	}
	nav {
		display: flex;
		flex-wrap: wrap;
		gap: 0.4rem 1.2rem;
		margin-bottom: 0.6rem;
	}
	.meta p {
		margin: 0 0 0.3rem;
		max-width: 44rem;
	}
	.version {
		font-variant-numeric: tabular-nums;
	}
</style>
