import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const pmt = (p: number, apr: number, n: number) => {
  const i = apr / 100 / 12;
  return i === 0 ? p / n : (p * i) / (1 - (1 + i) ** -n);
};

export default defineCalculator({
  slug: 'mortgage-recast',
  title: 'Mortgage Recast Calculator',
  category: 'finance',
  description: 'See how a lump-sum payment and a mortgage recast lowers your monthly payment while keeping the same term and rate, and how much interest it saves over the loan.',
  keywords: ['mortgage recast calculator', 'recast vs refinance', 'lump sum mortgage payment lower monthly', 'mortgage re-amortization', 'recast mortgage savings', 'new payment after recast'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'balance', label: 'Current balance', type: 'number', prefix: '$', default: 300000, min: 0, step: 1000, info: 'Remaining principal on the loan.' },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 6.5, min: 0, step: 0.05, info: 'Your current annual rate. A recast keeps it.' },
    { id: 'months', label: 'Months remaining', type: 'number', default: 300, min: 1, step: 1, suffix: 'months', info: 'Months left on the loan. A recast keeps the same end date.' },
    { id: 'lump', label: 'Lump-sum payment', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'The extra principal you pay before recasting.' },
  ],
  outputs: [
    { id: 'saving', label: 'Monthly payment drops by', format: 'currency', precision: 2, primary: true, info: 'Current payment − recast payment.' },
    { id: 'before', label: 'Payment now', format: 'currency', precision: 2, info: 'Payment on the current balance over the remaining months.' },
    { id: 'after', label: 'Payment after recast', format: 'currency', precision: 2, info: 'Payment on (balance − lump sum) over the same months.' },
    { id: 'interestSaved', label: 'Interest saved over the loan', format: 'currency', precision: 0, info: 'Total interest before minus total interest after.' },
  ],
  compute: (v) => {
    const b = num(v.balance);
    const rate = num(v.rate);
    const n = num(v.months);
    const lump = num(v.lump);
    if (b === null || rate === null || n === null || lump === null) return { saving: null };
    if (b <= 0 || rate < 0 || n < 1 || lump < 0) return { saving: null };
    if (lump >= b) return { saving: null, error: 'A lump sum at or above the balance pays the loan off, so there is nothing to recast.' };
    const before = pmt(b, rate, n);
    const after = pmt(b - lump, rate, n);
    const interestBefore = before * n - b;
    const interestAfter = after * n - (b - lump);
    const saving = before - after;
    const interestSaved = interestBefore - interestAfter;
    return {
      saving,
      before,
      after,
      interestSaved,
      tone: 'good',
      badge: `${money(saving)} less a month`,
      note: `Paying ${money(lump)} and recasting takes your payment from ${money(before)} to ${money(after)}, ${money(saving)} less each month. Total interest falls from ${money(interestBefore)} to ${money(interestAfter)}, saving ${money(interestSaved)}. Lenders set fees and minimums.`,
      chart: {
        type: 'bar',
        title: 'Monthly payment',
        categories: ['Now', 'After recast'],
        series: [{ name: 'Payment', values: [before, after] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Payment now = ${money(b)} at ${rate}% over ${n} months = ${money(before)}`,
        `Payment after = ${money(b - lump)} at ${rate}% over ${n} months = ${money(after)}`,
        `Interest = ${money(interestBefore)} before vs ${money(interestAfter)} after`,
      ],
    };
  },
  content: {
    formula: [
      'Payment = P × i ÷ (1 − (1 + i)^−n), with i = rate ÷ 12',
      'Recast payment: same formula with P = balance − lump sum',
      'Total interest = payment × n − principal',
    ],
    body: [
      'A recast is when you pay a lump sum toward the principal and the lender re-amortizes the loan. The rate and end date stay the same, but the smaller balance means a smaller monthly payment. It is different from a refinance, which replaces the loan.',
      'Example: $300,000 left at 6.5% with 300 months to go. The payment is $2,025.62. Pay $50,000 and recast, and the $250,000 balance costs $1,688.02 a month, $337.60 less. Total interest drops from $307,686 to $256,405, saving about $51,281.',
      'Lenders set their own recast fees, minimum lump sums and rules, and some do not offer it. If you keep paying the old amount instead, you finish earlier, which the extra mortgage payment calculator shows. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does a mortgage recast lower my payment?', a: 'Re-compute the payment on the smaller balance over the same months. In the example, $50,000 off a $300,000 balance cuts the payment from $2,025.62 to $1,688.02.' },
      { q: 'What is the difference between a recast and a refinance?', a: 'A recast keeps your existing loan, rate and end date and only re-amortizes after a lump sum. A refinance replaces the loan, usually with a new rate and closing costs.' },
      { q: 'Does a recast save interest?', a: 'Yes, because the balance is lower from the day you pay. In the example, total interest falls by about $51,281.' },
      { q: 'Are there fees?', a: 'Lenders often charge a recast fee and require a minimum lump sum. Those are not included here.' },
    ],
    sources: [],
  },
  related: ['mortgage', 'extra-mortgage-payment', 'refinance', 'mortgage-points', 'rent-vs-buy'],
  examples: [
    // before 300000 at 6.5%/12 over 300 = 2025.62; after 250000 = 1688.02; saving 337.60; interest 307,686 -> 256,405; saved 51,281
    { values: { balance: 300000, rate: 6.5, months: 300, lump: 50000 }, expect: { before: 2025.62, after: 1688.02, saving: 337.6, interestSaved: 51281 }, tolerance: 1 },
    // zero rate: 12000/12 = 1000; after (12000-6000)/12 = 500; saving 500; no interest
    { values: { balance: 12000, rate: 0, months: 12, lump: 6000 }, expect: { before: 1000, after: 500, saving: 500, interestSaved: 0 }, tolerance: 1e-6 },
  ],
});
