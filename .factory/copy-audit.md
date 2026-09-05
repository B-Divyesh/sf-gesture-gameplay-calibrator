# MoveMap landing-page copy audit

Audited from the rendered `/` route on 5 September 2026. Counts treat hyphenated
terms as one word. Headings and short labels are included because they shape
the cold first read. No item exceeds 22 words.

| Words | Rendered copy |
| ---: | --- |
| 3 | Webcam gesture calibration |
| 7 | Test webcam gestures before wiring your game |
| 16 | For webcam game makers and players who need a gesture that works in their real room. |
| 6 | Try it with sample data |
| 4 | Set up my camera |
| 8 | See a finished profile, or record your own. |
| 7 | Private: camera frames stay on this device. |
| 6 | Offline: works after the first visit. |
| 7 | Price: calibration and JSON export are free. |
| 7 | Three steps for testing a webcam gesture |
| 4 | Set up the experiment |
| 6 | Name what you want to recognize |
| 6 | Choose one to three distinct poses. |
| 17 | A checkpoint can be as small as a hand position or as broad as a full-body stance. |
| 8 | Ten examples will be recorded for each one. |
| 3 | Camera stays here. |
| 7 | Frames are processed only in this tab. |
| 9 | No video or photos are saved or sent anywhere. |
| 5 | Move in your own way. |
| 9 | Choose a seated, subtle, or hand-only pose when needed. |
| 5 | Stop whenever you need to. |
| 3 | How confidence works |
| 5 | How MoveMap measures a pose |
| 3 | Record each pose |
| 12 | Each example becomes a numeric signature in your saved and exported profile. |
| 3 | Compare your examples |
| 11 | MoveMap uses ten examples to set a threshold for each checkpoint. |
| 4 | Test in your room |
| 4 | The replay shows confidence. |
| 11 | Change distance or light and mark any false trigger you observe. |
| 9 | Keep the camera and background fixed when comparing runs. |
| 6 | Room changes can alter the score. |
| 12 | Use the export as a room-specific reference, not a universal pose model. |
| 3 | Optional one-time purchase |
| 5 | Add a JavaScript trigger helper |
| 13 | Maker Pack generates a JavaScript helper from your calibrated hold and release settings. |
| 9 | Calibration, testing, safety information, and JSON export stay free. |
| 6 | Sociobot/Dodo handles checkout and refunds. |
| 4 | See privacy and terms. |
| 3 | Restore a purchase |
| 7 | Paste the license token from your receipt. |
| 5 | It stays in this browser. |
| 9 | Test webcam gestures before adding them to a game. |
| 4 | Built by Param Factory. |
| 11 | Editorial artwork was generated for MoveMap with the factory image model. |

## README copy

The repaired README uses short setup and product sentences. The longest prose
sentence is 17 words. The earlier 23-, 27-, 28-, and 29-word sentences were
split or removed.

| Words | Sentence |
| ---: | --- |
| 13 | MoveMap is a local-first webcam gesture calibration notebook for game makers and players. |
| 17 | It records ten examples for each pose, helps you check false triggers, and exports a JSON profile. |
| 6 | MoveMap does not upload camera frames. |
| 10 | Use MoveMap before wiring a webcam gesture into a game. |
| 12 | Check whether the pose still works with your room, camera, and lighting. |
| 9 | Choose a seated, subtle, or hand-only pose when needed. |
| 10 | Open the shown local URL and allow camera access. |
| 9 | Choose up to three checkpoint names, then record ten examples of each. |
| 4 | Profiles persist in IndexedDB. |
| 9 | The PWA works offline after its first successful load. |
| 9 | Open `/demo` to inspect a completed three-checkpoint profile without setup. |
| 8 | Demo changes use the separate `movemap-demo` IndexedDB database. |
| 13 | Resetting or leaving the demo discards its current value without touching real profiles. |
| 13 | Maker Pack is a one-time $12 license unlock through the Sociobot billing API. |
| 13 | It exports a JavaScript trigger helper from the calibrated hold and release settings. |
| 9 | The buy link opens the registered Sociobot/Dodo checkout. |
| 6 | Camera processing runs in the browser. |
| 9 | Saved and exported profiles contain numeric signatures, not photos or video. |
| 10 | This small model is a room-specific calibration aid, not universal pose recognition. |

## First-screen read

The headline names the job in seven words. The next sentence names webcam game
makers and players. The primary action opens the sample in one click. The
adjacent camera action says what the alternative does. Privacy, offline, and
price appear as three separate facts.

## Banned-word scan

The rendered landing copy contains none of: leverage, seamless, effortless,
robust, powerful, intuitive, reimagine, supercharge, delightful, journey,
ecosystem, AI-powered, or AI magic. The phrase “Maker Pack” is the paid feature
name; the interface uses “purchase,” not the banned figurative sense of
“unlock.”

## Terminology table

| Concept | One term used |
| --- | --- |
| Saved calibration document | profile |
| Named pose inside a profile | checkpoint |
| One recorded pose observation | example |
| Reliability exercise | replay |
| Downloaded free data | JSON profile |
| Paid add-on | Maker Pack |
| Generated paid download | JavaScript trigger helper |
| Browser-only trial state | demo |
