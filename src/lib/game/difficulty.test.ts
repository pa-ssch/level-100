import { describe, expect, it } from 'vitest';
import { DECK_PRESETS } from './deck';
import { difficultyFromProbability, estimateDifficulty } from './difficulty';

describe('difficulty', () => {
	it('skaliert logarithmisch von 1 bis 10', () => {
		expect(difficultyFromProbability(1)).toBe(1);
		expect(difficultyFromProbability(0.1)).toBe(4);
		expect(difficultyFromProbability(0.01)).toBe(7);
		expect(difficultyFromProbability(0.001)).toBe(10);
		expect(difficultyFromProbability(0)).toBe(10);
	});

	it('ordnet Level plausibel: ein Paar ist leichter als zwei Vierlinge', () => {
		const deck = DECK_PRESETS.standard;
		const pair = estimateDifficulty(deck, 10, [{ kind: 'set', size: 2, count: 1 }], 200);
		const twoQuads = estimateDifficulty(deck, 10, [{ kind: 'set', size: 4, count: 2 }], 200);
		const run9 = estimateDifficulty(deck, 10, [{ kind: 'run', length: 9, count: 1, sameSuit: false }], 200);
		expect(pair.probability).toBeGreaterThan(0.9);
		expect(twoQuads.probability).toBeLessThan(pair.probability);
		expect(run9.difficulty!).toBeGreaterThan(pair.difficulty!);
	});

	it('ist deterministisch und erkennt Unmögliches und Freitext', () => {
		const deck = DECK_PRESETS.poker;
		const a = estimateDifficulty(deck, 7, [{ kind: 'flush', size: 5 }], 100, 7);
		const b = estimateDifficulty(deck, 7, [{ kind: 'flush', size: 5 }], 100, 7);
		expect(a).toEqual(b);
		expect(estimateDifficulty(deck, 7, [{ kind: 'set', size: 4, count: 2 }]).difficulty).toBe(10);
		expect(estimateDifficulty(deck, 7, [{ kind: 'custom', text: 'x' }]).difficulty).toBeUndefined();
	});
});
