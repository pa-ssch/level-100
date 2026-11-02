import { newId } from './id';
import type { Ruleset } from './ruleset';

export interface Round {
	/** Index des in dieser Runde erfüllten Levels oder null. */
	completed: number | null;
	/** Punkte dieser Runde (Restkarten); 0, wenn keine Punkte gezählt werden. */
	points: number;
}

/** Spielstand eines Spielers auf seinem Gerät. */
export interface Game {
	v: 2;
	id: string;
	/** Snapshot des Regelsatzes, damit das Spiel auch nach Änderungen am Regelsatz konsistent bleibt. */
	ruleset: Ruleset;
	done: boolean[];
	points: number;
	rounds: Round[];
	startedAt: string;
	finishedAt: string | null;
}

export const GAME_LIMITS = { points: { min: 0, max: 9999 } } as const;

export function createGame(ruleset: Ruleset): Game {
	return {
		v: 2,
		id: newId(),
		ruleset: structuredClone(ruleset),
		done: ruleset.levels.map(() => false),
		points: 0,
		rounds: [],
		startedAt: new Date().toISOString(),
		finishedAt: null
	};
}

/** Nächstes Level (0-basiert) bei fester Reihenfolge; bei freier Reihenfolge das kleinste offene. */
export function currentLevel(game: Game): number | null {
	const next = game.done.indexOf(false);
	return next === -1 ? null : next;
}

/** Bei `fixed` nur das nächste; bei `free` alle offenen Level. */
export function openLevels(game: Game): number[] {
	if (game.ruleset.mode === 'fixed') {
		const next = currentLevel(game);
		return next === null ? [] : [next];
	}
	return game.done.map((d, i) => (d ? -1 : i)).filter((i) => i >= 0);
}

export function isFinished(game: Game): boolean {
	return game.done.every(Boolean);
}

/** Runde eintragen (unveränderlich, liefert ein neues Game). */
export function applyRound(game: Game, round: Round): Game {
	const done = [...game.done];
	if (round.completed !== null && round.completed >= 0 && round.completed < done.length) done[round.completed] = true;
	const points = game.ruleset.points ? game.points + Math.max(0, round.points) : game.points;
	const finished = done.every(Boolean);
	return {
		...game,
		done,
		points,
		rounds: [...game.rounds, round],
		finishedAt: finished ? (game.finishedAt ?? new Date().toISOString()) : null
	};
}

export function restartGame(game: Game): Game {
	return createGame(game.ruleset);
}
