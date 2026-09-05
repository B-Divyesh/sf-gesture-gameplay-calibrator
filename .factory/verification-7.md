# Independent verification 7 — FAIL

**Implementation candidate:** `c8ab19b98c362d66a7b5020d541a562a19f5b2ee`

**Documentation base:** `019782f83b3da834ee95b1d044af4f9e1e2cdc7c`

**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>
**Verified:** 5 September 2026 from a clean working tree (Node 22.23.2,
npm 10.9.8, Playwright 1.58.2)

## Verdict

**FAIL — one untested public claim remains.** The implementation and live
deployment otherwise passed all executed functional, accessibility, PWA,
privacy, quality, and deployment checks. The work order requires zero
untested public claims for PASS, so this report cannot declare PASS.

Finding count: **1** (Critical 0, High 1, Medium 0, Low 0).
Untested claim count: **1**.

## Finding

### High — refund revocation is a public but unlisted, untested claim

**Location:** `/terms/`, Maker Pack purchase: “A refund revokes the associated
license.”

This is a customer-facing statement about a paid purchase. It has no matching
entry in `.factory/claims.json`, and no tagged test proves the app locks Maker
Pack after a `valid: false, reason: "revoked"` license verification response.
The existing checkout claim proves the $12 catalog record and its 303 redirect;
the helper-export test uses a valid recorded verification response. Neither
tests revocation.

**Required disposition:** either remove/narrow the promise, or add a named
claim plus a deterministic browser test that records a revoked verification
response and proves the helper is locked with the quiet inactive-license
notice. This verification made no product-code change.

## Clean local verification

`npm ci` completed with 54 packages and `npm audit --audit-level=low` reported
zero vulnerabilities. The following passed from the clean checkout:

- `npm run typecheck` and `npm run lint`.
- `npm test` — 15/15 tests.
- `npm run build` — produced `dist/`.
- `npm run test:e2e` — 54/54 desktop and 390×844 mobile checks.

Every declared command in `.factory/claims.json` was run separately after the
build. Each passed for both browser projects (2/2):

| Claim | Result |
| --- | --- |
| private-processing | pass |
| offline-reload | pass |
| calibration-boundaries | pass |
| json-export | pass |
| local-persistence | pass |
| free-core-price | pass |
| maker-pack-checkout | pass |
| maker-helper-export | pass |

One initial persistence invocation overlapped another local Playwright server
and received `ERR_CONNECTION_REFUSED`; rerunning that exact published command
alone passed 2/2. This was test-process interference, not a product failure.

The build reported 35.73 KB JavaScript (12.69 KB gzip), 17.78 KB CSS (4.91 KB
gzip), and a 68.07 KB largest hero WebP: all are within the static-PWA budgets.

## Live verification

- `npm run test:e2e:live` — 54/54 passed against production.
- `npm run test:live` — passed: all 22 files byte-match `dist`, the 512px
  icon and headers are valid, checkout returns the hosted 303 redirect, and
  59/60 verification requests were HTTP 429 with a positive `Retry-After`.
- The live test matrix covers normal calibration, invalid whitespace and
  malformed-import recovery, three-checkpoint/ten-example/30-second limits,
  keyboard Space behavior, persistence/reset, demo isolation, privacy request
  logging, offline reload/update, route titles/focus, legal pages, 404,
  reduced motion, target sizes, and axe. It reported no failure.
- Fresh desktop (1440×900) and phone (390×844) contexts showed before
  scrolling: “Test webcam gestures before wiring your game”; the webcam game
  maker/player audience sentence; and “Try it with sample data”. The three
  privacy/offline/free facts also fit. There was no horizontal overflow or
  console error.
- One click opened the realistic “Living room rhythm game” result with three
  10/10 checkpoints, six triggers, 86% peak confidence, and no reported false
  trigger. The persistent banner reads “Demo — sample data, nothing is saved”.
  Reset is available. A fresh direct `/demo` context had only `movemap-demo`;
  it did not create the real profile database.
- Direct `/privacy/`, `/terms/`, and an unknown route had the correct titles,
  focused their h1, and populated the polite route announcement. The unknown
  route deliberately returned the designed HTTP 404, which is expected.

## Earlier findings disposition

All earlier implementation findings are currently covered by passing evidence:
malformed import validation; immutable asset caching and security/MIME headers;
performance; partial-save and whitespace recovery; 512px icon; focused-Space
behavior; 44px targets; demo isolation; metadata/discovery/404; offline and
update behavior; route focus/announcements; checkout catalog/303; stored
signature inspection; threshold calculation; and confidence wording.

The review’s copy findings (F-1-11 through F-1-17) remain cleared by the
current copy audit and rendered page. The previous unlisted-claim findings
(F-1-3 through F-1-10) have listed claim tests. The new refund-revocation
claim above is distinct and remains open.

## Next step

Add and pass the revoked-license claim test, then repeat the exact affected
claim command, `npm run test:e2e:live`, and `npm run test:live`. Do not call
this candidate PASS until the public claim has deterministic evidence.
