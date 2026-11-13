<script lang="ts">
	let { size = 32 }: { size?: number } = $props();
</script>

<svg width={size} height={size} viewBox="0 0 64 64" aria-hidden="true" focusable="false">
	<circle cx="32" cy="32" r="31" class="disc" />
	<path d="M32 50V31" class="stem" stroke-width="3.2" stroke-linecap="round" fill="none" />
	<path d="M31.5 35.5c-9.6 0-16-6.4-16-16 9.6 0 16 6.4 16 16z" class="leaf" />
	<path d="M32.5 31c8 0 14-5.6 14-14-8 0-14 5.6-14 14z" class="leaf2" />
</svg>

<style>
	.disc {
		fill: var(--accent);
	}
	.stem {
		stroke: var(--bg);
	}
	.leaf {
		fill: var(--bg);
	}
	.leaf2 {
		fill: var(--accent-soft);
	}
</style>
