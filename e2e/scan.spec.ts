import { expect, test } from '@playwright/test';
import QRCode from 'qrcode';
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { encodeRuleset } from '../src/lib/game/share';
import { createRuleset } from '../src/lib/game/ruleset';
import { watchErrors } from './helpers';

/**
 * QR-Scanner mit Chromiums Fake-Kamera (Projekt „scan“ in playwright.config.ts): ein Y4M-Video mit dem QR-Code
 * eines Share-Links wird als Kamerabild eingespielt. Es muss vor dem Browserstart existieren, deshalb entsteht es beim Laden der Datei.
 */
const videoPath = resolve('test-results/fake-camera.y4m');
const SHARED = createRuleset({
	id: 'scan-test',
	name: 'Gescannt',
	levels: [{ requirements: [{ kind: 'set', size: 2, count: 1 }], handSize: 10 }]
});
const joinUrl = `http://127.0.0.1:4173/de-DE/play?r=${await encodeRuleset(SHARED)}`;
mkdirSync('test-results', { recursive: true });
writeFileSync(videoPath, y4mWithQr(joinUrl, 640, 480));

function y4mWithQr(text: string, width: number, height: number): Buffer {
	const code = QRCode.create(text, { errorCorrectionLevel: 'M' });
	const size = code.modules.size;
	const scale = Math.floor((Math.min(width, height) - 80) / size);
	const offsetX = Math.floor((width - size * scale) / 2);
	const offsetY = Math.floor((height - size * scale) / 2);
	const y = Buffer.alloc(width * height, 235); // weiß
	for (let row = 0; row < size; row++) {
		for (let col = 0; col < size; col++) {
			if (!code.modules.get(row, col)) continue;
			for (let dy = 0; dy < scale; dy++)
				y.fill(
					16,
					(offsetY + row * scale + dy) * width + offsetX + col * scale,
					(offsetY + row * scale + dy) * width + offsetX + (col + 1) * scale
				);
		}
	}
	const uv = Buffer.alloc((width / 2) * (height / 2), 128);
	const header = Buffer.from(`YUV4MPEG2 W${width} H${height} F30:1 Ip A1:1 C420jpeg\n`);
	const frame = Buffer.concat([Buffer.from('FRAME\n'), y, uv, uv]);
	return Buffer.concat([header, ...Array(10).fill(frame)]);
}

test('QR-Code scannen führt direkt zur Beitreten-Ansicht', async ({ page, browserName }) => {
	const errors = watchErrors(page, browserName);
	await page.goto('/de-DE/start');
	await page.getByRole('button', { name: 'Spiel beitreten' }).click();
	await expect(page.getByRole('heading', { name: 'Spiel beitreten' })).toBeVisible();
	await expect(page).toHaveURL(/\/de-DE\/play\?r=/, { timeout: 15_000 });
	await expect(page.getByRole('heading', { name: 'Gescannt' })).toBeVisible();
	await expect(page.getByRole('button', { name: 'Mitspielen' })).toBeVisible();
	expect(errors).toEqual([]);
});
