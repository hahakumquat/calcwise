import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'student-loan-accrual',
  title: 'Student Loan Interest While in School',
  seoTitle: 'Student Loan Interest While in School',
  metaDescription: 'See how much interest a student loan builds up before repayment starts, with simple interest and yearly capitalisation side by side and the higher cost.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Estimate the balance you will owe when repayment begins, using simple interest and yearly capitalisation, and how much the monthly interest grows.',
  keywords: ['student loan interest while in school', 'student loan accrued interest calculator', 'capitalized interest calculator', 'student loan balance at graduation', 'deferment interest calculator'],
  popular: false,
  inputs: [
    { id: 'balance', label: 'Loan balance', type: 'number', prefix: '$', default: 20000, min: 0, step: 500, info: 'What you have borrowed so far.' },
    { id: 'apr', label: 'Interest rate (APR)', type: 'number', suffix: '%', default: 6, min: 0, max: 100, step: 0.05, info: 'The yearly rate on the loan.' },
    { id: 'months', label: 'Months until repayment starts', type: 'number', default: 48, min: 0, step: 1, info: 'Time in school plus any grace period, when interest builds but you pay nothing.' },
  ],
  outputs: [
    { id: 'simple', label: 'Balance at repayment (simple interest)', format: 'currency', precision: 2, primary: true, info: 'Balance + balance × rate × months ÷ 12.' },
    { id: 'interest', label: 'Interest built up (simple)', format: 'currency', precision: 2, info: 'Balance × rate × months ÷ 12. This is what monthly interest payments would avoid.' },
    { id: 'cap', label: 'Balance if interest is added each year', format: 'currency', precision: 2, info: 'Balance × (1 + rate)^(months ÷ 12).' },
    { id: 'monthly', label: 'Monthly interest at repayment', format: 'currency', precision: 2, info: 'Simple-interest balance × rate ÷ 12.' },
  ],
  compute: (v) => {
    const balance = num(v.balance), apr = num(v.apr), months = num(v.months);
    if ([balance, apr, months].some((x) => x === null)) return { simple: null };
    if ([balance!, apr!, months!].some((x) => x < 0)) return { simple: null, error: 'Amounts cannot be negative.' };
    const r = apr! / 100;
    const interest = balance! * r * months! / 12;
    const simple = balance! + interest;
    const cap = balance! * Math.pow(1 + r, months! / 12);
    const monthly = simple * r / 12;
    const start = balance! * r / 12;
    return {
      simple,
      interest,
      cap,
      monthly,
      tone: interest > 0 ? 'warn' : 'good',
      badge: `Monthly interest goes from ${money(start, 2)} to ${money(monthly, 2)}`,
      chart: {
        type: 'bar',
        title: 'Balance when repayment starts',
        categories: ['Borrowed', 'Simple interest', 'Added yearly'],
        series: [{ name: 'Dollars', values: [+balance!.toFixed(2), +simple.toFixed(2), +cap.toFixed(2)] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Simple interest = ${money(balance!, 0)} × ${apr}% × ${months} ÷ 12 = ${money(interest, 2)}`,
        `Balance at repayment = ${money(balance!, 0)} + ${money(interest, 2)} = ${money(simple, 2)}`,
        `If added yearly = ${money(balance!, 0)} × (1 + ${apr}%)^(${months} ÷ 12) = ${money(cap, 2)}`,
        `Monthly interest at repayment = ${money(simple, 2)} × ${apr}% ÷ 12 = ${money(monthly, 2)}`,
      ],
      note: 'Which method applies depends on your loan type and servicer, and some loans do not build interest in school. Check your loan terms. Real loans can have several loans at different rates, so treat this as a rough guide.',
    };
  },
  content: {
    formula: [
      'Simple interest = balance × rate × months ÷ 12',
      'Balance at repayment = balance + simple interest',
      'Added each year = balance × (1 + rate)^(months ÷ 12)',
      'Monthly interest at repayment = balance at repayment × rate ÷ 12',
    ],
    body: [
      'Many student loans build up interest while you study. You pay nothing, but the amount you owe keeps growing, and the monthly interest on the larger balance is higher once repayment starts.',
      'Take $20,000 at 6% with 48 months before repayment. Simple interest is 20,000 × 0.06 × 4 = $4,800, so you owe $24,800. If the interest were added to the balance each year, it would be 20,000 × 1.06^4 = $25,249.54. Monthly interest rises from $100 to $124, or $24 more every month.',
      'Paying the interest as it builds, $100 a month in this example, avoids the $4,800 growth. We do not say which method your loan uses: check with your servicer.',
    ],
    sections: [
      {
        heading: 'Using the numbers',
        paragraphs: [
          'Once you know the balance at repayment, use the student loan payoff calculator to plan payments, or the loan calculator for a standard payment. If you are weighing a program, the degree payback calculator shows how long it takes to earn the cost back.',
        ],
      },
    ],
    faq: [
      { q: 'How much interest builds on $20,000 at 6% over 4 years?', a: 'With simple interest it is 20,000 × 0.06 × 4 = $4,800, giving a balance of $24,800. If interest is added to the balance each year, the balance is $25,249.54.' },
      { q: 'Why does my monthly interest go up at repayment?', a: 'Interest is charged on the balance. A larger balance, such as $24,800 instead of $20,000 at 6%, means $124 a month in interest rather than $100.' },
      { q: 'Does every student loan build interest in school?', a: 'No. It depends on the loan type and terms. Check with your servicer which of your loans build interest and whether it is added to the balance.' },
      { q: 'How do I avoid the extra interest?', a: 'Paying the interest each month while in school keeps the balance from growing. In the example that is about $100 a month.' },
    ],
    sources: [
      { label: 'Federal Student Aid: Interest rates and fees', url: 'https://studentaid.gov/understand-aid/types/loans/interest-rates' },
    ],
  },
  related: ['student-loan-payoff', 'loan', 'degree-payback', 'compound-interest'],
  examples: [
    // interest 20000*.06*4=4800; simple 24800; cap 20000*1.06^4=25249.5392; monthly 24800*.005=124
    { values: { balance: 20000, apr: 6, months: 48 }, expect: { simple: 24800, interest: 4800, cap: 25249.5392, monthly: 124 }, tolerance: 1e-3 },
    // 10000, 12%, 12 months: interest 1200; simple 11200; cap 11200; monthly 112
    { values: { balance: 10000, apr: 12, months: 12 }, expect: { simple: 11200, interest: 1200, cap: 11200, monthly: 112 }, tolerance: 1e-6 },
  ],
});
