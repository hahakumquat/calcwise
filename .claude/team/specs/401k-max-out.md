# Spec: 401(k) Max-Out Planner

File: `src/calculators/finance/401k-max-out.ts` (slug `401k-max-out`, category `finance`). Status: ready to build, about 1 day.

Slug note: the backlog table says `finance/401k-max-out`, while its "Spec A" text says `max-out-401k`. This spec uses `401k-max-out` (matches the table and this file name). If any slug-must-start-with-a-letter rule exists in `src/pages/[category]/[slug].astro` or the tests, the engineer should say so rather than rename silently.

## 1. Problem and audience

"How much do I need to put in each paycheck to hit the 401(k) limit by December 31?" People with a few paychecks left this year, who either want the full tax break or the full employer match. Evidence (see `.claude/team/backlog.md`, rank 1): seasonal, year-end deadline is about six weeks out and returns every January and every autumn. Demand score is an estimate only; no Reddit or GitHub evidence was reachable. Existing `take-home-pay` and `retirement` already use `LIMIT_401K`, so no new tax data is needed.

## 2. Limits: what is verified

Verified (web search against IRS Notice 2025-67 and the IRS 2026 limits announcement, and matches the repo constants):
- Employee elective deferral limit 2026: $24,500 = `LIMIT_401K` in `src/lib/helpers/finance.ts`.
- Age 50+ catch-up 2026: $8,000 = `CATCHUP_401K` in the same file. Total $32,500.

Do not hardcode numbers; import both constants. Total with catch-up = `LIMIT_401K + CATCHUP_401K`.

Deliberately OUT of scope for v1 (per task instruction: base limit plus the 50+ catch-up only):
- The age 60-63 "super catch-up" ($11,250 reported in sources; not used here). The age select therefore has two options. In copy, say that people aged 60 to 63 "may be allowed a higher catch-up, so check your plan". Do not print a figure. Candidate for v2 after an owner decision.
- The Roth catch-up wage threshold for high earners. Copy may only say "high earners may be required to make catch-up contributions as Roth; check with your plan". No dollar figure.
- Section 415(c) total limit (employee plus employer). NEEDS VERIFICATION before it appears anywhere; leave out. The FAQ answer says only that employer match does not count toward the employee deferral limit and that a separate, higher overall limit exists.
- 2027 limits: only projected, not official. Do not use. `TAX_YEAR` stays 2026. Use `TAX_YEAR` in copy so the tax-year refresh (backlog rank 4) updates it.

## 3. Inputs (6 visible, none collapsed)

| id | label | type | default | min / max | info (tooltip) |
| --- | --- | --- | --- | --- | --- |
| `salary` | Annual gross salary | number, prefix `$`, step 1000 | 85000 | 0 / none | Your yearly pay before taxes. Used to show the plan as a percent of each paycheck. |
| `frequency` | Pay frequency | select (not segmented, 4 options) | `biweekly` | - | How often you are paid. Options: weekly (52), every two weeks (26), twice a month (24), monthly (12). No "annual". |
| `ytd` | Contributed so far this year | number, prefix `$`, step 500 | 15000 | 0 / none | Your year-to-date 401(k) total from your latest pay stub or plan website. Count your own pre-tax and Roth contributions, not your employer match. |
| `left` | Paychecks left this year | number, integer, step 1 | 6 | 0 / 60 | Count only paychecks that will arrive on or before Dec 31 (a paycheck dated Jan 2 belongs to next year). Ask payroll if unsure. |
| `age` | Your age this year | select, segmented | `under50` | - | Options: `under50` "Under 50", `50plus` "50 or older". If you turn 50 any time this year you qualify for the catch-up. |
| `current` | Current contribution rate | number, suffix `% of pay`, step 0.5, optional | blank | 0 / 100 | Optional. The percent of each paycheck you contribute now. Leave blank to skip the "current pace" comparison. |

