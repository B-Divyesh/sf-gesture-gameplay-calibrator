# MoveMap verification 7 handoff — FAIL

**Implementation reviewed:** `c8ab19b98c362d66a7b5020d541a562a19f5b2ee`

**Documentation reviewed:** `019782f83b3da834ee95b1d044af4f9e1e2cdc7c`

**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>

Independent verification was completed without changing product code. The
clean install, typecheck, lint, 15 unit tests, build, 54 local browser tests,
every declared claim command, 54 live browser tests, and the live byte/header/
checkout/rate-limit gate passed. Live production matches the built candidate.

The result is **FAIL**, not PASS: `/terms/` says a refund revokes the associated
license, but this customer-facing claim is absent from `.factory/claims.json`
and has no deterministic revoked-license test. This is one High finding and
one untested claim. See `.factory/verification-7.md` for full evidence,
including the fresh desktop/mobile first read, sample sandbox, privacy/PWA,
accessibility, recovery, routes, and earlier-finding dispositions.

## How to verify

```sh
npm ci
npm run typecheck
npm run lint
npm test
npm run build
npm run test:e2e
npm run test:e2e:live
npm run test:live
```

Then run every exact command in `.factory/claims.json` separately. Before a
PASS, add and pass a tagged claim proving a revoked license removes Maker Pack
access, then repeat the relevant claim, live browser suite, and live gate.

---

# MoveMap repair 6 handoff — PASS

**Implementation SHA:** `c8ab19b98c362d66a7b5020d541a562a19f5b2ee`

**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>

**Deployed:** 5 September 2026 to the existing
`sf-gesture-gameplay-calibrator` static site (deployment
`9af1b879-3f78-4dd8-8c3d-a915a3a61a8b`).

## What changed

- Privacy, Terms, and 404 now focus their h1 and announce the route. Browser
  Back focuses and announces the restored home h1. A cold home load still
  leaves the skip link as the first Tab stop.
- The paid claim now requests the production catalog and exact MoveMap checkout
  URL. It rejects missing/wrong catalog data and requires the real 303 hosted
  Dodo redirect. It also rejects an embedded card form, iframe, or off-origin
  payment script.
- Saved/demo IndexedDB data and JSON exports are inspected for finite numeric
  signatures and the absence of image, video, face, or identity fields.
- The threshold claim is checked against the ten exported examples. The replay
  check also proves that the confidence meter is present.
- Every review copy fix was applied: descriptive navigation and method
  headings, one confidence term, a useful art caption, and shorter README copy.
  Unproved implementation and rate-limit statements were removed from README.
- PWA/app version is 1.0.5. The catalog description is a verb-first 83-character
  line and is copied to `/work/.evidence/catalog-description.txt`.

## Current review findings

| Finding | Disposition and evidence |
| --- | --- |
| F-1-1 catalog/checkout 500 | Cleared. Both claim projects and `npm run test:live` received the exact $12 catalog entry and a 303 hosted-checkout redirect. |
| F-1-2 route focus | Cleared. Local and live browser tests cover direct Privacy, Terms, 404, and browser Back, including the polite announcement. |
| F-1-3 stored signature detail | Cleared. The claim inspects actual demo IndexedDB data and the downloaded JSON. |
| F-1-4 threshold calculation | Cleared. Exported thresholds are recalculated from all ten examples and compared numerically. |
| F-1-5 live confidence wording | Cleared. Copy now says confidence; the claim proves the meter appears during replay. |
| F-1-6 through F-1-10 README claims | Cleared. Key injection, identity, broad persistence, billing-build, and rate-limit prose was removed or narrowed to tested outcomes. Hosted checkout has its own claim. |
| F-1-11 through F-1-17 copy | Cleared. All listed rewrites are applied. `.factory/copy-audit.md` records the landing and README counts; no sentence exceeds 22 words. |

Earlier malformed-import, caching/header/MIME, partial-save, 512px icon,
focused-Space, 44px target, whitespace recovery, demo isolation, metadata, 404,
offline/update, and billing rate-limit findings remain covered by the full
browser and live-release gates. No regression was observed.

## Clean local verification

The documented clean setup began with `npm ci` (54 packages, 0
vulnerabilities), then a production build. Every exact command in
`.factory/claims.json` passed separately in desktop and 390px projects. The
final checkout claim passed 2/2 after its embedded-payment assertion was added.

- `npm audit --audit-level=low` — 0 vulnerabilities.
- `npm run typecheck` and `npm run lint` — passed.
- `npm test` — 15/15 passed.
- `npm run build` — passed and produced `dist/`.
- `npm run test:e2e` — 54/54 passed.
- Build payload — JavaScript 35.73 KB (12.69 KB gzip), CSS 17.78 KB
  (4.91 KB gzip), largest hero WebP 68.07 KB.
- Local Lighthouse mobile — Performance 100, Accessibility 100, Best Practices
  100, SEO 100; LCP 1.7 s, TBT 10 ms, CLS 0.
- Local factory URL check — HTTP 200, one h1/main, complete alt/button names,
  zero console errors.

## Live verification

- `npm run test:live` — all 22 deployed files match `dist`; cache/security
  headers, manifest/icon, catalog, and checkout passed. The public verification
  burst returned 31/60 HTTP 429 responses, all with positive `Retry-After`.
- `npm run test:e2e:live` — 54/54 passed across desktop and 390px. This includes
  normal, invalid, boundary, recovery, keyboard, focus, reduced-motion, axe,
  privacy-request, demo, offline/update, legal, 404, and target-size paths.
- Factory HTTPS check — HTTP 200 in 572 ms with no console/page errors.
- Live Lighthouse mobile — 100/100/100/100; LCP 1.4 s, TBT 50 ms, CLS 0.
- Fresh phone and desktop contexts showed the job, audience, first sample
  action, and three facts before scrolling. Neither viewport overflowed.
- One click opened the persistent demo banner and the “Living room rhythm game”
  result: three 10/10 checkpoints, six triggers, 86% peak confidence, no
  reported false trigger, and immediate JSON export. Reset restored the sample.
  The real profile record was null before and after the demo flow.

## Known dependencies and gaps

No open product defect is known. Checkout and license verification remain
external Sociobot/Dodo dependencies, so the production gates test them on every
release. No real charge was placed and no provider credential was invented;
the hosted checkout start is live, while return-token unlock uses the recorded
valid verification fixture in automated tests.
