import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'salary-needed',
  title: 'Salary Needed Calculator',
  category: 'finance',
  description: 'Work out the yearly salary you need to cover your monthly spending and a savings goal, using a simple effective tax rate you choose.',
  keywords: ['salary needed calculator', 'how much salary do I need', 'salary to cover expenses', 'required income calculator', 'gross salary from spending'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'spending', label: 'Monthly spending', type: 'number', prefix: '$', default: 3200, min: 0, step: 50, info: 'Everything you spend in a typical month: rent, bills, food, fun. Not including savings.' },
    { id: 'savings', label: 'Savings as a share of take-home pay', type: 'number', suffix: '%', default: 20, min: 0, max: 95, step: 1, info: 'The part of your take-home pay you want to save. Spending plus savings equals take-home.' },
    { id: 'tax', label: 'Effective tax rate (assumption)', type: 'number', suffix: '%', default: 22, min: 0, max: 80, step: 0.5, help: 'An assumption: your own rate will differ.', info: 'One flat rate covering income and payroll tax. This calculator does not use tax brackets, so treat the result as an estimate.' },
  ],
  outputs: [
    { id: 'gross', label: 'Salary needed per year (before tax)', format: 'currency', primary: true, info: 'Take-home × 12 ÷ (1 − tax rate).' },
    { id: 'takeHome', label: 'Take-home needed per month', format: 'currency', info: 'Spending ÷ (1 − savings share).' },
    { id: 'saved', label: 'Savings per month', format: 'currency', info: 'Take-home − spending.' },
    { id: 'hourly', label: 'Hourly equivalent', format: 'currency', info: 'Yearly salary ÷ 2,080 hours (40 hours × 52 weeks).' },
  ],
  compute: (v) => {
    const spending = num(v.spending);
    const sv = num(v.savings);
    const tax = num(v.tax);
    if (spending === null || sv === null || tax === null) return { gross: null };
    if (spending < 0 || sv < 0 || sv >= 100 || tax < 0 || tax >= 100) return { gross: null };

    const takeHome = spending / (1 - sv / 100);
    const saved = takeHome - spending;
    const gross = (takeHome * 12) / (1 - tax / 100);
    const hourly = gross / 2080;
    const taxYear = gross - takeHome * 12;

    return {
      gross,
      takeHome,
      saved,
      hourly,
      tone: 'ok',
      badge: `${money(hourly, 2)} an hour`,
      chart: [
        moneyDonut('Where the salary goes', [
          { label: 'Spending', value: spending * 12 },
          { label: 'Savings', value: saved * 12 },
          { label: 'Tax', value: taxYear },
        ].filter((s) => s.value > 0), money(gross, 0), 'a year'),
      ],
      steps: [
        `Take-home needed = ${money(spending, 2)} ÷ (1 − ${sv}%) = ${money(takeHome, 2)} a month`,
        `Savings = ${money(takeHome, 2)} − ${money(spending, 2)} = ${money(saved, 2)} a month`,
        `Salary = ${money(takeHome, 2)} × 12 ÷ (1 − ${tax}%) = ${money(gross, 2)} a year`,
        `Hourly = ${money(gross, 2)} ÷ 2,080 = ${money(hourly, 2)}`,
      ],
      note: `To spend ${money(spending, 0)} a month and save ${sv}% of take-home, you would need about ${money(gross, 0)} a year before tax, assuming a flat ${tax}% effective tax rate. That is roughly ${money(hourly, 2)} an hour on a 2,080-hour year. Real taxes vary, so treat this as an estimate.`,
    };
  },
  content: {
    formula: [
      'Take-home needed = monthly spending ÷ (1 − savings share)',
      'Salary needed = take-home × 12 ÷ (1 − effective tax rate)',
      'Hourly = salary ÷ 2,080',
    ],
    body: [
      'Most salary targets start from a feeling. This one starts from your spending. Enter what you spend in a month, how much of your take-home pay you want to save, and a tax rate, and it works backwards to the yearly salary that would cover both.',
      'The savings share is measured against take-home pay, so spending is the rest. At a 20% savings share, spending is 80% of take-home, which means take-home is spending ÷ 0.8.',
      'The tax rate is an assumption. One flat effective rate stands in for income tax and payroll tax, and there are no brackets, deductions or state rules in the math. Raise it if you live somewhere with higher taxes, lower it if you have a lot of deductions. Pre-tax deductions such as retirement contributions or health premiums are not modelled.',
      'The hourly figure uses 2,080 hours, which is 40 hours a week for 52 weeks. Everything runs in your browser and nothing is stored. This is a planning tool, not financial advice.',
    ],
    faq: [
      { q: 'What salary covers $3,200 a month and saves 20%?', a: 'Take-home must be $3,200 ÷ 0.8 = $4,000 a month, which saves $800. With a 20% effective tax rate, the salary is $4,000 × 12 ÷ 0.8 = $60,000 a year, about $28.85 an hour.' },
      { q: 'What does the default 22% tax rate give?', a: 'On the same $4,000 take-home, $48,000 a year ÷ 0.78 is about $61,538 a year, or $29.59 an hour.' },
      { q: 'Why is savings a share of take-home pay?', a: 'It keeps the math simple: spending plus savings equals take-home pay. A 20% savings share means 80% of take-home covers spending.' },
      { q: 'Is the tax rate exact?', a: 'No. It is a single flat assumption with no brackets. Your real tax depends on where you live, deductions and other income, so use your own estimate.' },
    ],
    sources: [],
  },
  related: ['take-home-pay', 'salary-to-hourly', 'budget-50-30-20', 'income-tax', 'cost-of-living-salary', 'lifestyle-creep'],
  examples: [
    {
      // 3,200 ÷ 0.8 = 4,000; saved 800; 4,000 × 12 = 48,000 ÷ 0.8 = 60,000; 60,000 ÷ 2,080 = 28.846.
      values: { spending: 3200, savings: 20, tax: 20 },
      expect: { takeHome: 4000, saved: 800, gross: 60000, hourly: 60000 / 2080 },
      tolerance: 0.001,
    },
    {
      // 2,500 ÷ 0.9 = 2,777.78; saved 277.78; × 12 = 33,333.33 ÷ 0.78 = 42,735.04; ÷ 2,080 = 20.5457.
      values: { spending: 2500, savings: 10, tax: 22 },
      expect: { takeHome: 2500 / 0.9, saved: 2500 / 0.9 - 2500, gross: (2500 / 0.9) * 12 / 0.78, hourly: ((2500 / 0.9) * 12 / 0.78) / 2080 },
      tolerance: 0.001,
    },
  ],
});
