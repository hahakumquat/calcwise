const { frames, slide, cover, shareCard, done } = await import(process.env.MEDIA_LIB);
const out = (f) => new URL('./' + f, import.meta.url).pathname;
const dir = new URL('.', import.meta.url).pathname;

const shrink = { path: '/finance/shrinkflation/', set: { oldSize: 16, oldPrice: 4, newSize: 14, newPrice: 4.2 } };

await frames(dir, [
  { caption: 'black friday: the tag says +5%. the bag says *lol* T_T' },
  { ...shrink, focus: 'form', caption: 'the *setup*', sub: '16 oz at $4.00 becomes 14 oz at $4.20 (example numbers)' },
  { ...shrink, focus: 'stage', caption: 'real price increase: *+20%*', sub: 'the tag said 5%, i\'m cooked' },
  { ...shrink, focus: 'chart', caption: 'tag +5%, bag -12.5%, per oz *+20%*', sub: 'same chips, smaller flex' },
  { caption: 'check your own *bag*', sub: 'cappycalc.com/finance/shrinkflation' },
], { prefix: 'reel' });

await cover(out('carousel-1.png'), { title: 'black friday math nobody asked for *T_T*', sub: '(example inputs, links in the caption)' });
await slide(out('carousel-2.png'), { path: '/finance/shrinkflation/', set: { oldSize: 16, oldPrice: 4, newSize: 14.5, newPrice: 4 }, caption: 'same $4 tag, smaller bag: *+10.34%* per oz', sub: '16 oz to 14.5 oz, the tag did not move' });
await slide(out('carousel-3.png'), { path: '/everyday/toilet-paper-value/', set: { priceA: 24, rollsA: 24, sheetsA: 200, priceB: 18, rollsB: 12, sheetsB: 400 }, caption: '24 rolls vs 12: pack B is *25% cheaper* per sheet', sub: '4,800 sheets each, $0.50 vs $0.375 per 100' });
await slide(out('carousel-4.png'), { path: '/finance/holiday-savings-plan/', set: { target: 600, saved: 100, weeks: 4, rhythm: 'weekly' }, caption: '$600 budget, $100 saved, 4 weeks = *$125 a week*', sub: 'christmas is a deadline, not a vibe' });
await slide(out('carousel-5.png'), { path: '/everyday/layover-buffer/', set: { arrive: '14:10', delay: 25, depart: '15:20', min: 45 }, caption: 'land 25 min late, buffer *0 min*', sub: 'tight. very tight. sunday travel is a sport' });
await slide(out('carousel-6.png'), { path: '/math/percentage-points/', set: { old: 6.5, new: 7 }, caption: '6.5% to 7% is +0.5 points, but *+7.69%*', sub: 'points and percent are not the same thing' });

await slide(out('x-1.png'), { ...shrink, caption: '16 oz to 14 oz, tag +5%, per oz *+20%*', sub: 'the real price is per unit', size: [1600, 900] });
await shareCard(out('story-shrink.png'), shrink);
await done();
