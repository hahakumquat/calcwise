const { frames, slide, cover, shareCard, done } = await import(process.env.MEDIA_LIB);
const out = (f) => new URL('./' + f, import.meta.url).pathname;
const dir = new URL('.', import.meta.url).pathname;

const lease = { path: '/finance/lease-mileage-overage/', set: { annual: 12000, term: 36, elapsed: 30, driven: 33000, fee: 0.25 } };

await frames(dir, [
  { caption: 'me driving to every thanksgiving like my lease has no mileage cap T_T' },
  { ...lease, focus: 'form', caption: 'the *setup*', sub: '12k miles a year, 36 month lease, 33,000 miles at month 30, $0.25 a mile (example numbers)' },
  { ...lease, focus: 'stage', caption: 'projected overage fee: *$900*', sub: "i'm 3,600 miles over, i'm cooked" },
  { ...lease, focus: 'chart', caption: '36,000 allowed, *39,600* on pace', sub: 'the odometer does not care that it\'s a holiday' },
  { caption: 'check your own *pace*', sub: 'cappycalc.com/finance/lease-mileage-overage' },
], { prefix: 'reel' });

await cover(out('carousel-1.png'), { title: 'i made calculators nobody asked for *T_T*', sub: '(example inputs, links in the caption)' });
await slide(out('carousel-2.png'), { path: '/sports/shooting-efficiency/', set: { fgm: 10, tpm: 3, fga: 20, ftm: 5, fta: 6 }, caption: '10 of 20 shooting is *57.5%* eFG', sub: 'and 61.8% true shooting, free throws and threes matter' });
await slide(out('carousel-3.png'), { path: '/math/decibel-sum/', set: { levels: '80, 80, 80' }, caption: 'three relatives at 80 dB = *84.77 dB*', sub: 'sound adds on a log scale, not 240' });
await slide(out('carousel-4.png'), { path: '/developer/video-bitrate-size/', set: { mode: 'size', video: 8000, audio: 128, minutes: 10 }, caption: '10 min of 8 Mbps video = *609.6 MB*', sub: "that's why the upload limit said no" });
await slide(out('carousel-5.png'), { path: '/everyday/snow-water-equivalent/', set: { depth: 12, ratio: 10, area: 1000 }, caption: '12 in of snow on 1,000 ft2 is *6,240 lb*', sub: 'on a 10:1 ratio, wet snow weighs more' });

await slide(out('x-1.png'), { path: '/math/decibel-sum/', set: { levels: '80, 80, 80' }, caption: '3 people at 80 dB = *84.77 dB*', sub: 'sound adds on a log scale', size: [1600, 900] });
await shareCard(out('story-lease.png'), lease);
await done();
