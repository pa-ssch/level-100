import { describe, expect, it } from 'vitest';
import { addBlock, blockById, blockCount, blocks, blocksFor, levelProblem, removeBlock, setBlockCount } from './blocks';
import { DECK_PRESETS } from './deck';
import { validateRequirement } from './ruleset';

describe('blocks', () => {
	it('alle Bausteine sind gültige Anforderungen mit eindeutiger ID', () => {
		const ids = new Set(blocks.map((b) => b.id));
		expect(ids.size).toBe(blocks.length);
		for (const b of blocks) expect(validateRequirement(b.requirement), b.id).toEqual(b.requirement);
		for (const b of blocks) expect(['sets', 'runs', 'suitRuns', 'flush', 'parity']).toContain(b.group);
	});

	it('filtert nach Deck', () => {
		const small = { minValue: 1, maxValue: 6, suits: 2, copies: 1, jokers: 0 };
		const ids = blocksFor(small).map((b) => b.id);
		expect(ids).toContain('run4');
		expect(ids).not.toContain('run9');
		expect(ids).not.toContain('quad'); // nur zwei Karten je Wert
		expect(blocksFor(DECK_PRESETS.standard)).toHaveLength(blocks.length);
	});

	it('fasst gleiche Bausteine zu Anzahl zusammen und entfernt einzeln', () => {
		const triple = blockById('triple')!.requirement;
		let reqs = addBlock([], triple);
		reqs = addBlock(reqs, triple);
		expect(reqs).toEqual([{ kind: 'set', size: 3, count: 2 }]);
		reqs = addBlock(reqs, blockById('run4')!.requirement);
		expect(reqs).toHaveLength(2);
		reqs = removeBlock(reqs, 0);
		expect(reqs[0]).toEqual({ kind: 'set', size: 3, count: 1 });
		reqs = removeBlock(reqs, 0);
		expect(reqs).toEqual([{ kind: 'run', length: 4, count: 1, sameSuit: false }]);
		expect(removeBlock(reqs, 7)).toEqual(reqs);
	});

	it('zählt Bausteine und setzt ihre Anzahl', () => {
		const triple = blockById('triple')!.requirement;
		const flush = blockById('flush7')!.requirement;
		let reqs = setBlockCount([], triple, 2);
		expect(reqs).toEqual([{ kind: 'set', size: 3, count: 2 }]);
		expect(blockCount(reqs, triple)).toBe(2);
		expect(blockCount(reqs, flush)).toBe(0);
		reqs = setBlockCount(reqs, flush, 1);
		expect(blockCount(reqs, flush)).toBe(1);
		// Zähler ändern behält die Position
		reqs = setBlockCount(reqs, triple, 1);
		expect(reqs).toEqual([{ kind: 'set', size: 3, count: 1 }, flush]);
		reqs = setBlockCount(reqs, triple, 0);
		expect(reqs).toEqual([flush]);
		expect(setBlockCount(reqs, triple, 99)[1]).toEqual({ kind: 'set', size: 3, count: 6 });
	});

	it('erkennt nicht schaffbare Level', () => {
		const deck = DECK_PRESETS.standard;
		expect(levelProblem(deck, 10, [{ kind: 'set', size: 3, count: 2 }])).toBeNull();
		expect(
			levelProblem(deck, 10, [
				{ kind: 'run', length: 9, count: 1, sameSuit: false },
				{ kind: 'set', size: 2, count: 1 }
			])
		).toBe('tooManyCards');
		expect(levelProblem(deck, 10, [{ kind: 'set', size: 3, count: 1, value: 13 }])).toBe('impossible');
		const poker = DECK_PRESETS.poker;
		expect(levelProblem(poker, 10, [{ kind: 'set', size: 7, count: 1 }])).toBe('impossible');
		expect(levelProblem(poker, 10, [{ kind: 'custom', text: 'Ein Affe' }])).toBeNull();
	});
});
