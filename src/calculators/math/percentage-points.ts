import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const r = (x: number, d = 2) => +x.toFixed(d);

export default defineCalculator({
  slug: 'percentage-points',
  title: 'Percentage Points vs Percent Change',
  category: 'math',
  description: 'Compare two rates and see the change in percentage points next to the relative percent change, so 6.5% to 7.0% reads as +0.5 points and +7.69%.',
  keywords: ['percentage points vs percent', 'percentage point difference', 'percentage points calculator', 'percent vs percentage point', 'interest rate change points', 'relative change vs absolute change'],
  updated: '2026-11-27',
  inputs: [
    { id: 'old', label: 'Old rate', type: 'number', suffix: '%', default: 6.5, min: 0, step: 0.1, info: 'The starting rate, as a percent. For example 6.5 for 6.5%.' },
    { id: 'new', label: 'New rate', type: 'number', suffix: '%', default: 7, min: 0, step: 0.1, info: 'The ending rate, as a percent. For example 7 for 7%.' },
  ],
  outputs: [
    { id: 'points', label: 'Change in percentage points', format: 'number', precision: 4, primary: true, info: 'New rate minus old rate. This is the plain gap between the two rates, measured in points.' },
    { id: 'relative', label: 'Relative change', format: 'percent', precision: 4, info: 'The change in points divided by the old rate. It says how much bigger or smaller the new rate is compared with the old one. Not defined when the old rate is 0.' },
  ],
  compute: (v) => {
    const a = num(v.old);
    const b = num(v.new);
    if (a === null || b === null) return { points: null };
    if (a < 0 || b < 0) return { points: null, error: 'Rates must be 0 or higher.' };
    const points = b - a;
    const dir = points > 0 ? 'rose' : points < 0 ? 'fell' : 'did not change';
    const abs = Math.abs(points);
    const ptWord = abs === 1 ? 'point' : 'points';
    const sign = points > 0 ? '+' : points < 0 ? '−' : '';
    if (a === 0) {
      return {
        points,
        relative: null,
        tone: 'warn',
        badge: `${sign}${r(abs, 4)} ${ptWord}`,
        note: 'Relative change is undefined because the old rate is 0: any increase from zero is an infinite percentage. The change in percentage points is still valid.',
        chart: { type: 'bar', title: 'Old rate vs new rate', categories: ['Old', 'New'], series: [{ name: 'Rate', values: [a / 100, b / 100] }], format: { format: 'percent', precision: 2 }, highlight: 1 },
        steps: [
          `Points = new − old = ${r(b, 4)} − ${r(a, 4)} = ${r(points, 4)}`,
          'Relative change = points ÷ old rate, which is undefined when the old rate is 0',
        ],
      };
    }
    const relative = points / a;
    const relPct = r(Math.abs(relative) * 100, 2);
    const sentence = points === 0
      ? 'The rate did not change: 0 percentage points and 0 percent.'
      : `The rate ${dir} ${r(abs, 4)} percentage ${ptWord}, which is ${relPct} percent ${points > 0 ? 'higher' : 'lower'}, not ${r(abs, 4)} percent.`;
    return {
      points,
      relative,
      tone: 'ok',
      badge: points === 0 ? 'No change' : `${sign}${r(abs, 4)} ${ptWord}, ${sign}${relPct}%`,
      note: sentence,
      chart: { type: 'bar', title: 'Old rate vs new rate', categories: ['Old', 'New'], series: [{ name: 'Rate', values: [a / 100, b / 100] }], format: { format: 'percent', precision: 2 }, highlight: 1 },
      steps: [
        `Points = new − old = ${r(b, 4)} − ${r(a, 4)} = ${r(points, 4)}`,
        `Relative change = points ÷ old = ${r(points, 4)} ÷ ${r(a, 4)} = ${r(relative * 100, 4)}%`,
        sentence,
      ],
    };
  },
  content: {
    formula: [
      'Change in percentage points = new rate − old rate',
      'Relative change = (new rate − old rate) ÷ old rate × 100',
    ],
    body: [
      'A percentage point is the plain gap between two rates. A percent change is that gap compared with where you started. Headlines mix them up all the time: a mortgage rate moving from 6.5% to 7.0% is up 0.5 percentage points, but it is 7.69% higher in relative terms.',
      'Enter the old rate and the new rate, both as percents. You get the change in points and the relative change side by side. This differs from the percentage change calculator, which compares two ordinary values; here both numbers are already rates and the points figure is the main answer.',
      'For example, 6.5% to 7.0% is +0.5 points and +7.69% relative. A fall from 4% to 3% is −1 point and −25%. A rise from 20% to 25% is +5 points and +25%. If the old rate is 0, only the points figure exists, because a relative change from zero is undefined.',
      'Use points when you want the size of the move, and relative change when you want to know how large that move is compared with the starting rate. Small starting rates make the relative figure look big.',
    ],
    faq: [
      { q: 'What is the difference between percentage points and percent?', a: 'Points are the subtraction of one rate from another. Percent change divides that gap by the old rate. Going from 6.5% to 7.0% is +0.5 percentage points but +7.69% relative.' },
      { q: 'How much is 4% to 3% in points and percent?', a: 'It is −1 percentage point, which is a 25% relative decrease (−1 ÷ 4).' },
      { q: 'How much is 20% to 25%?', a: 'It is +5 percentage points and a +25% relative increase (5 ÷ 20).' },
      { q: 'What if the old rate is 0?', a: 'The change in points is still the new rate, but the relative change is undefined because you cannot divide by zero. The calculator shows points only.' },
      { q: 'When should I say points instead of percent?', a: 'Say percentage points when comparing two rates, such as interest rates, poll numbers or unemployment. Say percent when you mean the relative change.' },
    ],
    sources: [],
  },
  related: ['percentage-change', 'percent-difference'],
  examples: [
    // 7.0 - 6.5 = 0.5 points; 0.5 / 6.5 = 0.076923...
    { values: { old: 6.5, new: 7 }, expect: { points: 0.5, relative: 0.5 / 6.5 }, tolerance: 1e-9 },
    // 3 - 4 = -1 point; -1 / 4 = -0.25
    { values: { old: 4, new: 3 }, expect: { points: -1, relative: -0.25 }, tolerance: 1e-9 },
    // 25 - 20 = 5 points; 5 / 20 = 0.25
    { values: { old: 20, new: 25 }, expect: { points: 5, relative: 0.25 }, tolerance: 1e-9 },
    // old = 0: points only, relative undefined
    { values: { old: 0, new: 3 }, expect: { points: 3 }, tolerance: 1e-9 },
  ],
});
