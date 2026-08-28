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
  expect(accessibility.violations).toEqual([]);
  await page.keyboard.press('Tab');
  await expect(page.locator('.skip-link')).toBeFocused();
  expect(errors).toEqual([]);
});

test('the free experience is same-origin and creates no license state', async ({ page, baseURL }) => {
  const origins = new Set<string>();
  page.on('request', (request) => origins.add(new URL(request.url()).origin));
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect([...origins]).toEqual([new URL(baseURL!).origin]);
  expect(await page.evaluate(() => localStorage.getItem('sb_license:gesture-gameplay-calibrator'))).toBeNull();
});

test('the layout does not overflow and reduced motion is effectively instant', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const transitionSeconds = await page.locator('.primary-button').first().evaluate((element) => (
    Number.parseFloat(getComputedStyle(element).transitionDuration)
  ));
  expect(transitionSeconds).toBeLessThanOrEqual(0.001);
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

test('records ten examples and completes a reliability replay', async ({ page, context, baseURL }) => {
  await context.grantPermissions(['camera'], { origin: new URL(baseURL!).origin });
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

test('persists and resumes setup, every partial capture, and checkpoint clearing', async ({ page, context, baseURL }) => {
  await context.grantPermissions(['camera'], { origin: new URL(baseURL!).origin });
  await page.goto('/');
  await page.getByLabel('Experiment name').fill('Reload rehearsal');
  await page.getByLabel('Checkpoint 1 (required)').fill('Point left');
  await page.getByLabel('Checkpoint 2 (optional)').fill('Point right');
  await page.getByRole('button', { name: 'Allow camera & begin' }).click();
  await expect.poll(() => page.locator('#camera').evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);

  for (let example = 1; example <= 3; example += 1) {
    // Each committed capture re-renders the workbench and reattaches the
    // existing stream, so wait for the new video element to have a frame.
    await expect.poll(() => page.locator('#camera').evaluate((video: HTMLVideoElement) => video.readyState)).toBeGreaterThanOrEqual(2);
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

test('Space preserves the native action of the focused Clear button', async ({ page, context, baseURL }) => {
  await context.grantPermissions(['camera'], { origin: new URL(baseURL!).origin });
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

test('checkout and returned licenses use only the registered Sociobot product', async ({ page }) => {
  const token = 'signed-license-regression-token';
  await page.route('https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/verify?license=*', async (route) => {
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok', expires_at: null }) });
  });
  await page.goto(`/?license=${token}#maker-pack`);
  await expect(page).not.toHaveURL(/license=/);
  await expect.poll(() => page.evaluate(() => localStorage.getItem('sb_license:gesture-gameplay-calibrator'))).toBe(token);
  await expect(page.getByText('Maker Pack is active on this device')).toBeVisible();

  await page.evaluate(() => {
    localStorage.removeItem('sb_license:gesture-gameplay-calibrator');
    localStorage.removeItem('sb_license:gesture-gameplay-calibrator:verdict');
  });
  await page.reload();
  await expect(page.getByRole('link', { name: 'Buy Maker Pack' })).toHaveAttribute(
    'href',
    'https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/checkout',
  );
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

test('an installed replacement worker announces the available update', async ({ page }) => {
  await page.addInitScript(() => {
    const worker = new EventTarget() as EventTarget & { state: string };
    worker.state = 'installing';
    const registration = new EventTarget() as EventTarget & { installing: typeof worker };
    registration.installing = worker;
    Object.defineProperty(navigator, 'serviceWorker', {
      configurable: true,
      value: {
        controller: {},
        register: async () => {
          window.setTimeout(() => {
            registration.dispatchEvent(new Event('updatefound'));
            worker.state = 'installed';
            worker.dispatchEvent(new Event('statechange'));
          }, 50);
          return registration;
        },
      },
    });
  });
  await page.goto('/');
  await expect(page.getByText('A fresh notebook is ready. Reload to update.')).toBeVisible();
});
