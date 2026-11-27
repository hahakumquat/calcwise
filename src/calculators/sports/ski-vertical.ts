import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'ski-vertical',
  title: 'Ski Vertical per Ticket Dollar Calculator',
  category: 'sports',
  description: 'Turn a lift ticket and your runs into vertical feet skied, cost per 1,000 vertical feet and cost per run, plus the runs needed to hit a target price.',
  metaDescription: 'Ski vertical calculator: see total vertical feet, cost per 1,000 vertical feet and cost per run from your lift ticket price and runs, and runs to hit a target.',
  updated: '2026-11-27',
  keywords: ['ski vertical calculator', 'cost per 1000 vertical feet skiing', 'lift ticket value', 'ski vertical per dollar', 'ski day value calculator'],
  inputs: [
    { id: 'price', label: 'Lift ticket price ($)', type: 'number', default: 120, min: 0.01, step: 1, info: 'What you paid for the day, or the pass price divided by days used.' },
    { id: 'vert', label: 'Vertical per run (ft)', type: 'number', default: 1200, min: 1, step: 10, info: 'Drop of the lift you rode, in feet. Check the trail map.' },
    { id: 'runs', label: 'Runs skied', type: 'number', default: 15, min: 1, step: 1, info: 'How many lift rides you took.' },
    { id: 'target', label: 'Target cost per 1,000 ft ($)', type: 'number', default: 5, min: 0.01, step: 0.5, info: 'The price you would call a good deal.' },
  ],
  outputs: [
    { id: 'total', label: 'Total vertical (ft)', format: 'integer', primary: true, info: 'Vertical per run × runs.' },
    { id: 'per1000', label: 'Cost per 1,000 vertical ft', format: 'currency', precision: 2, info: 'Ticket price ÷ total vertical × 1,000.' },
    { id: 'perRun', label: 'Cost per run', format: 'currency', precision: 2, info: 'Ticket price ÷ runs.' },
    { id: 'ftPerDollar', label: 'Vertical feet per dollar', format: 'number', precision: 1, info: 'Total vertical ÷ ticket price.' },
    { id: 'runsNeeded', label: 'Runs to reach your target', format: 'number', precision: 2, info: 'Ticket price ÷ (target ÷ 1,000 × vertical per run).' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const vert = num(v.vert);
    const runs = num(v.runs);
    const target = num(v.target);
    if (price === null || vert === null || runs === null || target === null) return { total: null };
    if (price <= 0 || vert <= 0 || runs < 1 || target <= 0) return { total: null, error: 'Ticket price, vertical, runs and target must be above zero.' };
    const total = vert * runs;
    const per1000 = (price / total) * 1000;
    const perRun = price / runs;
    const ftPerDollar = total / price;
    const runsNeeded = price / ((target / 1000) * vert);
    const tone: 'good' | 'ok' = per1000 <= target ? 'good' : 'ok';
    const badge = `$${fmt(per1000)} per 1,000 ft`;
    const note = per1000 <= target
      ? `You beat your $${fmt(target)} target. You needed ${fmt(Math.ceil(runsNeeded))} runs and took ${fmt(runs)}.`
      : `${fmt(Math.ceil(runsNeeded))} runs would have reached $${fmt(target)} per 1,000 ft. You took ${fmt(runs)}.`;
    const counts = [5, 10, 15, 20, 25];
    return {
      total,
      per1000,
      perRun,
      ftPerDollar,
      runsNeeded,
      tone,
      badge,
      note,
      chart: {
        type: 'bar',
        title: 'Cost per 1,000 vertical ft by number of runs',
        categories: counts.map((r) => `${r} runs`),
        series: [{ name: 'Dollars per 1,000 ft', values: counts.map((r) => (price / (vert * r)) * 1000) }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [
        `Total vertical = ${fmt(vert)} × ${fmt(runs)} = ${fmt(total)} ft`,
        `Cost per 1,000 ft = $${fmt(price)} ÷ ${fmt(total)} × 1,000 = $${fmt(per1000)}`,
        `Cost per run = $${fmt(price)} ÷ ${fmt(runs)} = $${fmt(perRun)}`,
        `Runs for target = $${fmt(price)} ÷ ($${fmt(target)} ÷ 1,000 × ${fmt(vert)}) = ${fmt(runsNeeded)}`,
      ],
    };
  },
  content: {
    formula: ['Total vertical = vertical per run × runs', 'Cost per 1,000 ft = ticket price ÷ total vertical × 1,000', 'Runs for a target = ticket price ÷ (target ÷ 1,000 × vertical per run)'],
    body: [
      'Vertical feet is the drop you ski, so it is a fairer way to compare a ticket than counting hours. A $120 ticket and 15 runs on a 1,200 ft lift is 18,000 ft of vertical, or $6.67 per 1,000 ft.',
      'Every extra run lowers the cost per 1,000 ft. The same ticket at 20 runs is 24,000 ft, or $5.00 per 1,000 ft.',
      'Use the vertical listed for the lift on the trail map. This calculator does not measure your actual drop and ignores time spent riding and waiting.',
    ],
    faq: [
      { q: 'How do I work out cost per 1,000 vertical feet?', a: 'Divide the ticket price by your total vertical feet, then multiply by 1,000. $120 over 18,000 ft is $6.67.' },
      { q: 'How many runs do I need to hit $5 per 1,000 ft?', a: 'With a $120 ticket and a 1,200 ft lift, 120 ÷ (5 ÷ 1,000 × 1,200) = 20 runs.' },
      { q: 'Can I use a season pass?', a: 'Yes. Divide the pass price by the number of days you skied and enter that as the ticket price.' },
      { q: 'Where do I find the vertical of a lift?', a: 'Most resorts list lift vertical on the trail map or the lift page of their website.' },
    ],
    sources: [],
  },
  related: ['ski-day-cost', 'season-pass-break-even'],
  examples: [
    // total 1200*15=18000; per1000 120/18000*1000=6.6667; per run 8; ft/$ 150; runs 120/(0.005*1200)=20
    { values: { price: 120, vert: 1200, runs: 15, target: 5 }, expect: { total: 18000, per1000: 6.6667, perRun: 8, ftPerDollar: 150, runsNeeded: 20 }, tolerance: 0.001 },
    // total 8000; per1000 90/8000*1000=11.25; per run 9; ft/$ 88.8889; runs 90/(0.01*800)=11.25
    { values: { price: 90, vert: 800, runs: 10, target: 10 }, expect: { total: 8000, per1000: 11.25, perRun: 9, ftPerDollar: 88.8889, runsNeeded: 11.25 }, tolerance: 0.001 },
  ],
});
