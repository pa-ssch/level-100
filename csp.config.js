/**
 * Content Security Policy der vorgerenderten Seiten. GitHub Pages kann keine HTTP-Header setzen; SvelteKit schreibt
 * die CSP als <meta>-Tag in jede Seite und ergänzt Hashes für die eigenen Inline-Skripte. Im Dev-Modus lockert
 * SvelteKit die Regeln selbst. Eigene Datei, damit test/csp.test.ts sie ohne die Vite-Konfiguration laden kann.
 * @type {NonNullable<import('@sveltejs/kit/vite').Config['csp']>}
 */
export const csp = {
	mode: 'hash',
	directives: {
		'default-src': ['self'],
		'script-src': ['self'],
		'style-src': ['self'],
		// SvelteKit rendert nach der Hydration einen Screenreader-Ankündiger (#svelte-announcer) mit einem festen
		// style-Attribut. Genau dieser Wert wird per Hash erlaubt; test/csp.test.ts prüft ihn gegen die Kit-Quelle.
		'style-src-attr': ['unsafe-hashes', 'sha256-S8qMpvofolR8Mpjy4kQvEm7m1q8clzU4dfDH0AmvZjo='],
		'img-src': ['self', 'data:'],
		'font-src': ['self'],
		'connect-src': ['self'],
		'object-src': ['none'],
		'base-uri': ['self'],
		'form-action': ['self']
	}
};
