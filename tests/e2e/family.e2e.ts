import { expect, test, type Page } from '@playwright/test';

const unique = () => `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

async function signUp(page: Page, name: string) {
	await page.getByLabel('Your name').fill(name);
	await page
		.getByLabel('Email')
		.fill(`${name.split(' ')[0].toLowerCase()}.${unique()}@example.com`);
	await page.getByLabel('Choose a password').fill('a-gentle-test-password');
	await page.getByRole('button', { name: 'Create account' }).click();
}

test('a family shares a plan', async ({ browser }) => {
	// Priya starts a plan.
	const priya = await (await browser.newContext()).newPage();
	await priya.goto('/signup');
	await signUp(priya, 'Priya Shah');
	await expect(priya).toHaveURL(/\/plans\/new/);
	await priya.getByLabel('Who is this plan for?').fill('Margaret Shah');
	await priya.locator('input[name=q_pets][value=no]').check();
	await priya.getByRole('button', { name: 'Create the plan' }).click();
	await expect(priya.getByText('Your plan is ready.')).toBeVisible();
	await expect(priya.getByRole('heading', { level: 1 })).toHaveText(
		'For now, just these three things'
	);

	const steps = priya.locator('ol.steps > li');
	await expect(steps).toHaveCount(3);
	const firstTitle = (await steps.first().locator('h3').textContent())!.trim();

	// Finishing one brings the next one forward.
	await steps.first().getByRole('button', { name: 'Done' }).click();
	await expect(priya.getByText('That’s one less thing to carry.')).toBeVisible();
	await expect(steps.first().locator('h3')).not.toHaveText(firstTitle);
	await expect(priya.locator('.big')).toHaveText('1');

	// Setting one aside for a week.
	const restingTitle = (await steps.nth(2).locator('h3').textContent())!.trim();
	await steps.nth(2).getByRole('button', { name: 'Not this week' }).click();
	await expect(priya.getByRole('heading', { name: 'Resting until next week' })).toBeVisible();
	await expect(priya.locator('section', { hasText: 'Resting until next week' })).toContainText(
		restingTitle
	);

	// An invite link for Sam.
	await priya
		.getByRole('navigation', { name: 'Plan' })
		.getByRole('link', { name: 'People' })
		.click();
	await priya.getByRole('button', { name: 'Create an invite link' }).click();
	const invite = await priya.getByLabel('Your invite link').inputValue();
	expect(invite).toMatch(/\/invite\/[\w-]{40,}$/);

	// Sam joins and takes something on.
	const sam = await (await browser.newContext()).newPage();
	await sam.goto(invite);
	await expect(sam.getByRole('heading', { level: 1 })).toContainText(
		'Priya Shah has asked you to help with the plan for Margaret Shah'
	);
	await sam.getByRole('link', { name: 'Create an account' }).click();
	await signUp(sam, 'Sam Shah');
	await sam.getByRole('button', { name: 'Join the plan' }).click();
	await expect(sam.getByText('Your plan is ready.')).toBeVisible();

	const samFirst = sam.locator('ol.steps > li').first();
	const claimed = (await samFirst.locator('h3').textContent())!.trim();
	await samFirst.getByRole('button', { name: 'I’ll take this' }).click();
	await expect(samFirst.getByText('You’re on this')).toBeVisible();

	// Sam leaves a note on it.
	await samFirst.locator('h3 a').click();
	await sam.getByLabel('Add a note').fill('Called the funeral home. They will order 8 copies.');
	await sam.getByRole('button', { name: 'Save note' }).click();
	await expect(sam.locator('.notes li')).toContainText('They will order 8 copies.');

	// Priya sees Sam is handling it, and what he did.
	await priya
		.getByRole('navigation', { name: 'Plan' })
		.getByRole('link', { name: 'This week' })
		.click();
	const handled = priya.locator('section', { hasText: 'Being handled by others' });
	await expect(handled).toContainText(claimed);
	await expect(handled).toContainText('Sam is on this');
	await expect(priya.locator('.activity')).toContainText('Sam');
});

test('the accounts list closes things one at a time', async ({ page }) => {
	await page.goto('/signup');
	await signUp(page, 'Lena Ortiz');
	await page.getByLabel('Who is this plan for?').fill('Dad');
	await page.getByRole('button', { name: 'Create the plan' }).click();
	await page
		.getByRole('navigation', { name: 'Plan' })
		.getByRole('link', { name: 'Accounts' })
		.click();

	await page.getByLabel('Name', { exact: true }).fill('Electric company');
	await page.getByLabel('Kind').selectOption('utility');
	await page.getByRole('button', { name: 'Add to the list' }).click();
	const card = page.locator('li.account', { hasText: 'Electric company' });
	await expect(card).toBeVisible();
	await expect(card.getByRole('link', { name: 'Write a letter' })).toHaveAttribute(
		'href',
		/\/letters\/notify-utility\?/
	);

	await card.getByRole('button', { name: 'I’ve contacted them' }).click();
	await expect(
		page.getByRole('heading', { name: /Contacted, waiting to hear back/ })
	).toBeVisible();
	await page
		.locator('li.account', { hasText: 'Electric company' })
		.getByRole('button', { name: 'It’s closed' })
		.click();
	await expect(page.getByRole('heading', { name: /Closed or transferred/ })).toBeVisible();
});

test('the letter preview works without JavaScript', async ({ browser }) => {
	const page = await (await browser.newContext({ javaScriptEnabled: false })).newPage();
	await page.goto('/letters/cancel-subscription');
	await page.getByLabel('Your full name').fill('Priya Shah');
	await page.getByRole('button', { name: 'Update preview' }).click();
	await expect(page.locator('.paper')).toContainText('Priya Shah');
});
