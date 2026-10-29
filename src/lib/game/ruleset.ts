import { DECK_LIMITS, DECK_PRESETS, deckSize, type CardDeck } from './deck';
import { newId } from './id';
import { REQUIREMENT_LIMITS, requirementKinds, type Requirement } from './requirements';

export interface Level {
	requirements: Requirement[];
	/** Handkarten in diesem Level. */
	handSize: number;
}

export type LevelSelectionMode = 'fixed' | 'free';

export interface Ruleset {
	/** Version des Formats, für spätere Migrationen. */
	v: 1;
	id: string;
	name: string;
	deck: CardDeck;
	levels: Level[];
	/** `fixed`: Level der Reihe nach. `free`: beim Rauskommen wird gewählt, welches Level erfüllt wurde. */
	mode: LevelSelectionMode;
}

export const RULESET_LIMITS = {
	name: 60,
	levels: { min: 1, max: 30 },
	requirementsPerLevel: { min: 1, max: 6 },
	handSize: { min: 3, max: 20 }
} as const;

export { newId };

export function createRuleset(partial: Partial<Omit<Ruleset, 'v'>> = {}): Ruleset {
	return {
		v: 1,
		id: partial.id ?? newId(),
		name: partial.name ?? '',
		deck: partial.deck ?? { ...DECK_PRESETS.standard },
		levels: partial.levels ?? [{ requirements: [{ kind: 'set', size: 3, count: 2 }], handSize: 10 }],
		mode: partial.mode ?? 'fixed'
	};
}

/** Kopie mit neuer ID; der Name bekommt ein Suffix, damit die Kopie in der Liste unterscheidbar ist. */
export function copyRuleset(ruleset: Ruleset, suffix: string): Ruleset {
	return { ...structuredClone(ruleset), id: newId(), name: `${ruleset.name} ${suffix}`.slice(0, RULESET_LIMITS.name) };
}

/** Beispiel-Regelsätze für den ersten Start. */
export function exampleRulesets(language: 'de-DE' | 'en-US'): Ruleset[] {
	const de = language === 'de-DE';
	const ten: Level[] = [
		[{ kind: 'set', size: 3, count: 2 }],
		[
			{ kind: 'set', size: 3, count: 1 },
			{ kind: 'run', length: 4, count: 1, sameSuit: false }
		],
		[
			{ kind: 'set', size: 4, count: 1 },
			{ kind: 'run', length: 4, count: 1, sameSuit: false }
		],
		[{ kind: 'run', length: 7, count: 1, sameSuit: false }],
		[{ kind: 'run', length: 8, count: 1, sameSuit: false }],
		[{ kind: 'run', length: 9, count: 1, sameSuit: false }],
		[{ kind: 'set', size: 4, count: 2 }],
		[{ kind: 'flush', size: 7 }],
		[
			{ kind: 'set', size: 5, count: 1 },
			{ kind: 'set', size: 2, count: 1 }
		],
		[
			{ kind: 'set', size: 5, count: 1 },
			{ kind: 'set', size: 3, count: 1 }
		]
	].map((requirements) => ({ requirements: requirements as Requirement[], handSize: 10 }));
	const poker: Level[] = [
		[{ kind: 'set', size: 2, count: 2 }],
		[
			{ kind: 'set', size: 3, count: 1 },
			{ kind: 'set', size: 2, count: 1 }
		],
		[{ kind: 'run', length: 5, count: 1, sameSuit: false }],
		[{ kind: 'flush', size: 5 }],
		[{ kind: 'run', length: 5, count: 1, sameSuit: true }]
	].map((requirements) => ({ requirements: requirements as Requirement[], handSize: 7 }));
	return [
		createRuleset({ id: 'example-ten', name: de ? 'Zehn Level klassisch' : 'Ten classic levels', levels: ten }),
		createRuleset({
			id: 'example-poker',
			name: de ? 'Pokerblatt, fünf Level' : 'Poker deck, five levels',
			deck: { ...DECK_PRESETS.poker },
			levels: poker
		})
	];
}

// ---------------------------------------------------------------------------------------------------------------
// Validierung: Alles, was aus URL oder Local Storage kommt, läuft hier durch. Liefert einen bereinigten Regelsatz
// oder null, wenn die Daten nicht zu retten sind.

function int(value: unknown, min: number, max: number): number | null {
	return typeof value === 'number' && Number.isInteger(value) && value >= min && value <= max ? value : null;
}

function str(value: unknown, maxLength: number): string | null {
	return typeof value === 'string' && value.length <= maxLength && !/[\p{Cc}]/u.test(value) ? value : null;
}

