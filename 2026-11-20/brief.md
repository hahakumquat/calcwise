# Marketing brief 2026-11-20: one week to black friday, "is this actually a deal" math

Lead calculators: https://cappycalc.com/finance/bnpl-true-cost/ (pay-later cost), https://cappycalc.com/finance/cost-per-use/ (is the doorbuster worth it) and https://cappycalc.com/finance/gift-budget/ (holiday budget; Dec 25 is exactly 5 weeks out).
Timing: Thanksgiving Thu 2026-11-26, Black Friday Fri 2026-11-27. Today (Fri 11-20) is the "deal-hunting brain is warming up" post; 11-18 covered stacked discounts so none of that is repeated. Capital gains (the old 11-20 slot) moves to 12-01 in the calendar.
Status: owner posts manually. Nothing is auto-posted. Media: render from the live site, same flow as 11-18.

## Verified numbers
Taken from each calculator's `examples` in `src/calculators` on main and re-run through the real `compute()` today. Media must read the real result off the live calculator; if any value differs, tell marketing before rendering.

| Case | Exact inputs | Real result |
|---|---|---|
| BNPL with interest | price 1200, down 0, 12 payments, APR 12, fee 0, late 0 | payment $106.62, total $1,279.42, extra $79.42 (6.6% of price), badge "Costs 6.6% more: worth a second look" |
| BNPL with fee | price 1000, down 0, 12 payments, APR 0, fee 50, late 0 | payment $83.33, total $1,050.00, extra $50.00 (5.0%) |
| Cost per use | price 120, running 0, resale 0, uses 10, alternative $8 per use | $12.00 per use, break-even 15 uses, saving -$40, badge "Not worth it yet" |
| Gift budget | total 1000, fixed 200, adults 2, kids 3, kid weight 1.0, weeks 5, spent 250 | $160 per adult and per kid, remaining $750, save $150 a week |

Hand-check: 1200 at 1%/month over 12 = 106.6185 x 12 = 1279.42; 79.42 / 1200 = 6.6%. 1000 + 50 = 1050, 1000 / 12 = 83.33. 120 / 10 = 12, 120 / 8 = 15 uses, 8 x 10 - 120 = -40. (1000 - 200) / (2 + 3) = 160, (1000 - 250) / 5 = 150.
Estimates only. The BNPL numbers are an example plan, not any real provider's terms. Describe the math, never tell anyone what to do.

## 1. Reel / TikTok (about 12 s, 9:16)
Hook text (0 to 1.5 s): "'0% interest' pay later plan. what does it cost me?? (i did the math)"
Beats (one still each, reel-01 to reel-05):
1. 0 to 1.5 s, text card: "me one week before black friday: 'i'll just split it into payments'" (hook, no calculator yet)
2. 1.5 to 4 s, BNPL inputs (form): "the setup" / "$1,200 thing, 12 payments, 12% APR"
3. 4 to 7 s, BNPL result card (stage): "extra cost: *$79.42*" / "$106.62 a month, 6.6% more than the sticker price. i'm cooked T_T"
4. 7 to 10 s, cost-per-use result card (price 120, uses 10, alt 8): "that $120 doorbuster, used 10 times: *$12.00 a use*" / "the thing it replaces costs $8. need 15 uses to break even"
5. 10 to 12 s, end card: "run your own numbers before the sale starts" / cappycalc.com/finance/bnpl-true-cost
Audio mood: cheerful checkout-chime energy that cuts to a long awkward silence on beat 3, then a dry deadpan voice-free beat drop on beat 4 (royalty-free or in-app trend, no named tracks).
Caption: one week to black friday, so here is the math i'm scared of. a $1,200 thing over 12 payments at 12% APR costs $79.42 extra ($106.62 a month, $1,279.42 total). that is 6.6% more. and a $120 doorbuster i'd use 10 times is $12.00 a use, break-even is 15 uses. example numbers only, your plan's terms are what count. https://cappycalc.com/finance/bnpl-true-cost/ and https://cappycalc.com/finance/cost-per-use/
Hashtags: #blackfriday #buynowpaylater #personalfinance #moneytok #financetok #mathmemes

## 2. Instagram carousel (5 slides, 4:5): "pre-black-friday reality check"
1. Cover: "one week to black friday. *3 calculators*, exact inputs on every slide" / "(for the group chat)"
2. Gift budget (result card, total 1000, fixed 200, 2 adults, 3 kids, weight 1.0, 5 weeks, spent 250): "$1,000 holiday budget, 5 people to buy for: *$160 each*" / "after $200 of travel, wrapping and food. 5 weeks to Dec 25"
3. Gift budget (same result card, weekly line): "saving *$150 a week* covers the remaining $750" / "that is the number, not a vibe"
4. BNPL (result card, 1200 / 12 payments / 12% APR): "pay later on $1,200 at 12% APR = *$79.42 extra*" / "6.6% more than the price tag"
5. Cost per use (result card, 120 / 10 uses / $8 alternative): "a $120 deal used 10 times is *$12.00 a use*" / "break-even is 15 uses. cappycalc.com/finance/cost-per-use"
Caption: three black friday numbers, inputs on each slide. all estimates and example plans, not any provider's real terms. gift budget: https://cappycalc.com/finance/gift-budget/ , pay later: https://cappycalc.com/finance/bnpl-true-cost/ , cost per use: https://cappycalc.com/finance/cost-per-use/
Hashtags: #blackfriday #holidaybudget #personalfinance #moneytok #christmasbudget

## 3. X posts
X1 (with image x-1.png, bnpl-true-cost result card for 1200 / 12 / 12%): "pay-later plan on a $1,200 thing, 12 payments, 12% APR: $106.62 a month, $1,279.42 total, $79.42 extra. 6.6% more than the price tag and the monthly number looked so friendly. example plan, not a real provider. free calculator, i made it: https://cappycalc.com/finance/bnpl-true-cost/"
X2 (text only): "$1,000 holiday budget, $200 of it is travel and wrapping, 5 people to buy for, 5 weeks left: $160 each, $150 a week to cover the remaining $750 after spending $250. the group chat said 'we'll figure it out'. free calculator: https://cappycalc.com/finance/gift-budget/"

## 4. Reddit draft
Subreddit: r/personalfinance, as a plain answer in a thread asking how to compare a pay-later plan to paying upfront (not a standalone post). Rule to check: owner must re-read the current r/personalfinance rules before posting. That sub restricts self-promotion and spam, so the safest route is to give the math with no link at all; only add the "I made this" line with the link if the current rules and the thread clearly allow it.
Draft: "Easiest way to compare is to add up everything you pay and subtract the price. Example with made-up numbers: $1,200 purchase, 12 equal monthly payments, 12% APR, no fees. Monthly rate is 1%, so the payment is about $106.62. Times 12 is $1,279.42, so the plan costs about $79.42 extra, roughly 6.6% of the price. If a plan is 0% APR but charges a flat $50 fee on $1,000 over 12 months, the payments are $83.33 and the extra is $50, so 5%. Late fees would be on top of either. The monthly number looking small tells you nothing about the extra, so it helps to look at the total. This is just arithmetic with example numbers, your agreement's real terms are what count. Disclosure: I made a free calculator that does this, in case it helps: https://cappycalc.com/finance/bnpl-true-cost/"

## Spare (not used today)
- Cost per use, the good case: price 200, running 20, resale 20, uses 100, alternative $5 is $2.00 a use, break-even 40 uses, saves $300. https://cappycalc.com/finance/cost-per-use/
