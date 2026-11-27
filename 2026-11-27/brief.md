# Marketing brief 2026-11-27: black friday, the sneaky edition (shrinkflation, toilet paper value, holiday savings plan, layover buffer, percentage points)

Lead calculator: https://cappycalc.com/finance/shrinkflation/ (reel, X1, carousel slide 2). Also used: https://cappycalc.com/everyday/toilet-paper-value/ , https://cappycalc.com/finance/holiday-savings-plan/ , https://cappycalc.com/everyday/layover-buffer/ , https://cappycalc.com/math/percentage-points/ , https://cappycalc.com/finance/breakeven-win-rate/ (Reddit-free spare below).
Timing: Fri 2026-11-27 is Black Friday. The shelf tag is the thing people look at, so the angle is "the tag says one number, the per-unit math says another". Holiday savings fits the 4 weeks left to Dec 25. The layover checker fits the Sunday-after-Thanksgiving travel crunch. Calendar slot was "budget / savings-goal (pick one)", swapped for the calculators that shipped in the last 24h (all marked updated 2026-11-27 in `src/calculators/`).
Status: owner posts manually. Nothing is auto-posted. Media renders from the live site.
Note: marketing could not open the live site here. Numbers come from each calculator's `examples` or defaults in `src/calculators/` on main, hand-checked below. Media must read the real result off the live calculator; if any value differs, tell marketing before rendering. All inputs are example numbers, not real products or prices. Describe the math, never tell anyone what to do.

## Verified numbers

| Case | Exact inputs (input ids) | Real result |
|---|---|---|
| Shrinkflation, reel and X1 | oldSize 16, oldPrice 4, newSize 14, newPrice 4.2 | old $0.25/oz; new $0.30/oz; effective increase 20%; size cut 12.5%; sticker +5% |
| Shrinkflation, carousel (defaults) | oldSize 16, oldPrice 4, newSize 14.5, newPrice 4 | old $0.25/oz; new about $0.2759/oz; effective increase about 10.34% (10.345%); size cut 9.375%; sticker 0% |
| Toilet paper value (defaults) | priceA 24, rollsA 24, sheetsA 200, priceB 18, rollsB 12, sheetsB 400 | both 4,800 sheets; A $0.50 per 100 sheets, B $0.375; Pack B better, 25% cheaper per sheet; A $1.00 per roll, B $1.50 per roll |
| Holiday savings plan | target 600, saved 100, weeks 4, rhythm weekly | still to save $500; $125.00 a week; every two weeks $250.00 over 2 deposits |
| Layover buffer (defaults) | arrive 14:10, delay 25, depart 15:20, min 45 | actual arrival 2:35 PM; 45 min to connect; buffer 0 (tight); can absorb 25 min |
| Percentage points (defaults) | old 6.5, new 7 | +0.5 points; relative change +7.6923% (7.69%) |
| Breakeven win rate (defaults, spare) | win 200, loss 100, rate 40 | break-even 33.33%; payoff ratio 2; expected value $20.00 per trade |

Hand-check: shrinkflation 4 / 16 = 0.25; 4.20 / 14 = 0.30; 0.30 / 0.25 - 1 = 20%; cut 1 - 14/16 = 12.5%; sticker 4.2 / 4 - 1 = 5%. Carousel: 4 / 14.5 = 0.275862; 0.275862 / 0.25 - 1 = 10.3448%; cut 1 - 14.5/16 = 9.375%. Toilet paper: A 24 / 4800 x 100 = 0.50; B 18 / 4800 x 100 = 0.375; saving 1 - 0.375 / 0.5 = 25%. Holiday: 600 - 100 = 500; 500 / 4 = 125; ceil(4 / 2) = 2 deposits, 500 / 2 = 250. Layover: 14:10 = 850 min, +25 = 875 (2:35 PM), 15:20 = 920, 920 - 875 = 45, 45 - 45 = 0 buffer, absorb 920 - 850 - 45 = 25. Points: 7.0 - 6.5 = 0.5; 0.5 / 6.5 = 7.6923%. Breakeven 100 / (200 + 100) = 1/3; EV 0.4 x 200 - 0.6 x 100 = 20.

## 1. Reel / TikTok (about 12 s, 9:16)
Hook text (0 to 1.5 s): "black friday: the tag says +5%. the bag says *lol* T_T"
Beats (one still each, reel-01 to reel-05):
1. 0 to 1.5 s, text card: "black friday: the tag says +5%. the bag says *lol* T_T" (hook, no calculator yet)
2. 1.5 to 4.5 s, shrinkflation inputs (form): "the setup" / "16 oz at $4.00 becomes 14 oz at $4.20 (example numbers)"
3. 4.5 to 8 s, result card (stage): "real price increase: *+20%*" / "the tag said 5%, i'm cooked"
4. 8 to 10.5 s, chart (sticker price change vs size cut vs price per unit): "tag +5%, bag -12.5%, per ounce *+20%*" / "same chips, smaller flex"
5. 10.5 to 12 s, end card: "check your own bag" / cappycalc.com/finance/shrinkflation
Audio mood: bright store-speaker jingle energy with a hopeful bounce that records-scratches into a flat deadpan beat on the result, no vocals (royalty-free or in-app trend, no named tracks).
Caption: shrinkflation math with example numbers: 16 oz at $4.00 is $0.25 an ounce. 14 oz at $4.20 is $0.30 an ounce. the tag moved 5% but the price per ounce moved 20%, and the bag is 12.5% smaller. it's just arithmetic, not a verdict on anyone. https://cappycalc.com/finance/shrinkflation/
Hashtags: #moneytok #blackfriday #shrinkflation #personalfinance #relatable #financetok

