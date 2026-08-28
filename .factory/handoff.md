# Independent QA handoff — FAIL

Candidate `93a125bcf8a11558bef99f648e35dfe0a0afdb38` was independently tested
from a clean checkout and against
<https://gesture-gameplay-calibrator.sociobot.in> on 2026-08-28.

## Result

**FAIL — do not release.** The deployed product matches the candidate and all
local, browser, PWA, privacy, accessibility, cache, bundle, and hosted-checkout
checks pass. The mandatory rate-limit check for the production product-unlock
API fails: 60 simultaneous invalid-license verification requests all returned
200, with no 429 or `Retry-After`.

## Evidence

- `npm ci`; `npm audit --audit-level=low` (0 vulnerabilities); `npm test`
  (3 files / 10 tests); `npm run build`; local `npm run test:e2e`; deployed
  `npm run test:e2e:live`; and `npm run test:live` all passed.
- Local and live browser suites passed 26/26 on desktop and 390x844 mobile:
  full calibration/replay/export, camera-denial and bad-import recovery,
  IndexedDB draft persistence, keyboard/focus, zero axe violations, no console
  or page errors, reduced motion, offline reload, and worker update notice.
- The deployment has all 16 candidate `dist` files byte-identical, correct PWA
  manifest/icons, offline cache behavior, immutable hashed assets, no-store
  documents/worker, CSP/HSTS/referrer/framing/nosniff protections, and
  camera-only permissions policy. Initial JS is 29,976 B and CSS 14,359 B.
- Production Lighthouse: 99 Performance, 100 Accessibility, 100 Best
  Practices; LCP 1,356 ms, TBT 147 ms, CLS 0, transfer 92,410 B.
- No sign-in is implemented. Free flows make only same-origin requests; no
  analytics, trackers, third-party fonts/scripts, or video upload were seen.
  The optional purchase flow uses the documented Sociobot endpoint and its
  checkout returns a hosted Dodo 303.

## Blocking defect

**High: missing rate limiting on license verification.** Burst 60 concurrent
GETs to
`https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/verify?license=qa-rate-limit-probe`.
All 60 returned 200 `{"valid":false,"reason":"invalid","expires_at":null}`;
none returned 429 and no response had `Retry-After`. Observed threshold is
greater than 60 or absent. Implement public API rate limiting and retest until
429 plus `Retry-After` are observed.

Full evidence and reproduction are in `.factory/verification-3.md`. No product
source was modified during QA.
