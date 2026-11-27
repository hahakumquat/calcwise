import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const hm = (m: number) => {
  const h = Math.floor(m / 60);
  const r = m % 60;
  return h === 0 ? `${r} min` : r === 0 ? `${h} h` : `${h} h ${r} min`;
};

export default defineCalculator({
  slug: 'pomodoro-planner',
  title: 'Pomodoro Study Planner',
  category: 'everyday',
  description: 'Plan a Pomodoro study block. Enter focus sessions and focus and break lengths to get total time, focus minutes and break minutes, with long breaks.',
  keywords: ['pomodoro calculator', 'pomodoro study planner', 'how long is 8 pomodoros', 'pomodoro timer schedule', '25 5 15 pomodoro', 'study session planner'],
  updated: '2026-11-27',
  inputs: [
    { id: 'sessions', label: 'Focus sessions', type: 'number', default: 8, min: 1, max: 100, step: 1, info: 'How many focus sessions (pomodoros) you plan to do. Whole number, at least 1.' },
    { id: 'focus', label: 'Focus minutes', type: 'number', default: 25, min: 1, max: 240, step: 1, suffix: 'min', info: 'Length of each focus session. 25 is the popular default, not a rule.' },
    { id: 'short', label: 'Short break', type: 'number', default: 5, min: 0, max: 120, step: 1, suffix: 'min', info: 'Break between most sessions.' },
    { id: 'long', label: 'Long break', type: 'number', default: 15, min: 0, max: 240, step: 1, suffix: 'min', info: 'A longer break taken after every group of sessions.' },
    { id: 'every', label: 'Sessions before a long break', type: 'number', default: 4, min: 1, max: 100, step: 1, info: 'After this many sessions the next break is a long one.' },
  ],
  outputs: [
    { id: 'total', label: 'Total time', format: 'number', precision: 0, suffix: 'min', primary: true, info: 'Focus minutes plus break minutes. No break is added after the last session.' },
    { id: 'duration', label: 'Total in hours and minutes', format: 'text', info: 'The total time written as hours and minutes.' },
    { id: 'focusMin', label: 'Focus time', format: 'number', precision: 0, suffix: 'min', info: 'Sessions × focus minutes.' },
    { id: 'breakMin', label: 'Break time', format: 'number', precision: 0, suffix: 'min', info: 'Short breaks × short length + long breaks × long length.' },
    { id: 'shortCount', label: 'Short breaks', format: 'integer', info: 'Breaks between sessions that are not long breaks.' },
    { id: 'longCount', label: 'Long breaks', format: 'integer', info: 'Number of gaps ÷ sessions before a long break, rounded down.' },
  ],
  compute: (v) => {
    const n = num(v.sessions);
    const focus = num(v.focus);
    const sb = num(v.short);
    const lb = num(v.long);
    const every = num(v.every);
    if (n === null || focus === null || sb === null || lb === null || every === null) return { total: null };
    if (n < 1) return { total: null, error: 'Plan at least 1 focus session.' };
    if (!Number.isInteger(n)) return { total: null, error: 'Enter a whole number of sessions.' };
    if (!Number.isInteger(every) || every < 1) return { total: null, error: 'Sessions before a long break must be a whole number, 1 or more.' };
    if (focus < 1) return { total: null, error: 'Focus minutes must be at least 1.' };
    if (sb < 0 || lb < 0) return { total: null, error: 'Break lengths cannot be negative.' };
    const gaps = n - 1;
    const longCount = Math.floor(gaps / every);
    const shortCount = gaps - longCount;
    const focusMin = n * focus;
    const breakMin = shortCount * sb + longCount * lb;
    const total = focusMin + breakMin;
    return {
      total, duration: hm(total), focusMin, breakMin, shortCount, longCount,
      tone: 'ok',
      badge: hm(total),
      chart: { type: 'donut', title: 'Where the time goes', slices: [{ label: 'Focus', value: focusMin }, { label: 'Breaks', value: breakMin }], format: { format: 'number', precision: 0, suffix: ' min' }, centerLabel: 'Total', centerValue: hm(total) },
      steps: [
        `Gaps between sessions = ${n} − 1 = ${gaps}`,
        `Long breaks = floor(${gaps} ÷ ${every}) = ${longCount}; short breaks = ${gaps} − ${longCount} = ${shortCount}`,
        `Total = ${n} × ${focus} + ${shortCount} × ${sb} + ${longCount} × ${lb} = ${total} min (${hm(total)})`,
      ],
      note: 'The 25/5/15 pattern is a popular starting point, not a rule. Adjust it to what works for you.',
    };
  },
  content: {
    formula: [
      'Gaps = sessions − 1',
      'Long breaks = floor(gaps ÷ sessions before a long break)',
      'Short breaks = gaps − long breaks',
      'Total = sessions × focus + short breaks × short length + long breaks × long length',
    ],
    body: [
      'The Pomodoro technique splits work into timed focus sessions with short breaks between them. A common pattern is 25 minutes of focus, a 5 minute break, and a longer 15 minute break after every fourth session. This planner adds it all up so you know how long a study block really takes.',
      'The calculator puts a break only between sessions, not after the last one. With 8 sessions there are 7 gaps. Every fourth break is a long one, so 7 gaps give 1 long break and 6 short breaks.',
      'The 25, 5 and 15 minute numbers are a popular default, not a rule. Change any of them, including how many sessions come before a long break, to fit your own focus and schedule.',
      'To plan study time across a longer goal, try the practice hours goal calculator, or the weighted grade calculator to see where your effort counts most.',
    ],
    faq: [
      { q: 'How long are 8 Pomodoro sessions?', a: 'At 25 minutes of focus, 5 minute short breaks and 15 minute long breaks every 4 sessions, 8 sessions take 245 minutes, which is 4 h 5 min. That is 200 minutes of focus and 45 minutes of break.' },
      { q: 'How is the break time worked out?', a: 'There are 7 gaps for 8 sessions. The long break count is floor(7 ÷ 4) = 1, leaving 6 short breaks. Break time is 6 × 5 + 1 × 15 = 45 minutes.' },
      { q: 'What about 4 sessions?', a: '4 sessions have 3 gaps and no long break, since 3 ÷ 4 rounds down to 0. That is 100 focus minutes plus 3 × 5 = 15 break minutes, or 115 minutes in total (1 h 55 min).' },
      { q: 'Is 25 minutes the right focus length?', a: 'It is a popular default, not a rule. Some people prefer longer or shorter sessions, so edit the focus and break lengths to suit you.' },
      { q: 'Does it include a break after the last session?', a: 'No. Breaks are only counted between sessions, so you finish when the last focus session ends.' },
    ],
    sources: [],
  },
  related: ['practice-hours-goal', 'weighted-grade'],
  examples: [
    // 8 x 25 = 200 focus; gaps 7; long = floor(7/4) = 1; short = 6; breaks = 6x5 + 15 = 45; total 245
    { values: { sessions: 8, focus: 25, short: 5, long: 15, every: 4 }, expect: { total: 245, focusMin: 200, breakMin: 45, shortCount: 6, longCount: 1 }, tolerance: 1e-9 },
    // 4 x 25 = 100 focus; gaps 3; long 0; short 3; breaks 15; total 115
    { values: { sessions: 4, focus: 25, short: 5, long: 15, every: 4 }, expect: { total: 115, focusMin: 100, breakMin: 15, shortCount: 3, longCount: 0 }, tolerance: 1e-9 },
  ],
});
