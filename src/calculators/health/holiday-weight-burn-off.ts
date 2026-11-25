import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'holiday-weight-burn-off',
  title: 'Holiday Weight Gain: Days to Burn It Off',
  category: 'health',
  description: 'Gained a few pounds over the holidays? Enter the pounds and your daily calorie deficit to see how many days and weeks it takes to burn them off.',
  keywords: ['holiday weight gain calculator', 'how long to lose holiday weight', 'days to lose 5 pounds', 'burn off holiday weight', 'calorie deficit days to lose weight'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'lbs', label: 'Pounds gained', type: 'number', suffix: 'lb', default: 4, min: 0, step: 0.5, info: 'How much you want to lose.' },
    { id: 'kcal', label: 'Calories per pound', type: 'number', suffix: 'kcal', default: 3500, min: 1, step: 100, info: 'The common rule of thumb is about 3,500 kcal per pound. Real bodies vary.' },
    { id: 'deficit', label: 'Daily calorie deficit', type: 'number', suffix: 'kcal', default: 500, min: 0, step: 50, info: 'Calories you eat less than you burn each day, by eating less, moving more, or both.' },
  ],
  outputs: [
    { id: 'days', label: 'Days to burn it off', format: 'number', precision: 0, primary: true, info: 'Pounds × calories per pound ÷ daily deficit, rounded up.' },
    { id: 'weeks', label: 'Weeks', format: 'number', precision: 1, info: 'The days result divided by 7.' },
    { id: 'total', label: 'Total deficit needed', format: 'number', suffix: 'kcal', precision: 0, info: 'Pounds × calories per pound.' },
  ],
  compute: (v) => {
    const lbs = num(v.lbs);
    const kcal = num(v.kcal);
    const deficit = num(v.deficit);
    if (lbs === null || kcal === null || deficit === null) return { days: null };
    if (lbs < 0 || kcal <= 0 || deficit <= 0) return { days: null };
    const total = lbs * kcal;
    const exact = total / deficit;
    const days = Math.ceil(exact - 1e-9);
    const weeks = days / 7;
    return {
      days,
      weeks,
      total,
      tone: 'ok',
      badge: `About ${days} days`,
      note: `${fmt(lbs)} lb at ${fmt(kcal, 0)} kcal a pound is ${fmt(total, 0)} kcal. At a ${fmt(deficit, 0)} kcal daily deficit that takes ${days} days, or ${fmt(weeks)} weeks. The 3,500 figure is a rough rule, and some of a quick holiday gain is water.`,
      chart: {
        type: 'bar' as const,
        title: 'Days at different daily deficits',
        categories: ['250 kcal', '500 kcal', '750 kcal', '1,000 kcal'],
        series: [{ name: 'Days', values: [250, 500, 750, 1000].map((d) => Math.ceil(total / d - 1e-9)) }],
        format: { format: 'integer' },
      },
      steps: [
        `Total deficit = ${fmt(lbs)} × ${fmt(kcal, 0)} = ${fmt(total, 0)} kcal`,
        `Days = ${fmt(total, 0)} ÷ ${fmt(deficit, 0)} = ${fmt(exact, 2)}, rounded up to ${days}`,
        `Weeks = ${days} ÷ 7 = ${fmt(weeks)}`,
      ],
    };
  },
  content: {
    formula: [
      'Total deficit = pounds × calories per pound',
      'Days = total deficit ÷ daily deficit (rounded up)',
      'Weeks = days ÷ 7',
    ],
    body: [
      'Holiday meals add up, and so does the bill to undo them. This calculator turns pounds gained and a daily calorie deficit into the days it takes to burn them off.',
      'Example: 4 lb at 3,500 kcal a pound is 14,000 kcal. A 500 kcal daily deficit takes 28 days, which is 4 weeks.',
      'The 3,500 kcal per pound figure is a rule of thumb, and part of a quick gain is water, so real results vary. This is not medical advice; very large deficits are not a good idea. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How long does it take to lose 5 pounds?', a: 'At 3,500 kcal a pound and a 500 kcal daily deficit, 5 lb takes 35 days. Change the inputs to see yours.' },
      { q: 'Is 3,500 calories per pound accurate?', a: 'It is a common rule of thumb, not an exact law. Your body and your pace will differ, so treat the answer as an estimate.' },
      { q: 'What deficit should I use?', a: 'Enter what you actually plan to cut or burn each day. Use the TDEE calculator to find your daily burn.' },
      { q: 'Why round the days up?', a: 'You cannot finish part way through a day, so the result shows the first full day that reaches the total.' },
    ],
    sources: [],
  },
  related: ['weight-loss-goal', 'weight-change-rate', 'calories-burned', 'tdee'],
  examples: [
    // 4*3500=14000; /500=28 days; 4 weeks
    { values: { lbs: 4, kcal: 3500, deficit: 500 }, expect: { days: 28, weeks: 4, total: 14000 } },
    // 5*3500=17500; /700=25 days; 25/7=3.5714
    { values: { lbs: 5, kcal: 3500, deficit: 700 }, expect: { days: 25, weeks: 25 / 7, total: 17500 } },
    // 2*3500=7000; /400=17.5 -> 18 days
    { values: { lbs: 2, kcal: 3500, deficit: 400 }, expect: { days: 18, weeks: 18 / 7, total: 7000 } },
  ],
});
