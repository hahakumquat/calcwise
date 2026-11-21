// Render 2026-11-21 pack. Run by .github/workflows/media.yml with MEDIA_LIB pointing at scripts/media/lib.mjs.
const { frames, slide, cover, done } = await import(process.env.MEDIA_LIB);
const dir = new URL('.', import.meta.url).pathname;
const here = (f) => new URL(f, import.meta.url).pathname;
const CAF = '/health/caffeine-half-life/';
const WIN = '/finance/windfall-split/';
const SEV = '/finance/severance-pay/';
const c = { preset: 'coffee', servings: 1, taken: '14:00', bed: '22:00', half: 5 };
const w = { amount: 5000, tax: 20, spend: 25, save: 25, invest: 25, debt: 25, rate: 5 };
const s = { salary: 78000, years: 6, rate: 2, pto: 5, expenses: 3000 };

await frames(dir, [
  { caption: "me at 2pm: 'one more coffee won't hurt'" },
  { path: CAF, set: c, focus: 'form', caption: 'the setup', sub: '1 cup of coffee at 2pm, bed at 10pm, half-life 5 hours' },
  { path: CAF, set: c, focus: 'stage', caption: 'still in my system at bedtime: *31.3 mg*', sub: "33% of the cup is still there. my sleep schedule is cooked T_T" },
  { path: CAF, set: c, focus: 'chart', caption: 'the line only goes down slowly bestie', sub: 'half gone every 5 hours, that is the whole trick' },
  { caption: 'plug in your own coffee time', sub: 'cappycalc.com/health/caffeine-half-life' },
], { prefix: 'reel' });

await cover(here('carousel-01.png'), { title: 'a bonus, a refund, a severance check. *same question: now what?*', sub: '(2 calculators, exact inputs on every slide)' });
await slide(here('carousel-02.png'), { path: WIN, set: w, caption: '$5,000 windfall, 20% withheld: *$4,000 to split*', sub: 'that is the real number you hold' });
await slide(here('carousel-03.png'), { path: WIN, set: w, caption: '25% each into spend, save, invest, debt = *$1,000 a bucket*', sub: 'the invested $1,000 grows to $1,628.89 in 10 years at an assumed 5%. an assumption, not a promise' });
await slide(here('carousel-04.png'), { path: SEV, set: s, caption: '6 years at 2 weeks a year = *12 weeks, $19,500 before tax*', sub: 'example formula, your offer is what counts' });
await slide(here('carousel-05.png'), { path: SEV, set: s, caption: 'that covers about *6.5 months* of $3,000 expenses, before tax', sub: 'real take-home is lower. cappycalc.com/finance/severance-pay' });

await slide(here('x-1.png'), { path: CAF, set: c, caption: '1 coffee at 2pm, bed at 10pm: *31.3 mg* left (33%)', size: [1600, 900] });
await done();
