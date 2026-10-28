import type { Handle } from '@sveltejs/kit';
import { fixedRouteLanguages, htmlLang } from '$lib/i18n';

// Setzt das lang-Attribut des Dokuments passend zur Sprach-Route (läuft auch beim Prerendern).
export const handle: Handle = async ({ event, resolve }) => {
	const lang = htmlLang(event.params.language ?? fixedRouteLanguages[event.route.id ?? '']);
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang)
	});
};
