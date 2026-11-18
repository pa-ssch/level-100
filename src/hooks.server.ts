import type { Handle } from '@sveltejs/kit/hooks';
import { fixedRouteLanguages, htmlLang } from '#lib/i18n.ts';
import { jsonLd } from '#lib/seo.ts';

// Setzt das lang-Attribut und die strukturierten Daten (JSON-LD) je Seite; läuft beim Prerendern.
export const handle: Handle = async ({ event, resolve }) => {
	const lang = htmlLang(event.params.language ?? fixedRouteLanguages[event.route.id ?? '']);
	const ld = jsonLd(event.route.id ?? '', event.params.language);
	return resolve(event, {
		transformPageChunk: ({ html }) => html.replace('%lang%', lang).replace('%jsonld%', ld)
	});
};
