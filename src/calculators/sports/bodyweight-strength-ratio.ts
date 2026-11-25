import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'bodyweight-strength-ratio',
  title: 'Bodyweight Strength Ratio and Weeks to Target',
  category: 'sports',
  description: 'Divide your lift by your bodyweight to get a strength ratio, then see the weight and the weeks needed to reach a target multiple at a steady weekly gain.',
  keywords: ['bodyweight strength ratio', 'bench press bodyweight calculator', 'squat bodyweight multiple', 'strength to weight ratio lifting', 'weeks to 1.5x bodyweight'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'lift', label: 'Your lift', type: 'number', default: 185, min: 0, step: 0.5, info: 'The heaviest weight you lift for the exercise. Use the same unit as bodyweight.' },
    { id: 'body', label: 'Bodyweight', type: 'number', default: 175, min: 0, step: 0.5, info: 'Your bodyweight, in the same unit as the lift (lb or kg).' },
    { id: 'multiple', label: 'Target multiple of bodyweight', type: 'number', suffix: '×', default: 1.25, min: 0, step: 0.05, info: 'For example 1.5 means a lift of one and a half times your bodyweight.' },
    { id: 'gain', label: 'Weight you add per week', type: 'number', default: 2.5, min: 0, step: 0.25, info: 'How much you expect to add to the lift each week, in the same unit.' },
  ],
  outputs: [
    { id: 'ratio', label: 'Strength ratio now', format: 'number', precision: 2, primary: true, info: 'Lift ÷ bodyweight.' },
    { id: 'target', label: 'Target lift', format: 'number', precision: 2, info: 'Target multiple × bodyweight.' },
    { id: 'gap', label: 'Weight still to add', format: 'number', precision: 2, info: 'Target lift − your lift, never below zero.' },
    { id: 'weeks', label: 'Weeks to reach it', format: 'number', precision: 1, info: 'Gap ÷ weekly gain.' },
  ],
  compute: (v) => {
    const lift = num(v.lift);
    const body = num(v.body);
    const m = num(v.multiple);
    const g = num(v.gain);
    if (lift === null || body === null || m === null || g === null) return { ratio: null };
    if (lift < 0 || body <= 0 || m < 0 || g < 0) return { ratio: null };
    const ratio = lift / body;
    const target = m * body;
    const gap = Math.max(0, target - lift);
    if (gap === 0) {
      return { ratio, target, gap: 0, weeks: 0, tone: 'good', badge: 'Target already reached', note: `You lift ${fmt(ratio, 2)}× bodyweight, at or above the ${fmt(m, 2)}× target.` };
    }
    if (g === 0) {
      return { ratio, target, gap, weeks: null, tone: 'warn', badge: 'Enter a weekly gain', note: `You need ${fmt(gap, 2)} more, but a weekly gain of zero never gets there.` };
    }
    const weeks = gap / g;
    return {
      ratio,
      target,
      gap,
      weeks,
      tone: 'ok',
      chart: { type: 'bar' as const, title: 'Your lift vs the target', categories: ['Your lift', 'Target lift'], series: [{ name: 'Weight', values: [lift, target] }], format: { format: 'number' as const }, highlight: 1 },
      badge: `About ${fmt(weeks, 1)} weeks to ${fmt(m, 2)}×`,
      note: `${fmt(lift, 1)} ÷ ${fmt(body, 1)} is ${fmt(ratio, 2)}×. Adding ${fmt(g, 2)} a week closes the ${fmt(gap, 2)} gap in ${fmt(weeks, 1)} weeks. Real gains slow as you get stronger.`,
      steps: [
        `Ratio = ${fmt(lift, 2)} ÷ ${fmt(body, 2)} = ${fmt(ratio, 2)}×`,
        `Target lift = ${fmt(m, 2)} × ${fmt(body, 2)} = ${fmt(target, 2)}`,
        `Gap = ${fmt(target, 2)} − ${fmt(lift, 2)} = ${fmt(gap, 2)}`,
        `Weeks = ${fmt(gap, 2)} ÷ ${fmt(g, 2)} = ${fmt(weeks, 1)}`,
      ],
    };
  },
  content: {
    formula: [
      'Ratio = lift ÷ bodyweight',
      'Target lift = target multiple × bodyweight',
      'Gap = max(0, target lift − lift)',
      'Weeks = gap ÷ weekly gain',
    ],
    body: [
      'A bodyweight ratio lets you compare strength across different sizes and track progress toward goals such as a 1.5× squat. Enter the lift and your bodyweight in the same unit, pick a target multiple, and the page shows the weight to add and how long it takes at a steady pace.',
      'Example: a 185 lb bench at 175 lb bodyweight is 1.06×. A 1.25× target is 218.75 lb, a gap of 33.75 lb, which takes 13.5 weeks at 2.5 lb a week. Another: a 225 lb squat at 160 lb is 1.41×; a 1.5× target is 240 lb, 15 lb away, or 6.0 weeks at 2.5 lb.',
      'No strength standard is built in and the target is yours. Gains slow with training age, so treat the weeks as a best case, not a coaching plan. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is a good bodyweight ratio?', a: 'This calculator does not rate your ratio. It only divides your lift by your bodyweight and plans toward the multiple you choose.' },
      { q: 'Which unit should I use?', a: 'Either, as long as the lift, bodyweight and weekly gain all use the same one. The ratio has no unit.' },
      { q: 'Why does it take longer than the weeks shown?', a: 'The weeks assume the same gain every week. Lifters usually add less per week as they get stronger.' },
      { q: 'What if I am already at the target?', a: 'The weight to add and the weeks both show zero.' },
    ],
    sources: [],
  },
  related: ['one-rep-max', 'plate-calculator', 'progressive-overload'],
  examples: [
    // ratio 185/175=1.05714; target 218.75; gap 33.75; weeks 13.5
    { values: { lift: 185, body: 175, multiple: 1.25, gain: 2.5 }, expect: { ratio: 1.057143, target: 218.75, gap: 33.75, weeks: 13.5 } },
    // ratio 225/160=1.40625; target 240; gap 15; weeks 6
    { values: { lift: 225, body: 160, multiple: 1.5, gain: 2.5 }, expect: { ratio: 1.40625, target: 240, gap: 15, weeks: 6 } },
  ],
});