Defaults produce an interesting result at once: room 9,500, needed 1,583.33 per paycheck, 48.4% of gross, tone warn.

Pay periods map: weekly 52, biweekly 26, semimonthly 24, monthly 12 (a local `PERIODS` const like `take-home-pay.ts`; copy the same label wording).

Because `left` does not depend on `frequency`, do not try to auto-fill it from the calendar (compute() must stay pure and examples must be stable). Put the hint in `help`: "Roughly 6 if you are paid every two weeks in mid-November."

## 4. compute() logic

```
salary, ytd, left (integer, floor), periods, age -> limit = LIMIT_401K + (age==='50plus' ? CATCHUP_401K : 0)
room        = max(0, limit - ytd)
perPaycheck = left > 0 ? room / left : (room > 0 ? null : 0)
grossPer    = salary / periods
pctNeeded   = perPaycheck != null && grossPer > 0 ? perPaycheck / grossPer : null   // fraction
reachable   = room === 0 || (left > 0 && pctNeeded != null && pctNeeded <= 1)
overBy      = max(0, ytd - limit)
currentEnd  = current != null ? ytd + (current/100) * grossPer * left : null   // projected year-end total at current pace
shortfall   = currentEnd != null ? max(0, limit - currentEnd) : null            // what current pace leaves on the table (capped at room)
```

Invalid: salary null or <= 0, ytd null or < 0, left null or < 0 -> return `{ perPaycheck: null }`. If `current` is set and > 100 -> error "Contribution rate cannot be over 100%." If `ytd > limit`, not an error; room 0, tone good, note explains the excess (see below).

Cap `currentEnd` for display at `limit` (plans stop at the limit); keep `shortfall` honest by computing from the uncapped value.

## 5. Outputs

| id | label | format | primary | info |
| --- | --- | --- | --- | --- |
| `perPaycheck` | Needed per paycheck | currency | yes | The dollar amount to contribute from each remaining paycheck to land exactly on the limit by Dec 31. |
| `pctNeeded` | Share of each paycheck | percent, precision 1 | no | That amount divided by your gross pay per paycheck. Set this percentage in your plan website. |
| `room` | Room left under the limit | currency | no | The limit for you this year minus what you have already put in. |
| `limit` | Your limit this year | currency | no | The IRS employee limit, plus the age 50+ catch-up if you chose it. |
| `reachable` | Can you get there by Dec 31? | text | no | "Yes" or "No". "No" means even 100% of your remaining paychecks is not enough. |
| `projected` | Year-end total at your current pace | currency | no. `showWhen` cannot test an optional number input, so return `null` when `current` is blank (engineer to confirm in `calc-client.ts` that null outputs are hidden or shown as a dash; if not, add a small renderer fix or drop `projected`/`gap` outputs and keep only the chart series). | What you would have contributed by Dec 31 if you keep your current rate. |
| `gap` | Left on the table at current pace | currency | no | Limit minus projected year-end total, never below zero. Null when `current` is blank. |

Exactly one primary: `perPaycheck`. When `room` is 0 it shows $0.00 and the badge explains.

### Tone and badge rules

First matching rule wins. Badge text must be short.

| Condition | tone | badge |
| --- | --- | --- |
| `ytd >= limit` | good | `Already maxed out` |
| `left === 0` and room > 0 | bad | `Out of paychecks` |
| `pctNeeded > 1` | bad | `Can't get there` |
| `pctNeeded > 0.5` | bad | `Steep climb` |
| `pctNeeded > 0.3` | warn | `Doable, but tight` |
| `pctNeeded > 0.15` | ok | `Very doable` |
| otherwise | good | `Easy win` |

Default inputs give 48.4%, which is under 50%, so they land on `Doable, but tight` / warn.

Colour is never the only signal: badge text and the numeric percent always show.

### `note` (one line; first matching)

