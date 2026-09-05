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

async function storedDemoProfile(page: import('@playwright/test').Page): Promise<Record<string, unknown>> {
  return page.evaluate(async () => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('movemap-demo', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    const profile = await new Promise<Record<string, unknown>>((resolve, reject) => {
      const request = database.transaction('profiles').objectStore('profiles').get('current');
      request.onsuccess = () => resolve(request.result as Record<string, unknown>);
      request.onerror = () => reject(request.error);
    });
    database.close();
    return profile;
  });
}

function nestedKeys(value: unknown): string[] {
  if (!value || typeof value !== 'object') return [];
  return Object.entries(value).flatMap(([key, nested]) => [key.toLowerCase(), ...nestedKeys(nested)]);
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
  await expect(page.getByRole('meter', { name: 'Live confidence' })).toBeVisible();
  const profile = await downloadedJson(page) as { checkpoints: Array<{ examples: number[][]; centroid: number[]; threshold: number }>; lastTest: { durationSeconds: number } };
  expect(profile.checkpoints).toHaveLength(3);
  expect(profile.checkpoints.map((checkpoint) => checkpoint.examples.length)).toEqual([10, 10, 10]);
  expect(profile.lastTest.durationSeconds).toBe(30);
  for (const checkpoint of profile.checkpoints) {
    const distances = checkpoint.examples.map((example) => Math.sqrt(example.reduce(
      (sum, value, index) => sum + (value - (checkpoint.centroid[index] ?? 0)) ** 2,
      0,
    ) / example.length));
    const expectedThreshold = Math.min(1.7, Math.max(0.36, Math.max(...distances) * 1.22));
    expect(checkpoint.threshold).toBeCloseTo(expectedThreshold, 10);
  }
});

test('@claim:json-export export contains numeric signatures and no image or video payload', async ({ page }) => {
  await page.goto('/demo');
  const savedProfile = await storedDemoProfile(page) as { checkpoints: Array<{ examples: unknown[][] }> };
  const profile = await downloadedJson(page) as { checkpoints: Array<{ examples: unknown[][] }> };
  for (const candidate of [savedProfile, profile]) {
    const keys = nestedKeys(candidate);
    expect(keys).not.toContain('image');
    expect(keys).not.toContain('video');
    expect(keys).not.toContain('face');
    expect(keys).not.toContain('identity');
    expect(candidate.checkpoints[0]?.examples[0]).toHaveLength(352);
    expect(candidate.checkpoints[0]?.examples[0]?.every((value) => Number.isFinite(value))).toBe(true);
  }
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

test('@claim:maker-pack-checkout payment stays out of the app and the catalog entry opens hosted checkout', async ({ page, request, baseURL }) => {
  await page.goto('/demo');
  await expect(page.locator('iframe, input[autocomplete^="cc-"]')).toHaveCount(0);
  const scriptOrigins = await page.locator('script[src]').evaluateAll((scripts) => scripts.map((script) => new URL((script as HTMLScriptElement).src).origin));
  expect([...new Set(scriptOrigins)]).toEqual([new URL(baseURL!).origin]);

  const catalogResponse = await request.get('https://api.sociobot.in/api/v1/products', { failOnStatusCode: false });
  expect(catalogResponse.status()).toBe(200);
  const catalog = await catalogResponse.json() as { data: Array<Record<string, unknown>> };
  const product = catalog.data.find((candidate) => candidate.slug === 'gesture-gameplay-calibrator');
  if (!product) throw new Error('MoveMap Maker Pack is missing from the production catalog.');
  expect(product).toEqual({
    checkout_url: 'https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/checkout',
    currency: 'USD',
    name: 'MoveMap Maker Pack',
    price_minor: 1200,
    product_url: 'https://gesture-gameplay-calibrator.sociobot.in/',
    slug: 'gesture-gameplay-calibrator',
  });

  const checkoutResponse = await request.get(String(product.checkout_url), { failOnStatusCode: false, maxRedirects: 0 });
  expect(checkoutResponse.status()).toBe(303);
  expect(checkoutResponse.headers().location).toMatch(/^https:\/\/checkout\.dodopayments\.com\/session\//);
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
