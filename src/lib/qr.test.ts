import QRCode from 'qrcode';
import { describe, expect, it } from 'vitest';
import { createDecoder, payloadFromScan } from './qr';

/** Rendert einen QR-Code als RGBA-Bild mit Rand, so wie ihn die Kamera liefern würde. */
function render(text: string, scale = 6): ImageData {
	const code = QRCode.create(text, { errorCorrectionLevel: 'M' });
	const size = code.modules.size;
	const margin = 4;
	const px = (size + margin * 2) * scale;
	const data = new Uint8ClampedArray(px * px * 4).fill(255);
	for (let y = 0; y < size; y++) {
		for (let x = 0; x < size; x++) {
			if (!code.modules.get(y, x)) continue;
			for (let dy = 0; dy < scale; dy++) {
				for (let dx = 0; dx < scale; dx++) {
					const i = (((y + margin) * scale + dy) * px + (x + margin) * scale + dx) * 4;
					data[i] = data[i + 1] = data[i + 2] = 0;
				}
			}
		}
	}
	return { data, width: px, height: px, colorSpace: 'srgb' } as ImageData;
}

describe('qr', () => {
	it('dekodiert einen erzeugten Share-Link ohne Browser-API (jsQR)', async () => {
		const decode = await createDecoder();
		const url = 'https://lvl100.de/de-DE/play?r=2rZHBasMwEER_xcx5e3CaENivKAR6KTkIex2rlmRXK5lQ';
		expect(await decode(render(url))).toBe(url);
		expect(await decode(render('hello'))).toBe('hello');
	});

	it('erkennt nur Level-100-Links mit Payload', () => {
		expect(payloadFromScan('https://lvl100.de/de-DE/play?r=2rZHBasMwEER_xcx5e3CaENivKAR6KTkIex2rlmRXK5lQ')).toBe(
			'2rZHBasMwEER_xcx5e3CaENivKAR6KTkIex2rlmRXK5lQ'
		);
		expect(payloadFromScan('https://example.com/?r=2rZHBasMwEER_xcx5e3CaENivKAR6KTkIex2rlmRXK5lQ')).not.toBeNull(); // Host egal, der Inhalt wird ohnehin validiert
		expect(payloadFromScan('https://lvl100.de/')).toBeNull();
		expect(payloadFromScan('nicht mal eine URL')).toBeNull();
		expect(payloadFromScan('https://lvl100.de/?r=9!!')).toBeNull();
	});
});
