import { validateRuleset, type Ruleset } from './ruleset';

/**
 * Share-Links tragen den kompletten Regelsatz: JSON, mit deflate-raw komprimiert, base64url-kodiert und mit einem
 * Präfix für das Format versehen. Es gibt keinen Server, der Links auflöst.
 */
const PREFIX_DEFLATE = '2';
const PREFIX_PLAIN = '1';
export const MAX_SHARE_LENGTH = 4000;
const MAX_DECODED_BYTES = 64 * 1024;

export async function encodeRuleset(ruleset: Ruleset): Promise<string> {
	const json = new TextEncoder().encode(JSON.stringify(ruleset));
	if (typeof CompressionStream === 'undefined') return PREFIX_PLAIN + toBase64Url(json);
	const compressed = await pipe(json, new CompressionStream('deflate-raw'));
	return PREFIX_DEFLATE + toBase64Url(compressed);
}

/** Liefert den validierten Regelsatz oder null, wenn der Link beschädigt, zu lang oder ungültig ist. */
export async function decodeRuleset(payload: string | null | undefined): Promise<Ruleset | null> {
	if (!payload || payload.length > MAX_SHARE_LENGTH) return null;
	try {
		const prefix = payload[0];
		const bytes = fromBase64Url(payload.slice(1));
		let json: Uint8Array;
		if (prefix === PREFIX_DEFLATE) {
			if (typeof DecompressionStream === 'undefined') return null;
			json = await pipe(bytes, new DecompressionStream('deflate-raw'), MAX_DECODED_BYTES);
		} else if (prefix === PREFIX_PLAIN) {
			json = bytes;
		} else {
			return null;
		}
		if (json.byteLength > MAX_DECODED_BYTES) return null;
		return validateRuleset(JSON.parse(new TextDecoder().decode(json)));
	} catch {
		return null;
	}
}

async function pipe(input: Uint8Array, transform: GenericTransformStream, limit = Infinity): Promise<Uint8Array> {
	const stream = new Blob([input as BlobPart]).stream().pipeThrough(transform);
	const reader = stream.getReader();
	const chunks: Uint8Array[] = [];
	let total = 0;
	for (;;) {
		const { done, value } = await reader.read();
		if (done) break;
		total += value.byteLength;
		if (total > limit) {
			await reader.cancel();
			throw new Error('payload too large');
		}
		chunks.push(value);
	}
	const out = new Uint8Array(total);
	let offset = 0;
	for (const chunk of chunks) {
		out.set(chunk, offset);
		offset += chunk.byteLength;
	}
	return out;
}

function toBase64Url(bytes: Uint8Array): string {
	let binary = '';
	for (const b of bytes) binary += String.fromCharCode(b);
	return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(text: string): Uint8Array {
	if (!/^[A-Za-z0-9_-]*$/.test(text)) throw new Error('invalid base64url');
	const binary = atob(text.replace(/-/g, '+').replace(/_/g, '/'));
	return Uint8Array.from(binary, (c) => c.charCodeAt(0));
}
