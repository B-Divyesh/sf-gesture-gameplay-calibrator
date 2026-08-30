# MoveMap repair 5 handoff

**Work order:** `gesture-gameplay-calibrator-repair-5`

**Verifier report repaired:** `060942007b9a28920a72cab1ea4198ad79f687f6`

**Failed candidate:** `ca164697c637756e3f250d4e5551433f36df93f5`

**Artifact:** static Vite + TypeScript offline PWA (`dist/`)

## Repairs

1. Added `.factory/claims.json` with seven relied-on claims. Each claim has one
   `@claim:<id>` Playwright definition and its own runnable command.
2. Added a one-click `/demo` with a completed three-checkpoint calibration,
   30 examples, a 30-second replay result, immediate JSON export, an isolated
   camera path, a persistent demo banner, **Reset demo**, and **Start for real**.
   Demo data uses `movemap-demo`; real data remains in `movemap-local`.
3. Rebuilt the cold first screen around the job and intended users. The primary
   sample action and real camera action are adjacent. Privacy, offline, and
   free-price facts appear as three separate lines.
4. Added canonical, Open Graph, Twitter, and Apple touch metadata; valid
   `robots.txt` and `sitemap.xml`; route-specific titles; a designed 404 page;
   an HTTP 404 response override; a derived 1200×630 social image; and footer
   version `1.0.4`.
5. Added `.factory/copy-audit.md` with sentence counts, banned-word results, and
   the terminology table. Replaced ambiguous first-screen and paid-feature copy.
6. Trimmed setup values before acceptance. Whitespace-only names now announce
   a specific error through the existing alert, set `aria-invalid`, and move
   focus to the field.
7. Increased all desktop header links to a 44px minimum target. Regression
   coverage also audits every visible target on all public routes at 390px.

The existing camera calibration, partial-save recovery, import validation,
Space-key behavior, free JSON export, license flow, service-worker update path,
and billing throttling behavior were preserved.

## Local evidence

- `npm ci` — 54 packages installed; 0 vulnerabilities.
- `npm audit --audit-level=low` — 0 vulnerabilities.
- Every command in `.factory/claims.json` — passed separately; 2/2 desktop and
  mobile executions for each of seven claims.
- `npm test` — 4 files, 15 tests passed.
- `npm run typecheck` — passed.
- `npm run lint` — passed (strict TypeScript source gate).
- `npm run build` — passed; `dist/index.html` plus demo, legal, and 404 pages.
- Production payload: 35,121 B JS (12.58 KB gzip), 17,574 B CSS (4.83 KB
  gzip), 68,074 B hero WebP. No font payload. All are below product budgets.
- `npm run test:e2e` — 50/50 passed across desktop Chromium and 390×844.
  Coverage includes camera capture, persistence, reset, JSON/helper downloads,
  keyboard Space behavior, offline reload, update notice, routing, metadata,
  44px targets, and every claims sandbox.
- Playwright axe on `/`, `/demo`, `/privacy/`, `/terms/`, and the 404 screen at
  both viewports — zero violations.
- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4173 ...` — title, `lang=en`,
  one h1, main landmark, image alt, button labels, and console checks passed;
  measured load 627 ms.
- Lighthouse 12.8.2 mobile against the production preview — Performance 100,
  Accessibility 100, Best Practices 100, SEO 100; LCP 1.7 s, TBT 0 ms,
  CLS 0, Speed Index 0.9 s.
- Desktop and 390px screenshots were visually reviewed. No horizontal
  overflow, hidden control, or first-screen ambiguity remained.
- Package/consumer testing is not applicable to this static PWA. The deployable
  artifact is the built `dist/` directory.

## Deployment and live evidence

Pending the repair commit and production upload. This section will be replaced
with the deployed commit, byte-identity, live browser, response-policy, billing,
offline, and Lighthouse results before final handoff.

## Known gaps and next steps

No product-code gap is known. Production evidence is the only remaining step.
