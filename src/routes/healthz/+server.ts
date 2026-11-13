import { json } from '@sveltejs/kit';
import { buildInfo } from '#lib/build-info.js';
import { db, schemaVersion } from '#lib/server/db/index.js';
import type { RequestHandler } from './$types';

/** For load balancers, Docker HEALTHCHECK and humans: is the app up, and which build is it? */
export const GET: RequestHandler = () => {
	let database = 'ok';
	try {
		db().prepare('SELECT 1').get();
	} catch {
		database = 'unavailable';
	}
	return json(
		{
			status: database === 'ok' ? 'ok' : 'degraded',
			version: buildInfo.version,
			build: buildInfo.number,
			commit: buildInfo.commit,
			builtAt: buildInfo.date,
			schema: schemaVersion(),
			database
		},
		{ status: database === 'ok' ? 200 : 503, headers: { 'Cache-Control': 'no-store' } }
	);
};
