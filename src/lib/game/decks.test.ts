import { describe, expect, it } from 'vitest';
import { DECK_PRESETS } from './deck';
import { createSavedDeck, defaultHandSize, defaultJokers, handSizeAfterDeckChange, presetOf, validateSavedDeck } from './decks';

describe('decks', () => {
	it('kennt Standard-Handkarten und Vorlagen', () => {
		expect(defaultHandSize(DECK_PRESETS.standard)).toBe(10);
		expect(defaultHandSize(DECK_PRESETS.poker)).toBe(7);
		expect(defaultHandSize({ minValue: 1, maxValue: 3, suits: 1, copies: 1, jokers: 0 })).toBe(3);
		expect(presetOf(DECK_PRESETS.poker)).toBe('poker');
		expect(presetOf({ ...DECK_PRESETS.poker, jokers: 3 })).toBeNull();
		expect(defaultJokers(1)).toBe(2);
		expect(defaultJokers(2)).toBe(4);
	});

	it('übernimmt Handkarten beim Deckwechsel sinnvoll', () => {
		const { standard, poker } = DECK_PRESETS;
		const tiny = { minValue: 1, maxValue: 3, suits: 2, copies: 1, jokers: 0 };
		// Standardwert nie geändert: Standard des neuen Decks
		expect(handSizeAfterDeckChange(10, standard, poker)).toBe(7);
		expect(handSizeAfterDeckChange(7, poker, standard)).toBe(10);
		// Eigener Wert bleibt, aber nie mehr als das Deck hergibt
		expect(handSizeAfterDeckChange(12, standard, poker)).toBe(12);
		expect(handSizeAfterDeckChange(12, standard, tiny)).toBe(6);
	});

	it('validiert gespeicherte Decks', () => {
		const d = createSavedDeck({ name: 'Skat', deck: { minValue: 7, maxValue: 14, suits: 4, copies: 1, jokers: 0 } });
		expect(validateSavedDeck(d)).toEqual(d);
		// Ältere Einträge mit Handkarten werden ohne sie übernommen
		expect(validateSavedDeck({ ...d, handSize: 10 })).toEqual(d);
		expect(validateSavedDeck({ ...d, name: 'x'.repeat(41) })).toBeNull();
		expect(validateSavedDeck({ ...d, deck: { ...d.deck, suits: 0 } })).toBeNull();
		expect(validateSavedDeck(null)).toBeNull();
	});
});
