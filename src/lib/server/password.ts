import { randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from 'node:crypto';

const params = { N: 16384, r: 8, p: 1, maxmem: 64 * 1024 * 1024 };
const KEY_LENGTH = 64;

function derive(password: string, salt: Buffer, options: ScryptOptions): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		scrypt(password.normalize('NFKC'), salt, KEY_LENGTH, options, (error, key) =>
			error ? reject(error) : resolve(key)
		);
	});
}

/** Hashes a password with scrypt. The format records its parameters so they can change later. */
export async function hashPassword(password: string): Promise<string> {
	const salt = randomBytes(16);
	const key = await derive(password, salt, params);
	return [
		'scrypt',
		params.N,
		params.r,
		params.p,
		salt.toString('base64url'),
		key.toString('base64url')
	].join('$');
}

export async function verifyPassword(password: string, stored: string): Promise<boolean> {
	const [scheme, N, r, p, salt, hash] = stored.split('$');
	if (scheme !== 'scrypt' || !salt || !hash) return false;
	const expected = Buffer.from(hash, 'base64url');
	const key = await derive(password, Buffer.from(salt, 'base64url'), {
		N: Number(N),
		r: Number(r),
		p: Number(p),
		maxmem: params.maxmem
	});
	return key.length === expected.length && timingSafeEqual(key, expected);
}
