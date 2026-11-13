import PDFDocument from 'pdfkit';
import type { PreparedLetter } from '#lib/letters.js';

const FONT = 'Times-Roman';
const BOLD = 'Times-Bold';
const SIZE = 11.5;

/** Renders a prepared letter as a simple, printable US Letter PDF. */
export function renderLetterPdf(
	letter: PreparedLetter,
	meta: { author?: string } = {}
): Promise<Buffer> {
	return new Promise((resolve, reject) => {
		const doc = new PDFDocument({
			size: 'LETTER',
			margins: { top: 72, bottom: 72, left: 78, right: 78 },
			info: {
				Title: letter.subject,
				Author: meta.author ?? '',
				Creator: 'Tendwell',
				Producer: 'Tendwell'
			},
			pdfVersion: '1.7',
			lang: 'en-US',
			displayTitle: true
		});
		const chunks: Buffer[] = [];
		doc.on('data', (chunk: Buffer) => chunks.push(chunk));
		doc.on('end', () => resolve(Buffer.concat(chunks)));
		doc.on('error', reject);

		const width = doc.page.width - doc.page.margins.left - doc.page.margins.right;
		const text = (value: string, options: PDFKit.Mixins.TextOptions = {}) =>
			doc.text(value, { width, lineGap: 2.5, ...options });

		doc.font(FONT).fontSize(SIZE).fillColor('#111111');

		// Sender
		if (letter.senderLines.length) {
			const [name, ...rest] = letter.senderLines;
			doc.font(BOLD);
			text(name);
			doc.font(FONT);
			for (const line of rest) text(line);
			doc.moveDown(1.2);
		}

		text(letter.date);
		doc.moveDown(1.2);

		// Recipient
		if (letter.recipientLines.length) {
			for (const line of letter.recipientLines) text(line);
			doc.moveDown(1.2);
		}

		// Subject
		doc.font(BOLD);
		text(`Re: ${letter.subject}`);
		doc.font(FONT);
		doc.moveDown(1);

		// Body
		for (const paragraph of letter.paragraphs) {
			text(paragraph.join('\n'), { paragraphGap: 0 });
			doc.moveDown(0.9);
		}

		if (letter.enclosures.length) {
			doc.moveDown(0.6);
			doc.font(BOLD);
			text(letter.enclosures.length === 1 ? 'Enclosure' : 'Enclosures');
			doc.font(FONT);
			for (const item of letter.enclosures) text(`•  ${item}`, { indent: 6 });
		}

		doc.end();
	});
}
