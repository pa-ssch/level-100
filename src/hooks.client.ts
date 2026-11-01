import type { HandleClientError } from '@sveltejs/kit';

// Ein 404 ist auf GitHub Pages der Normalfall für unbekannte Pfade (404.html als SPA-Fallback) und kein
// Programmfehler; alles andere landet wie gewohnt in der Konsole.
export const handleError: HandleClientError = ({ error, status, message }) => {
	if (status !== 404) console.error(error);
	return { message };
};
