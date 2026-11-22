import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'price-hike-impact',
  title: 'Price Hike Impact Calculator',
  category: 'finance',
  description: 'See what a price increase on a subscription or bill really costs per year, how big the hike is in percent, and what it adds up to over several years.',
  keywords: ['price increase calculator', 'subscription price hike cost', 'how much more per year', 'percent increase in price', 'streaming price increase', 'bill increase yearly cost'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'oldPrice', label: 'Old price', type: 'number', prefix: '$', default: 15.49, min: 0, step: 0.01, info: 'What you paid per billing period before the increase.' },
    { id: 'newPrice', label: 'New price', type: 'number', prefix: '$', default: 17.99, min: 0, step: 0.01, info: 'What you pay per billing period after the increase.' },
    { id: 'perYear', label: 'Payments per year', type: 'number', default: 12, min: 1, step: 1, info: '12 for monthly billing, 4 for quarterly, 1 for yearly.' },
    { id: 'years', label: 'Years you will keep it', type: 'number', default: 3, min: 1, step: 1, suffix: 'years', info: 'Used for the total extra cost, assuming no further hikes.' },
  ],
  outputs: [
    { id: 'extraYear', label: 'Extra per year', format: 'currency', precision: 2, primary: true, info: '(New price − old price) × payments per year.' },
    { id: 'pct', label: 'Increase', format: 'percent', precision: 1, info: '(New − old) ÷ old.' },
    { id: 'newYear', label: 'New yearly cost', format: 'currency', precision: 2, info: 'New price × payments per year.' },
    { id: 'extraTotal', label: 'Extra over the full period', format: 'currency', precision: 2, info: 'Extra per year × years.' },
  ],
  compute: (v) => {
    const o = num(v.oldPrice);
    const n = num(v.newPrice);
    const p = num(v.perYear);
    const y = num(v.years);
    if (o === null || n === null || p === null || y === null) return { extraYear: null };
    if (o <= 0 || n < 0 || p < 1 || y < 1) return { extraYear: null };
    const extraYear = (n - o) * p;
    const pct = ((n - o) / o) * 100;
    const newYear = n * p;
    const extraTotal = extraYear * y;
    return {
      extraYear,
      pct,
      newYear,
      extraTotal,
      tone: extraYear > 0 ? 'warn' : 'good',
      badge: extraYear > 0 ? `Up ${pct.toFixed(1)}%` : extraYear < 0 ? `Down ${Math.abs(pct).toFixed(1)}%` : 'No change',
      note: extraYear === 0
        ? 'The price did not change, so there is no extra cost.'
        : `${extraYear > 0 ? 'The increase' : 'The cut'} is ${money(Math.abs(n - o))} per payment, ${money(Math.abs(extraYear))} per year and ${money(Math.abs(extraTotal))} over ${y} year${y === 1 ? '' : 's'}, assuming the price stays put.`,
      chart: {
        type: 'bar',
        title: 'Yearly cost',
        categories: ['Before', 'After'],
        series: [{ name: 'Per year', values: [o * p, newYear] }],
        format: { format: 'currency', precision: 2 },
      },
      steps: [
        `Change per payment = ${money(n)} − ${money(o)} = ${money(n - o)}`,
        `Per year = ${money(n - o)} × ${p} = ${money(extraYear)}`,
        `Increase = ${money(n - o)} ÷ ${money(o)} = ${pct.toFixed(1)}%`,
        `Over ${y} years = ${money(extraYear)} × ${y} = ${money(extraTotal)}`,
      ],
    };
  },
  content: {
    formula: [
      'Extra per year = (new price − old price) × payments per year',
      'Increase % = (new price − old price) ÷ old price × 100',
      'Extra over the period = extra per year × years',
    ],
    body: [
      'A price hike of a dollar or two looks harmless on one invoice. Multiplied by every billing period it is a different number. Enter the old and new price and how often you are billed to see the yearly cost, the percentage jump and the total over the years you plan to keep it.',
      'Example: a streaming plan rises from $15.49 to $17.99 a month. That is $2.50 more per payment, $30.00 more per year, a 16.1% increase, and $90.00 more over three years if it never rises again.',
      'The calculator uses the prices you enter and does not include tax or promotional discounts. It runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I work out what a price increase costs per year?', a: 'Subtract the old price from the new price and multiply by payments per year. $17.99 − $15.49 = $2.50, times 12 is $30.00.' },
      { q: 'How is the percentage increase calculated?', a: 'Divide the change by the old price. $2.50 ÷ $15.49 is about 16.1%.' },
      { q: 'Does it include future price rises?', a: 'No. The multi-year total assumes the new price stays the same. Further hikes would add to it.' },
      { q: 'Can I use it for a price cut?', a: 'Yes. A lower new price gives a negative change, shown as a saving.' },
    ],
    sources: [],
  },
  related: ['bill-negotiation-savings', 'subscription-cost', 'annual-vs-monthly-plan', 'percentage-change', 'inflation', 'hours-of-work-cost'],
  examples: [
    // diff 2.50; x12 = 30; 2.5/15.49 = 16.1394%; new year 215.88; x3 = 90
    { values: { oldPrice: 15.49, newPrice: 17.99, perYear: 12, years: 3 }, expect: { extraYear: 30, pct: 16.139445, newYear: 215.88, extraTotal: 90 }, tolerance: 1e-4 },
    // 100 -> 80 yearly: -20 x1 = -20, -20%
    { values: { oldPrice: 100, newPrice: 80, perYear: 1, years: 2 }, expect: { extraYear: -20, pct: -20, newYear: 80, extraTotal: -40 }, tolerance: 1e-6 },
  ],
});
