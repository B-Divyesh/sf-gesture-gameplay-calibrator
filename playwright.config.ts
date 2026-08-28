import { defineConfig, devices } from '@playwright/test';

const externalBaseURL = process.env.PLAYWRIGHT_BASE_URL;

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    baseURL: externalBaseURL ?? 'http://127.0.0.1:4173',
    trace: 'retain-on-failure',
    launchOptions: { args: ['--use-fake-device-for-media-stream', '--use-fake-ui-for-media-stream'] },
  },
  webServer: externalBaseURL ? undefined : {
    command: 'npm run preview -- --host 127.0.0.1',
    port: 4173,
    reuseExistingServer: true,
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'mobile-390', use: { viewport: { width: 390, height: 844 }, deviceScaleFactor: 1, isMobile: true, hasTouch: true } },
  ],
});
