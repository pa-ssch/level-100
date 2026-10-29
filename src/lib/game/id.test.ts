import { afterEach, describe, expect, it, vi } from 'vitest';
import { newId } from './id';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;

describe('newId', () => {
	afterEach(() => vi.restoreAllMocks());

	it('liefert eindeutige UUIDs', () => {
		expect(newId()).toMatch(/^[0-9a-f-]{36}$/);
		expect(newId()).not.toBe(newId());
	});

	it('funktioniert ohne crypto.randomUUID (unsicherer Kontext)', () => {
		vi.spyOn(crypto, 'randomUUID').mockImplementation(undefined as never);
		Object.defineProperty(crypto, 'randomUUID', { value: undefined, configurable: true });
		const id = newId();
		expect(id).toMatch(UUID);
		expect(id).not.toBe(newId());
	});
});
