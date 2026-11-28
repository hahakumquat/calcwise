# Marketing brief 2026-11-28: december money math (student loan refinance, year in review return, I bond rate, holiday spending, BNPL)

Lead calculator: https://cappycalc.com/finance/student-loan-refinance/ (reel, carousel slides 6, Reddit). Also used: https://cappycalc.com/finance/year-in-review-return/ (X1, carousel slide 5), https://cappycalc.com/finance/i-bond-composite-rate/ (X2, carousel slide 2), https://cappycalc.com/finance/holiday-spending-total/ (carousel slide 3), https://cappycalc.com/finance/bnpl-true-cost/ (carousel slide 4).
Timing: Sat 2026-11-28 is the day after Black Friday, Cyber Monday is Mon 11-30, December starts Tuesday. The angle is "the payment, the total and the headline number are three different numbers". Year-end fits the performance review of a portfolio (year-in-review return), the refinance and I bond calculators were both updated recently (student loan refinance marked updated 2026-11-28 in `src/calculators/`).
Status: owner posts manually. Nothing is auto-posted. Media renders from the live site.
Note: marketing could not open the live site here. Numbers come from each calculator's `examples` or defaults in `src/calculators/` on main, hand-checked below. Media must read the real result off the live calculator; if any value differs, tell marketing before rendering. All inputs are example numbers, not real offers, rates or portfolios. Describe the math, never tell anyone what to do. I bond rates below are example inputs, not the currently announced Treasury rates; say so in every post.

## Verified numbers

| Case | Exact inputs (input ids; terms are entered in years) | Real result |
|---|---|---|
| Student loan refi, reel (longer term) | balance 40000, currentRate 7, remaining 10 yr, newRate 5, newTerm 15 yr | current payment $464.43; new payment $316.32; payment change $148.12 lower; interest current $15,732.07, new $16,937.14; adds $1,205.07 interest |
| Student loan refi, carousel (defaults, same 10 yr term) | balance 40000, currentRate 7, remaining 10 yr, newRate 5, newTerm 10 yr | current $464.43; new $424.26; change $40.17 a month lower; interest $15,732.07 vs $10,911.45; saves $4,820.62 |
| Year in review return, X1 and carousel | start 50000, end 62000, flows 6000, timing 0.5 (mid-year) | naive balance change 24%; market growth $6,000; real return 11.32% (11.3208%) |
| I bond composite rate | amount 5000, fixed 1, infl 1.5 | composite 4.02%; six months $100.50; a year $201.00; inflation part 3.015% |
| Holiday spending total (defaults) | gifts 600, travel 400, food 250, decor 80, events 120, other 0, last 1300, card 1000, apr 24, payment 250 | total $1,450; +11.5% vs last year (11.54%); 5 payments to clear the card; card interest $53.07 |
| BNPL true cost | price 1200, down 0, months 12, apr 12, fee 0, late 0 | monthly payment $106.62; extra cost $79.42; 6.6% of price |

Hand-check: refi payment = B r / (1 - (1+r)^-n), r = rate / 12. 10 yr at 7%: 464.43 x 120 = 55,732.07, minus 40,000 = 15,732.07 interest. 15 yr at 5%: 316.32 x 180 = 56,937.15, minus 40,000 = 16,937.14; 16,937.14 - 15,732.07 = 1,205.07 more; 464.43 - 316.32 = 148.12 a month. 10 yr at 5%: 424.26 x 120 = 50,911.45, minus 40,000 = 10,911.45; saved 15,732.07 - 10,911.45 = 4,820.62. Year in review: gain = 62,000 - 50,000 - 6,000 = 6,000; denominator = 50,000 + 6,000 x 0.5 = 53,000; 6,000 / 53,000 = 11.32%; naive 12,000 / 50,000 = 24%. I bond: 1 + 2 x 1.5 + 1 x 1.5 / 100 = 4.015, rounded to 4.02; 5,000 x 4.02% / 2 = 100.50. Holiday: 600 + 400 + 250 + 80 + 120 = 1,450; 1,450 / 1,300 - 1 = 11.54%. BNPL: 12 payments of 106.62 = 1,279.42, minus 1,200 = 79.42; 79.42 / 1,200 = 6.6%.

## 1. Reel / TikTok (about 12 s, 9:16)
Hook text (0 to 1.5 s): "refi offer: payment drops $148 a month. total interest said *lol* T_T"
Beats (one still each, reel-01 to reel-05):
1. 0 to 1.5 s, text card: "refi offer: payment drops $148 a month. total interest said *lol* T_T" (hook, no calculator yet)
2. 1.5 to 4.5 s, student loan refinance inputs (form; balance 40000, current rate 7, 10 yr left, new rate 5, new term 15 yr): "the *setup*" / "$40k at 7% with 10 yrs left, offer is 5% over 15 yrs (example numbers)"
3. 4.5 to 8 s, result card (stage): "payment change: *$148 lower*" / "my monthly budget is thriving"
4. 8 to 10.5 s, chart (total interest, current loan vs refinanced): "total interest: $15.7k vs *$16.9k*" / "lower payment, longer loan, +$1,205"
5. 10.5 to 12 s, end card: "check your own offer" / cappycalc.com/finance/student-loan-refinance
Audio mood: relaxed "good news" bounce for the first three beats that deflates into a slow, flat deadpan beat on the interest bars, no vocals (royalty-free or in-app trend, no named tracks).
Caption: refi math with example numbers: $40,000 at 7% with 10 years left is $464.43 a month. at 5% over 15 years it is $316.32 a month, $148.12 lower, but total interest goes from $15,732 to $16,937, up $1,205. same offer over 10 years is $424.26 a month and $4,821 less interest. a longer term changes both numbers. refinancing federal loans with a private lender gives up federal protections. just the arithmetic, not a recommendation. https://cappycalc.com/finance/student-loan-refinance/
Hashtags: #moneytok #studentloans #personalfinance #relatable #financetok #debtfree

