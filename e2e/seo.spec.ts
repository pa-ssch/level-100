import { expect, test } from '@playwright/test';
import { ROUTES } from './helpers';

const SITE = 'https://lvl100.de';

test('jede Seite hat Titel, Beschreibung, canonical, Open Graph und JSON-LD', async ({ page }) => {
	for (const route of ROUTES) {
		await page.goto(route);
		await expect(page, route).toHaveTitle(/Level 100/);
		expect((await page.getAttribute('meta[name="description"]', 'content'))?.length, route).toBeGreaterThan(50);
		// „/“ leitet clientseitig auf die Sprach-Startseite weiter, deshalb gilt der Pfad nach der Weiterleitung.
		const canonical = await page.getAttribute('link[rel="canonical"]', 'href');
		expect(canonical, route).toBe(SITE + new URL(page.url()).pathname);
		expect(await page.getAttribute('meta[property="og:image"]', 'content'), route).toBe(`${SITE}/icons/og-image.png`);
		expect(await page.getAttribute('meta[property="og:title"]', 'content'), route).toContain('Level 100');
		const ld = await page.locator('script[type="application/ld+json"]').allTextContents();
		expect(ld, route).toHaveLength(1);
		const data = JSON.parse(ld[0]);
		expect((Array.isArray(data) ? data[0] : data)['@type'], route).toBe('WebApplication');
		if (/^\/(de-DE|en-US)\//.test(route)) {
			const alternates = await page
				.locator('link[rel="alternate"][hreflang]')
				.evaluateAll((els) => els.map((e) => e.getAttribute('hreflang')));
			expect(alternates.sort(), route).toEqual(['de', 'en', 'x-default']);
		}
	}
});

test('Meta-Beschreibungen folgen der Sprache der Seite', async ({ page }) => {
	await page.goto('/de-DE/start');
	expect(await page.getAttribute('meta[name="description"]', 'content')).toContain('Regelsätze');
	expect(await page.getAttribute('meta[property="og:locale"]', 'content')).toBe('de_DE');
	await page.goto('/en-US/start');
	expect(await page.getAttribute('meta[name="description"]', 'content')).toContain('rulesets');
});

test('Manifest, Icons, Sitemap, robots.txt und llms.txt sind erreichbar und konsistent', async ({ request }) => {
	const manifest = await request.get('/manifest.webmanifest');
	expect(manifest.status()).toBe(200);
	const m = await manifest.json();
	expect(m.name).toBe('Level 100');
	expect(m.display).toBe('standalone');
	for (const file of [
		...m.icons.map((i: { src: string }) => i.src),
		'/icons/apple-touch-icon.png',
		'/icons/og-image.png',
		'/favicon.png'
	]) {
		expect((await request.get(file)).status(), file).toBe(200);
	}

	const robots = await request.get('/robots.txt');
	expect(await robots.text()).toContain(`Sitemap: ${SITE}/sitemap.xml`);

	const sitemap = await request.get('/sitemap.xml');
	expect(sitemap.status()).toBe(200);
	const xml = await sitemap.text();
	for (const path of ['/de-DE/start', '/en-US/start', '/about', '/imprint']) expect(xml, path).toContain(`<loc>${SITE}${path}</loc>`);
	expect(xml).toContain('hreflang="de"');
	expect(xml).not.toContain('/play');

	const llms = await request.get('/llms.txt');
	expect(llms.status()).toBe(200);
	const text = await llms.text();
	expect(text).toMatch(/^# Level 100/);
	expect(text).toContain('lvl100@9xb.de');
	expect(text).toContain('github.com/pa-ssch/level-100');
});
