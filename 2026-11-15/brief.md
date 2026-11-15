# Marketing brief 2026-11-15: 401(k) Max-Out Calculator

Calculator: https://cappycalc.com/finance/401k-max-out/
Status: owner posts manually. Nothing is auto-posted. Media not produced in this sandbox (no ffmpeg/Playwright); `media` agent to produce from the live site once the page is confirmed live.

## Verified numbers (from src/calculators/finance/401k-max-out.ts examples, hand-checked there)

2026 employee limit $24,500; age 50+ catch-up $8,000 (limit $32,500). Source: IRS, linked on the calculator page.

| Case | Inputs | Result |
|---|---|---|
| A (default) | salary $85,000, every two weeks, $15,000 contributed, 6 paychecks left, under 50 | $1,583.33 per paycheck, 48.4% of $3,269.23 gross paycheck, badge "Doable, but tight", room left $9,500 |
| B (50+) | same, but $25,000 contributed, age 50 or older | $1,250.00 per paycheck, 38.2% of gross, limit $32,500, room $7,500 |
| C (current pace) | case A plus current rate 10% | year-end total about $16,961.54, $7,538.46 of room left unused |

Use only these. Do not invent other inputs/results; if you want a new one, run the real calculator first and screenshot it.

Context hook: mid-November, about 6 biweekly paychecks left, year-end contribution deadline talk, bonus season. Calculator "updated" date is today.

## Voice and guardrails
Gen-Z, self-deprecating, lowercase ok, no mascot. The calculator result is the punchline. Describe the math, never tell anyone what they should contribute. Always say "per the calculator" / "estimate". Caption disclaimers are not a substitute for avoiding advice, so avoid "you should" and "everyone needs to".

---

## 1. Reel / TikTok (12 s, 9:16)

**Hook text (0 to 1.5 s):** "my 401k said i have 6 paychecks to fix my whole year"

