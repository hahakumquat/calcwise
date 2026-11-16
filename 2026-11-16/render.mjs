// Render 2026-11-16 pack. Run by .github/workflows/media.yml with MEDIA_LIB pointing at scripts/media/lib.mjs.
const { frames, slide, cover, shareCard, done } = await import(process.env.MEDIA_LIB);
const dir = new URL('.', import.meta.url).pathname;
const here = (f) => new URL(f, import.meta.url).pathname;
const BONUS = '/finance/bonus-tax/';
const b = { salary: 120000, bonus: 10000, status: 'single', stateRate: 5, k401: 0 };
const cg = { proceeds: 50000, basis: 30000, term: 'long', income: 60000, status: 'single', stateRate: 0 };
const se = { profit: 80000, status: 'single', wages: 0, stateRate: 5 };
const hsa = { year: '2026', coverage: 'self', age55: 'off', hsa: 4400, payroll: 'on', fsa: 0, salary: 85000, status: 'single', stateRate: 5 };
const roth = { contribution: 10000, taxNow: 24, taxRet: 22, years: 30, ret: 7 };

await frames(dir, [
  { caption: 'my $10k bonus showed up as *$6,535*' },
  { path: BONUS, set: b, focus: 'form', caption: 'the setup', sub: '$120k salary · $10k bonus · 5% state tax' },
  { path: BONUS, set: b, focus: 'stage', caption: '*$6,535* take-home', sub: '22% flat withholding, payroll tax, state' },
  { path: BONUS, set: b, focus: 'chart', caption: 'you keep 65%. the rest went on a little trip' },
  { caption: 'real federal tax says i may owe *$164* more', sub: 'cappycalc.com/finance/bonus-tax' },
], { prefix: 'reel' });

await cover(here('carousel-01.png'), { title: 'year-end tax math: *5 real numbers*', sub: 'same calculators, exact inputs on every slide' });
await slide(here('carousel-02.png'), { path: '/finance/capital-gains-tax/', set: cg, caption: '*$2,167.50* tax on a $20k gain held over a year', sub: '$50k sale · $30k basis · $60k other income · single' });
await slide(here('carousel-03.png'), { path: '/finance/capital-gains-tax/', set: { ...cg, term: 'short' }, caption: 'same sale held under a year: *$3,750*', sub: 'short-term is taxed like regular income' });
await slide(here('carousel-04.png'), { path: '/finance/self-employment-tax/', set: se, caption: '*$22,547.65* total tax on $80k of freelance profit', sub: '28.2% · $5,636.91 per quarter · 5% state' });
await slide(here('carousel-05.png'), { path: '/finance/hsa-fsa-savings/', set: hsa, caption: 'a $4,400 HSA contribution saves about *$1,524.60*', sub: '$85k salary · through payroll · 5% state · 2026' });
await slide(here('carousel-06.png'), { path: '/finance/roth-vs-traditional/', set: roth, caption: '24% now, 22% later: traditional wins by *$20,215*', sub: '$10k a year · 30 years · 7% return' });

await slide(here('x-1.png'), { path: BONUS, set: b, caption: '$10k bonus, $6,535 take-home. *the math*', size: [1600, 900] });
await shareCard(here('story.png'), { path: BONUS, set: b });
await done();
