import type { CardDeck } from './deck';
import type { Requirement } from './requirements';

/**
 * Bausteine sind die Anforderungen, die man im Editor antippt und die der Zufallsgenerator kombiniert.
 * `common` erscheint im Blatt zuerst, der Rest unter „Mehr Bausteine“.
 */
export interface Block {
	id: string;
	requirement: Requirement;
	common: boolean;
}

export const blocks: Block[] = [
	{ id: 'pair', requirement: { kind: 'set', size: 2, count: 1 }, common: true },
	{ id: 'triple', requirement: { kind: 'set', size: 3, count: 1 }, common: true },
	{ id: 'quad', requirement: { kind: 'set', size: 4, count: 1 }, common: true },
	{ id: 'quint', requirement: { kind: 'set', size: 5, count: 1 }, common: false },
	{ id: 'run3', requirement: { kind: 'run', length: 3, count: 1, sameSuit: false }, common: true },
	{ id: 'run4', requirement: { kind: 'run', length: 4, count: 1, sameSuit: false }, common: true },
	{ id: 'run5', requirement: { kind: 'run', length: 5, count: 1, sameSuit: false }, common: true },
	{ id: 'run6', requirement: { kind: 'run', length: 6, count: 1, sameSuit: false }, common: false },
	{ id: 'run7', requirement: { kind: 'run', length: 7, count: 1, sameSuit: false }, common: false },
	{ id: 'run8', requirement: { kind: 'run', length: 8, count: 1, sameSuit: false }, common: false },
	{ id: 'run9', requirement: { kind: 'run', length: 9, count: 1, sameSuit: false }, common: false },
	{ id: 'suitrun4', requirement: { kind: 'run', length: 4, count: 1, sameSuit: true }, common: true },
	{ id: 'suitrun5', requirement: { kind: 'run', length: 5, count: 1, sameSuit: true }, common: false },
	{ id: 'flush7', requirement: { kind: 'flush', size: 7 }, common: true },
	{ id: 'flush5', requirement: { kind: 'flush', size: 5 }, common: false },
	{ id: 'even7', requirement: { kind: 'parity', size: 7, parity: 'even' }, common: true },
	{ id: 'odd7', requirement: { kind: 'parity', size: 7, parity: 'odd' }, common: false }
];

export function blockById(id: string): Block | undefined {
	return blocks.find((b) => b.id === id);
}

/** Bausteine, die mit diesem Deck überhaupt legbar sind (z. B. keine Neunerfolge bei nur acht Werten). */
export function blocksFor(deck: CardDeck): Block[] {
	const values = deck.maxValue - deck.minValue + 1;
	const copies = deck.suits * deck.copies;
	return blocks.filter((b) => {
		const r = b.requirement;
		if (r.kind === 'run') return r.length <= values && (!r.sameSuit || deck.copies >= 1);
		if (r.kind === 'set') return r.size <= copies + deck.jokers;
		if (r.kind === 'flush') return r.size <= values * deck.copies + deck.jokers;
		if (r.kind === 'parity') return r.size <= Math.ceil(values / 2) * copies + deck.jokers;
		return true;
	});
}

/** Fügt einen Baustein zu einer Anforderungsliste hinzu; gleiche Bausteine werden zu „Zwei Drillinge“ zusammengefasst. */
export function addBlock(requirements: Requirement[], requirement: Requirement): Requirement[] {
	const next = requirements.map((r) => ({ ...r }));
	for (const r of next) {
		if (sameShape(r, requirement) && (r.kind === 'set' || r.kind === 'run') && r.count < 6) {
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

function sameShape(a: Requirement, b: Requirement): boolean {
	if (a.kind !== b.kind) return false;
	switch (a.kind) {
		case 'set':
			return b.kind === 'set' && a.size === b.size && a.value === b.value;
		case 'run':
			return b.kind === 'run' && a.length === b.length && a.sameSuit === b.sameSuit;
		default:
			return false;
	}
}
