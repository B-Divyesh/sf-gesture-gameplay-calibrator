# Adversarial first-read review 1 — MoveMap

**Reviewed:** 2026-08-30  
**Live URL:** https://gesture-gameplay-calibrator.sociobot.in  
**Verdict:** **FAIL**

## Cold first read

Fresh 390 x 844 and desktop contexts showed, before scrolling: “Test webcam
gestures before wiring your game”; “For webcam game makers and players who need
a gesture that works in their real room.”; and “Try it with sample data”.

The answer is clear: it tests whether a webcam pose works in a real room before
a game uses it; it is for webcam game makers and players; click **Try it with
sample data** first. This gate passes. Privacy, offline, and price facts also
appear before the fold at 390 px.

## Findings

### Blocking

#### F-1-1 — Maker Pack checkout is broken (regression)

**Location:** “Buy Maker Pack” and “Sociobot/Dodo handles checkout and refunds.”
This is the paid-checkout finding in `.factory/verification-2.md`, previously
recorded as repaired.

**Observed:** from a fresh clone, `npm run test:live` matched deployed files and
headers, then failed because `GET https://api.sociobot.in/api/v1/products`
returned **500**, not 200. A direct fresh request to
`https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/checkout`
also returned **500** with `{"error":"Internal server error","status":500}`.

**Why:** a visitor is offered a one-time $12 purchase but receives a server
error. The `free-core-price` test only checks the link `href`, not checkout.

**Fix:** restore the registered Sociobot product/catalog and hosted checkout.
Make a claim test request the exact link and assert the 303 hosted-checkout
redirect against production.

#### F-1-2 — Route changes leave focus on `<body>`

**Location:** `/privacy/`, `/terms/`, and the designed 404 route.

**Observed:** direct mobile navigation rendered the correct h1, but
`document.activeElement` was `BODY`. Following Privacy from `/` and using Back
also left focus on `BODY`. `src/main.ts` has no focus transfer or route
announcement.

**Why:** keyboard and screen-reader visitors are not placed at new content after
navigation.

**Fix:** give route h1s `tabindex="-1"`, focus them after render and on
`popstate`, and update a polite `aria-live` route announcement. Add browser
coverage for Privacy, Terms, 404, and Back.

### High — unlisted claims

Every item below is a relied-on landing/README sentence with no matching
`.factory/claims.json` entry.

#### F-1-3 — Frame-processing claim is untested

**Quote:** landing: “MoveMap downsamples each frame and records normalized edge
patterns—not a photo, face, or identity.”

**Fix:** remove the detail, or test captured/saved/exported data for the
documented numeric vector and absence of identity/image fields.

#### F-1-4 — Threshold-calculation claim is untested

**Quote:** landing: “That spread sets the checkpoint threshold.”

**Fix:** add a known-sample threshold calculation claim, or rewrite “MoveMap
uses your examples to set a threshold.” and test it.

#### F-1-5 — Live-confidence claim is untested

**Quote:** landing: “The replay shows live confidence.”

**Fix:** test that the confidence meter changes during sample replay, or remove
“live”.

#### F-1-6 — Key and identity assertions are untested

**Quote:** README: “It does not inject keys, identify people, or upload camera
frames.”

**Fix:** retain the tested camera-upload wording, but remove “inject keys” and
“identify people” unless separately tested. Plain rewrite: “MoveMap does not
upload camera frames.”

#### F-1-7 — Embedded-payment assertion is untested

**Quote:** README: “No payment provider is embedded.”

**Fix:** test that checkout uses only the Sociobot redirect and loads no payment
script, or delete it.

#### F-1-8 — Stored-image assertion is broader than its test

**Quote:** README: “No camera image is persisted; saved and exported profiles
contain normalized numeric edge signatures.”

**Fix:** inspect real/demo IndexedDB in a claim test, or narrow it to “Exported
profiles contain numeric signatures, not photos or video.”

#### F-1-9 — README billing configuration assertions are unlisted

**Quote:** README: “Production defaults to `https://api.sociobot.in/api/v1`; set
`VITE_BILLING_BASE` at build time to use the pilot endpoint on staging.” and
“The product slug is used directly, with no hardcoded billing product ID.”

**Fix:** test both builds and assert their endpoint/product URLs, or move these
implementation notes out of visitor-facing README copy.

#### F-1-10 — README rate-limit promise is unlisted

**Quote:** README: “At least one response must be `429 Too Many Requests` and
every throttled response must include a positive `Retry-After`…”

**Fix:** list `npm run test:billing-rate-limit` as a claim test, or state this
only as maintainer instruction. It passed standalone in this review (30/60
responses were 429 with `Retry-After`), but is not in the manifest.

### Minor — copy clarity

#### F-1-11 — README opening sentence is too long and jargon-heavy

**Quote:** README, 29 words: “It records ten lightweight visual edge signatures
for each of one to three poses, measures live confidence, runs a 30-second
false-trigger replay, and exports a portable JSON threshold profile.”

**Fix:** “It records ten examples for each pose, helps you check false triggers,
and exports a JSON profile.”

#### F-1-12 — README question is too long

