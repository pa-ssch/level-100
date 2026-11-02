import { describe, expect, it } from 'vitest';
import { DECK_PRESETS } from './deck';
import { estimateDifficulty } from './difficulty';
import { DIFFICULTY_RANGE, LEVELS_PER_DURATION, candidateLevels, generateLevels, rerollLevel } from './generator';
import { validateLevel } from './ruleset';

describe('generator', () => {
	const deck = DECK_PRESETS.standard;
	const candidates = candidateLevels(deck, 10);

	it('liefert genug Kandidaten in vertretbarer Zeit', () => {
		const t = Date.now();
		candidateLevels(deck, 10);
		expect(Date.now() - t).toBeLessThan(3000);
		expect(candidates.length).toBeGreaterThan(40);
		for (const c of candidates) expect(validateLevel({ requirements: c.requirements, handSize: 10 }, deck)).not.toBeNull();
	});

	it('würfelt deterministisch, aufsteigend, ohne Dubletten und im Bereich', () => {
		for (const preset of ['easy', 'medium', 'hard'] as const) {
			const levels = generateLevels(deck, 10, LEVELS_PER_DURATION.medium, preset, 42, candidates);
			const again = generateLevels(deck, 10, LEVELS_PER_DURATION.medium, preset, 42, candidates);
			expect(again).toEqual(levels);
			expect(levels).toHaveLength(8);
			const keys = new Set(levels.map((l) => JSON.stringify(l.requirements)));
			expect(keys.size).toBe(8);
			const difficulties = levels.map((l) => estimateDifficulty(deck, 10, l.requirements, 150).difficulty!);
			for (let i = 1; i < difficulties.length; i++) expect(difficulties[i]).toBeGreaterThanOrEqual(difficulties[i - 1]);
			const [lo, hi] = DIFFICULTY_RANGE[preset];
			for (const d of difficulties) {
				expect(d).toBeGreaterThanOrEqual(lo);
				expect(d).toBeLessThanOrEqual(hi);
			}
		}
		expect(generateLevels(deck, 10, 8, 'medium', 1, candidates)).not.toEqual(generateLevels(deck, 10, 8, 'medium', 2, candidates));
	});

	it('würfelt ein einzelnes Level neu, ohne Dublette', () => {
		const levels = generateLevels(deck, 10, 6, 'medium', 7, candidates);
		const replaced = rerollLevel(levels, 2, deck, 99, candidates);
		expect(replaced.handSize).toBe(10);
		expect(levels.map((l) => JSON.stringify(l.requirements))).not.toContain(JSON.stringify(replaced.requirements));
	});

	it('kommt mit kleinen Decks zurecht', () => {
		const tiny = { minValue: 1, maxValue: 5, suits: 2, copies: 1, jokers: 0 };
		const levels = generateLevels(tiny, 6, 4, 'hard', 3);
		expect(levels.length).toBeGreaterThan(0);
		expect(levels.length).toBeLessThanOrEqual(4);
	});
});
