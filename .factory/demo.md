# MoveMap demo sandbox

## Open the demo

Use <https://gesture-gameplay-calibrator.sociobot.in/demo> or open `/demo`
locally. The landing page also has a **Try it with sample data** link.

The first demo screen contains a completed “Living room rhythm game” profile:

- three checkpoints: Hands up, Lean left, and Small duck;
- ten numeric edge signatures per checkpoint;
- calibrated thresholds and hold settings;
- a completed 30-second replay with six triggers and no reported false trigger.

The sample can be exported as JSON immediately. **Try my camera in this demo**
replaces the sample with an isolated camera calibration without reading or
writing the visitor's real profile.

## Isolation and reset

Demo profiles use the `movemap-demo` IndexedDB database. Real profiles use
`movemap-local`. The app never opens `movemap-local` while `/demo` is active.

**Reset demo** deletes the current demo value and recreates the original
sample. **Start for real** deletes the demo value before opening `/`. Neither
action changes the real profile database.

The demo app shell and bundled sample work offline after the first successful
visit. The claim tests always begin at `/demo` in a fresh browser context.
