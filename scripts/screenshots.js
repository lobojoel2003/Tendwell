// Takes the screenshots used in the README.
//
//   npm run build
//   DATABASE_PATH=/tmp/tendwell-shots.db ORIGIN=http://localhost:3000 node build &
//   BASE_URL=http://localhost:3000 npm run screenshots
//
// It creates two demo people and a demo plan through the real interface, so
// use a throwaway database.
import { chromium, devices } from '@playwright/test';
import { mkdirSync } from 'node:fs';

const base = process.env.BASE_URL ?? 'http://localhost:3000';
const out = new URL('../docs/images/', import.meta.url).pathname;
mkdirSync(out, { recursive: true });

const browser = await chromium.launch({
	executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE || undefined
});
const desktop = { viewport: { width: 1280, height: 860 }, deviceScaleFactor: 2 };
const stamp = Date.now();

async function signUp(page, name, email) {
	await page.goto(`${base}/signup`);
	await page.fill('#name', name);
	await page.fill('#email', email);
	await page.fill('#password', 'a-gentle-demo-password');
	await page.click('button[type=submit]');
}

async function act(page, step, label) {
	await page.locator(`[data-step="${step}"] button:has-text("${label}")`).first().click();
	await page.waitForLoadState('networkidle');
}

const shot = (page, name, options = {}) =>
	page.screenshot({ path: `${out}${name}.png`, ...options });

// Priya starts a plan for her mother.
const priya = await (await browser.newContext(desktop)).newPage();
await signUp(priya, 'Priya Shah', `priya.${stamp}@example.com`);
await priya.waitForURL('**/plans/new');
await priya.fill('#person_name', 'Margaret Shah');
await priya.fill('#date_of_death', new Date(Date.now() - 9 * 864e5).toISOString().slice(0, 10));
for (const [q, a] of Object.entries({
	married: 'no',
	dependents: 'no',
	working: 'no',
	benefits: 'yes',
	veteran: 'no',
	homeowner: 'yes',
	renting: 'no',
	vehicle: 'yes',
	pets: 'yes',
	will: 'yes'
})) {
	await priya.check(`input[name=q_${q}][value=${a}]`);
}
await priya.click('button[type=submit]');
await priya.waitForURL(/welcome=1/);
const planUrl = priya.url().split('?')[0];

for (const step of [
	'get-a-legal-pronouncement',
	'choose-a-funeral-home',
	'look-after-pets',
	'secure-the-home'
]) {
	await priya.goto(`${planUrl}/tasks`);
	await act(priya, step, 'Done');
}

// Sam joins through an invite link and takes something on.
await priya.goto(`${planUrl}/people`);
await priya.click('button:has-text("Create an invite link")');
const invite = await priya.inputValue('#invite-link');

const sam = await (await browser.newContext(desktop)).newPage();
await sam.goto(invite);
await sam.click('text=Create an account');
await sam.fill('#name', 'Sam Shah');
await sam.fill('#email', `sam.${stamp}@example.com`);
await sam.fill('#password', 'a-gentle-demo-password');
await sam.click('button[type=submit]');
await sam.waitForURL(/\/invite\//);
await sam.click('button:has-text("Join the plan")');
await sam.waitForURL(/welcome=1/);
await sam.goto(`${planUrl}/tasks`);
await act(sam, 'order-death-certificates', 'I’ll take this');
await sam.goto(`${planUrl}/tasks/order-death-certificates`);
await sam.fill(
	'#note-body',
	'Ordered 8 certified copies through the funeral home. They should arrive by Friday.'
);
await sam.click('button:has-text("Save note")');
await sam.waitForLoadState('networkidle');

// The accounts list.
await priya.goto(`${planUrl}/accounts`);
for (const [name, kind, ref] of [
	['First Community Bank, checking', 'bank', '4421'],
	['Visa credit card', 'card', '9013'],
	['Electric company', 'utility', ''],
	['Streaming subscription', 'subscription', ''],
	['Mobile phone plan', 'phone', '']
]) {
	await priya.fill('#name', name);
	await priya.selectOption('#kind', kind);
	await priya.fill('#reference', ref);
	await priya.click('form.add button[type=submit]');
	await priya.waitForSelector(`h3:has-text("${name}")`);
}
await priya
	.locator('li:has(h3:has-text("Streaming subscription")) button:has-text("I’ve contacted them")')
	.click();
await priya.waitForLoadState('networkidle');
await priya
	.locator('li:has(h3:has-text("Streaming subscription")) button:has-text("It’s closed")')
	.click();
await priya.waitForLoadState('networkidle');
await priya
	.locator('li:has(h3:has-text("Visa credit card")) button:has-text("I’ve contacted them")')
	.click();
await priya.waitForLoadState('networkidle');
await priya.goto(`${planUrl}/accounts`);
await shot(priya, 'accounts');

// The pages people see.
await priya.goto(`${base}/`);
await shot(priya, 'home');

await priya.goto(planUrl);
await shot(priya, 'this-week');

await priya.goto(`${planUrl}/tasks/order-death-certificates`);
await shot(priya, 'step');

await priya.goto(`${base}/checklist`);
await shot(priya, 'checklist');

await priya.goto(`${base}/guides/start-here`);
await shot(priya, 'guide');

await priya.goto(
	`${base}/letters/notify-bank?plan=${planUrl.split('/').pop()}&recipient_name=First%20Community%20Bank&account_number=4421`
);
await priya.fill('#f-sender_address', '12 Elm Street\nSpringfield, IL 62701');
await priya.fill('#f-relationship', 'daughter');
await priya.fill('#f-recipient_address', 'Estates Team\nPO Box 100\nChicago, IL 60601');
await priya.evaluate(() => {
	if (document.activeElement instanceof HTMLElement) document.activeElement.blur();
	window.scrollTo(0, 0);
});
await shot(priya, 'letter');

// Dark mode, and a phone.
const dark = await (await browser.newContext({ ...desktop, colorScheme: 'dark' })).newPage();
await dark.context().addCookies(await priya.context().cookies());
await dark.goto(planUrl);
await shot(dark, 'this-week-dark');

const phone = await (await browser.newContext({ ...devices['iPhone 13'] })).newPage();
await phone.context().addCookies(await priya.context().cookies());
await phone.goto(planUrl);
await shot(phone, 'mobile');

await browser.close();
console.log(`Saved screenshots to ${out}`);
