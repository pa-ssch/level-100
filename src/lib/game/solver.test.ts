import { describe, expect, it } from 'vitest';
import { DECK_PRESETS, type Hand } from './deck';
import type { Requirement } from './requirements';
import { satisfies } from './solver';

const deck = DECK_PRESETS.standard;
const hand = (cards: [number, number][], jokers = 0): Hand => ({ cards: cards.map(([value, suit]) => ({ value, suit })), jokers });

describe('solver', () => {
	it('erkennt Gruppen gleichen Werts, auch mit Jokern', () => {
		const twoSets: Requirement[] = [{ kind: 'set', size: 3, count: 2 }];
		expect(
			satisfies(
				hand([
					[5, 0],
					[5, 1],
					[5, 2],
					[9, 0],
					[9, 1],
					[9, 3]
				]),
				twoSets,
				deck
			)
		).toBe(true);
		expect(
			satisfies(
				hand([
					[5, 0],
					[5, 1],
					[5, 2],
					[9, 0],
					[9, 1]
				]),
				twoSets,
				deck
			)
		).toBe(false);
		expect(
			satisfies(
				hand(
					[
						[5, 0],
						[5, 1],
						[5, 2],
						[9, 0],
						[9, 1]
					],
					1
				),
				twoSets,
				deck
			)
		).toBe(true);
		// Zwei Drillinge desselben Werts sind erlaubt, wenn genug Karten da sind
		expect(
			satisfies(
				hand([
					[5, 0],
					[5, 1],
					[5, 2],
					[5, 3],
					[5, 0],
					[5, 1]
				]),
				twoSets,
				deck
			)
		).toBe(true);
	});

	it('verlangt mindestens eine echte Karte je Gruppe', () => {
		expect(satisfies(hand([[1, 0]], 3), [{ kind: 'set', size: 3, count: 1 }], deck)).toBe(true);
		expect(satisfies(hand([], 3), [{ kind: 'set', size: 3, count: 1 }], deck)).toBe(false);
	});

	it('erkennt Folgen, Farbfolgen und Joker-Lücken', () => {
		const run4: Requirement[] = [{ kind: 'run', length: 4, count: 1, sameSuit: false }];
		expect(
			satisfies(
				hand([
					[3, 0],
					[4, 1],
					[5, 2],
					[6, 3]
				]),
				run4,
				deck
			)
		).toBe(true);
		expect(
			satisfies(
				hand(
					[
						[3, 0],
						[4, 1],
						[6, 3]
					],
					1
				),
				run4,
				deck
			)
		).toBe(true);
		expect(
			satisfies(
				hand(
					[
						[3, 0],
						[4, 1],
						[7, 3]
					],
					1
				),
				run4,
				deck
			)
		).toBe(false);
		const flushRun: Requirement[] = [{ kind: 'run', length: 4, count: 1, sameSuit: true }];
		expect(
			satisfies(
				hand([
					[3, 0],
					[4, 1],
					[5, 2],
					[6, 3]
				]),
				flushRun,
				deck
			)
		).toBe(false);
		expect(
			satisfies(
				hand([
					[3, 2],
					[4, 2],
					[5, 2],
					[6, 2]
				]),
				flushRun,
				deck
			)
		).toBe(true);
		// Folge darf nicht über das Deck-Ende hinaus (12 ist Maximum)
		expect(
			satisfies(
				hand(
					[
						[11, 0],
						[12, 1]
					],
					2
				),
				run4,
				deck
			)
		).toBe(true);
		expect(satisfies(hand([[12, 0]], 3), run4, deck)).toBe(true);
	});

	it('teilt Karten zwischen Gruppen sinnvoll auf', () => {
		const level: Requirement[] = [
			{ kind: 'set', size: 3, count: 1 },
			{ kind: 'run', length: 4, count: 1, sameSuit: false }
		];
		// Drilling 5-5-5, Folge 2-3-4 + Joker
		expect(
			satisfies(
				hand(
					[
						[5, 0],
						[5, 1],
						[5, 2],
						[2, 0],
						[3, 0],
						[4, 0]
					],
					1
				),
				level,
				deck
			)
		).toBe(true);
		expect(
			satisfies(
				hand([
					[5, 0],
					[5, 1],
					[5, 2],
					[2, 0],
					[3, 0],
					[4, 0]
				]),
				level,
				deck
			)
		).toBe(false);
		// Backtracking: der Drilling muss die 4en nehmen, damit 3-4-5 als Folge übrig bleibt
		const small: Requirement[] = [
			{ kind: 'set', size: 2, count: 1 },
			{ kind: 'run', length: 3, count: 1, sameSuit: false }
		];
		expect(
			satisfies(
				hand([
					[3, 0],
					[3, 1],
					[4, 0],
					[4, 1],
					[4, 2],
					[5, 0]
				]),
				small,
				deck
			)
		).toBe(true);
		expect(
			satisfies(
				hand([
					[3, 0],
					[3, 1],
					[4, 0],
					[4, 1],
					[5, 0]
				]),
				small,
				deck
			)
		).toBe(false);
	});

	it('erkennt Farben und Parität', () => {
		expect(
			satisfies(
				hand([
					[1, 2],
					[4, 2],
					[7, 2],
					[9, 2]
				]),
				[{ kind: 'flush', size: 4 }],
				deck
			)
		).toBe(true);
		expect(
			satisfies(
				hand([
					[1, 2],
					[4, 2],
					[7, 2],
					[9, 1]
				]),
				[{ kind: 'flush', size: 4 }],
				deck
			)
		).toBe(false);
		expect(
			satisfies(
				hand([
					[2, 0],
					[4, 1],
					[6, 2]
				]),
				[{ kind: 'parity', size: 3, parity: 'even' }],
				deck
			)
		).toBe(true);
		expect(
			satisfies(
				hand([
					[2, 0],
					[4, 1],
					[7, 2]
				]),
				[{ kind: 'parity', size: 3, parity: 'even' }],
				deck
			)
		).toBe(false);
		expect(
			satisfies(
				hand(
					[
						[1, 0],
						[3, 1]
					],
					1
				),
				[{ kind: 'parity', size: 3, parity: 'odd' }],
				deck
			)
		).toBe(true);
	});

	it('ignoriert Freitext-Anforderungen und fremde Karten', () => {
		expect(satisfies(hand([[1, 0]]), [{ kind: 'custom', text: 'Ein Affe' }], deck)).toBe(true);
		expect(
			satisfies(
				hand([
					[99, 0],
					[1, 7]
				]),
				[{ kind: 'set', size: 2, count: 1 }],
				deck
			)
		).toBe(false);
	});
});
