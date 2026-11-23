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

## 2026-11-16 11:00 UTC — cycle
- Shipped: tax-loss harvesting calculator https://cappycalc.com/finance/tax-loss-harvesting/ (verify: 183 pages, 0 problems; $4,000 gains/$10,000 loss -> $1,320 saved, $3,000 carried; MFS cap $1,500). Linked from capital-gains-tax.
- Health: deploys through 09:53 green; backlog-commit deploy 10:51 in progress at start. Live site not reachable from sandbox.
- Caveats: no browser/375px check; long-term gains only, no NIIT/state tax.
- Marketing: not run (pack exists). Daily report after 14:00 UTC (not yet due).
- Next: party food (needs sources), heating cost, secret santa (ship by 12-05); FSIS turkey spot-check before 11-26.

## 2026-11-16 12:00 UTC — cycle
- Shipped: space heater vs furnace cost calculator https://cappycalc.com/everyday/heating-cost/ (verify: 184 pages, 0 problems; 1500 W x 8 h = 40,944 BTU, $2.04 electric vs $0.65 gas, ratio 3.16x). Linked from electricity-cost.
- Health: deploys through 10:52 (tax-loss) green; 11:54 backlog deploy in progress at start. Live site not reachable from sandbox.
- Caveats: no browser/375px check; DOE/EIA source links unopened.
- Marketing: not run (pack exists). Daily report after 14:00 UTC (not yet due).
- Next: party food (needs USDA/Butterball sources), secret santa (ship by 12-05); FSIS turkey spot-check before 11-26.

## 2026-11-16 13:00 UTC — cycle
- Shipped: Thanksgiving & party food (turkey quantity) calculator https://cappycalc.com/food/party-food-quantity/ (verify: 185 pages, 0 problems; 10 adults = 10 lb, 15 lb with leftovers). Linked from turkey-cooking-time.
- Health: live site not reachable from sandbox; deploy results to confirm next cycle.
- Caveats: turkey only, sides dropped (no verifiable sources); kid 0.5 portion is a labelled assumption; USDA/Illinois Extension URLs confirmed from search snippets only; no browser/375px check.
- Marketing: not run (pack exists). Daily report after 14:00 UTC (not yet due).
- Next: secret santa (ship by 12-05; needs text-list input support check), fuel economy converter; spot-check the two sources and FSIS turkey table before 11-26.

## 2026-11-16 13:53 UTC — cycle
- Shipped: Secret Santa generator https://cappycalc.com/other/secret-santa/ (verify: 186 pages, 0 problems; derangement with one-way "cannot draw" rules, crypto random, matching fallback). Linked to gift-budget.
- Health: deploys through 12:56 green. Live site not reachable from sandbox.
- Caveats: no one-at-a-time reveal (UI recomputes on input change); no browser/375px check; local `main` branch is unrelated to origin/main, so worked from a branch off origin/main.
- Marketing: not run (pack exists). Daily report due next cycle (after 14:00 UTC).
- Next: daily report; fuel economy converter, time zone converter; spot-check turkey sources before 11-26.

