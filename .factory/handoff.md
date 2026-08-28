# Repair 3 handoff — blocked outside this repository

## Result

**Not deployable.** The independent verifier's only remaining release blocker
was reproduced against the live Sociobot billing service and is still present:
the public license-verification endpoint does not rate-limit a rapid invalid
license burst. MoveMap remains a static, local-first PWA. This repository has
no server or API deployment surface for `api.sociobot.in`, and its product
contract explicitly forbids changing Sociobot billing infrastructure from this
repository.

No static deployment was made: publishing a known-failing release would not
repair the billing endpoint and would incorrectly imply that the release gate
had passed.

## What changed

- Added `scripts/verify-billing-rate-limit.mjs`, an exact live regression gate
  for `GET /api/v1/products/gesture-gameplay-calibrator/verify`. It sends 60
  simultaneous invalid-license requests and requires at least one `429` and a
  positive `Retry-After` on every throttled response.
- Added `npm run test:billing-rate-limit` and made `npm run test:live` run this
  assertion after the existing byte-identity, response-policy, manifest,
  catalog, and hosted-checkout checks.
- Documented the required billing regression check in `README.md`.

The app bundle, profile format, IndexedDB behavior, PWA manifest/worker,
visual system, and paid-unlock integration were not changed.

## Reproduction and evidence

On 2026-08-28, a direct 70-request concurrent burst from this worker to:

```
https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/verify?license=qa-rate-limit-probe-repair
```

returned **70 × HTTP 200** and **zero `Retry-After` headers**. The new exact
60-request release gate was then run against the production endpoint and
failed with:

```
AssertionError: verify endpoint must rate-limit a 60-request per-client burst
(observed 200=60)
```

This confirms the verifier's finding is current and not caused by the static
MoveMap deployment.

## Verification completed

| Check | Result |
| --- | --- |
| `npm ci` | passed; 54 packages installed |
| `npm audit --audit-level=low` | passed; 0 vulnerabilities |
| `npm test` | passed; 3 files, 10 tests |
| `npm run build` | passed; `dist/` created |
| Build payload | JS 29,976 B (11,230 B gzip); CSS 14,359 B (4,200 B gzip); hero WebP 68,074 B |
| `npm run test:e2e` | passed; 26/26 desktop Chromium + 390×844 mobile checks |
| `npm run test:e2e:live` | passed; 26/26 against production |
| `verify-url.sh` production smoke | passed; HTTP 200 in 580 ms; title/lang/one h1/main/alt checks and no page/console errors |
| Production Lighthouse mobile | 100 Performance, 100 Accessibility, 100 Best Practices; LCP 1,397 ms; TBT 0 ms; CLS 0; 92,407 B transfer |
| Existing live release identity | passed before the new rate gate: 16 files match `dist`; response headers, cache policy, 512px maskable icon, catalog, and Dodo checkout redirect pass |
| `npm run test:live` | **intentionally fails at the new billing rate-limit assertion** after all existing static/live identity checks pass |

The browser suites cover desktop and 390px mobile layout, keyboard skip link
and focused-button Space behavior, axe (zero violations), camera denial,
malformed import recovery, 10-example calibration/replay/export, IndexedDB
draft persistence, legal routes, reduced motion, touch targets, offline reload,
and service-worker update notice. They also verify the free flow makes only
same-origin requests and license return uses only the documented Sociobot
endpoint.

## Required external remediation

The owner of `https://api.sociobot.in` must add a per-client limiter to the
public product verify endpoint (and its other public endpoints), returning
`429 Too Many Requests` plus a positive `Retry-After` value. The next release
candidate must pass:

```sh
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run test:e2e
npm run test:e2e:live
npm run test:live
```

When the shared billing fix is live, the static deployment command configured
for this product is:

```sh
/opt/fleet/lib/deploy-static.sh gesture-gameplay-calibrator dist
```

Run that only after `npm run test:live` passes; no repo-side change can make a
direct request to the external billing origin return the required `429`.

---

## Original independent QA record

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
