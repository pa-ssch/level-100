import { browser } from '$app/environment';
import { isLanguage, type Language } from '$lib/i18n';
import { GAME_LIMITS, type Game } from './game';
import { validateRuleset, type Ruleset } from './ruleset';

/**
 * Alles, was im Local Storage liegt. Die Schlüssel sind in der Datenschutzerklärung genannt und werden von den
 * E2E-Tests gegen diese Liste geprüft. Jeder Lesezugriff validiert; kaputte Daten werden ignoriert.
 */
export const STORAGE_KEYS = {
	rulesets: 'level100.rulesets',
	game: 'level100.game',
	language: 'level100.language'
} as const;

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
}

function validateStored(input: unknown): StoredRuleset | null {
	if (typeof input !== 'object' || input === null) return null;
	const s = input as Record<string, unknown>;
	const ruleset = validateRuleset(s.ruleset);
	if (ruleset === null) return null;
	const usedAt = typeof s.usedAt === 'string' && !Number.isNaN(Date.parse(s.usedAt)) ? s.usedAt : new Date(0).toISOString();
	return { ruleset, favorite: s.favorite === true, usedAt };
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
export function saveRuleset(ruleset: Ruleset, favorite?: boolean): StoredRuleset[] {
	const list = loadRulesets();
	const existing = list.find((s) => s.ruleset.id === ruleset.id);
	const entry: StoredRuleset = { ruleset, favorite: favorite ?? existing?.favorite ?? false, usedAt: new Date().toISOString() };
	const next = sortRulesets([entry, ...list.filter((s) => s.ruleset.id !== ruleset.id)]).slice(0, MAX_STORED_RULESETS);
	write(STORAGE_KEYS.rulesets, next);
	return next;
}

export function removeRuleset(id: string): StoredRuleset[] {
	const next = loadRulesets().filter((s) => s.ruleset.id !== id);
	write(STORAGE_KEYS.rulesets, next);
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
	if (g.v !== 1 || typeof g.id !== 'string' || !/^[A-Za-z0-9-]{1,64}$/.test(g.id)) return null;
	const ruleset = validateRuleset(g.ruleset);
	if (ruleset === null || !Array.isArray(g.players) || !Array.isArray(g.rounds)) return null;
	if (g.players.length < GAME_LIMITS.players.min || g.players.length > GAME_LIMITS.players.max) return null;
	const levelCount = ruleset.levels.length;
	const players: Game['players'] = [];
	for (const p of g.players) {
		if (typeof p !== 'object' || p === null) return null;
		const pl = p as Record<string, unknown>;
		if (typeof pl.name !== 'string' || pl.name.length > GAME_LIMITS.playerName) return null;
		if (!Number.isInteger(pl.level) || (pl.level as number) < 0 || (pl.level as number) > levelCount) return null;
		if (typeof pl.points !== 'number' || !Number.isFinite(pl.points)) return null;
		if (!Array.isArray(pl.done) || pl.done.length !== levelCount || !pl.done.every((d) => typeof d === 'boolean')) return null;
		players.push({ name: pl.name, level: pl.level as number, points: pl.points, done: pl.done as boolean[] });
	}
	const rounds: Game['rounds'] = [];
	for (const r of g.rounds) {
		if (typeof r !== 'object' || r === null || !Array.isArray((r as Record<string, unknown>).results)) return null;
		const results = (r as { results: unknown[] }).results;
		if (results.length !== players.length) return null;
		const parsed: Game['rounds'][number]['results'] = [];
		for (const x of results) {
			if (typeof x !== 'object' || x === null) return null;
			const res = x as Record<string, unknown>;
			const completed = res.completed === null ? null : Number.isInteger(res.completed) ? (res.completed as number) : undefined;
			if (completed === undefined || typeof res.points !== 'number' || !Number.isFinite(res.points)) return null;
			parsed.push({ completed, points: res.points });
		}
		rounds.push({ results: parsed });
	}
	const startedAt = typeof g.startedAt === 'string' ? g.startedAt : new Date(0).toISOString();
	return { v: 1, id: g.id, ruleset, players, rounds, startedAt };
}

export function loadGame(): Game | null {
	return validateGame(read(STORAGE_KEYS.game));
}

export function saveGame(game: Game | null): void {
	if (!browser) return;
	if (game === null) localStorage.removeItem(STORAGE_KEYS.game);
	else write(STORAGE_KEYS.game, game);
}

export function loadLanguage(): Language | null {
	const value = read(STORAGE_KEYS.language);
	return isLanguage(value) ? value : null;
}

export function saveLanguage(language: Language): void {
	write(STORAGE_KEYS.language, language);
}
