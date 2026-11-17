import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'debt-to-income',
  title: 'Debt-to-Income (DTI) Ratio Calculator',
  category: 'finance',
  description: 'Work out your debt-to-income ratio from monthly debt payments and gross income, see where it sits against common lender benchmarks, and how much debt to clear.',
  keywords: ['debt to income ratio calculator', 'dti calculator', 'dti ratio', 'back-end ratio', 'front-end ratio', 'mortgage dti', 'what is a good dti'],
  updated: '2026-11-17',
  inputs: [
    { id: 'income', label: 'Gross monthly income', type: 'number', prefix: '$', default: 6000, min: 0, step: 100, info: 'Your income before taxes and deductions, per month. Include all regular income you can document.' },
    { id: 'housing', label: 'Monthly housing payment', type: 'number', prefix: '$', default: 1500, min: 0, step: 50, info: 'Rent, or mortgage principal, interest, property tax, insurance and HOA dues.' },
    { id: 'debts', label: 'Other monthly debt payments', type: 'number', prefix: '$', default: 600, min: 0, step: 25, info: 'Minimum payments on car loans, student loans, credit cards, personal loans and similar. Do not include groceries, utilities or phone bills.' },
  ],
  outputs: [
    { id: 'back', label: 'Debt-to-income ratio', format: 'percent', precision: 1, primary: true, info: '(Housing + other debt payments) ÷ gross monthly income. Also called the back-end ratio.' },
    { id: 'front', label: 'Housing ratio (front-end)', format: 'percent', precision: 1, info: 'Housing payment ÷ gross monthly income.' },
    { id: 'total', label: 'Total monthly debt payments', format: 'currency', info: 'Housing plus other debt payments.' },
    { id: 'toBench', label: 'Payments to clear to reach 36%', format: 'currency', info: 'How much monthly debt payment would need to go away to bring the ratio down to 36%. Zero if you are already at or below it.' },
  ],
  compute: (v) => {
    const inc = num(v.income);
    const h = num(v.housing) ?? 0;
    const d = num(v.debts) ?? 0;
    if (inc === null || inc <= 0) return { back: null };
    if (h < 0 || d < 0) return { back: null, error: 'Payments cannot be negative.' };
    const total = h + d;
    const back = total / inc;
    const front = h / inc;
    const toBench = Math.max(0, total - 0.36 * inc);
    const label = back <= 0.36 ? 'Within the range lenders usually like' : back <= 0.43 ? 'Workable, but near the upper limit' : 'High: many lenders will hesitate';
    const chart: ChartSpec = {
      type: 'scale',
      title: 'Debt-to-income ratio',
      min: 0,
      max: 60,
      value: Math.min(back * 100, 60),
      valueLabel: `${(back * 100).toFixed(1)}%`,
      bands: [
        { from: 0, to: 36, label: 'Up to 36%', tone: 'good' },
        { from: 36, to: 43, label: '36–43%', tone: 'warn' },
        { from: 43, to: 60, label: 'Over 43%', tone: 'bad' },
      ],
      format: { format: 'number' },
    };
    return {
      back,
      front,
      total,
      toBench,
      tone: back <= 0.36 ? 'good' : back <= 0.43 ? 'warn' : 'bad',
      badge: label,
      chart,
      note: 'Lenders set their own limits. 36% and 43% are common benchmarks, not rules. A lower ratio generally helps you qualify and get better rates.',
      steps: [
        `Total payments = ${money(h, 2)} + ${money(d, 2)} = ${money(total, 2)}`,
        `DTI = ${money(total, 2)} ÷ ${money(inc, 2)} = ${(back * 100).toFixed(1)}%`,
        `Housing ratio = ${money(h, 2)} ÷ ${money(inc, 2)} = ${(front * 100).toFixed(1)}%`,
      ],
    };
  },
  content: {
    formula: ['DTI = (housing payment + other monthly debt payments) ÷ gross monthly income', 'Housing ratio = housing payment ÷ gross monthly income'],
    body: [
      'Your debt-to-income ratio (DTI) compares what you owe each month to what you earn before taxes. Lenders use it to judge whether you can take on another payment, so it matters most when you apply for a mortgage, auto loan or refinance.',
      'Add up your monthly housing cost and the minimum payments on your debts, then divide by your gross monthly income. Everyday spending such as groceries and utilities is not counted.',
      'Many lenders look for a ratio of about 36% or less, and 43% has long been cited as a common upper limit for mortgages. Limits differ by lender and loan type, so treat these as guides.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: ['Income of $6,000 a month, rent or mortgage of $1,500 and other debts of $600. Total payments are $2,100, so DTI = 2,100 ÷ 6,000 = 35.0%. The housing ratio is 1,500 ÷ 6,000 = 25.0%.'],
      },
      {
        heading: 'How to lower your DTI',
        paragraphs: ['Pay off or refinance the debts with the largest monthly payments, avoid new loans before applying, or raise documented income. The last output shows how much monthly payment must disappear to reach 36%.'],
      },
    ],
    faq: [
      { q: 'What is a good debt-to-income ratio?', a: 'Many lenders like 36% or less. Between 36% and 43% is often workable, and above 43% makes approval harder. Each lender sets its own limits.' },
      { q: 'Is the 43% limit a rule?', a: 'It was long used as a mortgage benchmark, but lenders now apply their own standards by loan type. Use it as a guide, not a guarantee.' },
      { q: 'Does DTI use gross or net income?', a: 'Gross, meaning before taxes and deductions. This calculator uses gross monthly income.' },
      { q: 'What debts count?', a: 'Your housing payment and the minimum monthly payments on car loans, student loans, credit cards and personal loans. Groceries, utilities and insurance not in your mortgage are not counted.' },
    ],
    sources: [{ label: 'CFPB: What is a debt-to-income ratio?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-debt-to-income-ratio-why-is-the-43-debt-to-income-ratio-important-en-1791/' }],
  },
  related: ['home-affordability', 'mortgage', 'debt-payoff-planner'],
  examples: [
    // 2100/6000 = 0.35; front 0.25; toBench 0 (0.36*6000=2160 > 2100).
    { values: { income: 6000, housing: 1500, debts: 600 }, expect: { back: 0.35, front: 0.25, total: 2100, toBench: 0 } },
    // 3000/5000 = 0.6; front 0.4; 0.36*5000=1800 -> clear 1200.
    { values: { income: 5000, housing: 2000, debts: 1000 }, expect: { back: 0.6, front: 0.4, total: 3000, toBench: 1200 } },
  ],
});
