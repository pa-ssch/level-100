import { newId } from './id';
import type { Ruleset } from './ruleset';

export interface Player {
	name: string;
	/** Index des aktuellen Levels (0-basiert); gleich `levels.length`, wenn alle geschafft sind. */
	level: number;
	/** Gesammelte Punkte (in Stufen-Spielen meist Minuspunkte für Restkarten). */
	points: number;
	/** Bei `mode: 'free'`: welche Level bereits erfüllt wurden. */
	done: boolean[];
}

export interface Round {
	/** Je Spieler: erfülltes Level (Index) oder null, und die Punkte dieser Runde. */
	results: { completed: number | null; points: number }[];
}

export interface Game {
	v: 1;
	id: string;
	/** Snapshot des Regelsatzes, damit das Spiel auch nach Änderungen am Regelsatz konsistent bleibt. */
	ruleset: Ruleset;
	players: Player[];
	rounds: Round[];
	startedAt: string;
}

export const GAME_LIMITS = { players: { min: 1, max: 12 }, playerName: 30, points: { min: -9999, max: 9999 } } as const;

export function createGame(ruleset: Ruleset, playerNames: string[]): Game {
	return {
		v: 1,
		id: newId(),
		ruleset: structuredClone(ruleset),
		players: playerNames.map((name) => ({ name, level: 0, points: 0, done: ruleset.levels.map(() => false) })),
		rounds: [],
		startedAt: new Date().toISOString()
	};
}

/** Spielstand nach einer Runde (unveränderlich, liefert ein neues Game). */
export function applyRound(game: Game, round: Round): Game {
	const players = game.players.map((player, i) => {
		const result = round.results[i];
		if (!result) return player;
		const done = [...player.done];
		if (result.completed !== null && result.completed >= 0 && result.completed < done.length) done[result.completed] = true;
		return {
			...player,
			points: player.points + result.points,
			done,
			level: game.ruleset.mode === 'fixed' ? done.lastIndexOf(true) + 1 : done.filter(Boolean).length
		};
	});
	return { ...game, players, rounds: [...game.rounds, round] };
}

export function isFinished(game: Game): boolean {
	return game.players.some((p) => p.done.every(Boolean));
}

/** Bei `fixed` das nächste offene Level; bei `free` alle noch offenen. */
export function openLevels(game: Game, player: Player): number[] {
	if (game.ruleset.mode === 'fixed') {
		const next = player.done.indexOf(false);
		return next === -1 ? [] : [next];
	}
	return player.done.map((d, i) => (d ? -1 : i)).filter((i) => i >= 0);
}
