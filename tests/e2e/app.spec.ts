import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('home is semantic, keyboard-ready, and free of console errors', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle(/MoveMap/);
  await expect(page.locator('main')).toHaveCount(1);
  await expect(page.locator('h1')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toContainText('gesture');
  await expect(page.locator('img[alt]')).toHaveCount(1);
  const accessibility = await new AxeBuilder({ page }).analyze();
  expect(accessibility.violations.filter((violation) => ['serious', 'critical'].includes(violation.impact ?? ''))).toEqual([]);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  expect(errors).toEqual([]);
});

test('setup explains a declined camera and offers a recovery path', async ({ page, context }) => {
  await page.addInitScript(() => {
    Object.defineProperty(navigator.mediaDevices, 'getUserMedia', {
      configurable: true,
      value: () => Promise.reject(new DOMException('Permission denied', 'NotAllowedError')),
    });
  });
  await context.clearPermissions();
  await page.goto('/');
  await page.getByLabel('Experiment name').fill('Desk jump');
  await page.getByRole('button', { name: 'Allow camera & begin' }).click();
  await expect(page.getByRole('alert')).not.toBeEmpty();
});

test('rejects malformed imports without replacing the saved calibration', async ({ page }) => {
  await page.goto('/');
  const signature = Array.from({ length: 352 }, (_, index) => index / 1000);
  const savedProfile = {
    schema: 'movemap-profile/v1', id: 'saved-profile', name: 'Keep this calibration',
    createdAt: '2026-08-28T00:00:00.000Z', updatedAt: '2026-08-28T00:01:00.000Z',
    frame: { width: 24, height: 18, feature: 'sobel-edge-24x18' }, settings: { holdMs: 450, releaseThreshold: 0.58 },
    checkpoints: [{ id: 'saved-checkpoint', name: 'Hands up', examples: Array.from({ length: 10 }, () => signature), centroid: signature, threshold: .5 }],
  };
  await page.evaluate(async (profile) => {
    const database = await new Promise<IDBDatabase>((resolve, reject) => {
      const request = indexedDB.open('movemap-local', 1);
      request.onsuccess = () => resolve(request.result);
      request.onerror = () => reject(request.error);
    });
    await new Promise<void>((resolve, reject) => {
      const transaction = database.transaction('profiles', 'readwrite');
      transaction.objectStore('profiles').put(profile, 'current');
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
    });
    database.close();
  }, savedProfile);
  await page.reload();
  await expect(page.getByLabel('Experiment name')).toHaveValue('Keep this calibration');
  await page.locator('#import-file').setInputFiles({
    name: 'malformed.json', mimeType: 'application/json',
    buffer: Buffer.from('{"schema":"movemap-profile/v1","checkpoints":[{}]}'),
  });
  await expect(page.getByRole('alert')).toContainText('not a valid MoveMap v1 profile');
  await page.reload();
  await expect(page.getByLabel('Experiment name')).toHaveValue('Keep this calibration');
});

