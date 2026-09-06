# Independent verification 8 — Test webcam gestures before wiring your game — PASS

**Implementation candidate:** `f5a4107809c57cad2c60d23887b91c9bb9578494`

**Refund-claim implementation:** `f8dc18c259eeadaaf654607fef367d87fff8919c`

**Documentation reviewed:** `76434edf7a56fdf0edf7cd991752e2f30c09f359`

**Deployment:** `21d00b7e-c93f-425b-bfd1-1086cb875424`

**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>

**Verified:** 6 September 2026 from a detached clean checkout

## Verdict

**PASS.** Finding count: **0** (Critical 0, High 0, Medium 0, Low 0).
Untested public claim count: **0**.

The live deployment is byte-for-byte the tested implementation candidate. The
later documentation commit changes only `.factory/handoff.md` and this report;
it does not require a different product image. No product code was changed by
this verification.

## Job, audience, and first action

Before scrolling in fresh 1440×900 desktop and 390×844 phone contexts, the
page says **“Test webcam gestures before wiring your game.”** It names webcam
game makers and players, and its first action is **“Try it with sample data.”**
The privacy, offline, and free-price facts are also visible in both viewports.

One click opened `/demo`. The persistent label says **“Demo — sample data,
nothing is saved.”** The completed “Living room rhythm game” output contains
Hands up, Lean left, and Small duck at 10/10 each, a 30-second result, six
triggers, 86% peak confidence, and no reported false trigger. The downloaded
profile contains three sets of ten 352-number signatures. The demo label
survived reload, and **Reset demo** restored the original completed sample.

For an additional isolation check, the desktop context stored a sentinel in
`movemap-local`, used and reset the sample in `movemap-demo`, then read the real
sentinel unchanged. Fresh claim contexts also proved that direct demo use does
not create the real database.

## Clean checkout and claim evidence

The detached checkout used Node 22.23.2, npm 10.9.8, Playwright 1.58.2, and the
preinstalled Chromium 145.0.7632.6. `npm ci` installed 54 packages. Both npm's
install audit and `npm audit --audit-level=low` reported zero vulnerabilities.

- `npm run typecheck` — passed.
- `npm run lint` — passed.
- `npm test` — 4 files and 15 tests passed.
- `npm run build` — passed and produced `dist/`.
- `npm run test:e2e` — 56/56 passed.
- `npm run test:e2e:live` — 56/56 passed against HTTPS.

Every exact command in `.factory/claims.json` was run independently after the
production build. Each command passed in desktop Chromium and the 390px phone
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

The live page, legal routes, demo documentation, and README were compared with
the manifest. Privacy, offline, calibration bounds, data shape, persistence,
price, checkout, paid export, and refund revocation are all listed and tested.
No missing, false, incomplete, or untested public claim was found.

## Product paths

The browser matrices cover the normal camera flow through ten captures,
confidence, a 30-second replay, persistence, and JSON export. They also cover
the three-checkpoint and ten-example boundaries, exact threshold calculation,
352 finite values per signature, and the free/paid export split.

Invalid and recovery checks passed for empty and whitespace-only names,
malformed imports without replacing saved data, declined camera permission,
partial-save reload, checkpoint clearing, reset, invalid licenses, and revoked
licenses. A revoked license shows **“License no longer active,”** keeps the buy
option, and removes JavaScript-helper export. Keyboard Space keeps the focused
Clear button's native action.

## Accessibility, privacy, PWA, and site structure

- Playwright axe reported zero violations on `/`, `/demo`, `/privacy/`,
  `/terms/`, and the designed 404 route in both browser projects.
- The live URL verifier found HTTP 200 in 649 ms, a correct title and language,
  one h1, a main landmark, complete image alt text, labeled buttons, and no
  page or console errors.
- Keyboard inspection reached the skip link first and showed the designed 3px
  focus outline on links, fields, and buttons. Route changes and Back focus the
  new h1 and update the polite route announcement. There was no keyboard trap.
- All visible phone targets and desktop header links meet 44×44 CSS pixels.
  At 200% root text size, the 390px page had no horizontal overflow or clipped
  control. Reduced-motion transitions measured `0.00001s`.
