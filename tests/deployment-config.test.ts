import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type StaticWebAppConfig = {
  globalHeaders: Record<string, string>;
  mimeTypes: Record<string, string>;
  routes: Array<{ route: string; headers?: Record<string, string> }>;
};

const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as StaticWebAppConfig;

describe('static deployment response policy', () => {
  it('locks down documents and permits only the local camera/billing model', () => {
    expect(config.globalHeaders['Content-Security-Policy']).toContain("default-src 'self'");
    expect(config.globalHeaders['Content-Security-Policy']).toContain('https://api.sociobot.in');
    expect(config.globalHeaders['Content-Security-Policy']).toContain('https://pilot-api.sociobot.in');
    expect(config.globalHeaders['Permissions-Policy']).toContain('camera=(self)');
    expect(config.globalHeaders['X-Frame-Options']).toBe('DENY');
  });

  it('sets the manifest MIME type and cache split required by the PWA', () => {
    expect(config.mimeTypes['.webmanifest']).toBe('application/manifest+json');
    const assetRoute = config.routes.find((entry) => entry.route === '/assets/*');
    expect(assetRoute?.headers?.['Cache-Control']).toBe('public, max-age=31536000, immutable');
    for (const path of ['/', '/sw.js', '/manifest.webmanifest']) {
      expect(config.routes.find((entry) => entry.route === path)?.headers?.['Cache-Control']).toBe('no-cache, no-store, must-revalidate');
    }
  });
});
