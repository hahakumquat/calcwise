# Daily log

Newest entry at the bottom. One entry per daily run, ≤ 25 lines.

## 2026-11-15 — team set up

- Created the role agents (.claude/agents/), playbook, backlog and smoke checks. Deploy workflow now runs `npm run smoke`.
- Owner decisions: fully automatic shipping (with tests/build/smoke gates and auto-revert), daily cloud run, platforms: Instagram (Reels + posts), TikTok, X, Reddit. Social posting stays manual.

## 2026-11-15 — daily run
- Shipped: 401(k) max-out calculator, https://cappycalc.com/finance/401k-max-out/ (deploy run #19 green; tests 145/0 problems, check, build 162 pages, smoke 0 problems).
- SEO: take-home-pay page got worked-example FAQs (figures from compute()) + link to fire-number.
- Research: full backlog refresh (next: bonus tax, HSA/FSA before open enrollment ends, tax-year 2027 refresh when IRS publishes).
- Health: deploys #13-#19 green. Live-site fetches blocked by sandbox proxy (403) — live pages NOT verified.
- Marketing: brief on `marketing` branch, 2026-11-15/brief.md. No media (no ffmpeg/Playwright). Nothing posted.
- Blockers: cappycalc.com unreachable from this sandbox; share image not checked; on mobile the stage card sits below inputs (default layout).
- Owner: eyeball the live 401k page (expects $1,583.33 / 48.4%); check r/personalfinance self-promo rules before posting. Note: smoke needs PUBLIC_ADSENSE_CLIENT=ca-pub-7888535375567084 (not "x" as the playbook says).

## 2026-11-15 20:00 UTC — cycle
- Shipped: chart marker labels now sit above the plot (fixes "Dec 31" overlap on 401k-max-out); bonus tax calculator https://cappycalc.com/finance/bonus-tax/ (verify: 163 pages, 0 problems).
- Deploys: #26 (charts) green; #27 (bonus tax) queued at time of writing — next cycle confirm it and its live verify job.
- SEO: bonus-tax linked from take-home-pay related; no separate SEO item this cycle.
- Marketing: not run this cycle (pack exists for 2026-11-15). Live site not reachable from sandbox.
- Next: HSA/FSA savings (open enrollment ending; verify 2027 FSA limit against IRS Rev. Proc.), then self-employment tax / capital gains.

## 2026-11-15 21:00 UTC — cycle
- Shipped: HSA and FSA tax savings calculator https://cappycalc.com/finance/hsa-fsa-savings/ (verify: 164 pages, 0 problems); linked from take-home-pay.
- Caveats: 2027 health FSA limit ($3,500) is from secondary reports, labelled "reported"; both plan years use 2026 tax tables. No visual check at 375px (no browser run).
- Health: deploys #26-#28 green before this push; confirm the new deploy next cycle. Daily report already posted today.
- Next: self-employment tax, capital gains, Roth vs traditional.

## 2026-11-15 22:00 UTC — cycle
- Shipped: self-employment tax calculator https://cappycalc.com/finance/self-employment-tax/ (verify: 165 pages, 0 problems; hand-checked $80k example = SE tax $11,303.64).
- Health: deploy #30 (HSA/FSA) green. Live site not reachable from sandbox; confirm the new deploy next cycle.
- Caveat: no QBI deduction modelled (stated in copy); no 375px browser check.
- Next: capital gains tax, Roth vs traditional.