export function validateDeck(input: unknown): CardDeck | null {
	if (typeof input !== 'object' || input === null) return null;
	const d = input as Record<string, unknown>;
	const minValue = int(d.minValue, DECK_LIMITS.minValue.min, DECK_LIMITS.minValue.max);
	const maxValue = int(d.maxValue, DECK_LIMITS.maxValue.min, DECK_LIMITS.maxValue.max);
	const suits = int(d.suits, DECK_LIMITS.suits.min, DECK_LIMITS.suits.max);
	const copies = int(d.copies, DECK_LIMITS.copies.min, DECK_LIMITS.copies.max);
	const jokers = int(d.jokers, DECK_LIMITS.jokers.min, DECK_LIMITS.jokers.max);
	if (minValue === null || maxValue === null || suits === null || copies === null || jokers === null) return null;
	if (maxValue - minValue + 1 < 2 || maxValue - minValue + 1 > DECK_LIMITS.maxValues) return null;
	return { minValue, maxValue, suits, copies, jokers };
}

export function validateRequirement(input: unknown): Requirement | null {
	if (typeof input !== 'object' || input === null) return null;
	const r = input as Record<string, unknown>;
	if (typeof r.kind !== 'string' || !(requirementKinds as string[]).includes(r.kind)) return null;
	const { size, count } = REQUIREMENT_LIMITS;
	switch (r.kind as Requirement['kind']) {
		case 'set': {
			const s = int(r.size, size.min, size.max);
			const c = int(r.count, count.min, count.max);
			if (s === null || c === null) return null;
			const value = r.value === undefined ? undefined : int(r.value, DECK_LIMITS.minValue.min, DECK_LIMITS.maxValue.max);
			if (value === null) return null;
			return value === undefined ? { kind: 'set', size: s, count: c } : { kind: 'set', size: s, count: c, value };
		}
		case 'run': {
			const l = int(r.length, size.min, size.max);
			const c = int(r.count, count.min, count.max);
			if (l === null || c === null || typeof r.sameSuit !== 'boolean') return null;
			return { kind: 'run', length: l, count: c, sameSuit: r.sameSuit };
		}
		case 'flush': {
			const s = int(r.size, size.min, size.max);
			return s === null ? null : { kind: 'flush', size: s };
		}
		case 'parity': {
			const s = int(r.size, size.min, size.max);
			if (s === null || (r.parity !== 'even' && r.parity !== 'odd')) return null;
			return { kind: 'parity', size: s, parity: r.parity };
		}
		case 'custom': {
			const text = str(r.text, REQUIREMENT_LIMITS.customText);
			return text === null ? null : { kind: 'custom', text };
		}
	}
}

export function validateLevel(input: unknown, deck: CardDeck): Level | null {
	if (typeof input !== 'object' || input === null) return null;
	const l = input as Record<string, unknown>;
	const handSize = int(l.handSize, RULESET_LIMITS.handSize.min, Math.min(RULESET_LIMITS.handSize.max, deckSize(deck)));
	if (handSize === null || !Array.isArray(l.requirements)) return null;
	const { min, max } = RULESET_LIMITS.requirementsPerLevel;
	if (l.requirements.length < min || l.requirements.length > max) return null;
	const requirements: Requirement[] = [];
	for (const r of l.requirements) {
		const valid = validateRequirement(r);
		if (valid === null) return null;
		if (valid.kind === 'set' && valid.value !== undefined && (valid.value < deck.minValue || valid.value > deck.maxValue)) return null;
		requirements.push(valid);
	}
	return { requirements, handSize };
}

export function validateRuleset(input: unknown): Ruleset | null {
	if (typeof input !== 'object' || input === null) return null;
	const r = input as Record<string, unknown>;
	if (r.v !== 1) return null;
	const id = str(r.id, 64);
	const name = str(r.name, RULESET_LIMITS.name);
	const deck = validateDeck(r.deck);
	if (id === null || !/^[A-Za-z0-9-]+$/.test(id) || name === null || deck === null || !Array.isArray(r.levels)) return null;
	if (r.mode !== 'fixed' && r.mode !== 'free') return null;
	if (r.levels.length < RULESET_LIMITS.levels.min || r.levels.length > RULESET_LIMITS.levels.max) return null;
	const levels: Level[] = [];
	for (const l of r.levels) {
		const valid = validateLevel(l, deck);
		if (valid === null) return null;
		levels.push(valid);
	}
	return { v: 1, id, name, deck, levels, mode: r.mode };
}
