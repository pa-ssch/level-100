import { describe, expect, it } from 'vitest';
import { detectLanguage, htmlLang, isLanguage, otherLanguage } from './i18n';

describe('i18n', () => {
	it('erkennt nur die unterstützten Sprachen', () => {
		expect(isLanguage('de-DE')).toBe(true);
		expect(isLanguage('en-US')).toBe(true);
		expect(isLanguage('fr-FR')).toBe(false);
		expect(isLanguage(undefined)).toBe(false);
	});

	it('leitet die Sprache aus der Browsersprache ab', () => {
		expect(detectLanguage('de')).toBe('de-DE');
		expect(detectLanguage('DE-at')).toBe('de-DE');
		expect(detectLanguage('en-GB')).toBe('en-US');
		expect(detectLanguage(undefined)).toBe('en-US');
	});

	it('liefert ein kurzes lang-Attribut mit Fallback', () => {
		expect(htmlLang('de-DE')).toBe('de');
		expect(htmlLang(undefined)).toBe('en');
		expect(htmlLang('xx')).toBe('en');
	});

	it('wechselt zwischen den beiden Sprachen', () => {
		expect(otherLanguage('de-DE')).toBe('en-US');
		expect(otherLanguage('en-US')).toBe('de-DE');
	});
});
