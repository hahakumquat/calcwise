import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'salary-growth-projection',
  title: 'Salary Growth Calculator: Career Earnings',
  seoTitle: 'Salary Growth Calculator',
  metaDescription: 'See what an annual raise adds up to over a career: your salary in the final year, total lifetime earnings and how much of it comes from raises.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Project your salary and total earnings over the years if you get the same raise every year.',
  keywords: ['salary growth calculator', 'career earnings calculator', 'annual raise calculator over time', 'lifetime earnings calculator', 'salary projection'],
  popular: false,
  inputs: [
    { id: 'salary', label: 'Current salary', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, info: 'Gross yearly pay in your first year.' },
    { id: 'raise', label: 'Annual raise', type: 'number', suffix: '%', default: 3, min: 0, max: 30, step: 0.5, info: 'Applied at the start of every year after the first.' },
    { id: 'years', label: 'Years', type: 'number', default: 30, min: 1, max: 60, step: 1, info: 'How many years you will work.' },
  ],
  outputs: [
    { id: 'total', label: 'Total earned over the years', format: 'currency', precision: 0, primary: true, info: 'Sum of every year’s salary.' },
    { id: 'final', label: 'Salary in the final year', format: 'currency', precision: 0, info: 'Salary × (1 + raise)^(years − 1).' },
    { id: 'flat', label: 'Total with no raises', format: 'currency', precision: 0, info: 'Salary × years.' },
    { id: 'extra', label: 'Added by raises', format: 'currency', precision: 0, info: 'Total earned minus total with no raises.' },
  ],
  compute: (v) => {
    const s = num(v.salary), r = num(v.raise), y = num(v.years);
    if (s === null || r === null || y === null) return { total: null };
    if (s < 0 || r < 0) return { total: null, error: 'Salary and raise cannot be negative.' };
    if (y < 1) return { total: null, error: 'Enter at least 1 year.' };
    const n = Math.min(60, Math.floor(y));
    const g = r / 100;
    const total = g === 0 ? s * n : (s * (Math.pow(1 + g, n) - 1)) / g;
    const final = s * Math.pow(1 + g, n - 1);
    const flat = s * n;
    const extra = total - flat;
    const xs: number[] = [];
    const withRaises: number[] = [];
    const noRaises: number[] = [];
    for (let k = 1; k <= n; k++) {
      xs.push(k);
      withRaises.push(+(s * Math.pow(1 + g, k - 1)).toFixed(2));
      noRaises.push(+s.toFixed(2));
    }
    return {
      total,
      final,
      flat,
      extra,
      tone: 'good',
      badge: extra > 0 ? `Raises add ${money(extra, 0)}` : 'No raises: pay stays flat',
      chart: {
        type: 'line',
        title: 'Salary by year',
        x: xs,
        xLabel: 'Year',
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: `${r}% raise a year`, values: withRaises },
          { name: 'No raises', values: noRaises },
        ],
      },
      steps: [
        `Final-year salary = ${money(s, 0)} × (1 + ${r}%)^${n - 1} = ${money(final, 0)}`,
        g === 0 ? `Total = ${money(s, 0)} × ${n} = ${money(total, 0)}` : `Total = ${money(s, 0)} × ((1 + ${r}%)^${n} − 1) ÷ ${r}% = ${money(total, 0)}`,
        `No raises = ${money(s, 0)} × ${n} = ${money(flat, 0)}; raises add ${money(extra, 0)}`,
      ],
      note: 'Gross pay before tax, assuming the same raise every year with no job changes or gaps. Not adjusted for inflation.',
    };
  },
  content: {
    formula: [
      'Salary in year k = starting salary × (1 + raise)^(k − 1)',
      'Total earned = starting salary × ((1 + raise)^years − 1) ÷ raise',
      'With a 0% raise, total = starting salary × years',
    ],
    body: [
      'A small annual raise compounds. This calculator shows what the same raise every year does to your pay and to everything you earn over a career.',
      'Starting at $60,000 with a 3% raise for 30 years, your pay reaches $141,394 in the final year and you earn $2,854,525 in total. With no raises you would earn $1,800,000, so the raises add $1,054,525.',
    ],
    sections: [
      {
        heading: 'What this leaves out',
        paragraphs: [
          'Figures are gross, before tax, and in future dollars: they are not adjusted for inflation, so a 3% raise in a 3% inflation world is a flat real salary. Promotions, job changes, bonuses and time out of work are not modelled. For a single raise, see the raise calculator.',
        ],
      },
    ],
    faq: [
      { q: 'How much does a 3% raise add up to over 30 years?', a: 'From $60,000, the salary reaches $141,394 in year 30 and total earnings are $2,854,525, which is $1,054,525 more than no raises at all.' },
      { q: 'Is the first-year salary raised?', a: 'No. Year 1 pays your current salary; the first raise applies in year 2.' },
      { q: 'Is this adjusted for inflation?', a: 'No. Amounts are future dollars. If inflation is as high as your raise, your buying power does not grow.' },
      { q: 'Does it include tax or bonuses?', a: 'No. It uses gross salary only.' },
    ],
    sources: [{ label: 'Compound growth and the geometric series sum; no external data' }],
  },
  related: ['raise-calculator', 'inflation', 'bonus-vs-raise', 'salary-needed'],
  examples: [
    // 60000 × (1.03^30 − 1)/0.03; final 60000 × 1.03^29
    { values: { salary: 60000, raise: 3, years: 30 }, expect: { total: 2854524.94, final: 141393.93, flat: 1800000, extra: 1054524.94 }, tolerance: 1e-3 },
    // 50000 × (1.05^10 − 1)/0.05; final 50000 × 1.05^9
    { values: { salary: 50000, raise: 5, years: 10 }, expect: { total: 628894.63, final: 77566.41, flat: 500000, extra: 128894.63 }, tolerance: 1e-3 },
    // 0% raise: flat
    { values: { salary: 80000, raise: 0, years: 5 }, expect: { total: 400000, final: 80000, flat: 400000, extra: 0 }, tolerance: 1e-6 },
  ],
});
