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
			fallback: undefined,
			precompress: false,
			strict: true
		}),
		prerender: {
			// Die Sprach-Routen sind über den optionalen Parameter nicht per Crawling auffindbar.
			entries: ['*', ...languages.flatMap((lang) => pages.map((page) => `/${lang}/${page}`))]
		}
	}
};

export default config;
