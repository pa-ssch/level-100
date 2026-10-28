import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

const languages = ['de-DE', 'en-US'];
const pages = ['start', 'prepare', 'play'];

/** @type {import('@sveltejs/kit').Config} */
const config = {
	preprocess: vitePreprocess(),

	kit: {
		// Statischer Export für GitHub Pages: alle Seiten werden zur Build-Zeit vorgerendert.
		adapter: adapter({
			pages: 'build',
			assets: 'build',
			// SPA-Shell für unbekannte Pfade: GitHub Pages liefert 404.html, SvelteKit rendert darin die Fehlerseite.
			fallback: '404.html',
			precompress: false,
			strict: true
		}),
		// GitHub Pages kann keine HTTP-Header setzen; SvelteKit schreibt die CSP als <meta>-Tag in jede vorgerenderte Seite
		// und ergänzt Hashes für die eigenen Inline-Skripte. Im Dev-Modus lockert SvelteKit die Regeln selbst.
		csp: {
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
		},
		prerender: {
			// Die Sprach-Routen sind über den optionalen Parameter nicht per Crawling auffindbar.
			entries: ['*', ...languages.flatMap((lang) => pages.map((page) => /** @type {`/${string}`} */ (`/${lang}/${page}`)))]
		}
	}
};

export default config;
