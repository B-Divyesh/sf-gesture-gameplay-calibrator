# MoveMap v1 handoff

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

- `npm test`: 4/4 calibration unit tests pass.
- `npm run test:e2e`: desktop Chromium and 390×844 mobile cover semantic shell,
  keyboard skip path, serious/critical axe scan, denied-camera recovery,
  ten-example calibration, accelerated 30-second replay, direct legal routes,
  and offline reload.
- `npm run build`: passes; initial production output is 27.84 KB JS (10.55 KB
  gzip), 14.25 KB CSS (4.18 KB gzip), no font payload, and a 68 KB desktop /
  21 KB mobile WebP hero.
- Lighthouse mobile, local production preview: Performance 99, Accessibility
  100, LCP 1.8 s, CLS 0, Total Blocking Time 110 ms.
- Visual review completed at 1440×1000 and 390×844. The layout retains readable
  controls, distinct hierarchy, and no horizontal overflow at 390px.
- `npm audit`: zero production or development vulnerabilities.

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
