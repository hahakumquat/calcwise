import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'raise-calculator',
  title: 'Raise Calculator',
  category: 'finance',
  description: 'See what a pay raise is really worth: new salary, extra per month, week and hour, the raise after inflation, and a rough after-tax figure.',
  keywords: ['raise calculator', 'pay raise calculator', 'salary increase calculator', 'how much is a 5% raise', 'real raise after inflation', 'raise per month'],
  updated: '2026-11-16',
  inputs: [
    { id: 'salary', label: 'Current yearly salary', type: 'number', prefix: '$', default: 60000, min: 0, step: 500, info: 'Your pay per year before tax, today.' },
    { id: 'raise', label: 'Raise', type: 'number', suffix: '%', default: 5, min: -100, max: 500, step: 0.1, info: 'The percentage increase on your current salary.' },
    { id: 'hours', label: 'Hours per week', type: 'number', default: 40, min: 1, max: 100, step: 1, info: 'Used for the hourly figures, assuming 52 weeks a year.' },
    { id: 'inflation', label: 'Yearly inflation', type: 'number', suffix: '%', default: 3, min: -10, max: 100, step: 0.1, info: 'Optional. Set to 0 to ignore it. Used to work out what the raise is worth in buying power.' },
    { id: 'tax', label: 'Your tax rate on extra pay', type: 'number', suffix: '%', default: 25, min: 0, max: 80, step: 0.5, info: 'An estimate: your marginal income tax rate plus payroll taxes. Your own rate may differ. Set 0 to see the pre-tax figure.' },
  ],
  outputs: [
    { id: 'newSalary', label: 'New yearly salary', format: 'currency', primary: true, info: 'Current salary plus the raise.' },
    { id: 'raiseYear', label: 'Extra per year (before tax)', format: 'currency', info: 'Salary × raise %.' },
    { id: 'raiseMonth', label: 'Extra per month', format: 'currency', info: 'The yearly raise ÷ 12.' },
    { id: 'raiseWeek', label: 'Extra per week', format: 'currency', info: 'The yearly raise ÷ 52.' },
    { id: 'oldHourly', label: 'Hourly pay now', format: 'currency', info: 'Salary ÷ (hours per week × 52).' },
    { id: 'newHourly', label: 'Hourly pay after the raise', format: 'currency', info: 'New salary ÷ (hours per week × 52).' },
    { id: 'real', label: 'Raise after inflation', format: 'percent', info: '(1 + raise) ÷ (1 + inflation) − 1. Negative means you can buy less than before.' },
    { id: 'afterTax', label: 'Extra per year after tax (estimate)', format: 'currency', info: 'Raise × (1 − your tax rate on extra pay).' },
  ],
  compute: (v) => {
    const salary = num(v.salary);
    const raise = num(v.raise);
    const hours = num(v.hours);
    const infl = num(v.inflation);
    const tax = num(v.tax);
    if (salary === null || raise === null || hours === null || infl === null || tax === null || salary < 0 || hours <= 0 || raise <= -100 || infl <= -100) return { newSalary: null };
    const r = raise / 100;
    const raiseYear = salary * r;
    const newSalary = salary + raiseYear;
    const real = (1 + r) / (1 + infl / 100) - 1;
    const afterTax = raiseYear * (1 - tax / 100);
    const hourYear = hours * 52;
    const verdict =
      real > 0
        ? `After ${infl}% inflation this raise is worth about ${fmt(real * 100, 2)}% more buying power.`
        : real < 0
          ? `After ${infl}% inflation this raise buys about ${fmt(Math.abs(real) * 100, 2)}% less than before.`
          : 'After inflation this raise leaves your buying power unchanged.';
    return {
      newSalary,
      raiseYear,
      raiseMonth: raiseYear / 12,
      raiseWeek: raiseYear / 52,
      oldHourly: salary / hourYear,
      newHourly: newSalary / hourYear,
      real,
      afterTax,
      note: `$${fmt(salary)} plus ${raise}% is $${fmt(newSalary)}, which is $${fmt(raiseYear / 12, 2)} more each month before tax. ${verdict} Tax is a rough estimate.`,
      chart: {
        type: 'bar',
        title: 'Yearly pay',
        categories: ['Now', 'After raise', 'After raise, in today’s money'],
        series: [{ name: 'Yearly salary', values: [salary, newSalary, newSalary / (1 + infl / 100)] }],
        format: { format: 'currency' },
      },
      steps: [
        `Raise = $${fmt(salary, 2)} × ${raise}% = $${fmt(raiseYear, 2)}`,
        `Hourly = salary ÷ (${hours} × 52) = $${fmt(salary / hourYear, 2)} → $${fmt(newSalary / hourYear, 2)}`,
        `Real raise = ${fmt(1 + r, 4)} ÷ ${fmt(1 + infl / 100, 4)} − 1 = ${fmt(real * 100, 2)}%`,
      ],
    };
  },
  content: {
    formula: ['New salary = salary × (1 + raise %)', 'Hourly = salary ÷ (hours per week × 52)', 'Real raise = (1 + raise) ÷ (1 + inflation) − 1', 'After-tax raise = raise × (1 − tax rate)'],
    body: [
      'A raise sounds simple, but the useful question is what it changes in your life. This calculator turns a percentage into dollars per year, month, week and hour, then shows the same raise after inflation, which is what it does to your buying power.',
      'The after-tax figure uses a single rate that you choose. Your extra pay is taxed at your marginal rate, plus payroll taxes such as Social Security and Medicare, so a rate near 25–30% is a common starting guess for many US workers. It is an estimate, so use your own numbers for a decision.',
      'If you are negotiating, a useful habit is to compare the raise to inflation first: a 3% raise in a year of 3% inflation is a pay freeze in real terms. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much is a 5% raise on $60,000?', a: '$60,000 × 5% = $3,000 more a year, so a new salary of $63,000. That is $250 a month and about $57.69 a week before tax.' },
      { q: 'What is that raise worth after inflation?', a: 'With 3.3% inflation, 1.05 ÷ 1.033 − 1 is about 1.65%. The raise is real, but smaller than the headline 5%.' },
      { q: 'How much of a raise do I keep after tax?', a: 'It depends on your tax rate. At a combined 29.65% (22% federal plus 7.65% payroll tax), $3,000 becomes $2,110.50. State tax would reduce it further.' },
    ],
    sources: [{ label: 'US Bureau of Labor Statistics: CPI inflation calculator', url: 'https://www.bls.gov/data/inflation_calculator.htm' }],
  },
  related: ['take-home-pay', 'inflation', 'salary-to-hourly', 'income-tax', 'bonus-vs-raise', 'salary-growth-projection'],
  examples: [
    // 60,000 × 5% = 3,000; 63,000; 250/mo; 57.6923/wk; 60,000/2080 = 28.8462; 63,000/2080 = 30.2885.
    // real = 1.05/1.033 − 1 = 0.016457; after tax 3,000 × 0.7035 = 2,110.5.
    { values: { salary: 60000, raise: 5, hours: 40, inflation: 3.3, tax: 29.65 }, expect: { newSalary: 63000, raiseYear: 3000, raiseMonth: 250, raiseWeek: 3000 / 52, oldHourly: 60000 / 2080, newHourly: 63000 / 2080, real: 1.05 / 1.033 - 1, afterTax: 2110.5 }, tolerance: 1e-6 },
  ],
});
