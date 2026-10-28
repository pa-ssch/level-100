import type { CardDeck, Hand } from './deck';
import type { Requirement } from './requirements';

/**
 * Prüft, ob eine Hand alle Anforderungen eines Levels gleichzeitig erfüllen kann (Backtracking über die
 * Anforderungen; Joker ersetzen beliebige Karten, jede Gruppe braucht mindestens eine echte Karte).
 */
export function satisfies(hand: Hand, requirements: Requirement[], deck: CardDeck): boolean {
	const checkable = requirements.filter((r) => r.kind !== 'custom');
	// Eine Anforderung mit `count` Gruppen wird in einzelne Gruppen zerlegt.
	const groups: Requirement[] = [];
	for (const r of checkable) {
		const count = r.kind === 'set' || r.kind === 'run' ? r.count : 1;
		for (let i = 0; i < count; i++) groups.push(r);
	}
	const state = new HandState(hand, deck);
	return solve(state, groups, 0, hand.jokers);
}

class HandState {
	/** counts[value][suit] */
	readonly counts: number[][];
	readonly minValue: number;
	readonly maxValue: number;
	readonly suits: number;

	constructor(hand: Hand, deck: CardDeck) {
		this.minValue = deck.minValue;
		this.maxValue = deck.maxValue;
		this.suits = deck.suits;
		this.counts = Array.from({ length: deck.maxValue + 1 }, () => Array<number>(deck.suits).fill(0));
		for (const card of hand.cards) {
			if (card.value >= deck.minValue && card.value <= deck.maxValue && card.suit >= 0 && card.suit < deck.suits) {
				this.counts[card.value][card.suit]++;
			}
		}
	}

	countOfValue(value: number): number {
		return this.counts[value].reduce((a, b) => a + b, 0);
	}

	/** Entfernt `n` Karten des Werts (beliebige Farben); liefert die entfernten (value, suit)-Paare zum Zurücklegen. */
	takeValue(value: number, n: number): [number, number][] {
		const taken: [number, number][] = [];
		for (let suit = 0; suit < this.suits && taken.length < n; suit++) {
			while (this.counts[value][suit] > 0 && taken.length < n) {
				this.counts[value][suit]--;
				taken.push([value, suit]);
			}
		}
		return taken;
	}

	give(taken: [number, number][]) {
		for (const [value, suit] of taken) this.counts[value][suit]++;
	}
}

function solve(state: HandState, groups: Requirement[], index: number, jokers: number): boolean {
	if (index === groups.length) return true;
	const r = groups[index];
	switch (r.kind) {
		case 'set':
			return solveSet(state, groups, index, jokers, r.size, r.value);
		case 'run':
			return solveRun(state, groups, index, jokers, r.length, r.sameSuit);
		case 'flush':
			return solveFlush(state, groups, index, jokers, r.size);
		case 'parity':
			return solveParity(state, groups, index, jokers, r.size, r.parity);
		case 'custom':
			return solve(state, groups, index + 1, jokers);
	}
}

function solveSet(state: HandState, groups: Requirement[], index: number, jokers: number, size: number, fixedValue?: number): boolean {
	const values = fixedValue === undefined ? range(state.minValue, state.maxValue) : [fixedValue];
	for (const value of values) {
		if (value < state.minValue || value > state.maxValue) continue;
		const available = state.countOfValue(value);
		// So viele echte Karten wie möglich, dann weniger (Joker auffüllen), mindestens eine echte Karte.
		for (let natural = Math.min(available, size); natural >= 1; natural--) {
			const neededJokers = size - natural;
			if (neededJokers > jokers) continue;
			const taken = state.takeValue(value, natural);
			const ok = solve(state, groups, index + 1, jokers - neededJokers);
			state.give(taken);
			if (ok) return true;
		}
	}
	return false;
}

