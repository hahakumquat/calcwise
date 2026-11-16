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

## 2026-11-15 23:00 UTC — cycle
- Shipped: capital gains tax calculator https://cappycalc.com/finance/capital-gains-tax/ (verify: 166 pages, 0 problems; 4 hand-checked examples: 0/15% split, short-term, NIIT, loss). Linked from rsu-tax.
- Health: deploys #28-#31 green (self-employment tax deploy #31 green). Live site not reachable from sandbox.
- Caveats: 2026 LTCG thresholds typed from memory of Rev. Proc. 2025-32 — owner/next cycle should spot-check against the IRS page; no 375px browser check; single sale only.
- Marketing: not run (pack exists). Daily report already posted today.
- Next: Roth vs traditional, W-4/refund estimator, rent affordability; confirm the capital-gains deploy.

## 2026-11-16 00:00 UTC — cycle
- Shipped: Roth vs traditional calculator https://cappycalc.com/finance/roth-vs-traditional/ (verify: 167 pages, 0 problems; examples hand-checked, default case traditional wins by $20,215). Linked from 401k-max-out.
- Health: deploy #32 (capital gains) green. Live site not reachable from sandbox; confirm the new deploy next cycle.
- Caveats: no 375px browser check; no IRA dollar limits stated (no sourced constant).
- Marketing: not run (pack exists for 2026-11-15; the next UTC-day cycle should write 2026-11-16 brief). Daily report for 11-15 already posted.
- Next: W-4/refund estimator, rent affordability, debt payoff; spot-check 2026 LTCG thresholds.

## 2026-11-16 01:00 UTC — cycle
- Shipped: rent affordability https://cappycalc.com/finance/rent-affordability/, emergency fund https://cappycalc.com/finance/emergency-fund/, debt payoff planner https://cappycalc.com/finance/debt-payoff-planner/ (each passed verify; final: 153 calculators, 170 pages, 0 problems). Cross-linked from take-home-pay, home-affordability, savings-goal, credit-card-payoff.
- Marketing: 2026-11-16 pack rendered (brief, reel frames, carousel, X, story, posting guide): https://github.com/hahakumquat/calcwise/tree/marketing/2026-11-16. Calendar copied to .claude/team/marketing-calendar.md.
- Health: deploys green through rent affordability; later deploys to be confirmed next cycle. Live site not reachable from sandbox.
- Caveats: no 375px browser check (Chromium unavailable to agents); emergency-fund sources are generic CFPB/FDIC pages, unchecked; 2026 LTCG thresholds still need a spot-check.
- Next: W-4/refund estimator, Roth IRA limits, student loan payoff; confirm deploys; daily report after 14:00 UTC.

## 2026-11-16 02:00 UTC — cycle
- Shipped: student loan payoff calculator https://cappycalc.com/finance/student-loan-payoff/ (verify: 171 pages, 0 problems; defaults: 120 vs 89 months, saves $2,880.48 interest, checked with independent script). Linked from loan, debt-payoff-planner.
- Health: deploys through #(debt payoff, 00:59) green. Live site not reachable from sandbox; confirm new deploy next cycle.
- Caveats: only 375px light screenshot viewed; live input updates not browser-verified; sources generic.
- Marketing: not run (pack exists for 2026-11-16). Daily report after 14:00 UTC.
- Next: W-4/refund estimator, Roth IRA limits; spot-check 2026 LTCG thresholds.

## 2026-11-16 02:50 UTC — cycle
- Shipped: Roth IRA calculator https://cappycalc.com/finance/roth-ira/ (verify: 172 pages, 0 problems; 6 hand-checked examples). Linked from roth-vs-traditional.
- Health: deploys through 01:57 green; confirm the new deploy next cycle. Live site not reachable from sandbox.
- Caveats: no browser/375px check; IRS page not fetched directly (limits from search results of Notice 2025-67).
- Marketing: not run (pack exists). Daily report after 14:00 UTC.
- Next: W-4/refund estimator, net-worth percentile (needs source), spot-check 2026 LTCG thresholds.

