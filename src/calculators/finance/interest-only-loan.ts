import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, money, CURRENCY } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'interest-only-loan',
  title: 'Interest-Only Loan Calculator',
  category: 'finance',
  description: 'See your interest-only payment, what the payment jumps to when the interest-only period ends, and the total interest versus a regular loan.',
  keywords: ['interest only loan calculator', 'interest only mortgage calculator', 'interest only payment', 'interest only vs principal and interest', 'payment shock after interest only'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'amount', label: 'Loan amount', type: 'number', prefix: '$', default: 300000, min: 0, step: 1000, info: 'The amount you borrow.' },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 7, min: 0, max: 30, step: 0.125, info: 'Yearly rate, assumed fixed for the whole loan.' },
    { id: 'term', label: 'Total loan term', type: 'number', suffix: 'years', default: 30, min: 1, max: 40, step: 1, info: 'Interest-only years plus repayment years.' },
    { id: 'io', label: 'Interest-only period', type: 'number', suffix: 'years', default: 5, min: 0, max: 39, step: 1, info: 'Years you pay interest only. Must be shorter than the total term.' },
  ],
  outputs: [
    { id: 'ioPayment', label: 'Interest-only payment', format: 'currency', primary: true, info: 'Loan amount × rate ÷ 12. Principal stays the same.' },
    { id: 'after', label: 'Payment after interest-only ends', format: 'currency', info: 'The full loan repaid over the remaining years.' },
    { id: 'jump', label: 'Monthly payment increase', format: 'currency', info: 'Payment after minus interest-only payment.' },
    { id: 'regular', label: 'Regular payment (no interest-only)', format: 'currency', info: 'Payment if you repaid principal and interest from day one.' },
    { id: 'totalInterest', label: 'Total interest, interest-only loan', format: 'currency', precision: 0, info: 'All interest paid over the full term.' },
    { id: 'extraInterest', label: 'Extra interest vs regular loan', format: 'currency', precision: 0, info: 'Interest-only total minus regular total.' },
  ],
  compute: (v) => {
    const amount = num(v.amount), rate = num(v.rate), term = num(v.term), io = num(v.io);
    if (amount === null || rate === null || term === null || io === null) return { ioPayment: null };
    if (amount <= 0 || rate < 0 || term < 1 || io < 0 || io >= term) return { ioPayment: null };
    const n = Math.round(term * 12);
    const nio = Math.round(io * 12);
    const rest = n - nio;
    if (rest < 1) return { ioPayment: null };
    const ioPayment = (amount * rate) / 100 / 12;
    const after = amortizedPayment(amount, rate, rest);
    const regular = amortizedPayment(amount, rate, n);
    const totalPaidIo = ioPayment * nio + after * rest;
    const totalInterest = totalPaidIo - amount;
    const regularInterest = regular * n - amount;
    const r = rate / 100 / 12;
    const years = Math.ceil(n / 12);
    const balIo: number[] = [];
    const balReg: number[] = [];
    let a = amount, b = amount;
    for (let m = 0; m <= years * 12; m++) {
      if (m % 12 === 0) { balIo.push(Math.max(a, 0)); balReg.push(Math.max(b, 0)); }
      if (m >= n) continue;
      b = b * (1 + r) - regular;
      a = m < nio ? a : a * (1 + r) - after;
    }
    return {
      ioPayment,
      after,
      jump: after - ioPayment,
      regular,
      totalInterest,
      extraInterest: totalInterest - regularInterest,
      chart: {
        type: 'line',
        title: 'Balance owed over time',
        x: balIo.map((_, i) => i),
        xLabel: 'Years',
        yFormat: CURRENCY,
        series: [
          { name: 'Interest-only', values: balIo },
          { name: 'Regular loan', values: balReg },
        ],
      },
      steps: [
        `Interest-only payment = ${money(amount, 0)} × ${rate}% ÷ 12 = ${money(ioPayment)}`,
        `After ${io} years the full ${money(amount, 0)} is repaid over ${rest} months: ${money(after)} a month`,
        `Regular ${n}-month loan would be ${money(regular)} a month from the start`,
      ],
      note: `Payments jump by ${money(after - ioPayment)} a month when the interest-only period ends, and you pay ${money(totalInterest - regularInterest, 0)} more interest overall.`,
    };
  },
  content: {
    formula: ['Interest-only payment = loan × (annual rate ÷ 12)', 'Payment after = loan × r ÷ (1 − (1 + r)^−m), where r is the monthly rate and m the months left after the interest-only period'],
    body: [
      'An interest-only loan lets you pay just the interest for the first few years. The balance does not go down in that time, so the payment is lower than on a regular loan.',
      'The catch is the reset. When the interest-only period ends, you repay the whole balance over fewer months, so the payment jumps. For $300,000 at 7% over 30 years with 5 interest-only years, the payment goes from $1,750 to about $2,120 a month, while a regular loan would have been about $1,996 from the start.',
      'You also pay more interest overall, because you owe the full amount for longer. The chart shows the balance staying flat on the interest-only loan while the regular loan falls from day one.',
      'This calculator assumes a fixed rate. Many interest-only loans have adjustable rates, so the real payment after the reset could be higher or lower. It covers principal and interest only, not taxes or insurance.',
    ],
    faq: [
      { q: 'How do you calculate an interest-only payment?', a: 'Multiply the loan by the yearly rate and divide by 12. $300,000 × 7% ÷ 12 = $1,750 a month.' },
      { q: 'What happens when the interest-only period ends?', a: 'You start repaying principal too, over the months that remain. Because the balance is still the full amount, the payment rises. In the default example it goes from $1,750 to about $2,120.' },
      { q: 'Does an interest-only loan cost more overall?', a: 'Usually yes. You owe the full balance for longer, so total interest is higher than on a regular loan with the same rate and term.' },
      { q: 'Does this include taxes and insurance?', a: 'No. It shows principal and interest only.' },
    ],
    sources: [
      { label: 'Interest-only loans (Consumer Financial Protection Bureau)', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-an-interest-only-loan-en-1943/' },
      { label: 'Interest-only loan (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Interest-only_loan' },
    ],
  },
  related: ['mortgage', 'loan', 'extra-mortgage-payment', 'refinance', 'loan-comparison'],
  examples: [
    { values: { amount: 300000, rate: 7, term: 30, io: 5 }, expect: { ioPayment: 1750, regular: 1995.91, after: 2120.34 }, tolerance: 0.02 },
    { values: { amount: 120000, rate: 0, term: 10, io: 2 }, expect: { ioPayment: 0, after: 1250, extraInterest: 0 }, tolerance: 1e-6 },
  ],
});
