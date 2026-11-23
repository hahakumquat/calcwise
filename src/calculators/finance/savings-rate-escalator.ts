import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'savings-rate-escalator',
  title: 'Savings Rate Escalator Calculator',
  seoTitle: 'Savings Rate Escalator Calculator',
  metaDescription: 'Raise your savings rate by 1 point a year up to a cap and see how much more you save than with a flat rate, with optional pay growth and returns.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'See what raising your savings rate a little each year adds up to, compared with keeping it flat.',
  keywords: ['savings rate escalator', 'increase savings rate every year', 'auto escalate savings', 'save more tomorrow calculator', 'raise savings 1 percent a year'],
  popular: false,
  inputs: [
    { id: 'income', label: 'Yearly income', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, info: 'Gross pay, or whatever pay you measure your savings rate against.' },
    { id: 'start', label: 'Starting savings rate', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 0.5, info: 'Share of income you save in year one.' },
    { id: 'step', label: 'Increase each year', type: 'number', suffix: 'points', default: 1, min: 0, max: 20, step: 0.5, info: 'Percentage points added to the rate every year.' },
    { id: 'cap', label: 'Stop increasing at', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 1, info: 'The rate never goes above this.' },
    { id: 'years', label: 'Years', type: 'number', suffix: 'years', default: 10, min: 1, max: 50, step: 1, info: 'How long you keep saving.' },
    { id: 'growth', label: 'Yearly pay growth (optional)', type: 'number', suffix: '%', default: 0, min: 0, max: 20, step: 0.5, info: 'Enter 0 to keep income flat.' },
    { id: 'ret', label: 'Yearly investment return (optional)', type: 'number', suffix: '%', default: 0, min: 0, max: 20, step: 0.5, info: 'Enter 0 to count only the money you put in. Savings are added at the end of each year.' },
  ],
  outputs: [
    { id: 'total', label: 'Saved with the escalator', format: 'currency', precision: 0, primary: true, info: 'Final balance. With 0% return this is just the sum of what you saved.' },
    { id: 'flat', label: 'Saved at a flat starting rate', format: 'currency', precision: 0, info: 'Same income and return, but the rate never changes.' },
    { id: 'extra', label: 'Extra from escalating', format: 'currency', precision: 0, info: 'Escalator minus flat.' },
    { id: 'finalRate', label: 'Rate in the last year', format: 'percent', precision: 1, info: 'Where the rate ends up after the steps and the cap.' },
    { id: 'contrib', label: 'Total you put in', format: 'currency', precision: 0, info: 'Contributions only, without returns.' },
  ],
  compute: (v) => {
    const income = num(v.income);
    const start = num(v.start);
    const step = num(v.step);
    const cap = num(v.cap);
    const years = num(v.years);
    const growth = num(v.growth);
    const ret = num(v.ret);
    if (income === null || start === null || step === null || cap === null || years === null || growth === null || ret === null) return { total: null };
    if (income <= 0) return { total: null, error: 'Enter a yearly income above $0.' };
    if (start < 0 || step < 0 || cap < 0 || growth < 0 || ret < 0) return { total: null, error: 'Rates and steps cannot be negative.' };
    if (start > 100 || cap > 100) return { total: null, error: 'A savings rate cannot be above 100%.' };
    if (years < 1) return { total: null, error: 'Use at least 1 year.' };

    const n = Math.floor(years);
    const g = growth / 100;
    const r = ret / 100;
    const rateAt = (y: number) => Math.max(start, Math.min(cap, start + step * (y - 1)));
    let bal = 0;
    let flatBal = 0;
    let contrib = 0;
    const x = [0];
    const escSeries = [0];
    const flatSeries = [0];
    for (let y = 1; y <= n; y++) {
      const inc = income * Math.pow(1 + g, y - 1);
      const saved = (inc * rateAt(y)) / 100;
      contrib += saved;
      bal = bal * (1 + r) + saved;
      flatBal = flatBal * (1 + r) + (inc * start) / 100;
      x.push(y);
      escSeries.push(+bal.toFixed(2));
      flatSeries.push(+flatBal.toFixed(2));
    }
    const finalRate = rateAt(n);
    const extra = bal - flatBal;
    return {
      total: bal,
      flat: flatBal,
      extra,
      finalRate: finalRate / 100,
      contrib,
      tone: 'good',
      badge: `Ends at ${+finalRate.toFixed(1)}% a year`,
      chart: {
        type: 'line',
        title: 'Savings: escalating rate vs flat rate',
        x,
        xLabel: 'Years',
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: 'Escalating rate', values: escSeries },
          { name: 'Flat rate', values: flatSeries },
        ],
      },
      steps: [
        `Rate in year y = start + step × (y − 1), capped at ${cap}%: ${start}% in year 1, ${+finalRate.toFixed(1)}% in year ${n}`,
        `Saved each year = income × rate${growth > 0 ? ` (income grows ${growth}% a year)` : ''}`,
        `Balance = last balance × (1 + ${ret}%) + this year's savings`,
        `Escalator ${money(bal, 0)} minus flat ${money(flatBal, 0)} = ${money(extra, 0)} extra`,
      ],
      note: `Starting at ${start}% and adding ${step} point${step === 1 ? '' : 's'} a year (cap ${cap}%) gives ${money(bal, 0)} after ${n} years, ${money(extra, 0)} more than staying at ${start}%.`,
    };
  },
  content: {
    formula: [
      'Rate in year y = min(cap, start + step × (y − 1))',
      'Saved in year y = income × (1 + pay growth)^(y − 1) × rate',
      'Balance = previous balance × (1 + return) + saved in year y',
    ],
    body: [
      'Many people never feel a 1 point rise in their savings rate, because it is spread across a year of pay. This calculator shows what small yearly steps add up to compared with staying at the same rate.',
      'For $60,000 a year, starting at 5% and adding 1 point a year up to 15%, ten years of saving at 5% to 14% adds up to $57,000. Staying at 5% would save $30,000.',
    ],
    sections: [
      {
        heading: 'How to use it',
        paragraphs: [
          'Set a starting rate you already manage, a step small enough to ignore, and a cap you could live with. Add pay growth and a return only if you want a rough balance; leave both at 0% to see just the money you put in. Savings are added at the end of each year, so real monthly deposits would earn slightly more.',
        ],
      },
    ],
    faq: [
      { q: 'How much does raising my savings rate 1 point a year add?', a: 'With $60,000 income, a 5% start, a 1 point step and a 15% cap, 10 years saves $57,000 against $30,000 at a flat 5%, so $27,000 more.' },
      { q: 'What happens once I reach the cap?', a: 'The rate stays at the cap. For the same example over 15 years the rates run 5% to 15% and then stay at 15% for 4 more years, which totals $102,000.' },
      { q: 'Does this include investment returns?', a: 'Only if you enter a return above 0%. Savings are added at the end of each year before they earn anything.' },
      { q: 'Is this a recommendation?', a: 'No. It is arithmetic on your own figures. A suitable rate depends on your goals and debts.' },
    ],
    sources: [{ label: 'Simple arithmetic on your own figures; no external data' }],
  },
  related: ['savings-goal', 'employer-match-calculator', 'raise-calculator', 'lifestyle-creep'],
  examples: [
    // rates 5..14 sum 95 => 60000*0.95 = 57000; flat 5% = 30000; extra 27000
    { values: { income: 60000, start: 5, step: 1, cap: 15, years: 10, growth: 0, ret: 0 }, expect: { total: 57000, flat: 30000, extra: 27000, contrib: 57000, finalRate: 0.14 }, tolerance: 1e-6 },
    // rates 5..15 sum 110 + 4*15 = 170 => 102000
    { values: { income: 60000, start: 5, step: 1, cap: 15, years: 15, growth: 0, ret: 0 }, expect: { total: 102000, finalRate: 0.15 }, tolerance: 1e-6 },
    // 3 years 7%: saved 3000,3600,4200: 3000 -> 6810 -> 11486.70; flat 3000 -> 6210 -> 9644.70
    { values: { income: 60000, start: 5, step: 1, cap: 15, years: 3, growth: 0, ret: 7 }, expect: { total: 11486.7, flat: 9644.7, extra: 1842 }, tolerance: 1e-6 },
  ],
});
