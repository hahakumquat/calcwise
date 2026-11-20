import { defineCalculator } from '../../lib/types';
import { parseDate, DAY_MS } from '../../lib/math';
import { plural } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'retirement-countdown',
  title: 'Retirement Countdown: Days, Weeks & Workdays',
  category: 'fire',
  description: 'Count down to your retirement date in days, weeks, workdays and Mondays left. Enter the day you plan to stop working and see how long is really left.',
  keywords: ['retirement countdown', 'days until retirement', 'how many days until i retire', 'workdays until retirement', 'retirement date calculator', 'countdown to retirement'],
  updated: '2026-11-20',
  inputs: [
    { id: 'retire', label: 'Retirement date', type: 'date', default: '2046-01-01', info: 'The day you plan to stop working. Counting stops the day before, so this day itself is not counted.' },
    { id: 'today', label: 'Today', type: 'date', default: 'today', info: 'Leave as today for a live countdown, or change it to count from another day.' },
  ],
  outputs: [
    { id: 'days', label: 'Days left', format: 'integer', suffix: 'days', primary: true, info: 'Whole calendar days from today up to your retirement date.' },
    { id: 'weeks', label: 'Weeks left', format: 'number', precision: 1, suffix: 'weeks', info: 'Days divided by seven.' },
    { id: 'workdays', label: 'Workdays left', format: 'integer', suffix: 'days', info: 'Monday to Friday days between today and your retirement date, counting today. Holidays and leave are not removed.' },
    { id: 'mondays', label: 'Mondays left', format: 'integer', info: 'How many Mondays you will still live through before the date.' },
    { id: 'years', label: 'Years left', format: 'number', precision: 1, suffix: 'years', info: 'Days divided by 365.25.' },
  ],
  compute: (v) => {
    const t = parseDate(v.today);
    const r = parseDate(v.retire);
    if (!t || !r) return { days: null };
    const days = Math.round((r.getTime() - t.getTime()) / DAY_MS);
    if (days <= 0) {
      return {
        days: 0, weeks: 0, workdays: 0, mondays: 0, years: 0,
        tone: 'ok',
        badge: days === 0 ? 'Retirement is today' : 'Retirement date has passed',
        note: days === 0 ? 'Your retirement date is today.' : 'That date is before today, so pick a later date for a countdown.',
      };
    }
    const full = Math.floor(days / 7);
    const rem = days % 7;
    let workdays = full * 5;
    let mondays = full;
    const startDow = t.getUTCDay();
    for (let i = 0; i < rem; i++) {
      const d = (startDow + i) % 7;
      if (d >= 1 && d <= 5) workdays++;
      if (d === 1) mondays++;
    }
    const weekendDays = days - workdays;
    const years = days / 365.25;
    return {
      days,
      weeks: days / 7,
      workdays,
      mondays,
      years,
      tone: 'ok',
      badge: `${plural(workdays, 'workday')} to go`,
      chart: {
        type: 'donut',
        title: 'Workdays vs weekend days left',
        format: { format: 'integer', suffix: 'days' },
        slices: [
          { label: 'Workdays', value: workdays },
          { label: 'Weekend days', value: weekendDays },
        ],
        centerValue: String(workdays),
        centerLabel: 'workdays',
      },
      steps: [
        `Days left = ${v.retire} − ${v.today} = ${days}`,
        `${days} days = ${full} full weeks and ${rem} extra days`,
        `Workdays = ${full} × 5 plus the weekdays among the ${rem} extra days = ${workdays}`,
        `Mondays = ${full} plus any Monday among the extra days = ${mondays}`,
      ],
      note: `${plural(days, 'day')} left, about ${years.toFixed(1)} years. Workdays do not subtract public holidays or paid leave.`,
    };
  },
  content: {
    formula: [
      'Days left = retirement date − today (calendar days)',
      'Workdays = 5 × full weeks + weekdays in the leftover days',
      'Mondays = full weeks + 1 if a Monday falls in the leftover days',
    ],
    body: [
      'Enter the day you plan to stop working and see how much time is left, in days, weeks, workdays and Mondays. It is a countdown, not a forecast: it does not check whether your savings will be enough by then.',
      'Today counts as day one, and your retirement date itself is not counted. Workdays are every Monday to Friday in that span. Public holidays and paid time off are not subtracted, so your real number of days at work is lower than the workday count.',
      'Dates are compared as plain calendar days, so daylight-saving changes never add or remove a day. Leap days are included.',
      'To check whether the date is realistic, try the years to financial independence or FIRE number calculators. To see your current age, use the age calculator.',
    ],
    faq: [
      { q: 'How many days until retirement from 2026-11-20 to 2046-01-01?', a: 'It is 6,982 days, which is 997.4 weeks or about 19.1 years: 4,986 workdays and 997 Mondays.' },
      { q: 'Are weekends and holidays removed from the workday count?', a: 'Weekends are. Public holidays and paid leave are not, because they differ by country and employer.' },
      { q: 'How are Mondays counted?', a: 'Every full week has exactly one Monday. Any leftover days after the full weeks add one more if a Monday falls among them.' },
      { q: 'Does this tell me if I can afford to retire?', a: 'No. It only counts time. Use the FIRE number or years to FI calculators to test whether your savings are on track.' },
    ],
    sources: [
      { label: 'Gregorian calendar (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Gregorian_calendar' },
    ],
  },
  related: ['years-to-fi', 'fire-number', 'age', 'date-difference'],
  examples: [
    // Fri Nov 20 -> Fri Dec 4: 14 days = 2 weeks, 10 workdays, 2 Mondays
    { values: { retire: '2026-12-04', today: '2026-11-20' }, expect: { days: 14, weeks: 2, workdays: 10, mondays: 2 }, tolerance: 1e-9 },
    // 365 days = 52 weeks + 1 extra Friday: 261 workdays, 52 Mondays
    { values: { retire: '2027-11-20', today: '2026-11-20' }, expect: { days: 365, workdays: 261, mondays: 52 }, tolerance: 1e-9 },
    // Fri -> Sat: just today (a Friday)
    { values: { retire: '2026-11-21', today: '2026-11-20' }, expect: { days: 1, workdays: 1, mondays: 0 }, tolerance: 1e-9 },
    // Sat Nov 21 -> Tue Nov 24: Sat, Sun, Mon = 3 days, 1 workday, 1 Monday
    { values: { retire: '2026-11-24', today: '2026-11-21' }, expect: { days: 3, workdays: 1, mondays: 1 }, tolerance: 1e-9 },
    // 6982 = 997 weeks + 3 extra days (Fri, Sat, Sun): 4985 + 1 workdays
    { values: { retire: '2046-01-01', today: '2026-11-20' }, expect: { days: 6982, workdays: 4986, mondays: 997 }, tolerance: 1e-9 },
  ],
});
