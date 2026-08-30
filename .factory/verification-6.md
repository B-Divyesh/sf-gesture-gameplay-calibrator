# Independent verification 6 — PASS

**Candidate:** `0f5e924b5e7adef98294e9cafee7d7f8eba2cca0`  
**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>  
**Verified:** 2026-08-30 from a clean checkout (Node 22.23.2, npm 10.9.8,
Playwright 1.58.2 / Chromium 145.0.7632.6)

## Verdict

**PASS.** The live deployment is byte-for-byte the tested candidate and the
local-first PWA meets the researched job: game makers and players can inspect
or calibrate one to three room-specific webcam gestures, collect ten examples,
run a 30-second false-trigger replay, and export a JSON threshold profile.

There are **no open release defects** (Critical: 0, High: 0, Medium: 0, Low:
0). No product code was changed during this verification.

## First-read and demo gates

A cold live load plainly says **“Test webcam gestures before wiring your
game”**, names “webcam game makers and players,” and presents **“Try it with
sample data”** next to “Set up my camera.” It also states the privacy, offline,
and free-price facts on the first screen. Thus it answers what it does, for
whom, and what to click first in plain language.

The one-click `/demo` opens a completed three-checkpoint “Living room rhythm
game” calibration. It has the persistent “Demo — sample data, nothing is
saved” banner, Reset demo, and Start for real. A fresh live camera exercise
(sample → Try my camera → capture → clear → reset) made only these requests:
`/demo`, the local JS, and local CSS; all were same-origin. It left only the
`movemap-demo` IndexedDB database. The real database was not opened.

## Clean local evidence

`npm ci` installed 54 packages with 0 reported vulnerabilities. The first
attempt to invoke claim tests before producing `dist/` exposed the expected
`vite preview` prerequisite (there is no committed `dist/`); after the exact
production build, every exact command declared in `.factory/claims.json`
passed from its `/demo` sandbox in both Chromium projects:

| Claim | Result |
| --- | --- |
| private-processing | 2/2 passed |
| offline-reload | 2/2 passed |
| calibration-boundaries | 2/2 passed |
| json-export | 2/2 passed |
| local-persistence | 2/2 passed |
| free-core-price | 2/2 passed |
| maker-helper-export | 2/2 passed |

Additional quality gates passed:

- `npm test` — 15/15 passed.
- `npm run typecheck` and `npm run lint` — passed.
- `npm run build` — passed and produced `dist/`.
- `npm run test:e2e` — 50/50 passed on desktop Chromium and 390×844 mobile.
- Build output: JS 35,121 B (12.58 KB gzip), CSS 17,574 B (4.83 KB gzip),
  largest hero WebP 68,074 B; all within static-PWA budgets.

The 50-test browser suite exercises normal camera calibration, ten captures,
three-checkpoint/30-second boundaries, sample JSON and licensed-helper export,
whitespace validation/recovery, declined camera recovery, invalid-import
recovery, persistence/reset, keyboard Space activation, demo isolation,
offline reload, update-notice behavior, legal routes, metadata, and 44px
targets.

## Live, privacy, PWA, accessibility, and performance evidence

- `npm run test:live` passed: all 22 deployable files SHA-256 matched `dist`;
  `/demo`, legal pages, discovery files, 404, manifest icon, immutable asset
  caching, headers, and checkout redirect passed.
- `npm run test:e2e:live` — 50/50 passed against the live URL.
- A separate Playwright audit at desktop and 390px found zero axe violations
  (therefore zero serious/critical), no console/page errors, no horizontal
  overflow, no targets below 44px, and visible initial skip-link focus. With
  reduced motion, button transition duration was `0.00001s`.
- Response headers include HSTS, `nosniff`, `DENY` framing,
  `strict-origin-when-cross-origin`, `camera=(self)`, and a self-restricted
  CSP. The initial live page and full demo request logs contained no
  third-party origin, analytics, font CDN, or camera upload.
- The `movemap-v1.0.4` worker controlled the page. After the first live visit,
  an offline reload rendered the app and “Offline — calibration still works.”
  The deployed worker uses `skipWaiting()` and `clients.claim()`; the browser
  update-notice scenario passes.
- `verify-url.sh` passed live: HTTPS 200, title, `lang=en`, one h1, main,
  image alt text, labeled buttons, and no browser errors. Load measured 804 ms.
- Fresh mobile Lighthouse produced Performance 100, Accessibility 100, Best
  Practices 100, SEO 100; LCP 1.4 s, TBT 50 ms, CLS 0, interactive 1.4 s.
  (A preceding run was noisy because the disposable Chromium tab crashed after
  report collection; its successful repeat is the recorded measurement.)

## Billing allowance

The public Sociobot product verification endpoint was probed as one client
with the repository's documented 60-request burst. It returned **31/60 HTTP
429** responses; every 429 had a positive `Retry-After` header. The observed
allowance before throttling was therefore 29 successful requests in that burst
(the rolling limiter may include nearby verification traffic). Checkout
returned the registered Sociobot/Dodo 303 redirect. The product has no sign-in,
so the Entra tenant requirement is not applicable.

## Defects by severity

None found.
