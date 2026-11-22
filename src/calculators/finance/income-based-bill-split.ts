import { defineCalculator } from '../../lib/types';
import type { ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct } from '../../lib/helpers/finance';

const nameOf = (x: unknown, fallback: string) => (typeof x === 'string' && x.trim() ? x.trim().slice(0, 30) : fallback);

export default defineCalculator({
  slug: 'income-based-bill-split',
  title: 'Split Bills by Income (Fair Share) Calculator',
  category: 'finance',
  description: 'Split rent and shared bills between two people in proportion to income, and see each share as a percent of pay and how it differs from a 50/50 split.',
  keywords: ['split bills by income', 'income based bill split calculator', 'proportional rent split', 'split expenses by salary', 'fair bill split couples', 'split rent by income'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'nameA', label: 'First person (optional name)', type: 'text', default: 'Person A', placeholder: 'Person A', optional: true, info: 'A label used in the results and chart. Leave blank to use Person A.' },
    { id: 'incomeA', label: 'First person monthly income', type: 'number', prefix: '$', default: 4000, min: 0, step: 100, info: 'Take-home pay per month, after tax. Use the same basis (after tax) for both people.' },
    { id: 'nameB', label: 'Second person (optional name)', type: 'text', default: 'Person B', placeholder: 'Person B', optional: true, info: 'A label used in the results and chart. Leave blank to use Person B.' },
    { id: 'incomeB', label: 'Second person monthly income', type: 'number', prefix: '$', default: 2000, min: 0, step: 100, info: 'Take-home pay per month, after tax. Use the same basis (after tax) for both people.' },
    { id: 'bills', label: 'Total shared bills per month', type: 'number', prefix: '$', default: 2400, min: 0, step: 50, info: 'Everything you split each month, such as rent, utilities and internet.' },
  ],
  outputs: [
    { id: 'shareA', label: 'First person pays', format: 'currency', primary: true, info: 'Total bills × first person’s income ÷ combined income.' },
    { id: 'shareB', label: 'Second person pays', format: 'currency', info: 'Total bills × second person’s income ÷ combined income.' },
    { id: 'pctA', label: 'First person: share of own income', format: 'percent', precision: 1, info: 'Their share of the bills divided by their income.' },
    { id: 'pctB', label: 'Second person: share of own income', format: 'percent', precision: 1, info: 'Their share of the bills divided by their income. Equal to the first person’s percent, by design.' },
    { id: 'even', label: 'Each pays in a 50/50 split', format: 'currency', info: 'Total bills ÷ 2.' },
    { id: 'diffMonth', label: 'Difference vs 50/50 per month', format: 'currency', info: 'How much more the higher earner pays (and the lower earner saves) each month compared with an even split.' },
    { id: 'diffYear', label: 'Difference vs 50/50 per year', format: 'currency', info: 'The monthly difference × 12.' },
  ],
  compute: (v) => {
    const a = num(v.incomeA);
    const b = num(v.incomeB);
    const bills = num(v.bills);
    if (a === null || b === null || bills === null) return { shareA: null };
    if (a < 0 || b < 0 || bills < 0) return { shareA: null, error: 'Incomes and bills cannot be negative.' };
    const total = a + b;
    if (total <= 0) return { shareA: null, error: 'Enter an income for at least one person.' };

    const nA = nameOf(v.nameA, 'Person A');
    const nB = nameOf(v.nameB, 'Person B');
    const shareA = (bills * a) / total;
    const shareB = (bills * b) / total;
    const pctA = a > 0 ? shareA / a : 0;
    const pctB = b > 0 ? shareB / b : 0;
    const even = bills / 2;
    const diffMonth = Math.abs(shareA - even);
    const diffYear = diffMonth * 12;
    const higher = shareA > even ? nA : shareB > even ? nB : null;

    const chart: ChartSpec = {
      type: 'bar',
      title: 'Monthly share: by income vs 50/50',
      categories: [nA, nB],
      series: [
        { name: 'By income', values: [shareA, shareB] },
        { name: '50/50', values: [even, even] },
      ],
      format: { format: 'currency' },
    };

    return {
      shareA,
      shareB,
      pctA,
      pctB,
      even,
      diffMonth,
      diffYear,
      tone: 'ok',
      badge: higher ? `${higher} pays ${money(diffMonth, 0)} more than 50/50` : 'Same as a 50/50 split',
      chart,
      steps: [
        `Combined income = ${money(a)} + ${money(b)} = ${money(total)}`,
        `${nA} pays ${money(bills)} × ${money(a)} ÷ ${money(total)} = ${money(shareA)} (${pct(pctA, 1)} of their income)`,
        `${nB} pays ${money(bills)} × ${money(b)} ÷ ${money(total)} = ${money(shareB)} (${pct(pctB, 1)} of their income)`,
        `50/50 would be ${money(bills)} ÷ 2 = ${money(even)} each, so the difference is ${money(diffMonth)} a month, ${money(diffYear)} a year`,
      ],
      note: 'Splitting by income is one approach to fairness, not the only one, and not financial advice. Agree on what feels right for both of you.',
    };
  },
  content: {
    formula: [
      'Share = total bills × own income ÷ combined income',
      'Share of own income = share ÷ own income (the same for both people)',
      '50/50 share = total bills ÷ 2',
      'Difference vs 50/50 = |share − 50/50 share|, per month and × 12 per year',
    ],
    body: [
      'Splitting everything 50/50 is simple, but it can hit the lower earner much harder. If one of you takes home $4,000 a month and the other $2,000, an even split of $2,400 in bills costs $1,200 each: 30% of one income and 60% of the other.',
      'Splitting by income fixes that by giving each person the same percentage of their own pay. Here the combined income is $6,000 and the bills are $2,400, so each person pays 40% of take-home: $1,600 and $800. Compared with 50/50, the higher earner pays $400 more a month, or $4,800 a year.',
      'Use take-home (after-tax) income for both people, and the same basis for each. This is one approach to fairness, not the only one. Some couples prefer an even split, or a shared pot plus personal spending money.',
    ],
    sections: [
      {
        heading: 'Proportional, equal-percent and 50/50',
        paragraphs: [
          'A proportional split and an equal-percent-of-income split are the same thing: if each person pays the same percentage of their own income, their shares are automatically in proportion to their incomes. A 50/50 split is the special case that only matches when incomes are equal.',
          'When both incomes are the same, all three methods give identical amounts. As the gap in pay widens, the proportional split moves further away from 50/50.',
        ],
      },
      {
        heading: 'Things to agree on first',
        paragraphs: [
          'Decide which bills go in the shared pot (rent, utilities, groceries) and which stay personal. Revisit the split when either income changes, and decide how to handle months with no income. This calculator treats the incomes you enter as steady monthly amounts.',
        ],
      },
    ],
    faq: [
      { q: 'How do you split bills by income?', a: 'Divide each person’s income by the combined income and multiply by the total bills. With $4,000 and $2,000 of income and $2,400 of bills, the shares are $1,600 and $800.' },
      { q: 'Is a proportional split the same as paying an equal percentage of income?', a: 'Yes. In the example above both people pay 40% of their own income ($1,600 of $4,000 and $800 of $2,000), which is why the shares are in proportion to income.' },
      { q: 'How much more does the higher earner pay than in a 50/50 split?', a: 'In the same example a 50/50 split is $1,200 each, so the higher earner pays $400 more a month, which is $4,800 a year, and the other person pays $400 less.' },
      { q: 'Should I use gross or after-tax income?', a: 'Use after-tax (take-home) income for both, because that is the money you actually have to pay bills with. Mixing gross and net would skew the split.' },
      { q: 'Is splitting by income the fairest way?', a: 'It is one common view of fairness, not a rule. Some people prefer 50/50 for simplicity. The calculator just shows the numbers so you can decide together. It is not financial advice.' },
      { q: 'What if our incomes are equal?', a: 'Then the income-based split and the 50/50 split are the same, and the difference shows as $0.' },
    ],
    sources: [],
  },
  related: ['rent-split', 'bill-splitter', 'rent-affordability', 'budget-50-30-20'],
  examples: [
    // Combined 6,000. A = 2400 x 4000/6000 = 1,600 (40% of 4,000); B = 2400 x 2000/6000 = 800 (40% of 2,000). 50/50 = 1,200; diff 400/month = 4,800/year.
    { values: { incomeA: 4000, incomeB: 2000, bills: 2400 }, expect: { shareA: 1600, shareB: 800, pctA: 0.4, pctB: 0.4, even: 1200, diffMonth: 400, diffYear: 4800 }, tolerance: 1e-6 },
    // Equal incomes: 1,000 each, 50/50 identical, no difference. 1000/3000 = 33.33%.
    { values: { incomeA: 3000, incomeB: 3000, bills: 2000 }, expect: { shareA: 1000, shareB: 1000, even: 1000, diffMonth: 0, diffYear: 0, pctA: 1 / 3 }, tolerance: 1e-6 },
    // Names do not change the maths. 1500 x 1500/2500 = 900; 1500 x 1000/2500 = 600; 50/50 = 750; diff 150.
    { values: { nameA: 'Sam', nameB: 'Alex', incomeA: 1500, incomeB: 1000, bills: 1500 }, expect: { shareA: 900, shareB: 600, even: 750, diffMonth: 150, diffYear: 1800 }, tolerance: 1e-6 },
  ],
});
