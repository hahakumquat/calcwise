# Backlog

Last full refresh: 2026-11-15.

## What I learned this week

- Evidence limits: GitHub issues on hahakumquat/calcwise returned 0 issues (open or closed), so there is no direct user feedback yet. Reddit and competitor sites could not be reached through search (zero Reddit results came back), so every demand score below rests on seasonal timing and on the existing-competitor results I did see, not on Reddit threads. Treat demand scores as estimates.
- Timing: US open enrollment is closing now (HSA/FSA elections), and the 401(k) year-end deadline is about six weeks away. We have take-home pay, income tax, RSU tax and FIRE tools but nothing for HSA/FSA or "how much per paycheck to max out my 401(k)". Tax-season tools (bonus withholding, self-employment tax, capital gains) are the next gap, Jan to Apr.
- Limits status: 2027 HSA limits are official ($4,500 self-only, $9,000 family, $1,000 catch-up at 55+; see https://www.withflex.com/blog/irs-raises-2027-hsa-contribution-limits and https://www.mercer.com/insights/law-and-policy/2027-hsa-hdhp-and-excepted-benefit-hra-figures-set/). The 2027 health FSA limit ($3,500, $700 carryover) is reported as released Nov 5, 2026 but I only saw it in secondary reports, so verify against the IRS revenue procedure before shipping. The 2027 401(k) limit is only projected ($25,500, Milliman) and not official as of this search; `TAX_YEAR` in `src/lib/helpers/finance.ts` stays 2026 until then.

## Open (ranked)

Priority = demand x fit x (social + adsense) / (6 - effort). Scores: demand, fit, social, adsense, effort each 1-5.

| Rank | Item | Type | Score | Evidence | Owner | Status |
| --- | --- | --- | --- | --- | --- | --- |
| 0 | **Fix: chart marker labels collide with lines** (e.g. "Dec 31" on `finance/401k-max-out` sits on top of the limit line at the top-right; check other charts with end-of-range markers). Owner spotted it in the first rendered marketing pack. Labels should offset away from the series they mark or sit below the plot area. | fix | — | https://github.com/hahakumquat/calcwise/blob/marketing/2026-11-15/carousel-03.png | frontend-engineer | shipped 2026-11-15 (labels now above plot) |
| 1 | **401(k) max-out planner** (`finance/401k-max-out`): "what % or $ per paycheck do I need to hit the limit by Dec 31?" See spec A below. d3 f5 s2 a5 e5 | new calculator | 105 | Seasonal: year-end deadline ~6 weeks out; evergreen again every January. Existing `take-home-pay` already holds `LIMIT_401K`, so no new tax data needed. No Reddit evidence reached (search returned none). | ux-designer then frontend-engineer | shipped 2026-11-15 |
| 2 | **Bonus tax calculator** (supplemental 22% flat vs aggregate method, take-home of a bonus): reuse `federalIncomeTax` / `ficaTax`. d4 f4 s4 a5 e4 | new calculator | 72 | Seasonal: year-end bonus and Q1 bonus season. Funny screenshot ("my $10k bonus is $6.9k"). No linked evidence reached. | ux-designer | shipped 2026-11-15 |
| 3 | **HSA and FSA tax savings calculator** (`finance/hsa-fsa-savings`): spec B below. d4 f4 s2 a5 e4 | new calculator | 56 | Open enrollment now. Search for HSA/FSA calculators returned many competitors (e.g. https://www.optum.com/en/financial-services/planning-tools/fsa-calculator.html, https://ehm-tech.pages.dev/paycheck-calculator/tools/hsa-contribution-calculator), so demand exists. 2027 limits: https://www.withflex.com/blog/irs-raises-2027-hsa-contribution-limits | ux-designer then frontend-engineer | shipped 2026-11-15 (2027 FSA limit still "reported"; both years use 2026 tax tables) |
| 4 | Tax-year 2027 refresh: brackets, standard deduction, SS wage base, 401(k)/IRA limits in `helpers/finance.ts`, and copy that says 2026 | improvement | 45 | d3 f5 s1 a5 e4. Blocked until the IRS publishes 2027 401(k) figures (projected $25,500 only: https://401kspecialistmag.com/2027-401k-contribution-limits-all-but-official-25500-expected/). Retest examples with hand-checked numbers. | backend-engineer | blocked, re-check weekly |
| 5 | Social-ready "verdict" copy pass on FIRE results (badges that make funny screenshots) | improvement | n/a | social strategy (carried over) | ux-designer | open |
| 6 | Self-employment tax calculator (SE tax 15.3% x 92.35%, half deductible, QBI optional) for tax season prep | new calculator | 48 | d4 f3 s2 a5 e3. Seasonal Jan-Apr; no evidence reached. | ux-designer | shipped 2026-11-15 (/finance/self-employment-tax/) |
| 7 | Capital gains tax calculator (short vs long term, 0/15/20%, NIIT 3.8%) incl. RSU sale at vest | new calculator | 48 | d4 f4 s2 a5 e3. Pairs with existing `rsu-tax`. No evidence reached. | ux-designer | shipped 2026-11-15 (/finance/capital-gains-tax/; 2026 thresholds from Rev. Proc. 2025-32, single sale only) |
| 8 | Roth vs traditional 401(k)/IRA calculator | new calculator | 45 | d3 f5 s2 a5 e3. Evergreen FIRE topic; 2026 Roth catch-up rule for high earners adds a hook. | ux-designer | shipped 2026-11-16 (/finance/roth-vs-traditional/; rate-based, annuity-due convention) |
| 9 | W-4 / refund estimator ("will I owe in April?") | new calculator | 40 | d4 f3 s3 a5 e2. Peaks Jan-Apr; larger effort (withholding tables). | ux-designer | shipped 2026-11-16 (/finance/tax-refund-estimator/; federal only, standard deduction, no FICA/state) |
| 10 | Rent affordability / 50-30-20 budget calculator (Gen-Z money first) | new calculator | 36 | d4 f4 s4 a3 e4. Shareable ("rent is 61% of my take-home, i'm cooked"). No evidence reached. | ux-designer | shipped 2026-11-16 (/finance/rent-affordability/; simplified take-home, no pre-tax inputs) |
| 11 | Wire real ad slots once the owner supplies AdSense unit ids (until then Auto ads) | ads | n/a | owner action | seo-ads | blocked on owner |
| 12 | Debt payoff planner: snowball vs avalanche (extends `credit-card-payoff`) | new calculator | 30 | d3 f4 s3 a5 e2 | ux-designer | shipped 2026-11-16 (/finance/debt-payoff-planner/; up to 4 debts) |
| 13 | Emergency fund calculator (months of expenses) | new calculator | 30 | d3 f4 s3 a3 e5 | ux-designer | shipped 2026-11-16 (/finance/emergency-fund/; source links generic, unchecked) |
| 14 | Student loan payoff / extra payment calculator | new calculator | 27 | d3 f3 s2 a5 e3 | ux-designer | shipped 2026-11-16 (/finance/student-loan-payoff/; payment optional, defaults to standard payment) |
| 15 | Roth IRA growth / IRA limits calculator | new calculator | 27 | d3 f4 s2 a5 e3 | ux-designer | shipped 2026-11-16 (/finance/roth-ira/; 2026 limits via IRS Notice 2025-67 search results, no 375px check) |
| 16 | Net-worth percentile by age (shareable) using public Fed SCF data; needs a cited, current source | new calculator | 24 | d3 f4 s5 a3 e2 | ux-designer | open, needs source check |
| 17 | New Year fitness: steps-to-calories and "weeks to goal weight" shareable card, cross-link `weight-loss-goal`, `tdee`, `macro` | improvement | 20 | Seasonal: New Year fitness (Jan). No evidence reached. | seo-ads | open |
| 18 | Back-to-school extras: college cost/529 savings calculator (Aug 2027 timing) | new calculator | 18 | Seasonal only; revisit June 2027. | ux-designer | parked |

## Specs for items 1 and 3

### A. 401(k) max-out planner (rank 1)

- Slug `max-out-401k`, category `finance`, copy a neighbour such as `take-home-pay.ts`. Import `LIMIT_401K` (24,500 for 2026) from `src/lib/helpers/finance.ts`.
- Inputs: annual salary (for % output), already contributed this year ($), employer match % of salary (optional), pay frequency (reuse PERIODS from take-home-pay), paychecks remaining this year (number, default from frequency, e.g. 6 for biweekly mid-Nov), age band select (under 50 / 50-59 / 60-63 / 64+), current contribution % (optional, to show the gap).
- Limit by age (verify against IRS Notice 2025-67 before shipping): base 24,500; age 50+ catch-up 8,000; age 60-63 "super catch-up" 11,250 instead of 8,000; 64+ is the standard 50+ catch-up. Total 2026 limit = base + catch-up. Note in content that employees with prior-year FICA wages above $150,000 must make catch-up contributions as Roth in 2026 (check the IRS final rule wording; say "may").
- Formula: remaining room = limit - contributed YTD; per paycheck needed = max(0, room) / paychecks remaining; as % of pay per paycheck = per paycheck needed / (salary / periods per year). Flag if the % is above 100 or if the plan may stop at the limit (some employers stop matching once you hit the limit early, so spread evenly to keep the match: tip text, no tracking).
- Outputs: room left (primary), needed per paycheck, needed % of each paycheck, whether it is reachable, estimated federal tax saved at the marginal rate (optional, reuse `federalIncomeTax`).
- Examples (hand check): limit 24,500, contributed 15,000, 6 paychecks left -> room 9,500, 1,583.33 per paycheck. With 50+ catch-up: 32,500 limit, contributed 25,000, 6 left -> 1,250 per paycheck. Contributed above the limit -> room 0.
- FAQ: does the limit include employer match (no, the 415(c) total 72,000-ish limit does; verify the 2026 figure), is it per person across jobs (yes), what if I pass the limit (excess deferral rules and April 15 correction), does it reset Jan 1.
- Sources: IRS 401(k) limits page and the IRS 2026 limits announcement (https://www.shrm.org/topics-tools/news/benefits-compensation/irs-announces-401k-contribution-limit-2026).
- Cross-link `take-home-pay`, `retirement`, `income-tax`. Social hook: "i need $1,583 per paycheck to max my 401k. my paycheck is $1,400. T_T".

### B. HSA and FSA tax savings (rank 3, but time-critical: open enrollment ends now, so build it right after A)

- Slug `hsa-fsa-savings`, category `finance`. Choose plan year with a select (2026 or 2027) because open enrollment is for 2027.
- Inputs: coverage (self-only / family), age 55+ (catch-up), HSA contribution, health FSA contribution, dependent care FSA (optional; limit changed to $7,500 for 2026 under the 2025 tax law, verify and check 2027), annual salary, filing status, state rate, employer HSA contribution (optional).
- Limits: HSA 2026 $4,400 / $8,750 and 2027 $4,500 / $9,000, catch-up $1,000 (55+). Health FSA 2026 $3,400, 2027 reported $3,500 with $700 carryover (verify, see learned section). Cap any entry at the limit and say so in `note`.
- Formula: tax saved = contributions x (federal marginal rate + state rate + FICA 7.65%, or 1.45% above the Social Security wage base). HSA via payroll skips FICA; an HSA contributed directly (not via payroll) does not, so add a toggle "through payroll". Marginal rate from `federalIncomeTax(taxable, status)` computed before and after deductions: saving = tax(without) - tax(with). Reuse `ficaTax`.
- Outputs: total tax saved (primary), federal, FICA, state, effective cost of each $1 contributed, plus a use-it-or-lose-it note for FSA.
- Examples: salary 85,000 single, HSA 4,400 via payroll, state 5% -> compute by hand using the same helpers as `take-home-pay`; FICA part alone is 4,400 x 7.65% = 336.60.
- Sources: IRS Rev. Proc. for 2027 HSA limits, IRS Rev. Proc. 2026-35 (FSA), IRS Publication 969.

## Done

- 2026-11-15 — 401(k) max-out calculator (/finance/401k-max-out/). Follow-up: add it to `related` on take-home-pay and retirement; v2 = employer match + tax saved, 60-63 catch-up once verified.
- 2026-11-15 — Take-home pay page: worked-example FAQs.
- 2026-11-13 — Link-preview image, category guides and SEO titles/descriptions site-wide.
- 2026-11-15 — Full research pass completed (this refresh).
