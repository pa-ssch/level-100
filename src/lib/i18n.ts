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
