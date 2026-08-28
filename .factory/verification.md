# Independent verification — FAIL

**Candidate:** `cdc855ad607d9054de4e97076ae6b31fcf428f12`  
**URL:** <https://gesture-gameplay-calibrator.sociobot.in>  
**Verified:** 2026-08-28 (fresh `npm ci`, Node 22.23.2/npm 10.9.8)

The live deployment is the candidate: its HTML is identical after normalizing
hashed asset names, and SHA-256 matches for both `main-c7xseRtx.js`
(`b54cc5…b9b3`) and `sw.js` (`f78f85…fbc8`). This is not a stale deployment
or a deployment-only build failure. It is **not releasable** against the
factory contract because the defects below remain.

## Quality-gate evidence

- `npm ci`: completed, audit reported 0 vulnerabilities.
- `npm test`: **4/4** Vitest tests passed.
- Exact production command `npm run build`: passed (`tsc -b && vite build`),
  creating `dist/`.
- Playwright production-preview suite: **5/5 Chromium desktop** and **5/5
  390×844 mobile** passed. This covers semantic shell, keyboard skip link,
  camera denial, a 10-sample calibration/replay, legal routes, axe, and
  offline reload. There is no separate lint script; the production build is
  the repository's TypeScript check.
- Independent mobile run: no horizontal overflow (390/390 CSS pixels),
  reduced-motion transition duration `0.00001s`, no console/page errors, and
  axe reported **0 serious/critical** violations. Desktop and live-mobile
  screens were visually reviewed; focus CSS is a visible 3px outline and the
  first Tab reaches the skip link.
- Local Lighthouse (mobile default throttling): **Performance 87**,
  **Accessibility 100**, LCP 1.8s, TBT 500ms, CLS 0. This misses the
  contract's performance ≥90 target.
- First-load budgets pass: JS 27,844 B (10,550 B gzip), CSS 14,258 B
  (4,180 B gzip), no font payload, responsive mobile hero 20,798 B.

## Product and privacy exercise

- Normal flow: collected ten camera samples, completed the 30-second replay,
  marked a false trigger, and exported the profile.
- Boundary flow: created **three** checkpoints and captured 10 samples for
  each using keyboard Space. The saved profile survived reload; exported JSON
  had `[10,10,10]` examples, replay results, and no image/video fields.
- Recovery: denied camera explains how to enable permission; missing camera
  explains how to connect one or import a profile; browser-without-camera API
  gives a generic recovery message.
- The free calibration journey made no outbound requests. Live desktop and
  mobile made only same-origin document, JS, CSS, and responsive WebP requests.
  Code inspection confirms frames are processed in-browser; profiles use
  IndexedDB and only an explicitly entered license can call the permitted
  Sociobot verification endpoint. There are no third-party fonts, scripts,
  analytics, or camera uploads.
- The live PWA became controlled by `/sw.js`; offline reload served the app
  and offline `/privacy/` served the legal page without errors. A synthetic
  changed worker revision triggered the in-app “A fresh notebook is ready.
  Reload to update.” toast; the worker has versioned caches,
  `skipWaiting`, and `clientsClaim`.

## Defects

### Medium — malformed profile imports are falsely accepted and persisted

`src/main.ts` checks only `schema`, `checkpoints` being an array, and a
nonzero length. Importing exactly
`{"schema":"movemap-profile/v1","checkpoints":[{}]}` showed “Profile
imported” and stored that object in IndexedDB, rather than showing the stated
invalid-file recovery error. It lacks a checkpoint name/examples/centroid
shape and cannot be resumed as a calibration. Validate the complete v1 schema
(including finite signature values and the 1–3 checkpoint bounds) before
replacing saved data; reject malformed files without persisting them.

### Medium — production caching does not meet the PWA asset policy

The live hashed JS, CSS, worker, manifest, and HTML all return
`Cache-Control: public, must-revalidate, max-age=30`. Hashed static assets
need long-lived immutable caching; this forces revalidation every 30 seconds.
Configure immutable cache headers for hashed `/assets/*` (and appropriately
versioned icons) while retaining a short/no-cache policy for HTML and the
service worker.

### Medium — measured mobile performance misses the required threshold

The valid local Lighthouse mobile run scored 87, below the ≥90 factory gate
(TBT 500ms). Re-run after profiling and retain a reproducible passing result.

### Low — response-policy and MIME hardening is incomplete

Live responses include HSTS, `nosniff`, and a referrer policy, but no
`Content-Security-Policy`, `Permissions-Policy`, or frame policy was returned.
`/manifest.webmanifest` is served as `application/octet-stream`, not a
manifest JSON MIME type. Add restrictive policies compatible with the local
camera model and serve the manifest as `application/manifest+json` (or
`application/json`).

## Retest command set

```sh
npm ci
npm test
npm run build
npx playwright test --project=chromium
npx playwright test --project=mobile-390
npm run preview
```

Re-run malformed-import, live cache-header, and Lighthouse checks after the
defects are corrected. No product source was modified during verification.
