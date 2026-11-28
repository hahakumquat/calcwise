import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'tire-tread-life',
  title: 'Tire Tread Life Remaining Calculator',
  category: 'everyday',
  description: 'Estimate how many miles and months of tire tread you have left before 4/32 and 2/32 inch, from the new depth, current depth and miles driven on the tires.',
  keywords: ['tire tread life calculator', 'how many miles left on tires', 'tire tread depth 32nds', 'when to replace tires tread depth', 'tire wear rate', 'tire tread remaining'],
  updated: '2026-11-28',
  inputs: [
    { id: 'newDepth', label: 'New tread depth', type: 'number', default: 10, min: 1, max: 20, step: 0.5, suffix: '/32 in', info: 'Tread depth when the tires were new, in 32nds of an inch. Many car tires start at 9 to 11. The tire maker or shop can tell you.' },
    { id: 'currentDepth', label: 'Current tread depth', type: 'number', default: 6, min: 0, max: 20, step: 0.5, suffix: '/32 in', info: 'Measure in the main grooves with a tread depth gauge, in 32nds of an inch. Check a few spots and use the lowest.' },
    { id: 'miles', label: 'Miles driven on these tires', type: 'number', default: 20000, min: 0, step: 500, suffix: 'mi', info: 'Miles since the tires were installed new.' },
    { id: 'annual', label: 'Miles driven per year', type: 'number', default: 12000, min: 0, step: 500, suffix: 'mi', info: 'Used to turn miles left into months. Around 12,000 is a common US average.' },
    { id: 'limitA', label: 'First replace-at depth', type: 'number', default: 4, min: 0, max: 20, step: 0.5, suffix: '/32 in', info: '4/32 is a common point to replace tires for snow and wet-road braking. It is guidance, not a law.' },
    { id: 'limitB', label: 'Second replace-at depth', type: 'number', default: 2, min: 0, max: 20, step: 0.5, suffix: '/32 in', info: '2/32 is the usual US legal minimum, but states differ. Confirm the rule where you drive.' },
  ],
  outputs: [
    { id: 'milesA', label: 'Miles left to first depth', format: 'number', precision: 0, suffix: 'mi', primary: true, info: '(Current depth − first replace-at depth) ÷ wear per mile. Zero means you are already there.' },
    { id: 'monthsA', label: 'Months left to first depth', format: 'number', precision: 1, suffix: 'months', info: 'Miles left ÷ miles per year × 12.' },
    { id: 'milesB', label: 'Miles left to second depth', format: 'number', precision: 0, suffix: 'mi', info: '(Current depth − second replace-at depth) ÷ wear per mile.' },
    { id: 'monthsB', label: 'Months left to second depth', format: 'number', precision: 1, suffix: 'months', info: 'Miles left ÷ miles per year × 12.' },
    { id: 'wear', label: 'Wear per 10,000 miles', format: 'number', precision: 2, suffix: '/32 in', info: '(New depth − current depth) ÷ miles driven × 10,000.' },
  ],
  compute: (v) => {
    const nw = num(v.newDepth);
    const cur = num(v.currentDepth);
    const miles = num(v.miles);
    const annual = num(v.annual);
    const a = num(v.limitA);
    const b = num(v.limitB);
    if (nw === null || cur === null || miles === null || annual === null || a === null || b === null) return { milesA: null };
    if (nw <= 0 || cur < 0 || miles <= 0 || annual <= 0 || a < 0 || b < 0) return { milesA: null };
    if (cur > nw) return { milesA: null, error: 'Current depth cannot be more than new depth. Check both numbers.' };
    if (cur === nw) return { milesA: null, error: 'No wear measured yet, so a wear rate cannot be worked out. Try again after more driving.' };
    const rate = (nw - cur) / miles; // 32nds per mile
    const left = (limit: number) => Math.max(0, cur - limit) / rate;
    const mA = left(a);
    const mB = left(b);
    const moA = (mA / annual) * 12;
    const moB = (mB / annual) * 12;
    const nowA = cur <= a;
    const nowB = cur <= b;
    const end = Math.max(mA, mB);
    const markers: { x: number; label: string }[] = [];
    if (mA > 0) markers.push({ x: +mA.toFixed(0), label: `${fmt(a, 1)}/32` });
    if (mB > 0 && Math.round(mB) !== Math.round(mA)) markers.push({ x: +mB.toFixed(0), label: `${fmt(b, 1)}/32` });
    const xs = end > 0 ? Array.from({ length: 11 }, (_, i) => +((end * i) / 10).toFixed(0)) : [];
    return {
      milesA: mA,
      monthsA: moA,
      milesB: mB,
      monthsB: moB,
      wear: rate * 10000,
      tone: nowB ? 'bad' : nowA ? 'warn' : 'good',
      badge: nowB ? 'Replace now' : nowA ? 'Time to replace' : `About ${fmt(moA, 0)} months to ${fmt(a, 1)}/32`,
      note: nowA
        ? `Your tread is at or below ${fmt(a, 1)}/32, so replace the tires now or soon. Confirm the legal minimum where you drive.`
        : `These tires lose about ${fmt(rate * 10000, 2)}/32 per 10,000 miles. Wear tends to speed up, so treat this as a best case and re-measure every few months.`,
      ...(end > 0
        ? {
            chart: {
              type: 'line' as const,
              title: 'Projected tread depth (32nds of an inch)',
              x: xs,
              xLabel: 'Miles from now',
              xFormat: { format: 'integer' as const },
              yLabel: '32nds',
              series: [{ name: 'Tread depth', values: xs.map((x) => +Math.max(0, cur - rate * x).toFixed(2)) }],
              markers,
            },
          }
        : {}),
      steps: [
        `Wear per mile = (${fmt(nw, 1)} − ${fmt(cur, 1)}) ÷ ${fmt(miles, 0)} = ${+rate.toPrecision(4)} /32 per mile`,
        nowA ? `Already at or below ${fmt(a, 1)}/32` : `Miles to ${fmt(a, 1)}/32 = (${fmt(cur, 1)} − ${fmt(a, 1)}) ÷ ${+rate.toPrecision(4)} = ${fmt(mA, 0)} mi = ${fmt(moA, 1)} months`,
        nowB ? `Already at or below ${fmt(b, 1)}/32` : `Miles to ${fmt(b, 1)}/32 = (${fmt(cur, 1)} − ${fmt(b, 1)}) ÷ ${+rate.toPrecision(4)} = ${fmt(mB, 0)} mi = ${fmt(moB, 1)} months`,
      ],
    };
  },
  content: {
    formula: [
      'Wear per mile = (new depth − current depth) ÷ miles driven',
      'Miles left = (current depth − replace-at depth) ÷ wear per mile',
      'Months left = miles left ÷ miles per year × 12',
    ],
    body: [
      'Tire tread is measured in 32nds of an inch. If you know how deep the tread was when the tires were new, how deep it is now, and how far you have driven, you can work out how fast the tires wear and when they will reach a replace-at depth.',
      'Example: tires that started at 10/32 and are now at 6/32 after 20,000 miles have worn 4/32, which is 0.0002 per mile. To reach 4/32 they have 2 ÷ 0.0002 = 10,000 miles left, or 10 months at 12,000 miles a year. To reach 2/32 they have 4 ÷ 0.0002 = 20,000 miles, or 20 months.',
      'Tires rarely wear in a straight line. Wear usually speeds up as the tread gets shallow, and it depends on alignment, pressure, rotation and how you drive. So the answer is a best case. Measure with a tread depth gauge, in a few spots, and re-check every few months. 2/32 is the usual legal minimum in the US, but states differ, so confirm the rule where you drive. 4/32 is a common point to replace for snow and wet-road braking. This is guidance, not a safety guarantee. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How many miles are left on my tires?', a: 'Divide the tread you can still use by the wear rate. With tires at 6/32 after wearing 4/32 in 20,000 miles, the first replace-at depth of 4/32 is 10,000 miles away, and 2/32 is 20,000 miles away.' },
      { q: 'What tread depth should I replace tires at?', a: '2/32 inch is the usual US legal minimum, though states differ. Many tire shops and testers suggest 4/32 for snow and wet braking. Both are editable here, and the final call is yours.' },
      { q: 'How do I measure tread depth?', a: 'Use a tread depth gauge in the main grooves, in 32nds of an inch. Check the inner, middle and outer parts of each tire and use the lowest reading.' },
      { q: 'Why is the estimate only a best case?', a: 'The calculator assumes even wear. In real life wear tends to speed up as tread gets shallow, and bad alignment or low pressure can make it worse.' },
      { q: 'What does the calculator do if I am already below the depth?', a: 'It shows zero miles left and tells you to replace the tires. It does not give a negative number.' },
    ],
    sources: [
      { label: 'Tread depth in 32nds of an inch is the usual US gauge unit. 2/32 inch is commonly cited as the US legal minimum and 4/32 as a snow and wet-braking replace point; rules differ by state, so check your own.' },
    ],
  },
  related: ['winter-tire-cost', 'stopping-distance', 'tire-pressure-cold', 'tire-size-comparison'],
  examples: [
    // rate = (10-6)/20000 = 0.0002; to 4: (6-4)/0.0002 = 10000 mi = 10 months at 12000/yr; to 2: 4/0.0002 = 20000 mi = 20 months; per 10000 mi = 2
    { values: { newDepth: 10, currentDepth: 6, miles: 20000, annual: 12000, limitA: 4, limitB: 2 }, expect: { milesA: 10000, monthsA: 10, milesB: 20000, monthsB: 20, wear: 2 }, tolerance: 1e-6 },
    // rate = (10-4)/30000 = 0.0002; already at 4 -> 0 mi; to 2: 2/0.0002 = 10000 mi = 10 months
    { values: { newDepth: 10, currentDepth: 4, miles: 30000, annual: 12000, limitA: 4, limitB: 2 }, expect: { milesA: 0, monthsA: 0, milesB: 10000, monthsB: 10, wear: 2 }, tolerance: 1e-6 },
  ],
});
