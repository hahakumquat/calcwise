import { defineCalculator } from '../../lib/types';
import { parseDate, formatDate, num, DAY_MS } from '../../lib/math';
import { isoDate } from '../../lib/helpers/everyday';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'practice-hours-goal',
  title: 'Practice Hours Goal Planner',
  category: 'everyday',
  description: 'Find the date you reach a practice-hours goal for a language, instrument or coding. Enter goal hours, minutes per session, sessions a week and a start date.',
  keywords: ['practice hours calculator', 'how long to practice 100 hours', 'learning goal planner', 'hours per week to reach goal', 'practice schedule calculator', 'new year learning goal'],
  updated: '2026-11-26',
  inputs: [
    { id: 'goal', label: 'Goal hours', type: 'number', default: 100, min: 0.01, suffix: 'hours', info: 'Total hours of practice you want to log, for example 100 hours of piano or 200 hours of Spanish study.' },
    { id: 'minutes', label: 'Minutes per session', type: 'number', default: 20, min: 1, suffix: 'min', info: 'How long each practice session lasts.' },
    { id: 'sessions', label: 'Sessions per week', type: 'number', default: 5, min: 0.1, max: 21, suffix: 'per week', info: 'How many sessions you do in an average week. 7 means every day.' },
    { id: 'start', label: 'Start date', type: 'date', default: '2027-01-01', info: 'The day you begin. It counts as day 0, so the finish date is this date plus the days needed.' },
  ],
  outputs: [
    { id: 'weeks', label: 'Weeks to reach your goal', format: 'number', precision: 1, suffix: 'weeks', primary: true, info: 'Goal hours × 60 ÷ (minutes per session × sessions per week).' },
    { id: 'finish', label: 'Finish date', format: 'text', info: 'Start date plus the days needed, rounded up to a whole day.' },
    { id: 'days', label: 'Calendar days', format: 'number', precision: 0, suffix: 'days', info: 'Weeks × 7, rounded up.' },
    { id: 'perWeek', label: 'Hours per week', format: 'number', precision: 2, suffix: 'h', info: 'Minutes per session × sessions per week ÷ 60.' },
    { id: 'years', label: 'Years', format: 'number', precision: 2, suffix: 'years', info: 'Calendar days ÷ 365.' },
  ],
  compute: (v) => {
    const goal = num(v.goal);
    const minutes = num(v.minutes);
    const sessions = num(v.sessions);
    const start = parseDate(v.start);
    if (goal === null || minutes === null || sessions === null || !start) return { weeks: null };
    if (goal <= 0 || minutes <= 0 || sessions <= 0) return { weeks: null };
    if (sessions > 21) return { weeks: null, error: 'More than 21 sessions a week is not supported. Increase minutes per session instead.' };
    const perWeek = (minutes * sessions) / 60;
    const weeks = goal / perWeek;
    const days = Math.ceil(weeks * 7 - 1e-9);
    const years = days / 365;
    const end = new Date(start.getTime() + days * DAY_MS);
    if (Number.isNaN(end.getTime()) || end.getUTCFullYear() > 9999) return { weeks: null, error: 'That finish date is out of range.' };
    const steps = 5;
    const xs = Array.from({ length: steps + 1 }, (_, i) => Math.round(((weeks * i) / steps) * 10) / 10);
    const ys = xs.map((_, i) => (goal * i) / steps);
    return {
      weeks,
      finish: formatDate(end),
      days,
      perWeek,
      years,
      tone: 'ok',
      badge: weeks >= 52 ? `${fmt(years, 1)} years` : `${fmt(weeks, 1)} weeks`,
      note: `At ${fmt(perWeek, 2)} hours a week you log ${fmt(goal, 1)} hours by ${isoDate(end)}. This counts time spent, not skill gained.`,
      chart: {
        type: 'line',
        title: 'Practice hours logged over time',
        x: xs,
        xLabel: 'Weeks from start',
        yFormat: { format: 'number', precision: 0, suffix: 'h' },
        series: [{ name: 'Hours logged', values: ys }],
      },
      steps: [
        `Hours per week = ${fmt(minutes)} × ${fmt(sessions, 1)} ÷ 60 = ${fmt(perWeek, 3)}`,
        `Weeks = ${fmt(goal, 1)} ÷ ${fmt(perWeek, 3)} = ${fmt(weeks, 2)}`,
        `Days = ${fmt(weeks, 2)} × 7, rounded up = ${fmt(days)}; finish = ${isoDate(end)}`,
      ],
    };
  },
  content: {
    formula: [
      'Hours per week = minutes per session × sessions per week ÷ 60',
      'Weeks = goal hours ÷ hours per week',
      'Finish date = start date + (weeks × 7) days, rounded up',
    ],
    body: [
      'Many learning goals are really a count of hours: so many hours of language study, instrument practice or coding. This planner turns that number into a schedule. Enter the hours you want to log, how long each session lasts and how many sessions you do in a typical week, and it shows how many weeks it takes and the date you finish.',
      'It only measures time spent. It does not say how good you will be at the end, because that depends on how you practise, the quality of feedback and where you start. Treat the hours as a plan you can follow, not a promise of a result.',
      'The famous 10,000 hours figure makes a good stress test of the maths. At one hour a day, every day, it takes 10,000 days, about 27.4 years. It is a number from a popular story, not a rule, so use goals that fit your own aim.',
      'If the finish date feels too far away, the fastest levers are longer sessions or more sessions a week. For a goal measured in pages or miles rather than hours, try the goal pace calculator or the reading goal calculator.',
    ],
    faq: [
      { q: 'How long does 100 hours take at 20 minutes, 5 days a week?', a: 'That is 20 × 5 = 100 minutes, or 1.67 hours, a week. 100 ÷ 1.67 = 60 weeks, which is 420 days. Starting on 1 January 2027 you finish on 25 February 2028.' },
      { q: 'What changes if I double the session length?', a: 'At 40 minutes a session, 5 days a week, you log 3.33 hours a week, so 100 hours takes 30 weeks (210 days). Doubling the time per week halves the weeks.' },
      { q: 'How long would 10,000 hours take?', a: 'At 60 minutes a session, 7 sessions a week, you log 7 hours a week. 10,000 ÷ 7 = 1,428.6 weeks, which is 10,000 days or about 27.4 years. The figure is a popular story, not a threshold for becoming an expert.' },
      { q: 'Does hitting my hours mean I have learned the skill?', a: 'No. The calculator counts time, not results. How you practise matters as much as how long, so check progress in other ways too.' },
      { q: 'How is the finish date worked out?', a: 'Weeks times 7 gives calendar days, rounded up to a whole day. The start date counts as day 0, so the finish date is the start date plus that many days.' },
    ],
    sources: [],
  },
  related: ['goal-pace', 'reading-goal', 'date-add', 'year-progress'],
  examples: [
    // 20 x 5 / 60 = 1.6667 h/week; 100 / 1.6667 = 60 weeks; 420 days; 2027-01-01 + 420 d = 2028-02-25 (365 to 2028-01-01, +55)
    { values: { goal: 100, minutes: 20, sessions: 5, start: '2027-01-01' }, expect: { weeks: 60, days: 420, perWeek: 100 / 60, years: 420 / 365 }, tolerance: 1e-9 },
    // 40 x 5 / 60 = 3.3333 h/week; 100 / 3.3333 = 30 weeks; 210 days
    { values: { goal: 100, minutes: 40, sessions: 5, start: '2027-01-01' }, expect: { weeks: 30, days: 210, perWeek: 200 / 60 }, tolerance: 1e-9 },
    // 10,000 h at 60 min x 7 = 7 h/week; 1428.5714 weeks; 10,000 days; 10000/365 = 27.397 years
    { values: { goal: 10000, minutes: 60, sessions: 7, start: '2027-01-01' }, expect: { weeks: 10000 / 7, days: 10000, perWeek: 7, years: 10000 / 365 }, tolerance: 1e-9 },
  ],
});
