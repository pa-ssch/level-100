import { describe, expect, it } from 'vitest';
import { CardDeck, Ruleset } from './ruleset';

describe('Ruleset', () => {
	it('hat sinnvolle Standardwerte und eine eindeutige ID', () => {
		const a = new Ruleset();
		const b = new Ruleset();
		expect(a.name).toBe('New Game');
		expect(a.cardDeck).toEqual(new CardDeck(12, 4));
		expect(a.handCardCountPerLevel).toHaveLength(10);
		expect(a.id).not.toBe(b.id);
	});

	it('kopiert tief und vergibt eine neue ID', () => {
		const original = new Ruleset('Contract Rummy', undefined, new CardDeck(13, 4), [10, 10, 12]);
		const copy = original.copy();
		expect(copy.id).not.toBe(original.id);
		expect(copy.name).toBe('New Game');
		expect(copy.cardDeck).toEqual(original.cardDeck);
		expect(copy.cardDeck).not.toBe(original.cardDeck);
		expect(copy.handCardCountPerLevel).toEqual(original.handCardCountPerLevel);
		copy.handCardCountPerLevel.push(12);
		expect(original.handCardCountPerLevel).toHaveLength(3);
	});
});
