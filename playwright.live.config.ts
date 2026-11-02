import { defineConfig, devices } from '@playwright/test';

// Live-Check: dieselben Tests gegen die veröffentlichte Seite (kein lokaler Server).
export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	retries: 1,
	// Echtes Netz: Seiten und Chunks kommen vom CDN, deshalb mehr Geduld als lokal.
	timeout: 60_000,
	expect: { timeout: 10_000 },
	reporter: process.env.CI ? [['list'], ['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: process.env.LIVE_URL ?? 'https://lvl100.de',
		trace: 'retain-on-failure'
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] } },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] } }
	]
});
