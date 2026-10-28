/** Ein Kartendeck: Werte von minValue bis maxValue in `suits` Farben, jede Karte `copies`-mal, plus Joker. */
export interface CardDeck {
	minValue: number;
	maxValue: number;
	suits: number;
	copies: number;
	jokers: number;
}

export interface Card {
	value: number;
	suit: number;
}

export const DECK_LIMITS = {
	minValue: { min: 0, max: 20 },
	maxValue: { min: 2, max: 30 },
	suits: { min: 1, max: 8 },
	copies: { min: 1, max: 4 },
	jokers: { min: 0, max: 16 },
	maxValues: 20
} as const;

export const DECK_PRESETS: Record<'standard' | 'poker', CardDeck> = {
	/** 1–12 in vier Farben, doppelt, acht Joker (108 Karten). */
	standard: { minValue: 1, maxValue: 12, suits: 4, copies: 2, jokers: 8 },
	/** Normales Pokerblatt: 2 bis Ass (14) in vier Farben, einfach, zwei Joker (54 Karten). */
	poker: { minValue: 2, maxValue: 14, suits: 4, copies: 1, jokers: 2 }
};

export function deckSize(deck: CardDeck): number {
	return (deck.maxValue - deck.minValue + 1) * deck.suits * deck.copies + deck.jokers;
}

/** Alle Karten des Decks; Joker sind nicht enthalten, sie werden separat gezählt. */
export function allCards(deck: CardDeck): Card[] {
	const cards: Card[] = [];
	for (let value = deck.minValue; value <= deck.maxValue; value++) {
		for (let suit = 0; suit < deck.suits; suit++) {
			for (let copy = 0; copy < deck.copies; copy++) cards.push({ value, suit });
		}
	}
	return cards;
}

/** Deterministischer Zufallsgenerator (mulberry32), damit Simulationen und Tests reproduzierbar sind. */
export function createRandom(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) >>> 0;
		let t = a;
		t = Math.imul(t ^ (t >>> 15), t | 1);
		t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

export interface Hand {
	cards: Card[];
	jokers: number;
}

/** Zieht `handSize` Karten aus dem gemischten Deck (inklusive Joker). */
export function dealHand(deck: CardDeck, handSize: number, random: () => number): Hand {
	const pool: (Card | null)[] = [...allCards(deck), ...Array<null>(deck.jokers).fill(null)];
	const size = Math.min(handSize, pool.length);
	const hand: Hand = { cards: [], jokers: 0 };
	// Partielles Fisher-Yates: nur die ersten `size` Positionen werden gezogen.
	for (let i = 0; i < size; i++) {
		const j = i + Math.floor(random() * (pool.length - i));
		[pool[i], pool[j]] = [pool[j], pool[i]];
		const card = pool[i];
		if (card === null) hand.jokers++;
		else hand.cards.push(card);
	}
	return hand;
}