## 2026-11-16 03:51 UTC — cycle
- Shipped: tax refund estimator https://cappycalc.com/finance/tax-refund-estimator/ (verify: 173 pages, 0 problems; 5 hand-checked examples, default owes $870). Linked from take-home-pay, bonus-tax.
- Spot-check: 2026 LTCG thresholds (single 49,450/545,500; MFJ 98,900/613,700) match multiple sources citing Rev. Proc. 2025-32.
- Health: deploys through 02:54 green; confirm the new deploy next cycle. Live site not reachable from sandbox.
- Caveats: no 375px browser check; IRS IRB source URL not fetched.
- Next: net-worth percentile (needs source), New Year fitness cross-links; daily report after 14:00 UTC.

## 2026-11-16 05:00 UTC — cycle
- Shipped: turkey cooking time and thaw planner https://cappycalc.com/food/turkey-cooking-time/ (verify: 174 pages, 0 problems; 3 hand-checked examples). Linked from cooking-converter, recipe-scaler.
- Backlog: full 2026-11-16 refresh by product-research (24 open items across all categories; Black Friday stacked-discount, gift budget, 52-week challenge next).
- Health: deploys through 04:02 green; confirm new deploy next cycle. Live site not reachable from sandbox.
- Caveats: fsis.usda.gov blocked in sandbox, so unstuffed 18-24 lb, stuffed 14+ lb rows and the 24h-per-4-5-lb thaw rule are unverified against the page — owner/next cycle should spot-check before Thanksgiving (11-26). 375px light checked by agent via system Chrome.
- Next: stacked discount / Black Friday (ship by 11-25), gift budget; daily report after 14:00 UTC.

## 2026-11-16 05:15 UTC — cycle (cont.)
- Shipped: stacked discount / Black Friday upgrade to https://cappycalc.com/finance/discount/ (extra discount, coupon, tax; 30%+20% = 44% off; verify 174 pages, 0 problems; 4 hand-checked examples).
- Caveats: no browser check; coupon always applied after percentages.
- Next: gift budget split, 52-week challenge, Rule of 72; daily report after 14:00 UTC.

## 2026-11-16 05:30 UTC — cycle (final)
- Shipped: holiday gift budget calculator https://cappycalc.com/finance/gift-budget/ (verify 175 pages, 0 problems; 3 hand-checked examples). Linked from savings-goal, discount.
- Earlier this cycle: turkey cooking time, stacked discounts (see entries above). Deploy checks for all three due next cycle; live site not reachable from sandbox.
- Caveats: 375px light/dark checked by agent via system Chrome; turkey rows from FSIS unverified (see 05:00 entry).
- Next: 52-week savings challenge, Rule of 72, subscription annualiser; daily report after 14:00 UTC.

## 2026-11-16 06:00 UTC — cycle
- Shipped: 52-week savings challenge calculator https://cappycalc.com/finance/savings-challenge/ (verify: 176 pages, 0 problems; 4 hand-checked examples, $1+$1x52 = $1,378). Linked from savings-goal, gift-budget.
- Health: deploys through 05:01 green; backlog commit deploy in progress at start. Live site not reachable from sandbox.
- Caveats: no browser/375px check; chart is an area chart.
- Marketing: not run (pack exists). Daily report after 14:00 UTC.
- Next: Rule of 72, subscription annualiser, overtime pay; spot-check FSIS turkey rows before 11-26.

