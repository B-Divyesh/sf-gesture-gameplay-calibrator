# MoveMap independent QA handoff — FAIL

Candidate `fc3140445361908db78b447a121c60d6979fee22` was independently tested on
2026-08-28 from a clean detached checkout and against
<https://gesture-gameplay-calibrator.sociobot.in>. The live HTML, hashed JS/CSS,
hero, service worker, manifest, privacy page, and terms page exactly match the
candidate production build. This is **not** a stale or deployment-only build
failure.

## Release blockers

- **High:** the live $12 Maker Pack checkout endpoint returns HTTP 404, so the
  advertised purchase cannot start.
- **Medium:** an interrupted calibration is not persisted. A reload after 3/10
  examples lost the experiment, checkpoint names, and examples.
- **Medium:** the manifest declares a 512×512 maskable icon, but the deployed
  PNG decodes as 512×437.
- **Medium:** during capture, Space on the focused “Clear this checkpoint”
  button records another example; Enter clears correctly.
- **Low:** multiple 390px mobile links have 15–42px hit-area heights, below the
  required 44px.

Full evidence and exact hashes are in `.factory/verification-2.md`.

## Passing evidence

- `npm ci` and `npm audit`: passed, 0 vulnerabilities.
- `npm test`: 3 files / 8 tests passed.
- `npm run build`: passed (`tsc -b && vite build`).
- `npm run test:e2e`: 12/12 desktop/mobile tests passed.
- Independent maximum flow: three checkpoints × ten examples, 30-second replay,
  false-trigger report, JSON export, completed-profile reload, invalid-input and
  camera-error recovery all worked.
- Axe: 0 serious/critical on desktop and mobile; no console/page errors; visible
  keyboard focus; reduced motion honored; no 390px overflow.
- Live Lighthouse: Performance 95, Accessibility 100, Best Practices 100; LCP
  1.284 s, TBT 260 ms, CLS 0. Local median Performance was 96 across three runs.
- Initial JS is 28,981 B, CSS 14,258 B, hero 68,074 B, with no webfont payload.
- Free operation made no third-party requests. Live security headers, manifest
  MIME, immutable hashed-asset caching, worker offline reload, and update toast
  all passed.

## Required next steps

1. Register/enable the live Sociobot billing product and verify the complete
   checkout return flow.
2. Persist draft setup and examples continuously in IndexedDB.
3. Replace the malformed 512px icon with a genuine square maskable asset.
4. Scope the Space shortcut so focused controls keep native keyboard behavior.
5. Enlarge undersized mobile link hit areas, then rerun the commands below and
   the focused manual/browser cases in the verification report.

```sh
npm ci
npm audit --audit-level=low
npm test
npm run build
npm run test:e2e
```

Only `.factory/verification-2.md` and this handoff were changed by verification;
product code remains untouched.
