import { expect, test } from '@playwright/test';
import { ALLOWED_LOCAL_STORAGE_KEYS, ALLOWED_SESSION_STORAGE_KEYS, ROUTES } from './helpers';

// Was die Datenschutzerklärung verspricht, wird hier gegen das tatsächliche Verhalten geprüft.

test('kein Request verlässt die eigene Origin', async ({ page, baseURL }) => {
	const origin = new URL(baseURL!).origin;
	const foreign: string[] = [];
	page.on('request', (r) => {
		if (new URL(r.url()).origin !== origin) foreign.push(r.url());
	});
	for (const route of ROUTES) {
		await page.goto(route);
		await page.waitForLoadState('networkidle');
	}
	await page.goto('/en-US/start');
	await page.getByRole('button', { name: 'play' }).first().click();
	await page.waitForLoadState('networkidle');
	expect(foreign).toEqual([]);
});

test('keine Cookies, nur dokumentierte Local- und Session-Storage-Einträge', async ({ page, context }) => {
	for (const route of ROUTES) await page.goto(route);
	expect(await context.cookies()).toEqual([]);
	expect(await page.evaluate(() => document.cookie)).toBe('');
	const storage = await page.evaluate(() => ({ local: Object.keys(localStorage).sort(), session: Object.keys(sessionStorage).sort() }));
	for (const key of storage.local) expect(ALLOWED_LOCAL_STORAGE_KEYS, `undokumentierter Local-Storage-Eintrag: ${key}`).toContain(key);
	for (const key of storage.session)
		expect(ALLOWED_SESSION_STORAGE_KEYS, `undokumentierter Session-Storage-Eintrag: ${key}`).toContain(key);
});

test('jede Seite trägt eine CSP ohne unsafe-inline und erlaubt Zoom', async ({ page }) => {
	for (const route of ROUTES) {
		await page.goto(route);
		const csp = await page.getAttribute('meta[http-equiv="content-security-policy" i]', 'content');
		expect(csp, route).toContain("default-src 'self'");
		expect(csp, route).toContain("object-src 'none'");
		expect(csp, route).not.toContain('unsafe-inline');
		expect(csp, route).not.toContain('unsafe-eval');
		const viewport = await page.getAttribute('meta[name="viewport"]', 'content');
		expect(viewport, route).not.toMatch(/user-scalable=no|maximum-scale/);
		expect(await page.getAttribute('meta[name="referrer"]', 'content')).toBe('strict-origin-when-cross-origin');
	}
});

test('keine Inline-Styles oder -Event-Handler im ausgelieferten HTML', async ({ request }) => {
	for (const route of ROUTES) {
		const html = await (await request.get(route)).text();
		expect(html.match(/\sstyle\s*=\s*"/gi), `${route}: style-Attribut`).toBeNull();
		expect(html.match(/\son[a-z]+\s*=\s*"/gi), `${route}: Inline-Event-Handler`).toBeNull();
	}
});
