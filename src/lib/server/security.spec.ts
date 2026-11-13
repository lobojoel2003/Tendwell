import { describe, expect, it } from 'vitest';
import { hashPassword, verifyPassword } from './password.js';
import { safeNext } from './auth.js';
import { createRateLimiter } from './rate-limit.js';
import { hashToken, newToken } from './ids.js';
import { isoDate, isEmail } from './forms.js';

describe('passwords', () => {
	it('hashes with scrypt and verifies', async () => {
		const hash = await hashPassword('a gentle password');
		expect(hash.startsWith('scrypt$16384$8$1$')).toBe(true);
		expect(await verifyPassword('a gentle password', hash)).toBe(true);
		expect(await verifyPassword('a different one', hash)).toBe(false);
	});
	it('salts every hash', async () => {
		expect(await hashPassword('same')).not.toBe(await hashPassword('same'));
	});
	it('rejects malformed hashes', async () => {
		expect(await verifyPassword('x', 'not-a-hash')).toBe(false);
	});
});

describe('tokens', () => {
	it('are long, random and stored hashed', () => {
		const token = newToken();
		expect(token.length).toBeGreaterThanOrEqual(43);
		expect(hashToken(token)).not.toBe(token);
		expect(hashToken(token)).toBe(hashToken(token));
	});
});

describe('safeNext', () => {
	it('allows paths on this site', () => {
		expect(safeNext('/plans/abc?x=1')).toBe('/plans/abc?x=1');
	});
	it('refuses other sites', () => {
		for (const bad of [
			'https://evil.example',
			'//evil.example',
			'/\\evil.example',
			'javascript:alert(1)',
			null
		]) {
			expect(safeNext(bad)).toBe('/plans');
		}
	});
});

describe('rate limiter', () => {
	it('allows a few tries, then waits', () => {
		const limiter = createRateLimiter({ limit: 2, windowMs: 1000 });
		expect(limiter.hit('k', 0)).toBe(true);
		expect(limiter.hit('k', 1)).toBe(true);
		expect(limiter.hit('k', 2)).toBe(false);
		expect(limiter.hit('k', 1001)).toBe(true);
	});
});

describe('form helpers', () => {
	it('checks emails loosely', () => {
		expect(isEmail('a@b.co')).toBe(true);
		expect(isEmail('nope')).toBe(false);
	});
	it('accepts real past dates only', () => {
		expect(isoDate('')).toBeNull();
		expect(isoDate('2026-02-28')).toBe('2026-02-28');
		expect(isoDate('2026-02-30')).toBe('invalid');
		expect(isoDate('3000-01-01')).toBe('invalid');
		expect(isoDate('11/02/2026')).toBe('invalid');
	});
});