**Beats (screen recording of the real calculator, phone width, dark mode ok):**
1. 0.0-1.5 s: Hook text over calculator page, inputs blurred slightly.
2. 1.5-4 s: Inputs visible: salary 85,000, every two weeks, contributed so far 15,000, paychecks left 6, under 50. Tap-type each number quickly (cuts, not real time).
3. 4-7 s: Result stage card appears: $1,583.33 per paycheck. Zoom on it. Text pop: "per paycheck. PER. PAYCHECK."
4. 7-9 s: Zoom on 48.4% and the badge "Doable, but tight". Text: "48.4% of my check. doable but tight. that's one word for it"
5. 9-11 s: Switch age to "50 or older" and contributed to 25,000: result drops to $1,250. Text: "50+ catch-up said hold my coffee" (describes calculator, not a person's real story).
6. 11-12 s: End card: "cappycalc.com/finance/401k-max-out" and "free, runs in your browser".

**On-screen text summary:** hook; "$1,583.33 per paycheck"; "48.4% of the check"; "Doable, but tight"; "50+ case: $1,250"; "inputs: $85k salary, biweekly, $15k so far, 6 checks left"; small "estimate, 2026 limit $24,500".

**Audio mood:** playful, slightly panicked lo-fi beat that resolves into a deadpan "oh well" drop on the result. Use a trending sound chosen by the owner in-app, or royalty-free. No named tracks embedded.

**Caption:** the 401k limit reset my brain. per the calculator, $15k in and 6 paychecks left means $1,583.33 each to hit the $24.5k limit. that's 48.4% of a check lol. cooked but now i know the number. (example inputs: $85k salary, biweekly. estimate, check your plan.) try yours: https://cappycalc.com/finance/401k-max-out/

**Hashtags:** #401k #personalfinance #moneytok #financetok #adulting #fintok

---

## 2. Instagram carousel (5 slides, 4:5)

Each slide uses the calculator's share/result card for real numbers (or screenshot of the stage card).

1. Cover text: "how much per paycheck to max out your 401k? i did the math so you don't have to open 14 tabs". Visual: brand cover, no calculator card.
2. "the setup": inputs card (salary $85,000, biweekly, $15,000 so far, 6 paychecks left). Text: "2026 limit: $24,500. room left: $9,500."
3. "the result": result card, $1,583.33 per paycheck. Text: "9,500 / 6 = 1,583.33. 48.4% of a $3,269.23 gross check. 'Doable, but tight' (the calculator's words, not mine)."
4. "the 50+ plot twist": result card with age 50+, $25,000 contributed: $1,250 per paycheck, limit $32,500. Text: "catch-up adds $8,000 if you turn 50 this year."
5. "if you're on autopilot": result with current rate 10% (case C): $7,538.46 of room unused at current pace. Text: "this is the 'left on the table' number. no judgement, just math. link in bio / cappycalc.com/finance/401k-max-out"

**Caption:** 401k math for the november panic. every number here comes straight from the calculator with the inputs on slide 2. estimate only, your plan and pay dates decide the real thing. https://cappycalc.com/finance/401k-max-out/
**Hashtags:** #401k #personalfinance #moneytips #adulting #financetok

---

## 3. X posts

**Post 1 (text, 232 chars):**
plugged my 401k into a max-out calculator. $15k in, 6 paychecks left, 2026 limit $24,500 = $1,583.33 per paycheck. that's 48.4% of the check. the badge said "doable, but tight" and honestly rude. https://cappycalc.com/finance/401k-max-out/

**Post 2 (with image: result card for case B, $1,250 per paycheck):**
same calc, 50+ edition: $25k in, catch-up limit $32,500, 6 checks left = $1,250 per paycheck (38.2%). catch-up math is just "7.5k / 6" in a trench coat. https://cappycalc.com/finance/401k-max-out/

(Both under 280 chars. Image alt text: "CappyCalc result card: $1,250.00 per paycheck, 38.2% of gross, 2026 limit $32,500".)

---

## 4. Reddit draft

**Target:** r/personalfinance, in a thread where someone asks how to figure out per-paycheck contributions near year end (or the relevant megathread), not as a standalone post. Alternative: r/401k.
**Self-promotion rule:** I could not load Reddit from this sandbox, so I have not verified the current rules. Owner must read the subreddit sidebar/rules before posting. r/personalfinance has historically restricted promotion of your own sites/products; if the rule bans links to something you made, post the math-only version below with no link. Reddit-wide rule of thumb: disclose affiliation, and do not post the same thing across many subs.

**Draft answer (math only, link line optional):**

> To figure out the per-paycheck number, it's three steps:
>
> 1. Limit for the year minus what you've put in so far. For 2026 the employee limit is $24,500 (plus $8,000 catch-up if you turn 50 this year). Your match doesn't count toward it.
> 2. Divide by the number of paychecks that will actually be paid on or before Dec 31. This is where people slip, e.g. a check dated Jan 2 is next year.
> 3. Divide that by your gross pay per paycheck to get the percent your plan site asks for.
>
> Example: $85k salary, paid every two weeks, $15,000 contributed, 6 checks left: 24,500 - 15,000 = 9,500; 9,500 / 6 = $1,583.33 per check; gross per check is 85,000 / 26 = $3,269.23, so 48.4%. Same setup at 50+ with $25,000 in: (32,500 - 25,000) / 6 = $1,250.
>
> Two caveats: some plans only match per paycheck, so cramming contributions can change the match, and plans can take a pay cycle or two to apply a change. Check your plan docs.
>
> *(Optional, only if the sub allows:)* Disclosure: I made a free calculator that does this arithmetic, no sign-up: https://cappycalc.com/finance/401k-max-out/ . The sources (IRS) are linked on the page.

---

## Notes for media agent
- Record from the live page at 375px width. Use the exact inputs above. Capture result stage card and chart; use the built-in share-card image for X post 2 and carousel.
- Confirm the page is live (HTTP 200) and shows $1,583.33 / 48.4% before anyone posts.

## Rolling 2-week calendar (proposed; `.claude/team/marketing-calendar.md` lives on main and was not touched in this run)
- Nov 15-16: 401(k) max-out (this brief)
- Nov 17-19: take-home-pay or paycheck-reality-check angle (payday/year-end)
- Nov 20-22: savings-goal, "holiday fund" (needs real calculator run first)
- Nov 23-26: Black Friday week, "budget before the sale" using 50/30/20 or similar existing calculators
- Nov 27-30: Cyber Monday / year-end, revisit 401(k) with the bonus angle if the calculator supports it (it only supports even per-paycheck plans; do not claim a bonus-election feature)
- Dec 1-7: New Year resolution lead-in: fire-number / coast fire
- Dec 8-14: 401(k) deadline reminder remix (fewer paychecks left; run real numbers with left = 3 or 2 before writing)
Each entry must use a real result from the calculator.