- Maxed: "You have already reached the {TAX_YEAR} limit of $X. Check your plan stops your deferrals so you do not exceed it." If `ytd > limit`: "You are $N over the limit. Contact your plan; excess deferrals usually must be withdrawn by April 15 to avoid double taxation. Estimate only, not tax advice."
- Out of paychecks: "No paychecks left this year, so a normal payroll change cannot add more. Some plans allow a lump sum from a bonus; ask HR."
- Unreachable: "Even 100% of your remaining paychecks is not enough. A year-end bonus election may help, if your plan allows it."
- Otherwise: "Contribute $X per paycheck ({p}% of gross) for the remaining N paychecks. Estimate; check your plan's rules, and spread it out evenly in case your employer match is calculated per paycheck."

### `steps`

1. "Your {TAX_YEAR} limit = $24,500" (or "= $24,500 + $8,000 catch-up = $32,500").
2. "Room left = limit - contributed so far = $9,500".
3. "Per paycheck = $9,500 / 6 = $1,583.33".
4. "Gross per paycheck = $85,000 / 26 = $3,269.23, so the plan is 48.4%".
5. If `current` set: "At {c}% you will reach about $X by Dec 31, leaving $Y of room unused."

## 6. Result stage and charts (schema: `LineChart` plus `ScaleChart`, no schema change)

Result stage (the tone card at the top): big number is `perPaycheck`, label "per paycheck to max out", badge per table, sub-line `pctNeeded` of gross and room left. On a 375px phone the stage plus the first chart start above the fold.

Return `chart: [line, scale]`, in that order.

1. Hero: `LineChart` type `area`? Use `type: 'line'`.
   - Title: "Your path to the limit".
   - `x`: paycheck numbers `0..left` (numbers, so `xLabel: 'Paychecks from now'`, `xFormat: { format: 'integer' }`). Cap the x array via `sampleIdx` if `left > 60` (max input is 60, so no sampling is needed).
   - `yLabel: 'Contributed'`, `yFormat: CURRENCY`.
   - Series 1 "Max-out plan": `ytd + k * perPaycheck` for k in `0..left` (flat if reachable is false: use the same formula but cap nothing, so it visibly crosses the limit line when unreachable is not shown; when `perPaycheck` is null, return no chart).
   - Series 2 "Current pace" (only when `current` set): `min(limit, ytd + k * currentPerPaycheck)`.
   - Series 3 "Limit": constant `limit` for every x (a flat reference line). This is the only way to show the limit since markers are vertical only.
   - `markers`: `[{ x: left, label: 'Dec 31' }]`.
   Screenshot goal: a rising line meeting a flat ceiling, with a visible gap if the current pace falls short.
2. `ScaleChart` "How hard is it?": `min 0`, `max 100`, `value` = `min(100, pctNeeded * 100)`, `valueLabel` e.g. "48% of each paycheck", bands: 0-15 "Easy" good, 15-30 "Very doable" ok, 30-50 "Tight" warn, 50-100 "Steep" bad. `format: { format: 'percent', suffix: '' }`; use `suffix: '%'` with unitless numbers (values are 0-100 not fractions) to avoid ambiguity. Skip this chart when `perPaycheck` is 0 or null.

## 7. Share image (1080x1920, produced by `src/scripts/share-card.ts` from badge, primary and charts)

- Badge pill: short, e.g. "Doable, but tight".
- Big number: `$1,583.33` with label "per paycheck to max my 401(k)".
- Hero chart: the line chart above (rising line to the limit line). It must be legible when scaled to 1080 wide: at most three series, and series names short ("Max-out plan", "Current pace", "Limit").
- Social copy suggestions for the marketing agent, not for the page: "i need $1,583 per paycheck to max my 401k. my paycheck is $3,269. T_T" (pairs with the percent output).

Engineer: check the generated card with defaults and with the "Can't get there" case (percent above 100: the scale value clamps to 100, number still shows true value).

## 8. Content outline

