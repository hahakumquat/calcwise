import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';
import { SOURCES } from '../../lib/helpers/fire';

export default defineCalculator({
  slug: 'portfolio-income-per-day',
  title: 'Portfolio Income Per Day Calculator',
  seoTitle: 'Portfolio Income Per Day Calculator',
  metaDescription: 'See what your portfolio can pay you per year, month, day and hour at your withdrawal rate, and how many hours of work that income replaces.',
  updated: '2026-11-22',
  category: 'fire',
  description: 'Turn your portfolio into a daily and hourly paycheck, and see how many weeks of work it covers.',
  keywords: ['portfolio income per day', 'how much does my portfolio earn per day', 'passive income per day', 'investment income per hour', 'withdrawal per day', 'money working for me'],
  popular: false,
  inputs: [
    { id: 'portfolio', label: 'Portfolio', type: 'number', prefix: '$', default: 500000, min: 0, step: 10000, info: 'What you have invested today.' },
    { id: 'rate', label: 'Withdrawal rate', type: 'number', suffix: '%', default: 4, min: 0.1, max: 20, step: 0.1, info: 'The share of the portfolio you would spend each year. 4% is a rule of thumb, not a guarantee.' },
    { id: 'wage', label: 'Your hourly wage', type: 'number', prefix: '$', default: 30, min: 0, step: 1, info: 'Used to show how many hours of work a year of withdrawals equals.' },
    { id: 'hours', label: 'Work hours per week', type: 'number', default: 40, min: 1, max: 168, step: 1, info: 'Used to turn those hours into work weeks.' },
  ],
  outputs: [
    { id: 'day', label: 'Per day', format: 'currency', precision: 2, primary: true, info: 'Yearly withdrawal ÷ 365.' },
    { id: 'year', label: 'Per year', format: 'currency', precision: 0, info: 'Portfolio × withdrawal rate.' },
    { id: 'month', label: 'Per month', format: 'currency', precision: 2, info: 'Yearly withdrawal ÷ 12.' },
    { id: 'hour', label: 'Per hour', format: 'currency', precision: 2, info: 'Yearly withdrawal ÷ 8,760 hours in a year.' },
    { id: 'wageHours', label: 'Hours of work covered', format: 'number', precision: 1, info: 'Yearly withdrawal ÷ your hourly wage.' },
    { id: 'weeks', label: 'Work weeks covered', format: 'number', precision: 1, info: 'Hours of work covered ÷ work hours per week.' },
  ],
  compute: (v) => {
    const p = num(v.portfolio);
    const w = num(v.rate);
    const wage = num(v.wage);
    const hrs = num(v.hours);
    if (p === null || w === null) return { day: null };
    if (p < 0) return { day: null, error: 'Portfolio cannot be negative.' };
    if (w <= 0) return { day: null, error: 'Enter a withdrawal rate above 0%.' };
    const year = (p * w) / 100;
    const day = year / 365;
    const hour = year / 8760;
    const month = year / 12;
    const hasWage = wage !== null && wage > 0;
    const wageHours = hasWage ? year / (wage as number) : null;
    const weeks = wageHours !== null && hrs !== null && hrs > 0 ? wageHours / hrs : null;

    const steps = [
      `Per year = ${money(p, 0)} × ${w}% = ${money(year, 0)}`,
      `Per month = ${money(year, 0)} ÷ 12 = ${money(month, 2)}`,
      `Per day = ${money(year, 0)} ÷ 365 = ${money(day, 2)}`,
      `Per hour = ${money(year, 0)} ÷ 8,760 = ${money(hour, 2)}`,
    ];
    if (wageHours !== null) {
      steps.push(`At ${money(wage as number, 2)} an hour, ${money(year, 0)} is ${wageHours.toFixed(1)} hours of work${weeks !== null ? `, or ${weeks.toFixed(1)} work weeks of ${hrs} hours` : ''}`);
    }

    return {
      day,
      year,
      month,
      hour,
      wageHours,
      weeks,
      tone: 'ok',
      badge: `${money(day, 2)} a day`,
      chart: {
        type: 'bar',
        title: 'What your portfolio pays you',
        categories: ['Per hour', 'Per day', 'Per month'],
        series: [{ name: 'Withdrawal', values: [Math.round(hour * 100) / 100, Math.round(day * 100) / 100, Math.round(month * 100) / 100] }],
        format: CURRENCY,
        highlight: 1,
      },
      steps,
      note: `At a ${w}% withdrawal rate, ${money(p, 0)} supports about ${money(day, 2)} a day. This is a withdrawal, not yield: you spend some principal over time, and markets move.`,
    };
  },
  content: {
    formula: [
      'Per year = portfolio × withdrawal rate',
      'Per month = per year ÷ 12; per day = per year ÷ 365; per hour = per year ÷ 8,760',
      'Hours of work covered = per year ÷ hourly wage',
    ],
    body: [
      'This calculator turns a portfolio into a paycheck you can picture: what it could pay you each year, month, day and hour at a withdrawal rate you choose. It also compares that income to your wage, so you can see how many hours of work it replaces.',
      'At $500,000 and a 4% withdrawal rate the portfolio supports $20,000 a year, $1,666.67 a month, $54.79 a day and $2.28 an hour. At $30 an hour, $20,000 is about 666.7 hours of work, or 16.7 work weeks of 40 hours.',
    ],
    sections: [
      {
        heading: 'A withdrawal is not the same as yield',
        paragraphs: [
          'The figure here is what you could spend, not what the portfolio earns in dividends or interest. A withdrawal can include selling shares, so it draws on principal in lean years. The 4% rate is a rule of thumb from past US data, not a guarantee. Use the safe withdrawal rate calculator to test other rates.',
        ],
      },
    ],
    faq: [
      { q: 'How much does a $500,000 portfolio pay per day?', a: 'At a 4% withdrawal rate it supports $20,000 a year, which is $54.79 a day (20,000 ÷ 365).' },
      { q: 'Why divide the hourly figure by 8,760?', a: 'A year has 365 × 24 = 8,760 hours. The portfolio pays around the clock, so the hourly figure counts every hour, not only working hours.' },
      { q: 'Is this passive income?', a: 'It is a sustainable spending estimate. It may come from dividends, interest or selling shares, and it is not guaranteed.' },
      { q: 'What does hours of work covered mean?', a: 'The yearly withdrawal divided by your hourly wage: how many hours you would need to work to earn the same amount. $20,000 at $30 an hour is 666.7 hours.' },
    ],
    sources: [SOURCES.bengen, SOURCES.trinity],
  },
  related: ['safe-withdrawal-rate', 'fire-number', 'one-more-year', 'years-to-fi'],
  examples: [
    // 500000*4% = 20000; /365 = 54.7945; /12 = 1666.6667; /8760 = 2.28311; /30 = 666.6667; /40 = 16.6667
    { values: { portfolio: 500000, rate: 4, wage: 30, hours: 40 }, expect: { year: 20000, month: 1666.6667, day: 54.7945, hour: 2.2831, wageHours: 666.6667, weeks: 16.6667 }, tolerance: 0.0001 },
  ],
});
