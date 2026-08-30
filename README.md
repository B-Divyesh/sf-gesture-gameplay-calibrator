# MoveMap

MoveMap is a local-first webcam gesture calibration notebook for game makers
and players. It records ten lightweight visual edge signatures for each of one
to three poses, measures live confidence, runs a 30-second false-trigger replay,
and exports a portable JSON threshold profile. It does not inject keys, identify
people, or upload camera frames.

Live: <https://gesture-gameplay-calibrator.sociobot.in>

Try the isolated sample: <https://gesture-gameplay-calibrator.sociobot.in/demo>

## Who it is for

Use MoveMap before wiring a webcam gesture into a game. It helps answer a
practical question: does this pose stay recognizable with the camera, lighting,
background, clothing, and movement range in the room where it will be used?
Choose a seated, subtle, or hand-only pose when needed.

## Run locally

Requirements: Node.js 20.19 or newer and npm.

```sh
npm install
npm run dev
```

Open the shown local URL, allow camera access, choose up to three checkpoint
names, and record ten examples of each. Profiles persist in IndexedDB. The PWA
works offline after its first successful load.

Open `/demo` to inspect a completed three-checkpoint profile without setup.
Demo changes use the separate `movemap-demo` IndexedDB database. Resetting or
leaving the demo discards its current value without touching real profiles.

## Verify and build

```sh
npm test          # calibration unit tests
npm run typecheck # strict TypeScript project check
npm run lint      # source-level TypeScript lint gate
npm run build     # reproducible production output in ./dist
npm run test:e2e  # Chromium desktop/mobile, axe, camera, legal, offline
npm run test:e2e:live # run the same browser matrix against production
npm run test:live # verify deployed bytes, headers, icon, checkout, and billing API throttling
npm run preview   # inspect ./dist locally
```

Relied-on product claims and their exact browser commands are listed in
`.factory/claims.json`. Run each command there from a clean install before a
release.

Playwright is pinned to 1.58.2. Its Chromium binary must be available through
`PLAYWRIGHT_BROWSERS_PATH`, or install it with `npx playwright install chromium`.

## Billing configuration

Maker Pack is a one-time $12 license unlock through the Sociobot billing API.
It exports a JavaScript trigger helper using the calibrated hold and release settings.
No payment provider is embedded. Production defaults to
`https://api.sociobot.in/api/v1`; set `VITE_BILLING_BASE` at build time to use
the pilot endpoint on staging. The product slug is used directly, with no
hardcoded billing product ID.

The production release gate also sends a 60-request invalid-license burst to
the public Sociobot verification endpoint. At least one response must be
`429 Too Many Requests` and every throttled response must include a positive
`Retry-After`; run it alone with `npm run test:billing-rate-limit`.

## Privacy and limitations

Feature extraction runs in the browser. No camera image is persisted; saved and
exported profiles contain normalized numeric edge signatures. This intentionally
small model is a room-specific calibration aid, not universal pose recognition.
Read the in-product [privacy policy](https://gesture-gameplay-calibrator.sociobot.in/privacy/)
and [terms](https://gesture-gameplay-calibrator.sociobot.in/terms/).

The product brief is in [`.factory/brief.json`](.factory/brief.json), its visual
system and asset provenance in [`.factory/design.md`](.factory/design.md), and
the release verification record in [`.factory/handoff.md`](.factory/handoff.md).

## License

MIT — see [LICENSE](LICENSE).
