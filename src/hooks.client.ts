import type { HandleClientError } from '@sveltejs/kit/hooks';

// Ein 404 ist auf GitHub Pages der Normalfall für unbekannte Pfade (404.html als SPA-Fallback) und kein
// Programmfehler. SvelteKit meldet ihn als „framework“-Fehler; nur unerwartete Fehler aus eigenem Code
// landen wie gewohnt in der Konsole. Status und Meldung bleiben die Vorgaben von SvelteKit.
export const handleError: HandleClientError = (input) => {
	if (input.kind === 'unknown') console.error(input.error);
};
