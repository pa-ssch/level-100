import type { Page } from '@playwright/test';

export const ROUTES = [
	'/',
	'/de-DE/start',
	'/en-US/start',
	'/de-DE/prepare',
	'/en-US/prepare',
	'/de-DE/play',
	'/en-US/play',
	'/about',
	'/imprint'
];

// WebKit meldet für jedes <select> einen CSP-Verstoß seines eigenen (internen) Stylesheets, sobald style-src ohne
// 'unsafe-inline' gesetzt ist. Das ist ein Browser-Verhalten ohne Bezug zu unserem Code und wird nur dort ignoriert.
const WEBKIT_SELECT_QUIRK = /Refused to apply a stylesheet because its hash, its nonce, or 'unsafe-inline' does not appear/;
// WebKit auf Linux (CI) meldet beim schnellen Überschreiben großer Local-Storage-Werte sporadisch einen I/O-Fehler
// seines Storage-Backends als pageerror; die App fängt Storage-Fehler selbst ab (storage.ts).
const WEBKIT_STORAGE_QUIRK = /NotReadableError: The I\/O read operation failed/;

/** Sammelt Fehler aus der Konsole, unbehandelte Exceptions und CSP-Verstöße. */
export function watchErrors(page: Page, browserName?: string): string[] {
	const errors: string[] = [];
	page.on('console', (msg) => {
		if (browserName === 'webkit' && WEBKIT_SELECT_QUIRK.test(msg.text())) return;
		if (msg.type() === 'error' || /Content Security Policy/i.test(msg.text())) errors.push(`console: ${msg.text()}`);
	});
	page.on('pageerror', (err) => {
		if (browserName === 'webkit' && WEBKIT_STORAGE_QUIRK.test(err.message)) return;
		errors.push(`pageerror: ${err.message}`);
	});
	return errors;
}

/** Local-Storage-Schlüssel, die die Datenschutzerklärung nennt. Alles andere ist ein Verstoß. */
export const ALLOWED_LOCAL_STORAGE_KEYS = ['level100.rulesets', 'level100.game', 'level100.language'];

/** Session-Storage-Einträge von SvelteKit (Scrollposition, Navigationsverlauf); in der Datenschutzerklärung genannt. */
export const ALLOWED_SESSION_STORAGE_KEYS = [
	'sveltekit:scroll',
	'sveltekit:snapshot',
	'sveltekit:history',
	'sveltekit:navigation',
	'sveltekit:pageurl',
	'sveltekit:states'
];
