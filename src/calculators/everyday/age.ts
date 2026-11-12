import { defineCalculator } from '../../lib/types';
import { parseDate, formatDate, DAY_MS } from '../../lib/math';
import { ymdDiff, plural } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'age',
  title: 'Age Calculator',
  category: 'everyday',
  description: 'Find your exact age in years, months and days, plus total days lived and a countdown to your next birthday.',
  keywords: ['how old am i', 'date of birth', 'birthday', 'age in days', 'chronological age'],
  popular: true,
  inputs: [
    { id: 'birth', label: 'Date of birth', type: 'date', default: '1990-05-15', info: 'The day the person was born, as shown on a birth certificate or ID.' },
    { id: 'asOf', label: 'Age as of', type: 'date', default: 'today', help: 'Leave as today, or pick any date to see your age on that day.', info: 'The date on which to measure the age. Use a past or future date to check eligibility cut-offs.' },
  ],
  outputs: [
    { id: 'years', label: 'Age', format: 'integer', suffix: 'years', primary: true, info: 'The number of complete birthdays passed — the age people normally state.' },
    { id: 'exact', label: 'Exact age', format: 'text', info: 'Whole years, then whole months since the last birthday, then the remaining days.' },
    { id: 'totalMonths', label: 'Total months', format: 'integer', info: 'Complete calendar months lived: years × 12 plus the extra months.' },
    { id: 'totalWeeks', label: 'Total weeks', format: 'integer', info: 'Total days lived divided by seven, rounded down.' },
    { id: 'totalDays', label: 'Total days', format: 'integer', info: 'The exact number of days between the birth date and the "as of" date, counting every leap day.' },
    { id: 'nextBirthday', label: 'Next birthday', format: 'text', info: 'The date of the next birthday after the "as of" date and the age that will be reached.' },
    { id: 'daysToBirthday', label: 'Days until next birthday', format: 'integer', info: 'How many days remain until the next birthday, counted from the "as of" date.' },
  ],
  compute: (v) => {
    const birth = parseDate(v.birth);
    const asOf = parseDate(v.asOf);
    if (!birth || !asOf) return { years: null };
    if (asOf.getTime() < birth.getTime()) return { years: null, error: 'The "as of" date is before the date of birth.' };
    const { years, months, days } = ymdDiff(birth, asOf);
    const totalDays = Math.round((asOf.getTime() - birth.getTime()) / DAY_MS);
    // Next birthday: this year's anniversary, or next year's if it has passed (Feb 29 rolls to Mar 1 in common years).
    const anniv = (y: number) => new Date(Date.UTC(y, birth.getUTCMonth(), birth.getUTCDate()));
    let next = anniv(asOf.getUTCFullYear());
    if (next.getTime() <= asOf.getTime()) next = anniv(asOf.getUTCFullYear() + 1);
    const daysToBirthday = Math.round((next.getTime() - asOf.getTime()) / DAY_MS);
    const last = anniv(next.getUTCFullYear() - 1);
    const sinceLast = Math.round((asOf.getTime() - Math.max(last.getTime(), birth.getTime())) / DAY_MS);
    const isBirthday = birth.getUTCMonth() === asOf.getUTCMonth() && birth.getUTCDate() === asOf.getUTCDate() && totalDays > 0;
    const exactYears = years + (months + days / 30.44) / 12;
    return {
      years,
      exact: `${plural(years, 'year')}, ${plural(months, 'month')}, ${plural(days, 'day')}`,
      totalMonths: years * 12 + months,
      totalWeeks: Math.floor(totalDays / 7),
      totalDays,
      nextBirthday: `${formatDate(next)} (turning ${years + 1})`,
      daysToBirthday,
      chart: [
        {
          type: 'scale',
          title: 'Life stage',
          min: 0,
          max: Math.max(100, Math.ceil(exactYears / 10) * 10),
          value: exactYears,
          valueLabel: `${exactYears.toFixed(1)} years`,
          format: { suffix: 'yr' },
          bands: [
            { from: 0, to: 13, label: 'Child', tone: 'neutral' },
            { from: 13, to: 20, label: 'Teen', tone: 'ok' },
            { from: 20, to: 40, label: 'Young adult', tone: 'good' },
            { from: 40, to: 65, label: 'Middle age', tone: 'ok' },
            { from: 65, to: Math.max(100, Math.ceil(exactYears / 10) * 10), label: 'Senior', tone: 'neutral' },
          ],
        },
        {
          type: 'donut',
          title: 'Progress to the next birthday',
          format: { format: 'integer', suffix: 'days' },
          slices: [
            { label: 'Days since last birthday', value: sinceLast },
            { label: 'Days to go', value: daysToBirthday },
          ],
          centerValue: String(daysToBirthday),
          centerLabel: 'days to go',
        },
      ],
      note: isBirthday ? `Happy birthday — ${years} today!` : undefined,
      steps: [
        `Whole years: ${years}; then whole months: ${months}; remaining days: ${days}`,
        `Total days = ${totalDays} (${Math.floor(totalDays / 7)} weeks and ${totalDays % 7} days)`,
      ],
    };
  },
  content: {
    formula: ['Age = (as-of date) − (birth date), counted in whole years, then whole months, then days'],
    body: [
      'Age is counted the way people say it: first the number of complete birthdays you have passed, then the number of complete months since the last one, then the leftover days. When the day of the month has not been reached yet, one month is “borrowed” and replaced by the number of days in the previous calendar month, which is why the day count can be anything from 0 to 30.',
      'The totals use the actual calendar, including every leap day. Total days are the exact number of midnights between the two dates, and total weeks are those days divided by seven and rounded down.',
      'Change the “as of” date to find someone’s age on a past or future date — useful for eligibility cut-offs such as school entry, retirement plans, sports age groups or insurance quotes.',
    ],
    faq: [
      { q: 'How is a February 29 birthday handled?', a: 'In years without a leap day, the next birthday is shown as March 1, which is when the person has legally completed another year in most jurisdictions. Some people celebrate on February 28 instead.' },
      { q: 'Why does my age in days not equal years × 365?', a: 'Leap years add an extra day roughly every four years, so a 40-year-old has lived about 10 more days than 40 × 365.' },
      { q: 'Does the time of birth matter?', a: 'Not for this calculator. It works with whole calendar days, so you turn a year older at the start of your birthday.' },
    ],
  },
  related: ['date-difference', 'date-add', 'time-duration'],
  examples: [
    {
      values: { birth: '1990-05-15', asOf: '2025-11-12' },
      expect: { years: 35, exact: '35 years, 5 months, 28 days', totalMonths: 425, totalDays: 12965, totalWeeks: 1852, daysToBirthday: 184 },
    },
    { values: { birth: '2000-02-29', asOf: '2001-02-28' }, expect: { years: 0, exact: '0 years, 11 months, 30 days', daysToBirthday: 1 } },
  ],
});
