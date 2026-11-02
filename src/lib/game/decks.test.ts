import { describe, expect, it } from 'vitest';
import { DECK_PRESETS } from './deck';
import { createSavedDeck, defaultHandSize, presetOf, validateSavedDeck } from './decks';

describe('decks', () => {
	it('kennt Standard-Handkarten und Vorlagen', () => {
		expect(defaultHandSize(DECK_PRESETS.standard)).toBe(10);
		expect(defaultHandSize(DECK_PRESETS.poker)).toBe(7);
		expect(defaultHandSize({ minValue: 1, maxValue: 3, suits: 1, copies: 1, jokers: 0 })).toBe(3);
		expect(presetOf(DECK_PRESETS.poker)).toBe('poker');
		expect(presetOf({ ...DECK_PRESETS.poker, jokers: 3 })).toBeNull();
	});

	it('validiert gespeicherte Decks', () => {
		const d = createSavedDeck({ name: 'Skat', deck: { minValue: 7, maxValue: 14, suits: 4, copies: 1, jokers: 0 } });
		expect(d.handSize).toBe(10);
		expect(validateSavedDeck(d)).toEqual(d);
		expect(validateSavedDeck({ ...d, handSize: 99 })).toEqual({ ...d, handSize: 10 });
		expect(validateSavedDeck({ ...d, name: 'x'.repeat(41) })).toBeNull();
		expect(validateSavedDeck({ ...d, deck: { ...d.deck, suits: 0 } })).toBeNull();
		expect(validateSavedDeck(null)).toBeNull();
	});
});
