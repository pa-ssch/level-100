import type { Handle } from '@sveltejs/kit';
import { htmlLang } from '$lib/i18n';

// Setzt das lang-Attribut des Dokuments passend zur Sprach-Route (läuft auch beim Prerendern).
export const handle: Handle = async ({ event, resolve }) => {
	const lang = htmlLang(event.params.language);
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