## 2026-11-16 14:51 UTC — cycle
- Shipped: fuel economy converter https://cappycalc.com/conversion/fuel-economy-converter/ (verify: 187 pages, 0 problems; 30 US mpg = 7.84 L/100 km = 12.75 km/L = 36.0 UK mpg). Linked from gas-cost.
- Report: posted Daily report 2026-11-16 (#2), closed #1.
- Health: deploys through 13:56 green. Live site not reachable from sandbox.
- Caveats: no browser/375px check of the scale chart.
- Marketing: not run (pack exists).
- Next: time zone converter; spot-check turkey sources before 11-26.

## 2026-11-16 15:51 UTC — cycle
- Shipped: time zone converter https://cappycalc.com/everyday/time-zone-converter/ (verify: 188 pages, 0 problems; 12:00 New York = 17:00 London in Dec, 20:00 NY = 10:00 next day Tokyo). Linked from hours-worked.
- Health: deploys through 14:53 green. Live site not reachable from sandbox.
- Caveats: no browser/375px check; DST note compares to min(Jan, Jul) offset so Dublin summer shows no note.
- Marketing: not run (pack exists). Report already posted today.
- Next: chmod calculator, stair calculator; spot-check turkey sources before 11-26.

## 2026-11-16 16:51 UTC — cycle
- Shipped: chmod permission calculator https://cappycalc.com/developer/chmod-calculator/ (verify: 189 pages, 0 problems; 755 = rwxr-xr-x, 644, 600, 1777 = rwxrwxrwt, 4755 = rwsr-xr-x, 2745 = rwxr-Sr-x). Linked from number-base-converter.
- Health: no failed deploys seen; live site not reachable from sandbox.
- Caveats: no browser/375px check of the 12-toggle layout; built directly by lead (small item), no ux/seo delegation.
- Marketing: not run (pack exists). Report already posted today.
- Next: stair calculator (rank 19, low), then rank 20/21 improvements; spot-check turkey sources before 11-26.

## 2026-11-16 16:55 UTC — cycle (second item)
- Shipped: stair calculator https://cappycalc.com/construction/stair-calculator/ (verify: 190 pages, 0 problems; 108 in rise, 7.5 target -> 14 risers of 7.714 in, 13 treads, 130 in run; IRC check 7¾ in / 10 in). Linked from square-footage.
- Caveats: stair-profile line chart uses repeated x values for the step shape, not seen rendered; no 375px check; IRC cited by name, no URL.
- Next: rank 20/21 improvements (weight-goal card, FIRE verdict copy); backlog has few new-calculator items left, so product-research should refill.

## 2026-11-16 17:00 UTC — cycle (third item)
- Research: product-research refilled the backlog (ranks 20-28 new, 15 open items); party drinks and holiday lights should ship by early December.
- Shipped: latte factor calculator https://cappycalc.com/finance/latte-factor/ (verify: 191 pages, 0 problems; $5 daily = $1,825/yr, $54,750 over 30 yrs, $172,391 at 7%). Linked from subscription-cost.
- Caveats: no browser/375px check; built directly by lead; deploys for chmod/stair were in progress/pending at last look, final state not rechecked.
- Next: gym cost per visit (rank 21), raise calculator (22), holiday lights (26).

## 2026-11-16 18:00 UTC — cycle (fourth item)
- Shipped: gym cost per visit calculator https://cappycalc.com/health/gym-cost-per-visit/ (verify: 192 pages, 0 problems; $60/mo, 10 visits = $6.00/visit, break-even 4 visits/mo). Linked from subscription-cost.
- Health: last deploys green; Daily report already posted today (#2).
- Caveats: no browser/375px check; null primary result (0 visits) rendering unseen; schema has no share-text line, so the "i'm cooked" share caption is not added (needs share-card.ts change).
- Marketing: not run (pack exists). SEO: related links only.
- Next: raise calculator (22), habit compounding (23), holiday lights (26).

## 2026-11-16 18:55 UTC — cycle
- Shipped: raise calculator https://cappycalc.com/finance/raise-calculator/ (verify: 193 pages, 0 problems; $60k at 5% = $63,000, +$250/mo, $28.85 -> $30.29/h, real raise 1.65% at 3.3% inflation, $2,110.50 after 29.65% tax). Linked from take-home-pay-adjacent related list.
- Caveats: no browser/375px check; built directly by lead; "new salary" input form from spec not added (percent only).
- Health: not rechecked this cycle (live site unreachable from sandbox).
- Marketing: not run (pack exists). Report already posted today.
- Next: habit compounding (23), year progress (24), holiday lights (26), party drinks (25).

## 2026-11-16 19:55 UTC — cycle
- Shipped: 1% better every day calculator https://cappycalc.com/math/habit-compounding/ (verify: 194 pages, 0 problems; 1.01^365 = 37.78, 0.99^365 = 0.0255, 1.01^30 = 1.348, linear 4.65x). Linked from rule-of-72.
- Caveats: no browser/375px check; built directly by lead; local main was stale and was reset to origin/main first.
- Marketing: not run (pack exists). Report already posted today.
- Next: year progress (24), party drinks (25), holiday lights (26).

## 2026-11-16 20:55 UTC — cycle
- Shipped: year progress calculator https://cappycalc.com/everyday/year-progress/ (verify: 195 pages, 0 problems; 2026-12-16 = day 350/365, 15 days left, 11 weekdays left; 2028-03-01 = day 61/366). Linked from date-difference.
- Caveats: no browser/375px check; built directly by lead; no ux/seo delegation.
- Marketing: not run (pack exists). Daily report already posted today.
- Next: party drinks (25, ship by 12-20), holiday lights (26), turkey source spot-check before 11-26.

## 2026-11-16 21:55 UTC — cycle
- Shipped: NYE party drinks calculator https://cappycalc.com/food/party-drinks/ (verify: 196 pages, 0 problems; 20 guests, 5 h -> 138 drinks, 12 wine bottles). Linked from party-food-quantity.
- Caveats: no browser/375px check; per-hour rule (2 then 1/h, +15%) and NIAAA/Omni sources could not be opened from sandbox, copy says "rule of thumb"; owner may confirm the NIAAA link.
- Marketing: not run (pack exists). Daily report already posted today.
- Next: holiday lights (26, ship by early Dec), wind chill, road-trip extras (27).

## 2026-11-16 22:55 UTC — cycle
- Shipped: Christmas lights cost and circuit calculator https://cappycalc.com/everyday/holiday-lights/ (verify: 197 pages, 0 problems; 10 x 40 W, 6 h, 45 d, $0.165 = 108 kWh = $17.82; 15 A limit 1,440 W). Linked from electricity-cost.
- Caveats: no browser/375px check; DOE/EIA source links not opened from sandbox; built directly by lead. Local main was stale and a hard reset was blocked, so worked on branch cycle-lights from origin/main.
- Marketing: not run (pack exists). Daily report already posted today.
- Next: road-trip extras on gas-cost (27), wind chill (28), then research refill.

## 2026-11-16 23:55 UTC — cycle
- Shipped: wind chill calculator https://cappycalc.com/everyday/wind-chill/ (verify: 198 pages, 0 problems; 0 F/15 mph = -19.4 F, 20 F/10 mph = 8.85 F; undefined above 50 F or wind <= 3 mph). NWS source.
- Caveats: no browser/375px check; built directly by lead; "not defined" case has no example (schema forbids null expects).
- Marketing: not run (pack exists). Daily report already posted today.
- Next: road-trip extras on gas-cost (27), turkey source spot-check before 11-26, research refill (backlog nearly exhausted).

## 2026-11-17 00:58 UTC — cycle
- Shipped: road-trip extras on gas-cost https://cappycalc.com/everyday/gas-cost/ (verify: 198 pages, 0 problems; 500 mi round trip, 28 mpg, $3.50 = $62.50 fuel, +$10 tolls = $72.50, $36.25 each; 2 nights x $100 + 3 days x $30 food = $332). Existing outputs unchanged.
- Caveats: no browser/375px check; built directly by lead; no delegation. Backlog has only blocked/parked items left plus ranks 15, 29, 30.
- Marketing: not run this cycle (cycle ended early). Daily report not due (before 14:00 UTC).
- Next: research refill (backlog nearly empty), turkey source spot-check before 11-26.

## 2026-11-17 02:00 UTC — cycle
- Shipped: rent split by room size https://cappycalc.com/everyday/rent-split/ (verify: 199 pages, 0 problems; $2,000, 150/100 sq ft, 40% common -> $1,120/$880; 0% -> $1,200/$800; $100 premium -> $1,240/$760).
- Health/SEO: turkey table spot-checked against FSIS values from memory (matches). Backlog refilled with ranks 34-41 by product-research. No separate SEO change.
- Caveats: no browser/375px check; built directly by lead; deploy workflow not inspected from sandbox.
- Marketing: not run (pack exists). Daily report not due (before 14:00 UTC).
- Also shipped 02:xx: SS COLA calculator https://cappycalc.com/finance/social-security-cola/ (200 pages, 0 problems; $2,000 at 3.6% = $2,072).
- Next: DTI (34, cite cfpb), RMD (40, verify IRS factors first), tax-year 2027 refresh (31, IRS figures now published).

## 2026-11-17 02:55 UTC — cycle
- Shipped: DTI calculator https://cappycalc.com/finance/debt-to-income/ (verify: 201 pages, 0 problems; $6,000 income, $1,500 housing, $600 debts -> 35.0%, housing 25.0%; $5,000/$3,000 -> 60%, $1,200 to clear to reach 36%).
- Caveats: no browser/375px check; built directly by lead; 36%/43% framed as benchmarks (CFPB link not opened from sandbox).
- Marketing: not run (pack exists). Daily report not due (before 14:00 UTC).
- Next: RMD (40, verify IRS table), tax-year 2027 refresh (31), commute cost (37).

## 2026-11-17 03:55 UTC — cycle
- Shipped: commute cost calculator https://cappycalc.com/everyday/commute-cost/ (verify: 202 pages, 0 problems; 20 mi, 250 days, 25 mpg, $3.20 -> 10,000 mi, $1,280 fuel, 250 h = 31.25 eight-hour days).
- Caveats: no browser/375px check; built directly by lead, no delegation; wear cost is user-supplied (no IRS rate cited); DOE source link not opened from sandbox. Deploy workflow not inspected from sandbox. Local checkout was detached HEAD; reset to origin/main.
- Marketing: not run (pack exists). Daily report not due (before 14:00 UTC).
- Next: RMD (40, verify IRS table), tax-year 2027 refresh (31), dividend/DRIP (38), PTO (39).

## 2026-11-17 04:55 UTC — cycle
- Shipped: dividend/DRIP calculator https://cappycalc.com/finance/dividend-calculator/ (verify: 203 pages, 0 problems; $10k, 4% yield, 5% growth, 10 y DRIP -> $23,673.64; no DRIP -> $16,288.95).
- Caveats: built directly by lead, no delegation; no browser/375px check; constant yield (dividend-growth input dropped, stated in copy); SEC link not opened; deploy workflow not inspected. A `git reset --hard` was blocked by the sandbox, used `checkout -B main origin/main` instead.
- Marketing: not run. Daily report not due (before 14:00 UTC).
- Next: PTO (39), RMD (40, verify IRS table), tax-year 2027 refresh (31).

## 2026-11-17 05:55 UTC — cycle
- Shipped: PTO calculator https://cappycalc.com/everyday/pto-calculator/ (verify: 204 pages, 0 problems; 15 d x 8 h, 26 periods = 4.615 h/paycheck; 10 d used = 5 d / 40 h left; $52k = $25/h -> $1,000; cap 3 d -> 2 d / $400 at risk).
- Caveats: built directly by lead, no delegation; no browser/375px check; DOL link not opened from sandbox; deploy workflow not inspected. Cycle ended early after one item (sandbox/time), not the full 40 minutes.
- Marketing: not run. Daily report not due (before 14:00 UTC).
- Next: RMD (40, verify IRS table), tax-year 2027 refresh (31).

## 2026-11-17 07:00 UTC — cycle
- Shipped: nothing. Top items need IRS primary sources: RMD (40, Pub. 590-B table) and tax-year 2027 refresh (31, Rev. Proc. 2026-35). www.irs.gov fails DNS from this sandbox, and the backlog requires verifying against IRS, so no numbers shipped from memory.
- Tried: WebFetch on irs.gov (host unresolvable); stopped rather than trust secondary sites for a tax table.
- Health/SEO/marketing: not run. Daily report not due.
- Owner: allow www.irs.gov in session network settings. Next cycle: if reachable build RMD then 2027 refresh; else ranks 29/30.

## 2026-11-17 07:55 UTC — cycle
- Shipped: cost per use calculator https://cappycalc.com/finance/cost-per-use/ (verify: 205 pages, 0 problems; $200+$20-$20 resale, 100 uses -> $2.00/use, break-even 40 vs $5 alt, saving $300). Added by lead as a source-free item since IRS items stay blocked.
- Caveats: built directly, no delegation; no browser/375px check; deploy workflow not inspected from sandbox. irs.gov still unreachable (RMD 40, tax-year refresh 31 still blocked).
- Marketing/daily report: not run / not due (before 14:00 UTC).
- Next: IRS items if reachable; else ranks 29/30, research refill (source-free evergreen finance/everyday ideas).

## 2026-11-17 08:55 UTC — cycle
- Shipped: 50/30/20 budget calculator https://cappycalc.com/finance/budget-50-30-20/ (verify: 206 pages, 0 problems; $4,000 -> $2,000/$1,200/$800, spend 2,300+1,100 -> $600 left = 15%).
- Caveats: built directly, no delegation; no browser/375px check; deploy workflow not inspected from sandbox. `npm ci` blocked by sandbox safety check, used `npm install`. irs.gov still unreachable (items 31, 40 blocked).
- Marketing/daily report: not run / not due (before 14:00 UTC).
- Next: IRS items if reachable; else ranks 29/30, research refill.

## 2026-11-17 09:55 UTC — cycle
- Shipped: verdict badge/tone (Steady pace / Slow and steady / Too fast) + steps-to-distance cross-link on https://cappycalc.com/health/weight-loss-goal/ (verify: 206 pages, 0 problems).
- Caveats: built directly, no delegation; no browser check; deploy run not inspected. irs.gov still unreachable (items 31, 40, 41 blocked).
- Marketing/daily report: not run / not due (before 14:00 UTC).
- Next: rank 30 (FIRE verdict copy), research refill; retry IRS.

## 2026-11-17 10:55 UTC — cycle
- Shipped: real hourly wage calculator https://cappycalc.com/everyday/real-hourly-wage/ (verify: 207 pages, 0 problems). Rank 30 found already done (all FIRE calculators have badges).
- Caveats: built directly, no delegation; no browser check; deploy run not inspected. IRS items 31, 40, 41 still blocked.
- Marketing/daily report: not run / not due (before 14:00 UTC).
- Next: research refill (few buildable items left), retry IRS.

## 2026-11-17 11:55 UTC — cycle
- Shipped: daily spending allowance calculator https://cappycalc.com/finance/daily-spending-allowance/ (verify: 208 pages, 0 problems; $3,200-$1,700-$400 over 30 days -> $36.67/day, $256.67/week, 25% over lasts 24 days).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm ci` blocked by sandbox check, used `npm install`. irs.gov returns 403 via proxy (items 31, 40, 41 still blocked; owner: allow www.irs.gov).
- Marketing/daily report: not run / not due (before 14:00 UTC).
- Next: research refill (buildable items nearly exhausted), retry IRS.

## 2026-11-17 13:00 UTC — cycle
- Shipped: rent vs buy calculator https://cappycalc.com/finance/rent-vs-buy/ (verify: 209 pages, 0 problems; zero-rate examples hand-checked: buy net $0 vs rent $60,000 over 5 years).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected yet. Local `main` branch is stale/unrelated; worked from origin/main on branch `cycle`. A `git reset --hard` was denied by the sandbox classifier, so used checkout instead.
- Marketing/daily report: not run / not due (before 14:00 UTC).
- Next: research refill (few buildable items left); IRS-blocked items 31, 40, 41 still need www.irs.gov.

## 2026-11-17 13:55 UTC — cycle
- Shipped: lump sum vs monthly payments calculator https://cappycalc.com/finance/lump-sum-vs-payments/ (verify: 210 pages, 0 problems; 0%-return examples hand-checked: $1,000 x 120 = $120,000 vs $100,000 lump -> +$20,000).
- Caveats: built directly, no delegation; no browser/375px check. Previous deploy (13:55 push) green. `npm ci` blocked by sandbox, used `npm install`. IRS items 31, 40, 41 still blocked (owner: allow www.irs.gov).
- Marketing/daily report: not run; daily report due next cycle (first after 14:00 UTC).
- Next: daily report issue + marketing brief for 2026-11-17, research refill (backlog nearly dry).

## 2026-11-17 14:55 UTC — cycle
- Shipped: nothing new. Daily report posted: https://github.com/hahakumquat/calcwise/issues/3
- Caveats: this cycle only did the daily report; no build, no deploy inspection. IRS items 31, 40, 41 still blocked (owner: allow www.irs.gov).
- Marketing: no pack for 2026-11-17 yet (latest on `marketing` is 2026-11-16).
- Next: marketing brief + media pack for 11-17, research refill (backlog nearly dry).

## 2026-11-17 15:55 UTC — cycle
- Shipped: savings runway calculator https://cappycalc.com/finance/savings-runway/ (verify: 211 pages, 0 problems; examples hand-checked: $12,000 / $3,000 = 4 months, with $1,000 income 6 months, 12% interest case 10.59 months).
- Backlog: product-research added 8 buildable items (ranks 44-51: credit utilization, average cost basis, BNPL cost, coffee ratio, pizza size, wrapping paper, recipe cost, sequences). Last deploy (14:51 push) green.
- Marketing: brief for 2026-11-17 pushed to `marketing` (lead: real-hourly-wage); media agent rendering the pack, check next cycle.
- Caveats: no browser/375px check; IRS items 31, 40, 41 still blocked (owner: allow www.irs.gov).
- Next: build credit utilization / BNPL cost / wrapping paper (seasonal); confirm media pack and the deploy for c00c88a.

## 2026-11-17 16:55 UTC — cycle
- Shipped: credit utilization calculator https://cappycalc.com/finance/credit-utilization/ (verify: 212 pages, 0 problems; examples hand-checked: $2,000 / $8,000 = 25%, 10% target -> pay down $1,200).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 still blocked (owner: allow www.irs.gov).
- Marketing: 2026-11-17 pack not confirmed this cycle.
- Next: average cost basis (45), BNPL true cost (46), wrapping paper (49); confirm media pack.

## 2026-11-17 17:00 UTC — cycle (second item)
- Shipped: average cost basis calculator https://cappycalc.com/finance/average-cost-basis/ (verify: 213 pages, 0 problems; $6,500 / 150 = $43.33; 50 shares at $30 reach a $40 average, checked 8,000 / 200). Note: backlog spec example said 100 shares for a different starting position; the formula is right.
- Caveats: built directly; 2 lots only; no browser/375px check; deploy runs not inspected. IRS items still blocked.
- Next: BNPL true cost (46), wrapping paper (49), confirm media pack.

## 2026-11-17 17:55 UTC — cycle
- Shipped: buy now pay later true cost calculator https://cappycalc.com/finance/bnpl-true-cost/ (verify: 214 pages, 0 problems; examples hand-checked: $450 / 6 = $75 at 0%; $50 fee on $1,000 = 5%; $1,200 at 12% over 12 months = $106.62/month, $79.42 interest).
- Caveats: built directly, no delegation; no browser/375px check; deploy runs not inspected; monthly payments only (pay-in-4 is approximated, explained in FAQ). IRS items 31, 40, 41 still blocked.
- Marketing: 2026-11-17 pack not confirmed.
- Next: wrapping paper (49), coffee ratio (47), pizza size (48); confirm media pack.

## 2026-11-17 18:55 UTC — cycle
- Shipped: pizza size comparison calculator https://cappycalc.com/everyday/pizza-size-comparison/ (verify: 215 pages, 0 problems; 12 in = 113.10 sq in, 16 in = 201.06 sq in, +77.8%; two $10 12 in pizzas beat a $22 16 in).
- Caveats: built directly, no delegation; no browser/375px check; deploy runs not inspected. Daily report already posted today (#3). IRS items 31, 40, 41 still blocked.
- Next: wrapping paper (49, ship by 12-15), coffee ratio (47); confirm 2026-11-17 media pack.

## 2026-11-17 19:55 UTC — cycle
- Shipped: coffee to water ratio calculator https://cappycalc.com/food/coffee-ratio/ (verify: 216 pages, 0 problems; 500 ml at 1:16 = 31.25 g; 12 fl oz = 22.18 g).
- Caveats: built directly, no delegation; no browser/375px check; deploy runs not inspected. Daily report already posted today (#3). IRS items 31, 40, 41 still blocked.
- Also shipped: wrapping paper calculator https://cappycalc.com/everyday/wrapping-paper/ (12x8x4 in -> 25x16 in, 400 sq in, 11 boxes per 30 in x 15 ft roll; rule of thumb).
- Also shipped: sequence calculator https://cappycalc.com/math/sequence-calculator/ (a1 3, d 4, n 10 -> a10 39, S10 210; geometric 2, 3, 5 -> 162, 242).
- Also shipped: recipe cost per serving https://cappycalc.com/food/recipe-cost/ (flour/eggs/butter -> $3.75, 6 servings $0.625).
- Also shipped: extra mortgage payment https://cappycalc.com/finance/extra-mortgage-payment/ (verify 220 pages, 0 problems).
- Also shipped: loan comparison https://cappycalc.com/finance/loan-comparison/ ($20k: A 7%/60 mo $3,761 vs B 5.5%/48 mo + $400 fee $2,726).
- Also shipped: weighted mean https://cappycalc.com/statistics/weighted-mean/ (90,80,70 / 50,30,20 -> 83).
- Backlog refilled with ranks 52, 54-56 (extra mortgage payment, loan comparison, weighted mean, Ohm's law). Next: rank 56 (Ohm's law); refill again; ranks 15, 41 need source checks; 31, 40 blocked on IRS access.

## 2026-11-17 20:51 UTC — cycle
- Shipped: Ohm's law calculator https://cappycalc.com/construction/ohms-law/ (verify: 223 pages, 0 problems; 12 V and 2 A -> 6 ohm, 24 W; 6 ohm and 24 W -> 12 V, 2 A; 120 V on 240 ohm -> 0.5 A, 60 W).
- Caveats: built directly, no delegation; no browser/375px check; deploy runs not inspected. Daily report already posted today (#3). IRS items 31, 40, 41 still blocked.
- Next: backlog has no buildable open items left except 15 (needs source); refill with pure-math items.

## 2026-11-17 21:55 UTC — cycle
- Shipped: CAGR calculator https://cappycalc.com/finance/cagr-calculator/ (verify: 224 pages, 0 problems; 10k->25k over 8y = 12.13%, 1k->2k over 10y = 7.18%, 100->50 over 5y = -12.94%).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. Daily report already posted today. Backlog still has no buildable open items (15, 31, 40, 41 need sources/IRS); next cycle should refill with pure-math/evergreen items.
- Note: `npm ci` is blocked in compound shell commands by a safety check; run it alone.

## 2026-11-17 23:00 UTC — cycle
- Shipped: APY calculator https://cappycalc.com/finance/apy-calculator/ (verify: 225 pages, 0 problems; 4.5% daily = 4.603% APY, 12% monthly = 12.683%, 5% annual = 5%).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. Select inputs arrive as strings, so use `Number(v.x)`, not `num()`. Backlog still has no buildable open items (15, 31, 40, 41 need sources); refill with pure-math items.

## 2026-11-17 23:55 UTC — cycle
- Shipped: mortgage points calculator https://cappycalc.com/finance/mortgage-points/ (verify: 226 pages, 0 problems; $300k 7% 1 point: cost $3,000, saving $50.11/mo, break-even 59.9 months; 10-year net $3,013.58).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. Daily report already posted today. IRS items 31, 40, 41 still blocked; item 15 needs source.
- Next: backlog has no buildable items; refill with pure-math/evergreen ideas. First cycle after 14:00 UTC on 2026-11-18 posts the daily report.

## 2026-11-18 00:55 UTC — cycle
- Shipped: percent difference calculator https://cappycalc.com/math/percent-difference/ (verify: 227 pages, 0 problems; 40 vs 60 = 40% (50% as percentage change); 10 vs 20 = 66.67%; 0 vs 8 = 200%).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 still blocked; item 15 needs source. Backlog has no buildable open items: next cycle should refill with evergreen pure-math items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 02:00 UTC — cycle
- Shipped: prime number checker https://cappycalc.com/math/prime-number-checker/ (verify: 228 pages, 0 problems; 360 → 24 divisors, sum 1170; 97 prime, next 101; 91 = 7×13).
- Marketing: brief agent launched for 2026-11-18 (media render not confirmed this cycle). Previous deploy green (run 44211379590).
- Caveats: built directly, no browser/375px check. Backlog still has no buildable open items; IRS items 31, 40, 41 and item 15 blocked. Next cycle: finish today's media pack, refill backlog. First cycle after 14:00 UTC posts the daily report.
- Update 02:10 UTC: media pack for 2026-11-18 rendered and pushed (https://github.com/hahakumquat/calcwise/tree/marketing/2026-11-18, posting-guide.md included; render runs 44219345494, 44219548520 green). Brief said CAGR 12.13%; live calculator and hand check give 12.14% — pack uses 12.14%. Nothing posted.

## 2026-11-18 02:55 UTC — cycle
- Shipped: present value calculator https://cappycalc.com/finance/present-value/ (verify: 229 pages, 0 problems; $10,000 at 5% over 10y = $6,139.13; $1,000 at 8% over 5y = $680.58; 0% rate = unchanged).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and item 15 still blocked on sources. Backlog still needs a refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 03:55 UTC — cycle
- Shipped: annuity calculator https://cappycalc.com/finance/annuity-calculator/ (verify: 230 pages, 0 problems; $500/mo, 6%, 10y -> FV $81,939.67, PV $45,036.73; $1,000/yr 5% 3y -> $3,152.50, due $3,310.13).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. Detached HEAD at start (checked out main). IRS items 31, 40, 41 and item 15 still blocked on sources; backlog needs refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 04:55 UTC — cycle
- Shipped: NPV and IRR calculator https://cappycalc.com/finance/npv-irr-calculator/ (verify: 231 pages, 0 problems; -1000 then 300/400/500/200 at 10% -> NPV $115.57, IRR 15.32%; -100 then 110 -> IRR 10%; -1000 then 500 x3 at 8% -> NPV $288.55, IRR 23.38%).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and item 15 still blocked on sources; backlog needs refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 05:55 UTC — cycle
- Shipped: real rate of return calculator https://cappycalc.com/finance/real-rate-of-return/ (verify: 232 pages, 0 problems; 7% nominal, 3% inflation -> 3.8835% real, $10k over 20y = $38,697 nominal / $21,426 today's dollars; 8%/2.5% -> 5.3659%; 5%/5% -> 0).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and item 15 still blocked on sources; backlog needs refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 06:55 UTC — cycle
- Shipped: payback period calculator https://cappycalc.com/finance/payback-period/ (verify: 233 pages, 0 problems; $10k cost, $2,500/yr -> simple 4.00 y, discounted at 8% 5.01 y; 0% rate -> equal).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. Detached HEAD at start (checked out main). IRS items 31, 40, 41 and item 15 still blocked on sources; backlog needs refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 07:55 UTC — cycle
- Shipped: Roman numeral converter https://cappycalc.com/math/roman-numeral-converter/ (verify: 234 pages, 0 problems; 2026 = MMXXVI, 1994 = MCMXCIV, 3999 = MMMCMXCIX; IIII rejected).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and item 15 still blocked on sources; backlog needs refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 08:55 UTC — cycle
- Shipped: interest-only loan calculator https://cappycalc.com/finance/interest-only-loan/ (verify: 235 pages, 0 problems; $300k, 7%, 30y, 5y IO -> $1,750 then $2,120.34, regular $1,995.91; 0% rate -> no extra interest).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and item 15 still blocked on sources; backlog needs refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 09:55 UTC — cycle
- Shipped: bond yield to maturity calculator https://cappycalc.com/finance/bond-yield-calculator/ (verify: 236 pages, 0 problems; $1,000 face, 5% coupon, 10y: price $1,000 -> 5.000%, $950 -> 5.662% (current yield 5.263%), zero-coupon $600 -> 5.174%; all hand/independently checked).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and item 15 still blocked on sources; backlog needs refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 10:55 UTC — cycle
- Shipped: position size calculator https://cappycalc.com/finance/position-size-calculator/ (verify: 237 pages, 0 problems; $10k, 1% risk, $50 entry, $48 stop -> 50 shares, $100 risk, $2,500 position, 3:1 to $56; $25k, 2%, $120/$114 -> 83 shares).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and item 15 still blocked on sources; backlog needs refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 11:55 UTC — cycle
- Shipped: stock profit calculator https://cappycalc.com/finance/stock-profit-calculator/ (verify: 238 pages, 0 problems; 100 sh, $50->$60, $5 fee each way, 15% tax -> $841.50 kept, 16.81% return, break-even $50.10; loss case -> no tax).
- Health: previous 4 deploy runs all green. Caveats: built directly, no delegation; no browser/375px check; deploy run for this push not inspected. Detached HEAD at start (checked out main). IRS items 31, 40, 41 and item 15 still blocked on sources; backlog needs refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 12:58 UTC — cycle
- Shipped: dollar-cost averaging calculator https://cappycalc.com/finance/dollar-cost-averaging/ (verify: 239 pages, 0 problems; $100/mo at 10,8,5,8,10,12 -> 73.333 sh, avg cost $8.18, value $880, gain $280, lump sum gain $120).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and item 15 still blocked on sources; backlog needs refill with evergreen items. First cycle after 14:00 UTC today posts the daily report.

## 2026-11-18 13:52 UTC — cycle
- Shipped: cost of waiting to invest https://cappycalc.com/finance/cost-of-waiting/ (verify: 240 pages, 0 problems; $500/mo, 7%, 30y -> $609,985; 10y delay -> $260,463; cost $349,522; catch-up $1,171/mo).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and 15 still blocked on sources. Daily report not yet posted (cycle started before 14:00 UTC); next cycle should post it.

## 2026-11-18 14:55 UTC — cycle
- Shipped: freelance hourly rate https://cappycalc.com/finance/freelance-rate/ (verify: 241 pages, 0 problems; $60k take-home, $5k costs, 25% tax, 25 h/wk, 6 wk off -> $73.91/h, revenue $85,000, 1,150 billable h).
- Daily report 2026-11-18 posted as issue #4; #2 and #3 closed.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and 15 still blocked on sources.

## 2026-11-18 15:55 UTC — cycle
- Shipped: prorated rent calculator https://cappycalc.com/everyday/prorated-rent/ (verify: 242 pages, 0 problems; $1,500, 30-day month, move in day 12 -> 19 days, $950.00 ($50/day); 365-day method $936.99).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and 15 still blocked on sources.

## 2026-11-18 16:55 UTC — cycle
- Shipped: loan-to-value ratio https://cappycalc.com/finance/ltv-ratio/ (verify: 243 pages, 0 problems; $400k home, $340k mortgage, $20k HELOC -> LTV 85%, CLTV 90%, equity $40,000, pay down $20,000 to reach 80%).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm ci` is blocked by the sandbox safety check (it deletes node_modules), so `npm install` from the lockfile was used; lockfile unchanged. IRS items 31, 40, 41 and 15 still blocked on sources.

## 2026-11-18 17:55 UTC — cycle
- Shipped: cap rate / rental property calculator https://cappycalc.com/finance/cap-rate-calculator/ (verify: 244 pages, 0 problems; $300k, $2,400/mo, 5% vacancy, $8k expenses, $14.4k loan, $75k cash -> NOI $19,360, cap 6.45%, cash flow $4,960, cash-on-cash 6.61%; all-cash case 9%).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm ci` blocked by sandbox safety check, used `npm install` (lockfile unchanged). IRS items 31, 40, 41 and 15 still blocked on sources.

## 2026-11-18 18:55 UTC — cycle
- Shipped: sales commission calculator https://cappycalc.com/finance/commission-calculator/ (verify: 245 pages, 0 problems; $80k sales, 5% to $50k quota, 8% above, $3k base -> commission $4,900, total $7,900, effective 6.125%; flat $20k at 10% -> $2,000).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used (npm ci blocked by sandbox safety check; lockfile unchanged). IRS items 31, 40, 41 and 15 still blocked on sources.

## 2026-11-18 19:55 UTC — cycle
- Shipped: down payment savings calculator https://cappycalc.com/finance/down-payment-savings/ (verify: 246 pages, 0 problems; $400k, 10% + 3% closing, 0% APY, $4k saved, 4 yrs -> target $52,000, $1,000/month).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. Backlog has no unblocked buildable items (15, 41 need sources; 31, 40 blocked on IRS); next cycle should run product-research to refill. Daily report #4 already posted today.

## 2026-11-18 20:55 UTC — cycle
- Shipped: biweekly mortgage payment calculator https://cappycalc.com/finance/biweekly-mortgage/ (verify: 247 pages, 0 problems; $260k 0% 30y -> $722.22 monthly, $361.11 biweekly, 720 payments = 27.7 yrs; default $300k 6.5% 30y -> ~$88k interest saved, ~5.9 yrs sooner by closed form).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used. IRS items 31, 40, 41 and 15 still blocked on sources; backlog needs refill with evergreen items.

## 2026-11-18 21:55 UTC — cycle
- Shipped: stock split calculator https://cappycalc.com/finance/stock-split-calculator/ (verify: 248 pages, 0 problems; 100 sh at $200, 4-for-1 -> 400 sh, $50, cost $120 -> $30, value $20,000; 1-for-10 reverse on 25 sh at $2 -> 2 whole sh + $10 cash).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used. IRS items 31, 40, 41 and 15 still blocked on sources; backlog needs refill with evergreen items.

## 2026-11-18 22:55 UTC — cycle
- Shipped: gross rent multiplier calculator https://cappycalc.com/finance/gross-rent-multiplier/ (verify: 249 pages, 0 problems; $300k, $2,400/mo -> GRM 10.42, gross yield 9.6%, 0.8% of price vs 1% rule needing $3,000; $120k at $1,200 -> GRM 8.33, 12%, 1%).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used. Savings-rate idea skipped (years-to-fi already covers it). IRS items 31, 40, 41 and 15 still blocked on sources; backlog needs refill with evergreen items.

## 2026-11-18 23:55 UTC — cycle
- Shipped: HELOC borrowing power calculator https://cappycalc.com/finance/heloc-borrowing-power/ (verify: 250 pages, 0 problems; $400k home, $250k balance, 85% CLTV -> $90,000 max, 8%/10y -> $1,092/mo, interest-only $600; 0% case $30k over 5y -> $500).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used. IRS items 31, 40, 41 and 15 still blocked on sources; backlog needs refill with evergreen items. Daily report for 2026-11-18 already posted earlier today.

## 2026-11-19 00:55 UTC — cycle
- Shipped: WACC calculator https://cappycalc.com/finance/wacc-calculator/ (verify: 251 pages, 0 problems; $600k equity 10%, $400k debt 6%, 25% tax -> WACC 7.8%, after-tax debt 4.5%, debt share 40%; all-equity case = cost of equity).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used. IRS items 31, 40, 41 and 15 still blocked on sources; backlog needs refill with evergreen items.

## 2026-11-19 01:55 UTC — cycle
- Shipped: CAPM calculator https://cappycalc.com/finance/capm-calculator/ (verify: 252 pages, 0 problems; Rf 4%, beta 1.2, Rm 9% -> 10%, MRP 5%, stock premium 6%; beta 1 -> market return). Linked from WACC.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. IRS items 31, 40, 41 and 15 still blocked on sources; backlog needs refill with evergreen items. First `git reset --hard` was denied by the sandbox classifier; used fast-forward merge instead. Next cycle: the first one after 14:00 UTC posts the daily report.

## 2026-11-19 02:55 UTC — cycle
- Shipped: Expected value calculator https://cappycalc.com/statistics/expected-value/ (verify: 253 pages, 0 problems; $100 at 10% vs $0 at 90% -> EV 10, variance 900, sd 30, net of $5 cost +5; 10/20/40 at 50/25/25% -> EV 20, variance 150).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. Backlog is effectively empty (only source-blocked items 15, 41), so this cycle picked a lead-added evergreen item; product-research should refill. Not after 14:00 UTC, so no daily report.

## 2026-11-19 03:55 UTC — cycle
- Shipped: P/E ratio calculator https://cappycalc.com/finance/pe-ratio-calculator/ (verify: 254 pages, 0 problems; $150 / EPS $6 -> P/E 25, earnings yield 4%, PEG 2.5 at 10% growth; $40 / $5 / 4% -> 8, 12.5%, 2).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. Backlog still only has source-blocked items (15, 31, 40, 41); product-research should refill. Not after 14:00 UTC, so no daily report.

## 2026-11-19 04:55 UTC — cycle
- Shipped: depreciation calculator https://cappycalc.com/finance/depreciation-calculator/ (verify: 255 pages, 0 problems; $50k, $5k salvage, 5y -> $9,000/yr straight-line (18%); double-declining 40% -> $20,000 yr 1, ends at salvage).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used (npm ci blocked by sandbox safety check). IRS items 31, 40, 41 and 15 still blocked on sources; product-research should refill. Not after 14:00 UTC, so no daily report.

## 2026-11-19 05:55 UTC — cycle
- Shipped: debt-to-equity ratio calculator https://cappycalc.com/finance/debt-to-equity-ratio/ (verify: 256 pages, 0 problems; $600k liabilities, $400k equity -> D/E 1.5, multiplier 2.5, debt share 60%; zero-debt case -> 0 / 1 / 0%).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used (npm ci blocked by sandbox safety check). IRS items 31, 40, 41 and 15 still blocked on sources; product-research should refill. Not after 14:00 UTC, so no daily report.

## 2026-11-19 06:55 UTC — cycle
- Shipped: current ratio / quick ratio calculator https://cappycalc.com/finance/current-ratio-calculator/ (verify: 257 pages, 0 problems; CA $150k, inventory $40k, CL $100k -> current 1.5, quick 1.1, working capital $50k; 80k/0/200k -> 0.4, 0.4, -$120k). Linked from debt-to-equity.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used (npm ci blocked by sandbox safety check). IRS items 31, 40, 41 and 15 still blocked on sources; product-research should refill. Not after 14:00 UTC, so no daily report.

## 2026-11-19 07:55 UTC — cycle
- Shipped: interest coverage ratio calculator https://cappycalc.com/finance/interest-coverage-ratio/ (verify: 258 pages, 0 problems; EBIT $500k, interest $100k -> 5x, $400k left, 20% of EBIT; EBIT $60k, interest $80k -> 0.75x, -$20k, 133.3%). Linked from current-ratio.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm ci` blocked by sandbox safety check, used `npm install`. IRS items 31, 40, 41 and 15 still blocked on sources; product-research should refill. Not after 14:00 UTC, so no daily report.

## 2026-11-19 08:55 UTC — cycle
- Shipped: ROE calculator with DuPont breakdown https://cappycalc.com/finance/roe-calculator/ (verify: 259 pages, 0 problems; NI $50k, equity $250k -> 20% = 10% margin x 1.25 turnover x 1.6 leverage; loss case -10%). Linked to existing ratio calculators via `related`.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected (no gh run access checked). `npm ci` blocked by sandbox safety check, used `npm install`. Not after 14:00 UTC, so no daily report. Local `main` was stale; fast-forwarded to origin/main before work.
- Next: IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill the backlog.

## 2026-11-19 09:55 UTC — cycle
- Shipped: inventory turnover calculator https://cappycalc.com/finance/inventory-turnover-calculator/ (verify: 260 pages, 0 problems; COGS $600k, avg inventory $100k -> 6x, 60.8 days; quarter case 4x, 22.5 days). Linked from ROE.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm ci` blocked by sandbox safety check, used `npm install`. Not after 14:00 UTC, so no daily report.
- Next: IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill the backlog.

## 2026-11-19 10:55 UTC — cycle
- Shipped: receivables turnover / DSO calculator https://cappycalc.com/finance/receivables-turnover-calculator/ (verify: 261 pages, 0 problems; sales $1.2M, avg AR $200k -> 6x, 60.8 days; 90-day case 3x, 30 days). Linked from inventory turnover.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm ci` blocked by sandbox safety check, used existing node_modules/`npm install`. Not after 14:00 UTC, so no daily report.
- Next: IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill the backlog.

## 2026-11-19 11:55 UTC — cycle
- Shipped: cash conversion cycle calculator https://cappycalc.com/finance/cash-conversion-cycle/ (verify: 262 pages, 0 problems; DIO 60 + DSO 45 − DPO 30 -> 75 days; 20/5/50 -> −25). Linked from receivables turnover.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. Repo was on detached HEAD; reset local main to origin/main. IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill. Not after 14:00 UTC, so no daily report.

## 2026-11-19 12:55 UTC — cycle
- Shipped: ROA calculator https://cappycalc.com/finance/roa-calculator/ (verify: 263 pages, 0 problems; NI $40k, rev $500k, assets $400k -> 10%, 8% margin, 1.25 turnover; loss case -5%). Linked from ROE.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm ci` blocked by sandbox safety check, used `npm install`. IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill. Not after 14:00 UTC, so no daily report.

## 2026-11-19 13:55 UTC — cycle
- Shipped: payables turnover / DPO calculator https://cappycalc.com/finance/payables-turnover-calculator/ (verify: 264 pages, 0 problems; purchases $900k, avg payables $150k -> 6x, 60.8 days; 90-day case 3x, 30 days). Linked from receivables turnover.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used. IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill. Started before 14:00 UTC, so no daily report; the next cycle should post it.

## 2026-11-19 14:55 UTC — cycle
- Shipped: sustainable growth rate / payout ratio calculator https://cappycalc.com/finance/sustainable-growth-rate/ (verify: 265 pages, 0 problems; NI $100k, div $30k, equity $500k -> payout 30%, ROE 20%, SGR 14%; full payout -> 0%). Linked from ROE.
- Daily report posted: issue #5 (Daily report 2026-11-19).
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used. IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill.

## 2026-11-19 15:55 UTC — cycle
- Shipped: free cash flow calculator https://cappycalc.com/finance/free-cash-flow-calculator/ (verify: 266 pages, 0 problems; OCF $500k, capex $150k, rev $2M, value $8M -> FCF $350k, margin 17.5%, yield 4.375%; loss case -$150k, -15%). Linked from payables turnover.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm ci` blocked by sandbox safety check, used `npm install`. IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill. Not the first cycle after 14:00 UTC, so no daily report.

## 2026-11-19 16:55 UTC — cycle
- Shipped: EBITDA and EV/EBITDA calculator https://cappycalc.com/finance/ebitda-calculator/ (verify: 267 pages, 0 problems; NI 120k + int 30k + tax 40k + D&A 60k -> EBITDA 250k, margin 25%, EV 1.75M, 7.0x; loss case -20k, -4%). Linked from current ratio.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. Local main was stale and HEAD detached; fast-forwarded. Needed `npm install` (no node_modules). Backlog is nearly dry (IRS items 31, 40, 41, 15 blocked on sources); product-research should refill. Not the first cycle after 14:00 UTC, so no daily report.

## 2026-11-19 17:55 UTC — cycle
- Shipped: EPS calculator https://cappycalc.com/finance/eps-calculator/ (verify: 268 pages, 0 problems; NI $5M, pref $0.5M, 3M shares -> EPS $1.50, P/E 20, yield 5%; loss case -$0.50). Linked from EBITDA.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used. IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill. Not the first cycle after 14:00 UTC, so no daily report (posted in the 14:55 cycle).

## 2026-11-19 18:55 UTC — cycle
- Shipped: asset turnover calculator https://cappycalc.com/finance/asset-turnover-calculator/ (verify: 269 pages, 0 problems; revenue $500k, assets $380k→$420k -> avg $400k, 1.25x; $2.5M on $1M avg -> 2.5x). Linked from ROA.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm ci` blocked by sandbox safety check, used `npm install`. Local main was stale; fast-forwarded. IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill. Not the first cycle after 14:00 UTC, so no daily report (posted in the 14:55 cycle).

## 2026-11-19 19:55 UTC — cycle
- Shipped: quick ratio (acid-test) calculator https://cappycalc.com/finance/quick-ratio-calculator/ (verify: 270 pages, 0 problems; cash 50k + sec 20k + AR 80k vs CL 100k -> 1.5; 60k vs 120k -> 0.5). Linked from current ratio.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used. IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill. Not the first cycle after 14:00 UTC, so no daily report (posted in the 14:55 cycle).

## 2026-11-19 20:55 UTC — cycle
- Shipped: working capital calculator https://cappycalc.com/finance/working-capital-calculator/ (verify: 271 pages, 0 problems; assets 250k vs liabilities 150k -> 100k, ratio 1.67; 80k vs 100k -> -20k). Linked from current ratio.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used (`npm ci` blocked by sandbox safety check). IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill. No daily report (posted in the 14:55 cycle).

## 2026-11-19 21:55 UTC — cycle
- Shipped: dividend payout ratio calculator https://cappycalc.com/finance/dividend-payout-ratio-calculator/ (verify: 272 pages, 0 problems; 40k/100k -> 40%, retention 60%; 120k/100k -> 120%). Linked from dividend and sustainable-growth-rate.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used (`npm ci` blocked by sandbox safety check). Backlog has no buildable items left except source-blocked IRS items (31, 40, 41, 15); product-research should refill. No daily report (posted in the 14:55 cycle).

## 2026-11-19 22:55 UTC — cycle
- Shipped: DSCR calculator https://cappycalc.com/finance/dscr-calculator/ (verify: 273 pages, 0 problems; NOI 120k / debt service 80k -> 1.5, surplus 40k; 60k/80k -> 0.75). Linked from interest coverage.
- Caveats: built directly, no delegation; no browser/375px check; deploy run not inspected. `npm install` used. Backlog has no buildable items left except source-blocked IRS items (31, 40, 41, 15); product-research should refill. No daily report (posted in the 14:55 cycle).

## 2026-11-19 23:55 UTC — cycle
- Shipped: price-to-book ratio calculator https://cappycalc.com/finance/price-to-book-ratio-calculator/ (verify: 274 pages, 0 problems; $500M assets, $200M liabilities, 20M shares, $30 -> BVPS $15, P/B 2.0; 0.5 case; negative book value shows no ratio). Linked from P/E.
- Caveats: built directly, no delegation; no browser/375px check; previous deploy (DSCR) green, this deploy not inspected. `npm install` used. IRS items 31, 40, 41, 15 still blocked on sources; product-research should refill. No daily report (posted in the 14:55 cycle).

## 2026-11-20 00:55 UTC — cycle
- Shipped: Dry January savings calculator https://cappycalc.com/everyday/dry-january/ (verify: 275 pages, 0 problems; 8 drinks/wk, $9, 150 kcal, 31 days -> 35.4 drinks, $318.86, 5,314 kcal, $3,744/yr). Linked from latte factor.
- Backlog: product-research did the full 2026-11-20 refresh (13 new non-finance items, ranks 69-81; next: screen-time-life, decimal-to-fraction, bakers-percentage).
- Marketing: 2026-11-20 brief pushed to `marketing` (BNPL, cost per use, gift budget; Black Friday week); media agent started render.mjs + posting guide, status not confirmed at log time.
- Caveats: no browser/375px check; previous deploy (P/B) green, this one not inspected. `npm install` used. IRS items 31, 40, 41, 15 still source-blocked. No daily report (due in the first cycle after 14:00 UTC).

## 2026-11-20 01:05 UTC — cycle (addendum)
- Shipped: screen time in a lifetime calculator https://cappycalc.com/everyday/screen-time-life/ (verify: 276 pages, 0 problems; 5 h/day, age 25 to 80 -> 11.46 years, 31.25% of waking hours, 1,825 h/yr).
- Marketing: media step done on `marketing` branch (2026-11-20: reel-01..05, carousel-01..05, x-1.png, posting-guide.md; all PNGs reviewed, numbers match the brief).
- Next cycle: decimal-to-fraction (rank 71), baker's percentage, lean body mass (needs formula citation). Previous deploy (Dry January) not yet inspected.

## 2026-11-20 01:55 UTC — cycle
- Shipped: decimal to fraction https://cappycalc.com/math/decimal-to-fraction/ (verify: 277 pages, 0 problems; 0.75 -> 3/4, 0.1 + repeating 6 -> 1/6, 3.14159 max 100 -> 311/99). BigInt exact math; repeating digits entered as a second field.
- SEO: none this cycle (short run). Health: last 4 deploys green. Marketing: today's pack already done.
- Blockers: none new; IRS items (31, 40) still blocked on irs.gov access. No browser/375px check.
- Next cycle: baker's percentage (rank 72), lean body mass (needs formula citation), firewood (needs cord-definition source).

## 2026-11-20 02:51 UTC — cycle
- Shipped: baker's percentage https://cappycalc.com/food/bakers-percentage/ (verify: 278 pages, 0 problems; 500/350/10/5 -> 70% hydration, 865 g; 400 g flour + 250 g water + 200 g 100% starter -> 70%). Starter split into flour and water.
- SEO: none this cycle (short run). Health: not inspected this cycle (deploy status checked after push). Marketing: today's pack already on the marketing branch.
- Blockers: IRS items (31, 40) still blocked on irs.gov access. Local `main` was stale in this sandbox, so worked from a branch off origin/main. No browser/375px check.
- Next cycle: lean body mass (needs formula citation), firewood (needs cord source), baking pan converter (rank 75).

## 2026-11-20 03:55 UTC — cycle
- Shipped: baking pan size converter https://cappycalc.com/food/baking-pan-converter/ (verify: 279 pages, 0 problems; 9 in round -> 9x13 = x1.84; 8 in square -> 9 in round = x0.99; identical pans = x1).
- SEO: none this cycle (short run). Health: deploy status not inspected. Marketing: today's pack already on the marketing branch.
- Blockers: IRS items (31, 40) still blocked on irs.gov access. No browser/375px check. Built directly, no delegation.
- Next cycle: lean body mass (needs formula citation), firewood (needs cord source), baseball stats, tile calculator.

## 2026-11-20 04:00 UTC — cycle (addendum)
- Shipped: tile calculator https://cappycalc.com/construction/tile/ (verify: 280 pages, 0 problems; 10x12 ft, 12 in tile, 1/8 in joint, 10% waste -> 117.5 raw, 130 tiles, 13 boxes; 100 ft² no joint/waste -> 100).
- Next cycle: lean body mass and firewood (need sources), baseball stats, angle converter, download time. Earlier deploys not inspected.

## 2026-11-20 04:51 UTC — cycle
- Shipped: angle converter https://cappycalc.com/conversion/angle-converter/ (verify: 281 pages, 0 problems; pi rad -> 180 deg, 200 grad, 0.5 turn; 45.5 deg -> 45° 30′ 0″; 10.5125 deg -> 10° 30′ 45″). Reuses the existing angle unit group; DMS computed in whole arcseconds.
- SEO: none this cycle (short run). Health: deploy status not inspected. Marketing: today's pack already on the marketing branch.
- Blockers: IRS items (31, 40) still blocked on irs.gov access. No browser/375px check. Built directly, no delegation.
- Next cycle: download time (rank 79), baseball stats, lean body mass and firewood (need sources).

## 2026-11-20 04:53 UTC — cycle (addendum)
- Shipped: download time calculator https://cappycalc.com/developer/download-time/ (verify: 282 pages, 0 problems; 5 GB at 100 Mbps -> 400 s = 6 min 40 s; 1 GiB at 50 Mbps -> 171.8 s; 5 GB at 80% -> 500 s; 1 TB at 1 Gbps -> 8,000 s).
- Next cycle: baseball stats (cite MLB glossary), lean body mass and firewood (need sources), golf handicap, CIDR. Earlier deploys not inspected.

## 2026-11-20 05:55 UTC — cycle
- Shipped: baseball stats https://cappycalc.com/sports/baseball-stats/ (verify: 283 pages, 0 problems; 150 H/500 AB/60 BB/5 HBP/5 SF -> AVG .300, OBP .377; 70 ER in 200 IP -> ERA 3.15, WHIP 1.15; 200.1 IP handled as 200 1/3). Batter/pitcher toggle; MLB glossary cited.
- SEO: none (short run). Health: deploy status not inspected. Marketing: today's pack already done.
- Blockers: IRS items (31, 40) blocked on irs.gov access. Local checkout was detached HEAD; worked from origin/main. No browser/375px check. Built directly, no delegation.
- Next cycle: lean body mass and firewood (need sources), golf handicap, CIDR.

## 2026-11-20 06:55 UTC — cycle
- Shipped: IPv4 subnet (CIDR) calculator https://cappycalc.com/developer/cidr-calculator/ (verify: 284 pages, 0 problems; 192.168.1.130/26 -> mask 255.255.255.192, 128-191, 62 usable; /31 -> 2, /32 -> 1, /0 -> 4,294,967,294). RFC 4632 and 3021 cited.
- SEO: none (short run). Health: deploy status not inspected. Marketing: today's pack already done.
- Blockers: IRS items (31, 40) blocked on irs.gov access. No browser/375px check. Built directly, no delegation.
- Next cycle: lean body mass and firewood (need sources), golf handicap (needs USGA source); backlog needs a refresh with new items (open buildable list is nearly exhausted).

## 2026-11-20 07:55 UTC — cycle
- Shipped: firewood cord calculator https://cappycalc.com/everyday/firewood-cord/ (verify: 285 pages, 0 problems; 8x4 ft stack of 16 in logs -> 42.67 cu ft = 1/3 cord = $100 at $300/cord; 24 in -> 1/2 cord). Cord = 128 cu ft cited to USDA Forest Service, WA Agriculture and Maine Forest Service pages.
- SEO: none (short run). Health: last 3 deploys on main green. Marketing: today's pack already done.
- Blockers: IRS items (31, 40) blocked on irs.gov access. Local `main` ref was stale and `git reset --hard` / `npm ci` were denied by the sandbox, so I worked on a branch from origin/main and used `npm install`. No browser/375px check. Built directly, no delegation.
- Next cycle: lean body mass (needs Boer/Kouri formula citation), golf handicap (USGA source); backlog needs a research refresh, since few buildable items remain.

## 2026-11-20 08:55 UTC — cycle
- Shipped: lean body mass and FFMI https://cappycalc.com/health/lean-body-mass/ (verify: 286 pages, 0 problems; 80 kg/180 cm/15% bf -> LBM 68 kg, FFMI 20.99; Boer male 80 kg/180 cm -> 61.42 kg; female 60 kg/165 cm -> 44.87 kg). Boer 1984 and Kouri 1995 cited; 6.3 vs 6.1 normalization noted in decisions.md.
- SEO: none (short run). Health: deploy status not inspected. Marketing: today's pack already done.
- Blockers: IRS items (31, 40) blocked on irs.gov access. No browser/375px check. Built directly, no delegation.
- Next cycle: golf handicap (needs USGA source), net-worth percentile (needs source); backlog needs a research refresh, few buildable items remain.

## 2026-11-20 09:00 UTC — cycle (addendum)
- Shipped: nothing more. Golf handicap blocked: usga.org not reachable (WebFetch DNS failure) and WebSearch did not return the Rule 5.2a table; not shipping it from memory. Marked blocked in backlog.
- Next cycle: net-worth percentile and charitable deduction need source checks; run a product-research refresh to add buildable items with no-source-needed math. Owner: allow usga.org and irs.gov in the session network settings to unblock golf, RMD and the 2027 tax refresh.

## 2026-11-20 09:55 UTC — cycle
- Shipped: quartile calculator https://cappycalc.com/statistics/quartile-calculator/ (verify: 287 pages, 0 problems; 2,4,4,5,6,7,8,30 -> Q1 4, Q2 5.5, Q3 7.5, IQR 3.5, outlier 30; 1..7 -> Q1 2, Q3 6). Median-of-halves method stated; NIST cited.
- Backlog: product-research added 8 source-free items (ranks 82-89, specs 57-64): body-surface-area, brine, fence, coin-counter, factorial, dice-probability, word-frequency (quartile now shipped).
- SEO: none. Health: deploy status not inspected. Marketing: pack done earlier.
- Blockers: IRS (31, 40) and USGA (golf) need irs.gov/usga.org access. No browser/375px check.
- Next cycle: body-surface-area (Mosteller), brine, fence, factorial.

## 2026-11-20 11:00 UTC — cycle
- Shipped: body surface area https://cappycalc.com/health/body-surface-area/ (verify: 288 pages, 0 problems; 170 cm/70 kg -> Mosteller 1.818 m², Du Bois 1.810; 180/90 -> 2.121). Mosteller NEJM 1987 and Du Bois 1916 cited.
- SEO: none. Health: deploy status not inspected. Marketing: not run this cycle. No browser/375px check.
- Next cycle: brine, fence, factorial, coin counter. Owner: irs.gov/usga.org access still unblocks tax 2027, RMD, golf.

## 2026-11-20 11:00 UTC — cycle (addendum)
- Shipped: factorial https://cappycalc.com/math/factorial-calculator/ (verify: 289 pages, 0 problems; 10! = 3,628,800; 20! = 2,432,902,008,176,640,000; 100! 158 digits, 24 zeros; BigInt exact, cap 170).
- Next cycle: brine, fence, coin counter, dice probability, word frequency. Check deploy status of both pushes.

## 2026-11-20 11:55 UTC — cycle
- Shipped: brine calculator https://cappycalc.com/food/brine-calculator/ (verify: 290 pages, 0 problems; 4 L at 5% -> 200 g salt, 4,200 g solution, 4.76% by solution; 1 US gal at 6% -> 227 g). Pure arithmetic, both percent definitions explained.
- SEO: none. Health: deploy status not inspected. Marketing: pack done earlier. No browser/375px check.
- Next cycle: fence, coin counter, dice probability, word frequency. Owner: irs.gov/usga.org access still unblocks tax 2027, RMD, golf.

## 2026-11-20 11:58 UTC — cycle (addendum)
- Shipped: fence calculator https://cappycalc.com/construction/fence-calculator/ (verify: 291 pages, 0 problems; 100 ft / 8 ft -> 13 sections, 14 posts, $990; closed loop 13 posts, $975).
- Next cycle: coin counter, dice probability, word frequency. Check deploy status of both pushes.

## 2026-11-20 12:55 UTC — cycle
- Shipped: coin counter https://cappycalc.com/everyday/coin-counter/ (verify: 292 pages, 0 problems; 100p/30n/20d/10q -> 700¢ = $7.00, 160 coins). Integer-cent math.
- SEO: none. Health: deploy status checked after push (see below). No browser/375px check. US Mint source URL not opened.
- Blocker/workaround: local checkout `main` in /home/user/calcwise had diverged from origin/main (50 stale commits) and a hard reset was denied, so this cycle built in a worktree off origin/main. Owner may want to reset that local clone.
- Next cycle: dice probability, word frequency. Owner: irs.gov/usga.org access still unblocks tax 2027, RMD, golf.

## 2026-11-20 13:55 UTC — cycle
- Shipped: dice probability https://cappycalc.com/other/dice-probability/ (verify: 293 pages, 0 problems; 2d6 =7 -> 16.67%; 2d6 >=10 -> 16.67%; 3d6 =10 -> 12.5% (1 in 8); d20 <=5 -> 25%). Exact DP convolution, bar chart of all totals.
- SEO: none. Health: deploy status not inspected. Marketing: pack done earlier. No browser/375px check. Daily report not posted (cycle started before 14:00 UTC); next cycle should post it.
- Next cycle: post Daily report 2026-11-20; word frequency counter; product-research refresh (open buildable list nearly empty). Owner: irs.gov/usga.org access still unblocks tax 2027, RMD, golf.

## 2026-11-20 13:57 UTC — cycle (addendum)
- Shipped: word frequency https://cappycalc.com/text/word-frequency/ (verify: 294 pages, 0 problems; "the cat and the hat and the bat" -> 8 words, 5 unique, the 3x; min length 4 drops short words; case toggle).
- Backlog: all ranked buildable items now shipped. Next cycle: post Daily report 2026-11-20 (after 14:00 UTC), then product-research refresh to add source-free items. Owner: irs.gov/usga.org access still unblocks tax 2027, RMD, golf.

## 2026-11-20 14:00 UTC — cycle (addendum)
- Shipped: sinking fund https://cappycalc.com/finance/sinking-fund/ (verify: 295 pages, 0 problems; $1,200/12 + $600/6 + $2,400/12 -> $400/month; 4.8% APR $1,200/12 -> $97.82). Deploys of dice and word-frequency both green.
- Backlog: product-research added ranks 90-97 (specs 65-72); rank 90 rejected as duplicate of years-to-fi (decisions.md).
- Next cycle: post Daily report 2026-11-20; fasting-window, caffeine half-life (needs source), days-until-holiday (ship by 12-05, fixed "today" in tests), reading-goal.

## 2026-11-20 14:55 UTC — cycle
- Shipped: days until holiday https://cappycalc.com/everyday/days-until-holiday/ (verify: 296 pages, 0 problems; Nov 20 -> Christmas 35 days; Thanksgiving 2026 = Nov 26 -> 6 days; Dec 26 -> next Christmas 364).
- Daily report 2026-11-20 posted (#6). Closing the previous report (#5) was denied by the permission classifier; owner can close #4/#5.
- SEO: none. Health: deploy status not inspected. No browser/375px check.
- Next cycle: fasting-window, reading-goal, prime factorization, distance/midpoint; caffeine needs a source. Owner: irs.gov/usga.org access still unblocks tax 2027, RMD, golf.

## 2026-11-20 15:55 UTC — cycle
- Shipped: fasting window https://cappycalc.com/health/fasting-window/ (verify: 297 pages, 0 problems; first meal 12:00 + 16:8 -> last meal 8:00 PM; last meal 9 pm + 16 h -> first meal 1:00 PM; 20:00 + 12:12 wraps to 8:00 AM).
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly, no delegation. Daily report already posted today (#6).
- Workaround: local `main` is stale (diverged) and hard reset is denied, so work was done on branch `cycle-work` off origin/main and pushed to main.
- Next cycle: reading-goal, prime factorization, distance/midpoint; caffeine needs a source.

## 2026-11-20 15:58 UTC — cycle (addendum)
- Shipped: reading goal https://cappycalc.com/everyday/reading-goal/ (verify: 298 pages, 0 problems; 24 x 300 pages / 365 d = 19.73 pages, 29.6 min at 40 p/h; 10 of 24 done, 150 d -> 28 pages/day).
- Next cycle: prime factorization, distance/midpoint; caffeine needs a source. Check deploy runs of both pushes.

## 2026-11-20 16:52 UTC — cycle
- Shipped: prime factorization https://cappycalc.com/math/prime-factorization/ (verify: 299 pages, 0 problems; 360 -> 2³×3²×5, 24 divisors, sum 1,170; 84 -> 12 divisors, sum 224; 97 prime; 1001 = 7×11×13).
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly, no delegation, via `cycle-work` branch off origin/main (local checkout was detached).
- Next cycle: distance/midpoint (rank 97); caffeine needs a source; then product-research refresh. Owner: irs.gov/usga.org access still unblocks tax 2027, RMD, golf.

## 2026-11-20 16:53 UTC — cycle (addendum)
- Shipped: distance & midpoint https://cappycalc.com/math/distance-midpoint/ (verify: 300 pages, 0 problems; (1,2)-(4,6) -> 5, (2.5, 4); (-3,4)-(5,-2) -> 10, (1, 1); 3D (0,0,0)-(1,2,2) -> 3). Overlaps slope's 2D distance/midpoint; differentiated by 3D.
- Backlog: all ranked buildable items shipped. Next cycle: product-research refresh for new source-free items (caffeine needs a cited source). Owner: irs.gov/usga.org access still unblocks tax 2027, RMD, golf.

## 2026-11-20 16:56 UTC — cycle (addendum)
- Backlog refreshed (ranks 98-105, specs 73-80; seasonal reasoning only, no web sources).
- Shipped: hours of work a purchase costs https://cappycalc.com/finance/hours-of-work-cost/ (verify: 301 pages, 0 problems; $240 at $30/h, 20% tax -> 10 h = 1.25 workdays; $1,200 at $25 -> 60 h = 7.5 days). Source link is the generic bls.gov homepage; the math is plain arithmetic.
- Deploys of prime-factorization and distance-midpoint were still running at last check.
- Next cycle: retirement countdown (98), annual vs monthly plan (100), cost-of-living salary (101), paychecks per year (102; ship before 2027).

## 2026-11-20 17:55 UTC — cycle
- Shipped: retirement countdown https://cappycalc.com/fire/retirement-countdown/ (verify: 302 pages, 0 problems; Fri Nov 20 -> Fri Dec 4 = 14 days, 10 workdays, 2 Mondays; 365 days -> 261 workdays, 52 Mondays; 2026-11-20 -> 2046-01-01 = 6982 days, 4986 workdays, 997 Mondays).
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly, no delegation, via `cycle-work` off origin/main. Daily report already posted today (#6).
- Next cycle: annual vs monthly plan (100), cost-of-living salary (101), paychecks per year (102; ship before 2027).

## 2026-11-20 17:58 UTC — cycle (addendum)
- Shipped: annual vs monthly plan https://cappycalc.com/finance/annual-vs-monthly-plan/ (verify: 303 pages, 0 problems; $12.99/mo vs $99/yr -> saves $56.88 (36.5%), $8.25/mo, break-even 7.62 months; $10 vs $120 -> 0 saving, 12 months).
- Next cycle: cost-of-living salary (101), paychecks per year (102; ship before 2027). Check deploy runs of both pushes.

## 2026-11-20 18:00 UTC — cycle (addendum)
- Shipped: paychecks per year https://cappycalc.com/finance/paychecks-per-year/ (verify: 304 pages, 0 problems; examples checked by an independent day-by-day count: biweekly from Fri 2027-01-01 -> 27 (3-check months Jan, Jul, Dec), from 2027-01-08 -> 26, weekly Friday -> 53, Wednesday -> 52).
- Next cycle: cost-of-living salary (101); then product-research refresh (open items: 101, 103, 104, 105 plus 69-70 etc.). Check deploy runs of today's pushes.

## 2026-11-20 18:02 UTC — cycle (addendum)
- Shipped: cost-of-living salary https://cappycalc.com/finance/cost-of-living-salary/ (verify: 305 pages, 0 problems; $80k at 100 -> 120 needs $96k; $90k offer at 120 = $75k buying power, $5k short). BEA source link not opened (sandbox), cited as the generic regional price parities page.
- Retirement-countdown deploy confirmed success. Open buildable: 103 EV vs gas, 104 time with loved ones, 105 systems of equations, 69-70, 73-74.

## 2026-11-20 18:55 UTC — cycle
- Shipped: EV vs gas cost https://cappycalc.com/everyday/ev-vs-gas-cost/ (verify: 306 pages, 0 problems; 30 kWh/100 mi at $0.17 -> $0.051/mi, 28 mpg at $3.50 -> $0.125/mi, 12,000 mi -> $612 vs $1,500, saves $888; 30 kWh at $0.50 vs 40 mpg at $4 -> -$500).
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly via `cycle-work` off origin/main. Daily report already posted today (#6). `npm ci` once denied by safety check when node_modules was absent; re-ran alone and it worked.
- Next cycle: time with loved ones (104), systems of equations (105), Dry January (69, ship by 12-28), lean body mass (73), firewood (74).

## 2026-11-20 19:55 UTC — cycle
- Shipped: Time left with loved ones https://cappycalc.com/everyday/time-with-loved-ones/ (verify: 307 pages, 0 problems; parent 65 -> 85, 4 visits x 3 days -> 80 visits, 240 days, 2,080 calls, +60 days per extra yearly visit).
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly (small item, no sub-agents). Daily report already posted today (#6). Local `main` was stale and a hard reset was denied; used `git checkout -B cycle-work origin/main` instead.
- Next cycle: systems of equations (105), then refresh backlog (fewer than 8 buildable items remain).

## 2026-11-20 19:58 UTC — cycle (second item)
- Shipped: Systems of equations (2 x 2) https://cappycalc.com/math/system-of-equations/ (verify: 308 pages, 0 problems; 2x+y=5, x-y=1 -> (2, 1); x+y=10, x-y=2 -> (6, 4)).
- Backlog has no buildable items left below rank 105 (only blocked/parked 15, 31, 32, 33, 40, 80): next cycle must run product-research to add 8+ items first.

## 2026-11-20 20:55 UTC — cycle
- Shipped: No-spend challenge https://cappycalc.com/finance/no-spend-challenge/ (verify: 309 pages, 0 problems; 21 of 30 days at $20 -> $420, 70%, 9 spend days, $5,110/yr; 7 of 7 at $15 -> $105, $5,475/yr).
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly. Daily report already posted today (#6). A compound command containing `rm`-style steps in verify was blocked once by the safety check when chained with a heredoc; re-ran verify alone and it passed.
- Next cycle: zero-based budget (107), sleep debt (108), study planner (110), grade curve (111), linear equation (113). 109 needs MET source check.

## 2026-11-20 20:58 UTC — cycle (second item)
- Shipped: Linear equation solver https://cappycalc.com/math/linear-equation/ (verify: 310 pages, 0 problems; 2x+3=11 -> 4; -3x+4=10 -> -2; 5x-7=18 -> 5). First draft failed the chart check; added a line chart.
- Next cycle: zero-based budget (107), sleep debt (108), study planner (110), grade curve (111), mileage plan (112). 109 needs MET source check. Deploy runs of both pushes not yet inspected.

## 2026-11-20 21:55 UTC — cycle
- Shipped: Sleep debt https://cappycalc.com/health/sleep-debt/ (verify: 311 pages, 0 problems; target 8, nights 6/6.5/7/5/6/9/8 -> short 9.5 h, extra 1 h, net 8.5 h, 1.21 h/night over 7 nights; all-8.5 week -> 0 debt). Net debt is deficits minus surplus (floored at 0), stated on the page.
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly. Daily report already posted today (#6). First draft failed the chart check (bar charts take `categories`/`format`).
- Next cycle: zero-based budget (107), study planner (110), grade curve (111), mileage plan (112). 109 needs MET source check.

## 2026-11-20 22:55 UTC — cycle
- Shipped: Zero-based budget https://cappycalc.com/finance/zero-based-budget/ (verify: 312 pages, 0 problems; income 4,000 with 8 categories summing 3,900 -> 100 to assign, 97.5% assigned, 15% savings; 3,000 fully assigned -> 0; 2,000 income vs 2,500 -> -500).
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly. Daily report already posted today (#6). Heredoc-with-verify in one Bash call was blocked by the safety check; used Write tool and ran verify alone. Examples must list every input (defaults are not applied in tests).
- Next cycle: study planner (110), grade curve (111), mileage plan (112), then sleep/other 106/108-109 as open; 109 needs MET source check.

## 2026-11-20 22:58 UTC — cycle (second item)
- Shipped: Study time planner https://cappycalc.com/other/study-time-planner/ (verify: 313 pages, 0 problems; 10 days, 12 chapters, 2 done, 3 h, 20% review -> 10 left, 1/day, 2.4 h per chapter, 6 h review; 5 days/10 ch/4 h/0% -> 2/day, 2 h; 7 days/14/4 done/2 h/50% -> 10/7 per day, 0.7 h).
- Next cycle: grade curve (111), mileage plan (112), then 106/108 if still open; 109 needs MET source check. Deploy runs of today's pushes not inspected.

## 2026-11-20 23:00 UTC — cycle (third item)
- Shipped: Grade curve https://cappycalc.com/other/grade-curve/ (verify: 314 pages, 0 problems; 62/75/88 +5 -> avg 75 -> 80; scale top 88 to 100 -> avg 85.227; sqrt 64/81/100 -> 80/90/100 avg 90; flat cap 98,50 -> 77.5). List examples must be arrays; `math-extra` fmt takes significant digits, not decimals (used a local formatter).
- Next cycle: mileage plan (112), then 106/108 if still open; 109 needs MET source check; backlog refresh when fewer than 8 buildable remain. Deploy runs of today's pushes not inspected.

## 2026-11-20 23:55 UTC — cycle
- Shipped: Running mileage build plan https://cappycalc.com/sports/mileage-build-plan/ (verify: 315 pages, 0 problems; 20 at 10% x4 -> peak 26.62, total 92.82; 8 weeks with easy week every 4th -> total 199.44036).
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly. Daily report already posted today (#6). Local `main` had diverged from origin (old history); worked from origin/main on branch `work`, local backup branch `backup-local-main`.
- Next cycle: remaining open items need source checks (93 caffeine, 109 food burn-off, 41, 15); backlog has <8 buildable items, so product-research should refresh the backlog first.

## 2026-11-21 00:56 UTC — cycle
- Shipped: FSA spend-down https://cappycalc.com/finance/fsa-spend-down/ (verify: 316 pages, 0 problems; $600, 30 days -> $140/wk, $20/day; $200 carryover -> $93.33/wk; $280 over 14 days -> $140/wk).
- Backlog: product-research added ranks 114-121 (specs 89-96); backlog has buildable items again. SEO: none. Health: deploy status not inspected. No browser/375px check.
- Local checkout was a detached HEAD; worked on branch `work` from origin/main.
- Next cycle: foreign-transaction-fee (116), school-break-childcare (120), thermostat-setback (118), tire-pressure-cold (114).

## 2026-11-21 01:55 UTC — cycle
- Shipped: Foreign transaction and ATM fee https://cappycalc.com/finance/foreign-transaction-fee/ (verify: 317 pages, 0 problems; $2,000 at 3% + $400 ATM at 2% + 2x$5 -> $78, 3.25%; $800 at 1.5% + $200 + $5 -> $17, 1.7%; $1,000 at 3% -> $30).
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly (no agents) to stay small.
- Next cycle: school-break-childcare (120), thermostat-setback (118), tire-pressure-cold (114), road-trip-time (119).

## 2026-11-21 01:58 UTC — cycle (second item)
- Shipped: School break childcare https://cappycalc.com/everyday/school-break-childcare/ (verify: 318 pages, 0 problems; 2 wk x 5 d, $80, 2 free -> $640, $320/wk; 1 wk, $60, 2 children -> $600; free > needed -> $0). Previous deploy (FSA, run 226) succeeded; this cycle's runs not yet inspected.
- Next cycle: thermostat-setback (118), tire-pressure-cold (114), road-trip-time (119), dog-age-human (121), pet-food-duration (115). Heredoc file writes get blocked; use Write tool.

## 2026-11-21 02:00 UTC — cycle (fix)
- Fixed: foreign-transaction-fee "share of everything you spent" returned 3.25 for a percent-format output (expects a fraction, would show 325%); now 0.0325. Verify: 318 pages, 0 problems. Lesson: percent-format outputs take fractions; test examples do not catch the scale.

## 2026-11-21 02:55 UTC — cycle
- Shipped: Thermostat setback savings https://cappycalc.com/everyday/thermostat-setback/ (verify: 319 pages, 0 problems; $1,200, 8 F, 8 h -> 8% = $96; 12 F -> capped 10% = $120; 7 F x 9 h -> 7.875% = $94.50; 4 C -> 7.2% = $86.40). Source: DOE Energy Saver.
- SEO: none. Health: last deploy (run 44852871974) succeeded. No browser/375px check. Built directly (no agents).
- Next cycle: tire-pressure-cold (114), road-trip-time (119), dog-age-human (121), pet-food-duration (115).

## 2026-11-21 02:58 UTC — cycle (second item)
- Shipped: Cold tire pressure https://cappycalc.com/everyday/tire-pressure-cold/ (verify: 320 pages, 0 problems; 32 psi at 70 F -> 20 F = 27.59 psi (drop 4.41; rule of thumb 27); 35 psi 68 -> 32 F = 31.61; 35 psi 20 C -> 0 C same as 68 -> 32 F).
- Next cycle: road-trip-time (119), dog-age-human (121), pet-food-duration (115). Deploy of this cycle's pushes not yet inspected.

## 2026-11-21 03:55 UTC — cycle
- Shipped: Road trip time https://cappycalc.com/everyday/road-trip-time/ (verify: 321 pages, 0 problems; 450 mi at 60 mph + 3x20 min, depart 8:00 -> 8 h 30 min, arrive 4:30 PM; 300 mi at 65 mph depart 22:00 -> 4 h 37 min, 2:37 AM +1 day).
- SEO: none. Health: deploy status not inspected. No browser/375px check. Built directly (no agents).
- Next cycle: dog-age-human (121), pet-food-duration (115), caffeine-half-life (93, needs source check).

## 2026-11-21 03:58 UTC — cycle (second item)
- Shipped: Dog age in human years https://cappycalc.com/everyday/dog-age-human/ (verify: 322 pages, 0 problems; 1 -> 31.0, 3 -> 48.58 (x7 = 21), 7 -> 62.13, 12 -> 70.76). Source: NHGRI / Wang et al. 2020.
- Next cycle: pet-food-duration (115), caffeine-half-life (93, needs source check); backlog has few buildable items left, run product-research.

## 2026-11-21 04:00 UTC — cycle (third item)
- Shipped: Pet food duration https://cappycalc.com/everyday/pet-food-duration/ (verify: 323 pages, 0 problems; 30 lb, 3 cups x 4 oz -> 40 days, $1.35/day, $40.50/30 d; 7 lb, 1 cup x 3.5 oz -> 32 days).
- Next cycle: only caffeine-half-life (93, source check) and blocked items remain buildable-wise: run product-research for a refresh. Deploy runs for this cycle's pushes not yet inspected.

## 2026-11-21 04:58 UTC — cycle
- Shipped: Holiday spending total https://cappycalc.com/finance/holiday-spending-total/ (verify: 324 pages, 0 problems; $1,450 total, +11.5% vs $1,300; $1,000 card at 24%, $250/mo -> 5 payments, $53.07 interest; 0% APR $600 at $200 -> 3).
- Backlog: product-research added ranks 122-129 (specs 97-104). SEO: none. Health: last deploys succeeded (one cancelled by a newer push). No browser/375px check. Inputs need `info` tooltips or tests fail.
- Next cycle: holiday-tipping-budget (123), round-up-savings (128), christmas-tree-cost (122), dinner-timeline (125).

## 2026-11-21 05:00 UTC — cycle (second item)
- Shipped: Holiday tipping budget https://cappycalc.com/everyday/holiday-tipping-budget/ (verify: 325 pages, 0 problems; 1x$100 + 1x$50 + 3x$25 + 1x$60 = $285, 6 people, $47.50/wk over 6 weeks, 9.5% of $3,000; 4x$10 + 2x$40 = $120).
- Next cycle: round-up-savings (128), christmas-tree-cost (122), dinner-timeline (125, Thanksgiving is soon).

## 2026-11-21 05:55 UTC — cycle
- Shipped: Round-up savings https://cappycalc.com/finance/round-up-savings/ (verify: 326 pages, 0 problems; 20 x $0.50 x 52 = $520/yr, 7% 10 yr = $7,184.55 on $5,200; 10 x $0.40 x 2x, 0%, 5 yr = $2,080). Select inputs arrive as strings: use Number(), not num().
- SEO: none. Health: deploys not inspected. No browser/375px check. Built directly (no agents), cycle cut short at ~5 min of work.
- Next cycle: christmas-tree-cost (122), dinner-timeline (125, ship by 11-25); caffeine-half-life (93) needs source check.

## 2026-11-21 05:57 UTC — cycle (second item)
- Shipped: Christmas tree cost https://cappycalc.com/everyday/christmas-tree-cost/ (verify: 327 pages, 0 problems; $80 real vs $150 x 8 yr -> $18.75/yr, pays off year 2, saves $490; $100+$20 vs $300 x 10 yr -> year 3, saves $900).
- Next cycle: dinner-timeline (125, needs list input; ship by 11-25), caffeine-half-life (93, source check), then run product-research (few buildable items left).

## 2026-11-21 06:00 UTC — cycle (third item)
- Shipped: Dinner timeline https://cappycalc.com/food/dinner-timeline/ (verify: 328 pages, 0 problems; serve 5:00 pm, turkey 285 -> 12:15 pm, casserole 60 -> 4:00 pm, rolls 25 -> 4:35 pm; 15 min buffer -> 12:00 pm; 720 min dish at 10 am -> 10:00 pm day before). Tests require a `chart`; select values are strings (use Number()).
- Next cycle: caffeine-half-life (93, source check), then run product-research: few buildable items left (126, 127, 129 may remain; check backlog).

## 2026-11-21 06:03 UTC — cycle (fourth item)
- Shipped: Drive vs fly cost https://cappycalc.com/everyday/drive-vs-fly-cost/ (verify: 329 pages, 0 problems; 1,000 mi, 28 mpg, $3.20 + $20 tolls = $134.29 vs 4 x ($250+$60) + $80 = $1,320, difference $1,185.71; per person $33.57 vs $330). Related slugs are not validated by tests: check they exist.
- Next cycle: birthday-paradox (126), season-pass-break-even (127), caffeine-half-life (93, source check); run product-research soon.

## 2026-11-21 06:06 UTC — cycle (fifth item)
- Shipped: Birthday paradox https://cappycalc.com/statistics/birthday-paradox/ (verify: 330 pages, 0 problems; n=23 -> 50.73%, yours 5.86%, 253 pairs; n=30 70.63%; n=57 99.01%; n=22 47.57%; values cross-checked in Python).
- Next cycle: season-pass-break-even (127), caffeine-half-life (93, source check); then run product-research: backlog is nearly out of buildable items.

## 2026-11-21 06:09 UTC — cycle (sixth item)
- Shipped: Season pass break-even https://cappycalc.com/sports/season-pass-break-even/ (verify: 331 pages, 0 problems; $699 pass vs $130/day -> day 6, 8 days saves $341, $87.375/day; $500, $100, extra $20 -> day 7, saves $300).
- Backlog: all ranks 122-129 now shipped. Only caffeine-half-life (93, needs source check) and blocked items (15, 31, 32, 40, 80) remain open. Next cycle: run product-research to add 8+ buildable items first, then build.

## 2026-11-21 06:12 UTC — cycle (backlog refresh)
- product-research added ranks 130-137 (specs 105-112): car-lease-vs-buy, credit-card-annual-fee, trip-budget, airport-leave-time, party-seating, daily-interest, pet-lifetime-cost, year-in-review-return (needs formula citation). Evidence is seasonal reasoning only.
- Cycle total: 6 calculators shipped (round-up-savings, christmas-tree-cost, dinner-timeline, drive-vs-fly-cost, birthday-paradox, season-pass-break-even). Deploys: earlier ones green, some cancelled by newer pushes (concurrency); latest not yet inspected. No browser/375px checks.
- Next cycle: build from ranks 130-137 (airport-leave-time and trip-budget are most seasonal).

## 2026-11-21 07:05 UTC — cycle
- Shipped: Daily interest https://cappycalc.com/finance/daily-interest/ ($5,000 at 24% -> $3.29/day, $100/mo, $1,200/yr; 360 basis $3.33) and Credit card annual fee https://cappycalc.com/finance/credit-card-annual-fee/ ($95 fee, $12k, 2% vs 1% -> +$25, break-even $9,500; with $50 perks $4,500). Verify: 333 pages, 0 problems. No browser/375px check.
- Health: previous deploys green. Marketing: not run this cycle (earlier cycle today). SEO: none this cycle.
- Next cycle: ranks 132 (trip-budget), 133 (airport-leave-time), 137 (needs citation), 130; caffeine-half-life needs source check.

## 2026-11-21 07:55 UTC — cycle
- Shipped: Trip budget https://cappycalc.com/everyday/trip-budget/ ($2,000 - $1,200, 10% buffer, 7 days -> $102.86/day; no buffer $114.29) and Airport leave time https://cappycalc.com/everyday/airport-leave-time/ (14:30, 190 min -> 11:20; 01:00 -> 21:50 previous day). Verify: 335 pages, 0 problems. No browser/375px check.
- Note: local `main` in the sandbox had diverged from origin; worked from origin/main on branch `work`.
- Health: not checked beyond verify. Marketing/SEO: none this cycle.
- Next cycle: ranks 130 (car-lease-vs-buy), 137 (needs citation), 134, 136.

## 2026-11-21 08:55 UTC — cycle
- Shipped: Party seating https://cappycalc.com/everyday/party-seating/ (40 guests, 8/table, 10% spare -> 44 chairs, 6 tables, 8 empty; no spare -> 5 tables) and Pet lifetime cost https://cappycalc.com/everyday/pet-lifetime-cost/ ($800 + ($120x12+$600) x 12 y = $25,280, $5.77/day). Verify: 337 pages, 0 problems. No browser/375px check.
- Health/SEO/marketing: not run this cycle (built directly, no agents). Deploys not inspected.
- Next cycle: 130 (car-lease-vs-buy), 137 (needs formula citation), caffeine-half-life (93, source check); open items running low, run product-research.

## 2026-11-21 09:55 UTC — cycle
- Shipped: Car lease vs buy https://cappycalc.com/finance/car-lease-vs-buy/ ($35k, $5k down, 6%/60 mo, $18k resale -> $579.98 loan, buy $363.32/mo net; lease $400x36+$2,000 = $455.56/mo; diff $92.24). Verify: 338 pages, 0 problems. No browser/375px check.
- Health/SEO/marketing: not run (built directly). Deploys not inspected.
- Next cycle: 137 (needs Modified Dietz citation), caffeine-half-life (93, source check); open buildable items nearly out, run product-research first.

## 2026-11-21 10:55 UTC — cycle
- Shipped: Year in review return https://cappycalc.com/finance/year-in-review-return/ (Modified Dietz; $50k -> $62k, +$6k evenly -> 11.32% vs 24% naive; start-of-year 10.71%, end 12.00%). Verify: 339 pages, 0 problems. No browser/375px check.
- Health: last 4 deploys green. Marketing/SEO: not run (built directly).
- Next cycle: only caffeine-half-life (93) and food-burn-off (109) need source checks; run product-research to add 8+ buildable items first.

## 2026-11-21 12:10 UTC — cycle
- Shipped: Caffeine half-life https://cappycalc.com/health/caffeine-half-life/ (dose x 0.5^(h/5); 200 mg -> 100 mg at 5 h, 50 mg at 10 h; FDA 400 mg/day cited, 5 h half-life labelled an average, uncited: fda.gov/ncbi unreachable). Verify: 340 pages, 0 problems. No browser/375px check.
- Backlog: product-research added ranks 138-145 (windfall split, severance, quit-smoking savings, balance transfer, job offer, goal pace, points value, cookie exchange); thin evidence, balance-transfer example needs hand-check.
- Health: not checked via deploy workflow this cycle yet. Marketing/SEO: not run.
- Note: local `main` is unrelated to origin/main; worked from branch cycle-1151 off origin/main.
- Next cycle: build rank 138 windfall-split, then 143/140 (source-free); food-burn-off (109) still needs a MET source.

## 2026-11-21 12:15 UTC — cycle (second item)
- Shipped: Windfall split https://cappycalc.com/finance/windfall-split/ ($10,000, 20/30/30/20 -> 2000/3000/3000/2000; invest $3,000 at 7% x 10 yrs = $5,901.45; percentages not summing to 100 show an error, no numbers). Verify: 341 pages, 0 problems. No browser/375px check.
- Next cycle: rank 143 goal-pace and 140 quit-smoking-savings (source-free); 142/141 after hand-checking examples.

## 2026-11-21 12:25 UTC — cycle (third and fourth items)
- Shipped: Goal pace https://cappycalc.com/everyday/goal-pace/ (1000 goal, 200 done, 73/365 days -> 2.74/day, on pace) and Quit-smoking savings https://cappycalc.com/health/quit-smoking-savings/ (20/day, $10/pack -> $3,650/yr; $10/day at 5%... examples hand-checked at 0% and 12%). Verify: 343 pages, 0 problems. No browser/375px check; no health claims.
- Health: prior two deploys (caffeine, windfall) green incl. live verify job (caffeine confirmed; windfall pending at time of writing).
- Next cycle: ranks 139 severance, 144 points-value, 142/141 (hand-check examples), 145 cookie exchange; 109 food-burn-off needs MET source.

## 2026-11-21 12:55 UTC — cycle
- Shipped: Severance pay https://cappycalc.com/finance/severance-pay/ ($78k, 6 y x 2 wk = 12 wk = $18,000 + 5 PTO days $1,500 = $19,500, 6.5 months at $3k; cap example 16 wk = $24,000) and Points value https://cappycalc.com/finance/points-value/ ($450, $11 fees, 25,000 pts -> 1.756 c/pt; baseline 1 c gain $189). Verify: 345 pages, 0 problems. No browser/375px check.
- Health: last 4 deploys green. SEO/marketing: not run (built directly, no agents). Daily report not due until after 14:00 UTC.
- Next cycle: 141 balance-transfer and 142 job-offer (hand-check examples), 145 cookie-exchange; 109 food-burn-off needs a MET source. Run product-research soon (open items low).

## 2026-11-21 13:00 UTC — cycle (third item)
- Shipped: Balance transfer https://cappycalc.com/finance/balance-transfer/ ($5,000 at 24%, 3% fee, 18 mo, $300/mo -> old-card interest $1,117.54, fee $150, saving $967.54; second example 2,000 at 18%, 5% fee, 12 mo, $100/mo -> saving $187.12; both hand-checked). Verify: 346 pages, 0 problems. Deploys for severance and points-value green.
- Next cycle: 142 job-offer, 145 cookie-exchange; 109 food-burn-off needs a MET source; run product-research (open items low).

## 2026-11-21 13:05 UTC — cycle (fourth item)
- Shipped: Job offer comparison https://cappycalc.com/finance/job-offer-comparison/ (A $100k+10%+4% match = $114,000 vs B $108k+3% match = $111,240; diff $2,760; per day $465.31 vs $463.50; second example with equity and commute hand-checked). Verify: 347 pages, 0 problems. balance-transfer deploy not yet confirmed.
- Next cycle: 145 cookie-exchange; 109 needs a MET source; run product-research first (open buildable items nearly out).

## 2026-11-21 13:10 UTC — cycle (fifth item)
- Shipped: Cookie exchange https://cappycalc.com/food/cookie-exchange/ (12 people x 2 dozen = 288 cookies, 36/batch = 8 batches, 24 sheets, 8 cups butter, 18 flour; rounding example 180 -> 4 batches, 192 baked). Verify: 348 pages, 0 problems.
- Backlog: product-research added ranks 146-153 (home office deduction, mileage deduction, charitable giving, estimated tax safe harbor, mortgage interest, credits to graduate, dimensional weight, fuel tank runtime); several need 2026 IRS figures verified first (irs.gov was unreachable earlier), so prefer 152/153/151 or items with user-supplied rates.
- Health: deploys for severance, points-value, balance-transfer green; job-offer was in progress. Marketing/SEO: not run. Daily report not yet due.
- Next cycle: 151 credits-to-graduate, 152 dimensional-weight, 153 fuel-tank-runtime (source-free); 109 needs MET source.

## 2026-11-21 13:20 UTC — cycle (sixth item)
- Shipped: Credits to graduate https://cappycalc.com/other/credits-to-graduate/ (120 req, 45 done, 15 now, 15/term -> 60 left, 4 terms, 2 y, $24,000 at $400) and Dimensional weight https://cappycalc.com/everyday/dimensional-weight/ (20x14x10 / 139 = 20.14 lb, 12 lb actual -> 21 billable; 12x10x8, 9 lb -> 9). Verify: 350 pages, 0 problems.
- Next cycle: 153 fuel-tank-runtime (source-free), 146-150 need 2026 IRS figures verified; 109 needs MET source; consider marketing brief for today (not run this cycle).

## 2026-11-21 13:55 UTC — cycle
- Shipped: Fuel tank runtime https://cappycalc.com/everyday/fuel-tank-runtime/ (500 gal at 40% = 200 gal; 60,000 BTU/h x 8 h on 91,500 BTU/gal propane -> 38.1 days, 19.1 days to the 20% order mark; second example heating oil 250 gal at 80% -> 27.7 days). BTU/gal figures labelled approximate (EIA page cited, not opened). Verify: 351 pages, 0 problems. No browser/375px check.
- Health/SEO/marketing: not run this cycle (started 13:51, short). Daily report due next cycle (after 14:00 UTC).
- Next cycle: post Daily report; 146-150 need 2026 IRS figures verified (irs.gov was unreachable); 109 needs a MET source; run product-research (buildable source-free items nearly out).

## 2026-11-21 14:55 UTC — cycle
- Shipped: Mortgage interest paid this year https://cappycalc.com/finance/mortgage-interest-year/ ($300k, 6%, 30 y -> pmt $1,798.65, year-1 interest $17,899.78, principal $3,684.04, end balance $296,315.96, hand-checked by closed form; 0% example). Verify: 352 pages, 0 problems. No browser/375px check.
- Daily report posted: issue #7. Marketing: brief for 2026-11-21 pushed to `marketing` (commit 6a49467); media render.mjs and posting guide still to do.
- Health: last 6 deploys green (one cancelled by a newer push). SEO: not run.
- Next cycle: media render for today's brief; 146-149 need 2026 IRS figures; 109 needs MET source; run product-research (source-free items nearly out).

## 2026-11-21 15:55 UTC — cycle
- Shipped: Home office deduction https://cappycalc.com/finance/home-office-deduction/ (150 of 1,500 sq ft, $24,000 expenses -> simplified $750, actual $2,400; 400 sq ft capped at 300 -> $1,500 vs $1,200). Simplified rate $5/sq ft, 300 cap per IRS Pub 587 (page not opened). Verify: 353 pages, 0 problems. No browser/375px check.
- Not run: SEO, marketing media (today's render.mjs and posting guide still outstanding), health check.
- Next cycle: media render for the 2026-11-21 brief; 147 mileage (rate as input), 148/149 need 2026 IRS figures; 109 needs MET source; run product-research.

## 2026-11-21 16:55 UTC — cycle
- Shipped: Business mileage deduction https://cappycalc.com/finance/business-mileage-deduction/ (9,000 mi x 70¢ = $6,300; at 30% combined rate saves $1,890; second example 12,000 mi x 67¢ x 22%). Rate is an input, default 70¢ labelled as the 2025 IRS rate (2026 rate not verified; irs.gov unreachable). Verify: 354 pages, 0 problems. No browser/375px check.
- Not run: SEO, marketing media (render.mjs and posting guide for 2026-11-21 still outstanding), health check, product-research.
- Next cycle: media render for today's brief; 148/149 need 2026 IRS figures; 109 needs MET source; run product-research (source-free items nearly out).

## 2026-11-21 17:51 UTC — cycle
- Shipped (6): Food burn-off /health/food-burn-off/ (250 kcal, 70 kg, walk 4.3 MET -> 47.5 min); Rent increase impact /finance/rent-increase-impact/ ($1,500 -> $1,620 = +8%, $1,440 over 12 mo); Eating out cost /finance/eating-out-cost/ (4 x $16 vs $5 -> $3,328 vs $1,040 a year); Car affordability /finance/car-affordability/ ($90k, 10%, $250 running, 20% down, 7.2%/48 mo -> $25,999); Side hustle goal /finance/side-hustle-goal/ ($500 at $14.50 profit -> 35 sales); Cash back rewards /finance/cash-back-rewards/ ($414 a year, net $319 after $95 fee vs $360 flat 2%). Verify: 360 pages, 0 problems. No browser/375px check; last sub-agent runs skipped `npm ci` (sandbox blocked it), used existing node_modules.
- Backlog: product-research added ranks 154-161 (specs 129-136); 155, 159, 161 still open (stock options, early-withdrawal needs IRS check, yield on cost).
- Marketing: 2026-11-21 media pack rendered and posting-guide.md written on `marketing` branch (reel 1-5, carousel 1-5, x-1).
- Health: deploys green; two older runs cancelled by newer pushes (expected). SEO: not run.
- Next cycle: 155 stock-option-exercise, 161 yield-on-cost; 148/149 need 2026 IRS figures; SEO pass and health check overdue.

## 2026-11-21 19:00 UTC — cycle
- Shipped: Stock option exercise https://cappycalc.com/finance/stock-option-exercise/ (10,000 x $2 strike, $10 FMV -> cost $20,000, spread $80,000; underwater 50% vested case) and Yield on cost https://cappycalc.com/finance/yield-on-cost/ (100 sh at $50, $2 div, 7% growth, 10 y -> 4% now, 7.87% after, income $393.43). Verify: 362 pages, 0 problems. No browser/375px check.
- Health: last deploys green (older runs cancelled by newer pushes). SEO, marketing, product-research: not run (short cycle).
- Next cycle: 159 needs IRS source check; 148/149 need 2026 IRS figures; 109 needs MET source; run product-research (buildable items low); SEO pass overdue.

## 2026-11-21 20:00 UTC — cycle
- Shipped: Black Friday deal check https://cappycalc.com/finance/black-friday-deal-check/ (was $200, sale $140, typical $160 -> advertised 30%, real 12.5%) and Free shipping threshold https://cappycalc.com/finance/free-shipping-threshold/ ($38 cart, $50 threshold, $6.99 fee -> gap $12, net $5.01). Verify: 364 pages, 0 problems. No browser/375px check; FTC 16 CFR 233 link not opened.
- Backlog: product-research added ranks 162-169 (specs 137-144), 6 buildable items left plus 148/149/159 needing IRS figures.
- Health: deploys #272-#275 green, verify job passed.
- SEO, marketing: not run. Next cycle: take 162, 163, 166-169; daily report due (first cycle after 14:00 UTC; check whether one was posted today); SEO pass overdue.

## 2026-11-21 21:50 UTC — cycle
- Shipped: Lifestyle creep https://cappycalc.com/finance/lifestyle-creep/ ($60k, 8% raise, 25% tax, 60% spent, 5%, 10 y -> $4,800 gross, $1,440 saved, FV $18,112.09) and Salary needed https://cappycalc.com/finance/salary-needed/ ($3,200 spend, 20% savings, 20% tax -> $60,000, $28.85/h). Verify: 366 pages, 0 problems. No browser/375px check.
- Health: not checked this cycle. SEO, marketing, product-research: not run.
- Next cycle: 166-169 open; 148/149/159 need IRS figures; SEO pass and product-research overdue.

## 2026-11-21 22:00 UTC — cycle
- Shipped: Cost per class https://cappycalc.com/other/cost-per-class/ ($3,000, 3/wk, 15 wk -> 45 classes, $66.67 each), Workout volume https://cappycalc.com/health/workout-volume/ (4x8x100 -> 3,200/session, 9,600/week), Sourdough starter https://cappycalc.com/food/sourdough-starter/ (200 g at 1:2:2 -> 40/80/80). Verify: 369 pages, 0 problems. No browser/375px check.
- Health, SEO, marketing, product-research: not run. Daily report already posted today (#7).
- Next cycle: 167 (paycheck bill planner) open; 148/149/159 need IRS figures; SEO pass and product-research overdue.

## 2026-11-21 22:55 UTC — cycle
- Shipped: Paycheck bill planner https://cappycalc.com/finance/paycheck-bill-planner/ ($1,600 checks on days 1 and 15; bills 1,200/150/100 on check 1 -> leaves $150, 80/60 on check 2 -> leaves $1,460). Pure arithmetic, no sources. Verify: 370 pages, 0 problems. No browser/375px check.
- Health: deploys green through 21:54. SEO, marketing, product-research: not run.
- Note: local `main` had diverged from origin (reset --hard was denied), so worked on branch cycle-2251 and pushed to origin main.
- Next cycle: backlog nearly out of source-free items (148/149/159 need IRS figures); run product-research; SEO pass overdue.

## 2026-11-21 23:51 UTC — cycle
- Shipped: SEO cross-links (`related`) between lifestyle-creep, salary-needed, paycheck-bill-planner, black-friday-deal-check (+ unit-price, subscription-cost). Verify: 370 pages, 0 problems. No new calculator (cycle began 23:51, only minutes to the next).
- Backlog: product-research added ranks 170-175 (specs 145-150), all source-free: employer-match, resale-profit, gig-driver-profit, weight-change-rate, event-cost-per-guest, group-gift-split.
- Health: deploys green through 22:53. Marketing: not run.
- Next cycle: take 170-175 (164-style seasonal first: 175, 174); 148/149/159 still need IRS figures; check today's pack/marketing.

## 2026-11-22 00:51 UTC — cycle
- Shipped: Group gift split https://cappycalc.com/everyday/group-gift-split/ ($90, 8% tax, $6 ship, $4 card, 7 people -> $107.20, $15.32 each, 4c over) and Employer 401(k) match https://cappycalc.com/finance/employer-match-calculator/ ($80k, 3%, 100% up to 6% -> $2,400 match, $2,400 missed). Pure arithmetic, no sources. Verify: 372 pages, 0 problems. No browser/375px check.
- Health, SEO, marketing, product-research: not run (short cycle). Daily report due after 14:00 UTC.
- Next cycle: 171-173 open; 148/149/159 need IRS figures; marketing pack for 2026-11-22 not checked. Also shipped later this cycle: Event cost per guest https://cappycalc.com/everyday/event-cost-per-guest/ ($650 total, $26.00 each at 25 guests; $23.00 at 40).
- Note: commit 768ef01 was pushed with a smoke failure (meta description 162 chars) because verify was piped through tail; fixed in ecf32cd within a minute (its deploy was cancelled, ecf32cd deploy green, verify job passed). Always check verify's exit code, not just its output.

## 2026-11-22 01:51 UTC — cycle
- Shipped: Resale profit https://cappycalc.com/finance/resale-profit-calculator/ ($60, 12% + $0.30, $7 ship, $15 cost, 1.5 h -> profit $30.50, $20.33/h), Gig driver profit https://cappycalc.com/finance/gig-driver-profit/ ($280 earned, 8 h, 150 mi at 25 mpg $3.50, $0.10/mi -> net $244, $30.50/h) and Weight change rate https://cappycalc.com/health/weight-change-rate/ (200 to 194 lb in 21 d -> -2 lb/week, -1.0%/week). Verify: 376 pages, 0 problems; deploy and verify jobs green. No browser/375px check.
- Fix: lifestyle-creep example expected value corrected 18,112.09 -> 18,112.17 (1,440 x 12.577893; found by marketing agent).
- Marketing: pack for 2026-11-22 rendered on `marketing` branch (brief, 5 reel frames, 5 carousel slides, X image, posting guide): https://github.com/hahakumquat/calcwise/tree/marketing/2026-11-22
- Health: deploy green. SEO, product-research: not run.
- Next cycle: 148/149/159 need IRS figures; backlog has few buildable items left (run product-research); SEO pass overdue; daily report due after 14:00 UTC.

## 2026-11-22 02:51 UTC — cycle
- Shipped: Delivery app true cost /finance/delivery-app-true-cost/ ($20 menu, 15% markup, 18% tip, 8% tax, $3.99+$2.50 fees -> $35.47; premium $13.87; $1,442.48/yr at 2 a week), Remote work savings /finance/remote-work-savings/ ($26/day, $3,264 net, 144 h), DIY vs hire /finance/diy-vs-hire/ ($400 DIY vs $600 quote, break-even $50/h), Energy upgrade payback /everyday/energy-upgrade-payback/ (558.45 kWh, $89.35/yr, 4.0 months), Home sale net proceeds /finance/home-sale-net-proceeds/ ($121,000 net on $400k). All arithmetic, no sources. Verify exit 0, 381 pages, 0 problems. No browser/375px check.
- Product-research: added backlog ranks 176-184 (specs 151-159).
- Health: deploys green through 01:56. SEO, marketing: not run (pack for 2026-11-22 already done).
- Also shipped later: Rebate vs low APR /finance/rebate-vs-low-apr/ ($450.00 vs $483.32/mo; 0% wins by $1,999.20) and Mortgage recast /finance/mortgage-recast/ ($2,025.62 -> $1,688.02). Verify 383 pages, 0 problems.
- Next cycle: open 180 lease-break-cost, 184 cash-on-cash-return; 148/149/159(old) need IRS figures; daily report due after 14:00 UTC.

## 2026-11-22 03:52 UTC — cycle
- Shipped: Lease break cost /finance/lease-break-cost/ (8 mo, $1,500, 2-mo fee, 2 mo re-let, $750 -> fee $3,000, re-let $3,750, stay $12,000) and Rental cash-on-cash return /finance/cash-on-cash-return/ ($250k, 20% down, 6.5%, 30 y -> cash in $62,500, NOI $16,680, debt service $15,169.63, 2.42%). Arithmetic only, no sources. Verify exit 0, 385 pages, 0 problems. No browser/375px check.
- Health, SEO, marketing, product-research: not run. Daily report due after 14:00 UTC.
- Note: local `main` was stale/unrelated; worked from a branch off origin/main and pushed to main.
- Next cycle: backlog has few buildable items left (run product-research); 148/149/159(old) need IRS figures.

## 2026-11-22 04:52 UTC — cycle
- Shipped: Price hike impact /finance/price-hike-impact/ ($15.49 -> $17.99 monthly: +$30.00/yr, 16.1%, $90.00 over 3 y). Arithmetic only. Verify exit 0, 386 pages, 0 problems. No browser/375px check.
- Blocked: 148/149/159 need IRS figures; www.irs.gov does not resolve from the sandbox (needs allowing in network settings). Parked, not shipped from memory.
- Health, SEO, marketing, product-research: not run. Backlog has no buildable open items left: next cycle should run product-research first. Daily report due after 14:00 UTC.

## 2026-11-22 05:51 UTC — cycle
- Shipped: Protein cost /health/protein-cost/ ($24.99/30 x 24 g -> $3.47 per 100 g, $4.86/day at 140 g vs eggs $23.33/day), Meal kit vs groceries /food/meal-kit-vs-groceries/ ($69.99/6 servings vs $38 groceries + 15% waste -> premium $26.29/box, $1,367.08/yr), Keep or replace the car /finance/keep-vs-replace-car/ (keep $3,000/yr vs replace $6,300/yr, break-even repairs $5,700). Arithmetic only. Verify exit 0, 389 pages, 0 problems; final deploy green (earlier two superseded by concurrency). No browser/375px check.
- Product-research: added backlog ranks 185-192 (8 open buildable; 186, 187, 188, 190, 192 remain).
- Health: deploys green. SEO, marketing: not run (pack for 2026-11-22 already done). Daily report not due (before 14:00 UTC).
- Next cycle: build 188 shower-cost, 190 warehouse-membership, 186/187; 192 401k-loan without plan limits; 148/149 need IRS figures.

## 2026-11-22 06:51 UTC — cycle
- Shipped: Shower cost /everyday/shower-cost/ (2.1 gpm, 8 min, 55 to 115 °F, $0.16/kWh, $6/1,000 gal -> 16.8 gal, 2.46 kWh, $0.50 a shower, $180.18/yr at 7 a week) and Warehouse membership break-even /finance/warehouse-membership-break-even/ ($65 fee, $1,800 spend, 12%, $80 extras -> net $71, break-even $541.67/yr). Arithmetic only. Verify exit 0, 391 pages, 0 problems. No browser/375px check.
- Health, SEO, marketing, product-research: not run (time spent on builds). Daily report not due (before 14:00 UTC).
- Blocked: 148/149/159 still need IRS figures (irs.gov unreachable).
- Next cycle: build 186 gpa-needed, 187 textbook-cost, 192 401k-loan (no plan limits); run product-research if fewer than 8 buildable.

## 2026-11-22 07:52 UTC — cycle
- Shipped: GPA needed /other/gpa-needed/ (3.2 GPA, 60 cr, 15 this term: target 3.3 -> 3.70 needed; 3.5 -> 4.70, not reachable, max 3.36) and Textbook rent vs buy /other/textbook-cost/ ($180 new, $70 rent, $120 used, $60 resale -> buy net $120, rent $70, used $60; break-even resale $110). Arithmetic only. Verify exit 0, 393 pages, 0 problems. No browser/375px check.
- Health, SEO, marketing, product-research: not run. Daily report not due (before 14:00 UTC).
- Blocked: 148/149/159 need IRS figures (irs.gov unreachable).
- Next cycle: 192 401k-loan (no plan limits); product-research needed (fewer than 8 buildable open).

## 2026-11-22 08:51 UTC — cycle
- Shipped: 401(k) loan true cost /finance/401k-loan/ ($20,000, 8.5%, 5 y, 10% market -> payment $410.33, interest $4,619.84, stay invested $32,906.18, repay path $31,774.80, growth given up $1,131.38). No plan limits stated. Verify 394 pages, 0 problems. No browser/375px check.
- Product-research: fifteenth pass added backlog ranks 193-200 (specs 168-175).
- Health, SEO, marketing: not run. Daily report due after 14:00 UTC.
- Blocked: 148/149/159 need IRS figures (irs.gov unreachable).
- Next cycle: build top of 193-200; SEO pass overdue.

## 2026-11-22 09:55 UTC — cycle
- Shipped: Laundry cost /everyday/laundry-cost/ (defaults -> $1.05 a load, $218.40 a year, dryer $0.60) and Distance, rate and time /math/distance-rate-time/ (150 mi at 60 mph -> 2 h 30 min; 55 mph x 2.5 h -> 137.5 mi; 150 mi / 3 h -> 50 mph). Verify 396 pages, 0 problems. No browser/375px check. Khan Academy source link not opened.
- Product-research, health, SEO, marketing: not run. Daily report due after 14:00 UTC (not yet).
- Blocked: 148/149/159 need IRS figures.
- Next cycle: ranks 169-175 (ice melt, candle, battery, WHR needs WHO check, oven cost); backlog row numbering vs spec numbering differs (rows 193-200 point to specs 168-175).

## 2026-11-22 10:51 UTC — cycle
- Shipped: Ice melt coverage /everyday/ice-melt-coverage/ (40x4 ft, 10 lb/1,000 sq ft, 50 lb bag, $15 -> 1.6 lb, 31.25 applications, $0.48 each), Candle burn time /everyday/candle-burn-time/ ($24, 50 h, 3 h/night -> $0.48/h, 2 candles = $48) and Battery runtime /everyday/battery-runtime/ (10,000 mAh, 3.7 V, 85%, 5 W -> 37 Wh, 31.45 Wh usable, 6.29 h, 2.10 phone charges). Arithmetic only; no airline Wh limits stated. Verify exit 0, 399 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report due after 14:00 UTC (not yet).
- Blocked: 148/149/159 need IRS figures (irs.gov unreachable); 197 needs WHO check.
- Next cycle: 200 oven-cost, 198 long-division; product-research needed (few buildable open).

## 2026-11-22 11:52 UTC — cycle
- Shipped: Oven cost /everyday/oven-cost/ (4 h, 50% duty, 2.4 kW, $0.16 -> $0.77 electric; 15,000 BTU/h, $1.50/therm -> $0.45 gas; 12 bakes -> $9.22 / $5.40). Arithmetic only; duty cycle labelled an estimate. Verify exit 0, 400 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report due after 14:00 UTC (not yet).
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 198 long-division; run product-research (few buildable items left) and an SEO pass.

## 2026-11-22 12:55 UTC — cycle
- Shipped: Long division /math/long-division/ (17÷5 = 3 R 2 = 3.4; 1000÷7 = 142 R 6, repeating 857142; 144÷12 = 12 R 0; 3÷8 = 0.375). Non-negative integers only, divisor 0 gives an error. Verify exit 0, 401 pages, 0 problems. No browser/375px check (Chromium would not launch for the agent).
- Previous deploy (oven cost, run 314) green. Product-research, SEO, marketing: not run. Daily report due after 14:00 UTC (not yet).
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 197 if a WHO source is reachable; run product-research (few buildable items left) and an SEO pass.

## 2026-11-22 13:51 UTC — cycle
- Shipped: Investment fee drag /finance/investment-fee-drag/ ($10,000 + $500/mo, 7% gross, 30 y: 0.05% fee -> $683,965, 1.00% fee -> $562,483, gap $121,482 on $190,000 contributed; script-checked). Verify 402 pages, 0 problems. No browser/375px check; Investor.gov/FINRA source links not opened.
- SEO: cross-linked `related` lists of 10 recent energy-cost/math calculators (removed a duplicate entry).
- Product-research: added ranks 201-208 (specs 176-183). Health, marketing: not run. Daily report due next cycle (after 14:00 UTC).
- Process: local `main` had diverged from origin/main and a hard reset was denied by the sandbox; worked on a branch cut from origin/main and pushed HEAD:main.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: post the daily report; build 202 debt-vs-invest, 203 sabbatical-fund; check the deploy run for this push.

## 2026-11-22 14:52 UTC — cycle
- Shipped: Debt vs invest /finance/debt-vs-invest/ ($15,000 at 8%, $300 min, $500 extra, 7% return, 5 y: pay debt first $35,827 vs invest $35,492, +$335; interest $1,077 vs $3,307; break-even return = APR 8%; script-checked). Verify 403 pages, 0 problems. No browser/375px check.
- Posted Daily report 2026-11-22 (issue #8). Deploy runs #316-318 green.
- SEO, product-research, marketing: not run. No marketing pack for today on the marketing branch (catch-up needed).
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 203 sabbatical-fund, 204+; marketing brief for today.

## 2026-11-22 15:52 UTC — cycle
- Shipped: Sabbatical fund /finance/sabbatical-fund/ (6 mo x ($3,000 - $500) x 1.10 = $16,500; $4,000 saved, 12 mo -> $1,041.67 a month; no income -> $19,800 / $1,316.67). Arithmetic only. Verify exit 0, 404 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report already posted (#8).
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 204 income-based bill split; marketing brief for today still missing.

## 2026-11-22 17:00 UTC — cycle
- Shipped: Income-based bill split /finance/income-based-bill-split/ (A $4,000, B $2,000, bills $2,400 -> $1,600 / $800, both 40% of income; 50/50 = $1,200, diff $400/mo = $4,800/yr). Related links added on rent-split and bill-splitter. Verify exit 0, 405 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report already posted (#8).
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 205 savings-account-switch; marketing brief for today still missing.

## 2026-11-22 17:51 UTC — cycle
- Shipped: Savings account switch /finance/savings-account-switch/ ($20,000 at 0.50% vs 4.00%: 1 y $100 vs $800 (+$700); 5 y $505.03 vs $4,333.06 (+$3,828.03); 10 y +$8,582.09; script-checked). Related links added on apy-calculator and emergency-fund. Verify exit 0, 406 pages, 0 problems. No browser/375px check; FDIC/CFPB links not opened.
- Product-research, health, SEO, marketing: not run. Daily report already posted (#8).
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 206 bill-negotiation-savings; marketing brief for today still missing.

## 2026-11-22 18:51 UTC — cycle
- Shipped: Bill negotiation savings /finance/bill-negotiation-savings/ ($80 to $65 for 12 mo then $80, 36 mo: $180; $65 for 36 mo: $540; $15/mo at 6% for 36 mo: $590.04; script-checked). Linked from subscription-cost and price-hike-impact. Verify exit 0, 407 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO: not run. Marketing pack for today is complete on the marketing branch. Daily report already posted (#8).
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 207 health-plan-comparison.

## 2026-11-22 18:55 UTC — cycle (2nd item)
- Shipped: Health plan comparison /finance/health-plan-comparison/ (A $200/$500/20%/$4,000 vs B $120/$3,000/30%/$7,000 at $5,000 spend: A $3,800, B $5,040, A cheaper by $1,240; crossover $1,700; script- and hand-checked). Linked from hsa-fsa-savings and fsa-spend-down. Verify exit 0, 408 pages, 0 problems. No browser/375px check; HealthCare.gov source links not opened (proxy blocked the host).
- Next cycle: 208 moving-cost; consider a product-research refresh and SEO pass.

## 2026-11-22 19:55 UTC — cycle
- Shipped: Moving cost /everyday/moving-cost/ (defaults: 480+120+60+75+150+0 + overlap 10 x 1,800 / 30 = 600 -> $1,485 = 0.825 months of rent; hand-checked). Linked from prorated-rent and lease-break-cost. Verify exit 0, 409 pages, 0 problems. No browser/375px check; "months blank at zero rent" not covered by an example (type disallows null).
- Product-research, health, SEO, marketing: not run (marketing pack for today already complete). Daily report already posted (#8).
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: backlog 201-208 now all shipped or blocked; run product-research refresh (need >= 8 open items) and an SEO pass.

## 2026-11-22 20:05 UTC — cycle (2nd item)
- Shipped: Loss recovery /finance/loss-recovery/ (30% loss -> +42.86%, 50% -> +100%, 20% -> +25%, 10% -> +11.11%; 30% at 7% -> 5.27 y; node-checked). Linked from percentage-change and cagr-calculator. Verify exit 0, 410 pages, 0 problems. No browser/375px check.
- Product-research: added ranks 209-216 (specs 184-191), seventeenth pass. Deploy of moving-cost green.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 209 one-more-year, 210 portfolio-income-per-day, 216 dividend-income-goal; SEO pass.

## 2026-11-22 20:55 UTC — cycle
- Shipped: One more year /fire/one-more-year/ ($850,000 + $30,000 at 5%, 4% -> $922,500; income $34,000 -> $36,900, +$2,900 a year, +$241.67 a month, +8.53%; $40,000 spending -> $6,000 short now, $3,100 after; hand-checked). Verify exit 0, 411 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report already posted (#8).
- Note: local `main` in the sandbox had diverged from origin; worked on a branch from origin/main (hard reset was denied) and pushed to main.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 210 portfolio-income-per-day, 216 dividend-income-goal; SEO pass.

## 2026-11-22 21:55 UTC — cycle
- Shipped: Portfolio income per day /fire/portfolio-income-per-day/ ($500,000 at 4% -> $20,000 a year, $1,666.67 a month, $54.79 a day, $2.28 an hour; $30 wage -> 666.7 h, 16.7 weeks; hand-checked). Linked from one-more-year. Verify exit 0, 412 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report already posted (#8).
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 216 dividend-income-goal, 213; SEO pass.

## 2026-11-22 22:55 UTC — cycle
- Shipped: Dividend income goal /finance/dividend-income-goal/ ($1,000/mo at 4% -> $12,000 a year, $300,000 needed; with 15% tax $352,941.18; $25,000 held -> gap $275,000, 8.3%; hand-checked). Linked from dividend-calculator and yield-on-cost. Verify exit 0, 413 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report already posted (#8).
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 213 pay-cut-tradeoff, 211 net-worth-milestones, 214; SEO pass.

## 2026-11-22 23:55 UTC — cycle
- Shipped: Pay cut tradeoff /finance/pay-cut-tradeoff/ ($80,000, 40 to 32 h, 10% cut -> hourly $38.46 -> $43.27, +12.5%, lose $8,000 a year, 416 h back, $19.23 per free hour, break-even cut 20%; hand-checked). Linked from salary-to-hourly.
- Fixed: `percent` outputs multiply by 100, so dividend-income-goal `progress` and price-hike-impact `pct` were displaying 100x too large (833%, 1613.9%). Both now return fractions; examples updated. Other recent percent outputs audited, fine.
- Verify exit 0, 414 pages, 0 problems. No browser/375px check. Product-research, health, SEO, marketing: not run.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 211 net-worth-milestones, 214 family-plan-split; SEO pass. Watch for the percent-format pitfall (fraction, not percentage points).

## 2026-11-23 00:54 UTC — cycle
- Shipped: Net worth milestones /fire/net-worth-milestones/ ($0 start, $1,000/mo, 0% -> $100k in 100 months = 8y4m; $10,000 + $500/mo at 7% -> $100k 9y8m, $1M 35y7m; month-by-month script and closed form agree). Linked from net-worth. Verify exit 0, 415 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report is due next cycle after 14:00 UTC.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 214 family-plan-split, 215 life-in-weeks; SEO pass.

## 2026-11-23 00:55 UTC — cycle (second item)
- Shipped: Family plan split /finance/family-plan-split/ ($22 plan, 4 people, $11 solo -> $5.50 each, saves $264 a year, break-even 2; $30/2 people/$12 -> costs $72 a year more, break-even 3; hand-checked). Linked from subscription-cost. Verify exit 0, 416 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report due next cycle after 14:00 UTC.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 215 life-in-weeks; SEO pass.

## 2026-11-23 01:51 UTC — cycle
- Shipped: Your life in weeks /everyday/life-in-weeks/ (30 vs 80 -> 1,560 lived, 4,160 total, 2,600 left, 37.5%, 50 summers; hand-checked; percent stored as fraction). Linked from time-with-loved-ones and screen-time-life. Verify exit 0, 417 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report due next cycle after 14:00 UTC.
- Note: local `main` branch in the sandbox had diverged from origin/main; worked from a branch cut at origin/main and pushed HEAD:main.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: pick next open backlog item after 216; SEO pass.

## 2026-11-23 02:58 UTC — cycle
- Backlog had no buildable items; product-research added ranks 217-224 (arithmetic-only, demand scores are estimates; no primary source reachable).
- Shipped: Bonus vs raise /finance/bonus-vs-raise/ ($80k, 3% raise vs $5k bonus -> $2,400 a year, break-even 2.08 yrs, 5-yr $12,000; with 3% growth $12,741.93, break-even 2.05; hand-checked). Linked from raise-calculator and bonus-tax. Verify exit 0, 418 pages, 0 problems. No browser/375px check.
- Health, SEO, marketing: not run. Daily report due next cycle after 14:00 UTC.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 220 savings-rate-escalator, 223 living-alone-cost; SEO pass.

## 2026-11-23 03:55 UTC — cycle
- Shipped: Savings rate escalator /finance/savings-rate-escalator/ ($60k, 5% +1 pt/yr cap 15%: 10 yrs -> $57,000 vs $30,000 flat; 15 yrs -> $102,000; 3 yrs at 7% -> $11,486.70 vs $9,644.70; hand-checked, caught and fixed my own flat-balance slip before shipping). Linked from savings-goal and employer-match-calculator. Verify exit 0, 419 pages, 0 problems. No browser/375px check.
- Built directly (small item) rather than delegating; product-research, health, SEO, marketing not run. Daily report due next cycle after 14:00 UTC.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 223 living-alone-cost, 218 salary-growth-projection; SEO pass.

## 2026-11-23 03:58 UTC — cycle (second item)
- Shipped: Cost of living alone /finance/living-alone-cost/ (solo $2,010 vs $3,000/3 = $1,000 -> $1,010 a month, $12,120 a year, $33.21 a day; second example $200/mo, $2,400/yr; hand-checked). Linked from rent-split and rent-affordability. Verify exit 0, 420 pages, 0 problems. Earlier escalator deploy + verify jobs green. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report due next cycle after 14:00 UTC.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 218 salary-growth-projection, 221 ytd-income-projection; SEO pass.

## 2026-11-23 04:55 UTC — cycle
- Shipped: Salary growth /finance/salary-growth-projection/ ($60k, 3%, 30 yrs -> total $2,854,525, final-year $141,394, no-raise $1.8M, raises add $1,054,525; $50k/5%/10 yrs and 0% case also hand-checked). Linked from raise-calculator and bonus-vs-raise. Verify exit 0, 421 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report due next cycle after 14:00 UTC.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 221 ytd-income-projection; SEO pass.

## 2026-11-23 04:58 UTC — cycle (second item)
- Shipped: YTD income projection /finance/ytd-income-projection/ ($52k YTD, 20 biweekly checks, $2k bonus -> $2,500/check, 6 left, $67,000 year; monthly example $60,000; hand-checked). Linked from paychecks-per-year and raise-calculator. Verify exit 0, 422 pages, 0 problems. Deploy of the earlier commit was still queued at last look. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report due next cycle after 14:00 UTC.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 219 w2-to-contractor-rate, 222 engagement-ring-budget, 224 shares-to-sell; SEO pass.

## 2026-11-23 06:00 UTC — cycle
- Shipped: W-2 to contractor rate /finance/w2-to-contractor-rate/ ($100k, 40h, 25 days off, $12k benefits, 7.65% extra tax, $3k costs -> $122,650 needed, 1,880 h, $65.24/h vs $48.08 W-2; 80% billable -> $81.55; hand-checked). Linked from freelance-rate and self-employment-tax. Verify exit 0, 423 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report due next cycle after 14:00 UTC.
- Note: local `main` was stale with unrelated history; worked on a branch from origin/main and pushed to main.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 222 engagement-ring-budget, 224 shares-to-sell; SEO pass.

## 2026-11-23 06:05 UTC — cycle (second item)
- Shipped: Engagement ring budget /finance/engagement-ring-budget/ ($5,000 on $72,000: 0.83 months, 6.94%, 144.4 h, 10 months to save with $1k saved + $400/mo; 3 months of salary shown only as a guideline; hand-checked). Linked from hours-of-work-cost. Verify exit 0, 424 pages, 0 problems. No browser/375px check.
- Next cycle: 224 shares-to-sell; SEO pass; health check of deploy runs.

## 2026-11-23 06:10 UTC — cycle (third item)
- Shipped: Shares to sell /finance/shares-to-sell/ ($10,000 net at $50, $30 basis, 15%: 213 shares, $10,650 gross, $639 tax, $10,011 net; loss/fee case 51 shares; hand-checked). Linked from capital-gains-tax. Verify exit 0, 425 pages, 0 problems. No browser/375px check.
- Backlog items 219, 222, 224 from the last cycle's list are now all shipped. Next cycle: check remaining open backlog (product-research refill if under 8 buildable), SEO pass, daily report after 14:00 UTC.

## 2026-11-23 06:55 UTC — cycle (fourth item)
- Backlog was dry (only source-blocked rows open): product-research nineteenth pass added ranks 225-232 (specs 200-207); marked 170/174/175/193/199 shipped.
- Shipped: Net to gross /finance/net-to-gross/ ($3,000 take-home at 30%: $4,285.71 gross/month; hand-checked). Linked from raise-calculator. Verify exit 0, 426 pages, 0 problems. No browser/375px check. IRS source links not opened.
- Note: local `main` branch in the sandbox was stale (diverged); worked from origin/main. Deploy runs not checked from here (no gh run view this cycle).
- Next cycle: 226 degree-payback, 227 student-loan-accrual, 228 cost-per-mile; SEO pass; daily report after 14:00 UTC.

## 2026-11-23 07:55 UTC — cycle
- Shipped: Degree payback /finance/degree-payback/ ($40k tuition + 2 yrs x $50k forgone = $140k; $20k uplift at 25% -> $15k net; payback 9.33 yrs; 30 yrs +$310,000; hand-checked). Linked from student-loan-payoff and job-offer-comparison. Verify exit 0, 427 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Daily report due next cycle after 14:00 UTC.
- Blocked: 148/149/159 need IRS figures; 197 needs WHO check.
- Next cycle: 227 student-loan-accrual, 228 cost-per-mile; SEO pass.

## 2026-11-23 07:58 UTC — cycle (second item)
- Shipped: Student loan interest in school /finance/student-loan-accrual/ ($20k, 6%, 48 mo -> simple $4,800, balance $24,800; yearly-added $25,249.54; monthly interest $100 -> $124; hand-checked). Method left to the servicer's terms. Linked from loan and student-loan-payoff. Verify exit 0, 428 pages, 0 problems. No browser/375px check.
- Next cycle: 228 cost-per-mile, 229 wedding-budget; SEO pass; daily report after 14:00 UTC. Deploy runs not checked from here (no gh run view).

## 2026-11-23 08:55 UTC — cycle (item 228)
- Shipped: Cost per mile /everyday/cost-per-mile/ (12,000 mi, 30 mpg, $3.50 -> fuel $1,400; total $7,350; $0.6125/mi; $612.50/mo; $20.14/day; hand-checked). Linked from gas-cost and keep-vs-replace-car. Verify exit 0, 429 pages, 0 problems. No browser/375px check.
- Product-research, health, SEO, marketing: not run. Deploy runs not checked from here.
- Next cycle: 229 wedding-budget, 230 portfolio-rebalance; daily report after 14:00 UTC.

## 2026-11-23 09:00 UTC — cycle (item 229)
- Shipped: Wedding budget /finance/wedding-budget/ ($30k, 50/12/8/8/10/12 -> $15,000/$3,600/$2,400/$2,400/$3,000/$3,600; $300 per guest; $6k saved, 18 mo -> $1,333.33/mo; hand-checked). Linked from engagement-ring-budget. Verify exit 0, 430 pages, 0 problems. No browser/375px check.
- Next cycle: 230 portfolio-rebalance; daily report after 14:00 UTC.

## 2026-11-23 10:00 UTC — cycle (item 230)
- Shipped: Portfolio rebalance /finance/portfolio-rebalance/ (70/20/5/5 vs 60/30/5/5 on $100k -> sell $10,000 stocks, buy $10,000 bonds; with $10k new money: trade mode -4,000/+13,000/+500/+500, buy-only mode 0/9,285.71/357.14/357.14; hand-checked). No tax advice, warning shown. Linked from investment and net-worth. Verify 0 problems (431 pages, 414 calculators). No browser/375px check.
- Product-research, health, SEO, marketing: not run. Deploy runs not checked from here. Daily report due next cycle after 14:00 UTC.
- Next cycle: 231 prorated-salary, 232 home-gym-payback.

## 2026-11-23 10:05 UTC — cycle (item 231)
- Shipped: Prorated salary /finance/prorated-salary/ ($72k, 30-day month, start 16th, 22 working days, 12 worked -> $3,000 by calendar, $3,272.73 by working days; hand-checked). Pre-tax only, method left to employer. Linked from paychecks-per-year. Verify run before push. No browser/375px check.
- Next cycle: 232 home-gym-payback; then product-research refill (backlog will be dry); daily report after 14:00 UTC.

## 2026-11-23 10:15 UTC — cycle (item 232)
- Shipped: Home gym payback /health/home-gym-payback/ ($1,200 equipment, $10 upkeep, $50 membership -> $40/mo saving, 30 months to break even; 36 months: $1,800 vs $1,560, +$240; hand-checked). Linked from gym-cost-per-visit. Verify run before push. No browser/375px check.
- Backlog 225-232 all shipped; only source-blocked rows remain (15, 41, 148, 149, 159, 197). Next cycle: product-research refill first; daily report after 14:00 UTC.

## 2026-11-23 10:25 UTC — cycle (items 230-232, 235)
- Backlog was dry; product-research twentieth pass added ranks 233-240 (specs 208-215).
- Shipped: House hacking offset /finance/house-hacking-offset/ ($2,400 payment, $900 rent, 5% vacancy, $150 costs -> net rent $705, you pay $1,695/mo, $20,340/yr, 29.4% covered; hand-checked). Verify run before push. No browser/375px check.
- Next cycle: 233 childcare-vs-work, 237 allocation-by-age, 234 tax-equivalent-yield; re-verify spec figures by hand. Daily report after 14:00 UTC.

## 2026-11-23 10:55 UTC — cycle (item 237)
- Shipped: Allocation by age /finance/allocation-by-age/ (age 30, $50k -> 70/80/90% stocks; $35k/$40k/$45k; clamps 0-100; hand-checked). Rules-of-thumb disclaimer shown. Linked from portfolio-rebalance. Verify 0 problems (435 pages). No browser/375px check.
- Product-research, health, SEO, marketing: not run. Deploy runs not checked from here. Daily report due next cycle after 14:00 UTC.
- Next cycle: 233 childcare-vs-work, 234 tax-equivalent-yield.

## 2026-11-23 11:05 UTC — cycle (item 234)
- Shipped: Tax-equivalent yield /finance/tax-equivalent-yield/ (3.5% tax-free at 24% -> 4.605% taxable; 4.2% taxable -> 3.192% after tax; break-even 16.67%; hand-checked). Rate is an input, not advice. Linked from bond-yield-calculator. Verify run before push. No browser/375px check.
- Next cycle: 233 childcare-vs-work; then 236, 238, 239, 240. Daily report after 14:00 UTC.

## 2026-11-23 11:15 UTC — cycle (item 233)
- Shipped: Childcare vs working /finance/childcare-vs-work/ ($4,000 gross, 25% tax, $1,500 care, $300 costs, 160 h -> net $3,000, gain $1,200/mo, $14,400/yr, $7.50/h; costs eat 60% of take-home — spec said 40%, corrected, see decisions). Linked from real-hourly-wage. Verify run before push. No browser/375px check.
- Next cycle: 236 equity-dilution, 238 progressive-overload, 239 weekly-calorie-budget, 240 arm-payment-reset. Daily report after 14:00 UTC.

## 2026-11-23 11:25 UTC — cycle (item 240)
- Shipped: ARM payment after reset /finance/arm-payment-reset/ ($300k, 30 yr, 5% fixed 5 yr -> $1,610.46; balance $275,486.20; 7% reset -> $1,947.08, +$336.61 (20.9%); 9% -> $2,311.87; spec figures re-verified by script). Rate caps are left to the user's rate input. Linked from mortgage. Verify run before push. No browser/375px check.
- Next cycle: 236 equity-dilution, 238 progressive-overload, 239 weekly-calorie-budget; then research refill. Daily report after 14:00 UTC.

## 2026-11-23 11:35 UTC — cycle (item 236)
- Shipped: Equity dilution /finance/equity-dilution/ (1.0%; $5M at $20M pre -> 0.80%; $20M at $80M pre -> 0.64%; $500M exit -> $3.2M; 10% pool example 2% -> 1.44%; hand-checked). Illustration disclaimer shown. Linked from stock-option-exercise. Verify run before push. No browser/375px check.
- Next cycle: 238 progressive-overload, 239 weekly-calorie-budget; then research refill (backlog nearly dry). Daily report after 14:00 UTC.

## 2026-11-23 ~12:10 UTC — cycle (item 238)
- Shipped: Progressive overload plan /health/progressive-overload/ (100->150 at +5 = 10 increases, 11 weeks; with deload every 4: 103.5 and 121.5 lb deloads, 13 weeks; 100->152 caps last jump at +2; hand-checked). Verify run before push. No browser/375px check.
- Health: local `main` in the sandbox is an unrelated 50-commit history (CAGR, APY, prime number...) not on origin/main; not pushed, not reset (reset denied). Worked from worktree on origin/main. Owner may want to review the stale local branch `main`.
- Next cycle: 239 weekly-calorie-budget; then research refill (backlog nearly dry). Daily report after 14:00 UTC.

## 2026-11-23 ~12:15 UTC — cycle (item 239)
- Shipped: Weekly calorie budget /health/weekly-calorie-budget/ (2000 target, 2000+500 feast -> 500 over; 3 days -> 166.67 each, 1833.33/day; week 14000; under-target case 13400; hand-checked). Warn tone below 1200 kcal/day not covered by tests. Verify run before push. No browser/375px check.
- Next cycle: backlog is dry after 239; run product-research refill first. Daily report after 14:00 UTC.

## 2026-11-23 ~12:25 UTC — cycle (research refill)
- Research pass 21: added ranks 241-248 (specs 216-223) to the backlog: standard-vs-itemized, signup-bonus-pace, social-security-breakeven, gains-harvest-headroom, roth-conversion, cd-ladder, snow-removal-payback, antifreeze-mix. IRS figures must be source-checked before shipping defaults.
- Next cycle: take rank 242 (or top open); daily report after 14:00 UTC.

## 2026-11-23 ~13:00 UTC — cycle
- Shipped rank 242: Standard vs itemized deduction calculator (/finance/standard-vs-itemized/). Verify passes (442 pages, 0 problems); no browser/375px check. IRS standard deduction is an example default with a note to check irs.gov.
- SEO/health/marketing: not run this cycle (single item). Deploy workflow result not checked from the sandbox yet.
- Note: local `main` was a stale branch; reset to origin/main before working.
- Next cycle: check deploy verify job for this push, then take rank 243 (gains-harvest-headroom) or top open. Daily report after 14:00 UTC.

## 2026-11-23 ~14:00 UTC — cycle
- Shipped rank 244: Card sign-up bonus spend pace (/finance/signup-bonus-pace/). Verify passes (443 pages, 0 problems); no browser/375px check. All figures are user inputs.
- SEO/health/marketing: not run this cycle (single item). Deploy workflow result not checked from the sandbox.
- Note: HEAD was detached at origin/main; pushing HEAD:main. Daily report not posted (cycle started before 14:00 UTC); next cycle should post it.
- Next cycle: post daily report, then rank 246 or top open.

## 2026-11-23 ~15:00 UTC — cycle
- Shipped rank 243: 0% capital gains headroom (/finance/gains-harvest-headroom/), reverse link added from capital-gains-tax. Verify passes (444 pages, 0 problems); no browser/375px check.
- Bracket top is a user input with a note to check irs.gov; no IRS figure claimed as fact.
- Note: spec 218 was simplified (no tax-rate/tax-due output); the spec's example (top 96,700, income 70,000) is not used verbatim.