## 2. Instagram carousel (6 slides, 4:5): "black friday math nobody asked for"
1. Cover: "black friday math nobody asked for *T_T*" / "(example inputs, links in the caption)"
2. Shrinkflation (result card, defaults 16 / 4 / 14.5 / 4): "same $4 tag, smaller bag: *+10.34%* per oz" / "16 oz to 14.5 oz, the tag did not move"
3. Toilet paper value (result card, defaults): "24 rolls vs 12 rolls: pack B is *25% cheaper* per sheet" / "4,800 sheets each, $0.50 vs $0.375 per 100"
4. Holiday savings plan (result card, 600 / 100 / 4 weeks / weekly): "$600 budget, $100 saved, 4 weeks left = *$125 a week*" / "christmas is a deadline, not a vibe"
5. Layover buffer (result card, defaults): "land 25 min late, 45 min to connect, buffer *0 min*" / "tight. very tight. sunday travel is a sport"
6. Percentage points (result card, 6.5 to 7): "6.5% to 7% is +0.5 points, but *+7.69%*" / "points and percent are not the same thing"
Caption: six-ish random calculators, example inputs. shrinkflation: 16 oz at $4 to 14.5 oz at $4 is $0.25 to about $0.276 an ounce, +10.34%. toilet paper: $24 for 24 rolls of 200 vs $18 for 12 rolls of 400 is $0.50 vs $0.375 per 100 sheets. holiday savings: $500 still needed over 4 weeks is $125 a week. layover: landing at 2:35 PM for a 3:20 PM flight leaves 45 min. rates: 6.5% to 7% is +0.5 points, +7.69%. https://cappycalc.com/finance/shrinkflation/ https://cappycalc.com/everyday/toilet-paper-value/ https://cappycalc.com/finance/holiday-savings-plan/ https://cappycalc.com/everyday/layover-buffer/ https://cappycalc.com/math/percentage-points/
Hashtags: #blackfriday #mathtok #calculator #shrinkflation #relatable

## 3. X posts
X1 (with image x-1.png, shrinkflation result card for 16 / 4 / 14 / 4.20): "black friday math: 16 oz at $4.00 becomes 14 oz at $4.20. the tag is up 5%, but price per ounce goes $0.25 to $0.30, up 20%, with the bag 12.5% smaller. i made the calculator, free: https://cappycalc.com/finance/shrinkflation/"
X2 (text only): "4 weeks to dec 25. if a holiday budget is $600 and $100 is already saved, $500 is left. over 4 weekly deposits that's $125 each (no interest counted). i made this, free: https://cappycalc.com/finance/holiday-savings-plan/"

## 4. Reddit draft
Subreddit: r/shrinkflation, as a plain answer in a thread asking how to work out the real price increase when a package shrinks (not a standalone post). Rule to check: owner must re-read the current r/shrinkflation rules before posting; I could not read them from this environment, so assume self-promotion and link rules apply, post the math with no link, and only add the "I made this" line if the current rules and thread clearly allow it.
Draft: "You can check it yourself with two divisions. Price per unit = price / size, before and after. Real increase = new price per unit / old price per unit - 1. Example with made-up numbers: 16 oz at $4.00 becomes 14 oz at $4.20. Before: $4.00 / 16 = $0.25 per oz. After: $4.20 / 14 = $0.30 per oz. $0.30 / $0.25 - 1 = 20%, even though the tag only moved 5% ($4.20 / $4.00 - 1). The package is 12.5% smaller (1 - 14/16). This only counts price per unit, it says nothing about recipe or quality changes. Use the same unit for both sizes. Disclosure: I made a free calculator that does this sum, in case it helps: https://cappycalc.com/finance/shrinkflation/"

## Spare (not used today)
- Breakeven win rate, win 200, loss 100, rate 40: break-even 33.33%, ratio 2, EV $20.00 per trade. https://cappycalc.com/finance/breakeven-win-rate/
- Breakeven win rate, win 100, loss 100, rate 45: break-even 50%, EV -$10.00 per trade. https://cappycalc.com/finance/breakeven-win-rate/
- Shrinkflation, 12 ct at $5 to 10 ct at $5: $0.4167 to $0.50 per count, +20%, size cut 16.667%. https://cappycalc.com/finance/shrinkflation/
- Toilet paper, A $15 12 rolls x 250 vs B $30 24 rolls x 200: $0.50 vs $0.625 per 100 sheets, A 20% cheaper. https://cappycalc.com/everyday/toilet-paper-value/
- Layover, arrive 17:00, 50 min late, depart 17:45, min 40: land 5:50 PM, 5 min after departure, buffer -45, likely missed. https://cappycalc.com/everyday/layover-buffer/
- Percentage points, 4 to 3: -1 point, -25%. https://cappycalc.com/math/percentage-points/
