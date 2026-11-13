/**
 * A small in-memory limiter for sign-in and sign-up attempts.
 * It's per process, which is fine for a single self-hosted server.
 */
export function createRateLimiter({ limit, windowMs }: { limit: number; windowMs: number }) {
	const hits = new Map<string, { count: number; resetAt: number }>();

	return {
		/** Returns true if the attempt is allowed. */
		hit(key: string, now = Date.now()): boolean {
			const entry = hits.get(key);
			if (!entry || entry.resetAt <= now) {
				hits.set(key, { count: 1, resetAt: now + windowMs });
				if (hits.size > 10_000) {
					for (const [k, v] of hits) if (v.resetAt <= now) hits.delete(k);
				}
				return true;
			}
			entry.count += 1;
			return entry.count <= limit;
		},
		reset(key: string) {
			hits.delete(key);
		}
	};
}

export const authLimiter = createRateLimiter({ limit: 10, windowMs: 15 * 60 * 1000 });
