import { describe, expect, it } from 'vitest';
import { applyRound, createGame, currentLevel, isFinished, openLevels, restartGame } from './game';
import { exampleRulesets } from './ruleset';

describe('game', () => {
	it('führt Level und eigene Punkte im festen Modus', () => {
		const ruleset = exampleRulesets('en-US')[1];
		let game = createGame(ruleset);
		expect(currentLevel(game)).toBe(0);
		expect(openLevels(game)).toEqual([0]);
		game = applyRound(game, { completed: 0, points: 0 });
		expect(currentLevel(game)).toBe(1);
		game = applyRound(game, { completed: null, points: 25 });
		expect(game.points).toBe(25);
		expect(currentLevel(game)).toBe(1);
		expect(isFinished(game)).toBe(false);
		for (let i = 1; i < ruleset.levels.length; i++) game = applyRound(game, { completed: i, points: 5 });
		expect(isFinished(game)).toBe(true);
		expect(game.finishedAt).not.toBeNull();
		expect(game.points).toBe(45);
		expect(game.rounds).toHaveLength(6);
		const again = restartGame(game);
		expect(again.id).not.toBe(game.id);
		expect(again.points).toBe(0);
		expect(currentLevel(again)).toBe(0);
	});

	it('zählt keine Punkte, wenn die Option aus ist, und ignoriert negative Werte', () => {
		const ruleset = { ...exampleRulesets('en-US')[1], points: false };
		let game = createGame(ruleset);
		game = applyRound(game, { completed: null, points: 30 });
		expect(game.points).toBe(0);
		const withPoints = applyRound(createGame({ ...ruleset, points: true }), { completed: null, points: -5 });
		expect(withPoints.points).toBe(0);
	});

	it('erlaubt im freien Modus beliebige Reihenfolge', () => {
		const ruleset = { ...exampleRulesets('en-US')[1], mode: 'free' as const };
		let game = createGame(ruleset);
		expect(openLevels(game)).toEqual([0, 1, 2, 3, 4]);
		game = applyRound(game, { completed: 3, points: 0 });
		expect(openLevels(game)).toEqual([0, 1, 2, 4]);
		expect(currentLevel(game)).toBe(0);
	});
});
