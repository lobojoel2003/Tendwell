import { defineConfig } from 'vitest/config';
import adapter from '@sveltejs/adapter-node';
import { sveltekit } from '@sveltejs/kit/vite';
import { execSync } from 'node:child_process';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8'));

function gitCommit(): string {
	const fromEnv = process.env.GIT_COMMIT || process.env.GITHUB_SHA;
	if (fromEnv) return fromEnv;
	try {
		return execSync('git rev-parse HEAD', { stdio: ['ignore', 'pipe', 'ignore'] })
			.toString()
			.trim();
	} catch {
		return 'unknown';
	}
}

/** Version, build number and commit, shown in the footer and at /healthz. */
const build = {
	version: process.env.TENDWELL_VERSION || pkg.version,
	number: process.env.BUILD_NUMBER || process.env.GITHUB_RUN_NUMBER || 'local',
	commit: gitCommit().slice(0, 12),
	date: new Date().toISOString()
};

export default defineConfig({
	define: {
		__TENDWELL_BUILD__: JSON.stringify(build)
	},
	plugins: [
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter({ precompress: true }),
			version: { name: `${build.version}+${build.number}` },
			csp: {
				mode: 'auto',
				directives: {
					'default-src': ['self'],
					'script-src': ['self'],
					'style-src': ['self', 'unsafe-inline'],
					'img-src': ['self', 'data:'],
					'font-src': ['self'],
					'connect-src': ['self'],
					'form-action': ['self'],
					'frame-ancestors': ['none'],
					'base-uri': ['self'],
					'object-src': ['none']
				}
			}
		})
	],
	test: {
		expect: { requireAssertions: true },
		projects: [
			{
				extends: './vite.config.ts',
				test: {
					name: 'unit',
					environment: 'node',
					include: ['src/**/*.{test,spec}.{js,ts}'],
					exclude: ['src/**/*.svelte.{test,spec}.{js,ts}', 'src/lib/content/content.spec.ts']
				}
			},
			{
				extends: './vite.config.ts',
				test: {
					name: 'content',
					environment: 'node',
					include: ['src/lib/content/content.spec.ts']
				}
			}
		]
	}
});
