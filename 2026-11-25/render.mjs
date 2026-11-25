// Render 2026-11-25 pack. Run by .github/workflows/media.yml with MEDIA_LIB pointing at scripts/media/lib.mjs.
const { frames, slide, cover, done } = await import(process.env.MEDIA_LIB);
const dir = new URL('.', import.meta.url).pathname;
const here = (f) => new URL(f, import.meta.url).pathname;
const EW = '/finance/early-withdrawal-penalty/';
const SC = '/finance/savers-credit/';
const HS = '/finance/home-sale-exclusion/';
const QC = '/finance/qcd-tax-value/';
const ew = { amount: 10000, penalty: 10, fed: 22, state: 5, pretax: 'on', share: 0 };
const sc = { contrib: 1500, cap: 2000, rate: 50, tax: 800 };
const hs = { price: 1200000, costs: 72000, purchase: 400000, improve: 50000, exclusion: 500000, rate: 15 };
const qc = { gift: 10000, limit: 108000, rate: 24, deduct: 0 };

await frames(dir, [
  { caption: "me taking $10k out of my 401(k) like it's free T_T" },
  { path: EW, set: ew, focus: 'form', caption: 'the setup', sub: '$10,000 out, 10% penalty, 22% federal, 5% state (example numbers)' },
  { path: EW, set: ew, focus: 'stage', caption: 'i get to keep *$6,300*', sub: "that's 37% gone" },
  { path: EW, set: ew, focus: 'chart', caption: 'penalty $1,000, federal $2,200, state $500', sub: 'the account said $10k, the account lied' },
  { caption: 'check your own numbers', sub: 'cappycalc.com/finance/early-withdrawal-penalty' },
], { prefix: 'reel' });

await cover(here('carousel-01.png'), { title: '4 tax things nobody explained to me *T_T*', sub: '(example inputs, links in the caption)' });
await slide(here('carousel-02.png'), { path: EW, set: ew, caption: '$10k out = *$6,300* in my pocket', sub: '$3,700 gone to penalty and tax' });
await slide(here('carousel-03.png'), { path: EW, set: ew, focus: 'chart', caption: 'the penalty is only *$1,000* of it', sub: 'tax is the bigger bite' });
await slide(here('carousel-04.png'), { path: SC, set: sc, caption: '$1,500 into retirement = a *$750* credit?', sub: 'on these example inputs, your rate comes from IRS tables' });
await slide(here('carousel-05.png'), { path: HS, set: hs, caption: '$678k gain, only *$178k* taxable', sub: 'the exclusion does the heavy lifting, tax $26,700' });
await slide(here('carousel-06.png'), { path: QC, set: qc, caption: 'a $10k IRA gift to charity saves *$2,400* in tax', sub: 'on example inputs, rules apply, giving tuesday is 12-01' });

await slide(here('x-1.png'), { path: EW, set: ew, caption: '$10k out early = *$6,300* kept, 37% gone', size: [1600, 900] });
await done();
