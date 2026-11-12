import { defineCalculator } from '../../lib/types';
import { parseClock, formatHM } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'time-duration',
  title: 'Time Duration Calculator',
  category: 'everyday',
  description: 'Find the hours and minutes between two clock times, including spans that cross midnight.',
  keywords: ['hours between times', 'time difference', 'elapsed time', 'how many hours', 'minutes between'],
  inputs: [
    { id: 'start', label: 'Start time', type: 'text', default: '22:30', placeholder: 'HH:MM, e.g. 09:15 or 9:15 am', info: 'When the period begins. Type 24-hour time (21:30) or 12-hour time with am/pm (9:30 pm).' },
    { id: 'end', label: 'End time', type: 'text', default: '06:15', placeholder: 'HH:MM, e.g. 17:45 or 5:45 pm', info: 'When the period ends. An end time earlier than the start is treated as the next day.' },
  ],
  outputs: [
    { id: 'duration', label: 'Duration', format: 'text', primary: true, info: 'The elapsed time in hours and minutes.' },
    { id: 'decimalHours', label: 'Decimal hours', precision: 4, suffix: 'h', info: 'The duration as a decimal number of hours (45 minutes = 0.75 h) — the format timesheets and invoices use.' },
    { id: 'minutes', label: 'Total minutes', format: 'integer', suffix: 'min', info: 'The whole duration expressed in minutes.' },
    { id: 'seconds', label: 'Total seconds', format: 'integer', suffix: 's', info: 'The whole duration expressed in seconds.' },
  ],
  compute: (v) => {
    const s = parseClock(v.start);
    const e = parseClock(v.end);
    if (s === null || e === null) return { duration: null, error: 'Enter times as HH:MM (24-hour) or with am/pm, e.g. 21:30 or 9:30 pm.' };
    const overnight = e < s;
    const mins = overnight ? e + 1440 - s : e - s;
    return {
      duration: formatHM(mins),
      decimalHours: mins / 60,
      minutes: mins,
      seconds: mins * 60,
      chart: {
        type: 'donut',
        title: 'Share of a 24-hour day',
        format: { format: 'number', suffix: 'h' },
        slices: [
          { label: 'This period', value: mins / 60 },
          { label: 'Rest of the day', value: Math.max(0, 24 - mins / 60) },
        ],
        centerValue: `${((mins / 1440) * 100).toFixed(0)}%`,
        centerLabel: 'of a day',
      },
      note: overnight ? 'The end time is earlier than the start, so it was treated as the next day.' : undefined,
      steps: [
        `Start = ${s} min after midnight, end = ${e} min${overnight ? ' + 1440 (next day)' : ''}`,
        `Duration = ${mins} min = ${formatHM(mins)} = ${(mins / 60).toFixed(4)} h`,
      ],
    };
  },
  content: {
    formula: ['Duration = end − start', 'If end < start: duration = end + 24 h − start', 'Decimal hours = minutes ÷ 60'],
    body: [
      'Both times are converted to minutes after midnight and subtracted. When the end time is earlier on the clock than the start time, the calculator assumes the span runs past midnight and adds 24 hours — so a night shift from 22:30 to 06:15 comes out as 7 h 45 min.',
      'Decimal hours are what payroll and invoicing systems usually want: 7 h 45 min is 7.75 hours, because 45 minutes is three quarters of an hour. Divide minutes by 60 to convert, never by 100.',
      'You can type 24-hour times (17:45) or 12-hour times with am/pm (5:45 pm). Spans longer than 24 hours need a date as well; use the date difference calculator for those.',
    ],
    faq: [
      { q: 'How do I convert minutes to decimal hours?', a: 'Divide by 60. 15 minutes is 0.25 h, 20 minutes is 0.333 h, 30 minutes is 0.5 h and 45 minutes is 0.75 h.' },
      { q: 'What if start and end are the same?', a: 'The duration is zero. If you meant a full 24 hours, enter 00:00 and 24:00.' },
    ],
  },
  related: ['hours-worked', 'date-difference', 'time-converter'],
  examples: [
    { values: { start: '22:30', end: '06:15' }, expect: { duration: '7 h 45 min', decimalHours: 7.75, minutes: 465 } },
    { values: { start: '9:15 am', end: '5:45 pm' }, expect: { duration: '8 h 30 min', minutes: 510 } },
    { values: { start: '00:00', end: '24:00' }, expect: { minutes: 1440 } },
  ],
});