**Quote:** README, 28 words: “It helps answer a practical question: does this
pose stay recognizable with the camera, lighting, background, clothing, and
movement range in the room where it will be used?”

**Fix:** “Check whether the pose still works with your room, camera, and
lighting.”

#### F-1-13 — “Method” does not name its destination

**Location:** header navigation, “Method”.  
**Fix:** “How calibration works”.

#### F-1-14 — Hero caption is an information-free slogan

**Location:** “Observe → record → test”.  
**Fix:** “Three steps for testing a webcam gesture”.

#### F-1-15 — Score/confidence terminology is inconsistent

**Location:** “What the score means” and “The replay shows live confidence.”  
**Fix:** “How confidence works” and “The replay shows confidence.”

#### F-1-16 — Method headings are metaphorical

**Location:** “Learn the outline”, “Find the variation”, “Stress the room”.  
**Fix:** “Record each pose”, “Compare your examples”, “Test in your room”.

#### F-1-17 — README provenance sentence exceeds the word cap

**Quote:** README, 27 words: “The product brief is in
`.factory/brief.json`, its visual system and asset provenance in
`.factory/design.md`, and the release verification record in
`.factory/handoff.md`.”

**Fix:** make three short linked sentences, one for each document.

## Demo, claims, sandbox

The one-click demo passes. `/demo` opened a completed “Living room rhythm game”
with three named 10/10 checkpoints, a 30-second result, and immediate JSON
export. Its banner said “Demo — sample data, nothing is saved”; **Reset demo**
restored the sample. A fresh context used `movemap-demo` and never
`movemap-local`. Initial demo requests were product-origin document, JS, and
CSS only. `@claim:private-processing` also exercised camera, reset, and export
with only product-origin requests.

Fresh clone: `/tmp/movemap-review.pP8Ek4`. After `npm ci` and `npm run build`,
all declared claim commands passed in both browser projects:

| Claim | Result |
| --- | --- |
| `private-processing` | 2 passed |
| `offline-reload` | 2 passed |
| `calibration-boundaries` | 2 passed |
| `json-export` | 2 passed |
| `local-persistence` | 2 passed |
| `free-core-price` | 2 passed (link-only; F-1-1) |
| `maker-helper-export` | 2 passed |

`npm test` passed 15 tests. The complete local `npm run test:e2e` passed 50
tests before the later live-release check exposed F-1-1. The dedicated offline
clean-context claim passed.

## Copy audit

Counts treat hyphenated terms as one word. Landing labels, headings, and actions
are included because they shape the first read. `[F-…]` indicates a finding.

### Landing page

| Words | Copy |
| ---: | --- |
| 3 | Webcam gesture calibration |
| 7 | Test webcam gestures before wiring your game |
| 16 | For webcam game makers and players who need a gesture that works in their real room. |
| 6 | Try it with sample data |
| 4 | Set up my camera |
| 8 | See a finished profile, or record your own. |
| 7 | Private: camera frames stay on this device. |
| 6 | Offline: works after the first visit. |
| 7 | Price: calibration and JSON export are free. |
| 3 | Observe → record → test [F-1-14] |
| 4 | Set up the experiment |
| 6 | Name what you want to recognize |
| 6 | Choose one to three distinct poses. |
| 17 | A checkpoint can be as small as a hand position or as broad as a full-body stance. |
| 8 | Ten examples will be recorded for each one. |
| 3 | Camera stays here. |
| 7 | Frames are processed only in this tab. |
| 9 | No video or photos are saved or sent anywhere. |
| 5 | Move in your own way. |
| 9 | Choose a seated, subtle, or hand-only pose when needed. |
| 5 | Stop whenever you need to. |
| 4 | What the score means [F-1-15] |
| 5 | How MoveMap measures a pose |
| 3 | Learn the outline [F-1-16] |
| 15 | MoveMap downsamples each frame and records normalized edge patterns—not a photo, face, or identity. [F-1-3] |
| 3 | Find the variation [F-1-16] |
| 9 | Ten examples reveal how much your natural pose changes. |
| 6 | That spread sets the checkpoint threshold. [F-1-4] |
| 3 | Stress the room [F-1-16] |
| 5 | The replay shows live confidence. [F-1-5, F-1-15] |
| 11 | Change distance or light and mark any false trigger you observe. |
| 9 | Keep the camera and background fixed when comparing runs. |
| 6 | Room changes can alter the score. |
| 12 | Use the export as a room-specific reference, not a universal pose model. |
| 3 | Optional one-time purchase |
| 5 | Add a JavaScript trigger helper |
| 13 | Maker Pack generates a JavaScript helper from your calibrated hold and release settings. |
| 9 | Calibration, testing, safety information, and JSON export stay free. |
| 3 | Buy Maker Pack [F-1-1] |
| 6 | Sociobot/Dodo handles checkout and refunds. [F-1-1] |
| 4 | See privacy and terms. |
| 3 | Restore a purchase |
| 7 | Paste the license token from your receipt. |
| 5 | It stays in this browser. |
| 9 | Test webcam gestures before adding them to a game. |
| 4 | Built by Param Factory. |
| 11 | Editorial artwork was generated for MoveMap with the factory image model. |

