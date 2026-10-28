import { v7 as uuid } from 'uuid';

type cardValueRange = 'infinite' | 10 | 11 | 12 | 13 | 14 | 15;
type distinctColors = 2 | 3 | 4 | 5 | 6 | 7 | 8;

export class CardDeck {
	constructor(
		public cardValueRange: cardValueRange = 12,
		public suitCount: distinctColors = 4
	) {}
}

type handCardCount = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;

export class Ruleset {
	constructor(
		public name: string = 'New Game',
		public id: string = uuid(),
		public cardDeck: CardDeck = new CardDeck(),
		public handCardCountPerLevel: [handCardCount, handCardCount, ...handCardCount[]] = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
		public levelsSelectionMode: 'fixed' = 'fixed'
	) {}

	copy() {
		return new Ruleset(
			undefined,
			undefined,
			structuredClone(this.cardDeck),
			structuredClone(this.handCardCountPerLevel),
			structuredClone(this.levelsSelectionMode)
		);
	}
}

// joker amount, special cards, card counts only if you can play it here
