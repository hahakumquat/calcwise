// Render today's pack. Run by .github/workflows/media.yml with MEDIA_LIB pointing at scripts/media/lib.mjs.
const { reel, slide, cover, shareCard, done } = await import(process.env.MEDIA_LIB);
const here = (f) => new URL(f, import.meta.url).pathname;
const P = '/finance/401k-max-out/';
const A = { salary: 85000, frequency: 'biweekly', ytd: 15000, left: 6, age: 'under50' };
const B = { ...A, ytd: 25000, age: '50plus' };

await reel(here('reel.mp4'), [
  { caption: 'my 401k said i have *6 paychecks* to fix my whole year', seconds: 2 },
  { path: P, set: A, focus: 'form', caption: 'the setup', sub: '$85k salary · every two weeks · $15k in so far', seconds: 2.5 },
  { path: P, set: A, caption: '*$1,583.33* per paycheck. PER. PAYCHECK.', seconds: 3 },
  { path: P, set: A, focus: 'chart', caption: '48.4% of my check. "doable, but tight" is one way to put it', seconds: 2.5 },
  { caption: 'run your own numbers', sub: 'cappycalc.com/finance/401k-max-out · free, runs in your browser', seconds: 2 },
]);
await cover(here('carousel-01.png'), { title: 'how much per paycheck to *max out your 401k*?', sub: 'i did the math so you don’t have to open 14 tabs' });
await slide(here('carousel-02.png'), { path: P, set: A, focus: 'form', caption: 'the setup', sub: '2026 limit: $24,500 · room left: $9,500' });
await slide(here('carousel-03.png'), { path: P, set: A, caption: '*$1,583.33* per paycheck', sub: '9,500 ÷ 6 = 1,583.33 · 48.4% of a $3,269 check' });
await slide(here('x-1.png'), { path: P, set: A, caption: '6 paychecks left to max my 401k. the math: *$1,583.33 each*', size: [1600, 900] });
await shareCard(here('story.png'), { path: P, set: A });
await done();