No landing item exceeds 22 words or has a banned marketing adjective. Buttons
use result-naming verbs except the paid action, whose failure is F-1-1.

### README

| Words | Sentence |
| ---: | --- |
| 13 | MoveMap is a local-first webcam gesture calibration notebook for game makers and players. |
| 29 | It records ten lightweight visual edge signatures for each of one to three poses, measures live confidence, runs a 30-second false-trigger replay, and exports a portable JSON threshold profile. [F-1-11] |
| 11 | It does not inject keys, identify people, or upload camera frames. [F-1-6] |
| 10 | Use MoveMap before wiring a webcam gesture into a game. |
| 28 | It helps answer a practical question: does this pose stay recognizable with the camera, lighting, background, clothing, and movement range in the room where it will be used? [F-1-12] |
| 9 | Choose a seated, subtle, or hand-only pose when needed. |
| 20 | Open the shown local URL, allow camera access, choose up to three checkpoint names, and record ten examples of each. |
| 4 | Profiles persist in IndexedDB. |
| 9 | The PWA works offline after its first successful load. |
| 10 | Open `/demo` to inspect a completed three-checkpoint profile without setup. |
| 8 | Demo changes use the separate `movemap-demo` IndexedDB database. |
| 13 | Resetting or leaving the demo discards its current value without touching real profiles. |
| 14 | Relied-on product claims and their exact browser commands are listed in `.factory/claims.json`. |
| 11 | Run each command there from a clean install before a release. |
| 7 | Playwright is pinned to 1.58.2. |
| 18 | Its Chromium binary must be available through `PLAYWRIGHT_BROWSERS_PATH`, or install it with `npx playwright install chromium`. |
| 13 | Maker Pack is a one-time $12 license unlock through the Sociobot billing API. [F-1-1] |
| 13 | It exports a JavaScript trigger helper using the calibrated hold and release settings. |
| 5 | No payment provider is embedded. [F-1-7] |
| 23 | Production defaults to `https://api.sociobot.in/api/v1`; set `VITE_BILLING_BASE` at build time to use the pilot endpoint on staging. [F-1-9] |
| 12 | The product slug is used directly, with no hardcoded billing product ID. [F-1-9] |
| 16 | The production release gate also sends a 60-request invalid-license burst to the public Sociobot verification endpoint. |
| 27 | At least one response must be `429 Too Many Requests` and every throttled response must include a positive `Retry-After`; run it alone with `npm run test:billing-rate-limit`. [F-1-10] |
| 6 | Feature extraction runs in the browser. |
| 14 | No camera image is persisted; saved and exported profiles contain normalized numeric edge signatures. [F-1-8] |
| 13 | This intentionally small model is a room-specific calibration aid, not universal pose recognition. |
| 7 | Read the in-product privacy policy and terms. |
| 27 | The product brief is in `.factory/brief.json`, its visual system and asset provenance in `.factory/design.md`, and the release verification record in `.factory/handoff.md`. [F-1-17] |
| 3 | MIT — see LICENSE. |

README headings name their sections. The 23-, 27-, 27-, 28-, and 29-word rows
violate the cap; F-1-9, F-1-10, and F-1-17 contain concrete changes.

## Structure and history checks

The live root had the required title, description, canonical, OG/Twitter
metadata, favicon, one h1, main landmark, visual notebook identity,
robots/sitemap, legal footer, and no horizontal overflow at 390 px. Internal
links reached 200 except the deliberately missing route, which correctly
returned designed HTTP 404. No visible target was below 44 px on the five
public mobile routes. Landing/demo request logs made no off-origin request. The
paper-notebook identity matches `.factory/design.md` and is not generic SaaS.

All earlier verification/polish/handoff records were read. Current status:

| Earlier finding | Current confirmation |
| --- | --- |
| malformed import acceptance | Fixed: local E2E rejects malformed v1 and retains saved profile. |
| cache/security/manifest MIME | Fixed: live byte/header checks completed before catalog failure. |
| mobile performance | Current JS is 12.58 KB gzip; CSS 4.83 KB gzip. |
| checkout unavailable | **Regressed: F-1-1.** |
| partial-save, icon, focused-Space | Fixed: local E2E passed persistence, 512px icon, native Space; live bytes match. |
| undersized links | Fixed: independent 390px live measurement found none. |
| missing rate limit | Fixed: standalone live check got 30/60 429 with positive `Retry-After`. |
| missing claims/demo/cold screen/discovery/copy audit/whitespace | Demo/cold screen/discovery/recovery exist; claims/copy gaps are F-1-3 to F-1-17. |

## Missed leverage

The brief’s core job is covered by sample/local calibration, replay, and JSON
export. AI, sync, or another import format is not an obvious missing requirement
for this local, room-specific offline workflow. The JavaScript helper is the
useful optional extension already present.

## What would make this perfect

Restore and test real checkout; implement route focus/announcements; put every
relied-on claim behind an exact claim test or remove it; apply the listed copy
rewrites. Then rerun the review from scratch.
