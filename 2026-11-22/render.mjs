// Render 2026-11-22 pack. Run by .github/workflows/media.yml with MEDIA_LIB pointing at scripts/media/lib.mjs.
const { frames, slide, cover, done } = await import(process.env.MEDIA_LIB);
const dir = new URL('.', import.meta.url).pathname;
const here = (f) => new URL(f, import.meta.url).pathname;
const BF = '/finance/black-friday-deal-check/';
const EM = '/finance/employer-match-calculator/';
const LC = '/finance/lifestyle-creep/';
const GG = '/everyday/group-gift-split/';
const b = { sale: 140, was: 200, typical: 160 };
const e = { salary: 80000, you: 3, rate: 100, cap: 6 };
const l = { pay: 60000, raise: 8, tax: 25, spent: 60, rate: 5, years: 10 };
const g = { price: 90, tax: 8, shipping: 6, card: 4, people: 7 };

await frames(dir, [
  { caption: "'30% off' black friday deal. i did the math T_T" },
  { path: BF, set: b, focus: 'form', caption: 'the setup', sub: 'was $200, sale $140, what it usually costs: $160' },
  { path: BF, set: b, focus: 'stage', caption: 'real discount: *12.5%*', sub: "the sign says 30%. the 'was' price was doing a lot of work" },
  { path: BF, set: b, focus: 'chart', caption: 'advertised saving $60. real saving *$20*', sub: 'same item, same sale, two different numbers' },
  { caption: 'check your own deal', sub: 'cappycalc.com/finance/black-friday-deal-check' },
], { prefix: 'reel' });

await cover(here('carousel-01.png'), { title: 'november money math: *3 numbers that surprised me*', sub: '(exact inputs on every slide)' });
await slide(here('carousel-02.png'), { path: EM, set: e, caption: '3% of an $80k salary, 6% match cap = *$2,400 match*', sub: 'the same plan would add another $2,400 at 6%' });
await slide(here('carousel-03.png'), { path: EM, set: e, focus: 'chart', caption: 'that is *$2,400 a year* of match not taken', sub: 'plans differ (vesting, true-ups). check your own summary' });
await slide(here('carousel-04.png'), { path: LC, set: l, caption: 'an 8% raise on $60k is *$3,600* after an assumed 25% tax', sub: 'spend 60% and $1,440 a year is left to save' });
await slide(here('carousel-05.png'), { path: GG, set: g, caption: '$90 gift, tax, shipping, a card, 7 people = *$15.32 each*', sub: 'total $107.20, rounded up so the group never comes up short' });

await slide(here('x-1.png'), { path: GG, set: g, caption: '7 people, $107.20 total: *$15.32 each*', size: [1600, 900] });
await done();
