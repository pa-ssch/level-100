import { CONTACT_EMAIL, REPO_URL, SITE_NAME, SITE_URL } from './site';
import { isLanguage } from './i18n';

/**
 * Strukturierte Daten (schema.org) als JSON-LD für Suchmaschinen und KI-Crawler. Ein Script mit
 * type="application/ld+json" wird nicht ausgeführt und fällt deshalb nicht unter die CSP.
 */
export function jsonLd(routeId: string, language: string | undefined): string {
	const de = isLanguage(language) && language === 'de-DE';
	const organization = {
		'@type': 'Organization',
		name: '9xb',
		email: CONTACT_EMAIL,
		url: SITE_URL
	};
	const app = {
		'@context': 'https://schema.org',
		'@type': 'WebApplication',
		name: SITE_NAME,
		url: SITE_URL,
		applicationCategory: 'GameApplication',
		operatingSystem: 'Any (web browser)',
		browserRequirements: 'Requires JavaScript',
		inLanguage: ['de', 'en'],
		isAccessibleForFree: true,
		offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
		description: de
			? 'Eigene Regelsätze für Kartenspiele mit Stufen erstellen, als Link oder QR-Code teilen und beim Spielen mit echten Karten Level und Punkte aller Mitspieler verfolgen. Läuft vollständig im Browser.'
			: 'Create your own rulesets for level-based card games, share them as a link or QR code and track every player’s level and score while playing with real cards. Runs entirely in your browser.',
		image: `${SITE_URL}/icons/og-image.png`,
		license: 'https://opensource.org/licenses/MIT',
		codeRepository: REPO_URL,
		author: organization,
		publisher: organization
	};
	const graph: Record<string, unknown>[] = [app];
	if (routeId === '/imprint' || routeId === '/about') {
		graph.push({
			'@context': 'https://schema.org',
			'@type': routeId === '/about' ? 'AboutPage' : 'WebPage',
			name: routeId === '/about' ? 'About Level 100' : 'Impressum & Datenschutz',
			url: SITE_URL + routeId,
			isPartOf: { '@type': 'WebSite', name: SITE_NAME, url: SITE_URL },
			inLanguage: routeId === '/imprint' ? 'de' : ['en', 'de']
		});
	}
	// "</" darf in einem Script-Element nicht vorkommen; JSON-LD enthält hier keine Nutzereingaben.
	const json = JSON.stringify(graph.length === 1 ? app : graph).replace(/</g, '\\u003c');
	return `<script type="application/ld+json">${json}</script>`;
}
