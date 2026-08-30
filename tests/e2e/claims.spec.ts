import { readFile } from 'node:fs/promises';
import { expect, test } from '@playwright/test';

async function downloadedJson(page: import('@playwright/test').Page): Promise<Record<string, unknown>> {
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JSON profile' }).click();
  const download = await downloadPromise;
  const path = await download.path();
  if (!path) throw new Error('The exported profile was not available to the test.');
  return JSON.parse(await readFile(path, 'utf8')) as Record<string, unknown>;
}

test('@claim:private-processing camera use and export send no data off-origin', async ({ page, context, baseURL }) => {
  const productOrigin = new URL(baseURL!).origin;
  const outgoing = new Set<string>();
  page.on('request', (request) => outgoing.add(new URL(request.url()).origin));
  await context.grantPermissions(['camera'], { origin: productOrigin });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Try my camera in this demo' }).click();
  await page.getByLabel('Experiment name').fill('Private camera check');
  await page.getByRole('button', { name: 'Allow camera & begin' }).click();
  await expect.poll(() => page.locator('#camera').evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);
  await page.getByRole('button', { name: 'Record example 1' }).click();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await downloadedJson(page);
  expect([...outgoing]).toEqual([productOrigin]);
  expect(await context.cookies()).toEqual([]);
});

test('@claim:offline-reload the sample calibration reloads without a network', async ({ browser, baseURL }) => {
  const context = await browser.newContext({ baseURL });
  const page = await context.newPage();
  try {
    await page.goto('/demo');
    await page.evaluate(async () => { await navigator.serviceWorker.ready; });
    await page.reload();
    await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
    await context.setOffline(true);
    await page.reload();
    await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Test “Living room rhythm game”' })).toBeVisible();
    await expect(page.getByText('Offline — calibration still works')).toBeVisible();
  } finally {
    await context.setOffline(false);
    await context.close();
  }
});

test('@claim:calibration-boundaries sample proves three checkpoints, ten examples, and a 30-second replay', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.locator('.checkpoint-tab')).toHaveCount(3);
  await expect(page.locator('.checkpoint-tab')).toHaveText([/Hands up 10\/10/, /Lean left 10\/10/, /Small duck 10\/10/]);
  await page.clock.install();
  await page.getByRole('button', { name: 'Replay 30 seconds' }).click();
  await page.clock.fastForward(31_000);
  const profile = await downloadedJson(page) as { checkpoints: Array<{ examples: number[][] }>; lastTest: { durationSeconds: number } };
  expect(profile.checkpoints).toHaveLength(3);
  expect(profile.checkpoints.map((checkpoint) => checkpoint.examples.length)).toEqual([10, 10, 10]);
  expect(profile.lastTest.durationSeconds).toBe(30);
});

test('@claim:json-export export contains numeric signatures and no image or video payload', async ({ page }) => {
  await page.goto('/demo');
  const profile = await downloadedJson(page) as { checkpoints: Array<{ examples: unknown[][] }> };
  const keys: string[] = [];
  const visit = (value: unknown): void => {
    if (!value || typeof value !== 'object') return;
    for (const [key, nested] of Object.entries(value)) {
      keys.push(key.toLowerCase());
      visit(nested);
    }
  };
  visit(profile);
  expect(keys).not.toContain('image');
  expect(keys).not.toContain('video');
  expect(profile.checkpoints[0]?.examples[0]).toHaveLength(352);
  expect(profile.checkpoints[0]?.examples[0]?.every((value) => Number.isFinite(value))).toBe(true);
});

test('@claim:local-persistence demo changes survive reload and reset without touching real data', async ({ page, context, baseURL }) => {
  await context.grantPermissions(['camera'], { origin: new URL(baseURL!).origin });
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Try my camera in this demo' }).click();
  await page.getByLabel('Experiment name').fill('Saved demo rehearsal');
  await page.getByRole('button', { name: 'Allow camera & begin' }).click();
  await expect.poll(() => page.locator('#camera').evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);
  await page.getByRole('button', { name: 'Record example 1' }).click();
  await page.reload();
  await expect(page.getByLabel('Experiment name')).toHaveValue('Saved demo rehearsal');
  await expect(page.getByRole('button', { name: 'Resume in-progress calibration' })).toBeVisible();
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page.getByRole('heading', { name: 'Test “Living room rhythm game”' })).toBeVisible();
  const databases = await page.evaluate(async () => (await indexedDB.databases()).map((database) => database.name));
  expect(databases).toContain('movemap-demo');
  expect(databases).not.toContain('movemap-local');
});

test('@claim:free-core-price the free workbench and one-time Maker Pack price are explicit', async ({ page }) => {
  await page.goto('/demo');
  await expect(page.getByText('Calibration, testing, safety information, and JSON export stay free.')).toBeVisible();
  await expect(page.locator('.price')).toContainText('$12');
  await expect(page.locator('.price')).toContainText('one-time purchase');
  await expect(page.getByRole('link', { name: 'Buy Maker Pack' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/checkout');
});

test('@claim:maker-helper-export a valid Maker Pack license exports the calibrated helper', async ({ page }) => {
  await page.route('https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/verify?license=*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto('/demo?license=recorded-valid-license');
  await expect(page.getByText('Maker Pack is active on this device')).toBeVisible();
  const downloadPromise = page.waitForEvent('download');
  await page.getByRole('button', { name: 'Export JS trigger helper' }).click();
  const path = await (await downloadPromise).path();
  if (!path) throw new Error('The JavaScript helper was not available to the test.');
  const source = await readFile(path, 'utf8');
  expect(source).toContain('export function createMoveMapTrigger');
  expect(source).toContain('holdMs = 450');
  expect(source).toContain('releaseAt = 0.58');
});
