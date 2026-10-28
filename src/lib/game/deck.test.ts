import { describe, expect, it } from 'vitest';
import { DECK_PRESETS, allCards, createRandom, dealHand, deckSize } from './deck';

describe('deck', () => {
	it('zählt Karten inklusive Joker', () => {
		expect(deckSize(DECK_PRESETS.standard)).toBe(104);
		expect(deckSize(DECK_PRESETS.poker)).toBe(54);
		expect(allCards(DECK_PRESETS.poker)).toHaveLength(52);
	});

	it('teilt reproduzierbar aus und ohne Karten doppelt zu ziehen', () => {
		const a = dealHand(DECK_PRESETS.standard, 10, createRandom(42));
		const b = dealHand(DECK_PRESETS.standard, 10, createRandom(42));
		expect(a).toEqual(b);
		expect(a.cards.length + a.jokers).toBe(10);
		// Mehr Karten als das Deck hat: Hand ist das ganze Deck.
		const all = dealHand(DECK_PRESETS.poker, 999, createRandom(1));
		expect(all.cards.length + all.jokers).toBe(54);
	});
});
