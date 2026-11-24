import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export default defineCalculator({
  slug: 'step-goal-ramp',
  title: 'Step Goal Ramp: Weeks to Reach Your Daily Steps',
  category: 'health',
  description: 'Add a fixed number of steps each week and see how many weeks it takes to go from your current daily steps to your goal, with a week-by-week chart.',
  keywords: ['step goal calculator', 'how to increase daily steps gradually', 'walking goal ramp up', '10000 steps plan', 'steps per week increase'],
  updated: '2026-11-24',
  inputs: [
    { id: 'current', label: 'Current daily steps', type: 'number', default: 4000, min: 0, step: 100, info: 'Your recent average steps per day.' },
    { id: 'goal', label: 'Goal daily steps', type: 'number', default: 8000, min: 1, step: 100, info: 'The daily step count you want to reach.' },
    { id: 'inc', label: 'Steps added each week', type: 'number', default: 500, min: 1, step: 50, info: 'How much you raise your daily average every week.' },
  ],
  outputs: [
    { id: 'weeks', label: 'Weeks to reach goal', format: 'number', primary: true, info: 'Whole weeks of adding the weekly increase until you reach or pass the goal.' },
    { id: 'months', label: 'Approx. months', format: 'number', info: 'Weeks ÷ 4.345 (average weeks in a month).' },
    { id: 'last', label: 'Daily steps in the final week', format: 'number', info: 'Your target in the last week, capped at the goal.' },
  ],
  compute: (v) => {
    const cur = num(v.current), goal = num(v.goal), inc = num(v.inc);
    if (cur === null || goal === null || inc === null) return { weeks: null };
    if (cur < 0 || goal <= 0) return { weeks: null, error: 'Steps must be positive.' };
    if (inc <= 0) return { weeks: null, error: 'Enter a weekly increase above 0.' };
    if (cur >= goal) return { weeks: 0, months: 0, last: cur, tone: 'good', badge: 'Already at your goal', note: 'Your current steps already meet the goal.' };
    const weeks = Math.ceil((goal - cur) / inc);
    if (weeks > 520) return { weeks: null, error: 'That ramp takes over 10 years. Try a bigger weekly increase.' };
    const x: string[] = [], vals: number[] = [];
    for (let w = 0; w <= weeks; w++) { x.push(String(w)); vals.push(Math.min(goal, cur + inc * w)); }
    return {
      weeks, months: weeks / 4.345, last: vals[weeks],
      chart: { type: 'line', title: 'Daily step target by week', x, series: [{ name: 'Daily steps', values: vals }] },
      steps: [
        `Gap to close: ${fmt(goal)} − ${fmt(cur)} = ${fmt(goal - cur)} steps a day`,
        `Weeks: ${fmt(goal - cur)} ÷ ${fmt(inc)}, rounded up = ${weeks}`,
        `Week ${weeks} target: ${fmt(vals[weeks])} steps a day`,
      ],
      note: 'A planning aid, not medical advice. Pick a goal and pace that suit you, and ask a clinician if you have health concerns.',
    };
  },
  content: {
    formula: [
      'Weeks = (goal − current) ÷ weekly increase, rounded up',
      'Target in week k = current + k × weekly increase, capped at the goal',
    ],
    body: [
      'Jumping from 4,000 to 10,000 steps overnight is a good way to quit by Thursday. A ramp adds a small, fixed amount every week so the habit grows with you.',
      'Enter your current daily average, your goal and how many steps you will add each week. The calculator shows the number of weeks and the daily target for each one.',
      'The goal and the pace are your choice. This does not recommend a step count.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'From 4,000 to 8,000 steps adding 500 a week is a 4,000 step gap, so 8 weeks, about 1.8 months.' },
      { q: 'What if the last jump overshoots the goal?', a: 'The weeks are rounded up and the final week is capped at your goal. From 4,000 to 8,000 at 700 a week takes 6 weeks, with week 6 capped at 8,000.' },
      { q: 'How many steps should I add each week?', a: 'There is no single answer. Small steps you can keep up are easier to stick to than big ones. Choose what feels doable.' },
      { q: 'Are these daily averages?', a: 'Yes. Each week\'s figure is the average you aim for on each day of that week, not a weekly total.' },
    ],
    sources: [],
  },
  related: ['steps-to-distance', 'weight-change-rate', 'calories-burned'],
  examples: [
    { values: { current: 4000, goal: 8000, inc: 500 }, expect: { weeks: 8, months: 1.84, last: 8000 }, tolerance: 0.01 },
    { values: { current: 4000, goal: 8000, inc: 700 }, expect: { weeks: 6, last: 8000 }, tolerance: 0.01 },
    { values: { current: 9000, goal: 8000, inc: 500 }, expect: { weeks: 0, last: 9000 }, tolerance: 0.01 },
  ],
});
