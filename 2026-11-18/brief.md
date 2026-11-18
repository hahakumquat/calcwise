# Marketing brief 2026-11-18: thanksgiving week + black friday math

Lead calculators: https://cappycalc.com/finance/discount/ (stacked discount, Black Friday) and https://cappycalc.com/food/turkey-cooking-time/ (Thanksgiving is Thu 2026-11-26).
Also featured (recent ships): percent-difference, mortgage-points, apy-calculator, cagr-calculator.
Status: owner posts manually. Nothing is auto-posted. Media: render from the live site, same flow as 2026-11-17.
Calendar note: self-employment tax moves to 12-09 slot (already listed); today takes the seasonal slot.

## Verified numbers
Taken from each calculator's `examples` in `src/calculators` on main (hand-checked in the source comments) and re-checked by hand here. Media must read the real result off the live calculator; if any value differs from the table, tell marketing before rendering.

| Case | Exact inputs | Real result |
|---|---|---|
| Stacked discount | price 200, discount 30, extra 20, no coupon, no tax | pay $112.00, save $88.00, real total off 44% (not 50%) |
| Stacked discount + coupon | price 200, discount 30, extra 20, coupon 10, tax 8 | price after discounts $102.00, savings $98.00, real total off 49%, final with tax $110.16 |
| Turkey | 16 lb, unstuffed, frozen, serve 5:00 pm | cook 3 h 45 min to 4 h 15 min, oven in 12:15 pm to 12:45 pm, thaw 4 days, safe temp 165F |
| Percent difference | 40 and 60 | 40% difference (avg 50, gap 20); change from first to second is 50% |
| Mortgage points | loan 300000, rate 7, points 1, cut 0.25, 30 yrs, stay 10 | cost $3,000, saves $50.11 a month, break-even 59.9 months, net at 10 yrs +$3,013.58 (ignores what the cash could earn elsewhere) |
| APY | rate 4.5, daily compounding (365), balance 10000 | APY 4.6027%, interest $460.27 |
| CAGR | start 10000, end 25000, 8 years | CAGR 12.13%, total growth 150%, simple average 18.75% a year |

Hand-check: 0.70 x 0.80 = 0.56 so 44% off; 112 - 10 = 102, 98/200 = 49%, 102 x 1.08 = 110.16; 16 lb in the 14-18 lb row (3.75 to 4.25 h), out of oven 4:30 pm, in 12:15 to 12:45; ceil(16/5) = ceil(16/4) = 4 days; |40-60| / 50 = 40%; 2.5^(1/8) = 1.1213.
Estimates only. Describe the math, never tell anyone what to do.

## 1. Reel / TikTok (about 12 s, 9:16)
Hook text (0 to 1.5 s): "30% off + 20% off = 50% off right?? the calculator said no"
Beats (one still each, reel-01 to reel-05):
1. 0 to 1.5 s, text card: "black friday brain: 30% off + 20% off = 50% off" (hook, no calculator yet)
2. 1.5 to 4 s, discount inputs (form): "the setup" / "$200 thing, 30% off, extra 20% off"
3. 4 to 7 s, discount result card (stage): "you pay *$112.00*. real total off: *44%*" / "not 50. i'm cooked T_T"
4. 7 to 10 s, discount result card, second run (price 200, 30, 20, coupon $10, tax 8%): "add a $10 coupon + 8% tax: *$110.16* at checkout" / "49% off before tax"
5. 10 to 12 s, end card: "stacked discounts multiply. check yours" / cappycalc.com/finance/discount
Audio mood: hyped mall-announcement energy that records-scratches to a sad trombone on beat 3 (royalty-free or in-app trend, no named tracks).
Caption: told myself 30% off plus an extra 20% off was 50% off. it's 0.70 x 0.80 = 56% of the price, so 44% off. on a $200 thing that's $112.00 not $100. with a $10 coupon and 8% tax it's $110.16. estimates, your store may stack differently. https://cappycalc.com/finance/discount/
Hashtags: #blackfriday #blackfridaydeals #percentoff #personalfinance #moneytok #mathmemes

## 2. Instagram carousel (5 slides, 4:5): "thanksgiving week, but make it math"
1. Cover: "thanksgiving week numbers, *5 calculators*" / "exact inputs on every slide"
2. Turkey (result card, 16 lb, unstuffed, frozen, 5 pm): "a 16 lb turkey needs *4 days* in the fridge" / "oven in between 12:15 and 12:45 pm for a 5 pm dinner"
3. Discount (result card, 200 / 30 / 20): "30% + 20% off is *44%*, not 50%" / "you pay $112.00, save $88.00"
4. Percent difference (result card, 40 and 60): "40 vs 60 is a *40%* difference but a *50%* change" / "depends which number you start from"
5. CAGR (result card, 10000 to 25000 over 8 yrs): "$10k to $25k in 8 yrs is *12.13% a year*, not 18.75%" / "simple average ignores compounding. cappycalc.com/finance/cagr-calculator"
Caption: five numbers for thanksgiving week, inputs on each slide. all estimates. turkey: https://cappycalc.com/food/turkey-cooking-time/ , discount: https://cappycalc.com/finance/discount/ , percent difference: https://cappycalc.com/math/percent-difference/ , CAGR: https://cappycalc.com/finance/cagr-calculator/
Hashtags: #thanksgiving #blackfriday #turkeyday #mathtok #personalfinance

## 3. X posts
X1 (with image x-1.png, turkey-cooking-time result card): "16 lb turkey, unstuffed, frozen, dinner at 5pm: thaw 4 days in the fridge, oven in between 12:15 and 12:45pm, done at 165F. if you are reading this on thursday morning with a frozen bird i'm so sorry. free calculator, i made it: https://cappycalc.com/food/turkey-cooking-time/"
X2 (text only): "$10k to $25k over 8 years is 12.13% a year (CAGR). the 'simple average' says 18.75%, which is the number that makes me feel good and is wrong. free calculator: https://cappycalc.com/finance/cagr-calculator/"

## 4. Reddit draft
Subreddit: r/mortgages, as a plain answer in a thread asking whether buying points is worth it (not a standalone post). Rule to check: owner must re-read the current r/mortgages rules before posting; most finance subs restrict self-promotion and require disclosure, so the safest route is to give the math first and add the link only with the "I made this" line, or skip the link.
Draft: "The way to compare is break-even: cost of the points divided by the monthly payment saving. Example with made-up but typical numbers: $300,000 loan, 30 years, 7% with no points. One point costs 1% of the loan, $3,000. If it cuts the rate by 0.25% to 6.75%, the payment drops from about $1,995.91 to $1,945.79, a saving of $50.11 a month. $3,000 / $50.11 is about 59.9 months, so it breaks even a bit under 5 years in. If you keep the loan 10 years, the points save about $3,014 net (120 x $50.11 - $3,000). That ignores what the $3,000 could earn elsewhere, and the real rate cut per point varies by lender, so use the number on your loan estimate. This is just the arithmetic, not a recommendation. Disclosure: I made a free calculator that runs this, if useful: https://cappycalc.com/finance/mortgage-points/"

## Spare (not used today)
- APY: 4.5% compounded daily on $10,000 is 4.6027% APY, $460.27 a year. https://cappycalc.com/finance/apy-calculator/
