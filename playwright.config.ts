import { defineConfig, devices } from '@playwright/test';
import { resolve } from 'node:path';

// Der Scan-Test braucht Chromiums Fake-Kamera; e2e/scan.spec.ts schreibt das Video vor dem Browserstart.
const fakeCamera = resolve('test-results/fake-camera.y4m');

// Die E2E-Tests laufen gegen den statischen Build in build/ (vorher `yarn build`), so wie GitHub Pages ihn ausliefert.
export default defineConfig({
	testDir: 'e2e',
	fullyParallel: true,
	forbidOnly: !!process.env.CI,
	retries: process.env.CI ? 1 : 0,
	// In der CI schreibt der github-Reporter Annotationen (Testname + Fehler) in den Workflow-Lauf.
	reporter: process.env.CI ? [['list'], ['github'], ['html', { open: 'never' }]] : 'list',
	use: {
		baseURL: 'http://127.0.0.1:4173',
		trace: 'retain-on-failure'
	},
	webServer: {
		command: 'yarn preview --host 127.0.0.1 --port 4173 --strictPort',
		url: 'http://127.0.0.1:4173/',
		reuseExistingServer: !process.env.CI,
		timeout: 30_000
	},
	projects: [
		{ name: 'chromium', use: { ...devices['Desktop Chrome'] }, testIgnore: /scan\.spec\.ts/ },
		{ name: 'webkit', use: { ...devices['Desktop Safari'] }, testIgnore: /scan\.spec\.ts/ },
		{ name: 'mobile', use: { ...devices['Pixel 7'] }, testIgnore: /scan\.spec\.ts/ },
		{
			name: 'scan',
			testMatch: /scan\.spec\.ts/,
			// Erst nach den anderen Projekten: der Fake-Kamera-Browser bremst parallel laufende Tests aus.
			dependencies: ['chromium', 'webkit', 'mobile'],
			use: {
				...devices['Desktop Chrome'],
				permissions: ['camera'],
				launchOptions: {
					args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream', `--use-file-for-fake-video-capture=${fakeCamera}`]
				}
			}
		}
	]
});
