# Independent verification 4 — FAIL

**Candidate:** `a1f1394d777b563d092fdd4dbd844898bbd0b257`  
**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>  
**Verified:** 2026-08-28 from a clean exact checkout (Node 22.23.2, npm
10.9.8, Playwright 1.58.2 / Chromium 145.0.7632.6)

## Verdict

**FAIL.** The deployed PWA is byte-for-byte the candidate build, the complete
calibration job works, and the previously reported external billing limiter
failure is fixed. The strict acceptance contract is still unmet because three
mobile links are smaller than the required 44 by 44 CSS pixels. There are no
critical, high, or medium defects; the one low-severity defect below is the
only release blocker found.

No product source was modified during verification.

## Clean quality gates

- Started with a clean worktree at the requested SHA. `npm ci` installed 54
  packages and reported zero vulnerabilities; `npm audit --audit-level=low`
  also passed with zero findings.
- `npm test`: **3 files / 10 tests passed**.
- Exact production command `npm run build`: passed (`tsc -b && vite build`)
  and created `dist/`. The repository has no lint script; the build's `tsc -b`
  is its available type check.
- `npm run test:e2e`: **26/26 passed** against the production preview across
  desktop Chromium and 390 by 844 mobile.
- `npm run test:e2e:live`: **26/26 passed** against production across the same
  projects.
- `npm run test:live`: passed. All 16 deployable files match, checkout
  redirects, the 512px icon is valid, and the live rate-limit assertion passed.
- Build payload: initial JS **29,976 B** (11,230 B gzip), CSS **14,359 B**
  (4,200 B gzip), hero WebP **68,074 B**, no font payload. The measured mobile
  Lighthouse transfer was **87,397 B**.
- Fresh production Lighthouse 12.8.2 mobile: **96 Performance, 100
  Accessibility, 100 Best Practices**; LCP 1,456 ms, TBT 229 ms, CLS 0, speed
  index 1,008 ms.

## Product exercise

- Completed the representative one-checkpoint flow locally and live: camera
  consent, ten captures, 30-second reliability replay, result, and JSON export.
- Independently completed the maximum boundary flow live with a 48-character
  experiment name, three 32-character checkpoints, and 10 examples per
  checkpoint. The exported v1 JSON held `[10, 10, 10]` examples, every
  signature contained 352 finite numbers, a 30-second test result retained the
  user-reported false trigger, and no photo/video field was present. The saved
  result survived reload.
- Empty required fields were rejected before camera startup. Camera denial
  produced actionable permission/retry copy. A malformed v1 import was
  rejected without replacing saved data. Partial setup, every capture, and
  checkpoint clearing persisted and resumed. Focused Clear retained its native
  Space-key action.
- An invalid live license produced “License no longer active,” left the free
  workbench usable, and contacted only the documented Sociobot verify route.
  The mocked valid return-token test confirmed URL token stripping, local
  storage, and unlock behavior. No sign-in exists, so the Entra requirement is
  not applicable.

## Browser, accessibility, and visual checks

- `/opt/fleet/lib/verify-url.sh` passed production: HTTP 200, 1,045 ms
  navigation, title, `lang=en`, one h1, main landmark, image alt text, labeled
  buttons, and zero console/page errors.
- Desktop and 390px full-page screenshots were visually reviewed. The layout
  is coherent, product-specific, and has no horizontal overflow.
- Independent axe scans of `/`, `/privacy/`, and `/terms/` at desktop and
  390px found **zero violations**, hence zero serious/critical findings.
- Keyboard-only smoke tests exposed the skip link on the first Tab with a 3px
  solid visible focus outline; the calibration controls and focused-button
  Space path passed without traps. Reduced motion reduces transitions to
  effectively instant states.
- The exhaustive 390px target-box check found the sizes listed in the defect
  below. All core form, calibration, purchase, reset, and navigation controls
  met the target rule.

## Privacy, PWA, and deployment evidence

- The complete free maximum-boundary journey made only same-origin requests
  and produced no console/page errors. There are no analytics, trackers,
  third-party fonts/scripts, biometric inference, or camera uploads. Numeric
  profiles are stored in IndexedDB; license data appears in local storage only
  when explicitly supplied.
- The live worker controls the page using `movemap-v1.0.3-shell` and
  `movemap-v1.0.3-assets`; the built script was cached. Offline reload retained
  the full app and showed “Offline — calibration still works” with no errors.
  The update test displayed “A fresh notebook is ready. Reload to update.”;
  the worker uses `skipWaiting()` and `clients.claim()`.
- The manifest is installable with versioned start URL, standalone display,
  matching theme/background colors, and genuine 192px and 512px icons; the
  512px icon is maskable.
- `scripts/verify-live.mjs` confirmed all **16** candidate `dist` files are
  byte-identical to production. Key local/corresponding-live SHA-256 values:
  JS `8a1c7ed7…25ae`, CSS `ffc9092a…7a88`, worker `a2b88261…59ac`, manifest
  `51ff9c13…fd3a`.
- HTML, legal routes, manifest, and worker return `no-cache, no-store,
  must-revalidate`; hashed JS/CSS/images return `public, max-age=31536000,
  immutable`. Manifest MIME is `application/manifest+json`.
- Root responses include HSTS, a self-only CSP with only production/pilot
  Sociobot billing in `connect-src`, `camera=(self)` with other sensitive
  permissions disabled, `X-Frame-Options: DENY`, `nosniff`, and
  `strict-origin-when-cross-origin`.
- The invalid-token verify response was `200`, `no-store`, with exact-origin
  CORS and `{valid:false, reason:"invalid"}`. Checkout returned 303 to the
  hosted Dodo session.

## Server-side rate-limit evidence

The previously reported external failure is cleared. A fresh 60-request
concurrent burst to:

```text
https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/verify?license=qa-rate-limit-threshold
```

completed in 609 ms with **30 HTTP 200 and 30 HTTP 429** responses. Every 429
had `Retry-After: 4`. The observed burst threshold was therefore **30 accepted
requests; excess requests were throttled**. The repository's independent gate
also passed on its preceding run with 31/60 throttled responses.

## Defects

### Low — three mobile links miss the required 44×44 target size

At a 390px viewport, exhaustive `getBoundingClientRect()` measurement found:

- home Maker Pack note `/terms/`: **37.7×44 px**;
- privacy page `mailto:privacy@sociobot.in`: **161.8×19 px**;
- terms page `mailto:support@sociobot.in`: **164.5×19 px**.

These are inline/secondary links and axe reports no violation, so impact is
low, but the attached acceptance rule explicitly requires every touch/click
target to be at least 44×44 CSS px. Give these links a 44px minimum inline size
and height without overlapping adjacent targets, then repeat the 390px box
audit.

## Retest

```sh
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run test:e2e
npm run test:e2e:live
npm run test:live
```

Then enumerate all visible `a`, `button`, and `input` rectangles at 390px and
require both dimensions to be at least 44 CSS pixels.
