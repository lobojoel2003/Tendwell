import Database from 'better-sqlite3';
import { mkdirSync } from 'node:fs';
import { dirname, resolve } from 'node:path';

export type DB = Database.Database;

const migrations = Object.entries(
	import.meta.glob<string>('./migrations/*.sql', { query: '?raw', import: 'default', eager: true })
)
	.map(([path, sql]) => {
		const match = /\/(\d+)_[^/]+\.sql$/.exec(path);
		if (!match) throw new Error(`Migration file names must start with a number: ${path}`);
		return { version: Number(match[1]), name: path.split('/').pop()!, sql };
	})
	.sort((a, b) => a.version - b.version);

/** Applies any migrations the database hasn't seen yet, each in its own transaction. */
export function migrate(db: DB) {
	const current = db.pragma('user_version', { simple: true }) as number;
	for (const migration of migrations) {
		if (migration.version <= current) continue;
		db.transaction(() => {
			db.exec(migration.sql);
			db.pragma(`user_version = ${migration.version}`);
		})();
	}
}

export function openDatabase(path: string): DB {
	if (path !== ':memory:') mkdirSync(dirname(resolve(path)), { recursive: true });
	const db = new Database(path);
	db.pragma('journal_mode = WAL');
	db.pragma('foreign_keys = ON');
	db.pragma('busy_timeout = 5000');
	db.pragma('synchronous = NORMAL');
	migrate(db);
	return db;
}

let instance: DB | undefined;

/** The app's database, opened on first use so that `vite build` never creates one. */
export function db(): DB {
	instance ??= openDatabase(process.env.DATABASE_PATH || 'data/tendwell.db');
	return instance;
}

/** For tests: use a specific database (for example an in-memory one). */
export function useDatabase(database: DB) {
	instance = database;
}

export const schemaVersion = () => migrations.at(-1)?.version ?? 0;
