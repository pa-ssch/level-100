import { describe, expect, it } from 'vitest';
import { describeLevel, describeRequirement, detectLanguage, footerLabel, htmlLang, isLanguage, otherLanguage, t } from './i18n';

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

	it('liefert Footer-Beschriftungen je Sprache mit Fallback', () => {
		expect(footerLabel('de-DE', 'imprint')).toBe('Impressum & Datenschutz');
		expect(footerLabel('en-US', 'imprint')).toBe('Imprint & Privacy');
		expect(footerLabel(undefined, 'about')).toBe('About');
	});

	it('ersetzt Platzhalter', () => {
		expect(t('de-DE', 'level', { n: 3 })).toBe('Level 3');
		expect(t('en-US', 'deleteConfirm', { name: 'X' })).toBe('Delete ruleset “X”?');
	});

	it('beschreibt Anforderungen lesbar', () => {
		expect(describeRequirement('de-DE', { kind: 'set', size: 3, count: 2 })).toBe('Zwei Drillinge');
		expect(describeRequirement('de-DE', { kind: 'set', size: 4, count: 1, value: 8 })).toBe('Vierling aus 8en');
		expect(describeRequirement('de-DE', { kind: 'run', length: 4, count: 1, sameSuit: true })).toBe('Vierer-Farbfolge');
		expect(describeRequirement('de-DE', { kind: 'run', length: 7, count: 2, sameSuit: false })).toBe('Zwei Siebener-Folgen');
		expect(describeRequirement('de-DE', { kind: 'flush', size: 7 })).toBe('7 Karten einer Farbe');
		expect(describeRequirement('de-DE', { kind: 'parity', size: 7, parity: 'odd' })).toBe('7 ungerade Karten');
		expect(describeRequirement('en-US', { kind: 'set', size: 3, count: 2 })).toBe('2× three of a kind');
		expect(describeRequirement('en-US', { kind: 'run', length: 5, count: 1, sameSuit: true })).toBe('run of 5 in one suit');
		expect(describeRequirement('en-US', { kind: 'custom', text: 'A monkey' })).toBe('A monkey');
		expect(
			describeLevel('de-DE', [
				{ kind: 'set', size: 3, count: 1 },
				{ kind: 'run', length: 4, count: 1, sameSuit: false }
			])
		).toBe('Drilling + Vierer-Folge');
	});
});
