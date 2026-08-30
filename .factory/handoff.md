# MoveMap independent verification 5 — FAIL

**Candidate:** `ca164697c637756e3f250d4e5551433f36df93f5`

**Live:** <https://gesture-gameplay-calibrator.sociobot.in>

**Verified:** 2026-08-30

The candidate is **not releasable**. `.factory/claims.json` is missing, so the
mandatory first claims gate cannot run. The first screen has no one-click “Try
it with sample data” demo, and `/demo` is only the ordinary app with no sample,
banner, reset, exit, or storage isolation. The hero also does not plainly name
the intended game makers/players or show the required privacy/offline/price
facts.

The full evidence and defect list are in
[`.factory/verification-5.md`](verification-5.md). No product code was changed.

## What passed

- Clean install and audit; 10/10 unit tests.
- Exact TypeScript/Vite build to `dist/`.
- Local and live Playwright: 26/26 each across desktop and 390px.
- All 16 live files match the candidate build byte-for-byte.
- Complete one-checkpoint flow and maximum three-checkpoint boundary flow,
  replay, JSON export, and reload persistence.
- Full free flow made only same-origin requests; headers and immutable asset
  caching passed.
- Axe found zero violations; keyboard focus, reduced motion, mobile targets,
  and 200% text reflow passed.
- Live offline reload and update notification path passed.
- Lighthouse mobile: 98 Performance, 100 Accessibility, 100 Best Practices;
  LCP 1.4s, TBT 170ms, CLS 0, 90 KiB transfer.
- Billing allowance is enforced: after cooldown, 30/35 burst requests returned
  200 and the excess 5 returned 429 with `Retry-After: 4`.

## Release blockers and defects

1. **High:** missing `.factory/claims.json` and all tagged claim tests.
2. **High:** no one-click, isolated sample-data demo; missing `.factory/demo.md`.
3. **Medium:** no canonical/OG/Twitter/apple metadata, valid robots/sitemap,
   designed 404, or footer build ID. Lighthouse SEO is 92.
4. **Medium:** missing `.factory/copy-audit.md`.
5. **Low:** whitespace-only setup silently does nothing instead of explaining
   the invalid input.
6. **Low:** desktop header navigation links are 24.8px high, below 44px.

## Reproduce

```sh
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run test:e2e
npm run test:e2e:live
npm run test:live
VERIFY_NODE_MODULES="$PWD/node_modules" /opt/fleet/lib/verify-url.sh \
  https://gesture-gameplay-calibrator.sociobot.in /tmp/movemap-verify-url
```

After adding the missing claims/demo contract, run every test command from
`.factory/claims.json` before these general gates.
