import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'savers-credit',
  title: "Saver's Credit Calculator",
  category: 'finance',
  description: "Estimate your Saver's Credit for retirement contributions. Enter what you saved, the contribution cap, your credit rate and your income tax to see the credit.",
  keywords: ["saver's credit calculator", 'retirement savings contributions credit', 'savers credit 50 20 10', 'ira contribution tax credit', 'form 8880 calculator'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'contrib', label: 'Retirement contributions this year', type: 'number', prefix: '$', default: 1500, min: 0, step: 100, info: 'What you put into an IRA, 401(k) or similar plan this year.' },
    { id: 'cap', label: 'Contribution cap that counts', type: 'number', prefix: '$', default: 2000, min: 0, step: 100, info: 'The IRS counts only contributions up to this amount per person. Check the current figure.' },
    { id: 'rate', label: 'Your credit rate', type: 'number', suffix: '%', default: 50, min: 0, max: 100, step: 10, info: 'The IRS sets 50%, 20%, 10% or 0% based on your adjusted gross income and filing status. Look yours up in the IRS tables.' },
    { id: 'tax', label: 'Your income tax before credits', type: 'number', prefix: '$', default: 800, min: 0, step: 100, info: 'The credit cannot lower your tax below zero, so it is limited to this amount.' },
  ],
  outputs: [
    { id: 'credit', label: "Saver's Credit", format: 'currency', precision: 2, primary: true, info: 'Smaller of (counted contributions × rate) and your income tax.' },
    { id: 'counted', label: 'Contributions that count', format: 'currency', precision: 2, info: 'The smaller of what you contributed and the cap.' },
    { id: 'before', label: 'Credit before the tax limit', format: 'currency', precision: 2, info: 'Counted contributions × credit rate.' },
  ],
  compute: (v) => {
    const c = num(v.contrib);
    const cap = num(v.cap);
    const rate = num(v.rate);
    const tax = num(v.tax);
    if ([c, cap, rate, tax].some((x) => x === null)) return { credit: null };
    if ([c, cap, rate, tax].some((x) => (x as number) < 0)) return { credit: null, error: 'Values cannot be negative.' };
    if (rate! > 100) return { credit: null, error: 'The credit rate cannot be over 100%.' };
    const counted = Math.min(c!, cap!);
    const before = counted * (rate! / 100);
    const credit = Math.min(before, tax!);
    return {
      credit,
      counted,
      before,
      tone: credit > 0 ? 'good' : 'ok',
      badge: credit > 0 ? `${money(credit)} credit` : 'No credit',
      note: credit === 0
        ? `With a ${rate}% rate or ${money(tax!)} of tax there is no credit to claim here. Your rate depends on income and filing status.`
        : before > tax!
          ? `${money(counted)} × ${rate}% would be ${money(before)}, but the credit cannot go below zero tax, so it is limited to ${money(tax!)}.`
          : `${money(counted)} of counted contributions × ${rate}% = ${money(credit)} off your tax. Eligibility rules on age, student status and dependents also apply.`,
      chart: {
        type: 'bar' as const,
        title: "Saver's Credit",
        categories: ['Credit'],
        series: [
          { name: 'Credit', values: [credit] },
          { name: 'Lost to tax limit', values: [before - credit] },
        ],
        format: CURRENCY,
        stacked: true,
      },
      steps: [
        `Counted = smaller of ${money(c!)} and ${money(cap!)} = ${money(counted)}`,
        `Before limit = ${money(counted)} × ${rate}% = ${money(before)}`,
        `Credit = smaller of ${money(before)} and ${money(tax!)} = ${money(credit)}`,
      ],
    };
  },
  content: {
    formula: [
      'Counted = smaller of contributions and the cap',
      'Credit before limit = counted × credit rate',
      'Credit = smaller of that and your income tax',
    ],
    body: [
      "The Saver's Credit rewards lower-income savers for putting money into an IRA or workplace plan. The credit is a share of your contributions, up to a cap, and the share depends on your income and filing status.",
      'Example: you contribute $1,500 and your rate is 50%. The credit is $750, as long as you owe at least $750 in income tax.',
      'There are also rules on age, full-time student status and being claimed as a dependent that this does not check. Rates and caps come from you. This is general information, not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What credit rate should I use?', a: 'The IRS sets 50%, 20%, 10% or 0% by adjusted gross income and filing status. Find your tier in the IRS table linked below.' },
      { q: 'Why is my credit smaller than rate × contributions?', a: 'Either your contributions exceeded the cap, or the credit was limited to your income tax, since it cannot reduce tax below zero.' },
      { q: 'What counts as a contribution?', a: 'IRA and workplace plan contributions generally count. Check the IRS page for the full list and any reductions.' },
      { q: 'Is the credit refundable?', a: 'No. The calculator limits it to your tax. Anything above is lost.' },
      { q: 'Can I contribute after year end?', a: 'IRA contributions made by the tax filing deadline can count for the prior year. Check the IRS rules.' },
    ],
    sources: [
      { label: "IRS: Retirement Savings Contributions Credit (Saver's Credit)", url: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-savings-contributions-savers-credit' },
    ],
  },
  related: ['pretax-contribution-cost', 'income-tax', 'retirement', 'take-home-pay'],
  examples: [
    // counted 1500; before 750; tax 800 -> credit 750
    { values: { contrib: 1500, cap: 2000, rate: 50, tax: 800 }, expect: { counted: 1500, before: 750, credit: 750 } },
    // cap binds: counted 2000; 20% = 400; tax 300 -> 300
    { values: { contrib: 3000, cap: 2000, rate: 20, tax: 300 }, expect: { counted: 2000, before: 400, credit: 300 } },
    // rate 0 -> none
    { values: { contrib: 2000, cap: 2000, rate: 0, tax: 5000 }, expect: { counted: 2000, before: 0, credit: 0 } },
  ],
});
