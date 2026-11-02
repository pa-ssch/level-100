import { blocksFor } from './blocks';
import { createRandom, type CardDeck } from './deck';
import { estimateDifficulty } from './difficulty';
import { levelCards, type Requirement } from './requirements';
import type { Level } from './ruleset';

export type Duration = 'short' | 'medium' | 'long';
export type DifficultyPreset = 'easy' | 'medium' | 'hard';

/** Levelzahl je Dauer; Annahme ≈ 5 Minuten je Level, am ersten Spieleabend nachmessen. */
export const LEVELS_PER_DURATION: Record<Duration, number> = { short: 4, medium: 8, long: 12 };
export const MINUTES_PER_LEVEL = 5;

/** Schwierigkeitsbereich (1–10), aus dem die Level kommen. */
export const DIFFICULTY_RANGE: Record<DifficultyPreset, [number, number]> = { easy: [1, 4], medium: [2, 7], hard: [4, 10] };

export interface Candidate {
	requirements: Requirement[];
	difficulty: number;
	probability: number;
}

const SAMPLES = 150;

/**
 * Alle Kandidaten-Level aus ein oder zwei Bausteinen, die in die Hand passen, mit geschätzter Schwierigkeit.
 * Deterministisch, deshalb ohne Seed; das Ergebnis lässt sich je Deck/Handgröße zwischenspeichern.
 */
export function candidateLevels(deck: CardDeck, handSize: number): Candidate[] {
	const available = blocksFor(deck).map((b) => b.requirement);
	const combos: Requirement[][] = [];
	for (let i = 0; i < available.length; i++) {
		combos.push([available[i]]);
		const a = available[i];
		if (a.kind === 'set' || a.kind === 'run') combos.push([{ ...a, count: 2 }]);
		for (let j = i; j < available.length; j++) {
			const b = available[j];
			if (i === j) continue;
			combos.push([a, b]);
		}
	}
	const seen = new Set<string>();
	const out: Candidate[] = [];
	for (const requirements of combos) {
		if (levelCards(requirements) > handSize) continue;
		const key = JSON.stringify(requirements);
		if (seen.has(key)) continue;
		seen.add(key);
		const estimate = estimateDifficulty(deck, handSize, requirements, SAMPLES);
		if (estimate.difficulty === undefined || estimate.probability === 0) continue;
		out.push({ requirements, difficulty: estimate.difficulty, probability: estimate.probability });
	}
	return out.sort((a, b) => b.probability - a.probability);
}

/**
 * Würfelt `count` Level: aus dem Schwierigkeitsbereich der Vorgabe, aufsteigend sortiert, ohne Wiederholung.
 * Gleicher Seed, gleiches Ergebnis.
 */
export function generateLevels(
	deck: CardDeck,
	handSize: number,
	count: number,
	preset: DifficultyPreset,
	seed: number,
	candidates = candidateLevels(deck, handSize)
): Level[] {
	const random = createRandom(seed);
	const [lo, hi] = DIFFICULTY_RANGE[preset];
	let pool = candidates.filter((c) => c.difficulty >= lo && c.difficulty <= hi);
	if (pool.length < count) pool = candidates; // Deck zu klein für den Bereich: aus allem wählen
	// Zielschwierigkeit je Level linear von lo nach hi, je Ziel der nächstliegende, noch ungenutzte Kandidat (mit Zufall unter Gleichwertigen).
	const chosen: Candidate[] = [];
	for (let i = 0; i < count; i++) {
		const target = count === 1 ? (lo + hi) / 2 : lo + ((hi - lo) * i) / (count - 1);
		const unused = pool.filter((c) => !chosen.includes(c));
		if (unused.length === 0) break;
		const best = Math.min(...unused.map((c) => Math.abs(c.difficulty - target)));
		const near = unused.filter((c) => Math.abs(c.difficulty - target) <= best + 0.5);
		chosen.push(near[Math.floor(random() * near.length)]);
	}
	return chosen
		.sort((a, b) => a.difficulty - b.difficulty || b.probability - a.probability)
		.map((c) => ({ requirements: c.requirements.map((r) => ({ ...r })), handSize }));
}

/** Ein einzelnes Level neu würfeln, möglichst mit ähnlicher Schwierigkeit und ohne Dublette zu den anderen. */
export function rerollLevel(
	levels: Level[],
	index: number,
	deck: CardDeck,
	seed: number,
	candidates = candidateLevels(deck, levels[index].handSize)
): Level {
	const random = createRandom(seed);
	const current = levels[index];
	const currentDifficulty = estimateDifficulty(deck, current.handSize, current.requirements, SAMPLES).difficulty ?? 5;
	const used = new Set(levels.map((l) => JSON.stringify(l.requirements)));
	const options = candidates.filter((c) => !used.has(JSON.stringify(c.requirements)));
	if (options.length === 0) return current;
	const best = Math.min(...options.map((c) => Math.abs(c.difficulty - currentDifficulty)));
	const near = options.filter((c) => Math.abs(c.difficulty - currentDifficulty) <= best + 1);
	const pick = near[Math.floor(random() * near.length)];
	return { requirements: pick.requirements.map((r) => ({ ...r })), handSize: current.handSize };
}
