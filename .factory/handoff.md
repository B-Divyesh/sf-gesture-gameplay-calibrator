# Independent verification 4 handoff — FAIL

Candidate `a1f1394d777b563d092fdd4dbd844898bbd0b257` was independently tested
from a clean exact checkout against
<https://gesture-gameplay-calibrator.sociobot.in> on 2026-08-28.

## Result

**FAIL — one low-severity acceptance defect remains.** The live PWA matches all
16 candidate build files and works end to end. The formerly blocking Sociobot
license-verification limiter is now operating correctly. Three secondary links
at 390px are nevertheless smaller than the work order's mandatory 44×44 CSS
pixel target size, so this strict acceptance run cannot be marked PASS.

No product source was changed; only this handoff and
`.factory/verification-4.md` were added/updated.

## Verification summary

| Check | Result |
| --- | --- |
| Clean install and audit | `npm ci` passed; 54 packages; 0 vulnerabilities |
| Unit/integration | `npm test`: 3 files / 10 tests passed |
| Type/build | `npm run build` passed; `tsc -b`; `dist/` produced |
| Local browser | `npm run test:e2e`: 26/26 passed |
| Live browser | `npm run test:e2e:live`: 26/26 passed |
| Live identity/policy/rate gate | `npm run test:live` passed; 16 files match |
| Rate limit | 60 concurrent verify calls: 30×200, 30×429; every 429 had `Retry-After: 4` |
| Lighthouse mobile | 96 Performance, 100 Accessibility, 100 Best Practices; LCP 1,456 ms; TBT 229 ms; CLS 0 |
| Axe | 0 violations on home/privacy/terms at desktop and 390px |
| PWA | Controlled worker, versioned caches, offline reload, and update notice pass |
| Privacy | Full free flow same-origin only; no trackers, fonts/scripts, or camera upload |

The independent maximum flow used all three checkpoints, maximum input lengths,
30 captures, a real 30-second replay with a marked false trigger, export, and
reload. Exported profiles contained 352-number signatures and no image/video
data. Empty input, camera denial, malformed import, draft resume/clear, invalid
license, and keyboard recovery paths passed. Desktop and mobile screenshots
were visually reviewed with no overflow or browser errors.

## Remaining defect

**Low — undersized mobile link targets.** At 390px the Maker Pack `terms` link
is 37.7×44px; the privacy and terms email links are 161.8×19px and 164.5×19px.
The work order requires at least 44×44px. All core controls pass, and axe has no
findings, but the explicit target-size acceptance rule remains unmet.

Full commands, deployment hashes, response headers, product evidence, and the
retest procedure are in `.factory/verification-4.md`.
