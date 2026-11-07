import { expect, test } from '@playwright/test';

test('Anleitung ist von der Startseite erreichbar und führt zurück', async ({ page }) => {
	await page.goto('/de-DE/start');
	await page.getByRole('link', { name: 'Wie geht das?' }).click();
	await expect(page).toHaveURL(/\/de-DE\/how$/);
	await expect(page.getByRole('heading', { name: 'So geht’s' })).toBeVisible();
	await expect(page.getByRole('listitem')).toHaveCount(5);
	await page.getByRole('link', { name: 'Alles klar' }).click();
	await expect(page).toHaveURL(/\/de-DE\/start$/);
});

test('die Handschrift wird selbst gehostet und geladen', async ({ page, request }) => {
	expect((await request.get('/fonts/patrick-hand-latin.woff2')).status()).toBe(200);
	expect((await request.get('/fonts/OFL.txt')).status()).toBe(200);
	await page.goto('/en-US/start');
	await page.evaluate(() => document.fonts.ready);
	expect(await page.evaluate(() => document.fonts.check("16px 'Patrick Hand'"))).toBe(true);
});
