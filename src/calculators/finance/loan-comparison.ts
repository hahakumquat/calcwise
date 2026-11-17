import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'loan-comparison',
  title: 'Loan Comparison Calculator',
  category: 'finance',
  description: 'Compare two loan offers side by side: monthly payment, total interest and total cost including fees, so you can see which offer is really cheaper.',
  keywords: ['loan comparison calculator', 'compare two loans', 'which loan is cheaper', 'compare loan offers', 'loan total cost with fees', 'personal loan comparison'],
  inputs: [
    { id: 'amount', label: 'Amount borrowed', type: 'number', prefix: '$', default: 20000, min: 0, step: 500, info: 'The amount you borrow, the same for both offers.' },
    { id: 'rateA', label: 'Offer A interest rate', type: 'number', suffix: '%', default: 7, min: 0, max: 60, step: 0.125, info: 'Yearly interest rate for offer A. Using the APR is fine if the fee is already inside it; then leave the fee at 0.' },
    { id: 'monthsA', label: 'Offer A term (months)', type: 'number', default: 60, min: 1, max: 480, step: 1, info: 'Number of monthly payments for offer A.' },
    { id: 'feeA', label: 'Offer A upfront fee', type: 'number', prefix: '$', default: 0, min: 0, step: 50, info: 'Origination or closing fee paid in cash at the start.' },
    { id: 'rateB', label: 'Offer B interest rate', type: 'number', suffix: '%', default: 5.5, min: 0, max: 60, step: 0.125, info: 'Yearly interest rate for offer B.' },
    { id: 'monthsB', label: 'Offer B term (months)', type: 'number', default: 48, min: 1, max: 480, step: 1, info: 'Number of monthly payments for offer B.' },
    { id: 'feeB', label: 'Offer B upfront fee', type: 'number', prefix: '$', default: 400, min: 0, step: 50, info: 'Origination or closing fee paid in cash at the start.' },
  ],
  outputs: [
    { id: 'best', label: 'Cheaper overall', format: 'text', primary: true, info: 'The offer with the lower total cost (interest plus fee).' },
    { id: 'diff', label: 'Difference in total cost', format: 'currency', precision: 0, info: 'How much more the other offer costs overall.' },
    { id: 'payA', label: 'Offer A monthly payment', format: 'currency', info: 'Principal and interest each month.' },
    { id: 'payB', label: 'Offer B monthly payment', format: 'currency', info: 'Principal and interest each month.' },
    { id: 'costA', label: 'Offer A interest plus fee', format: 'currency', precision: 0, info: 'Total of all payments minus the amount borrowed, plus the fee.' },
    { id: 'costB', label: 'Offer B interest plus fee', format: 'currency', precision: 0, info: 'Total of all payments minus the amount borrowed, plus the fee.' },
  ],
  compute: (v) => {
    const amount = num(v.amount), rA = num(v.rateA), nA = num(v.monthsA), fA = num(v.feeA) ?? 0;
    const rB = num(v.rateB), nB = num(v.monthsB), fB = num(v.feeB) ?? 0;
    if (amount === null || rA === null || nA === null || rB === null || nB === null) return { best: null };
    if (amount <= 0 || rA < 0 || rB < 0 || fA < 0 || fB < 0 || nA < 1 || nB < 1 || !Number.isInteger(nA) || !Number.isInteger(nB)) return { best: null };
    const payA = amortizedPayment(amount, rA, nA);
    const payB = amortizedPayment(amount, rB, nB);
    const costA = payA * nA - amount + fA;
    const costB = payB * nB - amount + fB;
    const same = Math.abs(costA - costB) < 0.005;
    return {
      best: same ? 'About the same' : costA < costB ? 'Offer A' : 'Offer B',
      diff: Math.abs(costA - costB),
      payA,
      payB,
      costA,
      costB,
      chart: {
        type: 'bar',
        title: 'Interest plus fee (lower is better)',
        categories: ['Offer A', 'Offer B'],
        series: [{ name: 'Interest plus fee', values: [costA, costB] }],
        format: { format: 'currency', precision: 0 },
        ...(same ? {} : { highlight: costA < costB ? 0 : 1 }),
      },
      steps: [
        `A: ${money(payA)} × ${nA} − ${money(amount, 0)} + ${money(fA, 0)} fee = ${money(costA, 0)}`,
        `B: ${money(payB)} × ${nB} − ${money(amount, 0)} + ${money(fB, 0)} fee = ${money(costB, 0)}`,
      ],
    };
  },
  content: {
    formula: ['Payment = amount × r ÷ (1 − (1 + r)⁻ⁿ), r = yearly rate ÷ 12', 'Total cost = payment × n − amount + upfront fee'],
    body: [
      'The lowest monthly payment is not always the cheapest loan. A longer term lowers the payment but means more months of interest, and fees add to the cost up front. This calculator compares the full cost of two offers for the same amount.',
      'For $20,000, offer A at 7% over 60 months has a $396.02 payment and costs $3,761 in interest. Offer B at 5.5% over 48 months with a $400 fee has a $465.13 payment and costs $2,326 in interest plus $400 of fees, $2,726 in total. B has the higher payment but is about $1,035 cheaper overall.',
      'The comparison ignores that the offers last different lengths of time, so check that you can afford the higher payment. It assumes a fixed rate and no early repayment. Rates and fees are as quoted by the lender; always check the lender’s own disclosure.',
    ],
    faq: [
      { q: 'Is the lower monthly payment the better loan?', a: 'Not necessarily. A lower payment from a longer term usually means more total interest. Compare the total cost as well.' },
      { q: 'Should I enter the APR or the interest rate?', a: 'If you enter the APR, set the fee to 0 because the APR already includes it. If you enter the plain interest rate, add the fee separately.' },
      { q: 'Does it work for car loans and personal loans?', a: 'Yes, for any fixed-rate loan with equal monthly payments.' },
    ],
  },
  related: ['loan', 'apr', 'auto-loan'],
  examples: [
    { values: { amount: 20000, rateA: 7, monthsA: 60, feeA: 0, rateB: 5.5, monthsB: 48, feeB: 400 }, expect: { best: 'Offer B', payA: 396.02, payB: 465.13, costA: 3761.44, costB: 2726.22, diff: 1035.22 }, tolerance: 1e-2 },
  ],
});
