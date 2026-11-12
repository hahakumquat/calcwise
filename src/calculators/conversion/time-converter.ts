import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'time',
  [
    { id: 'h', name: 'Hours', info: '60 minutes, or 3,600 seconds.' },
    { id: 'ms', name: 'Milliseconds', info: 'One thousandth of a second — used for reaction and network times.' },
    { id: 's', name: 'Seconds', info: 'The SI unit of time, defined by caesium atomic clocks.' },
    { id: 'min', name: 'Minutes', info: 'One minute is 60 seconds; an hour is 60 minutes.' },
    { id: 'd', name: 'Days', info: '24 hours, or 86,400 seconds (ignoring rare leap seconds).' },
    { id: 'wk', name: 'Weeks', info: '7 days, or 168 hours.' },
    { id: 'mo', name: 'Months (average)', info: 'An average month: one twelfth of an average Gregorian year, about 30.44 days.' },
    { id: 'yr', name: 'Years (average)', precision: 8, info: 'The average Gregorian year of 365.2425 days, which accounts for leap years.' },
  ],
  'h',
  {
  chartUnits: ['wk', 'd'], chartTitle: 'Weeks and days side by side',
  extra: (s) => {
    const neg = s < 0;
    let t = Math.round(Math.abs(s));
    const d = Math.floor(t / 86400);
    t -= d * 86400;
    const h = Math.floor(t / 3600);
    t -= h * 3600;
    const m = Math.floor(t / 60);
    const sec = t - m * 60;
    return { dhms: `${neg ? '−' : ''}${d} d ${h} h ${m} min ${sec} s` };
  } },
);

export default defineCalculator({
  slug: 'time-converter',
  title: 'Time Converter',
  category: 'conversion',
  description: 'Convert between seconds, minutes, hours, days, weeks, months and years.',
  keywords: ['hours to minutes', 'minutes to hours', 'seconds to minutes', 'days to hours', 'weeks to days', 'time unit converter'],
  inputs: [{ id: 'value', label: 'Time', type: 'number', unit: 'time', defaultUnit: 'd', default: 1, info: 'Enter a length of time and pick its unit; every other unit updates instantly.' }],
  outputs: [...conv.outputs, { id: 'dhms', label: 'Days, hours, minutes, seconds', format: 'text', info: 'The total split into whole days, hours, minutes and seconds — easier to read for large values.' }],
  compute: conv.compute,
  content: {
    formula: ['1 min = 60 s; 1 h = 3,600 s; 1 day = 86,400 s', '1 week = 7 days', '1 year (Gregorian average) = 365.2425 days', '1 month (average) = 1/12 year = 30.436875 days'],
    body: [
      'Seconds, minutes, hours, days and weeks convert with fixed factors: 60, 60, 24 and 7. The second itself is defined by atomic clocks as 9,192,631,770 oscillations of a caesium-133 atom.',
      'Months and years are not fixed lengths. Here a year is the average Gregorian calendar year of 365.2425 days — the value that keeps leap years in step over a 400-year cycle — and a month is one twelfth of that, about 30.44 days. For a specific span of calendar dates, use the date difference calculator instead.',
      'The last output splits the total into days, hours, minutes and seconds, which is easier to read for large numbers of seconds or minutes.',
    ],
    faq: [
      { q: 'How many seconds are in a day?', a: '86,400 (24 × 60 × 60), ignoring the occasional leap second.' },
      { q: 'How many hours are in a year?', a: '8,760 in a 365-day year and 8,784 in a leap year. The average Gregorian year is 8,765.82 hours.' },
    ],
  },
  related: ['date-difference', 'time-duration', 'speed-converter'],
  examples: [
    { values: { value: 86400 }, expect: { h: 24, min: 1440, d: 1, wk: 1 / 7, dhms: '1 d 0 h 0 min 0 s' } },
    { values: { value: 31556952 }, expect: { yr: 1, mo: 12, d: 365.2425 } },
    { values: { value: 100000 }, expect: { dhms: '1 d 3 h 46 min 40 s' } },
  ],
});
