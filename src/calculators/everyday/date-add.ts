import { defineCalculator } from '../../lib/types';
import { parseDate, formatDate, num, DAY_MS } from '../../lib/math';
import { addMonths, isoDate } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'date-add',
  title: 'Add or Subtract Days to a Date',
  category: 'everyday',
  description: 'Add or subtract days, weeks, months and years from a date to find the resulting calendar date.',
  keywords: ['date calculator', 'days from today', 'days from now', 'subtract days', 'deadline', 'due date'],
  inputs: [
    { id: 'start', label: 'Start date', type: 'date', default: 'today', info: 'The date you are counting from. It counts as day 0.' },
    {
      id: 'op',
      label: 'Operation',
      type: 'select',
      segmented: true,
      default: 'add',
      info: 'Add moves forward in time (a future deadline); subtract moves back (a date in the past).',
      options: [
        { value: 'add', label: 'Add' },
        { value: 'sub', label: 'Subtract' },
      ],
    },
    { id: 'years', label: 'Years', type: 'number', default: 0, min: 0, step: 1, optional: true, info: 'Whole calendar years. Adding one year keeps the same day and month.' },
    { id: 'months', label: 'Months', type: 'number', default: 0, min: 0, step: 1, optional: true, info: 'Whole calendar months. If the day does not exist in the target month, the last day of that month is used.' },
    { id: 'weeks', label: 'Weeks', type: 'number', default: 0, min: 0, step: 1, optional: true, info: 'Whole weeks of exactly 7 days.' },
    { id: 'days', label: 'Days', type: 'number', default: 30, min: 0, step: 1, optional: true, info: 'Calendar days, weekends included. 30 days is not always the same as one month.' },
  ],
  outputs: [
    { id: 'result', label: 'Resulting date', format: 'text', primary: true, info: 'The calendar date you land on, with its day of the week.' },
    { id: 'iso', label: 'ISO date', format: 'text', info: 'The same date in the international yyyy-mm-dd format used by spreadsheets and software.' },
    { id: 'span', label: 'Total days moved', format: 'integer', info: 'The number of calendar days between the start date and the result.' },
  ],
  compute: (v) => {
    const d = parseDate(v.start);
    if (!d) return { result: null };
    const y = num(v.years) ?? 0;
    const m = num(v.months) ?? 0;
    const w = num(v.weeks) ?? 0;
    const dd = num(v.days) ?? 0;
    if (![y, m, w, dd].every(Number.isInteger)) return { result: null, error: 'Use whole numbers of years, months, weeks and days.' };
    const sign = v.op === 'sub' ? -1 : 1;
    const afterMonths = addMonths(d, sign * (y * 12 + m));
    const out = new Date(afterMonths.getTime() + sign * (w * 7 + dd) * DAY_MS);
    if (Number.isNaN(out.getTime()) || out.getUTCFullYear() < 1 || out.getUTCFullYear() > 9999) return { result: null, error: 'That date is out of range.' };
    const clamped = afterMonths.getUTCDate() !== d.getUTCDate();
    const calDays = Math.round(Math.abs(afterMonths.getTime() - d.getTime()) / DAY_MS);
    return {
      result: formatDate(out),
      iso: isoDate(out),
      span: Math.round(Math.abs(out.getTime() - d.getTime()) / DAY_MS),
      chart: {
        type: 'bar',
        title: 'Days contributed by each part',
        categories: ['Years + months', 'Weeks', 'Days'],
        series: [{ name: 'Days', values: [calDays, Math.abs(w * 7), Math.abs(dd)] }],
        format: { format: 'integer', suffix: 'days' },
      },
      note: clamped ? 'The start day does not exist in the target month, so the last day of that month was used.' : undefined,
      steps: [
        `${sign > 0 ? '+' : '−'} ${y} years ${m} months → ${isoDate(afterMonths)}`,
        `${sign > 0 ? '+' : '−'} ${w} weeks ${dd} days (${w * 7 + dd} days) → ${isoDate(out)}`,
      ],
    };
  },
  content: {
    formula: ['Result = start date ± (years and months on the calendar) ± (7 × weeks + days)'],
    body: [
      'Years and months are applied first, on the calendar: adding one month to March 15 gives April 15, whatever the length of March. Weeks and days are then added as exact 24-hour days.',
      'If the target month is too short for the starting day — for example January 31 plus one month — the result is moved back to the last day of that month (February 28, or 29 in a leap year). This matches how most banks, contracts and spreadsheet functions such as EDATE behave.',
      'Typical uses include working out a 90-day return window, a notice period, a contract renewal, the end of a probation period or the date a certain number of weeks ago.',
    ],
    faq: [
      { q: 'Is the start date counted as day 0 or day 1?', a: 'Day 0. Adding 1 day to Monday gives Tuesday. If your rule says “within 10 days including today”, add 9.' },
      { q: 'Why not just treat a month as 30 days?', a: 'Because calendar months range from 28 to 31 days. Use the Days box with 30 if your rule really means 30 days rather than one month.' },
    ],
  },
  related: ['date-difference', 'age', 'time-duration'],
  examples: [
    { values: { start: '2024-01-31', op: 'add', years: 0, months: 1, weeks: 0, days: 0 }, expect: { iso: '2024-02-29', result: 'Thu, February 29, 2024', span: 29 } },
    { values: { start: '2026-03-01', op: 'sub', years: 0, months: 0, weeks: 1, days: 3 }, expect: { iso: '2026-02-19', span: 10 } },
    { values: { start: '2025-11-12', op: 'add', years: 1, months: 2, weeks: 0, days: 30 }, expect: { iso: '2027-02-11' } },
  ],
});
