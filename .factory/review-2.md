# Strict review 2 — Test webcam gestures before wiring your game — PASS

**Implementation candidate:** `f5a4107809c57cad2c60d23887b91c9bb9578494`

**Refund-claim implementation:** `f8dc18c259eeadaaf654607fef367d87fff8919c`

**Documentation reviewed:** `6bc53b5727ccc64314e7c88cdd9688a8ec719a60`

**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>

**Reviewed:** 6 September 2026 from a detached clean checkout

## Verdict

**PASS.** Finding count: **0** (Critical 0, High 0, Medium 0, Low 0).
Untested public claim count: **0**.

The live deployment is byte-for-byte the reviewed implementation candidate.
The commits after that candidate change only `.factory/handoff.md` and
`.factory/verification-8.md`; no later product image is required. This review
changed no product code.

The separately referenced
`factory-evidence/gesture-gameplay-calibrator-verify-8/qa-report.md` was not
mounted under `/work`. I read the complete committed `.factory/verification-8.md`
report and independently repeated its product, claim, and deployment checks.

## Job, audience, and first action

Before scrolling in fresh 1440×900 desktop and 390×844 phone contexts, the
page says **“Test webcam gestures before wiring your game.”** It names webcam
game makers and players. The first action is **“Try it with sample data.”**
The private-processing, offline, and free-price facts are also visible in both
viewports. The phone document is 390 CSS pixels wide with no horizontal
overflow.

## One-click sample and data isolation

One click opened `/demo`. The persistent label says **“Demo — sample data,
nothing is saved.”** The completed “Living room rhythm game” profile contains
Hands up, Lean left, and Small duck at 10/10 each. Its 30-second result reports
six triggers, 86% peak confidence, and no false trigger.

The downloaded JSON contains three sets of ten signatures. Each inspected
signature contains 352 finite numbers. **Reset demo** restored the completed
sample after the demo was changed, and the sample label and result survived a
reload.

Before entering the sample, I wrote a sentinel to the real `movemap-local`
database. Demo use and reset created and changed only `movemap-demo`; the real
sentinel was unchanged. The exercised sample made requests only to the product
origin, set no cookies, and produced no console or page errors.

## Clean checkout and quality gates

