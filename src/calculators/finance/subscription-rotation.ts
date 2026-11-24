import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const rowInputs = [1, 2, 3, 4].flatMap((n) => [
  { id: `p${n}`, label: `Service ${n}: monthly price`, type: 'number' as const, prefix: '$', default: n === 1 ? 17.99 : n === 2 ? 11.99 : 0, min: 0, step: 0.01, info: 'The monthly price of the service. Leave at 0 to skip the row.' },
  { id: `m${n}`, label: `Service ${n}: months you actually use it`, type: 'number' as const, default: n === 1 ? 4 : n === 2 ? 3 : 0, min: 0, max: 12, step: 1, info: 'Months out of 12 you would keep it if you subscribed only when watching.' },
]);

export default defineCalculator({
  slug: 'subscription-rotation',
  title: 'Subscription Rotation Savings Calculator',
  category: 'finance',
  description: 'Compare paying for streaming services all year with subscribing only the months you use them. See the yearly saving for each service and in total.',
  keywords: ['subscription rotation calculator', 'rotate streaming services savings', 'cancel and resubscribe savings', 'streaming subscription cost per year', 'pay only months you watch', 'streaming rotation'],
  updated: '2026-11-24',
  popular: false,
  inputs: rowInputs,
  outputs: [
    { id: 'saving', label: 'Saved per year by rotating', format: 'currency', precision: 2, primary: true, info: 'All-year cost minus rotation cost, summed over all services.' },
    { id: 'allYear', label: 'Cost if kept all year', format: 'currency', precision: 2, info: 'Sum of monthly price × 12.' },
    { id: 'rotating', label: 'Cost if rotated', format: 'currency', precision: 2, info: 'Sum of monthly price × months used.' },
  ],
  compute: (v) => {
    const rows: { n: number; p: number; m: number }[] = [];
    for (let n = 1; n <= 4; n++) {
      const p = num(v[`p${n}`]);
      const m = num(v[`m${n}`]);
      if (p === null && m === null) continue;
      if ((p ?? 0) < 0 || (m ?? 0) < 0 || (m ?? 0) > 12) return { saving: null };
      if ((p ?? 0) > 0) rows.push({ n, p: p ?? 0, m: Math.round(m ?? 0) });
    }
    if (rows.length === 0) return { saving: null };
    const allYear = rows.reduce((s, r) => s + r.p * 12, 0);
    const rotating = rows.reduce((s, r) => s + r.p * r.m, 0);
    const saving = allYear - rotating;
    return {
      saving,
      allYear,
      rotating,
      tone: saving > 0 ? 'good' : 'warn',
      badge: saving > 0 ? `Rotating saves ${money(saving)} a year` : 'No saving: you use them all year',
      note: `Keeping everything all year costs ${money(allYear)}. Subscribing only for the months you use each service costs ${money(rotating)}, a saving of ${money(saving)}. Any gap in access and sign-up offers are not counted.`,
      chart: {
        type: 'bar' as const,
        title: 'Saved per year by service',
        categories: rows.map((r) => `Service ${r.n}`),
        series: [{ name: 'Saved', values: rows.map((r) => r.p * (12 - r.m)) }],
        format: { format: 'currency' as const },
      },
      steps: [
        ...rows.map((r) => `Service ${r.n}: ${money(r.p)} × 12 = ${money(r.p * 12)}; ${money(r.p)} × ${r.m} = ${money(r.p * r.m)}; saves ${money(r.p * (12 - r.m))}`),
        `Total saving = ${money(allYear)} − ${money(rotating)} = ${money(saving)}`,
      ],
    };
  },
  content: {
    formula: [
      'All-year cost = Σ (monthly price × 12)',
      'Rotation cost = Σ (monthly price × months used)',
      'Saving = all-year cost − rotation cost',
    ],
    body: [
      'Many people keep every streaming service running all year while watching only a few shows at a time. Rotating means subscribing for the months you actually watch and cancelling in between. This calculator shows what that would save.',
      'Example: a $17.99 service used 4 months costs 17.99 × 4 = $71.96 against $215.88 for the year, saving $143.92. A $11.99 service used 3 months costs $35.97 against $143.88, saving $107.91. Total saving: $251.83.',
      'Enter up to four services; a row with a price of 0 is ignored. The calculator assumes the price stays the same, that you can resubscribe at will and that nothing is lost between stints, such as saved profiles or downloads. Taxes, annual-plan discounts and sign-up deals are not included. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much can I save by rotating streaming services?', a: 'For each service, the saving is monthly price × (12 − months you use it). A $17.99 service used 4 months saves $143.92 a year.' },
      { q: 'Is rotating worth the hassle?', a: 'It depends on how many months you really use each service. If you use one all year, rotating saves nothing on it.' },
      { q: 'Do I lose my watch history if I cancel?', a: 'That depends on the service, and it is not modelled here. Check its policy before you cancel.' },
      { q: 'What if prices change?', a: 'Enter the current monthly price. The calculator assumes it stays flat for the year.' },
      { q: 'How is this different from the subscription cost calculator?', a: 'That one totals what you pay for subscriptions. This one compares keeping them all year with paying only the months you use each.' },
    ],
    sources: [],
  },
  related: ['subscription-cost', 'free-trial-forgot-cost', 'cost-per-hour-entertainment', 'annual-vs-monthly-plan'],
  examples: [
    // all year (17.99+11.99)*12 = 359.76; rotating 17.99*4+11.99*3 = 71.96+35.97 = 107.93; saving 251.83
    { values: { p1: 17.99, m1: 4, p2: 11.99, m2: 3, p3: 0, m3: 0, p4: 0, m4: 0 }, expect: { allYear: 359.76, rotating: 107.93, saving: 251.83 } },
    // 10*12 = 120; used 12 months -> saving 0
    { values: { p1: 10, m1: 12, p2: 0, m2: 0, p3: 0, m3: 0, p4: 0, m4: 0 }, expect: { allYear: 120, rotating: 120, saving: 0 } },
  ],
});
