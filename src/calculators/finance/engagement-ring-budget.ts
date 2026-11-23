import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'engagement-ring-budget',
  title: 'Engagement Ring Budget Calculator',
  seoTitle: 'Engagement Ring Budget Calculator',
  metaDescription: 'See what an engagement ring costs in months of income and hours of work, and how long it takes to save for it at your monthly savings rate.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Turn a ring price into months of income, hours of work and months of saving, so the number feels real before you buy.',
  keywords: ['engagement ring budget calculator', 'how much to spend on engagement ring', 'ring cost months of salary', 'engagement ring savings plan', 'engagement ring affordability'],
  popular: false,
  inputs: [
    { id: 'cost', label: 'Ring cost', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, info: 'The price you are considering, paid in cash.' },
    { id: 'income', label: 'Gross annual income', type: 'number', prefix: '$', default: 72000, min: 1, step: 1000, info: 'Your yearly pay before tax.' },
    { id: 'saved', label: 'Already saved for it', type: 'number', prefix: '$', default: 1000, min: 0, step: 100, info: 'Money you have already set aside for the ring.' },
    { id: 'monthly', label: 'Amount you can save each month', type: 'number', prefix: '$', default: 400, min: 0, step: 50, info: 'What you can put toward it every month.' },
  ],
  outputs: [
    { id: 'months', label: 'Months of gross income', format: 'number', precision: 2, primary: true, info: 'Ring cost ÷ (annual income ÷ 12).' },
    { id: 'pct', label: 'Share of annual income', format: 'percent', precision: 2, info: 'Ring cost ÷ annual income.' },
    { id: 'hours', label: 'Hours of work', format: 'number', precision: 1, info: 'Ring cost ÷ (annual income ÷ 2,080 working hours).' },
    { id: 'saveMonths', label: 'Months to save', format: 'number', precision: 0, info: 'Rounded up: (cost − saved) ÷ monthly savings. 0 if already covered.' },
  ],
  compute: (v) => {
    const cost = num(v.cost), income = num(v.income), saved = num(v.saved), monthly = num(v.monthly);
    if (cost === null || income === null || saved === null || monthly === null) return { months: null };
    if (cost < 0 || saved < 0 || monthly < 0) return { months: null, error: 'Amounts cannot be negative.' };
    if (income <= 0) return { months: null, error: 'Enter an annual income above zero.' };
    const monthlyIncome = income / 12;
    const hourly = income / 2080;
    const months = cost / monthlyIncome;
    const pct = cost / income;
    const hours = cost / hourly;
    const gap = Math.max(0, cost - saved);
    let saveMonths: number;
    let saveNote: string;
    if (gap === 0) { saveMonths = 0; saveNote = 'Already saved enough.'; }
    else if (monthly === 0) { return { months, pct, hours, saveMonths: null, error: 'Enter a monthly saving amount above zero to see how long it takes.' }; }
    else { saveMonths = Math.ceil(gap / monthly - 1e-9); saveNote = `${money(gap, 0)} left ÷ ${money(monthly, 0)} a month = ${saveMonths} month${saveMonths === 1 ? '' : 's'} (rounded up)`; }
    return {
      months,
      pct,
      hours,
      saveMonths,
      tone: months <= 3 ? 'good' : 'warn',
      badge: `${Math.round(hours)} hours of work`,
      chart: {
        type: 'bar',
        title: 'Your ring vs 1, 2 and 3 months of income',
        categories: ['Your ring', '1 month', '2 months', '3 months'],
        series: [{ name: 'Amount', values: [cost, +monthlyIncome.toFixed(2), +(monthlyIncome * 2).toFixed(2), +(monthlyIncome * 3).toFixed(2)] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Monthly income = ${money(income, 0)} ÷ 12 = ${money(monthlyIncome, 2)}`,
        `Months of income = ${money(cost, 0)} ÷ ${money(monthlyIncome, 2)} = ${months.toFixed(2)}`,
        `Hours of work = ${money(cost, 0)} ÷ ${money(hourly, 2)} an hour = ${hours.toFixed(1)}`,
        saveNote,
      ],
      note: 'Pre-tax income, so real take-home hours are higher. "Three months of salary" is a popular rule of thumb, not a standard; spend what fits your own budget. No financing is assumed.',
    };
  },
  content: {
    formula: [
      'Months of income = ring cost ÷ (annual income ÷ 12)',
      'Hours of work = ring cost ÷ (annual income ÷ 2,080)',
      'Months to save = (ring cost − saved) ÷ monthly savings, rounded up',
    ],
    body: [
      'A ring price is easier to judge when it is translated into your own time and money. This calculator shows the cost as months of income, hours worked and months of saving.',
      'A $5,000 ring on a $72,000 income is 0.83 months of gross pay, 6.94% of the year, and about 144 hours of work at $34.62 an hour. With $1,000 saved and $400 a month going in, the remaining $4,000 takes 10 months.',
    ],
    sections: [
      {
        heading: 'About the "three months of salary" rule',
        paragraphs: [
          'You may have heard that a ring should cost one to three months of salary. It is a popular guideline, not a rule or a standard, and the chart shows those amounts only for comparison. Your savings, debts and goals matter more than any formula. These figures use gross income; for what you actually keep, see the take-home pay calculator.',
        ],
      },
    ],
    faq: [
      { q: 'How much should I spend on an engagement ring?', a: 'There is no standard. A common guideline is one to three months of salary, but it is only a rule of thumb. Pick a number you can pay without debt. At $72,000 a year, one month is $6,000.' },
      { q: 'How many hours of work is a $5,000 ring?', a: 'At $72,000 a year, which is $34.62 an hour over 2,080 hours, a $5,000 ring is about 144 hours of pre-tax work.' },
      { q: 'How long will it take to save?', a: 'Divide what is left to save by your monthly amount and round up. With $4,000 left and $400 a month, that is 10 months.' },
      { q: 'Does this include financing?', a: 'No. It assumes you pay in cash. Interest on a loan would raise the real cost.' },
    ],
    sources: [{ label: 'Simple arithmetic on your own figures; the "months of salary" idea is a popular guideline, not a standard' }],
  },
  related: ['wedding-budget', 'hours-of-work-cost', 'savings-goal', 'take-home-pay', 'salary-to-hourly'],
  examples: [
    // monthly 6000; months 5000/6000=0.83333; pct 0.069444; hourly 34.61538; hours 144.444; gap 4000/400=10
    { values: { cost: 5000, income: 72000, saved: 1000, monthly: 400 }, expect: { months: 0.833333, pct: 0.0694444, hours: 144.4444, saveMonths: 10 }, tolerance: 1e-4 },
    // saved >= cost -> 0 months; 12000/ (60000/12=5000) = 2.4; hours 12000/28.846=416
    { values: { cost: 12000, income: 60000, saved: 15000, monthly: 0 }, expect: { months: 2.4, pct: 0.2, hours: 416, saveMonths: 0 }, tolerance: 1e-4 },
  ],
});
