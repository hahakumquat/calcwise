import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export default defineCalculator({
  slug: 'rep-challenge',
  title: 'Rep Challenge Calculator: Total Reps in 30 Days',
  category: 'health',
  description: 'Start at a few reps and add a fixed number each day. See your final-day reps, the total for the whole challenge and a day-by-day chart.',
  keywords: ['push up challenge calculator', '30 day squat challenge total', 'rep challenge total', 'daily reps increase calculator', 'plank challenge'],
  updated: '2026-11-27',
  inputs: [
    { id: 'start', label: 'Reps on day 1', type: 'number', default: 10, min: 1, step: 1, info: 'How many reps you do on the first day.' },
    { id: 'inc', label: 'Reps added each day', type: 'number', default: 2, min: 0, step: 1, info: 'The daily increase. Use 0 for the same number every day.' },
    { id: 'days', label: 'Number of days', type: 'number', default: 30, min: 1, step: 1, info: 'How long the challenge runs.' },
  ],
  outputs: [
    { id: 'total', label: 'Total reps', format: 'number', primary: true, info: 'Sum of every day of the challenge.' },
    { id: 'last', label: 'Reps on the final day', format: 'number', info: 'Day 1 reps + (days − 1) × daily increase.' },
    { id: 'avg', label: 'Average per day', format: 'number', info: 'Total reps ÷ number of days.' },
  ],
  compute: (v) => {
    const a = num(v.start), d = num(v.inc), n = num(v.days);
    if (a === null || d === null || n === null) return { total: null };
    if (!Number.isInteger(a) || a < 1) return { total: null, error: 'Enter whole reps for day 1 (at least 1).' };
    if (!Number.isInteger(d) || d < 0) return { total: null, error: 'Enter a whole daily increase of 0 or more.' };
    if (!Number.isInteger(n) || n < 1 || n > 365) return { total: null, error: 'Enter a whole number of days from 1 to 365.' };
    const last = a + (n - 1) * d;
    const total = (n * (2 * a + (n - 1) * d)) / 2;
    const x: string[] = [], vals: number[] = [];
    for (let i = 1; i <= n; i++) { x.push(String(i)); vals.push(a + (i - 1) * d); }
    return {
      total, last, avg: total / n,
      chart: { type: 'line', title: 'Reps each day', x, series: [{ name: 'Reps', values: vals }] },
      steps: [
        `Final day: ${fmt(a)} + (${fmt(n)} − 1) × ${fmt(d)} = ${fmt(last)} reps`,
        `Total: ${fmt(n)} ÷ 2 × (2 × ${fmt(a)} + (${fmt(n)} − 1) × ${fmt(d)}) = ${fmt(total)} reps`,
        `Average: ${fmt(total)} ÷ ${fmt(n)} = ${(total / n).toFixed(1)} reps a day`,
      ],
      note: 'Build up gradually and stop if something hurts. This is a counting tool, not medical advice.',
    };
  },
  content: {
    formula: [
      'Final day reps = day 1 reps + (days − 1) × daily increase',
      'Total reps = days ÷ 2 × (2 × day 1 reps + (days − 1) × daily increase)',
    ],
    body: [
      'New Year challenges like 30 days of push-ups or squats add a few reps every day. The fun part is the total, and it is bigger than most people guess.',
      'Enter your starting reps, the daily increase and the number of days. The calculator adds up the whole challenge using the sum of an arithmetic series, and shows what the last day asks of you.',
      'Check the final day before you start. If it looks too hard, lower the daily increase. For planks, enter seconds instead of reps.',
    ],
    faq: [
      { q: 'What is the total for starting at 10 and adding 2 a day for 30 days?', a: 'The last day is 10 + 29 × 2 = 68 reps, and the total is 30 ÷ 2 × (20 + 58) = 1,170 reps, an average of 39 a day.' },
      { q: 'What about starting at 5 and adding 1 a day?', a: 'The last day is 34 reps and the total over 30 days is 585 reps.' },
      { q: 'Can I use it for planks or other timed holds?', a: 'Yes. Enter seconds instead of reps and read the result as total seconds.' },
      { q: 'Does it include rest days?', a: 'No. It counts every day in a row. Shorten the number of days or run it twice if you plan rest days.' },
    ],
    sources: [],
  },
  related: ['step-goal-ramp', 'workout-volume', 'calories-burned'],
  examples: [
    { values: { start: 10, inc: 2, days: 30 }, expect: { total: 1170, last: 68, avg: 39 }, tolerance: 0.01 },
    { values: { start: 5, inc: 1, days: 30 }, expect: { total: 585, last: 34 }, tolerance: 0.01 },
    { values: { start: 20, inc: 0, days: 7 }, expect: { total: 140, last: 20 }, tolerance: 0.01 },
  ],
});
