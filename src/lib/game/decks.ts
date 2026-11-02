import { DECK_LIMITS, DECK_PRESETS, deckSize, type CardDeck } from './deck';
import { newId } from './id';
import { RULESET_LIMITS } from './ruleset';

/** Ein gespeichertes Deck: die Kartenbeschreibung plus Name und Standard-Handkarten. */
export interface SavedDeck {
	id: string;
	name: string;
	deck: CardDeck;
	handSize: number;
}

export const DECK_NAME_LIMIT = 40;

/** Standard-Handkarten je Deck: 10, bei kleinen Decks weniger. */
export function defaultHandSize(deck: CardDeck): number {
	const preset = JSON.stringify(deck) === JSON.stringify(DECK_PRESETS.poker) ? 7 : 10;
	return Math.max(RULESET_LIMITS.handSize.min, Math.min(preset, deckSize(deck)));
}

export function presetOf(deck: CardDeck): 'standard' | 'poker' | null {
	for (const [name, preset] of Object.entries(DECK_PRESETS))
		if (JSON.stringify(preset) === JSON.stringify(deck)) return name as 'standard' | 'poker';
	return null;
}

export function createSavedDeck(partial: Partial<SavedDeck> = {}): SavedDeck {
	const deck = partial.deck ?? { ...DECK_PRESETS.standard };
	return { id: partial.id ?? newId(), name: partial.name ?? '', deck, handSize: partial.handSize ?? defaultHandSize(deck) };
}

export function validateSavedDeck(input: unknown): SavedDeck | null {
	if (typeof input !== 'object' || input === null) return null;
	const d = input as Record<string, unknown>;
	if (typeof d.id !== 'string' || !/^[A-Za-z0-9-]{1,64}$/.test(d.id)) return null;
	if (typeof d.name !== 'string' || d.name.length > DECK_NAME_LIMIT || /[\p{Cc}]/u.test(d.name)) return null;
	const deck = validateDeckShape(d.deck);
	if (deck === null) return null;
	const handSize =
		Number.isInteger(d.handSize) &&
		(d.handSize as number) >= RULESET_LIMITS.handSize.min &&
		(d.handSize as number) <= Math.min(RULESET_LIMITS.handSize.max, deckSize(deck))
			? (d.handSize as number)
			: defaultHandSize(deck);
	return { id: d.id, name: d.name, deck, handSize };
}

function validateDeckShape(input: unknown): CardDeck | null {
	if (typeof input !== 'object' || input === null) return null;
	const d = input as Record<string, unknown>;
	const int = (v: unknown, min: number, max: number) => (typeof v === 'number' && Number.isInteger(v) && v >= min && v <= max ? v : null);
	const minValue = int(d.minValue, DECK_LIMITS.minValue.min, DECK_LIMITS.minValue.max);
	const maxValue = int(d.maxValue, DECK_LIMITS.maxValue.min, DECK_LIMITS.maxValue.max);
	const suits = int(d.suits, DECK_LIMITS.suits.min, DECK_LIMITS.suits.max);
	const copies = int(d.copies, DECK_LIMITS.copies.min, DECK_LIMITS.copies.max);
	const jokers = int(d.jokers, DECK_LIMITS.jokers.min, DECK_LIMITS.jokers.max);
	if (minValue === null || maxValue === null || suits === null || copies === null || jokers === null) return null;
	if (maxValue - minValue + 1 < 2 || maxValue - minValue + 1 > DECK_LIMITS.maxValues) return null;
	return { minValue, maxValue, suits, copies, jokers };
}
