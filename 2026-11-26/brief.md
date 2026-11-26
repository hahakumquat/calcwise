# Marketing brief 2026-11-26: thanksgiving, road trips and "nerd calculators" shipped today (lease mileage overage, shooting efficiency, decibel sum, video bitrate, snow water equivalent)

Lead calculator: https://cappycalc.com/finance/lease-mileage-overage/ (reel, Reddit, X2). Carousel and X1 use the newly shipped nerd set: https://cappycalc.com/sports/shooting-efficiency/ , https://cappycalc.com/math/decibel-sum/ , https://cappycalc.com/developer/video-bitrate-size/ , https://cappycalc.com/everyday/snow-water-equivalent/ . Not used today (no good hook, spare below): pool-volume, density.
Timing: Thu 2026-11-26 is US Thanksgiving (family, long drives, loud dinner tables, football and basketball on in the background). Black Friday is tomorrow, 11-27 (calendar slot kept). Calendar slot for today was empty, so it takes the newly shipped calculators. Angle: "the number is the punchline", self-deprecating, zero advice.
Status: owner posts manually. Nothing is auto-posted. Media renders from the live site.
Note: marketing could not run the live site here, numbers come from each calculator's `examples` or default values in `src/calculators/` on main, hand-checked below. Media must read the real result off the live calculator; if any value differs, tell marketing before rendering.

## Verified numbers

| Case | Exact inputs | Real result |
|---|---|---|
| Lease mileage overage | annual 12000, term 36, elapsed 30, driven 33000, fee 0.25 | allowance 36,000; pace 1,100/mo; projected 39,600; over 3,600; fee $900; stay-under pace 500 mi/mo |
| Shooting efficiency | FGM 10, 3PM 3, FGA 20, FTM 5, FTA 6 (calculator defaults) | points 28; FG% 50.0; eFG% 57.5; TS% 61.8; points per FGA 1.40 |
| Decibel sum | levels 80, 80, 80 | combined 84.77 dB (+4.77 over the loudest) |
| Decibel sum, 2 equal | levels 60, 60 | 63.01 dB (+3.01) |
| Video bitrate to size | mode size, video 8000 kbps, audio 128 kbps, 10 min | 609.6 MB, total 8,128 kbps, 60.96 MB/min |
| Video bitrate for a size cap | mode bitrate, audio 128, 10 min, target 300 MB | max total 4,000 kbps, max video 3,872 kbps |
| Snow water equivalent | depth 12 in, ratio 10:1, area 1000 ft2 (defaults) | water 1.2 in; 6.24 lb/ft2; 6,240 lb total |

Hand-check: lease 12,000 x 36 / 12 = 36,000; 33,000 / 30 = 1,100; x 36 = 39,600; over 3,600 x $0.25 = $900; (36,000 - 33,000) / 6 = 500. Shooting: 2x10 + 3 + 5 = 28; eFG (10 + 1.5) / 20 = .575; TS 28 / (2 x (20 + 0.44x6 = 22.64)) = 28 / 45.28 = .618. Decibels: 3 x 10^8 = 10^(8.4771) so 80 + 10 log10(3) = 84.77. Video: (8000 + 128) x 600 / 8000 = 609.6 MB (decimal MB). Snow: 12 / 10 = 1.2 in x 5.2 lb/ft2 per inch = 6.24; x 1000 = 6,240.
These are example inputs, not typical figures. Lease fees and allowances come from your own contract, the lease calculator says so. Describe the math, never tell anyone what to do.

## 1. Reel / TikTok (about 13 s, 9:16)
Hook text (0 to 1.5 s): "me driving to every thanksgiving like my lease has no mileage cap T_T"
Beats (one still each, reel-01 to reel-05):
1. 0 to 1.5 s, text card: "me driving to every thanksgiving like my lease has no mileage cap T_T" (hook, no calculator yet)
2. 1.5 to 4.5 s, lease-mileage-overage inputs (form): "the setup" / "12k miles a year, 36 month lease, 33,000 miles at month 30, $0.25 a mile (example numbers)"
3. 4.5 to 8 s, result card (stage): "projected overage fee: *$900*" / "i'm 3,600 miles over, i'm cooked"
4. 8 to 11 s, chart (miles at lease end, allowance vs projected): "36,000 allowed, 39,600 on pace" / "the odometer does not care that it's a holiday"
5. 11 to 13 s, end card: "check your own pace" / cappycalc.com/finance/lease-mileage-overage
Audio mood: cozy kitchen-chaos holiday-dinner clatter with a hopeful acoustic strum that cuts to a flat "oh no" silence on the result, no vocals (royalty-free or in-app trend, no named tracks).
Caption: lease mileage math with example numbers: 12,000 miles a year on a 36-month lease is 36,000 allowed. 33,000 miles in 30 months is 1,100 a month, which projects to 39,600, so 3,600 over, and at $0.25 a mile that is $900. staying under would mean about 500 miles a month for the last 6. your contract sets the real fee. https://cappycalc.com/finance/lease-mileage-overage/
Hashtags: #moneytok #thanksgiving #carlease #personalfinance #relatable #financetok

