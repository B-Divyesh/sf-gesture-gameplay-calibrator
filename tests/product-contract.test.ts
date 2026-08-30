import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';

type Claim = { id: string; claim: string; where: string; test: string; sandbox: string };

describe('release product contract', () => {
  it('lists every relied-on claim with one matching browser test tag', () => {
    const claims = JSON.parse(readFileSync('.factory/claims.json', 'utf8')) as Claim[];
    const browserTests = readFileSync('tests/e2e/claims.spec.ts', 'utf8');
    expect(claims.length).toBeGreaterThanOrEqual(6);
    expect(new Set(claims.map((claim) => claim.id)).size).toBe(claims.length);
    for (const claim of claims) {
      expect(claim.claim).not.toBe('');
      expect(claim.where).not.toBe('');
      expect(claim.sandbox).not.toBe('');
      expect(claim.test).toBe(`npm run test:e2e -- --grep @claim:${claim.id}`);
      expect(browserTests.match(new RegExp(`@claim:${claim.id}(?![a-z-])`, 'g'))).toHaveLength(1);
    }
  });

  it('documents the one-click demo and its isolated storage namespace', () => {
    const demo = readFileSync('.factory/demo.md', 'utf8');
    const app = readFileSync('src/main.ts', 'utf8');
    const storage = readFileSync('src/storage.ts', 'utf8');
    expect(app).toContain('Try it with sample data');
    expect(app).toContain('Demo — sample data, nothing is saved');
    expect(app).toContain('Reset demo');
    expect(app).toContain('Start for real');
    expect(storage).toContain("const DEMO_DB_NAME = 'movemap-demo'");
    expect(storage).toContain("const LOCAL_DB_NAME = 'movemap-local'");
    expect(demo).toContain('`movemap-demo`');
  });

  it('ships crawler metadata, discovery files, and a real 404 response override', () => {
    const home = readFileSync('index.html', 'utf8');
    const robots = readFileSync('public/robots.txt', 'utf8');
    const sitemap = readFileSync('public/sitemap.xml', 'utf8');
    const config = JSON.parse(readFileSync('public/staticwebapp.config.json', 'utf8')) as {
      responseOverrides?: Record<string, { rewrite?: string }>;
    };
    for (const token of ['rel="canonical"', 'property="og:title"', 'name="twitter:card"', 'rel="apple-touch-icon"']) {
      expect(home).toContain(token);
    }
    expect(robots).toContain('Sitemap: https://gesture-gameplay-calibrator.sociobot.in/sitemap.xml');
    expect(sitemap).toContain('https://gesture-gameplay-calibrator.sociobot.in/demo');
    expect(config.responseOverrides?.['404']?.rewrite).toBe('/404.html');
    expect(readFileSync('404.html', 'utf8')).toContain('Page not found — MoveMap');
  });

  it('keeps the mandatory copy audit current and free of unresolved flags', () => {
    const audit = readFileSync('.factory/copy-audit.md', 'utf8');
    expect(audit).toContain('No item exceeds 22 words.');
    expect(audit).toContain('## Terminology table');
    expect(audit).not.toContain('UNRESOLVED');
  });
});
