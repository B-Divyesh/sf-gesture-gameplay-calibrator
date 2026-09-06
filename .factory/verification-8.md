# Independent verification 8 — PASS

**Implementation candidate:** `f5a4107809c57cad2c60d23887b91c9bb9578494`
**Claim implementation:** `f8dc18c259eeadaaf654607fef367d87fff8919c`
**Prior report:** `a1332ec0dbd90995b7ffa548ed5edc07d9a8f281`
**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>
**Verified:** 6 September 2026

## Verdict

**PASS.** The sole verification-7 finding is repaired. The terms statement
that a refund revokes the associated license now has a listed public claim and
a deterministic outcome test. In a fresh demo browser context, a recorded
Sociobot verification response of `{valid:false, reason:"revoked"}` results
in the quiet “License no longer active” notice, a visible purchase option, and
no JavaScript trigger-helper export. This proves the visitor-observable lock
state rather than matching implementation text.

The repair also fixed a live-only timing race in the existing JSON-export
claim. The test now waits for the completed sample state before inspecting the
isolated IndexedDB profile. It was a test timing defect; the demo product data
and downloaded JSON were valid.

Finding count: **0** (Critical 0, High 0, Medium 0, Low 0).
Untested public claim count: **0**.

## Clean local verification

After `npm ci` (54 packages, zero audit vulnerabilities), `npm run typecheck`,
`npm run lint`, and `npm test` passed (15 tests). `npm run build` produced
`dist/` with 35.73 KB JavaScript (12.69 KB gzip), 17.78 KB CSS (4.91 KB gzip),
and a 68.07 KB hero WebP.

Every exact command listed in `.factory/claims.json` was run independently
after the production build. Each passed in Chromium desktop and 390px mobile:

| Claim | Result |
| --- | --- |
| private-processing | 2/2 passed |
| offline-reload | 2/2 passed |
| calibration-boundaries | 2/2 passed |
| json-export | 2/2 passed |
| local-persistence | 2/2 passed |
| free-core-price | 2/2 passed |
| maker-pack-checkout | 2/2 passed |
| maker-helper-export | 2/2 passed |
| refunded-license-revocation | 2/2 passed |

`npm run test:e2e` then passed **56/56** local checks. This includes normal,
invalid, boundary, recovery, keyboard, focus, reduced motion, axe, privacy,
offline/update, legal, 404, sample isolation, and target-size paths.

## Live verification

Static deployment `21d00b7e-c93f-425b-bfd1-1086cb875424` completed with the
durable product configuration. `npm run test:live` passed after deployment:
all 22 release files byte-match `dist`, headers and the PWA icon are valid,
the exact production checkout opens the registered hosted merchant, and 31/60
invalid-license verification requests received 429 with a positive
`Retry-After`.

`npm run test:e2e:live` passed **56/56** against HTTPS. The worker URL check
also passed: HTTP 200, title, language, one h1, main landmark, complete alt
text, labeled buttons, and no browser console/page errors. The browser suite's
Playwright axe checks found no violations. A fresh mobile Lighthouse report is
100 Performance, 100 Accessibility, 100 Best Practices, and 100 SEO; LCP is
1.36 s, TBT 18 ms, and CLS 0.

Fresh phone and desktop browser contexts each showed the job, intended users,
and sample action before scrolling. The one-click sample had its persistent
label, realistic completed output, and reset behavior. The real profile record
was null before and after the demo exercise.

## Historical disposition

Verification 7's refund-revocation finding is repaired above. Its reported
historical fixes remain covered by the passing suite: import validation,
storage recovery, offline/PWA behavior, security and cache policy, discovery
and 404 behavior, touch/keyboard/focus access, checkout and rate limiting,
demo isolation, export privacy, threshold calculation, confidence display, and
plain-language copy. The full original history is retained in
`.factory/review-1.md` and `.factory/verification.md` through
`.factory/verification-7.md`.
