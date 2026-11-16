import { defineCalculator } from '../../lib/types';
import { parseDate, DAY_MS } from '../../lib/math';
import { countWeekdays, plural } from '../../lib/helpers/everyday';

const isLeap = (y: number) => (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;

export default defineCalculator({
  slug: 'year-progress',
  title: 'Year Progress Calculator',
  category: 'everyday',
  description: 'See what percent of the year is done, the day of the year, and the days, weeks and weekdays left until January 1. Pick any date.',
  keywords: ['year progress', 'how much of the year is left', 'what percent of the year is over', 'days left in the year', 'weeks left in the year', 'day of the year'],
  updated: '2026-11-16',
  inputs: [
    { id: 'date', label: 'Date', type: 'date', default: 'today', info: 'The day to measure. Leave it as today for a live check, or pick any date.' },
  ],
  outputs: [
    { id: 'pct', label: 'Year done', format: 'number', precision: 1, suffix: '%', primary: true, info: 'Day of the year divided by the days in that year (365, or 366 in a leap year). The chosen day counts as done.' },
    { id: 'dayOfYear', label: 'Day of the year', format: 'integer', info: 'January 1 is day 1.' },
    { id: 'daysLeft', label: 'Days left after this one', format: 'integer', suffix: 'days', info: 'Days from the next day to December 31.' },
    { id: 'toNewYear', label: 'Days until January 1', format: 'integer', suffix: 'days', info: 'Days left plus one. On December 31 this is 1.' },
    { id: 'weeksLeft', label: 'Weeks left', format: 'number', precision: 1, suffix: 'weeks', info: 'Days left divided by seven.' },
    { id: 'weekdaysLeft', label: 'Weekdays left (Mon–Fri)', format: 'integer', help: 'Public holidays are not excluded.', info: 'Mondays to Fridays after this day, through December 31.' },
  ],
  compute: (v) => {
    const d = parseDate(v.date);
    if (!d) return { pct: null };
    const y = d.getUTCFullYear();
    const total = isLeap(y) ? 366 : 365;
    const dayOfYear = Math.round((d.getTime() - Date.UTC(y, 0, 1)) / DAY_MS) + 1;
    const left = total - dayOfYear;
    const pct = (dayOfYear / total) * 100;
    const next = new Date(d.getTime() + DAY_MS);
    const weekdaysLeft = countWeekdays(next, left);
    return {
      pct,
      dayOfYear,
      daysLeft: left,
      toNewYear: left + 1,
      weeksLeft: left / 7,
      weekdaysLeft,
      badge: `${Math.round(pct)}% of ${y} is gone`,
      chart: {
        type: 'donut',
        title: `${y} so far`,
        format: { format: 'integer', suffix: 'days' },
        slices: [
          { label: 'Days done', value: dayOfYear },
          { label: 'Days left', value: left },
        ],
        centerValue: `${Math.round(pct)}%`,
        centerLabel: 'done',
      },
      steps: [
        `Day of the year = ${dayOfYear} of ${total}`,
        `Year done = ${dayOfYear} ÷ ${total} = ${pct.toFixed(1)}%`,
        `Days left = ${total} − ${dayOfYear} = ${left}, which is ${(left / 7).toFixed(1)} weeks`,
      ],
      note: `${plural(left, 'day')} left in ${y} after this one, and ${plural(weekdaysLeft, 'weekday')} among them.`,
    };
  },
  content: {
    formula: ['Year done % = day of the year ÷ days in the year × 100', 'Days left = days in the year − day of the year', 'Days until January 1 = days left + 1'],
    body: [
      'Pick a date and this shows how far through the year you are. January 1 is day 1, and the day you choose counts as done, so December 31 is always 100%.',
      'The days in the year are 365, or 366 in a leap year. A leap year is divisible by 4, except century years that are not divisible by 400, so 2028 has 366 days and 2100 has 365.',
      'Weekdays left counts Monday to Friday after the chosen day, through December 31. Public holidays are not removed, so take off any that fall in that stretch if you need working days.',
      'To count down to a specific date such as Christmas, or to measure between any two dates, use the date difference calculator.',
    ],
    faq: [
      { q: 'What percent of the year is over today?', a: 'Leave the date on today. The result is the day of the year divided by 365 (366 in a leap year). For example, 2026-12-16 is day 350 of 365, which is 95.9%.' },
      { q: 'How many days are left in the year?', a: 'The days-left figure counts from tomorrow to December 31. On 2026-12-16 that is 15 days. Add one for the days until January 1, which is 16.' },
      { q: 'Does it handle leap years?', a: 'Yes. In a leap year the total is 366, so February 29 exists and every later day number is one higher.' },
      { q: 'Are weekdays left exact?', a: 'They count Monday to Friday after the chosen date. Public holidays are not excluded.' },
    ],
    sources: [
      { label: 'Leap year (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Leap_year' },
      { label: 'Ordinal date (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Ordinal_date' },
    ],
  },
  related: ['date-difference', 'date-add', 'habit-compounding', 'savings-challenge'],
  examples: [
    // 2026-12-16: Jan 1 is day 1; days before Dec 1 = 334, so Dec 16 = 350. 350/365 = 95.89%. Left 15.
    // After Dec 16 (Wed): 17 Thu,18 Fri =2, 21-25 =5, 28-31 =4 -> 11.
    { values: { date: '2026-12-16' }, expect: { dayOfYear: 350, daysLeft: 15, toNewYear: 16, weekdaysLeft: 11 }, tolerance: 1e-9 },
    { values: { date: '2026-12-31' }, expect: { pct: 100, dayOfYear: 365, daysLeft: 0, weekdaysLeft: 0 }, tolerance: 1e-9 },
    // Leap year: 2028-03-01 = 31 + 29 + 1 = day 61 of 366; left 305.
    { values: { date: '2028-03-01' }, expect: { dayOfYear: 61, daysLeft: 305 }, tolerance: 1e-9 },
  ],
});
