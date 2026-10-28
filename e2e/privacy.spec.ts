import { expect, test } from '@playwright/test';
import { ALLOWED_LOCAL_STORAGE_KEYS, ALLOWED_SESSION_STORAGE_KEYS, ROUTES, watchErrors } from './helpers';

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
	await page.getByRole('link', { name: 'Play: Ten classic levels' }).click();
	await page.getByRole('button', { name: 'Start game' }).click();
	await page.getByRole('button', { name: 'Invite players' }).click();
	await expect(page.getByRole('img', { name: /QR code/ })).toBeVisible();
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

test.describe('Kaputter Speicher stürzt nicht ab', () => {
	const BAD = [
		'null',
		'5',
		'{}',
		'"text"',
		'[1,2]',
		'[null]',
		'{kaputt',
		'',
		'[]',
		JSON.stringify(Array(3000).fill('x')),
		'{"v":1,"players":[]}'
	];
	for (const key of ALLOWED_LOCAL_STORAGE_KEYS) {
		test(`${key}: Start- und Spielseite funktionieren trotzdem`, async ({ page, browserName }) => {
			const errors = watchErrors(page, browserName);
			await page.goto('/en-US/start');
			for (const bad of BAD) {
				await page.evaluate(([k, v]) => localStorage.setItem(k, v), [key, bad]);
				await page.goto('/en-US/start');
				await expect(page.getByRole('link', { name: 'New ruleset' }), `${key}=${bad.slice(0, 20)}`).toBeVisible();
				await page.goto('/en-US/play');
				await expect(page.locator('main h1, main p').first(), `${key}=${bad.slice(0, 20)}`).toBeVisible();
			}
			expect(errors).toEqual([]);
			await page.evaluate(() => localStorage.clear());
		});
	}
});
