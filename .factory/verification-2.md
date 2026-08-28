# Independent verification 2 — FAIL

**Candidate:** `fc3140445361908db78b447a121c60d6979fee22`

**URL:** <https://gesture-gameplay-calibrator.sociobot.in>

**Verified:** 2026-08-28, from a detached clean worktree (Node 22.23.2,
npm 10.9.8, Playwright 1.58.2, Chromium 145.0.7632.6)

The live deployment is byte-for-byte the candidate build, and the free core
calibration journey works. This is nevertheless **not releasable** against the
work order: live checkout is broken, in-progress calibration is lost on reload,
the declared 512px PWA icon has the wrong dimensions, and Space overrides the
focused Clear button during calibration.

## Clean quality gates

- `npm ci`: passed from a detached checkout of the exact candidate; 54 packages
  installed and the worktree remained clean.
- `npm audit --audit-level=low`: 0 vulnerabilities.
- `npm test`: **3 files / 8 tests passed**.
- Exact production build `npm run build`: passed (`tsc -b && vite build`) and
  produced `dist/`. There is no lint script; `tsc -b` is the available type
  check.
- `npm run test:e2e`: **12/12 passed** across Chromium desktop and 390×844
  mobile. The suite covers semantics, camera denial, invalid import,
  calibration/replay, legal routes, axe, and offline reload.
- Production payloads: JS 28,981 B (10,837 B gzip), CSS 14,258 B (4,195 B
  gzip), hero WebP 68,074 B, and no font payload. Lighthouse reports a 141 KiB
  total transfer.
- Lighthouse 12.8.2 mobile production-preview runs were Performance
  **86/96/97**, Accessibility **100/100/100**, Best Practices **100/100/100**.
  The median clears the gate; the first run's 529 ms TBT caused the outlier.
  A separate live run scored **95/100/100**, with LCP 1.284 s, TBT 260 ms,
  and CLS 0.

## Independent product exercise

- Completed the maximum boundary flow with a 48-character experiment name,
  three checkpoints (including a 32-character name), and 10 camera examples
  per checkpoint. The exported JSON contained three 10-example checkpoints,
  every signature had 352 finite numeric values, and there were no photo or
  video fields.
- Ran the 30-second reliability replay, marked a false trigger, saw the
  “Needs another look” result, downloaded JSON, reloaded, and confirmed the
  completed profile and replay result survived in IndexedDB.
- Required-empty input was stopped by browser validation before any camera
  call. Malformed and incomplete v1 JSON was rejected without replacing saved
  data. Camera `NotAllowedError`, `NotFoundError`, and generic/busy failure each
  produced actionable recovery copy.
- Reset cancellation preserved the profile; confirmed reset removed it.
- URL license capture stored `sb_license:gesture-gameplay-calibrator`, stripped
  the token from the URL, called only the documented Sociobot verify endpoint,
  and rendered the mocked valid unlock. A live invalid-token request returned
  `{valid:false, reason:"invalid"}` with the correct CORS origin and `no-store`.

## Browser, accessibility, privacy, and PWA evidence

- `/opt/fleet/lib/verify-url.sh` passed the live title, `lang`, one-h1, main,
  image-alt, button-label, desktop/mobile screenshot, and console checks. Its
  measured navigation was 1,002 ms. Desktop and 390px screenshots were also
  visually reviewed.
- Independent Playwright axe scans on desktop and 390px mobile found **0
  serious/critical** issues. Axe did report one moderate
  `landmark-complementary-is-top-level` finding for the nested lab-note aside.
- At 390px there was no horizontal overflow (390px viewport/scroll width).
  The first Tab exposed the skip link with a visible 3px outline. Reduced motion
  reduced the primary transition to `0.00001s`. No console or page errors were
  observed locally or live.
- The free home and full camera/calibration/export flows made only same-origin
  requests. No analytics, trackers, third-party scripts/fonts, or camera upload
  occurred. IndexedDB held numeric profiles; localStorage was used only for an
  explicitly supplied license and cached verdict.
- Live worker control succeeded with `movemap-v1.0.2-shell`/`assets` caches.
  With the browser offline, a reload retained the MoveMap h1 and displayed
  “Offline — calibration still works” without errors. A synthetic next worker
  revision exercised `updatefound`, displayed “A fresh notebook is ready.
  Reload to update.”, and advanced through `skipWaiting`/activation.

## Live deployment identity and response policy

The following live resources had the same SHA-256 as the clean local `dist/`:
`/`, `/privacy/`, `/terms/`, both hashed JS/CSS files, the hashed hero, `/sw.js`,
and `/manifest.webmanifest`. In particular:

- JS `main-C-n10-32.js`:
  `61034e504e2fd4cc11cb1ad2ffcaa24de516050a252cd766e68672c9be28fcde`
- CSS `main-Bq9SN6_y.css`:
  `974231d76eb77333c3a78e3fd587e456adc6b26c51547a3d27d9f3c4e4639fe0`
- Worker:
  `30dabecf49817e44b00393987c64d4ae2fcf0edf56bfcb7ade0a3abb216ca60b`

Live HTML and the worker are `no-cache, no-store, must-revalidate`; hashed
assets are `public, max-age=31536000, immutable`; the manifest is
`application/manifest+json`. Responses include HSTS, CSP, `camera=(self)` with
other sensitive permissions disabled, `X-Frame-Options: DENY`, `nosniff`, and
strict-origin referrer policy.

## Defects

### High — the advertised paid purchase cannot start

The live “Buy Maker Pack” link targets the required Sociobot URL, but a fresh
`GET https://api.sociobot.in/api/v1/products/gesture-gameplay-calibrator/checkout`
returned **HTTP 404** with `{"error":"enabled factory product","status":404}`.
Users are promised a $12 one-time unlock and receive a raw error instead of
hosted checkout. Register/enable the live factory product and retest checkout,
return-token capture, and unlock before release.

### Medium — partial calibration is lost on refresh or tab close

After naming a three-checkpoint experiment and recording 3/10 examples, the
IndexedDB `current` profile was still `null`. Reload reset the experiment to
“My first move,” cleared the other checkpoint names, and offered no resume
action. Source inspection confirms saving happens only after the final tenth
example of the final checkpoint. Persist the draft after setup and every
capture/clear so the local-first state-survival contract is met.

### Medium — the required 512px PWA icon is not 512×512

The manifest declares `/icons/icon-512.png?v=1.0.2` as `512x512` and `any
maskable`, but both PNG header inspection and live browser decoding report
**512×437** (344,583 B). Supply a genuine square 512×512 icon, preserve the
maskable safe zone, update the version, and retest install metadata.

### Medium — Space activates the wrong action during calibration

With one example recorded, focus “Clear this checkpoint” and press Space. The
counter changes from **1/10 to 2/10** instead of clearing; Enter correctly
changes it to 0/10. The global capture shortcut intercepts Space for every
non-input target, including other buttons and links. Limit the shortcut to an
unfocused/background context or exempt all interactive elements.

### Low — several mobile touch targets are below 44px

At 390px, the brand link measured 42px high, the inline privacy/terms links in
the purchase note measured 15px high, and footer Privacy/Terms/Source links
measured 25px high. Expand their hit areas while preserving the notebook visual
system.

## Retest

```sh
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run test:e2e
```

Then retest partial-progress reload, focused-button Space behavior, decoded icon
dimensions/installability, and the live checkout redirect. No product source
was modified during this verification.
