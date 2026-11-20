// Render 2026-11-20 pack. Run by .github/workflows/media.yml with MEDIA_LIB pointing at scripts/media/lib.mjs.
const { frames, slide, cover, done } = await import(process.env.MEDIA_LIB);
const dir = new URL('.', import.meta.url).pathname;
const here = (f) => new URL(f, import.meta.url).pathname;
const BNPL = '/finance/bnpl-true-cost/';
const CPU = '/finance/cost-per-use/';
const GIFT = '/finance/gift-budget/';
const b = { price: 1200, down: 0, months: 12, apr: 12, fee: 0, late: 0 };
const c = { price: 120, running: 0, resale: 0, uses: 10, alt: 8 };
const g = { total: 1000, fixed: 200, adults: 2, kids: 3, weight: '1.0', weeks: 5, spent: 250 };

await frames(dir, [
  { caption: "me one week before black friday: 'i'll just split it into payments'" },
  { path: BNPL, set: b, focus: 'form', caption: 'the setup', sub: '$1,200 thing, 12 payments, 12% APR' },
  { path: BNPL, set: b, focus: 'stage', caption: 'extra cost: *$79.42*', sub: "$106.62 a month, 6.6% more than the sticker price. i'm cooked T_T" },
  { path: CPU, set: c, focus: 'stage', caption: 'that $120 doorbuster, used 10 times: *$12.00 a use*', sub: 'the thing it replaces costs $8. need 15 uses to break even' },
  { caption: 'run your own numbers before the sale starts', sub: 'cappycalc.com/finance/bnpl-true-cost' },
], { prefix: 'reel' });

await cover(here('carousel-01.png'), { title: 'one week to black friday. *3 calculators*, exact inputs on every slide', sub: '(for the group chat)' });
await slide(here('carousel-02.png'), { path: GIFT, set: g, caption: '$1,000 holiday budget, 5 people to buy for: *$160 each*', sub: 'after $200 of travel, wrapping and food. 5 weeks to Dec 25' });
await slide(here('carousel-03.png'), { path: GIFT, set: g, caption: 'saving *$150 a week* covers the remaining $750', sub: 'that is the number, not a vibe' });
await slide(here('carousel-04.png'), { path: BNPL, set: b, caption: 'pay later on $1,200 at 12% APR = *$79.42 extra*', sub: '6.6% more than the price tag' });
await slide(here('carousel-05.png'), { path: CPU, set: c, caption: 'a $120 deal used 10 times is *$12.00 a use*', sub: 'break-even is 15 uses. cappycalc.com/finance/cost-per-use' });

await slide(here('x-1.png'), { path: BNPL, set: b, caption: '$1,200 over 12 payments at 12% APR: *$79.42 extra*', size: [1600, 900] });
await done();
