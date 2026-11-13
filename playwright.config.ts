import { defineConfig, devices } from '@playwright/test';

const port = Number(process.env.E2E_PORT ?? 4173);
const ci = Boolean(process.env.CI);

export default defineConfig({
	testDir: 'tests/e2e',
	testMatch: '**/*.e2e.ts',
	fullyParallel: true,
	forbidOnly: ci,
	retries: ci ? 1 : 0,
	reporter: ci ? [['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: `http://localhost:${port}`,
		trace: 'off',
		launchOptions: {
			// Lets you point at an already installed Chromium instead of running `playwright install`.
			executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined
		}
	},
	projects: [
		{ name: 'desktop', use: { ...devices['Desktop Chrome'] } },
		{ name: 'mobile', use: { ...devices['Pixel 7'] }, testMatch: ['**/public.e2e.ts'] }
	],
	webServer: {
		command: process.env.E2E_SKIP_BUILD ? 'node build' : 'npm run build && node build',
		port,
		reuseExistingServer: !ci,
		timeout: 180_000,
		env: {
			PORT: String(port),
			ORIGIN: `http://localhost:${port}`,
			DATABASE_PATH: `test-results/e2e-${Date.now()}.db`
		}
	}
});
