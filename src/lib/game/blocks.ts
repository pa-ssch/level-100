import { deckSize, type CardDeck } from './deck';
import { levelCards, REQUIREMENT_LIMITS, type Requirement } from './requirements';

/**
 * Bausteine sind die Anforderungen, die man im Editor anhakt und die der Zufallsgenerator kombiniert.
 * Im Blatt erscheinen sie nach Gruppen sortiert; feste Werte und Freitext kommen als eigene Gruppen dazu.
 */
export type BlockGroup = 'sets' | 'runs' | 'suitRuns' | 'flush' | 'parity';

export interface Block {
	id: string;
	group: BlockGroup;
	requirement: Requirement;
}

export const blockGroups: BlockGroup[] = ['sets', 'runs', 'suitRuns', 'flush', 'parity'];

export const blocks: Block[] = [
	{ id: 'pair', group: 'sets', requirement: { kind: 'set', size: 2, count: 1 } },
	{ id: 'triple', group: 'sets', requirement: { kind: 'set', size: 3, count: 1 } },
	{ id: 'quad', group: 'sets', requirement: { kind: 'set', size: 4, count: 1 } },
	{ id: 'quint', group: 'sets', requirement: { kind: 'set', size: 5, count: 1 } },
	{ id: 'run3', group: 'runs', requirement: { kind: 'run', length: 3, count: 1, sameSuit: false } },
	{ id: 'run4', group: 'runs', requirement: { kind: 'run', length: 4, count: 1, sameSuit: false } },
	{ id: 'run5', group: 'runs', requirement: { kind: 'run', length: 5, count: 1, sameSuit: false } },
	{ id: 'run6', group: 'runs', requirement: { kind: 'run', length: 6, count: 1, sameSuit: false } },
	{ id: 'run7', group: 'runs', requirement: { kind: 'run', length: 7, count: 1, sameSuit: false } },
	{ id: 'run8', group: 'runs', requirement: { kind: 'run', length: 8, count: 1, sameSuit: false } },
	{ id: 'run9', group: 'runs', requirement: { kind: 'run', length: 9, count: 1, sameSuit: false } },
	{ id: 'suitrun4', group: 'suitRuns', requirement: { kind: 'run', length: 4, count: 1, sameSuit: true } },
	{ id: 'suitrun5', group: 'suitRuns', requirement: { kind: 'run', length: 5, count: 1, sameSuit: true } },
	{ id: 'flush5', group: 'flush', requirement: { kind: 'flush', size: 5 } },
	{ id: 'flush7', group: 'flush', requirement: { kind: 'flush', size: 7 } },
	{ id: 'even7', group: 'parity', requirement: { kind: 'parity', size: 7, parity: 'even' } },
	{ id: 'odd7', group: 'parity', requirement: { kind: 'parity', size: 7, parity: 'odd' } }
];

export function blockById(id: string): Block | undefined {
	return blocks.find((b) => b.id === id);
}

/** Ob eine einzelne Anforderung mit diesem Deck überhaupt legbar ist (z. B. keine Neunerfolge bei nur acht Werten). */
export function requirementPossible(deck: CardDeck, r: Requirement): boolean {
	const values = deck.maxValue - deck.minValue + 1;
	const copies = deck.suits * deck.copies;
	switch (r.kind) {
		case 'run':
			return r.length <= values && (!r.sameSuit || deck.copies >= 1);
		case 'set':
			if (r.value !== undefined && (r.value < deck.minValue || r.value > deck.maxValue)) return false;
			return r.size <= copies + deck.jokers;
		case 'flush':
			return r.size <= values * deck.copies + deck.jokers;
		case 'parity':
			return r.size <= Math.ceil(values / 2) * copies + deck.jokers;
		case 'custom':
			return true;
	}
}

/** Bausteine, die mit diesem Deck überhaupt legbar sind. */
export function blocksFor(deck: CardDeck): Block[] {
	return blocks.filter((b) => requirementPossible(deck, b.requirement));
}

export type LevelProblem = 'tooManyCards' | 'impossible';

/**
 * Warum ein Level nicht schaffbar ist: braucht mehr Karten als auf der Hand (oder im Deck) sind, oder eine
 * Anforderung passt nicht zum Deck. `null`, wenn nichts dagegen spricht.
 */
export function levelProblem(deck: CardDeck, handSize: number, requirements: Requirement[]): LevelProblem | null {
	if (requirements.some((r) => !requirementPossible(deck, r))) return 'impossible';
	if (levelCards(requirements) > Math.min(handSize, deckSize(deck))) return 'tooManyCards';
	return null;
}

/** Fügt einen Baustein zu einer Anforderungsliste hinzu; gleiche Bausteine werden zu „Zwei Drillinge“ zusammengefasst. */
export function addBlock(requirements: Requirement[], requirement: Requirement): Requirement[] {
	const next = requirements.map((r) => ({ ...r }));
	for (const r of next) {
		if (sameShape(r, requirement) && (r.kind === 'set' || r.kind === 'run') && r.count < REQUIREMENT_LIMITS.count.max) {
			r.count++;
			return next;
		}
	}
	next.push({ ...requirement });
	return next;
}

/** Entfernt eine Einheit eines Bausteins (bei `count > 1` nur eine Gruppe). */
export function removeBlock(requirements: Requirement[], index: number): Requirement[] {
	const next = requirements.map((r) => ({ ...r }));
	const r = next[index];
	if (!r) return next;
	if ((r.kind === 'set' || r.kind === 'run') && r.count > 1) {
		r.count--;
		return next;
	}
	next.splice(index, 1);
	return next;
}

/** Wie oft ein Baustein in einem Level steckt: der Zähler bei Gruppen und Folgen, sonst 0 oder 1. */
export function blockCount(requirements: Requirement[], requirement: Requirement): number {
	const found = requirements.find((r) => sameShape(r, requirement));
	if (!found) return 0;
	return found.kind === 'set' || found.kind === 'run' ? found.count : 1;
}

/** Setzt, wie oft ein Baustein im Level steckt; 0 entfernt ihn, Gruppen und Folgen bekommen den Zähler. */
export function setBlockCount(requirements: Requirement[], requirement: Requirement, count: number): Requirement[] {
	const next = requirements.map((r) => ({ ...r })).filter((r) => !sameShape(r, requirement));
	if (count <= 0) return next;
	const r = { ...requirement };
	if (r.kind === 'set' || r.kind === 'run') r.count = Math.min(REQUIREMENT_LIMITS.count.max, count);
	// An der alten Stelle einfügen, damit die Beschreibung ihre Reihenfolge behält
	const index = requirements.findIndex((x) => sameShape(x, requirement));
	if (index === -1) next.push(r);
	else next.splice(index, 0, r);
	return next;
}

/** Gleicher Baustein (ohne Zähler); Freitext gilt als gleich, wenn der Text gleich ist. */
export function sameShape(a: Requirement, b: Requirement): boolean {
	if (a.kind !== b.kind) return false;
	switch (a.kind) {
		case 'set':
			return b.kind === 'set' && a.size === b.size && a.value === b.value;
		case 'run':
			return b.kind === 'run' && a.length === b.length && a.sameSuit === b.sameSuit;
		case 'flush':
			return b.kind === 'flush' && a.size === b.size;
		case 'parity':
			return b.kind === 'parity' && a.size === b.size && a.parity === b.parity;
		case 'custom':
			return b.kind === 'custom' && a.text === b.text;
	}
}
