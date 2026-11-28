import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const g = (n: number) => `${+n.toFixed(1)} g`;

export default defineCalculator({
  slug: 'fiber-intake',
  title: 'Daily Fiber Goal and Gap Calculator',
  category: 'health',
  description: 'Find your daily fiber goal from your calories (14 g per 1,000 kcal), see the gap from what you eat now, and get a gradual week-by-week ramp to close it.',
  keywords: ['daily fiber calculator', 'how much fiber per day', 'fiber goal 14 g per 1000 calories', 'increase fiber gradually', 'fiber intake gap'],
  updated: '2026-11-28',
  inputs: [
    { id: 'kcal', label: 'Daily calories', type: 'number', default: 2000, min: 1, step: 50, suffix: 'kcal', info: 'Your usual daily calorie intake. Use the TDEE calculator if you are unsure.' },
    { id: 'current', label: 'Current fiber per day', type: 'number', default: 15, min: 0, step: 1, suffix: 'g', info: 'Your recent average. A food-tracking app or the nutrition labels will give you a rough number.' },
    { id: 'ramp', label: 'Fiber added each week', type: 'number', default: 5, min: 0.5, step: 0.5, suffix: 'g', help: 'About 5 g a week is a gentle pace.', info: 'Adding fiber slowly gives your gut time to adjust. Pick a pace that feels comfortable.' },
  ],
  outputs: [
    { id: 'goal', label: 'Daily fiber goal', format: 'number', suffix: 'g', precision: 1, primary: true, info: 'Calories ÷ 1,000 × 14 g.' },
    { id: 'gap', label: 'Gap to goal', format: 'number', suffix: 'g', precision: 1, info: 'Goal minus your current intake, never below zero.' },
    { id: 'weeks', label: 'Weeks to reach goal', format: 'integer', info: 'Whole weeks of adding the weekly amount until you reach the goal.' },
  ],
  compute: (v) => {
    const kcal = num(v.kcal), cur = num(v.current), ramp = num(v.ramp);
    if (kcal === null || cur === null || ramp === null) return { goal: null };
    if (kcal <= 0 || cur < 0) return { goal: null, error: 'Enter calories above 0 and fiber of 0 or more.' };
    if (ramp <= 0) return { goal: null, error: 'Enter a weekly increase above 0.' };
    const goal = (kcal / 1000) * 14;
    const gap = Math.max(0, goal - cur);
    const weeks = Math.ceil(gap / ramp - 1e-9);
    if (weeks > 520) return { goal: null, error: 'That ramp takes over 10 years. Try a bigger weekly increase.' };
    const x: string[] = [], y: number[] = [];
    for (let w = 0; w <= weeks; w++) { x.push(String(w)); y.push(Math.min(goal, cur + ramp * w)); }
    return {
      goal, gap, weeks,
      tone: gap === 0 ? 'good' : 'ok',
      badge: gap === 0 ? 'At or above goal' : `${g(gap)} to go`,
      chart: { type: 'line', title: 'Daily fiber target by week', x, xLabel: 'Week', series: [{ name: 'Fiber (g/day)', values: y }] },
      steps: [
        `Goal = ${kcal} ÷ 1,000 × 14 = ${g(goal)}`,
        `Gap = ${g(goal)} − ${g(cur)} = ${g(gap)}`,
        gap === 0 ? 'You already meet the goal.' : `Weeks = ${g(gap)} ÷ ${g(ramp)}, rounded up = ${weeks}`,
      ],
      note: 'A planning aid, not medical advice. Add fiber gradually and drink water as you do. Ask a doctor or dietitian if you have a digestive condition or other health concerns.',
    };
  },
  content: {
    formula: [
      'Goal (g) = calories ÷ 1,000 × 14',
      'Gap = goal − current intake, never below zero',
      'Weeks = gap ÷ weekly increase, rounded up',
    ],
    body: [
      'The Dietary Guidelines for Americans give a fiber target of 14 grams for every 1,000 calories you eat. At 2,000 calories that is 28 g a day, which is more than most people get.',
      'Jumping to the goal overnight tends to mean gas and bloating, so this calculator spreads the gap over weeks. Enter your calories, what you eat now and how much you will add each week.',
      'Beans, lentils, oats, berries, whole grains, nuts and vegetables are the usual sources. The numbers are a guide, not a personal prescription.',
    ],
    faq: [
      { q: 'What is the goal at 2,000 calories?', a: '2,000 ÷ 1,000 × 14 = 28 g a day.' },
      { q: 'How long does the ramp take from 15 g?', a: 'The gap is 28 − 15 = 13 g. Adding 5 g a week takes 3 weeks (20 g, 25 g, then the 28 g goal).' },
      { q: 'What about 2,500 calories and 12 g now?', a: 'The goal is 35 g and the gap 23 g. At 5 g a week that is 4.6, so 5 weeks.' },
      { q: 'What if I already eat enough?', a: 'The gap is 0 and the weeks are 0. This calculator does not set an upper limit.' },
      { q: 'Is this medical advice?', a: 'No. It is a general guideline. If you have a digestive condition or other health concerns, ask a doctor or dietitian.' },
    ],
    sources: [
      { label: 'Dietary Guidelines for Americans, 2020–2025', url: 'https://www.dietaryguidelines.gov/' },
    ],
  },
  related: ['tdee', 'macro', 'protein', 'water-intake', 'step-goal-ramp'],
  examples: [
    { // goal 2000/1000×14 = 28; gap 13; weeks ceil(13/5) = 3.
      values: { kcal: 2000, current: 15, ramp: 5 },
      expect: { goal: 28, gap: 13, weeks: 3 },
      tolerance: 1e-6,
    },
    { // goal 35; gap 23; ceil(4.6) = 5.
      values: { kcal: 2500, current: 12, ramp: 5 },
      expect: { goal: 35, gap: 23, weeks: 5 },
      tolerance: 1e-6,
    },
    { values: { kcal: 1800, current: 30, ramp: 5 }, expect: { goal: 25.2, gap: 0, weeks: 0 }, tolerance: 1e-6 },
  ],
});
