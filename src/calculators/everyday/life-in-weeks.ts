import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'life-in-weeks',
  title: 'Your Life in Weeks Calculator',
  category: 'everyday',
  description: 'See your life in weeks: weeks lived, weeks left, Saturdays and summers left, based on an age you choose to plan around. Simple arithmetic, not a forecast.',
  keywords: ['life in weeks calculator', 'how many weeks have i lived', 'weeks left in my life', 'saturdays left calculator', 'summers left calculator', 'life in weeks chart'],
  updated: '2026-11-23',
  inputs: [
    { id: 'age', label: 'Your age today', type: 'number', default: 30, min: 0, max: 120, step: 1, info: 'Your current age in whole years.' },
    { id: 'expectancy', label: 'Age you are planning around', type: 'number', default: 80, min: 1, max: 120, step: 1, info: 'An assumption you can change, not a forecast. 80 is a round number to plan around; nobody can know how long they will live.' },
  ],
  outputs: [
    { id: 'weeksLeft', label: 'Weeks left', format: 'integer', suffix: 'weeks', primary: true, info: '(Planning age − your age) × 52.' },
    { id: 'weeksLived', label: 'Weeks lived', format: 'integer', suffix: 'weeks', info: 'Your age × 52.' },
    { id: 'totalWeeks', label: 'Weeks in the whole plan', format: 'integer', suffix: 'weeks', info: 'Planning age × 52.' },
    { id: 'pctLived', label: 'Share of the plan lived', format: 'percent', precision: 1, info: 'Weeks lived ÷ weeks in the whole plan.' },
    { id: 'saturdays', label: 'Saturdays left', format: 'integer', info: 'One Saturday per week left.' },
    { id: 'summers', label: 'Summers left', format: 'integer', info: 'Whole years left, one summer each.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const exp = num(v.expectancy);
    if (age === null || exp === null || age < 0 || exp <= 0) return { weeksLeft: null };
    const lived = Math.round(age * 52);
    const total = Math.round(exp * 52);
    const left = Math.max(0, total - lived);
    const pct = total > 0 ? Math.min(1, lived / total) : 0;
    const summers = Math.max(0, Math.floor(exp - age));
    return {
      weeksLeft: left,
      weeksLived: lived,
      totalWeeks: total,
      pctLived: pct,
      saturdays: left,
      summers,
      badge: `${fmt(left)} weeks left`,
      note: `Planning around age ${fmt(exp)}, you have lived ${fmt(lived)} of ${fmt(total)} weeks (${fmt(pct * 100, 1)}%). The planning age is an assumption you chose. It is not a forecast, and nobody can know how many weeks they will have.${left === 0 ? ' Your age is not below the planning age, so there are no weeks left in this plan; raise the planning age to see more.' : ''}`,
      chart: {
        type: 'donut',
        title: 'Weeks lived and left',
        format: { format: 'integer', suffix: 'weeks' },
        slices: [
          { label: 'Lived', value: Math.min(lived, total) },
          { label: 'Left', value: left },
        ],
        centerValue: `${fmt(pct * 100, 1)}%`,
        centerLabel: 'lived',
      },
      steps: [
        `Weeks lived = ${age} × 52 = ${fmt(lived)}`,
        `Weeks in the plan = ${exp} × 52 = ${fmt(total)}`,
        `Weeks left = ${fmt(total)} − ${fmt(lived)} = ${fmt(left)}`,
        `Summers left = ⌊${exp} − ${age}⌋ = ${fmt(summers)}`,
      ],
    };
  },
  content: {
    formula: ['Weeks lived = age × 52', 'Weeks in the plan = planning age × 52', 'Weeks left = weeks in the plan − weeks lived', 'Summers left = whole years left'],
    body: [
      'A year feels long, but counting in weeks makes the time concrete. This calculator multiplies your age and the age you are planning around by 52 to show how many weeks you have lived and how many are left in that plan.',
      'The planning age is an assumption you can change. It is not a prediction about your health or lifespan, and nobody can know that number. Treat the result as a way to notice time, not as a countdown.',
      'Each week left holds one Saturday, and each whole year left holds one summer. Seeing those counts can be a nudge to spend a few of them on things that matter to you.',
      'It uses 52 weeks per year, so it ignores the extra day or two in each calendar year. Everything runs in your browser and nothing you enter is stored or sent anywhere.',
    ],
    sections: [
      {
        heading: 'How the numbers are worked out',
        paragraphs: ['Weeks lived is your age times 52. The whole plan is the planning age times 52, and weeks left is the difference. Saturdays left equals weeks left, and summers left is the number of whole years between your age and the planning age. If your age is at or above the planning age, weeks left is 0.'],
      },
      {
        heading: 'Using it well',
        paragraphs: ['Try a few different planning ages to see how much the answer moves. Moving it from 80 to 90 adds 520 weeks and 10 summers. Then pick one or two things you want to do in the coming summers and put them on the calendar.'],
      },
    ],
    faq: [
      { q: 'How many weeks have I lived at age 30?', a: 'Age × 52. At 30 that is 30 × 52 = 1,560 weeks.' },
      { q: 'How many weeks are left if I plan around 80?', a: 'At 30 with a planning age of 80, the plan holds 80 × 52 = 4,160 weeks. Subtract 1,560 lived and 2,600 weeks are left, which is 37.5% lived.' },
      { q: 'How many Saturdays and summers are left?', a: 'One Saturday per week left, so 2,600 Saturdays in that example, and one summer per whole year left, so 50 summers.' },
      { q: 'Is this a prediction of how long I will live?', a: 'No. The planning age is a number you choose. It is not a forecast, and the calculator cannot know how long anyone will live.' },
      { q: 'What happens if my age is above the planning age?', a: 'There are no weeks left in that plan, so weeks left, Saturdays and summers show 0 and the share lived is capped at 100%. Raise the planning age to see more.' },
    ],
    sources: [],
  },
  related: ['time-with-loved-ones', 'screen-time-life', 'year-progress', 'age'],
  examples: [
    // 30×52 = 1560; 80×52 = 4160; left 2600; 1560/4160 = 0.375; summers 80−30 = 50.
    { values: { age: 30, expectancy: 80 }, expect: { weeksLived: 1560, totalWeeks: 4160, weeksLeft: 2600, pctLived: 0.375, saturdays: 2600, summers: 50 }, tolerance: 1e-9 },
    // 40×52 = 2080; 90×52 = 4680; left 2600; 2080/4680 = 4/9; summers 50.
    { values: { age: 40, expectancy: 90 }, expect: { weeksLived: 2080, totalWeeks: 4680, weeksLeft: 2600, pctLived: 4 / 9, saturdays: 2600, summers: 50 }, tolerance: 1e-9 },
    // age above planning age: 85×52 = 4420; 80×52 = 4160; left clamps to 0; percent capped at 1; summers 0.
    { values: { age: 85, expectancy: 80 }, expect: { weeksLived: 4420, totalWeeks: 4160, weeksLeft: 0, pctLived: 1, saturdays: 0, summers: 0 }, tolerance: 1e-9 },
  ],
});
