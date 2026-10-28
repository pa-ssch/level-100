export const languages = ['de-DE', 'en-US'] as const;
export type Language = (typeof languages)[number];
export const defaultLanguage: Language = 'en-US';

export function isLanguage(value: unknown): value is Language {
	return typeof value === 'string' && (languages as readonly string[]).includes(value);
}

/** Wählt anhand der Browsersprache die passende App-Sprache. */
export function detectLanguage(navigatorLanguage: string | undefined): Language {
	return navigatorLanguage?.toLowerCase().startsWith('de') ? 'de-DE' : defaultLanguage;
}

/** Kurzes lang-Attribut für das HTML-Dokument (`de` / `en`). */
export function htmlLang(language: string | undefined): string {
	return (isLanguage(language) ? language : defaultLanguage).slice(0, 2);
}

export function otherLanguage(language: Language): Language {
	return language === 'de-DE' ? 'en-US' : 'de-DE';
}

/** Sprache des HTML-Dokuments für Seiten außerhalb der Sprach-Routen. */
export const fixedRouteLanguages: Record<string, Language> = {
	'/imprint': 'de-DE'
};

const footerLabels = {
	'de-DE': { about: 'Über', imprint: 'Impressum & Datenschutz' },
	'en-US': { about: 'About', imprint: 'Imprint & Privacy' }
} as const;

export function footerLabel(language: string | undefined, key: keyof (typeof footerLabels)['de-DE']): string {
	return footerLabels[isLanguage(language) ? language : defaultLanguage][key];
}
