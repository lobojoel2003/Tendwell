-- Tendwell schema, version 1.
-- Times are stored as Unix milliseconds; calendar dates as ISO strings (YYYY-MM-DD).

CREATE TABLE users (
	id TEXT PRIMARY KEY,
	email TEXT NOT NULL UNIQUE COLLATE NOCASE,
	name TEXT NOT NULL,
	password_hash TEXT NOT NULL,
	created_at INTEGER NOT NULL
);

CREATE TABLE sessions (
	id TEXT PRIMARY KEY, -- SHA-256 of the cookie token; the token itself is never stored
	user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	created_at INTEGER NOT NULL,
	expires_at INTEGER NOT NULL
);
CREATE INDEX sessions_user ON sessions (user_id);

CREATE TABLE plans (
	id TEXT PRIMARY KEY,
	person_name TEXT NOT NULL,
	date_of_death TEXT,
	region TEXT NOT NULL DEFAULT 'us',
	answers TEXT NOT NULL DEFAULT '{}',
	created_by TEXT REFERENCES users (id) ON DELETE SET NULL,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);

CREATE TABLE members (
	plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
	user_id TEXT NOT NULL REFERENCES users (id) ON DELETE CASCADE,
	role TEXT NOT NULL CHECK (role IN ('owner', 'member')),
	joined_at INTEGER NOT NULL,
	PRIMARY KEY (plan_id, user_id)
);
CREATE INDEX members_user ON members (user_id);

CREATE TABLE invites (
	id TEXT PRIMARY KEY, -- SHA-256 of the invite token
	plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
	created_by TEXT REFERENCES users (id) ON DELETE SET NULL,
	created_at INTEGER NOT NULL,
	expires_at INTEGER NOT NULL,
	revoked_at INTEGER
);
CREATE INDEX invites_plan ON invites (plan_id);

CREATE TABLE task_states (
	plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
	task_id TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'todo' CHECK (status IN ('todo', 'done', 'skipped')),
	assignee_id TEXT REFERENCES users (id) ON DELETE SET NULL,
	snoozed_until INTEGER,
	updated_by TEXT REFERENCES users (id) ON DELETE SET NULL,
	updated_at INTEGER NOT NULL,
	PRIMARY KEY (plan_id, task_id)
);

CREATE TABLE custom_tasks (
	id TEXT PRIMARY KEY,
	plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
	title TEXT NOT NULL,
	details TEXT NOT NULL DEFAULT '',
	phase TEXT NOT NULL,
	created_by TEXT REFERENCES users (id) ON DELETE SET NULL,
	created_at INTEGER NOT NULL
);
CREATE INDEX custom_tasks_plan ON custom_tasks (plan_id);

CREATE TABLE notes (
	id TEXT PRIMARY KEY,
	plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
	task_id TEXT NOT NULL,
	user_id TEXT REFERENCES users (id) ON DELETE SET NULL,
	body TEXT NOT NULL,
	created_at INTEGER NOT NULL
);
CREATE INDEX notes_task ON notes (plan_id, task_id);

CREATE TABLE accounts (
	id TEXT PRIMARY KEY,
	plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
	name TEXT NOT NULL,
	kind TEXT NOT NULL,
	status TEXT NOT NULL DEFAULT 'to_contact' CHECK (status IN ('to_contact', 'contacted', 'closed')),
	reference TEXT NOT NULL DEFAULT '',
	notes TEXT NOT NULL DEFAULT '',
	assignee_id TEXT REFERENCES users (id) ON DELETE SET NULL,
	created_by TEXT REFERENCES users (id) ON DELETE SET NULL,
	created_at INTEGER NOT NULL,
	updated_at INTEGER NOT NULL
);
CREATE INDEX accounts_plan ON accounts (plan_id);

CREATE TABLE activity (
	id INTEGER PRIMARY KEY AUTOINCREMENT,
	plan_id TEXT NOT NULL REFERENCES plans (id) ON DELETE CASCADE,
	user_id TEXT REFERENCES users (id) ON DELETE SET NULL,
	kind TEXT NOT NULL,
	subject TEXT NOT NULL DEFAULT '',
	created_at INTEGER NOT NULL
);
CREATE INDEX activity_plan ON activity (plan_id, created_at);
