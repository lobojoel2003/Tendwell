import { expect, test } from '@playwright/test';
import { readFileSync } from 'node:fs';

test('the home page shows just three things', async ({ page }) => {
	await page.goto('/');
	await expect(page.getByRole('heading', { level: 1 })).toContainText(
		'You don’t have to do it all at once'
	);
	await expect(
		page.getByRole('heading', { name: 'For now, just these three things' })
	).toBeVisible();
	await expect(page.locator('.preview li')).toHaveCount(3);
});

test('the checklist can be read and tailored without an account', async ({ page }) => {
	await page.goto('/checklist');
	await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
	const all = await page.locator('.tasks li').count();
	expect(all).toBeGreaterThan(20);

	await page.goto('/checklist?pets=no&vehicle=no&renting=no');
	await expect(page.getByText(/Showing \d+ of \d+ steps/)).toBeVisible();
	expect(await page.locator('.tasks li').count()).toBeLessThan(all);

	await page.locator('.tasks li a').first().click();
	await expect(page.getByRole('link', { name: '← The whole checklist' })).toBeVisible();
});

test('guides open and link onwards', async ({ page }) => {
	await page.goto('/guides');
	const first = page.locator('.list a').first();
	const title = (await first.locator('.title').textContent())!;
	await first.click();
	await expect(page.getByRole('heading', { level: 1 })).toHaveText(title);
	await expect(page.getByText(/min read · Last reviewed/)).toBeVisible();
});

test('a letter can be downloaded as a PDF without an account', async ({ page }) => {
	await page.goto('/letters/notify-bank');
	await page.getByLabel('Your full name').fill('Priya Shah');
	await page.getByLabel('Your address').fill('12 Elm Street\nSpringfield, IL 62701');
	await page.getByLabel('Your relationship to them').fill('daughter');
	await page.getByLabel('Bank or credit union name').fill('First Community Bank');
	await page.getByLabel('Their full name').fill('Margaret Shah');
	await page.getByLabel('Date they died').fill('2026-11-02');
	await expect(page.locator('.paper')).toContainText(
		'Margaret Shah, a customer of First Community Bank, died on November 2, 2026'
	);

	const [download] = await Promise.all([
		page.waitForEvent('download'),
		page.getByRole('button', { name: 'Download PDF' }).click()
	]);
	expect(download.suggestedFilename()).toMatch(/^tendwell-notify-bank-\d{4}-\d{2}-\d{2}\.pdf$/);
	const bytes = readFileSync((await download.path())!);
	expect(bytes.subarray(0, 5).toString()).toBe('%PDF-');
});

test('unknown pages are gentle', async ({ page }) => {
	const response = await page.goto('/this-does-not-exist');
	expect(response?.status()).toBe(404);
	await expect(page.getByText('Nothing you did caused this.')).toBeVisible();
});

test('the health check reports the build', async ({ request }) => {
	const response = await request.get('/healthz');
	expect(response.ok()).toBe(true);
	const body = await response.json();
	expect(body).toMatchObject({ status: 'ok', database: 'ok' });
	expect(body.version).toMatch(/^\d+\.\d+\.\d+/);
});

test('private pages ask you to sign in', async ({ page }) => {
	await page.goto('/plans');
	await expect(page).toHaveURL(/\/login\?next=%2Fplans/);
});
