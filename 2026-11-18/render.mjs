// Render 2026-11-18 pack. Run by .github/workflows/media.yml with MEDIA_LIB pointing at scripts/media/lib.mjs.
const { frames, slide, cover, done } = await import(process.env.MEDIA_LIB);
const dir = new URL('.', import.meta.url).pathname;
const here = (f) => new URL(f, import.meta.url).pathname;
const DISC = '/finance/discount/';
const d1 = { price: 200, discount: 30, extra: 20 };
const d2 = { price: 200, discount: 30, extra: 20, coupon: 10, taxRate: 8 };
const TURKEY = '/food/turkey-cooking-time/';
const t = { weight: 16, state: 'frozen', serve: '17' };
const pd = { a: 40, b: 60 };
const cg = { start: 10000, end: 25000, years: 8 };

await frames(dir, [
  { caption: 'black friday brain: 30% off + 20% off = *50% off*' },
  { path: DISC, set: d1, focus: 'form', caption: 'the setup', sub: '$200 thing, 30% off, extra 20% off' },
  { path: DISC, set: d1, focus: 'stage', caption: 'you pay *$112.00*. real total off: *44%*', sub: 'not 50. i\'m cooked T_T' },
  { path: DISC, set: d2, focus: 'stage', caption: 'add a $10 coupon + 8% tax: *$110.16* at checkout', sub: '49% off before tax' },
  { caption: 'stacked discounts multiply. *check yours*', sub: 'cappycalc.com/finance/discount' },
], { prefix: 'reel' });

await cover(here('carousel-01.png'), { title: 'thanksgiving week numbers, *4 calculators*', sub: 'exact inputs on every slide' });
await slide(here('carousel-02.png'), { path: TURKEY, set: t, caption: 'a 16 lb turkey needs *4 days* in the fridge', sub: 'oven in between 12:15 and 12:45 pm for a 5 pm dinner' });
await slide(here('carousel-03.png'), { path: DISC, set: d1, caption: '30% + 20% off is *44%*, not 50%', sub: 'you pay $112.00, save $88.00' });
await slide(here('carousel-04.png'), { path: '/math/percent-difference/', set: pd, caption: '40 vs 60 is a *40%* difference but a *50%* change', sub: 'depends which number you start from' });
await slide(here('carousel-05.png'), { path: '/finance/cagr-calculator/', set: cg, caption: '$10k to $25k in 8 yrs is *12.13% a year*, not 18.75%', sub: 'simple average ignores compounding. cappycalc.com/finance/cagr-calculator' });

await slide(here('x-1.png'), { path: TURKEY, set: t, caption: '16 lb turkey, dinner at 5pm: thaw *4 days*', size: [1600, 900] });
await done();
