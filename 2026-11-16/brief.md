# Marketing brief 2026-11-16: year-end tax numbers (bonus tax lead)

Lead calculator: https://cappycalc.com/finance/bonus-tax/ (recently shipped)
Status: owner posts manually. Nothing is auto-posted. Media rendered by the render workflow from the live site.

## Verified numbers
Computed with each calculator's real `compute()` (tsx) on main, 2026 tables. Spot-checked by hand: SE 80,000 x 0.9235 x 15.3% = 11,303.64; bonus 22% x 10,000 = 2,200, FICA 7.65% = 765; cap gains long: 5,550 at 0% + 14,450 at 15% = 2,167.50; short: 6,500 at 12% + 13,500 at 22% = 3,750.

| Case | Exact inputs | Real result |
|---|---|---|
| Bonus | salary 120000, bonus 10000, single, state 5%, 401k 0% | take-home $6,535 (22% flat method); federal withheld $2,200; FICA $765; state $500; true federal $2,364 so owe about $164 at filing; badge "You keep 65%" |
| Cap gains long | proceeds 50000, basis 30000, long-term, other income 60000, single, state 0% | gain $20,000, tax $2,167.50, keep $17,832.50, 10.8% |
| Cap gains short | same, short-term | tax $3,750, keep $16,250, 18.8% |
| Self-employment | profit 80000, single, no wages, state 5% | SE tax $11,303.64; total tax $22,547.65 (28.2%); set aside $5,636.91 per quarter; badge "Set aside 28%" |
| HSA | year 2026, self-only, under 55, HSA 4400 via payroll, FSA 0, salary 85000, single, state 5% | total tax saved $1,524.60 (federal $968, FICA $336.60, state $220); each $1 really costs $0.65 |
| Roth vs traditional | contribution 10000, now 24%, retirement 22%, 30 years, 7% | Traditional wins by $20,215 ($788,370 vs Roth $768,155) |
| 401(k) | salary 85000, biweekly, ytd 15000, 6 paychecks left, under 50 | $1,583.33 per paycheck (48.4% of gross), "Doable, but tight" (same as yesterday, not featured) |

Only these numbers. All are estimates; describe the math, never tell anyone what to do.

## 1. Reel / TikTok (about 12 s, 9:16)
Hook text (0 to 1.5 s): "my $10k bonus showed up as $6,535"
Beats (one still each, reel-01 to reel-05):
1. 0 to 2 s, text card: "my $10k bonus showed up as *$6,535*"
2. 2 to 4.5 s, bonus-tax inputs (form): "the setup" / "$120k salary, $10k bonus, 5% state"
3. 4.5 to 7.5 s, result card (stage): "*$6,535* take-home. 22% flat withholding, then payroll tax, then state"
4. 7.5 to 10 s, chart: "you keep 65%. the other 35% went on a little trip"
5. 10 to 12 s, end card: "and the real federal tax says i may owe *$164* more" / cappycalc.com/finance/bonus-tax
Audio mood: smug "cha-ching" lo-fi that deflates into a sad trombone-ish wobble on the result (royalty-free or in-app trend, no named tracks).
Caption: my $10k bonus went through the new bonus tax calculator and came out at $6,535 (22% flat withholding, payroll tax, 5% state). the true federal tax is a bit higher so the calculator says i could owe about $164 at filing. estimate, example inputs: $120k salary, single. https://cappycalc.com/finance/bonus-tax/
Hashtags: #bonus #taxes #personalfinance #moneytok #adulting #fintok

## 2. Instagram carousel (6 slides, 4:5)
1. Cover: "year-end tax math, *5 real numbers*" / "same calculator, exact inputs on each slide"
2. Cap gains long-term (result card): "*$2,167.50* tax on a $20k gain held over a year" / sub "$50k sale, $30k basis, $60k other income, single"
3. Cap gains short-term: "same sale held under a year: *$3,750*"
4. Self-employment: "*$22,547.65* total tax on an $80k side hustle" / "28.2%: set aside $5,636.91 a quarter (5% state)"
5. HSA: "an HSA contribution of $4,400 saves about *$1,524.60*" / "$85k salary, payroll, 5% state"
6. Roth vs traditional: "24% now, 22% later, 30 yrs at 7%: traditional wins by *$20,215*"
Caption: five tax numbers from our calculators, with the inputs on each slide. all estimates using 2026 tables, not tax advice. links: cappycalc.com/finance/capital-gains-tax/ , /self-employment-tax/ , /hsa-fsa-savings/ , /roth-vs-traditional/
Hashtags: #taxes #personalfinance #moneytips #freelance #hsa

## 3. X posts
X1 (with image x-1.png): "ran a $10k bonus through a bonus tax calculator: $6,535 take-home after 22% flat withholding, payroll tax and 5% state. the 'true' federal tax is a bit higher, so about $164 owed at filing. (example: $120k salary, single) https://cappycalc.com/finance/bonus-tax/"
X2 (text only): "$80k of freelance profit, 5% state tax, per the calculator: $11,303.64 self-employment tax, $22,547.65 total, about $5,636.91 per quarter. 28.2% of the profit. i made this, free: https://cappycalc.com/finance/self-employment-tax/"

## 4. Reddit draft
Subreddit: r/personalfinance, as a plain answer in a "why was my bonus taxed so much" thread (do not post as a standalone promo). Rule to check: the sub bans self-promotion/spam and requires disclosure of affiliation; owner must re-read the current rules before posting. Safest: answer with the math and add the link only if asked or with a clear "I made this" line.
Draft: "Bonuses are usually withheld at a flat 22% federal rate (supplemental wage method), plus Social Security and Medicare (7.65%) and any state tax. On a $10,000 bonus that is $2,200 + $765 + state (5% = $500), so about $6,535 lands in your account. Withholding is not the final tax: your real federal tax on the extra income can be higher or lower, and the difference settles when you file. In my example (single, $120k salary) the real federal tax on the bonus was about $2,364, roughly $164 more than withheld; with a $60k salary and a $5,000 bonus it goes the other way, about $500 back. Your numbers will differ. Disclosure: I made a free calculator that does this math, if useful: https://cappycalc.com/finance/bonus-tax/"
(Second case: salary 60000, bonus 5000, single, state 0: withheld $1,100 vs true $600, $500 back; real compute output.)
