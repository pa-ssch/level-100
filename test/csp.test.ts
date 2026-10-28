import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import config from '../svelte.config.js';

// SvelteKit rendert #svelte-announcer mit einem festen style-Attribut. Die CSP erlaubt genau dessen Hash;
// ändert ein Kit-Update den Wert, schlägt dieser Test an, bevor die Seite im Browser CSP-Fehler wirft.
describe('CSP', () => {
	it('erlaubt den Hash des style-Attributs von #svelte-announcer', () => {
		const root = readFileSync('node_modules/@sveltejs/kit/src/core/sync/write_root.js', 'utf8');
		const match = root.match(/id="svelte-announcer"[^>]*style="([^"]+)"/);
		expect(match, 'svelte-announcer in Kit-Quelle nicht gefunden').not.toBeNull();
		const hash = 'sha256-' + createHash('sha256').update(match![1]).digest('base64');
		expect(config.kit?.csp?.directives?.['style-src-attr']).toEqual(['unsafe-hashes', hash]);
	});

	it('bleibt ohne unsafe-inline und unsafe-eval', () => {
		const directives = JSON.stringify(config.kit?.csp?.directives);
		expect(directives).not.toContain('unsafe-inline');
		expect(directives).not.toContain('unsafe-eval');
	});
});
