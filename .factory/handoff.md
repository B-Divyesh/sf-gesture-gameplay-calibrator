# MoveMap review 1 handoff — FAIL

Completed the requested adversarial first-read review without changing product
code. The review is in `.factory/review-1.md`.

Verification used fresh live Playwright contexts at 390px and desktop, plus a
fresh local clone at `/tmp/movemap-review.pP8Ek4`. All seven declared claim
commands passed after `npm ci` and `npm run build`; `npm test` passed 15
tests; the complete local browser suite passed 50 tests. The isolated demo,
request log, IndexedDB namespace, reset, offline claim, mobile targets,
metadata, and earlier repair history were checked.

The verdict is FAIL. The paid Sociobot catalog and checkout currently return
HTTP 500, so `npm run test:live` fails at the catalog check and a buyer cannot
start the advertised Maker Pack purchase. The review also documents missing
route-focus behavior, unlisted claims, and copy findings. No product files were
modified; only this handoff and the review were added/updated.
