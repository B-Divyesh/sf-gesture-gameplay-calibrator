# MoveMap repair 7 handoff — PASS

**Implementation candidate:** `f5a4107809c57cad2c60d23887b91c9bb9578494`
**Claim implementation:** `f8dc18c259eeadaaf654607fef367d87fff8919c`
**Previous verification documentation:** `a1332ec0dbd90995b7ffa548ed5edc07d9a8f281`
**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>
**Deployment:** `21d00b7e-c93f-425b-bfd1-1086cb875424`, 6 September 2026

## What changed

- Added the listed `refunded-license-revocation` claim for the terms promise.
  Its browser test supplies a deterministic Sociobot `valid: false`,
  `reason: "revoked"` response in a fresh `/demo` context. It proves that
  the inactive notice and purchase option appear and that JavaScript-helper
  export is unavailable.
- Stabilized the JSON-export claim by waiting for the completed sample before
  reading its isolated IndexedDB record. The initial live suite exposed this
  test race; it was a verification problem, not a product-data failure.
- The tested static app bundle is unchanged by this repair. It was redeployed
  with the existing static configuration; all 22 deployed files match `dist`.

## Job, audience, and first action

MoveMap lets webcam game makers and players test whether a body gesture works
in their own room before wiring it to a game. Fresh 1440px desktop and 390px
phone contexts both showed this job, the audience sentence, and **Try it with
sample data** before scrolling. One click showed the persistent demo banner,
the completed Living room rhythm game profile, three 10/10 checkpoints, six
triggers, and 86% peak confidence. Reset restored the original sample. The
real profile record was null before and after each demo exercise.

## Verification

From the documented clean dependency setup (`npm ci`, 54 packages, zero audit
vulnerabilities), the following passed:

- `npm run typecheck`, `npm run lint`, and `npm test` — 15/15 unit and
  integration tests.
- `npm run build` — produced `dist/`; initial JavaScript is 35.73 KB
  (12.69 KB gzip), CSS is 17.78 KB (4.91 KB gzip), and the largest hero WebP
  is 68.07 KB.
- Every exact command in `.factory/claims.json` — all nine claims passed in
  desktop and 390px projects (2/2 each).
- `npm run test:e2e` — 56/56 local browser checks passed.
- `npm run test:e2e:live` — 56/56 HTTPS browser checks passed.
- `npm run test:live` — 22 deployed files byte-match `dist`; the registered
  $12 hosted checkout redirects correctly; 31/60 verify requests received
  HTTP 429 with a positive `Retry-After`.
- `/opt/fleet/lib/verify-url.sh` — live HTTPS 200 in 721 ms, title, `lang`,
  one h1, main landmark, complete image alt text, labeled buttons, and zero
  page or console errors.
- Playwright axe coverage of the public desktop and phone routes completed in
  the browser suites with no violations. Live mobile Lighthouse was
  Performance 100, Accessibility 100, Best Practices 100, SEO 100; LCP was
  1.36 s, TBT 18 ms, and CLS 0.

Evidence includes `/work/.evidence/repair-7-url/` and
`/work/.evidence/repair-7-lighthouse.json`. The current catalog description is
also copied to `/work/.evidence/catalog-description.txt`; verified paid-offer
metadata is in `/work/.evidence/billing-offer.json`.

## Earlier findings

All historical findings remain covered: malformed-import rejection; cache,
security-header, and manifest MIME policy; PWA icons and offline/update paths;
partial-save and whitespace recovery; keyboard Space and touch targets; demo
isolation; discovery metadata and designed 404; route focus/announcement;
checkout/catalog/hosted-payment behavior; billing throttling; numeric export
and threshold calculations; confidence wording; and the prior review copy
findings. See `.factory/verification.md` through
`.factory/verification-7.md` and `.factory/review-1.md` for their original
evidence and disposition.

## Known dependencies

The optional Maker Pack checkout and license verdict are external
Sociobot/Dodo services. They are live and checked by the release gates, but
the free local calibration, replay, safety information, and JSON export do not
depend on them. No customer charge, external-provider credential, or invented
integration was used in this repair.
