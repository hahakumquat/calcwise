import { defineCalculator } from '../../lib/types';
import { parseDate, DAY_MS } from '../../lib/math';
import { ymdDiff, countWeekdays, plural } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'date-difference',
  title: 'Date Difference Calculator',
  category: 'everyday',
  description: 'Count the days, weeks, months and business days between two dates.',
  keywords: ['days between dates', 'date duration', 'how many days until', 'business days', 'working days'],
  popular: true,
  inputs: [
    { id: 'start', label: 'Start date', type: 'date', default: 'today', info: 'The first date of the period. Counting starts from the beginning of this day.' },
    { id: 'end', label: 'End date', type: 'date', default: '2026-12-25', info: 'The last date of the period. If it is before the start date, the two are swapped.' },
    {
      id: 'includeEnd',
      label: 'Include the end date',
      type: 'toggle',
      default: false,
      help: 'Turn on to count both the first and last day (e.g. a 3-day event from Friday to Sunday).',
      info: 'Off measures elapsed time (Monday to Wednesday = 2 days). On counts both endpoints (Monday to Wednesday = 3 days).',
    },
  ],
  outputs: [
    { id: 'days', label: 'Days', format: 'integer', suffix: 'days', primary: true, info: 'The total number of calendar days in the period, including weekends and holidays.' },
    { id: 'weeksDays', label: 'Weeks and days', format: 'text', info: 'The same total split into full weeks plus leftover days.' },
    { id: 'ymd', label: 'Years, months, days', format: 'text', info: 'The period expressed on the calendar: whole years, then whole months, then remaining days.' },
    { id: 'weeks', label: 'Total weeks', precision: 2, suffix: 'weeks', info: 'Total days divided by seven, with decimals.' },
    { id: 'businessDays', label: 'Business days (Mon–Fri)', format: 'integer', help: 'Public holidays are not excluded.', info: 'Days that fall Monday to Friday. Subtract any public holidays in the period yourself.' },
    { id: 'hours', label: 'Total hours', format: 'integer', info: 'Total days × 24 hours, ignoring daylight-saving changes.' },
  ],
  compute: (v) => {
    let a = parseDate(v.start);
    let b = parseDate(v.end);
    if (!a || !b) return { days: null };
    let swapped = false;
    if (b.getTime() < a.getTime()) {
      [a, b] = [b, a];
      swapped = true;
    }
    const inc = v.includeEnd === 'on';
    const days = Math.round((b.getTime() - a.getTime()) / DAY_MS) + (inc ? 1 : 0);
    const cal = ymdDiff(a, inc ? new Date(b.getTime() + DAY_MS) : b);
    const businessDays = countWeekdays(a, days);
    return {
      days,
      weeksDays: `${plural(Math.floor(days / 7), 'week')}, ${plural(days % 7, 'day')}`,
      ymd: `${plural(cal.years, 'year')}, ${plural(cal.months, 'month')}, ${plural(cal.days, 'day')}`,
      weeks: days / 7,
      businessDays,
      hours: days * 24,
      chart:
        days > 0
          ? {
              type: 'donut',
              title: 'Weekdays vs weekend days',
              format: { format: 'integer', suffix: 'days' },
              slices: [
                { label: 'Weekdays (Mon–Fri)', value: businessDays },
                { label: 'Weekend days', value: days - businessDays },
              ],
              centerValue: String(days),
              centerLabel: 'days',
            }
          : { type: 'bar', title: 'Days counted', categories: ['Days'], series: [{ name: 'Days', values: [0] }], format: { format: 'integer' } },
      note: swapped ? 'The end date was before the start date, so the dates were swapped.' : undefined,
      steps: [`${days} days ÷ 7 = ${(days / 7).toFixed(2)} weeks`, inc ? 'End date counted (+1 day).' : 'End date not counted.'],
    };
  },
  content: {
    formula: ['Days = end date − start date (+ 1 if the end date is included)', 'Business days = days that fall Monday to Friday'],
    body: [
      'By default the count works like a timer: from the start of the first date to the start of the last, so Monday to Wednesday is 2 days. Switch on “Include the end date” when both days should count — for event lengths, leave requests or medication courses that run through the final day.',
      'The years-months-days breakdown follows the calendar, so the same number of days can read differently depending on which months it spans. Weeks are simply days divided by seven.',
      'Business days count every Monday to Friday in the range. National and local holidays vary, so subtract any that fall in your period if you need an exact working-day count.',
    ],
    faq: [
      { q: 'How many days are there until Christmas?', a: 'Leave the start date as today and set the end date to December 25. The result updates every day you open the page.' },
      { q: 'Are leap years taken into account?', a: 'Yes. The calculation uses the real calendar, so a range that includes February 29 is one day longer.' },
      { q: 'Why is my business-day count one off?', a: 'Check the “include end date” switch. With it off, the end date itself is not counted, even if it is a weekday.' },
    ],
  },
  related: ['date-add', 'age', 'time-duration', 'hours-worked'],
  examples: [
    { values: { start: '2026-03-02', end: '2026-03-16', includeEnd: 'off' }, expect: { days: 14, businessDays: 10, weeksDays: '2 weeks, 0 days', ymd: '0 years, 0 months, 14 days' } },
    { values: { start: '2026-03-02', end: '2026-03-16', includeEnd: 'on' }, expect: { days: 15, businessDays: 11 } },
    { values: { start: '2026-01-01', end: '2026-12-25', includeEnd: 'off' }, expect: { days: 358, businessDays: 256, ymd: '0 years, 11 months, 24 days' } },
  ],
});
