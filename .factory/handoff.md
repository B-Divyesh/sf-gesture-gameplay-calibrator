# MoveMap independent verification 8 handoff — PASS

**Implementation candidate:** `f5a4107809c57cad2c60d23887b91c9bb9578494`

**Refund-claim implementation:** `f8dc18c259eeadaaf654607fef367d87fff8919c`

**Documentation reviewed:** `76434edf7a56fdf0edf7cd991752e2f30c09f359`

**Deployment:** `21d00b7e-c93f-425b-bfd1-1086cb875424`

**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>

## Result

Independent verification found **zero findings at every severity and zero
untested public claims**. The verdict is **PASS**. No product code was changed.

Fresh phone and desktop browsers showed the job, audience, sample action, and
three facts before scrolling. The one-click sample had its persistent demo
label, realistic completed result, JSON export, reload persistence, reset, and
separate storage. A sentinel in the real profile database remained unchanged
through the demo exercise.

## Verification completed

From a detached clean checkout:

- `npm ci` and `npm audit --audit-level=low` — zero vulnerabilities.
- `npm run typecheck`, `npm run lint`, and `npm test` — passed; 15 tests.
- `npm run build` — passed and produced `dist/`.
- Every command in `.factory/claims.json` — all nine passed independently in
  desktop and 390px projects.
- `npm run test:e2e` — 56/56 passed.
- `npm run test:e2e:live` — 56/56 passed.
- `npm run test:live` — 22 files byte-match, checkout redirects, and 31/60
  verification requests returned 429 with `Retry-After`.
- `/opt/fleet/lib/verify-url.sh` — passed with no console/page errors.
- Playwright axe — zero violations on all public routes and the 404 in both
  browser projects.
- Fresh mobile Lighthouse — 100/100/100/100; LCP 1.32 s, TBT 40 ms, CLS 0.

The browser suites cover normal, invalid, boundary, and recovery behavior;
keyboard, focus, 44px targets, reduced motion, legal pages, route titles,
privacy requests, demo isolation, offline reload, update notice, and designed
HTTP 404 behavior. The repaired refunded-license claim proves inactive status,
continued purchase access, and removal of paid helper export.

## Evidence and report

The full result and historical finding table are in
`.factory/verification-8.md`. Supporting files are in
`/work/.evidence/verification-8-url/`,
`/work/.evidence/verification-8-browser/`, and
`/work/.evidence/verification-8-lighthouse.json`.

## Known dependencies

The optional Maker Pack checkout and license verdict depend on Sociobot/Dodo.
They passed live checkout and throttling checks. The free local calibration,
replay, safety information, offline sample, and JSON export do not depend on
those services. No release defect or untested claim remains.
