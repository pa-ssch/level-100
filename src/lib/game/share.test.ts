import { describe, expect, it } from 'vitest';
import { createRuleset, exampleRulesets } from './ruleset';
import { MAX_SHARE_LENGTH, decodeRuleset, encodeRuleset } from './share';

describe('share', () => {
	it('kodiert und dekodiert verlustfrei und kompakt', async () => {
		for (const ruleset of exampleRulesets('de-DE')) {
			const payload = await encodeRuleset(ruleset);
			expect(payload).toMatch(/^[12][A-Za-z0-9_-]+$/);
			expect(payload.length).toBeLessThan(600);
			expect(await decodeRuleset(payload)).toEqual(ruleset);
		}
	});

	it('weist beschädigte, fremde und überlange Links ab', async () => {
		const payload = await encodeRuleset(createRuleset({ name: 'x' }));
		expect(await decodeRuleset(null)).toBeNull();
		expect(await decodeRuleset('')).toBeNull();
		expect(await decodeRuleset('9abc')).toBeNull();
		expect(await decodeRuleset(payload.slice(0, -5) + '!!!!!')).toBeNull();
		expect(await decodeRuleset(payload.slice(0, 10))).toBeNull();
		expect(await decodeRuleset('1' + btoa('{"v":1}'))).toBeNull();
		expect(await decodeRuleset('2' + 'A'.repeat(MAX_SHARE_LENGTH))).toBeNull();
	});
});
