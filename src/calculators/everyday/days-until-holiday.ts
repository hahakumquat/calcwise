import { defineCalculator } from '../../lib/types';
import { parseDate, DAY_MS } from '../../lib/math';
import { plural } from '../../lib/helpers/everyday';

const NAMES: Record<string, string> = {
  christmas: 'Christmas',
  newyear: "New Year's Day",
  nye: "New Year's Eve",
  valentine: "Valentine's Day",
  july4: 'Independence Day',
  halloween: 'Halloween',
  thanksgiving: 'Thanksgiving (US)',
  custom: 'your date',
};

/** UTC ms of the holiday occurring in year y. */
function holidayIn(id: string, y: number, custom: Date | null): number {
  switch (id) {
    case 'christmas': return Date.UTC(y, 11, 25);
    case 'newyear': return Date.UTC(y, 0, 1);
    case 'nye': return Date.UTC(y, 11, 31);
    case 'valentine': return Date.UTC(y, 1, 14);
    case 'july4': return Date.UTC(y, 6, 4);
    case 'halloween': return Date.UTC(y, 9, 31);
    case 'thanksgiving': {
      // 4th Thursday of November
      const dow = new Date(Date.UTC(y, 10, 1)).getUTCDay();
      const firstThu = 1 + ((4 - dow + 7) % 7);
      return Date.UTC(y, 10, firstThu + 21);
    }
    default:
      return custom ? Date.UTC(y, custom.getUTCMonth(), custom.getUTCDate()) : NaN;
  }
}

