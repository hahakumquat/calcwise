import { defineCalculator, type ComputeResult } from '../../lib/types';
import { num, parseDate, DAY_MS } from '../../lib/math';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const iso = (t: number) => new Date(t).toISOString().slice(0, 10);

export default defineCalculator({
  slug: 'paychecks-per-year',
  title: 'Paychecks per Year: 26 or 27 Pay Periods',
  category: 'finance',
  description: 'How many paychecks do you get in a year, and which months have three (biweekly) or five (weekly)? Enter one pay date and the year to see every pay date.',
  keywords: ['how many paychecks in 2027', '27 pay periods', 'biweekly paychecks per year', 'months with 3 paychecks', 'paychecks per year calculator', 'extra paycheck months'],
  updated: '2026-11-20',
  inputs: [
    {
      id: 'freq', label: 'Pay frequency', type: 'select', default: 'biweekly',
      options: [
        { value: 'weekly', label: 'Weekly' },
        { value: 'biweekly', label: 'Every two weeks (biweekly)' },
        { value: 'semimonthly', label: 'Twice a month (semi-monthly)' },
        { value: 'monthly', label: 'Monthly' },
      ],
      info: 'How often you are paid.',
    },
    { id: 'anchor', label: 'Any pay date', type: 'date', default: '2027-01-01', showWhen: { input: 'freq', is: ['weekly', 'biweekly'] }, info: 'Any date you are paid, in this year or another. Every other pay date is worked out from it.' },
    { id: 'year', label: 'Year', type: 'number', default: 2027, min: 1970, max: 2200, step: 1, info: 'The calendar year to count pay dates in.' },
    { id: 'amount', label: 'Pay per paycheck (optional)', type: 'number', prefix: '$', optional: true, min: 0, step: 1, info: 'Fill in to see what the year adds up to. Leave blank to skip.' },
  ],
  outputs: [
    { id: 'count', label: 'Paychecks in the year', format: 'integer', primary: true, info: 'The number of pay dates that fall in the chosen calendar year.' },
    { id: 'extra', label: 'Months with extra checks', format: 'text', info: 'Months with 3 paychecks (biweekly) or 5 (weekly). Semi-monthly and monthly pay never have these.' },
    { id: 'first', label: 'First pay date', format: 'text', showWhen: { input: 'freq', is: ['weekly', 'biweekly'] }, info: 'The first pay date in the year.' },
    { id: 'last', label: 'Last pay date', format: 'text', showWhen: { input: 'freq', is: ['weekly', 'biweekly'] }, info: 'The last pay date in the year.' },
    { id: 'total', label: 'Pay for the year', format: 'currency', info: 'Paychecks × pay per paycheck. Shown only if you enter an amount.' },
  ],
  compute: (v) => {
    const freq = String(v.freq || 'biweekly');
    const y = num(v.year);
    if (y === null || !Number.isInteger(y) || y < 1970 || y > 2200) return { count: null, error: 'Enter a year between 1970 and 2200.' };
    const amount = num(v.amount);
    const per = new Array(12).fill(0);
    let first: string | null = null, last: string | null = null;
    let usual = 2;
    if (freq === 'semimonthly') per.fill(2);
    else if (freq === 'monthly') { per.fill(1); usual = 1; }
    else {
      const a = parseDate(v.anchor);
      if (!a) return { count: null, note: 'Enter a pay date.' };
      const step = (freq === 'weekly' ? 7 : 14) * DAY_MS;
      usual = freq === 'weekly' ? 4 : 2;
      const s = Date.UTC(y, 0, 1), e = Date.UTC(y + 1, 0, 1);
      let t = a.getTime();
      t += Math.ceil((s - t) / step) * step;
      for (; t < e; t += step) {
        per[new Date(t).getUTCMonth()]++;
        if (!first) first = iso(t);
        last = iso(t);
      }
    }
    const count = per.reduce((p, c) => p + c, 0);
    const extraMonths = MONTHS.filter((_, i) => per[i] > usual);
    const base = freq === 'weekly' ? 52 : freq === 'biweekly' ? 26 : freq === 'semimonthly' ? 24 : 12;
    const out: ComputeResult = {
      count,
      extra: extraMonths.length ? extraMonths.join(', ') : 'None',
      first: first ?? '—',
      last: last ?? '—',
      tone: count > base ? 'good' : 'ok',
      badge: count > base ? `${count} paychecks: ${count - base} extra this year` : `${count} paychecks`,
      chart: {
        type: 'bar',
        title: `Paychecks per month in ${y}`,
        categories: MONTHS,
        series: [{ name: 'Paychecks', values: per }],
        format: { format: 'integer' },
      },
      steps: [
        freq === 'weekly' || freq === 'biweekly'
          ? `Pay dates repeat every ${freq === 'weekly' ? 7 : 14} days from the date you entered; ${count} fall in ${y} (${first} to ${last})`
          : `${freq === 'semimonthly' ? 'Twice' : 'Once'} a month for 12 months = ${count}`,
        `A normal year has ${base} paychecks, so this year has ${count - base >= 0 ? count - base : 0} extra`,
      ],
      note: extraMonths.length
        ? `Budget the extra check as a bonus month: ${extraMonths.join(', ')} ${extraMonths.length === 1 ? 'has' : 'have'} more paychecks than usual.`
        : 'Every month has the usual number of paychecks.',
    };
    if (amount !== null) out.total = amount * count;
    return out;
  },
  content: {
    formula: [
      'Pay dates = the date you enter, plus or minus 7 (weekly) or 14 (biweekly) days, repeated',
      'Paychecks = pay dates that land inside the calendar year',
      'Semi-monthly = 24 per year, monthly = 12 per year',
    ],
    body: [
      'A weekly pay schedule has 52 or 53 paychecks a year, and a biweekly schedule has 26 or 27. A year has 52 weeks and one or two extra days, so every few years one more pay date squeezes in. That is a 27-pay year for biweekly workers.',
      'Enter any one pay date and the year. The calculator steps forward and back in 7 or 14 day jumps and counts every pay date inside that year. It also lists months with three paychecks (biweekly) or five (weekly), which are the months worth treating as a bonus rather than spending on everyday bills.',
      'Semi-monthly pay (for example the 15th and the last day) is always 24 paychecks and monthly pay is always 12, so neither has extra-check months.',
      'This counts pay dates only. It does not adjust for paydays that move because of weekends or bank holidays, and it does not work out tax or deductions. For take-home pay, use the take-home pay calculator.',
    ],
    faq: [
      { q: 'How many biweekly paychecks are there in 2027?', a: 'It depends on your first pay date. If you are paid on Friday 2027-01-01, you get 27 paychecks, ending on 2027-12-31. If you are paid on Friday 2027-01-08, you get 26.' },
      { q: 'Which months have three paychecks?', a: 'For biweekly pay starting 2027-01-01, those months are January, July and December. Starting 2027-01-08, they are April and October.' },
      { q: 'How many weekly paychecks in 2027?', a: 'Usually 52. A weekly schedule paid on Fridays gets 53, because 2027 starts and ends on a Friday.' },
      { q: 'Do semi-monthly or monthly workers get extra paychecks?', a: 'No. Semi-monthly is always 24 and monthly is always 12.' },
    ],
    sources: [
      { label: 'Pay period (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Pay_period' },
    ],
  },
  related: ['take-home-pay', 'salary-to-hourly', 'daily-spending-allowance', 'budget-50-30-20', 'ytd-income-projection', 'prorated-salary'],
  examples: [
    // Verified by an independent day-by-day count: Fri 2027-01-01 + 14k, k = 0..26, last 2027-12-31
    { values: { freq: 'biweekly', anchor: '2027-01-01', year: 2027, amount: 1000 }, expect: { count: 27, total: 27000 }, tolerance: 1e-9 },
    // Fri 2027-01-08 + 14k: 26 paychecks, last 2027-12-24
    { values: { freq: 'biweekly', anchor: '2027-01-08', year: 2027 }, expect: { count: 26 }, tolerance: 1e-9 },
    // Anchor in the previous year still finds the pattern: 2026-12-31 + 14 = 2027-01-14 ... 26 paychecks
    { values: { freq: 'biweekly', anchor: '2026-12-31', year: 2027 }, expect: { count: 26 }, tolerance: 1e-9 },
    // Every Friday in 2027: Jan 1 .. Dec 31 = 53; Wednesday: 52
    { values: { freq: 'weekly', anchor: '2027-01-01', year: 2027 }, expect: { count: 53 }, tolerance: 1e-9 },
    { values: { freq: 'weekly', anchor: '2027-01-06', year: 2027 }, expect: { count: 52 }, tolerance: 1e-9 },
    { values: { freq: 'semimonthly', year: 2027 }, expect: { count: 24 }, tolerance: 1e-9 },
    { values: { freq: 'monthly', year: 2027 }, expect: { count: 12 }, tolerance: 1e-9 },
  ],
});
