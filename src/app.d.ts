// See https://svelte.dev/docs/kit/types#app.d.ts
import type { SessionUser } from '#lib/server/auth.js';

declare global {
	const __TENDWELL_BUILD__: {
		version: string;
		number: string;
		commit: string;
		date: string;
	};

	namespace App {
		interface Locals {
			user: SessionUser | null;
			sessionId: string | null;
		}
		// interface Error {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}
}

export {};
