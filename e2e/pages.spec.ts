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

test('Regelsatz-Kacheln führen zu play und prepare', async ({ page }) => {
	await page.goto('/en-US/start');
	await page.getByRole('button', { name: 'play' }).first().click();
	await expect(page).toHaveURL(/\/en-US\/play\?r=[0-9a-f-]{36}$/);
	await expect(page.getByText(/Playing ruleset/)).toBeVisible();
	await page.goto('/en-US/start');
	await page.getByRole('button', { name: 'edit' }).first().click();
	await expect(page).toHaveURL(/\/en-US\/prepare\?r=[0-9a-f-]{36}$/);
});

test('unbekannte Pfade zeigen die Fehlerseite', async ({ page }) => {
	const errors = watchErrors(page);
	await page.goto('/does-not-exist');
	await expect(page.getByRole('heading', { name: '404' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'Back to start' })).toBeVisible();
	// Die 404.html wird mit Status 404 geladen; genau diese Meldung ist erwartet, alles andere nicht.
	expect(errors.filter((e) => !/status of 404/.test(e))).toEqual([]);
});
