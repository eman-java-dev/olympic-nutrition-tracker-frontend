import { expect, test, type Page } from '@playwright/test';

const api = 'http://localhost:8080/api';
const password = process.env.BROWSER_TEST_PASSWORD;
if (!password) throw new Error('Set BROWSER_TEST_PASSWORD for the disposable fixture.');

async function signIn(page: Page, username: string) {
  await page.goto('/signin');
  await page.getByLabel('Username').fill(username);
  await page.getByLabel('Password', { exact: true }).fill(password!);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/home$/);
}

test('administrator and both athletes see their respective records on direct routes', async ({ browser }) => {
  for (const fixture of [
    { user: 'exam_admin', avery: true, casey: true },
    { user: 'exam_athlete', avery: true, casey: false },
    { user: 'browser_other_athlete', avery: false, casey: true },
  ]) {
    const page = await browser.newPage({ baseURL: 'http://localhost:4200' });
    try {
      await signIn(page, fixture.user);
      await page.goto('/athletes');
      await page.reload();
      await expect(page.getByText('Avery Sprint', { exact: true })).toHaveCount(Number(fixture.avery));
      await expect(page.getByText('Casey Field', { exact: true })).toHaveCount(Number(fixture.casey));
      await page.goto('/coaches');
      await expect(page.getByText('Morgan Vale', { exact: true })).toBeVisible();
    } finally {
      await page.close();
    }
  }
});

test('coach can save a valid entry and retains the input after a failed save', async ({ page }) => {
  await signIn(page, 'exam_coach');
  await page.goto('/nutrition');
  const athlete = page.getByRole('combobox', { name: 'Athlete' });
  await athlete.selectOption({ label: 'Avery Sprint' });
  await expect(athlete.getByRole('option', { name: 'Casey Field' })).toHaveCount(0);
  const notes = page.getByRole('textbox', { name: 'Notes' });
  await notes.fill('Synthetic failed save');
  const date = page.getByLabel('Date', { exact: true });
  await date.fill('2026-01-05');
  const add = page.getByRole('button', { name: 'Add', exact: true });
  const url = api + '/nutrition-entries';
  const failSave = async (route: import('@playwright/test').Route) => {
    if (route.request().method() === 'POST') {
      await route.fulfill({
        status: 400,
        contentType: 'application/json',
        headers: { 'Access-Control-Allow-Origin': 'http://localhost:4200' },
        body: '{"message":"Synthetic validation"}',
      });
    } else {
      await route.continue();
    }
  };
  await page.route(url, failSave);
  await add.click();
  await expect(page.getByRole('alert')).toBeVisible();
  await expect(notes).toHaveValue('Synthetic failed save');
  await page.unroute(url, failSave);

  const marker = 'Browser check ' + crypto.randomUUID();
  await notes.fill(marker);
  await add.click();
  await expect(page.getByRole('status')).toBeVisible();
  await expect(page.getByText(marker, { exact: true })).toBeVisible();
});

test('expired sessions return to sign-in and the API rejects a cross-account read', async ({ page }) => {
  const login = await fetch(api + '/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username: 'exam_athlete', password }),
  });
  expect(login.status).toBe(200);
  const user = await login.json() as { token: string };
  const foreign = await fetch(api + '/athletes/2', { headers: { Authorization: 'Bearer ' + user.token } });
  expect(foreign.status).toBe(404);

  await page.clock.install();
  await signIn(page, 'exam_athlete');
  await page.clock.fastForward(24 * 60 * 60 * 1000 + 1000);
  await expect(page).toHaveURL(/\/signin$/);
});

test('an unlinked account has an empty athlete view and can still open the coach directory', async ({ page }) => {
  const username = 'browser-unlinked-' + crypto.randomUUID().slice(0, 8);
  const registration = await fetch(api + '/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ username, password }),
  });
  expect(registration.status).toBe(200);
  await signIn(page, username);
  await page.goto('/athletes');
  await expect(page.getByText('No athletes available.', { exact: true })).toBeVisible();
  await page.goto('/coaches');
  await expect(page.getByText('Morgan Vale', { exact: true })).toBeVisible();
});

test('the local header policy permits keyboard sign-in and blocks inline script', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  const navigation = await page.goto('/signin');
  expect(navigation?.headers()['content-security-policy']).toContain("script-src 'self'");
  await page.getByRole('button', { name: 'FR', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'fr');
  await expect(page.getByLabel('Mot de passe', { exact: true })).toBeVisible();
  await page.getByRole('button', { name: 'EN', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
  const username = page.getByLabel('Username');
  const secretInput = page.getByLabel('Password', { exact: true });
  await username.fill('exam_coach');
  await username.press('Tab');
  await expect(secretInput).toBeFocused();
  await secretInput.fill(password!);
  const inlineScriptRan = await page.evaluate(() => {
    const script = document.createElement('script');
    script.textContent = "document.body.dataset.syntheticInlineScript = 'ran'";
    document.head.append(script);
    return document.body.dataset['syntheticInlineScript'] === 'ran';
  });
  expect(inlineScriptRan).toBe(false);
  const submit = page.getByRole('button', { name: 'Sign in', exact: true });
  await secretInput.press('Tab');
  await expect(submit).toBeFocused();
  await expect(submit).toBeEnabled();
  await submit.press('Enter');
  await expect(page).toHaveURL(/\/home$/);
});
