# Marketing brief 2026-11-25: tax stuff nobody explained (early withdrawal penalty, Saver's Credit, home sale exclusion, QCD)

Lead calculator: https://cappycalc.com/finance/early-withdrawal-penalty/ (reel, X1, Reddit, carousel slides 2-3). Also https://cappycalc.com/finance/savers-credit/ (carousel 4, X2), https://cappycalc.com/finance/home-sale-exclusion/ (carousel 5) and https://cappycalc.com/finance/qcd-tax-value/ (carousel 6, Giving Tuesday teaser), all shipped on main in the last day or two.
Timing: Wed 2026-11-25, pre-Thanksgiving, year-end tax-planning season, Giving Tuesday is next Tue 12-01. Calendar slot was "bonus after-tax payday" (bonus tax); swapped for the newly shipped calculators, bonus tax stays on 12-04. Angle: "the tax rule i found out about too late", the number is the punchline. Not repeated from 11-15 to 11-24.
Status: owner posts manually. Nothing is auto-posted. Media renders from the live site.
Note: marketing could not reach cappycalc.com from this environment (no live check), numbers below come from each calculator's `examples` in `src/calculators/finance/` on main, hand-checked. Media must read the real result off the live calculator; if any value differs, tell marketing before rendering.

## Verified numbers

| Case | Exact inputs | Real result |
|---|---|---|
| Early withdrawal penalty | amount 10000, penalty 10%, federal 22%, state 5%, pre-tax on | penalty $1,000, federal $2,200, state $500, total cost $3,700, cash you keep $6,300, effective cost 37% |
| Early withdrawal, Roth case | amount 10000, penalty 10%, federal 22%, state 5%, pre-tax off, taxable share 40% | penalty $400, federal $880, state $200, total $1,480, keep $8,520, 14.8% |
| Saver's Credit | contributions 1500, cap 2000, rate 50%, tax before credits 800 | counted $1,500, credit before limit $750, credit $750 |
| Saver's Credit, tax-limited | contributions 3000, cap 2000, rate 20%, tax 300 | counted $2,000, before limit $400, credit $300 |
| Home sale exclusion | price 1,200,000, costs 72,000, purchase 400,000, improvements 50,000, exclusion 500,000, rate 15% | gain $678,000, taxable $178,000, tax $26,700 |
| QCD tax savings | gift 10000, limit 108000, rate 24%, deductible share 0% | counts as QCD $10,000, above limit $0, tax saved $2,400 |

Hand-check: 10,000 x 10% = 1,000; x 22% = 2,200; x 5% = 500; sum 3,700; 10,000 - 3,700 = 6,300; 3,700 / 10,000 = 37%. Roth: taxable 4,000; 400 + 880 + 200 = 1,480. Saver's: 1,500 x 50% = 750 < 800 tax. Home: 1,200,000 - 72,000 - (400,000 + 50,000) = 678,000; - 500,000 = 178,000; x 15% = 26,700. QCD: 10,000 x 24% = 2,400.
These are example inputs, not typical figures. Rates, caps and limits change and eligibility rules apply (the calculators say so in their info text). Describe the math, never tell anyone what to do.

## 1. Reel / TikTok (about 13 s, 9:16)
Hook text (0 to 1.5 s): "me taking $10k out of my 401(k) like it's free T_T"
Beats (one still each, reel-01 to reel-05):
1. 0 to 1.5 s, text card: "me taking $10k out of my 401(k) like it's free T_T" (hook, no calculator yet)
2. 1.5 to 4.5 s, early-withdrawal-penalty inputs (form): "the setup" / "$10,000 out, 10% penalty, 22% federal, 5% state (example numbers)"
3. 4.5 to 8 s, result card (stage): "i get to keep *$6,300*" / "that's 37% gone"
4. 8 to 11 s, chart (where the withdrawal goes): "penalty $1,000, federal $2,200, state $500" / "the account said $10k, the account lied"
5. 11 to 13 s, end card: "check your own numbers" / cappycalc.com/finance/early-withdrawal-penalty
Audio mood: confident "easy money" swagger beat that cuts out to a record-scratch silence on the result, no vocals (royalty-free or in-app trend, no named tracks).
Caption: the math on a $10,000 early withdrawal with example rates: 10% penalty is $1,000, 22% federal is $2,200, 5% state is $500, so $3,700 total and $6,300 kept (37%). your rates and account type change this a lot, a Roth can look very different. https://cappycalc.com/finance/early-withdrawal-penalty/
Hashtags: #moneytok #401k #personalfinance #taxes #relatable #financetok

