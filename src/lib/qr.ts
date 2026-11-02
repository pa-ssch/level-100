/**
 * QR-Codes aus Kamerabildern lesen: BarcodeDetector, wenn der Browser ihn hat (Chrome, Android), sonst jsQR
 * (reines JavaScript, wird erst beim Öffnen des Scanners geladen). Alles läuft auf dem Gerät.
 */
export type Decoder = (image: ImageData) => Promise<string | null>;

export async function createDecoder(): Promise<Decoder> {
	const Detector = (
		globalThis as { BarcodeDetector?: new (o: { formats: string[] }) => { detect: (i: ImageData) => Promise<{ rawValue: string }[]> } }
	).BarcodeDetector;
	if (Detector) {
		try {
			const detector = new Detector({ formats: ['qr_code'] });
			return async (image) => (await detector.detect(image))[0]?.rawValue ?? null;
		} catch {
			// Formate nicht unterstützt: auf jsQR ausweichen
		}
	}
	const { default: jsQR } = await import('jsqr');
	return async (image) => jsQR(image.data, image.width, image.height, { inversionAttempts: 'dontInvert' })?.data ?? null;
}

/** Liefert den Share-Payload (`r`) aus einem gescannten Level-100-Link, sonst null. */
export function payloadFromScan(text: string): string | null {
	try {
		const url = new URL(text);
		const r = url.searchParams.get('r');
		return r && /^[12][A-Za-z0-9_-]{10,}$/.test(r) ? r : null;
	} catch {
		return null;
	}
}
