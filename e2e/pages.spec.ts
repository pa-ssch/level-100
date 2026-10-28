import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { ROUTES, watchErrors } from './helpers';

for (const route of ROUTES) {
	test(`${route}: rendert ohne Fehler und ohne Barrierefreiheits-Verstöße`, async ({ page, browserName }) => {
		const errors = watchErrors(page, browserName);
		const response = await page.goto(route);
		expect(response?.status()).toBe(200);
		await expect(page.locator('main')).toHaveCount(1);
		await expect(page.locator('nav a', { hasText: 'Level 100' })).toBeVisible();
		// Hydration abwarten, damit Fehler aus dem Client-Code auffallen
		await page.waitForLoadState('networkidle');
		expect(errors).toEqual([]);
		const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa']).analyze();
		expect(results.violations.map((v) => `${v.impact}: ${v.id} (${v.nodes.map((n) => n.target.join(' ')).join(', ')})`)).toEqual([]);
	});
}

test('Startseite leitet nach Browsersprache weiter', async ({ browser }) => {
	for (const [locale, expected] of [
		['de-DE', '/de-DE/start'],
		['de-AT', '/de-DE/start'],
		['en-GB', '/en-US/start'],
		['fr-FR', '/en-US/start']
	]) {
		const context = await browser.newContext({ locale });
		const page = await context.newPage();
		await page.goto('/');
		await expect(page).toHaveURL(new RegExp(`${expected}$`));
		await context.close();
	}
});

test('Sprachwechsel im Footer führt auf dieselbe Seite in der anderen Sprache', async ({ page }) => {
	await page.goto('/de-DE/start');
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	await page.getByRole('link', { name: 'English' }).click();
	await expect(page).toHaveURL(/\/en-US\/start$/);
	await expect(page.locator('html')).toHaveAttribute('lang', 'en');
	await page.getByRole('link', { name: 'Deutsch' }).click();
	await expect(page).toHaveURL(/\/de-DE\/start$/);
});

test('Regelsatz-Kacheln führen zu play und prepare, der Regelsatz steckt im Link', async ({ page }) => {
	await page.goto('/en-US/start');
	await expect(page.getByRole('heading', { name: 'Ten classic levels' })).toBeVisible();
	await page.getByRole('link', { name: 'Play: Ten classic levels' }).click();
	await expect(page).toHaveURL(/\/en-US\/play\?r=[A-Za-z0-9_-]{20,}$/);
	await expect(page.getByRole('heading', { name: 'Ten classic levels' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Start game' })).toBeVisible();
	await page.goto('/en-US/start');
	await page.getByRole('link', { name: 'Edit: Ten classic levels' }).click();
	await expect(page).toHaveURL(/\/en-US\/prepare\?r=[A-Za-z0-9_-]{20,}$/);
	await expect(page.getByLabel('Name')).toHaveValue('Ten classic levels');
	await expect(page.getByRole('region', { name: 'Level 1', exact: true })).toContainText('2× three of a kind');
});

test('ungültige Links werden abgefangen', async ({ page }) => {
	const errors = watchErrors(page);
	for (const route of ['/en-US/play?r=2kaputt', '/en-US/prepare?r=1' + 'A'.repeat(50), '/de-DE/play?r=' + 'x'.repeat(5000)]) {
		await page.goto(route);
		await expect(page.getByRole('alert')).toContainText(/valid ruleset|gültigen Regelsatz/);
	}
	await page.goto('/en-US/play');
	await expect(page.getByText('No game open')).toBeVisible();
	expect(errors).toEqual([]);
});

test('unbekannte Pfade zeigen die Fehlerseite', async ({ page }) => {
	const errors = watchErrors(page);
	await page.goto('/does-not-exist');
	await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Back to start' })).toBeVisible();
	// Die 404.html wird mit Status 404 geladen; genau diese Meldung ist erwartet, alles andere nicht.
	expect(errors.filter((e) => !/status of 404/.test(e))).toEqual([]);
});
