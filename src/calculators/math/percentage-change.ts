import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'percentage-change',
  title: 'Percentage Change Calculator',
  category: 'math',
  description: 'Find the percent increase or decrease from an old value to a new value.',
  keywords: ['percent increase', 'percent decrease', 'percentage difference', 'growth rate', 'change in percent'],
  popular: true,
  inputs: [
    { id: 'from', info: 'The starting, old or “before” value.', label: 'Original value', type: 'number', default: 50 },
    { id: 'to', info: 'The ending, new or “after” value.', label: 'New value', type: 'number', default: 65 },
  ],
  outputs: [
    { id: 'change', info: 'How much the value went up or down, as a percentage of the original value. Negative means a decrease.', label: 'Percentage change', format: 'percent', primary: true, precision: 4 },
    { id: 'direction', info: 'Whether the value increased, decreased or stayed the same.', label: 'Direction', format: 'text' },
    { id: 'diff', info: 'The plain difference: new value minus original value.', label: 'Absolute change', precision: 6 },
    { id: 'factor', info: 'What you multiply the original by to get the new value. 1.3 means a 30% increase.', label: 'Multiplier (new ÷ original)', precision: 6 },
    { id: 'pctDiff', info: 'The gap between the two values compared with their average. Use it when neither value is the “starting” one.', label: 'Percentage difference (symmetric)', format: 'percent', precision: 4, help: 'Difference relative to the average of the two values' },
  ],
  compute: (v) => {
    const a = num(v.from);
    const b = num(v.to);
    if (a === null || b === null) return { change: null };
    if (a === 0) return { change: null, error: 'The original value can’t be zero — any change from zero is an infinite percentage.' };
    const diff = b - a;
    const change = diff / Math.abs(a);
    const direction = diff > 0 ? 'Increase' : diff < 0 ? 'Decrease' : 'No change';
    const avg = (Math.abs(a) + Math.abs(b)) / 2;
    return {
      change,
      direction,
      diff,
      factor: b / a,
      pctDiff: avg ? Math.abs(diff) / avg : null,
      chart: { type: 'bar', title: `${direction} of ${fmt(Math.abs(change) * 100, 4)}%`, categories: ['Original', 'New'], series: [{ name: 'Value', values: [a, b] }], highlight: 1 },
      steps: [
        `Change = new − original = ${fmt(b)} − ${fmt(a)} = ${fmt(diff)}`,
        `Relative change = ${fmt(diff)} ÷ |${fmt(a)}| = ${fmt(change)}`,
        `As a percentage: ${fmt(change)} × 100 = ${fmt(change * 100)}%`,
      ],
      note: `${direction === 'No change' ? 'The value did not change' : `${direction === 'Increase' ? 'An increase' : 'A decrease'} of ${fmt(Math.abs(change) * 100, 6)}%`}.`,
    };
  },
  content: {
    formula: ['Percentage change = (new − original) ÷ |original| × 100', 'Percentage difference = |a − b| ÷ ((a + b) ÷ 2) × 100'],
    body: [
      'Percentage change tells you how big a change is compared with where you started. A positive result is an increase, a negative result is a decrease. Going from 50 to 65 is a 30% increase because the 15-unit rise is 30% of the starting 50.',
      'The starting value matters. Rising from 50 to 65 is +30%, but falling back from 65 to 50 is only about −23.1%, because the second change is measured against the larger number 65. That is why a 50% loss needs a 100% gain to recover.',
      'When neither number is the “before” value — say, comparing two prices from different shops — use the percentage difference instead. It divides by the average of the two numbers, so the answer is the same whichever order you enter them.',
    ],
    faq: [
      { q: 'What is the difference between percent change and percentage points?', a: 'Percentage points measure the plain gap between two percentages. An interest rate going from 4% to 5% is a rise of 1 percentage point, but a 25% increase in the rate itself.' },
      { q: 'Why can’t the original value be zero?', a: 'Percentage change divides by the original value. Dividing by zero is undefined, so any change starting from zero can’t be expressed as a percentage.' },
      { q: 'How do I reverse a percentage increase?', a: 'Divide by the multiplier rather than subtracting the same percentage. After a 25% increase (×1.25), divide by 1.25 to get back — that is a 20% decrease.' },
    ],
  },
  related: ['percentage', 'percent-error', 'ratio', 'fraction'],
  examples: [
    { values: { from: 50, to: 65 }, expect: { change: 0.3, direction: 'Increase', diff: 15 } },
    { values: { from: 80, to: 60 }, expect: { change: -0.25, direction: 'Decrease' } },
  ],
});
