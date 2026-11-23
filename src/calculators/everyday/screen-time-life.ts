import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'screen-time-life',
  title: 'Screen Time in a Lifetime Calculator',
  category: 'everyday',
  description: 'Turn your daily screen hours into years of your life, and see what share of your waking hours that is. Plain arithmetic, not a forecast.',
  keywords: ['screen time calculator', 'how many years of my life on my phone', 'screen time lifetime', 'phone hours per year', 'daily screen time in years', 'hours on phone per day'],
  updated: '2026-11-20',
  inputs: [
    { id: 'hours', label: 'Screen hours per day', type: 'number', suffix: 'h', default: 5, min: 0, max: 24, step: 0.5, info: 'Your daily average from your phone’s screen-time report, plus any other screens you want to count.' },
    { id: 'age', label: 'Your age', type: 'number', default: 25, min: 0, max: 120, step: 1, info: 'Your current age in years.' },
    { id: 'expected', label: 'Age you expect to reach', type: 'number', default: 80, min: 1, max: 120, step: 1, info: 'An assumption you can change. 80 is only a round number, not a prediction for you.' },
    { id: 'sleep', label: 'Sleep per night', type: 'number', suffix: 'h', default: 8, min: 0, max: 20, step: 0.5, info: 'Used to work out your waking hours.' },
  ],
  outputs: [
    { id: 'years', label: 'Years on screens from now', format: 'number', precision: 1, suffix: 'years', primary: true, info: 'Hours per day ÷ 24 × years left.' },
    { id: 'share', label: 'Share of your waking hours', format: 'number', precision: 1, suffix: '%', info: 'Screen hours ÷ (24 − sleep hours).' },
    { id: 'perYear', label: 'Hours per year', format: 'integer', suffix: 'h', info: 'Hours per day × 365.' },
    { id: 'swap', label: 'Years back if you cut 1 hour a day', format: 'number', precision: 1, suffix: 'years', info: '1 ÷ 24 × years left, counted as full 24-hour days.' },
  ],
  compute: (v) => {
    const hours = num(v.hours);
    const age = num(v.age);
    const expected = num(v.expected);
    const sleep = num(v.sleep);
    if (hours === null || age === null || expected === null || sleep === null || hours < 0 || hours > 24 || age < 0 || sleep < 0 || sleep >= 24) return { years: null };
    const left = Math.max(0, expected - age);
    const years = (hours / 24) * left;
    const waking = 24 - sleep;
    const share = (hours / waking) * 100;
    const swap = left / 24;
    const screen = Math.min(years, left);
    return {
      years,
      share,
      perYear: hours * 365,
      swap,
      badge: `${fmt(years, 1)} years of screens`,
      note: `${fmt(hours, 1)} hours a day for ${fmt(left)} more years is ${fmt(years, 1)} years of 24-hour days. It is arithmetic on your own numbers, not a forecast${hours > waking ? ', and your screen hours are more than your waking hours, so check the inputs' : ''}.`,
      chart: {
        type: 'donut',
        title: `The next ${fmt(left)} years`,
        format: { format: 'number', precision: 1, suffix: 'years' },
        slices: [
          { label: 'On screens', value: screen },
          { label: 'Everything else', value: Math.max(0, left - screen) },
        ],
        centerValue: `${fmt(hours / 24 * 100, 0)}%`,
        centerLabel: 'of all time',
      },
      steps: [
        `Years left = ${expected} − ${age} = ${left}`,
        `Screen years = ${hours} ÷ 24 × ${left} = ${years.toFixed(2)}`,
        `Share of waking hours = ${hours} ÷ (24 − ${sleep}) = ${share.toFixed(1)}%`,
      ],
    };
  },
  content: {
    formula: ['Years left = expected age − current age', 'Screen years = hours per day ÷ 24 × years left', 'Share of waking hours = screen hours ÷ (24 − sleep hours)'],
    body: [
      'Daily screen time feels small until you multiply it out. This calculator takes your average hours per day and your years left and shows how many full years of 24-hour days that adds up to.',
      'The age you expect to reach is an assumption you can change, not a prediction. The result is plain arithmetic, so it ignores that your habits will change, and it counts all screen time the same, whether it is work, a video call or scrolling.',
      'The share of waking hours uses the sleep you enter. Screen time that overlaps with other things, like a podcast while cooking, is still counted in full.',
      'If you want a number to start from, check the screen-time report in your phone settings. Everything here runs in your browser.',
    ],
    faq: [
      { q: 'How many years of my life will I spend on my phone?', a: 'Hours per day ÷ 24 × years left. At 5 hours a day from age 25 to 80, that is 5 ÷ 24 × 55 = 11.46 years.' },
      { q: 'What share of my waking day is that?', a: 'With 8 hours of sleep you are awake 16 hours, so 5 hours of screens is 5 ÷ 16 = 31.25% of your waking time.' },
      { q: 'How much would cutting an hour a day give back?', a: 'One hour a day is 1 ÷ 24 × years left. Over 55 years that is about 2.3 years of 24-hour days.' },
      { q: 'Is this a forecast?', a: 'No. It assumes today’s hours never change and uses the age you chose, so treat it as a way to see the size of a habit.' },
    ],
    sources: [{ label: 'Apple: Use Screen Time on your iPhone', url: 'https://support.apple.com/en-us/102521' }],
  },
  related: ['life-in-weeks', 'year-progress', 'habit-compounding', 'real-hourly-wage', 'dry-january'],
  examples: [
    // 55 years left; 5/24 × 55 = 11.458333; share 5/16 = 31.25%; 5 × 365 = 1825; 55/24 = 2.291667.
    { values: { hours: 5, age: 25, expected: 80, sleep: 8 }, expect: { years: 275 / 24, share: 31.25, perYear: 1825, swap: 55 / 24 }, tolerance: 1e-6 },
    // 12 h a day, 24 years left: 12/24 × 24 = 12 years; 12/(24 − 6) = 66.667%.
    { values: { hours: 12, age: 56, expected: 80, sleep: 6 }, expect: { years: 12, share: 200 / 3, perYear: 4380, swap: 1 }, tolerance: 1e-6 },
  ],
});
