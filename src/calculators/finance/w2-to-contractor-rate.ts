import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'w2-to-contractor-rate',
  title: 'W-2 Salary to Contractor Hourly Rate',
  seoTitle: 'W-2 to 1099 Hourly Rate Calculator',
  metaDescription: 'Turn a W-2 salary into the 1099 contractor hourly rate that matches it once benefits, paid time off, extra payroll tax and expenses are priced in.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Find the hourly rate a contractor needs to match a salaried job after benefits, unpaid time off and self-employment costs.',
  keywords: ['w2 to 1099 calculator', 'salary to contractor rate', 'w2 to contractor hourly rate', '1099 vs w2 hourly rate', 'contractor rate to match salary'],
  popular: false,
  inputs: [
    { id: 'salary', label: 'W-2 salary', type: 'number', prefix: '$', default: 100000, min: 0, step: 1000, info: 'Your yearly gross salary as an employee.' },
    { id: 'hours', label: 'Hours worked per week', type: 'number', default: 40, min: 1, max: 80, step: 1, info: 'Hours you work in a normal week.' },
    { id: 'off', label: 'Paid days off you would lose', type: 'number', default: 25, min: 0, max: 200, step: 1, info: 'Vacation, sick days and paid holidays. A contractor is not paid for these.' },
    { id: 'benefits', label: 'Benefits you would pay for yourself', type: 'number', prefix: '$', default: 12000, min: 0, step: 500, info: 'Yearly value of health insurance, retirement match and anything else the employer covers.' },
    { id: 'taxrate', label: 'Extra payroll tax as contractor', type: 'number', suffix: '%', default: 7.65, min: 0, max: 30, step: 0.05, info: 'An employer pays half of Social Security and Medicare (7.65%). A contractor pays all of it. Enter 7.65 for the simple estimate.' },
    { id: 'expenses', label: 'Business costs per year', type: 'number', prefix: '$', default: 3000, min: 0, step: 100, info: 'Software, insurance, accounting and equipment you would now pay for.' },
    { id: 'billable', label: 'Share of working time you can bill', type: 'number', suffix: '%', default: 100, min: 10, max: 100, step: 5, info: 'Contractors also spend time finding work and invoicing. Lower this below 100 to price that in.' },
  ],
  outputs: [
    { id: 'rate', label: 'Contractor hourly rate to break even', format: 'currency', precision: 2, primary: true, info: 'Required yearly income ÷ billable hours.' },
    { id: 'wage', label: 'Your W-2 hourly equivalent', format: 'currency', precision: 2, info: 'Salary ÷ (hours per week × 52).' },
    { id: 'premium', label: 'Rate premium over W-2', format: 'percent', precision: 1, info: 'How much higher the contractor rate is than the W-2 hourly equivalent.' },
    { id: 'required', label: 'Income you need as a contractor', format: 'currency', precision: 0, info: 'Salary + benefits + extra payroll tax + business costs.' },
    { id: 'billableHours', label: 'Billable hours per year', format: 'number', precision: 0, info: 'Working days (260 − days off) × hours per day × billable share.' },
  ],
  compute: (v) => {
    const salary = num(v.salary), hours = num(v.hours), off = num(v.off), benefits = num(v.benefits);
    const taxrate = num(v.taxrate), expenses = num(v.expenses), billable = num(v.billable);
    if ([salary, hours, off, benefits, taxrate, expenses, billable].some((x) => x === null)) return { rate: null };
    if ([salary!, off!, benefits!, taxrate!, expenses!].some((x) => x < 0)) return { rate: null, error: 'Amounts cannot be negative.' };
    if (hours! <= 0 || hours! > 80) return { rate: null, error: 'Enter hours per week between 1 and 80.' };
    if (billable! < 10 || billable! > 100) return { rate: null, error: 'Billable share must be between 10% and 100%.' };
    if (off! >= 260) return { rate: null, error: 'Days off must be fewer than 260.' };
    const extraTax = salary! * taxrate! / 100;
    const required = salary! + benefits! + extraTax + expenses!;
    const perDay = hours! / 5;
    const days = 260 - off!;
    const billableHours = days * perDay * billable! / 100;
    const rate = required / billableHours;
    const wage = salary! / (hours! * 52);
    const premium = wage > 0 ? rate / wage - 1 : 0;
    return {
      rate,
      wage,
      premium,
      required,
      billableHours,
      tone: premium > 0.5 ? 'warn' : 'good',
      badge: wage > 0 ? `${(rate / wage).toFixed(2)}× your salary rate` : undefined,
      chart: {
        type: 'bar',
        title: 'Where the contractor income goes',
        categories: ['Salary', 'Benefits', 'Extra tax', 'Business costs'],
        series: [{ name: 'Per year', values: [salary!, benefits!, +extraTax.toFixed(2), expenses!] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Extra payroll tax = ${money(salary!, 0)} × ${taxrate}% = ${money(extraTax, 0)}`,
        `Income needed = ${money(salary!, 0)} + ${money(benefits!, 0)} + ${money(extraTax, 0)} + ${money(expenses!, 0)} = ${money(required, 0)}`,
        `Billable hours = ${days} days × ${+perDay.toFixed(2)} h × ${billable}% = ${+billableHours.toFixed(1)}`,
        `Rate = ${money(required, 0)} ÷ ${+billableHours.toFixed(1)} = ${money(rate, 2)} an hour`,
      ],
      note: 'A simple estimate, not tax advice. Real self-employment tax is 15.3% on 92.35% of profit, and contractors can deduct business costs, so your own tax may differ.',
    };
  },
  content: {
    formula: [
      'Income needed = salary + benefits + extra payroll tax + business costs',
      'Billable hours = (260 − paid days off) × hours per day × billable share',
      'Contractor rate = income needed ÷ billable hours',
    ],
    body: [
      'A contractor who charges the same hourly figure as a salaried hourly equivalent ends up poorer. As a contractor you pay for your own benefits, cover the half of payroll tax the employer used to pay, and are not paid for vacation, sick days or holidays.',
      'Take a $100,000 salary at 40 hours a week. That is $48.08 an hour as an employee. Add $12,000 of benefits, 7.65% extra payroll tax ($7,650) and $3,000 of business costs and you need $122,650. With 25 days off, you bill 235 days, or 1,880 hours, so the break-even rate is $65.24 an hour, about 36% above the salary rate.',
    ],
    sections: [
      {
        heading: 'What this leaves out',
        paragraphs: [
          'Income tax is the same idea either way, so it is not added here. Contractors can often deduct business costs and part of self-employment tax, which narrows the gap. Gaps between contracts, equity, bonuses and job security are real but hard to price; lower the billable share to include time without paid work. For the tax alone, see the self-employment tax calculator.',
        ],
      },
    ],
    faq: [
      { q: 'How do I convert a W-2 salary to a 1099 hourly rate?', a: 'Add your benefits, the extra payroll tax a contractor pays and your business costs to the salary, then divide by the hours you can actually bill. For $100,000, $12,000 benefits, 7.65% tax, $3,000 costs and 235 billable days at 8 hours, that is $65.24 an hour.' },
      { q: 'Why is the contractor rate so much higher?', a: 'The employer pays for benefits, half of payroll tax and paid time off. A contractor pays or loses all three, so the same income needs a higher hourly rate.' },
      { q: 'Is 7.65% the right extra tax?', a: 'It is a simple stand-in for the employer half of Social Security and Medicare. The real self-employment tax is 15.3% on 92.35% of profit, partly deductible, so use your own figure if you know it.' },
      { q: 'What if I will not be billing every hour?', a: 'Lower the billable share. At 80%, the same example needs about $81.55 an hour, because the same income is spread over fewer hours.' },
    ],
    sources: [{ label: 'IRS: Self-employment tax (Social Security and Medicare)', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes' }],
  },
  related: ['freelance-rate', 'self-employment-tax', 'salary-to-hourly', 'take-home-pay'],
  examples: [
    // required 100000+12000+7650+3000=122650; hours 235*8=1880; rate 65.2394; wage 48.0769; premium 0.357
    { values: { salary: 100000, hours: 40, off: 25, benefits: 12000, taxrate: 7.65, expenses: 3000, billable: 100 }, expect: { rate: 65.23936, wage: 48.07692, premium: 0.357, required: 122650, billableHours: 1880 }, tolerance: 1e-3 },
    // required 60000; 260 days *8 = 2080 h; rate 28.846; wage 28.846; premium 0
    { values: { salary: 60000, hours: 40, off: 0, benefits: 0, taxrate: 0, expenses: 0, billable: 100 }, expect: { rate: 28.84615, premium: 0, billableHours: 2080 }, tolerance: 1e-3 },
    // 80% billable: 1504 h; 122650/1504 = 81.5491
    { values: { salary: 100000, hours: 40, off: 25, benefits: 12000, taxrate: 7.65, expenses: 3000, billable: 80 }, expect: { rate: 81.5491, billableHours: 1504 }, tolerance: 1e-3 },
  ],
});
