import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

const rowInputs = [1, 2, 3, 4].flatMap((n) => [
  { id: `p${n}`, label: `Trial ${n}: monthly price`, type: 'number' as const, prefix: '$', default: n === 1 ? 14.99 : n === 2 ? 9.99 : 0, min: 0, step: 0.01, info: 'What the service charges each month after the trial. Leave at 0 to skip the row.' },
  { id: `m${n}`, label: `Trial ${n}: months forgotten`, type: 'number' as const, default: n === 1 ? 5 : n === 2 ? 8 : 0, min: 0, step: 1, info: 'How many monthly charges you paid before you noticed.' },
]);

export default defineCalculator({
  slug: 'free-trial-forgot-cost',
  title: 'Forgotten Free Trial Cost Calculator',
  category: 'finance',
  description: 'Add up what forgotten free trials cost you: money already paid, and what each would cost if you kept paying for a full year.',
  keywords: ['forgot to cancel free trial cost', 'free trial calculator', 'cost of forgotten subscriptions', 'subscription trial cost', 'hidden subscription cost', 'cancel free trial savings'],
  updated: '2026-11-24',
  popular: false,
  inputs: rowInputs,
  outputs: [
    { id: 'paid', label: 'Paid so far on forgotten trials', format: 'currency', precision: 2, primary: true, info: 'Sum of monthly price × months forgotten for each row.' },
    { id: 'year', label: 'Cost if all kept for 12 months', format: 'currency', precision: 2, info: 'Sum of monthly price × 12 for every row with a price.' },
    { id: 'count', label: 'Trials counted', format: 'number', precision: 0, info: 'Rows with a price above zero.' },
  ],
  compute: (v) => {
    const rows: { n: number; p: number; m: number }[] = [];
    for (let n = 1; n <= 4; n++) {
      const p = num(v[`p${n}`]);
      const m = num(v[`m${n}`]);
      if (p === null && m === null) continue;
      if ((p ?? 0) < 0 || (m ?? 0) < 0) return { paid: null };
      if ((p ?? 0) > 0) rows.push({ n, p: p ?? 0, m: Math.round(m ?? 0) });
    }
    if (rows.length === 0) return { paid: null };
    const paid = rows.reduce((s, r) => s + r.p * r.m, 0);
    const year = rows.reduce((s, r) => s + r.p * 12, 0);
    return {
      paid,
      year,
      count: rows.length,
      tone: paid > 0 ? 'warn' : 'good',
      badge: `${money(paid)} paid, ${money(year)} a year if kept`,
      note: `${rows.length} forgotten trial${rows.length === 1 ? '' : 's'} cost ${money(paid)} so far. Cancelled today, you stop that; kept for a full year they would total ${money(year)}.`,
      chart: {
        type: 'bar' as const,
        title: 'Paid so far by trial',
        categories: rows.map((r) => `Trial ${r.n}`),
        series: [{ name: 'Paid', values: rows.map((r) => r.p * r.m) }],
        format: { format: 'currency' as const },
      },
      steps: [
        ...rows.map((r) => `Trial ${r.n}: ${money(r.p)} × ${r.m} = ${money(r.p * r.m)} (${money(r.p * 12)} for 12 months)`),
        `Total paid = ${money(paid)}; 12-month total = ${money(year)}`,
      ],
    };
  },
  content: {
    formula: [
      'Paid so far = Σ (monthly price × months forgotten)',
      'Cost for a year = Σ (monthly price × 12)',
    ],
    body: [
      'Free trials often convert to paid plans and bill quietly. This calculator adds up what each forgotten trial has cost so far and what it would cost over a full year if you never cancelled.',
      'Example: a $14.99 service forgotten for 5 months cost 14.99 × 5 = $74.95. A $9.99 service forgotten for 8 months cost 9.99 × 8 = $79.92. Together that is $154.87 paid. Kept all year they would cost $179.88 and $119.88, a total of $299.76.',
      'Enter up to four trials. A row with a price of 0 is ignored. Taxes, annual plans, refunds and any introductory discounts are not modelled, so use the amount actually charged each month. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much do forgotten free trials cost?', a: 'Multiply each service\'s monthly price by the months you paid, then add them. $14.99 for 5 months and $9.99 for 8 months comes to $154.87.' },
      { q: 'What does the 12-month figure mean?', a: 'It is the monthly price × 12 for every trial you list, which is what you would pay if you never cancelled. For the example, $299.76.' },
      { q: 'Can I get a refund?', a: 'Sometimes. Policies vary by service, and this calculator does not model refunds. Ask the service or your card issuer.' },
      { q: 'How do I find forgotten trials?', a: 'Scan your bank and card statements for small repeating charges, and check your app store subscription list.' },
      { q: 'Does it handle annual plans?', a: 'Not directly. Divide the yearly price by 12 and enter that as the monthly price.' },
    ],
    sources: [],
  },
  related: ['subscription-cost', 'cost-per-hour-entertainment', 'annual-vs-monthly-plan', 'cost-per-use'],
  examples: [
    // 14.99*5 = 74.95; 9.99*8 = 79.92; paid 154.87; year (14.99+9.99)*12 = 299.76
    { values: { p1: 14.99, m1: 5, p2: 9.99, m2: 8, p3: 0, m3: 0, p4: 0, m4: 0 }, expect: { paid: 154.87, year: 299.76, count: 2 } },
    // 20*3 = 60; year 240
    { values: { p1: 20, m1: 3, p2: 0, m2: 0, p3: 0, m3: 0, p4: 0, m4: 0 }, expect: { paid: 60, year: 240, count: 1 } },
  ],
});