## 2. Instagram carousel (6 slides, 4:5): "tax rules i found out about too late"
1. Cover: "4 tax things nobody explained to me *T_T*" / "(example inputs, links in the caption)"
2. Early withdrawal penalty (result card, 10000 / 10 / 22 / 5 / pre-tax on): "$10k out = *$6,300* in my pocket" / "$3,700 gone to penalty and tax"
3. Early withdrawal penalty (chart, same inputs): "the penalty is only $1,000 of it" / "tax is the bigger bite"
4. Saver's Credit (result card, 1500 / 2000 / 50 / 800): "$1,500 into retirement = a *$750* credit?" / "on these example inputs, your rate comes from IRS tables"
5. Home sale exclusion (result card, 1200000 / 72000 / 400000 / 50000 / 500000 / 15): "$678k gain, only *$178k* taxable" / "the exclusion does the heavy lifting, tax $26,700"
6. QCD tax savings (result card, 10000 / 108000 / 24 / 0): "a $10k IRA gift to charity saves *$2,400* in tax" / "on example inputs, rules apply, giving tuesday is 12-01"
Caption: four tax rules, example inputs, links in the caption. early withdrawal: $10,000 out with 10% penalty, 22% federal and 5% state leaves $6,300. Saver's Credit: $1,500 counted at a 50% rate is $750 if your tax is at least that. home sale: $678,000 gain minus a $500,000 exclusion is $178,000 taxable, $26,700 at 15%. QCD: $10,000 at a 24% rate with no cash-gift deduction is $2,400 of tax avoided. eligibility and current limits are on the IRS site, this is math with made-up inputs, not advice. https://cappycalc.com/finance/early-withdrawal-penalty/ https://cappycalc.com/finance/savers-credit/ https://cappycalc.com/finance/home-sale-exclusion/ https://cappycalc.com/finance/qcd-tax-value/
Hashtags: #personalfinance #moneytok #taxes #financetok #millennialmoney

## 3. X posts
X1 (with image x-1.png, early withdrawal result card for 10000 / 10 / 22 / 5, pre-tax on): "took $10k out early with a 10% penalty, 22% federal, 5% state: $1,000 + $2,200 + $500 = $3,700 gone, $6,300 kept. 37%. my rates are examples, a Roth works differently. i made it, free: https://cappycalc.com/finance/early-withdrawal-penalty/"
X2 (text only): "saver's credit math: $1,500 into retirement x 50% credit rate = $750, if your tax bill is at least $750. it can't go below zero. your actual rate comes from IRS tables, mine here is an example. i made the calculator: https://cappycalc.com/finance/savers-credit/"

## 4. Reddit draft
Subreddit: r/personalfinance, as a plain answer in a thread asking what an early 401(k) or IRA withdrawal really costs (not a standalone post). Rule to check: owner must re-read the current r/personalfinance rules before posting; the sub restricts self-promotion and calculator links, so the safest route is the math with no link at all, and only add the "I made this" line if the current rules and the thread clearly allow it.
Draft: "The math is simple, so you can check it yourself. Cash kept = withdrawal - (taxable part x penalty rate) - (taxable part x your marginal tax rate) - state tax. Example with made-up rates: $10,000 from a traditional 401(k), 10% additional tax, 22% federal, 5% state. Penalty $1,000, federal $2,200, state $500, total $3,700, so you keep $6,300 (37% gone). A few things change it: the withdrawal stacks on top of your other income so the top slice can land in a higher bracket, some withdrawals have exceptions, and Roth contributions are treated differently from earnings, so check the IRS page on early distributions or ask a tax pro for your case. Disclosure: I made a free calculator that does this sum, in case it helps: https://cappycalc.com/finance/early-withdrawal-penalty/"

## Spare (not used today)
- Early withdrawal, $25,000 pre-tax, 10% penalty, 24% federal, no state: penalty $2,500, federal $6,000, total $8,500, keep $16,500, 34%. https://cappycalc.com/finance/early-withdrawal-penalty/
- Home sale: $900,000 sale, $54,000 costs, $400,000 purchase, $50,000 improvements, $500,000 exclusion: gain $396,000, taxable $0, tax $0. https://cappycalc.com/finance/home-sale-exclusion/
- QCD: $8,000 gift, $5,000 limit, 22% rate, 50% deductible share: $5,000 counts, $3,000 above limit, saved $550. https://cappycalc.com/finance/qcd-tax-value/
- Saver's Credit, tax-limited: $3,000 contributed, $2,000 cap, 20% rate, $300 tax: credit $300 (not $400). https://cappycalc.com/finance/savers-credit/
