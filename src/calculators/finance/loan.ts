import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'loan',
  title: 'Loan Calculator',
  category: 'finance',
  description: 'Work out the monthly payment, total interest and total cost of a fixed-rate loan.',
  keywords: ['monthly payment', 'amortization', 'personal loan', 'car loan'],
  popular: true,
  inputs: [
    { id: 'principal', label: 'Loan amount', type: 'number', prefix: '$', default: 25000, min: 0, info: 'The amount you borrow, before interest. Leave out any down payment or trade-in.' },
    { id: 'rate', label: 'Annual interest rate', type: 'number', suffix: '%', default: 7.5, min: 0, step: 0.05, info: 'The yearly interest rate on the loan (not the APR). It is divided by 12 to get the monthly rate.' },
    { id: 'term', label: 'Loan term', type: 'number', unit: 'time', units: ['mo', 'yr'], defaultUnit: 'yr', default: 5, info: 'How long you have to repay the loan. Car loans are typically 3–7 years; personal loans 1–5.' },
  ],
  outputs: [
    { id: 'payment', label: 'Monthly payment', format: 'currency', primary: true, info: 'The fixed amount you pay every month. Each payment covers that month’s interest plus some principal.' },
    { id: 'interest', label: 'Total interest', format: 'currency', info: 'Everything you pay on top of the amount borrowed over the whole term — the true cost of the loan.' },
    { id: 'total', label: 'Total of all payments', format: 'currency', info: 'Loan amount plus total interest: the sum of every monthly payment.' },
    { id: 'months', label: 'Number of payments', format: 'integer', info: 'The loan term expressed in monthly payments.' },
  ],
  compute: (v) => {
    const P = num(v.principal);
    const rate = num(v.rate);
    const termS = num(v.term);
    if (P === null || rate === null || !termS) return { payment: null };
    const n = Math.round(termS / 2629746); // seconds → months
    if (n <= 0) return { payment: null };
    const r = rate / 100 / 12;
    const payment = r === 0 ? P / n : (P * r) / (1 - (1 + r) ** -n);
    const total = payment * n;
    // Year-by-year balance and cumulative split for the chart.
    const years: number[] = [0];
    const balance: number[] = [P];
    const paidPrincipal: number[] = [0];
    const paidInterest: number[] = [0];
    let bal = P;
    let pi = 0;
    let ii = 0;
    for (let m = 1; m <= n; m++) {
      const int = bal * r;
      const prin = Math.min(bal, payment - int);
      bal -= prin;
      pi += prin;
      ii += int;
      if (m % 12 === 0 || m === n) {
        years.push(+(m / 12).toFixed(2));
        balance.push(Math.max(0, bal));
        paidPrincipal.push(pi);
        paidInterest.push(ii);
      }
    }
    return {
      chart: [
        { type: 'donut', title: 'Where your money goes', format: { format: 'currency' }, slices: [{ label: 'Principal', value: P }, { label: 'Interest', value: total - P }], centerValue: `${Math.round(((total - P) / total) * 100)}%`, centerLabel: 'is interest' },
        { type: 'area', title: 'Paid off over time', x: years, xLabel: 'Years', yFormat: { format: 'currency' }, stacked: true, series: [{ name: 'Principal paid', values: paidPrincipal }, { name: 'Interest paid', values: paidInterest }] },
        { type: 'line', title: 'Remaining balance', x: years, xLabel: 'Years', yFormat: { format: 'currency' }, series: [{ name: 'Balance', values: balance }] },
      ],
      payment,
      total,
      interest: total - P,
      months: n,
      steps: [`Monthly rate r = ${rate}% ÷ 12 = ${(r * 100).toFixed(4)}%`, `Payment = P·r ÷ (1 − (1 + r)^−n) with n = ${n}`],
    };
  },
  content: {
    formula: ['M = P · r ÷ (1 − (1 + r)^−n)', 'r = annual rate ÷ 12, n = number of monthly payments'],
    body: [
      'Most consumer loans — car loans, personal loans and mortgages — are amortizing: every monthly payment is the same, but early payments are mostly interest and later ones are mostly principal.',
      'Shortening the term raises the monthly payment but can cut total interest dramatically, because you owe interest on a smaller balance for less time.',
    ],
    faq: [
      { q: 'Why is so much of my early payment interest?', a: 'Interest is charged on the outstanding balance, which is largest at the start. As the balance shrinks, the interest part of each payment shrinks and more goes to principal.' },
      { q: 'Does this include fees or insurance?', a: 'No. Origination fees, insurance and taxes are extra. Compare loans using the APR, which folds required fees into the rate.' },
    ],
  },
  related: ['mortgage', 'compound-interest', 'apr'],
  examples: [{ values: { principal: 10000, rate: 6, term: 60 * 2629746 }, expect: { payment: 193.328 }, tolerance: 0.01 }],
});