## 2. Instagram carousel (6 slides, 4:5): "december money math nobody asked for"
1. Cover: "december money math nobody asked for *T_T*" / "(example inputs, links in the caption)"
2. I bond composite rate (result card, 5000 / 1 / 1.5): "1% fixed + 1.5% inflation = *4.02%* a year" / "example rates, check treasurydirect.gov for real ones"
3. Holiday spending total (result card, defaults): "gifts, travel, food: *$1,450* this year" / "up 11.5% from last year's $1,300"
4. BNPL true cost (result card, 1200 / 0 / 12 / 12 / 0 / 0): "$1,200 in 12 payments at 12% costs *$79 extra*" / "that's 6.6% on top of the price"
5. Year in review return (result card, 50000 / 62000 / 6000 / mid-year): "portfolio up 24%? real return *11.32%*" / "$6,000 of that was my own deposits"
6. Student loan refinance (result card, defaults 40000 / 7 / 10 / 5 / 10): "7% to 5% over 10 yrs: payment *$40 lower*, interest $4,821 less" / "term length changes the story"
Caption: december money math with example inputs, not advice. I bond: 1% fixed with 1.5% six-month inflation is 1 + 2 x 1.5 + 0.015 = 4.015, rounded to 4.02% a year (use the rates from treasurydirect.gov for real bonds). holiday total: $600 gifts + $400 travel + $250 food + $80 decor + $120 events = $1,450, up 11.5% from $1,300. buy now pay later: $1,200 over 12 payments at 12% is $106.62 a month and $79.42 extra. year in review: $50,000 to $62,000 with $6,000 added is 11.32% real, not 24%. refi: $40,000 at 7% to 5% over 10 years is $424.26 a month instead of $464.43. https://cappycalc.com/finance/i-bond-composite-rate/ https://cappycalc.com/finance/holiday-spending-total/ https://cappycalc.com/finance/bnpl-true-cost/ https://cappycalc.com/finance/year-in-review-return/ https://cappycalc.com/finance/student-loan-refinance/
Hashtags: #personalfinance #moneytok #calculator #yearend #relatable

## 3. X posts
X1 (with image x-1.png, year in review return result card for 50000 / 62000 / 6000 / mid-year): "year-end math: $50,000 to $62,000 looks like +24%. but $6,000 of that was deposits. the market part is $6,000, so the real return (mid-year timing, modified Dietz) is 11.32%. i made the calculator, free: https://cappycalc.com/finance/year-in-review-return/"
X2 (text only): "i bond math with example rates, not today's real ones: 1% fixed, 1.5% six-month inflation. 1 + 2 x 1.5 + (1 x 1.5 / 100) = 4.015, rounded to 4.02% a year, about $100.50 for six months on $5,000. i made this, free: https://cappycalc.com/finance/i-bond-composite-rate/"

## 4. Reddit draft
Subreddit: r/StudentLoans, as a plain answer in a thread asking whether a lower refinance payment means paying less overall (not a standalone post). Rule to check: owner must re-read the current r/StudentLoans rules before posting; I could not read them from this environment (reddit blocked), so assume self-promotion and link rules apply, post the math with no link, and only add the "I made this" line if the current rules and thread clearly allow it. Also check the subreddit's rule on financial advice and keep the answer to arithmetic.
Draft: "A lower payment and less total interest are two separate numbers, and a longer term pulls them in opposite directions. Payment = balance x r / (1 - (1 + r)^-n), where r is the rate divided by 12 and n is the number of months. Example with made-up numbers: $40,000 at 7% with 10 years left is $464.43 a month, so total interest is 464.43 x 120 - 40,000 = $15,732. A 5% offer over 15 years is $316.32 a month, which is $148 lower, but total interest is 316.32 x 180 - 40,000 = $16,937, about $1,205 more. The same 5% over 10 years is $424.26 a month and $10,911 of interest, about $4,821 less than staying put. Two caveats the math does not capture: fees, and the fact that refinancing federal loans with a private lender gives up federal protections like income-driven repayment, so look at those separately. Disclosure: I made a free calculator that does this sum, in case it helps: https://cappycalc.com/finance/student-loan-refinance/"

## Spare (not used today)
- Student loan refi, 40000, 7%, 10 yr to 5%, 15 yr: new payment $316.32, change $148.12, interest saved -$1,205.07. https://cappycalc.com/finance/student-loan-refinance/
- Year in review return, same inputs with timing 0 (start of year): 12.00%; timing 1 (end of year): 10.71%. https://cappycalc.com/finance/year-in-review-return/
- I bond, amount 10000, fixed 0, infl 1.25: composite 2.5%, six months $125.00. https://cappycalc.com/finance/i-bond-composite-rate/
- I bond, amount 1000, fixed 0.5, infl -3: composite 0% (floor), six months $0. https://cappycalc.com/finance/i-bond-composite-rate/
- Holiday spending, gifts 1000 only, last 800, card 600, apr 0, payment 200: total $1,000, +25%, 3 payments, $0 interest. https://cappycalc.com/finance/holiday-spending-total/
- BNPL, 1000, down 0, 12 months, 0% APR, fee 50: extra $50, total $1,050, 5%. https://cappycalc.com/finance/bnpl-true-cost/
