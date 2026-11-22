import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const signed = (n: number, d = 2) => (n > 0 ? '+' : n < 0 ? '−' : '') + fmt(Math.abs(n), d);

export default defineCalculator({
  slug: 'weight-change-rate',
  title: 'Weight Change Rate Calculator',
  category: 'health',
  description: 'Turn two weigh-ins into a weekly rate. Enter your start weight, current weight and the days between them to see the change per week and as a percent.',
  keywords: ['weight change rate', 'weight loss per week calculator', 'how fast am i losing weight', 'weekly weight change', 'percent body weight per week', 'weight gain rate'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'unit', label: 'Unit', type: 'select', segmented: true, default: 'lb', options: [{ value: 'lb', label: 'lb' }, { value: 'kg', label: 'kg' }], info: 'The unit your weights are in. Results use the same unit.' },
    { id: 'start', label: 'Start weight', type: 'number', default: 200, min: 1, step: 0.1, info: 'Your weight at the first weigh-in.' },
    { id: 'current', label: 'Current weight', type: 'number', default: 194, min: 1, step: 0.1, info: 'Your weight at the latest weigh-in.' },
    { id: 'days', label: 'Days between weigh-ins', type: 'number', default: 21, min: 1, step: 1, suffix: 'days', info: 'How many days passed between the two weigh-ins.' },
  ],
  outputs: [
    { id: 'perWeek', label: 'Change per week', format: 'number', precision: 2, primary: true, info: 'Total change ÷ days × 7. Negative means weight went down.' },
    { id: 'change', label: 'Total change', format: 'number', precision: 2, info: 'Current weight minus start weight.' },
    { id: 'pctWeek', label: 'Percent of start weight per week', format: 'percent', precision: 2, info: 'Change per week ÷ start weight.' },
    { id: 'perDay', label: 'Change per day', format: 'number', precision: 3, info: 'Total change ÷ days.' },
  ],
  compute: (v) => {
    const start = num(v.start);
    const cur = num(v.current);
    const days = num(v.days);
    const unit = v.unit === 'kg' ? 'kg' : 'lb';
    if (start === null || cur === null || days === null || start <= 0 || cur <= 0 || days <= 0) return { perWeek: null };
    const change = cur - start;
    const perDay = change / days;
    const perWeek = perDay * 7;
    const pct = perWeek / start;
    const dir = change < 0 ? 'down' : change > 0 ? 'up' : 'unchanged';
    return {
      perWeek,
      change,
      pctWeek: pct,
      perDay,
      tone: 'ok',
      badge: change === 0 ? 'No change' : `${signed(perWeek)} ${unit} a week`,
      note: change === 0
        ? `Your weight is the same at both weigh-ins, so the rate is 0 ${unit} a week.`
        : `Weight went ${dir} ${fmt(Math.abs(change))} ${unit} in ${fmt(days, 0)} days: ${signed(perWeek)} ${unit} a week, or ${signed(pct * 100)}% of your start weight a week.`,
      chart: {
        type: 'bar',
        title: `Weight at each weigh-in (${unit})`,
        categories: ['Start', 'Current'],
        series: [{ name: 'Weight', values: [start, cur] }],
        format: { format: 'number', precision: 1 },
        highlight: 1,
      },
      steps: [
        `Change = ${fmt(cur)} − ${fmt(start)} = ${signed(change)} ${unit}`,
        `Per week = ${signed(change)} ÷ ${fmt(days, 0)} × 7 = ${signed(perWeek)} ${unit}`,
        `Percent per week = ${signed(perWeek)} ÷ ${fmt(start)} × 100 = ${signed(pct * 100)}%`,
      ],
    };
  },
  content: {
    formula: [
      'Change = current weight − start weight',
      'Change per week = change ÷ days × 7',
      'Percent per week = change per week ÷ start weight × 100',
    ],
    body: [
      'Two weigh-ins a few weeks apart give you a rate. This calculator divides the change by the days between them and scales it to a week, then shows that weekly change as a share of your starting weight.',
      'Example: 200 lb at the start and 194 lb after 21 days. The change is 194 − 200 = −6 lb. Over 21 days that is −6 ÷ 21 × 7 = −2.0 lb a week, and −2 ÷ 200 = −1.0% of start weight a week.',
      'This is arithmetic only. Day-to-day weight moves with water, food and timing, so rates from short gaps can be noisy, and a longer gap smooths them out. It gives no advice on what rate is right for you; for that, speak to a doctor or dietitian. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I calculate weight change per week?', a: 'Subtract your start weight from your current weight, divide by the days between, and multiply by 7. 200 lb to 194 lb in 21 days is −6 ÷ 21 × 7 = −2.0 lb a week.' },
      { q: 'How is the percent per week worked out?', a: 'Weekly change divided by start weight. −2 lb ÷ 200 lb is −1.0% a week.' },
      { q: 'What does a negative number mean?', a: 'Weight went down. A positive number means it went up.' },
      { q: 'Does this tell me if my rate is healthy?', a: 'No. It only does the arithmetic. For advice on a suitable rate, talk to a doctor or dietitian.' },
    ],
    sources: [],
  },
  related: ['weight-loss-goal', 'bmi', 'tdee', 'ideal-weight'],
  examples: [
    // change 194-200 = -6; per day -6/21 = -0.285714; per week -2; pct -2/200 = -0.01
    { values: { unit: 'lb', start: 200, current: 194, days: 21 }, expect: { change: -6, perWeek: -2, pctWeek: -0.01, perDay: -0.285714 }, tolerance: 1e-5 },
    // kg: change 82.1-80 = 2.1; per day 2.1/14 = 0.15; per week 1.05; pct 1.05/80 = 0.013125
    { values: { unit: 'kg', start: 80, current: 82.1, days: 14 }, expect: { change: 2.1, perWeek: 1.05, pctWeek: 0.013125, perDay: 0.15 }, tolerance: 1e-6 },
  ],
});
