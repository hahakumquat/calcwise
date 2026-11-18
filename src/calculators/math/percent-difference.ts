import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'percent-difference',
  title: 'Percent Difference Calculator',
  category: 'math',
  description: 'Find the percent difference between two numbers, using their average as the base. Shows the working and how it differs from percentage change.',
  keywords: ['percent difference calculator', 'percentage difference', 'percent difference formula', 'difference between two numbers percent', 'symmetric percent difference'],
  inputs: [
    { id: 'a', label: 'First value', type: 'number', default: 40, info: 'One of the two numbers you want to compare.' },
    { id: 'b', label: 'Second value', type: 'number', default: 60, info: 'The other number. Order does not matter for percent difference.' },
  ],
  outputs: [
    { id: 'pd', label: 'Percent difference', format: 'percent', precision: 4, primary: true, info: 'The gap between the two values divided by their average. It gives the same answer whichever number you list first.' },
    { id: 'diff', label: 'Absolute difference', precision: 6, info: 'The plain size of the gap: |first − second|.' },
    { id: 'avg', label: 'Average of the two', precision: 6, info: 'The midpoint of the two values, used as the base for the percentage.' },
    { id: 'change', label: 'Percentage change (first to second)', format: 'percent', precision: 4, info: 'For comparison: the change from the first value to the second, using the first as the base. It is not symmetric.' },
  ],
  compute: (v) => {
    const a = num(v.a);
    const b = num(v.b);
    if (a === null || b === null) return { pd: null };
    const avg = (a + b) / 2;
    if (avg === 0) return { pd: null, note: 'Percent difference is undefined when the two values average to zero.' };
    const diff = Math.abs(a - b);
    const pd = diff / Math.abs(avg);
    return {
      pd,
      diff,
      avg,
      change: a === 0 ? null : (b - a) / Math.abs(a),
      chart: { type: 'bar', title: 'The two values and their average', categories: ['First', 'Second', 'Average'], series: [{ name: 'Value', values: [a, b, avg] }], highlight: 2 },
      steps: [
        `Difference = |${fmt(a)} − ${fmt(b)}| = ${fmt(diff)}`,
        `Average = (${fmt(a)} + ${fmt(b)}) ÷ 2 = ${fmt(avg)}`,
        `Percent difference = ${fmt(diff)} ÷ |${fmt(avg)}| = ${fmt(pd)} → ${fmt(pd * 100, 6)}%`,
      ],
    };
  },
  content: {
    formula: ['Percent difference = |a − b| ÷ ((a + b) ÷ 2) × 100'],
    body: [
      'Percent difference compares two numbers when neither one is the “original”. Two stores quote $40 and $60 for the same item; two labs measure 10 and 20 units. Instead of picking one as the base, you divide the gap by the average of the two.',
      'For 40 and 60 the gap is 20 and the average is 50, so the percent difference is 20 ÷ 50 = 40%. Swap the numbers and you still get 40%. That symmetry is the point.',
      'Percentage change is different. It treats the first number as the starting point: going from 40 to 60 is a 50% increase, but going from 60 to 40 is a 33.3% decrease. Use percent difference when there is no before and after, and percentage change when there is.',
    ],
    faq: [
      { q: 'How do you calculate percent difference?', a: 'Subtract the two numbers, take the absolute value, divide by their average, and multiply by 100. For 10 and 20: 10 ÷ 15 = 66.67%.' },
      { q: 'What is the difference between percent difference and percentage change?', a: 'Percent difference uses the average of both values as the base and ignores order. Percentage change uses the starting value as the base and has a direction. From 40 to 60, the percent difference is 40% but the percentage change is 50%.' },
      { q: 'Can percent difference be over 100%?', a: 'Yes. It can reach 200% when one value is zero and the other is not, since the gap then equals twice the average.' },
    ],
  },
  related: ['percentage-change', 'percent-error', 'percentage', 'ratio'],
  examples: [
    { values: { a: 40, b: 60 }, expect: { pd: 0.4, diff: 20, avg: 50, change: 0.5 }, tolerance: 1e-9 },
    { values: { a: 10, b: 20 }, expect: { pd: 0.6666667 }, tolerance: 1e-6 },
    { values: { a: 0, b: 8 }, expect: { pd: 2, diff: 8, avg: 4 }, tolerance: 1e-9 },
  ],
});
