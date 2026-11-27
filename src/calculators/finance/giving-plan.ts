import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'giving-plan',
  title: 'Yearly Giving Plan Calculator',
  category: 'finance',
  description: 'Turn a percent of your income into a yearly, monthly and per-paycheck giving amount, then split it across the causes you want to support.',
  keywords: ['giving plan calculator', 'charity budget calculator', 'how much to donate per year', 'percent of income to give', 'tithe calculator', 'monthly giving budget'],
  updated: '2026-11-27',
  inputs: [
    { id: 'income', label: 'Yearly income', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, info: 'The income you want to base your giving on. Gross or take-home are both fine, just be consistent.' },
    { id: 'pct', label: 'Share of income to give', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 0.5, info: 'The percent of that income you want to give each year.' },
    { id: 'paychecks', label: 'Paychecks per year', type: 'number', default: 26, min: 1, step: 1, info: 'For example 52 weekly, 26 every two weeks, 24 twice a month, 12 monthly.' },
    { id: 'share1', label: 'Share to cause A', type: 'number', suffix: '%', default: 50, min: 0, max: 100, step: 5, info: 'Percent of your giving that goes to the first cause.' },
    { id: 'share2', label: 'Share to cause B', type: 'number', suffix: '%', default: 30, min: 0, max: 100, step: 5, info: 'Percent of your giving that goes to the second cause. Whatever is left goes to cause C.' },
  ],
  outputs: [
    { id: 'yearly', label: 'Giving per year', format: 'currency', primary: true, info: 'Yearly income × share to give.' },
    { id: 'monthly', label: 'Giving per month', format: 'currency', info: 'Yearly giving ÷ 12.' },
    { id: 'perPaycheck', label: 'Giving per paycheck', format: 'currency', info: 'Yearly giving ÷ paychecks per year.' },
    { id: 'causeA', label: 'Cause A per year', format: 'currency', info: 'Yearly giving × share to cause A.' },
    { id: 'causeB', label: 'Cause B per year', format: 'currency', info: 'Yearly giving × share to cause B.' },
    { id: 'causeC', label: 'Cause C per year', format: 'currency', info: 'Yearly giving × the remaining share.' },
  ],
  compute: (v) => {
    const income = num(v.income);
    const pct = num(v.pct);
    const paychecks = num(v.paychecks);
    const s1 = num(v.share1) ?? 0;
    const s2 = num(v.share2) ?? 0;
    if (income === null || pct === null || paychecks === null || income < 0 || pct < 0 || pct > 100 || paychecks < 1 || s1 < 0 || s2 < 0) return { yearly: null };
    if (s1 + s2 > 100) return { yearly: null, error: 'Cause A and cause B shares add up to more than 100%. Lower one of them.' };
    const s3 = 100 - s1 - s2;
    const yearly = (income * pct) / 100;
    const monthly = yearly / 12;
    const perPaycheck = yearly / paychecks;
    const a = (yearly * s1) / 100;
    const b = (yearly * s2) / 100;
    const c = (yearly * s3) / 100;
    return {
      yearly,
      monthly,
      perPaycheck,
      causeA: a,
      causeB: b,
      causeC: c,
      tone: 'good' as const,
      badge: `${fmt(pct, 1)}% of income`,
      note: `Giving ${fmt(pct, 1)}% of $${fmt(income)} is $${fmt(yearly, 2)} a year, or $${fmt(monthly, 2)} a month and $${fmt(perPaycheck, 2)} per paycheck.`,
      chart:
        yearly > 0
          ? {
              type: 'donut',
              title: 'Where the year of giving goes ($)',
              slices: [
                { label: `Cause A (${fmt(s1, 1)}%)`, value: a },
                { label: `Cause B (${fmt(s2, 1)}%)`, value: b },
                { label: `Cause C (${fmt(s3, 1)}%)`, value: c },
              ].filter((s) => s.value > 0),
              format: { format: 'currency' },
              centerLabel: 'Per year',
              centerValue: `$${fmt(yearly)}`,
            }
          : undefined,
      steps: [
        `Yearly giving = $${fmt(income)} × ${fmt(pct, 2)}% = $${fmt(yearly, 2)}`,
        `Per month = $${fmt(yearly, 2)} ÷ 12 = $${fmt(monthly, 2)}`,
        `Per paycheck = $${fmt(yearly, 2)} ÷ ${fmt(paychecks)} = $${fmt(perPaycheck, 2)}`,
        `Split: A ${fmt(s1, 1)}% = $${fmt(a, 2)}, B ${fmt(s2, 1)}% = $${fmt(b, 2)}, C ${fmt(s3, 1)}% = $${fmt(c, 2)}`,
      ],
    };
  },
  content: {
    formula: [
      'Yearly giving = yearly income × share to give',
      'Monthly = yearly ÷ 12; per paycheck = yearly ÷ paychecks per year',
      'Cause amount = yearly giving × cause share; cause C share = 100% − A − B',
    ],
    body: [
      'Planning your giving as a percent of income turns a vague intention into a number you can budget for. Pick a share, and the calculator shows the yearly total, the monthly amount and what to set aside from each paycheck.',
      'Splitting the total across causes up front also makes year-end decisions easier: you already know how much each one gets. Cause C takes whatever share is left after A and B.',
      'This is a planning tool for your own budget, not tax or financial advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much is 5% of a $60,000 income?', a: '$60,000 × 5% = $3,000 a year. That is $250 a month, or $115.38 per paycheck if you are paid 26 times a year.' },
      { q: 'How does the split across causes work?', a: 'Each cause gets its share of the yearly total. With $3,000 and shares of 50%, 30% and the remaining 20%, the amounts are $1,500, $900 and $600.' },
      { q: 'What if I am paid twice a month?', a: 'Enter 24 paychecks per year. At $8,500 a year of giving, that is $8,500 ÷ 24 = $354.17 per paycheck, and $708.33 a month.' },
      { q: 'Should I use gross or take-home income?', a: 'Either works. Use the one you think in, and keep it the same from year to year so the percent means the same thing.' },
    ],
  },
  related: ['charitable-giving-tax-value', 'donate-stock-vs-cash', 'budget-50-30-20', 'paycheck-bill-planner'],
  examples: [
    // yearly 60000 x 5% = 3000; monthly 250; per paycheck 3000/26 = 115.3846; A 1500, B 900, C 20% = 600.
    { values: { income: 60000, pct: 5, paychecks: 26, share1: 50, share2: 30 }, expect: { yearly: 3000, monthly: 250, perPaycheck: 3000 / 26, causeA: 1500, causeB: 900, causeC: 600 }, tolerance: 1e-9 },
    // yearly 85000 x 10% = 8500; monthly 708.3333; per paycheck 8500/24 = 354.1667; A 60% = 5100, B 30% = 2550, C 10% = 850.
    { values: { income: 85000, pct: 10, paychecks: 24, share1: 60, share2: 30 }, expect: { yearly: 8500, monthly: 8500 / 12, perPaycheck: 8500 / 24, causeA: 5100, causeB: 2550, causeC: 850 }, tolerance: 1e-9 },
  ],
});
