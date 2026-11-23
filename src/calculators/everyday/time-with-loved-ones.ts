import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'time-with-loved-ones',
  title: 'Time Left With Loved Ones Calculator',
  category: 'everyday',
  description: 'See how many visits, days and calls you may have left with a parent, grandparent or friend, based on how often you meet today. Plain arithmetic, not a forecast.',
  keywords: ['time left with parents calculator', 'how many more visits with my parents', 'time left with loved ones', 'how many days will i see my parents', 'visits left with grandparents', 'time with family calculator'],
  updated: '2026-11-20',
  inputs: [
    { id: 'age', label: 'Their age today', type: 'number', default: 65, min: 0, max: 120, step: 1, info: 'The age of the person you want to spend time with.' },
    { id: 'expected', label: 'Age you are planning around', type: 'number', default: 85, min: 1, max: 120, step: 1, info: 'An assumption you can change. 85 is a round number to plan around, not a prediction about anyone.' },
    { id: 'visits', label: 'Visits per year', type: 'number', default: 4, min: 0, max: 365, step: 1, info: 'How many separate times you see them in a typical year.' },
    { id: 'days', label: 'Days per visit', type: 'number', default: 3, min: 0, max: 30, step: 0.5, info: 'The average length of each visit, in days.' },
    { id: 'calls', label: 'Calls per week', type: 'number', default: 2, min: 0, max: 50, step: 1, info: 'Phone or video calls in a typical week.' },
  ],
  outputs: [
    { id: 'daysTogether', label: 'Days together', format: 'integer', suffix: 'days', primary: true, info: 'Visits per year × days per visit × years left.' },
    { id: 'visitsLeft', label: 'Visits', format: 'integer', info: 'Visits per year × years left.' },
    { id: 'callsLeft', label: 'Calls', format: 'integer', info: 'Calls per week × 52 × years left.' },
    { id: 'yearsLeft', label: 'Years to plan around', format: 'number', precision: 1, suffix: 'years', info: 'Planning age − their age today.' },
    { id: 'extraDays', label: 'Days gained by one more visit a year', format: 'integer', suffix: 'days', info: 'Days per visit × years left.' },
  ],
  compute: (v) => {
    const age = num(v.age);
    const expected = num(v.expected);
    const visits = num(v.visits);
    const days = num(v.days);
    const calls = num(v.calls);
    if (age === null || expected === null || visits === null || days === null || calls === null || age < 0 || visits < 0 || days < 0 || calls < 0) return { daysTogether: null };
    const left = Math.max(0, expected - age);
    const visitsLeft = visits * left;
    const daysTogether = visitsLeft * days;
    const callsLeft = calls * 52 * left;
    const extraDays = days * left;
    const total = left * 365;
    const together = Math.min(daysTogether, total);
    return {
      daysTogether,
      visitsLeft,
      callsLeft,
      yearsLeft: left,
      extraDays,
      badge: `${fmt(daysTogether)} days together`,
      note: `${fmt(visits)} visits a year of ${fmt(days, 1)} days for ${fmt(left)} more years is ${fmt(daysTogether)} days, about ${fmt(daysTogether / 365, 2)} years of 24-hour days. It uses your own numbers and an age you chose to plan around. It is not a forecast about anyone.${left === 0 ? ' The planning age is not above their age today, so there is nothing to count; raise it to see a result.' : ''}`,
      chart: {
        type: 'donut',
        title: `The next ${fmt(left)} years`,
        format: { format: 'integer', suffix: 'days' },
        slices: [
          { label: 'Days together', value: together },
          { label: 'Other days', value: Math.max(0, total - together) },
        ],
        centerValue: `${fmt(total > 0 ? (together / total) * 100 : 0, 1)}%`,
        centerLabel: 'of all days',
      },
      steps: [
        `Years left = ${expected} − ${age} = ${left}`,
        `Visits = ${visits} × ${left} = ${fmt(visitsLeft, 1)}`,
        `Days together = ${fmt(visitsLeft, 1)} × ${days} = ${fmt(daysTogether, 1)}`,
        `Calls = ${calls} × 52 × ${left} = ${fmt(callsLeft)}`,
      ],
    };
  },
  content: {
    formula: ['Years left = planning age − their age today', 'Visits = visits per year × years left', 'Days together = visits × days per visit', 'Calls = calls per week × 52 × years left'],
    body: [
      'Most of us see the people we love far less often than it feels like. This calculator takes how often you visit and call today and multiplies it by the years you are planning around, so you can see the real count.',
      'The age you plan around is an assumption you can change. It is not a prediction about anyone’s health or lifespan, and the result assumes your routine stays the same every year.',
      'Try changing one number. One extra visit a year adds days per visit × years left, and making each visit a day longer adds visits × years left. Small changes add up faster than you expect.',
      'Everything runs in your browser and nothing you enter is stored or sent anywhere.',
    ],
    faq: [
      { q: 'How many more visits will I have with my parents?', a: 'Visits per year × years left. For a parent aged 65 planning to 85, with 4 visits a year, that is 4 × 20 = 80 visits.' },
      { q: 'How many days is that in total?', a: 'Visits × days per visit. 80 visits of 3 days is 240 days, about 0.66 years.' },
      { q: 'What does one more visit a year add?', a: 'Days per visit × years left. With 3-day visits and 20 years, one extra visit a year adds 60 days.' },
      { q: 'Is this a forecast?', a: 'No. It is arithmetic on your own numbers and an age you chose, and it cannot know how long anyone will live.' },
    ],
    sources: [],
  },
  related: ['life-in-weeks', 'screen-time-life', 'year-progress'],
  examples: [
    // 85 − 65 = 20 years; 4 × 20 = 80 visits; 80 × 3 = 240 days; 2 × 52 × 20 = 2080 calls; 3 × 20 = 60 extra days.
    { values: { age: 65, expected: 85, visits: 4, days: 3, calls: 2 }, expect: { daysTogether: 240, visitsLeft: 80, callsLeft: 2080, yearsLeft: 20, extraDays: 60 }, tolerance: 1e-9 },
    // 90 − 70 = 20 years; 12 × 20 = 240 visits; 240 × 0.5 = 120 days; 1 × 52 × 20 = 1040 calls; 0.5 × 20 = 10.
    { values: { age: 70, expected: 90, visits: 12, days: 0.5, calls: 1 }, expect: { daysTogether: 120, visitsLeft: 240, callsLeft: 1040, yearsLeft: 20, extraDays: 10 }, tolerance: 1e-9 },
  ],
});