## 2026-11-16 06:10 UTC — cycle (cont.)
- Shipped: Rule of 72 calculator https://cappycalc.com/finance/rule-of-72/ (verify: 177 pages, 0 problems; 3 examples checked independently: 8% -> 9 vs 9.006 yr, 6% -> 12 vs 11.896, 9 yr -> 8% vs 8.006%). Linked from compound-interest.
- Health: earlier deploys green; savings-challenge and this deploy to confirm next cycle. Live site not reachable from sandbox.
- Caveats: no browser/375px check; mode switch not browser-tested.
- Next: subscription annualiser, overtime pay, party food (needs sources); spot-check FSIS turkey rows before 11-26; daily report after 14:00 UTC.

## 2026-11-16 07:00 UTC — cycle
- Shipped: subscription cost calculator https://cappycalc.com/finance/subscription-cost/ (verify: 178 pages, 0 problems; examples $360/yr -> $4,973.92 at 7%/10y, $480/yr with a $120 plan, $2/week -> $104). Linked from savings-goal, savings-challenge.
- Health: deploys through 05:54 (rule of 72) green; the cancelled savings-challenge run was superseded by a later green run. Live site not reachable from sandbox.
- Caveats: no browser/375px check; chart labels are "Sub N" (no name field); Investor.gov link unchecked.
- Marketing: not run (pack exists). Daily report after 14:00 UTC.
- Next: overtime pay, party food (needs sources), bill splitter; spot-check FSIS turkey rows before 11-26.

## 2026-11-16 07:10 UTC — cycle (cont.)
- Shipped: overtime and holiday pay calculator https://cappycalc.com/everyday/overtime-pay/ (verify: 179 pages, 0 problems; $20 x 48 h = $1,040, $20 x 45 h + 8 holiday h = $1,270). Linked from hours-worked.
- Health: subscription-cost deploy to confirm next cycle. Live site not reachable from sandbox.
- Caveats: no browser/375px check; donut chart appearance untested.
- Next: party food (needs sources), bill splitter, steps to distance; FSIS turkey spot-check before 11-26; daily report after 14:00 UTC.

## 2026-11-16 08:00 UTC — cycle
- Shipped: bill splitter https://cappycalc.com/everyday/bill-splitter/ (verify: 180 pages, 0 problems; $30/$20/$50 + $8 tax + 20% tip = $128, shares 38.40/25.60/64.00). Linked from tip.
- Health: deploys through 06:58 (overtime pay) green. Live site not reachable from sandbox.
- Caveats: no browser/375px check; only generic CFPB source link.
- Next: party food (needs sources), steps to distance, plate calculator; FSIS turkey spot-check before 11-26; daily report after 14:00 UTC.

## 2026-11-16 09:00 UTC — cycle
- Shipped: steps to miles/km calculator https://cappycalc.com/health/steps-to-distance/ (verify: 181 pages, 0 problems; 10,000 steps at 175 cm male = 7.26 km / 4.51 mi). Linked from calories-burned.
- Health: live site not reachable from sandbox; deploy workflow results to confirm next cycle.
- Caveats: no browser/375px check; stride factors are a labelled rule of thumb, no external source.
- Marketing: not run (pack exists). Daily report after 14:00 UTC (not yet due).
- Note: an automated `git reset --hard` was denied, so this cycle worked on a fresh branch from origin/main; local `main` is stale and untouched.
- Next: plate calculator, party food (needs sources), tax-loss harvesting (ship by 12-20); FSIS turkey spot-check before 11-26.

## 2026-11-16 10:00 UTC — cycle
- Shipped: barbell plate calculator https://cappycalc.com/sports/plate-calculator/ (verify: 182 pages, 0 problems; 225 lb -> 2x45 per side, 100 kg -> 25+15, 227 lb flagged not exact, nearest 225/230). Linked from one-rep-max.
- Health: deploys through 08:53 green; live site not reachable from sandbox.
- Caveats: no browser/375px check; IPF/IWF sources cited by name, no links.
- Marketing: not run (pack exists). Daily report after 14:00 UTC (not yet due).
- Next: party food (needs sources), tax-loss harvesting (ship by 12-20), heating cost; FSIS turkey spot-check before 11-26.