The detached checkout used Node 22.23.2, npm 10.9.8, Playwright 1.58.2, and
the preinstalled Chromium 145.0.7632.6. `npm ci` installed 54 packages. Its
install audit and `npm audit --audit-level=low` both reported zero
vulnerabilities.

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test` — 4 files and 15 tests passed.
- `npm run build` — passed and produced `dist/`.
- `npm run test:e2e` — 56/56 passed.
- `npm run test:e2e:live` — 56/56 passed against HTTPS.
- `npm run test:live` — passed.

Every exact command in `.factory/claims.json` was then run separately from the
clean candidate build. Each passed in desktop Chromium and the 390px phone
project:

| Claim | Result |
| --- | --- |
| `private-processing` | 2/2 passed |
| `offline-reload` | 2/2 passed |
| `calibration-boundaries` | 2/2 passed |
| `json-export` | 2/2 passed |
| `local-persistence` | 2/2 passed |
| `free-core-price` | 2/2 passed |
| `maker-pack-checkout` | 2/2 passed |
| `maker-helper-export` | 2/2 passed |
| `refunded-license-revocation` | 2/2 passed |

I compared the landing page, demo, privacy and terms pages, README, and demo
documentation with the manifest. Privacy, offline use, calibration limits,
threshold/profile data, persistence, price, checkout, paid helper export, and
refund revocation are listed and tested. No missing, false, incomplete, or
untested public claim remains.

## Normal, invalid, boundary, and recovery paths

The local and live browser matrices cover camera consent, ten captures,
confidence, the 30-second replay, persistence, and JSON export. They also cover
the maximum three checkpoints, ten examples per checkpoint, exact threshold
calculation, 352 finite numbers per signature, and the free and paid exports.

Recovery checks passed for empty and whitespace-only names, malformed imports
without replacing saved data, declined camera permission, partial-save reload,
checkpoint clearing, reset, invalid licenses, and revoked licenses. A revoked
license shows **“License no longer active,”** keeps the purchase option, and
removes JavaScript-helper export. Pressing Space while Clear is focused runs
Clear's native action instead of capturing another example.

## Accessibility, privacy, PWA, and site structure

- Playwright axe found zero violations on `/`, `/demo`, `/privacy/`,
  `/terms/`, and the designed 404 route in both browser projects.
- The live URL check returned HTTP 200 in 688 ms with the correct title and
  language, one h1, one main landmark, complete image alt text, labeled
  buttons, and no console or page error.
- Keyboard inspection reaches the skip link first. It has a visible 3px solid
  focus outline. Route entry and Back focus the new h1 and update the polite
  route announcement. No keyboard trap was found.
- All visible phone controls and desktop header links pass the 44×44 CSS-pixel
  checks. At 200% root text size, all five public route types remain 390 pixels
  wide with no clipped control. Reduced-motion transitions are effectively
  instant (`0.00001s`).
- Fake-camera request logging found only the product origin and no cookies.
  Stored and exported sample profiles contain numeric signatures and no image,
  video, face, or identity fields.
- Offline reload works in a fresh context after service-worker control. The
  sample remains usable and the offline notice appears. The replacement-worker
  path announces the available update.
- `/`, `/demo`, `/privacy/`, `/terms/`, `robots.txt`, `sitemap.xml`, and the
  repository link return 200. Route titles are distinct. A deliberately
  missing route returns the expected HTTP 404 with a designed way back; that
  status is not a defect.

This is a static local-first PWA, so backend tenant isolation, server restart
persistence, and a product health endpoint do not apply. The only external
product service is the optional billing API. The live gate confirmed the
registered $12 catalog entry and hosted 303 checkout redirect. A 60-request
product-license burst returned 31 HTTP 429 responses, each with a positive
`Retry-After` value.

## Deployment identity and performance

`npm run test:live` confirmed that all 22 release files match the clean
candidate `dist/`. It also checked the 512×512 maskable icon, manifest MIME,
cache split, CSP, permissions and other security headers, checkout, and the
billing request allowance.

The build contains 35.73 KB JavaScript (12.69 KB gzip), 17.78 KB CSS (4.91 KB
gzip), no web-font payload, and a 68.07 KB largest hero WebP. A completed fresh
mobile Lighthouse 12.8.2 run scored **100 Performance, 100 Accessibility, 100
Best Practices, and 100 SEO**. LCP was 1.35 seconds, TBT 0 ms, CLS 0, and total
transfer 94,839 bytes. An initial Lighthouse browser tab crashed in the
container; the repeat with the container-safe shared-memory flag completed and
is the measurement reported here.

## Earlier findings disposition

| Earlier finding | Current proof |
| --- | --- |
| Malformed profile imports were accepted | Local and live E2E reject malformed v1 data and retain the saved profile. |
| Asset caching, CSP, policy headers, and manifest MIME were incomplete | The 22-file live byte/header gate passes the current response rules. |
| Mobile performance missed its target | Fresh Lighthouse is 100 Performance with 1.35 s LCP and 0 ms TBT. |
| Checkout returned 404 or 500 | The catalog contains the $12 product and the exact checkout URL returns a hosted 303. |
| Partial calibration was lost | Setup and every capture persist; reload, resume, clear, and reset recovery pass locally and live. |
| The 512px icon had the wrong dimensions | The live gate decodes and validates the 512×512 maskable icon. |
| Space activated capture instead of focused Clear | The focused-Clear regression passes in both projects locally and live. |
| Mobile legal/email links and desktop header links were below 44px | Exhaustive public-route phone checks and the desktop header check pass. |
| License verification lacked throttling | 31/60 rapid requests returned 429, all with positive `Retry-After`. |
| Claims manifest and claim tests were missing | Nine declared commands each pass independently in two browser projects. |
| One-click isolated demo, user wording, and first-screen facts were missing | Fresh desktop/phone review and the real-data sentinel check pass. |
| Canonical/social metadata, discovery files, footer version, and a designed 404 were missing | Metadata and discovery tests pass; the missing route returns a designed HTTP 404. |
| The copy audit was missing | `.factory/copy-audit.md` is present and has no unresolved flag. |
| Whitespace-only setup failed silently | The error is announced, linked to the invalid field, and focus moves there. |
| Route focus and announcements were missing | Privacy, Terms, 404, and Back focus/announcement tests pass. |
| Review F-1-3 through F-1-10 identified unlisted privacy, threshold, confidence, payment, storage, billing, and throttling claims | Current wording is narrowed or represented by the nine passing manifest claims. |
| Review F-1-11 through F-1-17 identified long, unclear, metaphorical, or inconsistent copy | The current page, README, headings, navigation, terminology, and copy audit clear every item. |
| Refund revocation was public but unlisted and untested | `refunded-license-revocation` proves inactive status, continued purchase access, and removal of helper export. |
| The JSON-export claim test raced sample loading | The test now waits for the completed sample; its exact command and the full live matrix pass. |

## Missed leverage check

The brief's useful job is complete: sample inspection, camera calibration,
confidence replay, JSON import/export, and the optional JavaScript helper are
present. AI or cloud sync would not improve this local, private, room-specific
test enough to justify the added network and privacy cost. No missed-leverage
finding applies.

## Evidence

- `/work/.evidence/review-2-url/verify.json`
- `/work/.evidence/review-2-url/screenshot-desktop.png`
- `/work/.evidence/review-2-url/screenshot-mobile.png`
- `/work/.evidence/review-2-browser/desktop-first-screen.png`
- `/work/.evidence/review-2-browser/phone-first-screen.png`
- `/work/.evidence/review-2-browser/desktop-demo.png`
- `/work/.evidence/review-2-lighthouse.json`

No known release gap remains. Hosted checkout and license verification remain
external Sociobot/Dodo dependencies. The free calibration, replay, safety
information, offline sample, and JSON export do not depend on those services.