export default defineCalculator({
  slug: 'days-until-holiday',
  title: 'Days Until Christmas & Holiday Countdown',
  category: 'everyday',
  description: 'How many days (and sleeps) until Christmas, New Year, Thanksgiving, Halloween or any date? Pick a holiday for an instant countdown in days and weeks.',
  keywords: ['days until christmas', 'how many days until christmas', 'sleeps until christmas', 'countdown to new year', 'days until thanksgiving', 'days until halloween', 'holiday countdown'],
  updated: '2026-11-20',
  inputs: [
    {
      id: 'holiday', label: 'Count down to', type: 'select', default: 'christmas',
      options: [
        { value: 'christmas', label: 'Christmas (Dec 25)' },
        { value: 'newyear', label: "New Year's Day (Jan 1)" },
        { value: 'nye', label: "New Year's Eve (Dec 31)" },
        { value: 'thanksgiving', label: 'Thanksgiving (4th Thu of Nov, US)' },
        { value: 'valentine', label: "Valentine's Day (Feb 14)" },
        { value: 'july4', label: 'Independence Day (Jul 4)' },
        { value: 'halloween', label: 'Halloween (Oct 31)' },
        { value: 'custom', label: 'Custom date' },
      ],
      info: 'Pick a holiday, or choose Custom date and fill in the box below.',
    },
    { id: 'custom', label: 'Custom date (only used for Custom date)', type: 'date', optional: true, info: 'The next time this month and day comes round is counted. Ignored unless "Custom date" is selected above.' },
    { id: 'today', label: 'Today', type: 'date', default: 'today', info: 'Leave as today for a live countdown, or change it to count from another day.' },
  ],
  outputs: [
    { id: 'days', label: 'Days to go', format: 'integer', suffix: 'days', primary: true, info: 'Whole calendar days from today to the next occurrence. If the date is today, this is 0.' },
    { id: 'sleeps', label: 'Sleeps', format: 'integer', info: 'Nights you will sleep before the day. It is the same as the number of days.' },
    { id: 'weeks', label: 'Weeks', format: 'number', precision: 1, suffix: 'weeks', info: 'Days divided by seven.' },
    { id: 'weekdays', label: 'Weeks and days', format: 'text', info: 'The same count split into whole weeks and leftover days.' },
  ],
  compute: (v) => {
    const t = parseDate(v.today);
    if (!t) return { days: null };
    const id = String(v.holiday || 'christmas');
    const custom = parseDate(v.custom);
    if (id === 'custom' && !custom) return { days: null };
    const y = t.getUTCFullYear();
    let next = holidayIn(id, y, custom);
    if (next < t.getTime()) next = holidayIn(id, y + 1, custom);
    if (!Number.isFinite(next)) return { days: null };
    const prev = holidayIn(id, new Date(next).getUTCFullYear() - 1, custom);
    const days = Math.round((next - t.getTime()) / DAY_MS);
    const done = Math.max(0, Math.round((t.getTime() - prev) / DAY_MS));
    const wks = Math.floor(days / 7);
    const rem = days % 7;
    const name = NAMES[id] ?? 'your date';
    const nextDate = new Date(next).toISOString().slice(0, 10);
    return {
      days,
      sleeps: days,
      weeks: days / 7,
      weekdays: `${wks} ${wks === 1 ? 'week' : 'weeks'}, ${rem} ${rem === 1 ? 'day' : 'days'}`,
      tone: 'ok',
      badge: days === 0 ? `${name} is today` : `${plural(days, 'sleep')} until ${name}`,
      chart: {
        type: 'donut',
        title: `Time since the last ${id === 'custom' ? 'date' : name}`,
        format: { format: 'integer', suffix: 'days' },
        slices: [
          { label: 'Days passed', value: done },
          { label: 'Days to go', value: days },
        ],
        centerValue: String(days),
        centerLabel: 'to go',
      },
      steps: [
        `Next ${name}: ${nextDate}`,
        `Days to go = ${nextDate} − ${v.today} = ${days}`,
        `That is ${wks} full weeks and ${rem} days`,
      ],
      note: `${plural(days, 'day')} to go. Dates are compared as calendar days, so clock changes do not shift the count.`,
    };
  },
  content: {
    formula: ['Days to go = next holiday date − today (whole calendar days)', 'Thanksgiving (US) = the fourth Thursday of November'],
    body: [
      'Pick a holiday and see how many days are left. If this year\'s date has already passed, the countdown aims at next year\'s.',
      'Sleeps is the same number as days: the nights between today and the day itself. Weeks shows the same count divided by seven.',
      'Fixed-date holidays use their calendar date. Thanksgiving in the United States falls on the fourth Thursday of November, so its date changes each year; in 2026 it is November 26.',
      'Dates are compared as plain calendar days, so daylight-saving changes never add or remove a day. To measure between any two dates, or see how far through the year you are, use the date difference or year progress calculators.',
    ],
    faq: [
      { q: 'How many days until Christmas?', a: 'From 2026-11-20 it is 35 days: 10 days left in November plus 25 in December. From 2026-12-01 it is 24 days.' },
      { q: 'When is Thanksgiving?', a: 'In the United States it is the fourth Thursday of November. In 2026 November 1 is a Sunday, so the Thursdays are the 5th, 12th, 19th and 26th, and Thanksgiving is November 26.' },
      { q: 'What does "sleeps" mean?', a: 'It counts the nights before the day, which equals the number of days. 35 days to go is 35 sleeps.' },
      { q: 'What happens on the day itself?', a: 'The countdown shows 0 days and says the holiday is today. The next day it switches to next year.' },
    ],
    sources: [
      { label: 'Thanksgiving (US) – fourth Thursday of November (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Thanksgiving_(United_States)' },
      { label: 'Gregorian calendar (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Gregorian_calendar' },
    ],
  },
  related: ['year-progress', 'date-difference', 'date-add', 'gift-budget'],
  examples: [
    // Nov 20 -> Dec 25: 10 + 25 = 35
    { values: { holiday: 'christmas', today: '2026-11-20' }, expect: { days: 35, sleeps: 35, weeks: 5 }, tolerance: 1e-9 },
    { values: { holiday: 'christmas', today: '2026-12-01' }, expect: { days: 24 }, tolerance: 1e-9 },
    // Dec 1 -> Jan 1 = 31
    { values: { holiday: 'newyear', today: '2026-12-01' }, expect: { days: 31 }, tolerance: 1e-9 },
    // Thanksgiving 2026 = Nov 26; from Nov 20 = 6
    { values: { holiday: 'thanksgiving', today: '2026-11-20' }, expect: { days: 6 }, tolerance: 1e-9 },
    // On the day itself = 0; day after rolls to next year (Dec 26 -> Dec 25 2027 = 364)
    { values: { holiday: 'christmas', today: '2026-12-25' }, expect: { days: 0 }, tolerance: 1e-9 },
    { values: { holiday: 'christmas', today: '2026-12-26' }, expect: { days: 364 }, tolerance: 1e-9 },
  ],
});
