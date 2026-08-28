# MoveMap

MoveMap is a local-first webcam gesture calibration notebook for game makers
and players. It records ten lightweight visual edge signatures for each of one
to three poses, measures live confidence, runs a 30-second false-trigger replay,
and exports a portable JSON threshold profile. It does not inject keys, identify
people, or upload camera frames.

Live: <https://gesture-gameplay-calibrator.sociobot.in>

## Who it is for

Use MoveMap before wiring a webcam gesture into a game. It helps answer a
practical question: does this pose stay recognizable with the camera, lighting,
background, clothing, and movement range in the room where it will be used?
Seated, subtle, and hand-only gestures are supported.

## Run locally

Requirements: Node.js 20.19 or newer and npm.

```sh
npm install
npm run dev
```

Open the shown local URL, allow camera access, choose up to three checkpoint
names, and record ten examples of each. Profiles persist in IndexedDB. The PWA
works offline after its first successful load.

## Verify and build

```sh
npm test          # calibration unit tests
npm run build     # reproducible production output in ./dist
npm run test:e2e  # Chromium desktop/mobile, axe, camera, legal, offline
npm run test:e2e:live # run the same browser matrix against production
npm run test:live # verify deployed bytes, headers, icon, catalog, and checkout
npm run preview   # inspect ./dist locally
```

Playwright is pinned to 1.58.2. Its Chromium binary must be available through
`PLAYWRIGHT_BROWSERS_PATH`, or install it with `npx playwright install chromium`.

## Billing configuration

Maker Pack is a one-time $12 license unlock through the Sociobot billing API.
No payment provider is embedded. Production defaults to
`https://api.sociobot.in/api/v1`; set `VITE_BILLING_BASE` at build time to use
the pilot endpoint on staging. The product slug is used directly, with no
hardcoded billing product ID.

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
