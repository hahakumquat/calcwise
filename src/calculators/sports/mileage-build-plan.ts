import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'mileage-build-plan',
  title: 'Running Mileage Build Plan (10% Rule)',
  category: 'sports',
  description: 'Plan weekly running mileage week by week. Grow by 10% (or your own rate), add easier recovery weeks, and see your peak week and total distance.',
  keywords: ['mileage build plan', '10 percent rule running', 'weekly mileage calculator', 'running mileage increase', 'how fast to increase mileage', 'running volume plan'],
  updated: '2026-11-21',
  inputs: [
    { id: 'start', label: 'Current weekly distance', type: 'number', default: 20, min: 1, step: 1, suffix: 'per week', info: 'The distance you run in a typical week now, in miles or kilometres. The plan uses the same unit you enter.' },
    { id: 'weeks', label: 'Weeks in the plan', type: 'number', default: 12, min: 2, max: 52, step: 1, info: 'How many weeks to plan, from 2 to 52. Week 1 is your current distance.' },
    { id: 'growth', label: 'Weekly increase', type: 'number', default: 10, min: 0, max: 30, step: 1, suffix: '%', info: 'How much each build week adds to the previous build week. 10% is a rule of thumb, not a guarantee of safety.' },
    {
      id: 'recovery', label: 'Easier week', type: 'select', default: '4',
      options: [{ value: '0', label: 'None' }, { value: '3', label: 'Every 3rd week' }, { value: '4', label: 'Every 4th week' }],
      info: 'An easier week runs 80% of the last build week and does not change where the next build week starts from.',
    },
  ],
  outputs: [
    { id: 'peak', label: 'Peak week', format: 'number', precision: 1, primary: true, info: 'The highest weekly distance in the plan.' },
    { id: 'last', label: 'Final week', format: 'number', precision: 1, info: 'Distance planned for the last week.' },
    { id: 'total', label: 'Total distance', format: 'number', precision: 1, info: 'All weeks added together.' },
    { id: 'plan', label: 'Week by week', format: 'text', info: 'Each week in order. Weeks marked "easy" are the easier weeks.' },
  ],
  compute: (v) => {
    const start = num(v.start);
    const weeks = num(v.weeks);
    const g = num(v.growth);
    const every = Number(v.recovery) || 0;
    if (start === null || weeks === null || g === null || start <= 0 || g < 0) return { peak: null };
    if (!Number.isInteger(weeks) || weeks < 2 || weeks > 52) return { peak: null, error: 'Enter a whole number of weeks from 2 to 52.' };
    const out: number[] = [];
    const easy: boolean[] = [];
    let build = start;
    for (let w = 1; w <= weeks; w++) {
      if (every > 0 && w % every === 0) {
        out.push(0.8 * build);
        easy.push(true);
      } else {
        if (w > 1) build *= 1 + g / 100;
        out.push(build);
        easy.push(false);
      }
    }
    const total = out.reduce((a, b) => a + b, 0);
    const peak = Math.max(...out);
    return {
      peak,
      last: out[out.length - 1],
      total,
      plan: out.map((x, i) => `W${i + 1} ${fmt(x)}${easy[i] ? ' easy' : ''}`).join(', '),
      chart: {
        type: 'bar',
        title: 'Planned weekly distance',
        categories: out.map((_, i) => `W${i + 1}`),
        format: { format: 'number', precision: 1 },
        series: [{ name: 'Distance', values: out }],
      },
      steps: [`Build weeks grow by ${fmt(g, 0)}% each: start ${fmt(start)}`, `Peak week: ${fmt(peak)}`, `Total over ${weeks} weeks: ${fmt(total)}`],
      tone: g > 10 ? 'warn' : 'ok',
      note: g > 10 ? 'More than 10% a week is faster than the usual rule of thumb. Ease up if anything hurts.' : 'The 10% rule is a rule of thumb, not a guarantee. Listen to your body and adjust.',
    };
  },
  content: {
    formula: [
      'Build week = previous build week × (1 + increase %)',
      'Easier week = 0.8 × last build week',
    ],
    body: [
      'Many runners raise weekly distance by about 10% at a time to give muscles, tendons and bones time to adapt. It is a popular rule of thumb, not a proven safe limit, and it fits some runners better than others.',
      'Enter your current weekly distance, how many weeks you want to plan and the increase you prefer. You get a week-by-week plan, your peak week and the total distance. Use miles or kilometres; the plan keeps your unit.',
      'Everything runs in your browser. Nothing you enter is stored or sent anywhere. This is general planning arithmetic, not medical or coaching advice.',
    ],
    sections: [
      {
        heading: 'How the easier weeks work',
        paragraphs: [
          'Every third or fourth week many plans step back. Here an easier week is 80% of the last build week, and the next build week continues from that last build week, not from the lower number. Starting at 20 with 10% growth and an easier week every 4th week gives 20, 22, 24.2, then 19.4 before it climbs to 26.6.',
        ],
      },
    ],
    faq: [
      { q: 'What is the 10% rule in running?', a: 'Increase weekly distance by no more than about 10% from one week to the next. It is a rule of thumb. From 20 per week it gives 22, then 24.2, then 26.62.' },
      { q: 'Is a 10% increase safe for everyone?', a: 'Not necessarily. It is a guideline, and beginners or runners coming back from injury may need slower increases. Ask a coach or clinician if unsure.' },
      { q: 'How is an easier week calculated here?', a: 'It is 80% of the last build week. After a build week of 24.2, the easier week is 19.36, and the next build week is 24.2 × 1.1 = 26.62.' },
      { q: 'Can I use kilometres?', a: 'Yes. Enter your current weekly distance in kilometres and every number in the plan is in kilometres.' },
    ],
  },
  related: ['pace', 'race-time-predictor', 'heart-rate-zones', 'calories-burned', 'sleep-debt'],
  examples: [
    // 20, 22, 24.2, 26.62 ; total 92.82
    { values: { start: 20, weeks: 4, growth: 10, recovery: '0' }, expect: { peak: 26.62, last: 26.62, total: 92.82 }, tolerance: 1e-9 },
    // 20,22,24.2,19.36,26.62,29.282,32.2102,25.76816 ; total 199.44036
    { values: { start: 20, weeks: 8, growth: 10, recovery: '4' }, expect: { peak: 32.2102, last: 25.76816, total: 199.44036 }, tolerance: 1e-9 },
    // 0% growth, 10 flat weeks of 15 = 150
    { values: { start: 15, weeks: 10, growth: 0, recovery: '0' }, expect: { peak: 15, total: 150 }, tolerance: 1e-9 },
  ],
});
