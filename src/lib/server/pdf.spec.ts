import { expect, it } from 'vitest';
import { renderLetterPdf } from './pdf.js';

it('renders a letter as a PDF', async () => {
	const pdf = await renderLetterPdf(
		{
			senderLines: ['Priya Shah', '12 Elm Street'],
			date: 'November 13, 2026',
			recipientLines: ['First Community Bank'],
			subject: 'Notification of death',
			paragraphs: [
				['Dear team,'],
				['A longer paragraph. '.repeat(30)],
				['Sincerely,'],
				['Priya Shah']
			],
			enclosures: ['A copy of the death certificate'],
			missing: []
		},
		{ author: 'Priya Shah' }
	);
	expect(pdf.subarray(0, 5).toString()).toBe('%PDF-');
	expect(pdf.length).toBeGreaterThan(1500);
	expect(pdf.subarray(-6).toString()).toContain('%%EOF');
});