test('records ten examples and completes a reliability replay', async ({ page, context }) => {
  await context.grantPermissions(['camera'], { origin: 'http://127.0.0.1:4173' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Allow camera & begin' }).click();
  await expect(page.getByRole('heading', { name: 'Hold: Hands up' })).toBeVisible();
  for (let example = 1; example <= 10; example += 1) {
    const button = page.getByRole('button', { name: `Record example ${example}` });
    await expect(button).toBeVisible();
    await expect.poll(() => page.locator('#camera').evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);
    await button.click();
  }
  const startReplay = page.getByRole('button', { name: 'Start 30-second replay' });
  await expect(startReplay).toBeVisible();
  await page.clock.install();
  await startReplay.click();
  await page.clock.fastForward(31_000);
  await expect(page.getByRole('button', { name: 'Export JSON profile' })).toBeVisible();
});

test('persists and resumes setup, every partial capture, and checkpoint clearing', async ({ page, context }) => {
  await context.grantPermissions(['camera'], { origin: 'http://127.0.0.1:4173' });
  await page.goto('/');
  await page.getByLabel('Experiment name').fill('Reload rehearsal');
  await page.getByLabel('Checkpoint 1 (required)').fill('Point left');
  await page.getByLabel('Checkpoint 2 (optional)').fill('Point right');
  await page.getByRole('button', { name: 'Allow camera & begin' }).click();
  await expect.poll(() => page.locator('#camera').evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);

  for (let example = 1; example <= 3; example += 1) {
    await page.getByRole('button', { name: `Record example ${example}` }).click();
    await expect.poll(() => page.evaluate(async () => {
      const database = await new Promise<IDBDatabase>((resolve, reject) => {
        const request = indexedDB.open('movemap-local', 1);
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error);
      });
      const count = await new Promise<number>((resolve, reject) => {
        const request = database.transaction('profiles').objectStore('profiles').get('current');
        request.onsuccess = () => resolve(request.result.checkpoints[0].examples.length as number);
        request.onerror = () => reject(request.error);
      });
      database.close();
      return count;
    })).toBe(example);
  }

  await page.reload();
  await expect(page.getByLabel('Experiment name')).toHaveValue('Reload rehearsal');
  await expect(page.getByLabel('Checkpoint 1 (required)')).toHaveValue('Point left');
  await expect(page.getByLabel('Checkpoint 2 (optional)')).toHaveValue('Point right');
  await page.getByRole('button', { name: 'Resume in-progress calibration' }).click();
  await expect(page.getByRole('button', { name: 'Record example 4' })).toBeVisible();
  await page.getByRole('button', { name: 'Clear this checkpoint' }).click();
  await expect(page.getByRole('button', { name: 'Record example 1' })).toBeVisible();
  await page.reload();
  await page.getByRole('button', { name: 'Resume in-progress calibration' }).click();
  await expect(page.getByRole('button', { name: 'Record example 1' })).toBeVisible();
});

test('Space preserves the native action of the focused Clear button', async ({ page, context }) => {
  await context.grantPermissions(['camera'], { origin: 'http://127.0.0.1:4173' });
  await page.goto('/');
  await page.getByRole('button', { name: 'Allow camera & begin' }).click();
  await expect.poll(() => page.locator('#camera').evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);
  await page.getByRole('button', { name: 'Record example 1' }).click();
  const clear = page.getByRole('button', { name: 'Clear this checkpoint' });
  await clear.focus();
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: 'Record example 1' })).toBeVisible();
  await expect(clear).toBeDisabled();
});

test('navigation and legal links keep 44px touch targets', async ({ page }) => {
  await page.goto('/');
  for (const locator of [
    page.locator('.brand'),
    page.locator('.purchase-note a').first(),
    page.locator('.purchase-note a').last(),
    page.locator('footer nav a').first(),
    page.locator('footer nav a').nth(1),
    page.locator('footer nav a').last(),
  ]) {
    const box = await locator.boundingBox();
    expect(box?.height).toBeGreaterThanOrEqual(44);
  }
});

test('privacy and terms are direct, standalone routes', async ({ page }) => {
  await page.goto('/privacy/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Privacy');
  await page.goto('/terms/');
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Terms');
});

test('previously visited app shell works offline', async ({ page, context }) => {
  await page.goto('/');
  await page.evaluate(async () => { await navigator.serviceWorker.ready; });
  await page.reload();
  await expect.poll(() => page.evaluate(() => Boolean(navigator.serviceWorker.controller))).toBe(true);
  await expect.poll(() => page.evaluate(async () => {
    const scriptPath = document.querySelector<HTMLScriptElement>('script[type="module"]')?.src;
    return scriptPath ? Boolean(await caches.match(scriptPath)) : false;
  })).toBe(true);
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { level: 1 })).toContainText('gesture');
  await expect(page.getByText('Offline — calibration still works')).toBeVisible();
});
