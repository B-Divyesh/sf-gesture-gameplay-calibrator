# Independent verification 5 — FAIL

**Candidate:** `ca164697c637756e3f250d4e5551433f36df93f5`

**Live URL:** <https://gesture-gameplay-calibrator.sociobot.in>

**Verified:** 2026-08-30 from the clean candidate checkout (Node 22.23.2,
npm 10.9.8, Playwright 1.58.2 / Chromium 145.0.7632.6)

## Verdict

**FAIL.** The deployed app is byte-for-byte the candidate, the core camera
calibration flow works, and the formerly reported billing rate-limit failure is
fixed. The candidate still fails two explicit preconditions of this work order:
`.factory/claims.json` is missing, and there is no one-click sample-data demo.
The cold first screen also does not plainly identify its intended users or give
the required three privacy/offline/price facts.

No product code was modified during verification.

## Mandatory first checks

### Claims gate — FAIL

The first filesystem check found no `.factory/claims.json`. There were therefore
no listed claim commands to run. The claims contract explicitly makes a missing
manifest release-blocking.

This is not merely a missing inventory file. Public, relied-on claims have no
`@claim:<id>` sandbox tests, including:

- “Camera frames never leave your device” and the privacy page's no-upload
  promise;
- offline operation after first load;
- ten examples per checkpoint and 30-second replay;
- JSON export with no photo or video;
- local profile persistence and reset behavior.

### Cold first-read and demo gate — FAIL

Cold desktop and 390px loads show:

- headline: “Will your gesture hold up in a real room?”;
- explanation: teach the browser a pose, replay it, and export a threshold
  profile;
- apparent first actions: “Calibrate a move” and, lower down, “Allow camera &
  begin.”

This communicates the basic job, but it does not plainly name webcam-motion
game makers or players. It also presents only one hero fact (camera privacy),
not the required privacy/offline/price trio. Most importantly, there is no
visible “Try it with sample data” action. `/demo` renders the ordinary home page
with no seeded data, banner, reset, “Start for real,” or isolated demo storage.
`.factory/demo.md` is also absent. A visitor must supply camera access and make
30 captures to see the maximum three-checkpoint result.

## Clean local and live gates

- Initial worktree was clean and `HEAD` exactly matched the candidate.
- `npm ci`: passed; 54 packages installed and audit reported 0 vulnerabilities.
- `npm audit --audit-level=low`: passed with 0 vulnerabilities.
- `npm test`: **3 files / 10 tests passed**.
- `npm run build`: passed (`tsc -b && vite build`) and produced `dist/`. There
  is no lint script; `tsc -b` is the available type check.
- `npm run test:e2e`: **26/26 passed** across desktop Chromium and 390×844.
- `npm run test:e2e:live`: **26/26 passed** against production.
- `npm run test:live`: passed: all 16 deployable files match `dist`, the
  checkout redirects, the icon is valid, and billing throttling is active.
- `/opt/fleet/lib/verify-url.sh`: passed live in 650 ms with a title, `lang=en`,
  one h1, a main landmark, image alt text, labeled buttons, and no console or
  page errors.

Production payloads are below budget: initial JS **30,052 B / 11,192 B gzip**,
CSS **14,451 B / 4,215 B gzip**, no font payload, and the largest hero WebP is
68,074 B. A fresh Lighthouse 12.8.2 mobile run scored **98 Performance, 100
Accessibility, 100 Best Practices, 92 SEO** with LCP **1.4 s**, TBT **170 ms**,
CLS **0**, and **90 KiB** transfer.

## Product exercise

- Representative live flow passed with a fake camera: camera consent, ten
  captures, live confidence/history UI, 30-second replay, a user-marked false
  trigger, JSON download, and saved-profile recovery after reload.
- Maximum boundary passed: a 48-character experiment name, three 32-character
  checkpoint names, 10 samples for each, then replay/export. The export had
  counts `[10,10,10]`; every signature contained 352 finite numbers; the
  30-second result and false-trigger report were retained.
- Empty required inputs were stopped before camera access and focus moved to the
  first invalid field. Camera-not-found returned “Connect one, or import an
  existing profile.” Malformed imports are rejected without replacing saved
  data. Partial captures and clearing survive reload. Focused-button Space
  behavior is preserved.
