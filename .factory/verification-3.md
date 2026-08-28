# Independent verification 3 — FAIL

**Candidate:** `93a125bcf8a11558bef99f648e35dfe0a0afdb38`  
**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>  
**Verified:** 2026-08-28 (fresh clean checkout; Node 22.23.2, npm 10.9.8,
Playwright 1.58.2 / Chromium 145.0.7632.6)

## Verdict

**FAIL.** The candidate is deployed exactly and the local-first calibration
product works, but its required server-side license-verification endpoint does
not rate-limit a rapid burst. The work order explicitly requires a 429 response
and `Retry-After` from every server-side endpoint, including product-unlock
calls. This was not observed after 60 simultaneous requests.

## Clean local quality gates

- Began at the requested SHA with a clean worktree, then ran `npm ci` (54
  packages, 0 audit vulnerabilities), `npm test`, `npm run build`, and
  `npm run test:e2e`.
- Unit/integration result: **3 files, 10 tests passed**. There is no separate
  lint script; the production build runs the available `tsc -b` type check.
- Exact production build passed and produced `dist/`: initial JS **29,976 B**
  (11,230 B gzip), CSS **14,359 B** (4,200 B gzip), hero WebP **68,074 B**,
  and no font payload. Both script and stylesheet are within the 200 KB / 50
  KB budgets.
- Local and deployed Playwright suites each passed **26/26** checks across
  desktop Chromium and 390 x 844 mobile. These include camera denial recovery,
  malformed-import recovery without replacement, 10-example calibration,
  replay/export, reload persistence, Space-key behavior, legal routes, offline
  reload, update notification, reduced motion, touch targets, and axe.
- A fresh mobile Lighthouse run against production scored **99 Performance, 100
  Accessibility, 100 Best Practices**: LCP 1,356 ms, TBT 147 ms, CLS 0, and
  92,410 B transfer.

## Product exercise and accessibility

- Completed the representative free journey: allow fake camera, record ten
  examples, run the 30-second replay, and expose JSON export. The browser suite
  additionally verifies durable draft capture/clear/resume and malformed JSON
  rejection while retaining the previously saved profile.
- Required fields, one-to-three checkpoint UI, 48-character experiment and
  32-character checkpoint limits, and strict imported-profile bounds are
  present. Camera permission denial returns an actionable setting/retry message.
- Fresh desktop and 390px screenshots were visually reviewed after the hero
  image had decoded; neither clipped nor overflowed. At 390px the document
  scroll width did not exceed 390px.
- Keyboard: first Tab reaches the visibly outlined skip link; controls are
  operable by keyboard, and focused Clear retains native Space behavior.
  Reduced motion changes transitions to 0.01 ms. Axe found **zero violations**
  (therefore zero serious/critical) in both browser projects. No page or console
  errors occurred in local or live runs.

## Privacy, PWA, live identity, and response policy

- The normal free flow made only same-origin browser requests: no analytics,
  trackers, third-party fonts/scripts, or camera upload. IndexedDB holds the
  local numeric profile; localStorage is untouched until a user supplies a
  license. No sign-in is present, so no identity provider is used.
- The optional license flow is limited to the documented
  `https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/verify`
  endpoint. A live invalid token returned `200`, `valid:false`, `no-store`, and
  the exact production CORS origin; checkout is a live `303` to hosted Dodo.
- `npm run test:live` confirmed all **16** deployable files byte-for-byte match
  this candidate's freshly built `dist`. The manifest has a genuine 512x512
  maskable icon; `start_url` carries version `1.0.3`.
- Live HTML, manifest, and worker are `no-cache, no-store, must-revalidate`;
  hashed assets are `public, max-age=31536000, immutable`. Live responses have
  HSTS, strict-origin referrer policy, `nosniff`, `DENY` framing, a self-only
  CSP with only the documented billing origins in `connect-src`, and
  `camera=(self)` while geolocation/microphone/payment/USB are disabled.
- On a previously loaded deployed page, service worker control and cache
  precache succeeded; offline reload kept the MoveMap h1 and showed “Offline —
  calibration still works.” The replacement-worker update path announced “A
  fresh notebook is ready. Reload to update.”

## Defects

### High — Sociobot license verification lacks mandatory rate limiting

**Reproduction:** Issue 60 simultaneous GET requests from one client to:

```
https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/verify?license=qa-rate-limit-probe
```

**Observed:** every request returned `HTTP 200` with
`{"expires_at":null,"reason":"invalid","valid":false}`. No request
returned `429`; no `Retry-After` header was present. The observed threshold is
therefore **greater than 60 requests in a single rapid burst, or absent**.

**Impact:** an unauthenticated, public product-unlock endpoint can be queried
without the required abuse control. This fails the explicit verifier acceptance
contract even though it does not affect the free calibration flow.

**Required remediation:** enforce a per-client rate limit on the production
verify endpoint (and the product's other public API endpoints), return `429`
with a meaningful `Retry-After`, deploy it, then repeat the burst test and
record the exact observed threshold.

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

Then burst the live verification endpoint until it returns `429` with
`Retry-After`. No product source was modified by this verification.
