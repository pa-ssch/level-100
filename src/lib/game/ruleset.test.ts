import { describe, expect, it } from 'vitest';
import { copyRuleset, createRuleset, exampleRulesets, validateRuleset } from './ruleset';

describe('ruleset', () => {
	it('Beispiele und Neuanlagen sind gültig', () => {
		for (const r of [...exampleRulesets('de-DE'), ...exampleRulesets('en-US'), createRuleset()]) {
			expect(validateRuleset(r)).toEqual(r);
		}
	});

	it('kopiert mit neuer ID und Suffix', () => {
		const original = exampleRulesets('de-DE')[0];
		const copy = copyRuleset(original, '(Kopie)');
		expect(copy.id).not.toBe(original.id);
		expect(copy.name).toBe('Zehn Level klassisch (Kopie)');
		expect(copy.levels).toEqual(original.levels);
		expect(copy.levels).not.toBe(original.levels);
	});

	it('weist Müll und Grenzverletzungen ab', () => {
		const base = createRuleset({ name: 'ok' });
		const broken: unknown[] = [
			null,
			'text',
			[],
			{},
			{ ...base, v: 2 },
			{ ...base, id: '../x' },
			{ ...base, name: 'x'.repeat(61) },
			{ ...base, name: 'a\u0000b' },
			{ ...base, mode: 'random' },
			{ ...base, levels: [] },
			{ ...base, levels: Array(31).fill(base.levels[0]) },
			{ ...base, deck: { ...base.deck, suits: 9 } },
			{ ...base, deck: { ...base.deck, minValue: 10, maxValue: 10 } },
			{ ...base, levels: [{ requirements: [], handSize: 10 }] },
			{ ...base, levels: [{ requirements: [{ kind: 'set', size: 3, count: 1 }], handSize: 200 }] },
			{ ...base, levels: [{ requirements: [{ kind: 'set', size: 3.5, count: 1 }], handSize: 10 }] },
			{ ...base, levels: [{ requirements: [{ kind: 'set', size: 3, count: 1, value: 13 }], handSize: 10 }] },
			{ ...base, levels: [{ requirements: [{ kind: 'run', length: 4, count: 1 }], handSize: 10 }] },
			{ ...base, levels: [{ requirements: [{ kind: 'parity', size: 4, parity: 'prime' }], handSize: 10 }] },
			{ ...base, levels: [{ requirements: [{ kind: 'custom', text: 'x'.repeat(81) }], handSize: 10 }] },
			{ ...base, levels: [{ requirements: [{ kind: 'eval', code: '1' }], handSize: 10 }] }
		];
		for (const input of broken) expect(validateRuleset(input), JSON.stringify(input).slice(0, 80)).toBeNull();
	});

	it('entfernt unbekannte Felder', () => {
		const base = createRuleset({ name: 'ok' });
		const valid = validateRuleset({ ...base, extra: 1, deck: { ...base.deck, __proto__: null, x: 1 } });
		expect(valid).toEqual(base);
	});
});
