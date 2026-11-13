import { error } from '@sveltejs/kit';
import { getLetter } from '#lib/server/content.js';
import { letterDefinition } from '#lib/server/letters.js';
import { renderLetterPdf } from '#lib/server/pdf.js';
import { letterFileName, pickValues, prepareLetter } from '#lib/letters.js';
import { escapeHtml } from '#lib/content/parse.js';
import type { RequestHandler } from './$types';

/** Turns the letter form into a PDF download. Nothing is stored. */
export const POST: RequestHandler = async ({ request, params }) => {
	const letter = getLetter(params.slug);
	if (!letter) error(404, 'We couldn’t find that letter.');
	const definition = letterDefinition(letter);
	const form = await request.formData();
	const values = pickValues(definition, (id) => form.get(id) ?? undefined);
	const prepared = prepareLetter(definition, values);

	if (prepared.missing.length) {
		const list = prepared.missing.map((f) => `<li>${escapeHtml(f.label)}</li>`).join('');
		return new Response(
			`<!doctype html><meta charset="utf-8"><title>A few details are missing</title>
			<body style="font-family:system-ui,sans-serif;max-width:36rem;margin:3rem auto;padding:0 1rem;line-height:1.6">
			<h1 style="font-family:Georgia,serif;font-weight:600">A few details are missing</h1>
			<p>Please go back and fill in:</p><ul>${list}</ul>
			<p><a href="/letters/${escapeHtml(letter.slug)}">Back to the letter</a></p></body>`,
			{ status: 400, headers: { 'Content-Type': 'text/html; charset=utf-8' } }
		);
	}

	const pdf = await renderLetterPdf(prepared, { author: values.sender_name });
	return new Response(new Uint8Array(pdf), {
		headers: {
			'Content-Type': 'application/pdf',
			'Content-Disposition': `attachment; filename="${letterFileName(letter.slug)}"`,
			'Content-Length': String(pdf.length),
			'Cache-Control': 'no-store'
		}
	});
};
