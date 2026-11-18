import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'prorated-rent',
  title: 'Prorated Rent Calculator',
  category: 'everyday',
  description: 'Work out partial-month rent when you move in or out mid-month. Daily rate and prorated amount by days in the month or by a 365-day year.',
  keywords: ['prorated rent calculator', 'partial month rent', 'how to prorate rent', 'move in mid month rent', 'daily rent rate'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'rent', label: 'Monthly rent', type: 'number', prefix: '$', default: 1500, min: 0, step: 25, info: 'The full rent for one month.' },
    { id: 'days', label: 'Days in the month', type: 'number', default: 30, min: 28, max: 31, step: 1, info: '28 to 31, depending on the month.' },
    { id: 'start', label: 'First day you live there', type: 'number', default: 12, min: 1, max: 31, step: 1, info: 'Day of the month you move in. The move-in day counts as a full day.' },
  ],
  outputs: [
    { id: 'prorated', label: 'Prorated rent', format: 'currency', precision: 2, primary: true, info: 'Daily rate × days you stay in the month.' },
    { id: 'daily', label: 'Daily rate', format: 'currency', precision: 2, info: 'Monthly rent ÷ days in the month.' },
    { id: 'stay', label: 'Days charged', format: 'number', precision: 0, info: 'Days from your first day to the end of the month, inclusive.' },
    { id: 'yearly', label: 'Prorated (365-day method)', format: 'currency', precision: 2, info: 'Some leases use rent × 12 ÷ 365 as the daily rate.' },
  ],
  compute: (v) => {
    const rent = num(v.rent);
    const days = num(v.days);
    const start = num(v.start);
    if (rent === null || days === null || start === null) return { prorated: null };
    if (rent < 0 || !Number.isInteger(days) || !Number.isInteger(start) || days < 28 || days > 31 || start < 1 || start > days) return { prorated: null };
    const daily = rent / days;
    const stay = days - start + 1;
    const prorated = daily * stay;
    const yearly = ((rent * 12) / 365) * stay;
    return {
      prorated,
      daily,
      stay,
      yearly,
      chart: {
        type: 'bar',
        title: 'Rent: full month vs prorated',
        categories: ['Full month', 'Prorated', 'Prorated (365-day)'],
        series: [{ name: 'Rent', values: [rent, prorated, yearly] }],
        format: { format: 'currency' },
      },
      steps: [
        `Daily rate = $${fmt(rent)} ÷ ${days} days = $${fmt(daily)}`,
        `Days charged = ${days} − ${start} + 1 = ${stay}`,
        `Prorated rent = $${fmt(daily)} × ${stay} = $${fmt(prorated)}`,
      ],
      note: `Moving in on day ${start} of a ${days}-day month means ${stay} days of rent: $${fmt(prorated)} instead of the full $${fmt(rent)}.`,
    };
  },
  content: {
    formula: ['Daily rate = monthly rent ÷ days in the month', 'Prorated rent = daily rate × days you occupy the unit (move-in day included)'],
    body: [
      'Prorated rent is rent for part of a month. It comes up when a lease starts or ends on a day other than the first.',
      'The most common method divides the monthly rent by the days in that month. Rent of $1,500 in a 30-day month is $50 a day. Moving in on the 12th gives 19 days (the 12th through the 30th), so $950.',
      'Some landlords use a 365-day year instead: $1,500 × 12 ÷ 365 is about $49.32 a day, which gives $936.99 for the same 19 days. The difference is small, but check which method your lease uses.',
      'This is a general guide, not legal advice. Your lease and local rules decide how partial months are charged, and whether the move-in day is counted.',
    ],
    faq: [
      { q: 'How do you prorate rent?', a: 'Divide the monthly rent by the number of days in the month, then multiply by the days you live there. $1,500 ÷ 30 × 19 days = $950.' },
      { q: 'Does the move-in day count?', a: 'This calculator counts it as a full day. If your lease counts differently, enter the next day as your first day.' },
      { q: 'Should I use 30 days or the real month length?', a: 'Use whatever the lease says. Many use the actual days in the month, others a flat 30 or a 365-day year.' },
      { q: 'How do I prorate rent for moving out mid-month?', a: 'Count the days you stay, from day 1 to your last day, and multiply by the daily rate. For example, leaving after day 12 of a 30-day month at $1,500 is 12 × $50 = $600.' },
    ],
    sources: [
      { label: 'Proration (Investopedia)', url: 'https://www.investopedia.com/terms/p/proration.asp' },
    ],
  },
  related: ['rent-split', 'rent-affordability', 'date-difference', 'daily-spending-allowance', 'bill-splitter'],
  examples: [
    { values: { rent: 1500, days: 30, start: 12 }, expect: { prorated: 950, daily: 50, stay: 19, yearly: 936.9863 }, tolerance: 1e-3 },
    { values: { rent: 1240, days: 31, start: 1 }, expect: { prorated: 1240, daily: 40, stay: 31 }, tolerance: 1e-6 },
  ],
});
