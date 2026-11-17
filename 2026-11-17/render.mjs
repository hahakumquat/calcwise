// Render 2026-11-17 pack. Run by .github/workflows/media.yml with MEDIA_LIB pointing at scripts/media/lib.mjs.
const { frames, slide, cover, shareCard, done } = await import(process.env.MEDIA_LIB);
const dir = new URL('.', import.meta.url).pathname;
const here = (f) => new URL(f, import.meta.url).pathname;
const RHW = '/everyday/real-hourly-wage/';
const w = { pay: 52000, hours: 40, weeks: 50, days: 5, minutes: 60, extra: 0, costs: 2500 };
const cpu1 = { price: 120, running: 0, resale: 0, uses: 10, alt: 8 };
const cpu2 = { price: 200, running: 20, resale: 20, uses: 100, alt: 5 };
const cc = { miles: 20, days: 250, mpg: 25, price: 3.2, daily: 10, minutes: 30, wear: 0.1 };
const b532 = { income: 4000, needs: 2300, wants: 1100 };
const da = { income: 3200, bills: 1700, savings: 400, spent: 0, days: 30 };

await frames(dir, [
  { caption: 'my $26/hr job actually pays *$22/hr*' },
  { path: RHW, set: w, focus: 'form', caption: 'the setup', sub: '$52k take-home, 40 h, 1 h round-trip commute, $2.5k work costs' },
  { path: RHW, set: w, focus: 'stage', caption: '*$22.00* real hourly wage. the commute took 5 unpaid hours a week' },
  { path: RHW, set: w, focus: 'chart', caption: 'real wage 15% lower. the job takes 45 hours, not 40' },
  { caption: 'do your own math, it takes 10 seconds', sub: 'cappycalc.com/everyday/real-hourly-wage' },
], { prefix: 'reel' });

await cover(here('carousel-01.png'), { title: '5 tiny calculators, *5 uncomfortable numbers*', sub: 'exact inputs on every slide' });
await slide(here('carousel-02.png'), { path: '/finance/cost-per-use/', set: cpu1, caption: 'that $120 thing used 10 times is *$12.00 a use*', sub: 'break-even is 15 uses' });
await slide(here('carousel-03.png'), { path: '/finance/cost-per-use/', set: cpu2, caption: 'the same logic at 100 uses: *$2.00 a use*', sub: '$200 + $20 upkeep - $20 resale, vs $5 alternative' });
await slide(here('carousel-04.png'), { path: '/everyday/commute-cost/', set: cc, caption: 'commuting 20 miles each way costs *$4,780 a year*', sub: '$1,280 fuel, $10 parking a day, $0.10/mi wear, 250 hours' });
await slide(here('carousel-05.png'), { path: '/finance/budget-50-30-20/', set: b532, caption: '$4,000 take-home, $2,300 needs, $1,100 wants = *15% saved*', sub: 'the target is 20% ($800), left over $600' });
await slide(here('carousel-06.png'), { path: '/finance/daily-spending-allowance/', set: da, caption: 'after bills and savings: *$36.67 a day*', sub: '$3,200 income, $1,700 bills, $400 savings, 30 days. cappycalc.com/finance/daily-spending-allowance' });

await slide(here('x-1.png'), { path: '/everyday/commute-cost/', set: cc, caption: '20 miles each way: *$4,780 a year*', size: [1600, 900] });
await shareCard(here('story.png'), { path: RHW, set: w });
await done();
