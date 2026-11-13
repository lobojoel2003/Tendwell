#!/usr/bin/env node
// Sets a new, random password for an account, for people who run a Tendwell server.
// Tendwell doesn't send email, so this is how a forgotten password is reset.
//
//   npm run user:reset-password -- someone@example.com
//   docker compose exec tendwell node scripts/reset-password.js someone@example.com
//
// Share the new password with the person privately; they can change it on their account page.
import Database from 'better-sqlite3';
import { randomBytes, scryptSync } from 'node:crypto';
import { existsSync } from 'node:fs';

const email = process.argv[2]?.trim().toLowerCase();
const path = process.env.DATABASE_PATH || 'data/tendwell.db';

if (!email) {
	console.error('Usage: node scripts/reset-password.js <email>');
	process.exit(2);
}
if (!existsSync(path)) {
	console.error(`No database at ${path}. Set DATABASE_PATH to the file Tendwell uses.`);
	process.exit(2);
}

const db = new Database(path);
const user = db.prepare('SELECT id, name FROM users WHERE email = ?').get(email);
if (!user) {
	console.error(`No account uses ${email}.`);
	process.exit(1);
}

// Same format as src/lib/server/password.ts.
const password = randomBytes(9).toString('base64url');
const salt = randomBytes(16);
const key = scryptSync(password.normalize('NFKC'), salt, 64, {
	N: 16384,
	r: 8,
	p: 1,
	maxmem: 64 * 1024 * 1024
});
const hash = ['scrypt', 16384, 8, 1, salt.toString('base64url'), key.toString('base64url')].join(
	'$'
);

db.transaction(() => {
	db.prepare('UPDATE users SET password_hash = ? WHERE id = ?').run(hash, user.id);
	db.prepare('DELETE FROM sessions WHERE user_id = ?').run(user.id);
})();

console.log(`New password for ${user.name} <${email}>: ${password}`);
console.log('They have been signed out everywhere. Ask them to change it on their account page.');
