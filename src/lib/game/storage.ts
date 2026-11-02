import { browser } from '$app/environment';
import { isLanguage, type Language } from '$lib/i18n';
import type { Game } from './game';
import { validateRuleset, type Ruleset } from './ruleset';

/**
 * Alles, was im Local Storage liegt. Die Schlüssel sind in der Datenschutzerklärung genannt und werden von den
 * E2E-Tests gegen diese Liste geprüft. Jeder Lesezugriff validiert; kaputte Daten werden ignoriert.
 */
export const STORAGE_KEYS = {
	rulesets: 'level100.rulesets',
	games: 'level100.games',
	language: 'level100.language'
} as const;

const MAX_STORED_GAMES = 50;

const MAX_STORED_RULESETS = 50;

function read(key: string): unknown {
	if (!browser) return null;
	try {
		const raw = localStorage.getItem(key);
		return raw === null ? null : JSON.parse(raw);
	} catch {
		return null;
	}
}

function write(key: string, value: unknown): void {
	if (!browser) return;
	try {
		localStorage.setItem(key, JSON.stringify(value));
	} catch {
		// Speicher voll oder gesperrt (privater Modus): die App funktioniert auch ohne Persistenz.
	}
}

export interface StoredRuleset {
	ruleset: Ruleset;
	favorite: boolean;
	/** ISO-Zeitpunkt der letzten Nutzung, für die Sortierung. */
	usedAt: string;
	/** Wie oft ein Spiel damit gestartet wurde. */
	plays: number;
}

function validateStored(input: unknown): StoredRuleset | null {
	if (typeof input !== 'object' || input === null) return null;
	const s = input as Record<string, unknown>;
	const ruleset = validateRuleset(s.ruleset);
	if (ruleset === null) return null;
	const usedAt = typeof s.usedAt === 'string' && !Number.isNaN(Date.parse(s.usedAt)) ? s.usedAt : new Date(0).toISOString();
	const plays = Number.isInteger(s.plays) && (s.plays as number) >= 0 ? (s.plays as number) : 0;
	return { ruleset, favorite: s.favorite === true, usedAt, plays };
}

export function loadRulesets(): StoredRuleset[] {
	const raw = read(STORAGE_KEYS.rulesets);
	if (!Array.isArray(raw)) return [];
	const seen = new Set<string>();
	const out: StoredRuleset[] = [];
	for (const item of raw) {
		const valid = validateStored(item);
		if (valid && !seen.has(valid.ruleset.id)) {
			seen.add(valid.ruleset.id);
			out.push(valid);
		}
	}
	return sortRulesets(out);
}

function sortRulesets(list: StoredRuleset[]): StoredRuleset[] {
	return [...list].sort((a, b) => Number(b.favorite) - Number(a.favorite) || b.usedAt.localeCompare(a.usedAt));
}

/** Legt einen Regelsatz ab oder aktualisiert ihn und setzt den Nutzungszeitpunkt. */
export function saveRuleset(ruleset: Ruleset, options: { favorite?: boolean; played?: boolean } = {}): StoredRuleset[] {
	const list = loadRulesets();
	const existing = list.find((s) => s.ruleset.id === ruleset.id);
	const entry: StoredRuleset = {
		ruleset,
		favorite: options.favorite ?? existing?.favorite ?? false,
		usedAt: new Date().toISOString(),
		plays: (existing?.plays ?? 0) + (options.played ? 1 : 0)
	};
	const next = sortRulesets([entry, ...list.filter((s) => s.ruleset.id !== ruleset.id)]).slice(0, MAX_STORED_RULESETS);
	write(STORAGE_KEYS.rulesets, next);
	return next;
}

export function removeRuleset(id: string): StoredRuleset[] {
	const next = loadRulesets().filter((s) => s.ruleset.id !== id);
	write(STORAGE_KEYS.rulesets, next);
	removeGame(id);
	return next;
}

export function toggleFavorite(id: string): StoredRuleset[] {
	const next = sortRulesets(loadRulesets().map((s) => (s.ruleset.id === id ? { ...s, favorite: !s.favorite } : s)));
	write(STORAGE_KEYS.rulesets, next);
	return next;
}

function validateGame(input: unknown): Game | null {
	if (typeof input !== 'object' || input === null) return null;
	const g = input as Record<string, unknown>;
	if (g.v !== 2 || typeof g.id !== 'string' || !/^[A-Za-z0-9-]{1,64}$/.test(g.id)) return null;
	const ruleset = validateRuleset(g.ruleset);
	if (ruleset === null || !Array.isArray(g.done) || !Array.isArray(g.rounds)) return null;
	if (g.done.length !== ruleset.levels.length || !g.done.every((d) => typeof d === 'boolean')) return null;
	if (typeof g.points !== 'number' || !Number.isFinite(g.points)) return null;
	const rounds: Game['rounds'] = [];
	for (const r of g.rounds) {
		if (typeof r !== 'object' || r === null) return null;
		const res = r as Record<string, unknown>;
		const completed = res.completed === null ? null : Number.isInteger(res.completed) ? (res.completed as number) : undefined;
		if (completed === undefined || typeof res.points !== 'number' || !Number.isFinite(res.points)) return null;
		rounds.push({ completed, points: res.points });
	}
	const startedAt = typeof g.startedAt === 'string' ? g.startedAt : new Date(0).toISOString();
	const finishedAt = typeof g.finishedAt === 'string' ? g.finishedAt : null;
	return { v: 2, id: g.id, ruleset, done: g.done as boolean[], points: g.points, rounds, startedAt, finishedAt };
}

/** Alle gespeicherten Spiele (höchstens eines je Regelsatz), neueste zuerst. */
export function loadGames(): Game[] {
	const raw = read(STORAGE_KEYS.games);
	if (!Array.isArray(raw)) return [];
	const seen = new Set<string>();
	const out: Game[] = [];
	for (const item of raw) {
		const game = validateGame(item);
		if (game && !seen.has(game.ruleset.id)) {
			seen.add(game.ruleset.id);
			out.push(game);
		}
	}
	return out;
}

/** Das Spiel zu einem Regelsatz, falls vorhanden. */
export function loadGame(rulesetId: string): Game | null {
	return loadGames().find((g) => g.ruleset.id === rulesetId) ?? null;
}

export function saveGame(game: Game): void {
	const next = [game, ...loadGames().filter((g) => g.ruleset.id !== game.ruleset.id)].slice(0, MAX_STORED_GAMES);
	write(STORAGE_KEYS.games, next);
}

export function removeGame(rulesetId: string): void {
	write(
		STORAGE_KEYS.games,
		loadGames().filter((g) => g.ruleset.id !== rulesetId)
	);
}

export function loadLanguage(): Language | null {
	const value = read(STORAGE_KEYS.language);
	return isLanguage(value) ? value : null;
}

export function saveLanguage(language: Language): void {
	write(STORAGE_KEYS.language, language);
}