`title`: "401(k) Max-Out Calculator" (seoTitle "401(k) Max-Out Calculator: Per Paycheck" is 39 characters plus " | CappyCalc" = 51; ok under 60).
`description`: `How much to contribute per paycheck to max out your ${TAX_YEAR} 401(k) by Dec 31. See the dollar and percent amount, with a chart of your path.` (check 70-160 chars).
`keywords`: max out 401k, 401k per paycheck, how much to contribute to 401k, 401k contribution limit 2026, 401k catch-up, 401k year end.
`updated`: today's date of the build.
`popular`: false.

`content.formula`:
- "Room = limit - contributed so far"
- "Per paycheck = room / paychecks left"
- "Share of pay = per paycheck / (annual salary / pay periods per year)"

`content.body` (plain English, 3 short paragraphs):
1. What the limit is: the IRS caps what you can put into a 401(k) from your own pay each calendar year: `money(LIMIT_401K,0)`, plus `money(CATCHUP_401K,0)` more if you are 50 or older. It resets on January 1 and applies to you as a person, across all your jobs, not to each plan.
2. How the planner works: it takes what is left and divides it by the paychecks left. Check the paycheck count; it is the number most people get wrong.
3. Practical tip: spreading the amount evenly keeps you eligible for the employer match on every paycheck. Some plans only match per paycheck, so cramming it all into the last two checks can cost you free money. Contributions from your own pay do not include the match.

`content.sections` (each its own H2):
- "Catch-up contributions if you are 50 or older": age 50+ adds `$8,000` (verified), total `$32,500`. Mention that people aged 60 to 63 may be allowed a higher catch-up and that higher earners may be required to make catch-ups as Roth; "check your plan". No figures for those.
- "Traditional vs Roth: does it change the limit?" The limit is the same for both and shared between them; traditional lowers this year's taxable income, Roth does not. Link to `take-home-pay` to see paycheck impact.
- "How to change your contribution" (3 steps: plan website or HR portal, set a percent or dollar amount, confirm it takes effect before the next paycheck; changes may take one to two pay cycles).

`content.faq` (at least 5; answers must match what the calculator computes):
1. "Does the 401(k) limit include my employer match?" No. The limit covers your own deferrals; the match is on top. A separate overall limit covers you plus your employer; this calculator does not use it. (Do not state its dollar figure until verified.)
2. "Is the limit per job or per person?" Per person across all 401(k), 403(b) and similar plans in a calendar year. Tell the user to add up YTD from all jobs before entering.
3. "What happens if I contribute more than the limit?" Excess deferrals are generally taxed in the year contributed, and unless withdrawn by April 15 of the next year are taxed again when withdrawn. Contact your plan administrator. Estimate, not tax advice.
4. "When does the limit reset?" On January 1; it is per calendar year, regardless of fiscal or plan year.
5. "How many paychecks do I have left?" Count paychecks that will be paid on or before Dec 31, not period end dates. Biweekly payers sometimes have 27 paychecks in a year (a "third paycheck month"); monthly payers in mid-November have 2 left (Nov 30, Dec 31) if paid at month end.
6. "Should I stop contributing once I hit the limit?" Plans stop automatically in many cases, and some employers stop matching when you hit the limit early. Spread the contributions evenly to keep the full match.
7. "Does the catch-up count if I turn 50 late in the year?" Yes, if you turn 50 at any point in the calendar year.

Verify each answer against the actual output when writing examples.

