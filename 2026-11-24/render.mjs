// Render 2026-11-24 pack. Run by .github/workflows/media.yml with MEDIA_LIB pointing at scripts/media/lib.mjs.
const { frames, slide, cover, done } = await import(process.env.MEDIA_LIB);
const dir = new URL('.', import.meta.url).pathname;
const here = (f) => new URL(f, import.meta.url).pathname;
const SB = '/everyday/standby-power-cost/';
const RR = '/finance/repair-vs-replace/';
const PH = '/finance/phone-upgrade-vs-keep/';
const s = { w1: 15, w2: 10, w3: 1.5, w4: 3, w5: 2, hours: 20, rate: 0.16 };
const r = { repair: 350, repairYears: 3, price: 900, newYears: 10, saving: 30 };
const p = { price: 999, credit: 300, resale: 150, years: 3, oldCost: 89, oldYears: 1 };

await frames(dir, [
  { caption: "my stuff is 'off' and still costing me T_T" },
  { path: SB, set: s, focus: 'form', caption: 'the setup', sub: '5 idle devices, 31.5 W total, idle 20 h a day, $0.16 per kWh' },
  { path: SB, set: s, focus: 'stage', caption: '*$36.79* a year doing nothing', sub: "about 230 kWh for stuff that is 'off'" },
  { path: SB, set: s, focus: 'chart', caption: 'one 15 W box is *$17.52* of it', sub: 'a plug-in meter tells you your real watts' },
  { caption: 'check your own idle stuff', sub: 'cappycalc.com/everyday/standby-power-cost' },
], { prefix: 'reel' });

await cover(here('carousel-01.png'), { title: 'before you buy the new thing: *3 per-year numbers*', sub: '(example inputs, calculator links in the caption)' });
await slide(here('carousel-02.png'), { path: SB, set: s, caption: '5 idle devices, 31.5 W = *$36.79 a year* doing nothing', sub: 'about 230 kWh at $0.16 per kWh' });
await slide(here('carousel-03.png'), { path: SB, set: s, focus: 'chart', caption: 'the 15 W one is *$17.52* of that', sub: 'use your own meter readings, these are examples' });
await slide(here('carousel-04.png'), { path: RR, set: r, caption: '$350 repair for 3 years = *$116.67 a year*, new is $60', sub: 'replacing is $56.67 a year cheaper, but $900 up front' });
await slide(here('carousel-05.png'), { path: PH, set: p, caption: 'new phone *$15.25 a month* vs $7.42 for an $89 fix', sub: 'net cost $549 after credit and resale, a $7.83 a month gap' });

await slide(here('x-1.png'), { path: SB, set: s, caption: '31.5 W idle = *$36.79 a year* for nothing', size: [1600, 900] });
await done();
