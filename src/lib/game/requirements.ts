/**
 * Eine Anforderung ist ein Baustein eines Levels. Ein Level ist erfüllt, wenn alle seine Anforderungen
 * gleichzeitig mit verschiedenen Karten der Hand gelegt werden können.
 */
export type Requirement =
	/** `count` Gruppen aus je `size` Karten gleichen Werts (optional ein fester Wert). */
	| { kind: 'set'; size: number; count: number; value?: number }
	/** `count` Folgen aus je `length` aufeinanderfolgenden Werten, optional in einer Farbe. */
	| { kind: 'run'; length: number; count: number; sameSuit: boolean }
	/** `size` Karten einer Farbe (beliebige Werte). */
	| { kind: 'flush'; size: number }
	/** `size` Karten, alle gerade oder alle ungerade. */
	| { kind: 'parity'; size: number; parity: 'even' | 'odd' }
	/** Freier Text, wird nicht geprüft und nicht in die Schwierigkeit eingerechnet. */
	| { kind: 'custom'; text: string };

export type RequirementKind = Requirement['kind'];

export const REQUIREMENT_LIMITS = {
	size: { min: 2, max: 15 },
	count: { min: 1, max: 6 },
	customText: 80
} as const;

export const requirementKinds: RequirementKind[] = ['set', 'run', 'flush', 'parity', 'custom'];

export function defaultRequirement(kind: RequirementKind): Requirement {
	switch (kind) {
		case 'set':
			return { kind, size: 3, count: 1 };
		case 'run':
			return { kind, length: 4, count: 1, sameSuit: false };
		case 'flush':
			return { kind, size: 7 };
		case 'parity':
			return { kind, size: 7, parity: 'even' };
		case 'custom':
			return { kind, text: '' };
	}
}

/** Zahl der Karten, die eine Anforderung belegt. */
export function requirementCards(r: Requirement): number {
	switch (r.kind) {
		case 'set':
			return r.size * r.count;
		case 'run':
			return r.length * r.count;
		case 'flush':
		case 'parity':
			return r.size;
		case 'custom':
			return 0;
	}
}

export function levelCards(requirements: Requirement[]): number {
	return requirements.reduce((sum, r) => sum + requirementCards(r), 0);
}
