import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vitest/config';
import { csp } from './csp.config.js';

const languages = ['de-DE', 'en-US'];
const pages = ['start', 'how', 'new', 'random', 'prepare', 'deck', 'play'];

export default defineConfig({
	plugins: [
		sveltekit({
			preprocess: vitePreprocess(),
			// Statischer Export für GitHub Pages: alle Seiten werden zur Build-Zeit vorgerendert.
			adapter: adapter({
				pages: 'build',
				assets: 'build',
				// SPA-Shell für unbekannte Pfade: GitHub Pages liefert 404.html, SvelteKit rendert darin die Fehlerseite.
				fallback: '404.html',
				precompress: false,
				strict: true
			}),
			csp,
			prerender: {
				// Die Sprach-Routen sind über den optionalen Parameter nicht per Crawling auffindbar.
				entries: ['*', ...languages.flatMap((lang) => pages.map((page) => `/${lang}/${page}` as const))]
			}
		})
	],
	test: {
		include: ['src/**/*.test.ts', 'test/**/*.test.ts'],
		environment: 'node'
	}
});
