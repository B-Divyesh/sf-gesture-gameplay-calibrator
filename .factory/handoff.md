# MoveMap v1 repair handoff — PASS

## Release repair

Independent QA findings for candidate `cdc855ad607d9054de4e97076ae6b31fcf428f12`
were repaired in `3f85269` (`fix: harden imports and static release policy`),
pushed to `main`, and deployed to
<https://gesture-gameplay-calibrator.sociobot.in> on 2026-08-28.

- Import now accepts only complete replayable `movemap-profile/v1` data: exact
  24×18 Sobel signature lengths, finite signature numbers, 1–3 named
  checkpoints with ten examples/centroid/threshold, valid metadata/settings,
  and a valid optional test summary. Invalid files fail before IndexedDB is
  written. Existing malformed saved profiles are removed with recovery copy.
  Unit coverage includes the verifier's exact malformed JSON and finite-value/
  checkpoint-bound cases; desktop and 390px browser coverage confirms a bad
  import cannot replace a valid saved profile.
- `public/staticwebapp.config.json` supplies the Static Web Apps response
  policy: hashed `/assets/*` and version-query icons are immutable for one
  year; documents, manifest, and service worker are no-store/revalidated;
  `.webmanifest` is `application/manifest+json`; CSP, Permissions-Policy,
  `X-Frame-Options: DENY`, nosniff, and referrer protections are applied.
  The CSP permits only same-origin resources plus the documented live/pilot
  Sociobot license verification APIs; it permits the same-origin camera model.
- The hero now enters the production bundle through Vite, giving the actively
  used hero a content-hashed URL. The service-worker cache revision and
  installed-app/manifest icon version are `1.0.2`, so deployed clients receive
  the new shell and retain the existing update toast behavior.

Live deployment evidence:

- Live `GET /`: 200; title/lang/one h1/main/alt-label audit passed with no
  console or page errors (699ms navigation check).
- The deployed `main-C-n10-32.js` SHA-256 is
  `61034e504e2fd4cc11cb1ad2ffcaa24de516050a252cd766e68672c9be28fcde`,
  exactly matching `dist`; the live worker declares `movemap-v1.0.2`.
- `GET /assets/main-C-n10-32.js` returns
  `Cache-Control: public, max-age=31536000, immutable`. `GET /` and
  `/manifest.webmanifest` return `Cache-Control: no-cache, no-store,
  must-revalidate`; the manifest is `application/manifest+json`.
- Live document responses include the configured CSP (including only the
  documented Sociobot APIs in `connect-src`), `Permissions-Policy:
  camera=(self), geolocation=(), microphone=(), payment=(), usb=()`,
  `X-Frame-Options: DENY`, HSTS, nosniff, and strict-origin referrer policy.

## What shipped

- Complete local webcam workflow: name one to three checkpoints, capture ten
  examples each, calculate per-checkpoint centroids and learned thresholds,
  monitor confidence/history, and run a timed 30-second reliability replay.
- Explicit false-trigger marking, trigger count, peak confidence, persistent
  test summary, and unrestricted JSON profile import/export. Exports contain no
  image or video data.
- IndexedDB persistence with refresh/tab-close recovery and a confirmed local
  reset path. Camera permission, missing-camera, invalid-import, empty, loading,
  offline, and update-available states have direct recovery copy.
- Installable offline PWA with versioned shell/asset caches, direct offline
  fallback, local routes for `/privacy/` and `/terms/`, 192/512 icons, and
  install/update affordances.
- $12 one-time Maker Pack via the Sociobot checkout/verify contract: URL token
  capture, local token storage, daily verdict cache, offline optimistic unlock,
  restore field, inactive-license notice, and an unlocked JavaScript trigger
  helper export. Core calibration, JSON export, accessibility, and safety remain
  free.
- Original handwritten-lab-notebook visual system and generated hero, with the
  full prompt, review, derivative, and provenance recorded in
  `.factory/design.md` and `assets/src/`.

## Run and verify

```sh
npm install
npm test
npm run build
npm run test:e2e
```

The exact deployment command is `npm run build`; output is `dist/` with
`dist/index.html` at its root. `VITE_BILLING_BASE` may point staging builds to
`https://pilot-api.sociobot.in/api/v1`; production defaults to the live API.

Verification on 2026-08-28:

- Clean `npm ci`: passed; `npm audit` reported 0 vulnerabilities.
- `npm test`: 3 files, 8 tests passed (calibration, strict profile-schema, and
  deploy-policy regression coverage). `npm run build` passed (`tsc -b && vite
  build`) and created `dist/index.html`.
- `npx playwright test --project=chromium --project=mobile-390`: 12/12 passed.
  Both desktop and 390×844 cover semantic shell, keyboard skip link, serious/
  critical axe scan, denied-camera recovery, malformed-import non-persistence,
  ten-example calibration, accelerated 30-second replay, direct legal routes,
  and controlled-service-worker offline reload. No browser console errors.
- Current initial production JS is 28.98 KB (10.92 KB gzip); CSS is 14.25 KB
  (4.18 KB gzip); no font payload ships. The active hero is a 68.07 KB hashed
  WebP—within the static/PWA budgets.
- Three local production-preview Lighthouse mobile runs: Performance 96, 100,
  100; Accessibility 100, 100, 100. First run LCP 1.9 s, TBT 210 ms, CLS 0;
  the repeat runs were LCP 1.8 s, TBT 0 ms, CLS 0. This clears the ≥90
  performance gate that the verifier measured at 87.
- `/opt/fleet/lib/verify-url.sh` against the live production URL passed title,
  lang, main, image-alt, button-label, console, and desktop/mobile screenshot
  checks. Response headers/MIME and artifact identity are recorded above.
- Live 390px Chromium exercised the deployed service worker: after becoming
  controlled, an offline reload kept the MoveMap h1 and offline ribbon visible
  with no console/page errors.

## Known gaps and next steps

- The recognizer intentionally uses a compact normalized edge fingerprint, not
  a body-landmark model. It is useful for testing a fixed room and camera, but
  profiles are not portable across arbitrary cameras/backgrounds. That tradeoff
  is explained in-product and in exported metadata.
- The browser journey is tested with Chromium’s synthetic camera. A release
  check with physical front/rear cameras on Safari iOS and Chrome Android is
  still recommended.
- The factory must register the live and test billing products before checkout
  can complete; no product ID or secret is stored in this repository.
- Maker Pack v1 exports a runtime hold/release helper. A future version can add
  a multi-profile project shelf without changing the free calibration flow.