- Request logging during the fake-camera demo flow found only the product
  origin and no cookies. Stored and exported sample profiles contain numeric
  signatures and no image, video, face, or identity fields.
- Offline reload worked in its own fresh context after service-worker control;
  the sample remained usable and the offline notice appeared. The replacement
  worker path announced the available update.
- `/`, `/demo`, `/privacy/`, `/terms/`, `robots.txt`, `sitemap.xml`, and the
  repository link returned 200. Route titles are distinct. A deliberately
  missing route returned the expected HTTP 404 and a designed way back; that
  expected status is not a defect.

The app is static, so backend tenant and restart-persistence checks do not
apply. The external product-verification allowance does apply: `npm run
test:live` confirmed all 22 release files match `dist`, the 512px icon and
headers pass, checkout returns the registered hosted 303 redirect, and 31/60
rapid verification requests returned 429 with a positive `Retry-After`.

## Performance

The build contains 35.73 KB JavaScript (12.69 KB gzip), 17.78 KB CSS (4.91 KB
gzip), no web-font payload, and a 68.07 KB largest hero WebP. Fresh live mobile
Lighthouse scored **100 Performance, 100 Accessibility, 100 Best Practices,
and 100 SEO**. LCP was 1.32 s, TBT 40 ms, CLS 0, and total transfer 89,820
bytes.

## Earlier findings disposition

| Earlier finding | Current proof |
| --- | --- |
| Malformed imports were accepted | The local and live suites reject malformed v1 input and retain the saved profile. |
| Asset caching, CSP/policy headers, and manifest MIME were incomplete | The live byte/header gate passes all 22 files and current response rules. |
| Mobile performance missed its target | Fresh Lighthouse is 100 Performance with 1.32 s LCP and 40 ms TBT. |
| Checkout was unavailable or returned 500 | The catalog has the $12 product and the exact buy URL returns a hosted 303. |
| Partial calibration was lost | Capture-by-capture persistence, reload, resume, and clear recovery pass locally and live. |
| The 512px icon had wrong dimensions | The live gate decodes and validates the 512×512 maskable icon. |
| Space activated capture instead of Clear | The focused Clear regression test passes in both projects locally and live. |
| Mobile and desktop links were below 44px | Exhaustive route target checks and the desktop header check pass. |
| License verification lacked throttling | 31/60 rapid requests returned 429, each with a positive `Retry-After`. |
| Claims manifest and tests were missing | Nine listed claim commands pass independently, two browser projects each. |
| One-click isolated demo and cold-screen facts were missing | Fresh phone and desktop inspection plus storage-sentinel testing pass. |
| Discovery metadata, route titles, footer version, and designed 404 were missing | Metadata/discovery tests pass; the intentional missing route returns designed HTTP 404. |
| Copy audit was missing | `.factory/copy-audit.md` is present; rendered copy and README have no unresolved plain-word flags. |
| Whitespace-only setup failed silently | The error is announced, attached to the invalid field, and focus moves there. |
| Route focus and announcement were missing | Privacy, Terms, 404, and Back focus/announcement tests pass. |
| Review F-1-3 through F-1-10 had unlisted claims | Current copy is narrowed or mapped to the nine passing manifest claims. |
| Review F-1-11 through F-1-17 had unclear or long copy | Current copy audit, README, navigation, headings, and rendered page clear every item. |
| Refund revocation was unlisted and untested | `refunded-license-revocation` now proves inactive status, buy access, and no helper export. |
| JSON-export test raced the live sample load | The exact claim now waits for the completed sample; it and the 56/56 live suite pass. |

## Evidence

- `/work/.evidence/verification-8-url/verify.json`
- `/work/.evidence/verification-8-url/screenshot-desktop.png`
- `/work/.evidence/verification-8-url/screenshot-mobile.png`
- `/work/.evidence/verification-8-browser/desktop-demo.png`
- `/work/.evidence/verification-8-browser/phone-demo.png`
- `/work/.evidence/verification-8-lighthouse.json`

No known release gap remains. The checkout and license-verification verdict
remain external Sociobot/Dodo dependencies; the free local calibration,
replay, safety information, offline sample, and JSON export do not depend on
them.