## 2. Instagram carousel (5 slides, 4:5): "calculators i made this week that nobody asked for"
1. Cover: "i made calculators nobody asked for *T_T*" / "(example inputs, links in the caption)"
2. Shooting efficiency (result card, 10 / 3 / 20 / 5 / 6): "10 of 20 shooting is *57.5%* eFG" / "and 61.8% true shooting, free throws and threes matter"
3. Decibel sum (result card, levels 80, 80, 80): "three relatives at 80 dB = *84.77 dB*" / "sound adds on a log scale, not 240"
4. Video bitrate size (result card, size mode, 8000 / 128 / 10): "10 min of 8 Mbps video = *609.6 MB*" / "that's why the upload limit said no"
5. Snow water equivalent (result card, 12 / 10 / 1000): "12 in of snow on 1,000 ft2 is *6,240 lb*" / "on a 10:1 ratio, wet snow weighs more"
Caption: five-ish random calculators, example inputs. basketball: 10 makes with 3 threes on 20 shots and 5 of 6 free throws is 57.5% eFG and 61.8% TS. sound: three 80 dB sources add to 84.77 dB. video: 8,000 + 128 kbps for 10 minutes is 609.6 MB. snow: 12 inches at 10:1 is 1.2 in of water, 6.24 lb per ft2. https://cappycalc.com/sports/shooting-efficiency/ https://cappycalc.com/math/decibel-sum/ https://cappycalc.com/developer/video-bitrate-size/ https://cappycalc.com/everyday/snow-water-equivalent/
Hashtags: #nerdtok #mathtok #calculator #basketball #thanksgiving

## 3. X posts
X1 (with image x-1.png, decibel sum result card for 80, 80, 80): "thanksgiving math: three people talking at 80 dB each is not 240 dB, it's 84.77 dB. sound adds on a log scale (two equal sources is +3.01 dB). i made the calculator, free: https://cappycalc.com/math/decibel-sum/"
X2 (text only): "lease mileage math: 12,000 mi/yr x 3 years = 36,000 allowed. 33,000 driven by month 30 = 1,100/mo, projects to 39,600. 3,600 over x $0.25 = $900. your contract sets the real rate. i made this, free: https://cappycalc.com/finance/lease-mileage-overage/"

## 4. Reddit draft
Subreddit: r/leasehackr, as a plain answer in a thread asking how excess mileage is projected or what it could cost (not a standalone post). Rule to check: owner must re-read the current r/leasehackr rules before posting; I could not read them from this environment, so assume self-promotion and link rules are strict, post the math with no link, and only add the "I made this" line if the current rules and thread clearly allow it.
Draft: "It's just three steps, so you can check your own. Allowance = yearly miles x term in months / 12. Pace = miles driven / months elapsed, projected = pace x term. Fee = (projected - allowance) x per-mile fee in your contract. Example with made-up numbers: 12,000 mi/yr, 36 months, 33,000 driven at month 30, $0.25/mi. Allowance 36,000, pace 1,100/mo, projected 39,600, so 3,600 over and about $900. To land at the allowance you'd average (36,000 - 33,000) / 6 = 500 mi/mo for the last 6 months. It assumes you keep the same pace, your contract has the real fee and any buffer, and some lessors sell extra miles up front, so ask yours. Disclosure: I made a free calculator that does this sum, in case it helps: https://cappycalc.com/finance/lease-mileage-overage/"

## Spare (not used today)
- Shooting efficiency, 8 of 16, no threes, no free throws: points 16, FG% 50, eFG% 50, TS% 50, 1.00 points per attempt. https://cappycalc.com/sports/shooting-efficiency/
- Shooting efficiency, 5 of 10 all threes: 15 points, eFG% 75, TS% 75, 1.50 per attempt. https://cappycalc.com/sports/shooting-efficiency/
- Lease, returning now: 10,000/yr, 24 months, 18,000 driven, $0.30: allowance 20,000, over 0, fee $0. https://cappycalc.com/finance/lease-mileage-overage/
- Video, 90 min at 5,000 + 192 kbps: 3,504.6 MB (3.5 GB). https://cappycalc.com/developer/video-bitrate-size/
- Snow, 6 in at 15:1: 0.4 in water, 2.08 lb/ft2. https://cappycalc.com/everyday/snow-water-equivalent/
- Pool volume and density: https://cappycalc.com/construction/pool-volume/ and https://cappycalc.com/math/density/ (check examples in the .ts files before using).
