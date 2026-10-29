import { describe, expect, it } from 'vitest';
import { jsonLd } from './seo';

describe('jsonLd', () => {
	it('liefert gültiges JSON-LD für App und Rechtsseiten', () => {
		for (const [route, lang] of [
			['/[[language=language]]/start', 'de-DE'],
			['/[[language=language]]/play', 'en-US'],
			['/about', undefined],
			['/imprint', undefined]
		] as const) {
			const html = jsonLd(route, lang);
			const match = html.match(/^<script type="application\/ld\+json">(.*)<\/script>$/s);
			expect(match, route).not.toBeNull();
			const data = JSON.parse(match![1]);
			const app = Array.isArray(data) ? data[0] : data;
			expect(app['@type']).toBe('WebApplication');
			expect(app.url).toBe('https://lvl100.de');
			expect(html).not.toContain('</scr' + 'ipt><');
		}
		expect(jsonLd('/[[language=language]]/start', 'de-DE')).toContain('Regelsätze');
		expect(JSON.parse(jsonLd('/about', undefined).replace(/<\/?script[^>]*>/g, ''))).toHaveLength(2);
	});
});