function solveRun(state: HandState, groups: Requirement[], index: number, jokers: number, length: number, sameSuit: boolean): boolean {
	for (let start = state.minValue; start + length - 1 <= state.maxValue; start++) {
		const suits = sameSuit ? range(0, state.suits - 1) : [undefined];
		for (const suit of suits) {
			// Positionen, an denen eine echte Karte verfügbar ist
			const natural: boolean[] = [];
			for (let i = 0; i < length; i++) {
				const value = start + i;
				natural.push(suit === undefined ? state.countOfValue(value) > 0 : state.counts[value][suit] > 0);
			}
			const missing = natural.filter((n) => !n).length;
			if (missing > jokers || missing === length) continue;
			// Zusätzlich dürfen Joker echte Karten ersetzen (die dann für andere Gruppen frei bleiben).
			const naturalPositions = natural.map((n, i) => (n ? i : -1)).filter((i) => i >= 0);
			const maxReplace = Math.min(jokers - missing, naturalPositions.length - 1);
			for (let replace = 0; replace <= maxReplace; replace++) {
				for (const replaced of combinations(naturalPositions, replace)) {
					const taken: [number, number][] = [];
					for (const i of naturalPositions) {
						if (replaced.includes(i)) continue;
						const value = start + i;
						taken.push(...(suit === undefined ? state.takeValue(value, 1) : takeSuit(state, value, suit)));
					}
					const ok = solve(state, groups, index + 1, jokers - missing - replace);
					state.give(taken);
					if (ok) return true;
				}
			}
		}
	}
	return false;
}

function takeSuit(state: HandState, value: number, suit: number): [number, number][] {
	state.counts[value][suit]--;
	return [[value, suit]];
}

function solveFlush(state: HandState, groups: Requirement[], index: number, jokers: number, size: number): boolean {
	for (let suit = 0; suit < state.suits; suit++) {
		const cards: [number, number][] = [];
		for (let value = state.minValue; value <= state.maxValue; value++) {
			for (let c = 0; c < state.counts[value][suit]; c++) cards.push([value, suit]);
		}
		if (!solveGroupFrom(state, groups, index, jokers, size, cards)) continue;
		return true;
	}
	return false;
}

function solveParity(
	state: HandState,
	groups: Requirement[],
	index: number,
	jokers: number,
	size: number,
	parity: 'even' | 'odd'
): boolean {
	const cards: [number, number][] = [];
	for (let value = state.minValue; value <= state.maxValue; value++) {
		if ((value % 2 === 0) !== (parity === 'even')) continue;
		for (let suit = 0; suit < state.suits; suit++) {
			for (let c = 0; c < state.counts[value][suit]; c++) cards.push([value, suit]);
		}
	}
	return solveGroupFrom(state, groups, index, jokers, size, cards);
}

/** Gruppe aus `size` Karten aus einer Kandidatenliste; Reihenfolge egal, deshalb reicht ein Präfix je Anzahl. */
function solveGroupFrom(
	state: HandState,
	groups: Requirement[],
	index: number,
	jokers: number,
	size: number,
	cards: [number, number][]
): boolean {
	for (let natural = Math.min(cards.length, size); natural >= 1; natural--) {
		const neededJokers = size - natural;
		if (neededJokers > jokers) continue;
		const taken = cards.slice(0, natural);
		for (const [value, suit] of taken) state.counts[value][suit]--;
		const ok = solve(state, groups, index + 1, jokers - neededJokers);
		state.give(taken);
		if (ok) return true;
	}
	return false;
}

function range(from: number, to: number): number[] {
	const out: number[] = [];
	for (let i = from; i <= to; i++) out.push(i);
	return out;
}

function* combinations<T>(items: T[], k: number): Generator<T[]> {
	if (k === 0) {
		yield [];
		return;
	}
	for (let i = 0; i <= items.length - k; i++) {
		for (const rest of combinations(items.slice(i + 1), k - 1)) yield [items[i], ...rest];
	}
}
