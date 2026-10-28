import { describe, expect, it } from 'vitest';
import { applyRound, createGame, isFinished, openLevels } from './game';
import { exampleRulesets } from './ruleset';

describe('game', () => {
	it('führt Level und Punkte je Spieler im festen Modus', () => {
		const ruleset = exampleRulesets('en-US')[1];
		let game = createGame(ruleset, ['Ann', 'Ben']);
		expect(openLevels(game, game.players[0])).toEqual([0]);
		game = applyRound(game, {
			results: [
				{ completed: 0, points: 0 },
				{ completed: null, points: 25 }
			]
		});
		expect(game.players[0].level).toBe(1);
		expect(game.players[1]).toMatchObject({ level: 0, points: 25 });
		expect(openLevels(game, game.players[0])).toEqual([1]);
		expect(isFinished(game)).toBe(false);
		for (let i = 1; i < ruleset.levels.length; i++) {
			game = applyRound(game, {
				results: [
					{ completed: i, points: 0 },
					{ completed: null, points: 5 }
				]
			});
		}
		expect(isFinished(game)).toBe(true);
		expect(game.players[1].points).toBe(45);
		expect(game.rounds).toHaveLength(5);
	});

	it('erlaubt im freien Modus beliebige Reihenfolge', () => {
		const ruleset = { ...exampleRulesets('en-US')[1], mode: 'free' as const };
		let game = createGame(ruleset, ['Ann']);
		expect(openLevels(game, game.players[0])).toEqual([0, 1, 2, 3, 4]);
		game = applyRound(game, { results: [{ completed: 3, points: 0 }] });
		expect(game.players[0].level).toBe(1);
		expect(openLevels(game, game.players[0])).toEqual([0, 1, 2, 4]);
	});
});