- One invalid-input recovery defect remains: whitespace-only experiment and
  checkpoint names satisfy HTML `required`, are trimmed to empty in the submit
  handler, and then cause a silent no-op. No error is announced and focus stays
  on the submit button.
- Checkout returned 303 to the hosted merchant. Invalid license verification
  fails softly without blocking the free workbench. There is no sign-in, so the
  Entra authority requirement is not applicable.

## Privacy, headers, PWA, and server limit

- A complete camera/capture/replay/export/reload journey made only same-origin
  requests. No analytics, trackers, third-party scripts/fonts, camera uploads,
  console errors, page errors, or request failures were observed. IndexedDB
  contains numeric profiles; localStorage license state is created only when a
  token is supplied.
- Root responses include HSTS, self-based CSP, `camera=(self)` permissions
  policy, `DENY` framing, `nosniff`, and strict-origin referrer policy. HTML,
  worker, manifest, and legal routes are no-store; hashed assets are one-year
  immutable. The manifest has the correct MIME type.
- The live worker controlled the page with `movemap-v1.0.3-shell` and
  `movemap-v1.0.3-assets`. Home and `/privacy/` reloaded offline without errors.
  The browser suite's replacement-worker scenario displayed the update toast;
  source inspection confirmed `skipWaiting()` and `clients.claim()`.
- After a cooldown, a fresh 35-request burst to the product verify endpoint
  returned **30 HTTP 200** and **5 HTTP 429**. Every 429 included
  `Retry-After: 4`. The observed allowance is 30 requests per limiter window.

## Accessibility and responsive evidence

- Independent axe scans on `/`, `/demo`, `/privacy/`, and `/terms/` at desktop
  and 390px found **zero violations** (therefore zero serious/critical issues).
- The keyboard sequence starts at the skip link and reaches navigation, setup,
  import, purchase, restore, and footer controls. Every focused control showed a
  3px solid teal outline. No trap was found.
- Reduced motion shortened the primary transition to `0.00001s`. At 390px,
  every visible link/button/input measured at least 44×44, no horizontal
  overflow appeared, and simulated 200% text produced no clipped overflow.
- At desktop width the three header navigation links are only 24.8px high,
  below the contract's 44px click-target rule.

## Defects

### High — required claims manifest and claim tests do not exist

`.factory/claims.json` is absent, while the site and README make multiple
privacy, offline, export, timing/count, and persistence claims. This directly
fails the work order's first release gate. Add exactly one observable demo-mode
test for every relied-on claim and run every listed command from a fresh clone.

### High — no one-click sample demo; first screen fails the prescribed shape

There is no demo action or isolated demo state. `/demo` is merely the normal app
and can write the ordinary `movemap-local` IndexedDB namespace. The hero does
not plainly name the intended makers/players, gives competing first actions,
and omits the offline and price facts. Build the required seeded demo, isolated
storage/banner/reset/exit behavior, `/demo` documentation, and claim tests.

### Medium — required discovery metadata and not-found route are incomplete

There is no canonical link, Open Graph/Twitter metadata, apple-touch icon link,
valid `robots.txt`, `sitemap.xml`, or designed 404 route. `/robots.txt` returns
the app HTML with 200, `/sitemap.xml` returns 404, and an unknown page returns
the home app with 200. The footer also omits a build/version identifier.
Lighthouse SEO is 92 and specifically reports invalid robots content and a
missing canonical link.

### Medium — required plain-language copy audit is missing

`.factory/copy-audit.md` does not exist, so the mandatory sentence counts,
banned-word scan, and terminology table were not supplied. The cold-page user
and action ambiguity demonstrates why this gate matters.

### Low — whitespace-only setup fails without recovery

Required fields containing only spaces cause the primary button to do nothing,
with no announced error or focus correction. Validate trimmed values and attach
the error to the relevant inputs.

### Low — desktop header links are below the target-size rule

Workbench, Method, and Maker Pack are each 24.8px high at 1440px. Mobile targets
all pass. Increase the desktop hit area to at least 44px without changing the
visual label size.

## Retest

Create the claims manifest and demo first, then run every command declared in
the manifest before the ordinary suite:

```sh
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run test:e2e
npm run test:e2e:live
npm run test:live
```

Also repeat the cold first-read test, `/demo` storage-isolation test, claim-copy
cross-check, route/metadata crawl, whitespace recovery, Lighthouse, axe,
offline/update, and desktop/mobile target audit.
