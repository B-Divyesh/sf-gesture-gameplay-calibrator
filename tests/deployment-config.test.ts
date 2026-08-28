import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type StaticWebAppConfig = {
  globalHeaders: Record<string, string>;
  mimeTypes: Record<string, string>;
  routes: Array<{ route: string; headers?: Record<string, string> }>;
};

const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as StaticWebAppConfig;

function pngDimensions(path: string): { width: number; height: number } {
  const bytes = readFileSync(path);
  expect(bytes.subarray(1, 4).toString()).toBe('PNG');
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}

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

  it('ships icons at the exact dimensions advertised by the manifest', () => {
    expect(pngDimensions('public/icons/icon-192.png')).toEqual({ width: 192, height: 192 });
    expect(pngDimensions('public/icons/icon-512.png')).toEqual({ width: 512, height: 512 });
    const manifest = JSON.parse(readFileSync('public/manifest.webmanifest', 'utf8')) as { icons: Array<{ src: string; sizes: string; purpose: string }> };
    expect(manifest.icons).toEqual(expect.arrayContaining([
      expect.objectContaining({ src: expect.stringContaining('/icons/icon-512.png'), sizes: '512x512', purpose: expect.stringContaining('maskable') }),
    ]));
  });
});
