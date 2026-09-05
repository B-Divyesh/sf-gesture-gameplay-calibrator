# MoveMap

MoveMap is a local-first webcam gesture calibration notebook for game makers
and players. It records ten examples for each pose, helps you check false
triggers, and exports a JSON profile. MoveMap does not upload camera frames.

Live: <https://gesture-gameplay-calibrator.sociobot.in>

Try the isolated sample: <https://gesture-gameplay-calibrator.sociobot.in/demo>

## Who it is for

Use MoveMap before wiring a webcam gesture into a game. Check whether the pose
still works with your room, camera, and lighting. Choose a seated, subtle, or
hand-only pose when needed.

## Run locally

Requirements: Node.js 20.19 or newer and npm.

```sh
npm install
npm run dev
```

Open the shown local URL and allow camera access. Choose up to three checkpoint
names, then record ten examples of each. Profiles persist in IndexedDB. The PWA
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

Playwright is pinned to 1.58.2. Set `PLAYWRIGHT_BROWSERS_PATH`, or install its
browser with `npx playwright install chromium`.

## Billing configuration

Maker Pack is a one-time $12 license unlock through the Sociobot billing API.
It exports a JavaScript trigger helper from the calibrated hold and release
settings. The buy link opens the registered Sociobot/Dodo checkout.

## Privacy and limitations

Camera processing runs in the browser. Saved and exported profiles contain
numeric signatures, not photos or video. This small model is a room-specific
calibration aid, not universal pose recognition.
Read the in-product [privacy policy](https://gesture-gameplay-calibrator.sociobot.in/privacy/)
and [terms](https://gesture-gameplay-calibrator.sociobot.in/terms/).

Read the product brief in [`.factory/brief.json`](.factory/brief.json).
See the visual system and asset provenance in [`.factory/design.md`](.factory/design.md).
See release evidence in [`.factory/handoff.md`](.factory/handoff.md).

## Deploy

Create `dist/` with `npm run build`. Factory operators deploy this product with:

```sh
/opt/fleet/lib/deploy-static.sh gesture-gameplay-calibrator dist
```

## License

MIT — see [LICENSE](LICENSE).
