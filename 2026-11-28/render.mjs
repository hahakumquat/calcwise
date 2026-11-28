const { frames, slide, cover, done } = await import(process.env.MEDIA_LIB);
const out = (f) => new URL('./' + f, import.meta.url).pathname;
const dir = new URL('.', import.meta.url).pathname;

const refi15 = { path: '/finance/student-loan-refinance/', set: { balance: 40000, currentRate: 7, remaining: 10, newRate: 5, newTerm: 15 } };
const refi10 = { path: '/finance/student-loan-refinance/', set: { balance: 40000, currentRate: 7, remaining: 10, newRate: 5, newTerm: 10 } };
const yir = { path: '/finance/year-in-review-return/', set: { start: 50000, end: 62000, flows: 6000, timing: '0.5' } };

await frames(dir, [
  { caption: 'refi offer: payment drops $148 a month. total interest said *lol* T_T' },
  { ...refi15, focus: 'form', caption: 'the *setup*', sub: '$40k at 7%, 10 yrs left. offer: 5% over 15 yrs (example numbers)' },
  { ...refi15, focus: 'stage', caption: 'payment change: *$148 lower*', sub: 'my monthly budget is thriving' },
  { ...refi15, focus: 'chart', caption: 'total interest: $15.7k vs *$16.9k*', sub: 'lower payment, longer loan, +$1,205' },
  { caption: 'check your own *offer*', sub: 'cappycalc.com/finance/student-loan-refinance' },
], { prefix: 'reel' });

await cover(out('carousel-1.png'), { title: 'december money math nobody asked for *T_T*', sub: '(example inputs, links in the caption)' });
await slide(out('carousel-2.png'), { path: '/finance/i-bond-composite-rate/', set: { amount: 5000, fixed: 1, infl: 1.5 }, caption: '1% fixed + 1.5% inflation = *4.02%* a year', sub: 'example rates, check treasurydirect.gov for real ones' });
await slide(out('carousel-3.png'), { path: '/finance/holiday-spending-total/', set: { gifts: 600, travel: 400, food: 250, decor: 80, events: 120, other: 0, last: 1300, card: 1000, apr: 24, payment: 250 }, caption: 'gifts, travel, food: *$1,450* this year', sub: 'up 11.5% from last year\'s $1,300' });
await slide(out('carousel-4.png'), { path: '/finance/bnpl-true-cost/', set: { price: 1200, down: 0, months: 12, apr: 12, fee: 0, late: 0 }, caption: '$1,200 in 12 payments at 12% costs *$79 extra*', sub: 'that\'s 6.6% on top of the price' });
await slide(out('carousel-5.png'), { ...yir, caption: 'portfolio up 24%? real return *11.32%*', sub: '$6,000 of that was my own deposits' });
await slide(out('carousel-6.png'), { ...refi10, caption: '7% to 5% over 10 yrs: payment *$40 lower*', sub: 'interest $4,821 less. term length changes the story' });

await slide(out('x-1.png'), { ...yir, caption: '+24%? the real return is *11.32%*', sub: '$6,000 of the $12,000 was deposits', size: [1600, 900] });
await done();
