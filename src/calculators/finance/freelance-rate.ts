import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'freelance-rate',
  title: 'Freelance Hourly Rate Calculator',
  category: 'finance',
  description: 'Work out the hourly rate you need to charge as a freelancer to hit your take-home goal after tax, business costs, time off and unbilled hours.',
  keywords: ['freelance hourly rate calculator', 'how much should i charge per hour', 'freelancer rate calculator', 'contractor hourly rate', 'self employed hourly rate'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'income', label: 'Take-home goal per year', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, info: 'What you want to keep after tax and business costs.' },
    { id: 'expenses', label: 'Business costs per year', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, info: 'Software, equipment, insurance, coworking and similar.' },
    { id: 'tax', label: 'Tax reserve', type: 'number', default: 25, min: 0, max: 60, step: 0.5, suffix: '% of profit', info: 'Share of profit you set aside for income and self-employment tax. Your rate may differ.' },
    { id: 'hours', label: 'Billable hours per week', type: 'number', default: 25, min: 1, max: 80, step: 1, info: 'Only hours you can invoice. Admin, sales and email do not count.' },
    { id: 'weeks', label: 'Weeks off per year', type: 'number', default: 6, min: 0, max: 51, step: 1, info: 'Holidays, sick days and slow weeks.' },
  ],
  outputs: [
    { id: 'rate', label: 'Hourly rate to charge', format: 'currency', precision: 2, primary: true, info: 'Total revenue needed ÷ billable hours.' },
    { id: 'revenue', label: 'Revenue needed per year', format: 'currency', precision: 0, info: 'Take-home, tax reserve and business costs added together.' },
    { id: 'billable', label: 'Billable hours per year', format: 'number', precision: 0, info: 'Billable hours per week times the weeks you work.' },
    { id: 'day', label: 'Day rate (8 hours)', format: 'currency', precision: 0, info: 'Hourly rate times 8, for quoting by the day.' },
  ],
  compute: (v) => {
    const income = num(v.income);
    const exp = num(v.expenses);
    const tax = num(v.tax);
    const h = num(v.hours);
    const w = num(v.weeks);
    if (income === null || exp === null || tax === null || h === null || w === null) return { rate: null };
    if (income < 0 || exp < 0 || tax < 0 || tax >= 100 || h <= 0 || w < 0 || w >= 52) return { rate: null };
    const profit = income / (1 - tax / 100);
    const revenue = profit + exp;
    const billable = h * (52 - w);
    const rate = revenue / billable;
    return {
      rate,
      revenue,
      billable,
      day: rate * 8,
      chart: {
        type: 'donut',
        title: 'Where each year of revenue goes',
        slices: [
          { label: 'Take-home', value: income },
          { label: 'Tax reserve', value: profit - income },
          { label: 'Business costs', value: exp },
        ],
        format: { format: 'currency' },
        centerLabel: 'Revenue',
        centerValue: `$${fmt(revenue, 0)}`,
      },
      steps: [
        `Profit before tax = $${fmt(income, 0)} ÷ (1 − ${fmt(tax)}%) = $${fmt(profit, 0)}`,
        `Revenue = $${fmt(profit, 0)} + $${fmt(exp, 0)} costs = $${fmt(revenue, 0)}`,
        `Billable hours = ${fmt(h, 1)} × ${fmt(52 - w, 0)} weeks = ${fmt(billable, 0)}`,
        `Rate = $${fmt(revenue, 0)} ÷ ${fmt(billable, 0)} = $${fmt(rate, 2)} an hour`,
      ],
      note: `Charge about $${fmt(rate, 2)} an hour to keep $${fmt(income, 0)} a year after tax and costs.`,
    };
  },
  content: {
    formula: [
      'Profit before tax = take-home goal ÷ (1 − tax reserve)',
      'Revenue needed = profit before tax + business costs',
      'Hourly rate = revenue needed ÷ (billable hours per week × weeks worked)',
    ],
    body: [
      'A salary of $30 an hour is not the same as charging $30 an hour. Freelancers pay their own tax and costs, take unpaid time off and spend part of every week on work nobody pays for. This calculator starts from what you want to keep and works backwards to the rate you need.',
      'Example: you want $60,000 take-home, expect $5,000 of business costs, reserve 25% for tax, bill 25 hours a week and take 6 weeks off. Profit before tax is $60,000 ÷ 0.75 = $80,000. Add $5,000 of costs for $85,000 revenue. You bill 25 × 46 = 1,150 hours, so the rate is about $73.91 an hour.',
      'Billable hours are the biggest lever. Most freelancers cannot invoice a full 40 hours, because finding clients, admin and revisions eat the rest. Be honest here, and the number will hold up in real life.',
      'The tax reserve is a planning guess, not tax advice. Your real rate depends on where you live and how you are registered.',
    ],
    faq: [
      { q: 'How do I calculate my freelance hourly rate?', a: 'Divide the revenue you need by the hours you can bill. Revenue is your take-home goal grossed up for tax, plus business costs. $85,000 across 1,150 billable hours is about $73.91 an hour.' },
      { q: 'Why are billable hours lower than my working hours?', a: 'Admin, marketing, quotes and email are unpaid. Many freelancers bill well under 40 hours a week, so entering 25 or 30 is more realistic.' },
      { q: 'What tax rate should I use?', a: 'Use the share of profit you expect to pay in income and self-employment tax. 25% is only a placeholder. Check with a tax professional for your situation.' },
      { q: 'Does this include benefits?', a: 'Not separately. Add health insurance, retirement savings and similar to your business costs or take-home goal.' },
    ],
    sources: [
      { label: 'Self-employment tax (IRS)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes' },
      { label: 'Hourly wage (Investopedia)', url: 'https://www.investopedia.com/terms/h/hourlywage.asp' },
    ],
  },
  related: ['salary-to-hourly', 'self-employment-tax', 'take-home-pay', 'real-hourly-wage', 'profit-margin'],
  examples: [
    { values: { income: 60000, expenses: 5000, tax: 25, hours: 25, weeks: 6 }, expect: { rate: 73.913, revenue: 85000, billable: 1150, day: 591.304 }, tolerance: 1e-3 },
    { values: { income: 60000, expenses: 0, tax: 0, hours: 40, weeks: 4 }, expect: { rate: 31.25, billable: 1920 }, tolerance: 1e-6 },
  ],
});
