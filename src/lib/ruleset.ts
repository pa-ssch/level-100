export type CardValueRange = 'infinite' | 10 | 11 | 12 | 13 | 14 | 15;
export type SuitCount = 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type HandCardCount = 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15;
export type LevelSelectionMode = 'fixed';

export class CardDeck {
	constructor(
		public cardValueRange: CardValueRange = 12,
		public suitCount: SuitCount = 4
	) {}
}

export class Ruleset {
	constructor(
		public name: string = 'New Game',
		public id: string = crypto.randomUUID(),
		public cardDeck: CardDeck = new CardDeck(),
		public handCardCountPerLevel: [HandCardCount, HandCardCount, ...HandCardCount[]] = [10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
		public levelsSelectionMode: LevelSelectionMode = 'fixed'
	) {}

	/** Kopie mit neuer ID und Standardnamen; die Regeln selbst werden tief kopiert. */
	copy(): Ruleset {
		return new Ruleset(
			undefined,
			undefined,
			new CardDeck(this.cardDeck.cardValueRange, this.cardDeck.suitCount),
			[...this.handCardCountPerLevel],
			this.levelsSelectionMode
		);
	}
}

// Offen (siehe PLAN.md, Phase 6): Joker-Anzahl, Sonderkarten, Level-Definitionen, Serialisierung für Share-Links.
