# Decisions

- 2026-11-15 — Ship fully automatically when all checks pass; revert automatically if the live site breaks. (Owner)
- 2026-11-15 — No mascot artwork anywhere; brand is the calculator-grid logo. (Owner)
- 2026-11-15 — Marketing media lives on the `marketing` branch, never on `main`. Nothing is posted automatically. (Owner)
- 2026-11-15 — The team runs in cycles every few hours, not once a day, and unblocks itself instead of stopping; one daily report issue. (Owner: "dont stop running. always try to unblock yourself")
- 2026-11-15 — Media renders in GitHub Actions on the `marketing` branch (`scripts/media/lib.mjs`), because the cloud sandbox has no browser/ffmpeg and cannot reach the live site.