`content.sources`:
- IRS: "401(k) limit increases to $24,500 for 2026, IRA limit increases to $7,500" (https://www.irs.gov/newsroom/401k-limit-increases-to-24500-for-2026-ira-limit-increases-to-7500)
- IRS Notice 2025-67 (KPMG summary of Notice 2025-67: https://kpmg.com/us/en/taxnewsflash/news/2025/11/notice-2025-67-increased-retirement-plan-contribution-limits-2026.html; engineer to replace or add the irs.gov notice PDF link if reachable).
- IRS "Retirement topics: 401(k) and profit-sharing plan contribution limits" (irs.gov; engineer to confirm URL before adding, otherwise omit).

## 9. Related calculators

`related: ['take-home-pay', 'retirement', 'income-tax', 'savings-goal', 'fire-number']`. All must exist as slugs (verify; `savings-goal` is in `src/calculators/finance/`, `fire-number` in `src/calculators/fire/`). Add a link to `401k-max-out` from `take-home-pay` and `retirement` `related` arrays in a follow-up change; this spec does not edit them.

## 10. Mobile layout (375px)

- Order: result stage card (badge, big per-paycheck number, percent + room sub-line), then the line chart, then inputs, then secondary outputs, then the scale chart, per the existing widget layout (do not customise it; `layout` stays default).
- Six inputs fit in one screen height; `age` is a segmented control, `frequency` a dropdown.
- Line chart needs at most 3 legend entries; labels short so they do not wrap.
- Number inputs use `inputmode` decimal as the widget does by default; `left` is an integer.

## 11. Acceptance checks (frontend-engineer must verify)

1. `npm test` prints `0 problem(s)`; `npm run check`, `npm run build`, `npm run smoke` pass.
2. Imports `LIMIT_401K` and `CATCHUP_401K` from `src/lib/helpers/finance.ts`; no hard-coded 24500 / 8000 / 32500 outside FAQ strings built with `money()`.
3. Title plus " | CappyCalc" is at most 60 characters; meta description 70-160 characters; one `<h1>`.
4. Examples in the file (hand-checked), all with `perPaycheck` tolerance 0.01:
   - `salary 85000, frequency biweekly, ytd 15000, left 6, age under50, current null` -> `room 9500`, `limit 24500`, `perPaycheck 1583.333333`, `pctNeeded 0.484314` (1583.3333 x 26 / 85000), `reachable` "Yes".
   - `salary 85000, biweekly, ytd 25000, left 6, age 50plus, current null` -> `limit 32500`, `room 7500`, `perPaycheck 1250`, `pctNeeded 0.382353`.
   - `salary 85000, biweekly, ytd 26000, left 6, age under50` -> `room 0`, `perPaycheck 0`, tone good, badge "Already maxed out".
   - `salary 60000, monthly, ytd 0, left 2, age under50` -> `perPaycheck 12250`, `pctNeeded 2.45` (12250 / 5000), `reachable` "No", badge "Can't get there".
   - `salary 85000, biweekly, ytd 15000, left 6, under50, current 10` -> `projected 15000 + 0.10 x 3269.2308 x 6 = 16961.538`, `gap 7538.46` (limit 24500 - 16961.54).
5. Tone/badge table behaves as listed for each branch, including `left = 0` with room (no divide by zero) and `ytd > limit` (note about excess, room 0).
6. Result and chart update as you type; default state shows stage and hero chart without scrolling at 375px; no horizontal scroll.
7. Share image renders with badge, big number, and the line chart readable in light and dark mode.
8. Every input and output has an `info` tooltip; no use of the 60-63 super catch-up figure, Roth threshold figure, 415(c) figure or any 2027 figure.
9. Dark mode and contrast use existing tokens only; tone is also conveyed by badge text.
10. No new files besides the calculator, and no edits to unrelated files in this change.

## 12. Deviations from the backlog's Spec A (flag to owner)

- Dropped the age 60-63 and 64+ options (instruction: base plus 50+ only). The 60-63 figure appeared in web results but is out of scope for v1.
- Dropped employer match input and the estimated federal tax saved (needs filing status and more inputs; keeps it under the day estimate and within about 6 inputs). Match is covered as a tip and FAQ. Candidate for v2.
- Added `current` (optional) as "current contribution %" to show the gap, as the backlog suggested.
- Slug conflict noted at the top.
