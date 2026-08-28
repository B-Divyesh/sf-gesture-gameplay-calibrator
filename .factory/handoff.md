# MoveMap repair handoff — PASS

The independent-verifier findings against candidate
`fc3140445361908db78b447a121c60d6979fee22` have been repaired, regression
covered, pushed, and deployed to
<https://gesture-gameplay-calibrator.sociobot.in> on 2026-08-28. Runtime repair
commits are `4abf7d0` and `438c46a`.

## Repairs

- Registered and enabled the production **MoveMap Maker Pack** as the exact
  one-time USD 12.00 Sociobot/Dodo product for
  `gesture-gameplay-calibrator`. The public catalog now exposes the correct
  name, price, product URL, and checkout URL. The formerly failing checkout
  returns HTTP 303 to a hosted `checkout.dodopayments.com/session/...` URL.
- Persisted a new draft immediately after setup and after every accepted
  capture and checkpoint clear. Locally stored drafts have strict, sequential
  shape validation while imported files still require a complete profile.
  Reload resumes at the first incomplete checkpoint with names and examples
  intact.
- Replaced the malformed icon with original square 192x192 and 512x512 PNGs,
  kept the route mark inside the maskable safe zone, and advanced manifest and
  worker caches to `1.0.3` / `movemap-v1.0.3`.
- Scoped the Space capture shortcut away from buttons, links, form controls,
  summaries, and editable content. Focused Clear therefore keeps its native
  Space behavior.
- Expanded the brand, purchase-policy links, and footer links to at least 44px
  high. The lab note is now a note rather than a nested complementary landmark,
  eliminating the verifier's remaining moderate axe finding.

## Regression coverage

- `tests/profile-validation.test.ts` covers valid sequential drafts and rejects
  skipped checkpoints and premature calibration metadata.
- `tests/deployment-config.test.ts` decodes both PNG headers and asserts the
  manifest's exact 512px maskable declaration.
- `tests/e2e/app.spec.ts` covers draft persistence after each capture, reload
  resume, durable clear, focused-button Space, 44px targets, exact checkout
  link, returned-token capture/URL stripping/unlock, same-origin privacy,
  offline reload, and update notification on both desktop and 390x844 mobile.
- `scripts/verify-live.mjs` compares every deployable file with local `dist`,
  checks caching/security headers and performance budgets, decodes the live
  icon, verifies the public billing catalog, and requires a hosted-checkout 303.

## Verification evidence

- Clean deploy gate: `npm ci` installed 54 packages; `npm audit
  --audit-level=low` found 0 vulnerabilities; `npm test` passed 3 files / 10
  tests; `tsc -b && vite build` passed and produced `dist/index.html`.
- Browser: `npm run test:e2e` and `npm run test:e2e:live` each passed 26/26
  checks across Chromium desktop and 390x844 mobile. This includes the full
  calibration/replay path, malformed import, camera denial, keyboard,
  persistence, legal routes, privacy, offline, worker update, and checkout
  return handling. No console or page errors occurred.
- Accessibility: axe found **0 violations at any severity** on desktop and
  mobile. The first Tab focuses the visible skip link; semantics retain one h1,
  one main, labels, alt text, and live regions. Reduced-motion and horizontal
  overflow checks pass in both browser projects.
- Live smoke: `/opt/fleet/lib/verify-url.sh` returned HTTP 200 in 928ms with no
  console errors and passed title, lang, h1, main, alt, and button-name checks.
  Desktop and mobile screenshots were reviewed with no clipping or visual
  regression.
- Identity/policy: `npm run test:live` confirmed all 16 deployable files are
  byte-identical to `dist`; hashed assets/icons are immutable; documents and
  worker are revalidated; HSTS, CSP, camera-only Permissions Policy,
  strict-origin referrer policy, DENY framing, and nosniff are present.
- Billing: public catalog is USD 1200 / `MoveMap Maker Pack`; live checkout is
  HTTP 303 to Dodo hosted checkout. A live invalid-token request returned HTTP
  200 `{valid:false, reason:"invalid", expires_at:null}` with exact production
  CORS and `no-store`. Returned valid-token capture and optimistic/background
  verification are browser-regression tested with a deterministic API mock.
- PWA: a production offline reload retained the app and displayed “Offline —
  calibration still works.” The replacement-worker state path displayed “A
  fresh notebook is ready. Reload to update.” Cache version is
  `movemap-v1.0.3`.
- Lighthouse 12.8.2 mobile, production: Performance **100**, Accessibility
  **100**, Best Practices **100**; LCP **1.379s**, TBT **0ms**, CLS **0**, total
  transfer **92,401 bytes**. Three preceding reports scored 98/100/100,
  100/100/100, and 100/100/100.
- Payload: initial JS 29,976 bytes (11,230 gzip), CSS 14,359 bytes (4,200 gzip),
  hero WebP 68,074 bytes, no font payload. Static artifact/package-consumer
  testing is not applicable beyond the production `dist` build and byte check.

## Run it

```sh
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run test:e2e
npm run test:e2e:live
npm run test:live
```

## Known gaps

No release-blocking gap remains. QA did not submit a real live card charge;
instead it verified the live hosted-checkout redirect and catalog mapping, then
covered return-token capture and unlock deterministically without creating a
purchase.
