import { describe, expect, it } from 'vitest';
import { addBlock, blockById, blocks, blocksFor, removeBlock } from './blocks';
import { DECK_PRESETS } from './deck';
import { validateRequirement } from './ruleset';

describe('blocks', () => {
	it('alle Bausteine sind gültige Anforderungen mit eindeutiger ID', () => {
		const ids = new Set(blocks.map((b) => b.id));
		expect(ids.size).toBe(blocks.length);
		for (const b of blocks) expect(validateRequirement(b.requirement), b.id).toEqual(b.requirement);
		expect(blocks.filter((b) => b.common).length).toBeGreaterThanOrEqual(8);
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
});
