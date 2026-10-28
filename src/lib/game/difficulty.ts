import { createRandom, dealHand, type CardDeck } from './deck';
import { levelCards, type Requirement } from './requirements';
import { satisfies } from './solver';

export interface DifficultyEstimate {
	/** Anteil der zufälligen Starthände, mit denen das Level sofort gelegt werden kann. */
	probability: number;
	/** 1 (leicht) bis 10 (schwer); `undefined`, wenn nur Freitext-Anforderungen vorliegen. */
	difficulty: number | undefined;
	samples: number;
}

/**
 * Schätzt die Schwierigkeit eines Levels per Simulation: Wie oft lässt sich das Level mit einer zufälligen Starthand
 * aus `handSize` Karten direkt erfüllen? Deterministisch über den Seed.
 */
export function estimateDifficulty(
	deck: CardDeck,
	handSize: number,
	requirements: Requirement[],
	samples = 400,
	seed = 1
): DifficultyEstimate {
	const checkable = requirements.filter((r) => r.kind !== 'custom');
	if (checkable.length === 0) return { probability: 1, difficulty: undefined, samples: 0 };
	if (levelCards(checkable) > handSize) return { probability: 0, difficulty: 10, samples: 0 };
	const random = createRandom(seed);
	let hits = 0;
	for (let i = 0; i < samples; i++) {
		if (satisfies(dealHand(deck, handSize, random), checkable, deck)) hits++;
	}
	const probability = hits / samples;
	return { probability, difficulty: difficultyFromProbability(probability), samples };
}

/** Logarithmische Skala: p = 1 → 1, p = 10 % → 4, p = 1 % → 7, p ≤ 0,1 % → 10. */
export function difficultyFromProbability(p: number): number {
	if (p <= 0) return 10;
	const d = Math.round(1 + 3 * -Math.log10(p));
	return Math.min(10, Math.max(1, d));
}
