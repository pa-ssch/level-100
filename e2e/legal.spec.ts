import { expect, test } from '@playwright/test';

test('Impressum ist aus dem Footer erreichbar und enthält die Pflichtangaben', async ({ page }) => {
	await page.goto('/de-DE/start');
	await page.getByRole('link', { name: 'Impressum & Datenschutz' }).click();
	await expect(page).toHaveURL(/\/imprint$/);
	await expect(page).toHaveTitle(/Impressum/);
	await expect(page.locator('html')).toHaveAttribute('lang', 'de');
	const text = await page.locator('main').innerText();
	for (const s of [
		'§ 5 DDG',
		'9xb',
		'Silas Schnurr',
		'Theodor-Heuss-Straße 14',
		'77815 Bühl',
		'nicht kommerzielles Angebot',
		'Haftungsausschluss',
		'Phase 10',
		'Datenschutzerklärung',
		'GitHub Pages',
		'Data Privacy Framework',
		'Local Storage',
		'TDDDG',
		'Font Awesome',
		'Stand: '
	]) {
		expect(text, s).toContain(s);
	}
	expect(text).not.toMatch(/TMG|\[Kontakt|TODO|Platzhalter/);
	await expect(page.locator('a[href="mailto:info@9xb.de"]').first()).toBeVisible();
	await page.getByRole('link', { name: 'Zurück zum Spiel' }).click();
	// „/“ leitet nach Browsersprache weiter
	await expect(page).toHaveURL(/\/(de-DE|en-US)\/start$/);
});

test('About ist zweisprachig und verlinkt das Impressum', async ({ page }) => {
	await page.goto('/en-US/start');
	await page.getByRole('link', { name: 'About' }).click();
	await expect(page).toHaveURL(/\/about$/);
	await expect(page.getByRole('heading', { name: 'About Level 100' })).toBeVisible();
	await expect(page.getByRole('heading', { name: 'Über Level 100' })).toBeVisible();
	await expect(page.locator('section[lang="en"]')).toContainText('not affiliated');
	await page.getByRole('link', { name: 'Impressum' }).click();
	await expect(page).toHaveURL(/\/imprint$/);
});

test('robots.txt und CNAME werden ausgeliefert', async ({ request }) => {
	const robots = await request.get('/robots.txt');
	expect(robots.status()).toBe(200);
	expect(await robots.text()).toContain('User-agent: *');
	expect((await request.get('/CNAME')).status()).toBe(200);
});
