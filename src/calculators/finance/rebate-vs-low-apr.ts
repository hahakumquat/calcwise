import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const pmt = (p: number, apr: number, n: number) => {
  const i = apr / 100 / 12;
  return i === 0 ? p / n : (p * i) / (1 - (1 + i) ** -n);
};

export default defineCalculator({
  slug: 'rebate-vs-low-apr',
  title: 'Cash Rebate vs Low APR Calculator',
  category: 'finance',
  description: 'Compare a dealer\'s low-APR offer with taking the cash rebate and financing elsewhere, and see monthly payments and the total cost of each option.',
  keywords: ['rebate vs low apr', 'cash rebate or low interest', '0 apr or rebate calculator', 'car rebate vs financing', 'dealer financing vs bank loan', 'should i take the rebate'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'price', label: 'Price', type: 'number', prefix: '$', default: 30000, min: 0, step: 500, info: 'Price of the vehicle or item before the rebate.' },
    { id: 'down', label: 'Down payment', type: 'number', prefix: '$', default: 3000, min: 0, step: 500, optional: true, info: 'Cash you pay up front in both options.' },
    { id: 'months', label: 'Loan term', type: 'number', default: 60, min: 1, step: 1, suffix: 'months', info: 'Same term for both options.' },
    { id: 'rebate', label: 'Cash rebate', type: 'number', prefix: '$', default: 2000, min: 0, step: 100, info: 'The rebate you get if you decline the special rate.' },
    { id: 'dealerApr', label: 'Dealer APR (without rebate)', type: 'number', suffix: '%', default: 0, min: 0, step: 0.1, optional: true, info: 'The special rate on offer. 0 is allowed.' },
    { id: 'bankApr', label: 'Your bank or credit union APR (with rebate)', type: 'number', suffix: '%', default: 6, min: 0, step: 0.1, info: 'The rate you can get yourself.' },
  ],
  outputs: [
    { id: 'diff', label: 'Cheaper option saves', format: 'currency', precision: 2, primary: true, info: 'Absolute difference in total cost between the two options.' },
    { id: 'payA', label: 'Dealer APR: monthly payment', format: 'currency', precision: 2, info: 'Loan on (price − down) at the dealer APR.' },
    { id: 'payB', label: 'Rebate + bank loan: monthly payment', format: 'currency', precision: 2, info: 'Loan on (price − down − rebate) at your bank APR.' },
    { id: 'totalA', label: 'Dealer APR: total cost', format: 'currency', precision: 2, info: 'All payments plus the down payment.' },
    { id: 'totalB', label: 'Rebate + bank loan: total cost', format: 'currency', precision: 2, info: 'All payments plus the down payment.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const down = num(v.down) ?? 0;
    const n = num(v.months);
    const rebate = num(v.rebate);
    const aprA = num(v.dealerApr) ?? 0;
    const aprB = num(v.bankApr);
    if (price === null || n === null || rebate === null || aprB === null) return { diff: null };
    if (price <= 0 || down < 0 || n < 1 || rebate < 0 || aprA < 0 || aprB < 0) return { diff: null };
    const loanA = price - down;
    const loanB = price - down - rebate;
    if (loanA <= 0 || loanB < 0) return { diff: null, error: 'The down payment and rebate must leave something to finance.' };
    const payA = pmt(loanA, aprA, n);
    const payB = pmt(loanB, aprB, n);
    const totalA = payA * n + down;
    const totalB = payB * n + down;
    const diff = Math.abs(totalA - totalB);
    const winner = totalA < totalB ? 'the dealer APR' : totalB < totalA ? 'the rebate with your own loan' : 'neither option';
    return {
      diff,
      payA,
      payB,
      totalA,
      totalB,
      tone: 'ok',
      badge: diff < 0.005 ? 'Dead heat' : `${winner} saves ${money(diff)}`,
      note: `Dealer APR: ${money(payA)} a month, ${money(totalA)} in total. Rebate and your own loan: ${money(payB)} a month, ${money(totalB)} in total. On these numbers ${winner} costs less${diff < 0.005 ? '' : ` by ${money(diff)}`}. Taxes, fees and trade-ins are ignored.`,
      chart: {
        type: 'bar',
        title: 'Total cost of each option',
        categories: ['Dealer APR', 'Rebate + own loan'],
        series: [{ name: 'Total cost', values: [totalA, totalB] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Dealer: ${money(loanA)} at ${aprA}% over ${n} months = ${money(payA)} a month; total ${money(payA)} × ${n} + ${money(down)} = ${money(totalA)}`,
        `Rebate: ${money(loanB)} at ${aprB}% over ${n} months = ${money(payB)} a month; total ${money(payB)} × ${n} + ${money(down)} = ${money(totalB)}`,
      ],
    };
  },
  content: {
    formula: [
      'Payment = P × i ÷ (1 − (1 + i)^−n), with i = APR ÷ 12 (P ÷ n at 0%)',
      'Option A: finance price − down at the dealer APR',
      'Option B: finance price − down − rebate at your bank APR',
      'Total cost = payment × n + down payment',
    ],
    body: [
      'Dealers often let you pick between a special low rate and a cash rebate, but not both. The rebate shrinks the loan, while the low rate shrinks the interest. Which wins depends on the two rates, the term and the size of the rebate.',
      'Example: a $30,000 price, $3,000 down, 60 months and a $2,000 rebate. Option A at 0% finances $27,000: $450.00 a month, $30,000 in total. Option B finances $25,000 at 6%: $483.32 a month, so $28,999.20 in loan payments and $31,999.20 in total. The 0% offer is cheaper by about $2,000.',
      'Both options use the same term and down payment. Sales tax, fees, trade-ins and credit approval are not modelled, and the rate you actually get depends on your credit. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Should I take the rebate or the low APR?', a: 'Compare total cost. In the example, 0% on $27,000 costs $30,000 in total against $31,999.20 for the rebate with a 6% loan, so the low APR wins by about $2,000.' },
      { q: 'How do I compare the two offers?', a: 'Finance price minus down at the dealer APR for option A, and price minus down minus rebate at your own APR for option B. Compare payments times months plus the down payment.' },
      { q: 'When does the rebate win?', a: 'When your own rate is low, the term is short, or the rebate is large relative to the loan. Try different rates above.' },
      { q: 'Does this include tax and fees?', a: 'No. Sales tax, fees and trade-ins are ignored, so treat the result as a comparison, not a quote.' },
    ],
    sources: [],
  },
  related: ['auto-loan', 'loan', 'apr', 'subscription-cost', 'hours-of-work-cost'],
  examples: [
    // A: 27000/60 = 450; total 27000+3000 = 30000. B: 25000 at 6%: 483.3200; total 28999.2+3000 = 31999.2; diff 1999.2
    { values: { price: 30000, down: 3000, months: 60, rebate: 2000, dealerApr: 0, bankApr: 6 }, expect: { payA: 450, totalA: 30000, payB: 483.32, totalB: 31999.2, diff: 1999.2 }, tolerance: 0.1 },
    // same rates, no rebate: identical, diff 0
    { values: { price: 10000, down: 0, months: 24, rebate: 0, dealerApr: 5, bankApr: 5 }, expect: { diff: 0 }, tolerance: 1e-6 },
  ],
});
