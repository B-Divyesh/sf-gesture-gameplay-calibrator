# MoveMap repair 4 — PASS

**Base candidate:** `a1f1394d777b563d092fdd4dbd844898bbd0b257`
**Verifier report repaired:** `607afc3131cf18b0810b510eb842d72a088d4a10` / `.factory/verification-4.md`
**Repair commit:** `0f2b081` (`fix: restore 44px mobile link targets`)
**Deployed:** 2026-08-30 to <https://gesture-gameplay-calibrator.sociobot.in> (Static Web Apps deployment `a143e586-63aa-46cb-baed-c7ddf7dac5e8`)

## Repair made

The verifier's sole release blocker was reproduced before changing source with
an exact 390 by 844 CSS-pixel Playwright rectangle audit:

| Route | Target | Before |
| --- | --- | --- |
| `/` | Maker Pack `terms` link | 37.7 by 44 px |
| `/privacy/` | `privacy@sociobot.in` mail link | 161.8 by 19 px |
| `/terms/` | `support@sociobot.in` mail link | 164.5 by 19 px |

These secondary text links were inline, so they did not inherit the product's
44px control sizing. `src/main.ts` now marks those three links as
`touch-link`; `src/styles.css` gives that class an explicit `inline-flex`,
`min-inline-size: 44px`, and `min-block-size: 44px` hit area. The visually
reviewed 390px layouts remain free of overlap and horizontal overflow.

`tests/e2e/app.spec.ts` now has the exact regression gate:
`every visible mobile target is at least 44 by 44 CSS pixels
@regression:mobile-targets`. It sets a 390 by 844 viewport and enumerates all
visible `a`, `button`, and `input` rectangles on `/`, `/privacy/`, and
`/terms/`, failing with the target details if either dimension is below 44px.
After the repair the exhaustive audit found 0 undersized targets among 17 home,
7 privacy, and 7 terms controls.

## Verification evidence

| Check | Evidence |
| --- | --- |
| Clean install and audit | `npm ci` installed 54 packages; `npm audit --audit-level=low` reported 0 vulnerabilities. |
| Unit/integration | `npm test`: 3 files, 10 tests passed. |
| Type and production build | `npm run build` passed (`tsc -b && vite build`) and produced `dist/`. No separate lint script is configured; the TypeScript build is the repository's static check. |
| Build budget | Main JS 30.05 kB / 11.24 kB gzip; CSS 14.45 kB / 4.22 kB gzip; hero WebP 68.07 kB. |
| Local browser matrix | `npm run test:e2e`: 26/26 passed across Desktop Chromium and the 390 by 844 mobile project, including keyboard, camera-denial, import safety, persistence, offline reload, and update-toast paths. |
| Live browser matrix | `npm run test:e2e:live`: 26/26 passed against production after deployment. |
| Touch-target regression | The new 390px route audit passed locally and live with no rectangle below 44 by 44 CSS pixels. |
| Accessibility | Axe found 0 violations on `/`, `/privacy/`, and `/terms/` at desktop and 390px, locally and live. Keyboard smoke tests cover the visible skip link and focused Clear-button Space action. |
| URL smoke | `/opt/fleet/lib/verify-url.sh` passed locally and live. Live navigation was 831 ms with zero console/page errors, `lang=en`, one h1, a main landmark, image alt text, and no unlabeled buttons. |
| Performance | Local Lighthouse 12.8.2 mobile: Performance 97, Accessibility 100, Best Practices 100; LCP 2.4 s, TBT 0 ms, CLS 0, 91 KiB transfer. |
| Privacy and identity | Browser suite preserves same-origin-only free startup, no automatic license state, local IndexedDB profile storage, and no camera upload. The existing invalid-license and returned-token paths still pass. |
| PWA/offline/update | Browser suite confirms a controlled cached shell reloads offline with the offline ribbon and that an installed replacement worker announces the update. |
| Response policy and live identity | `npm run test:live` passed: all 16 deployable files are byte-identical to `dist`; document and asset cache policy, CSP, HSTS, permissions policy, manifest MIME, maskable 512px icon, product catalog identity, and checkout redirect all passed. |
| Billing limiter | The same final live gate made a 60-request invalid-license burst: 59 responses were 429 and every throttled response supplied a positive `Retry-After`. |
| Package/consumer | Not applicable: MoveMap remains a static PWA, not a published package. |

## Runbook

```sh
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run test:e2e
npm run test:e2e:live
npm run test:live
```

Deploy the already built static artifact with:

```sh
/opt/fleet/lib/deploy-static.sh gesture-gameplay-calibrator dist
```

## Known gaps and next steps

None. The product remains the original local-first, offline PWA; this repair
only expands secondary link hit areas and adds the exhaustive mobile regression
coverage.
