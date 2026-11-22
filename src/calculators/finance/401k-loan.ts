import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, amortizedPayment, fvAnnuity } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: '401k-loan',
  title: '401(k) Loan True Cost Calculator',
  category: 'finance',
  description: 'See the true cost of borrowing from your 401(k): the monthly payment, the interest you pay yourself, and the market growth you give up while the money is out.',
  keywords: ['401k loan calculator', '401k loan true cost', 'borrow from 401k', '401k loan repayment', '401k loan lost growth', 'is a 401k loan a good idea'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'amount', label: 'Loan amount', type: 'number', prefix: '$', default: 20000, min: 0, step: 500, info: 'How much you borrow from your own balance.' },
    { id: 'rate', label: 'Loan interest rate', type: 'number', default: 8.5, min: 0, step: 0.25, suffix: '%', info: 'Annual rate your plan charges. The interest goes back into your own account.' },
    { id: 'years', label: 'Repayment term', type: 'number', default: 5, min: 1, step: 1, suffix: 'years', info: 'Repaid with level monthly payments.' },
    { id: 'market', label: 'Assumed market return', type: 'number', default: 10, min: 0, step: 0.5, suffix: '%', info: 'Annual return you would have earned had the money stayed invested. An assumption, not a promise.' },
  ],
  outputs: [
    { id: 'lost', label: 'Growth given up', format: 'currency', precision: 0, primary: true, info: 'Stay-invested value minus repay-path value at the end of the term. Negative means the loan comes out ahead.' },
    { id: 'payment', label: 'Monthly payment', format: 'currency', precision: 2, info: 'Level payment that repays the loan over the term.' },
    { id: 'interest', label: 'Interest paid (to yourself)', format: 'currency', precision: 2, info: 'Total payments minus the amount borrowed.' },
    { id: 'stay', label: 'If it stayed invested', format: 'currency', precision: 0, info: 'Loan amount grown at the market return for the term.' },
    { id: 'repay', label: 'Repay path', format: 'currency', precision: 0, info: 'Your monthly payments, invested at the market return, over the term.' },
  ],
  compute: (v) => {
    const P = num(v.amount);
    const r = num(v.rate);
    const y = num(v.years);
    const mk = num(v.market);
    if (P === null || r === null || y === null || mk === null) return { lost: null };
    if (P <= 0 || r < 0 || y < 1 || mk < 0) return { lost: null };
    const n = Math.round(y * 12);
    const m = mk / 100 / 12;
    const payment = amortizedPayment(P, r, n);
    const interest = payment * n - P;
    const stay = P * (1 + m) ** n;
    const repay = fvAnnuity(payment, m, n);
    const lost = stay - repay;
    const ahead = lost < 0;
    const xs: number[] = [];
    const stayVals: number[] = [];
    const repayVals: number[] = [];
    for (let yr = 0; yr * 12 <= n; yr++) {
      xs.push(yr);
      stayVals.push(P * (1 + m) ** (yr * 12));
      repayVals.push(fvAnnuity(payment, m, yr * 12));
    }
    if (n % 12 !== 0) {
      xs.push(+(n / 12).toFixed(2));
      stayVals.push(stay);
      repayVals.push(repay);
    }
    return {
      lost,
      payment,
      interest,
      stay,
      repay,
      tone: ahead ? 'good' : 'warn',
      badge: ahead ? 'Loan comes out ahead' : lost === 0 ? 'No growth lost' : 'Costs you growth',
      note: `You would pay ${money(payment)} a month and ${money(interest)} in interest, all of it back into your own account. Left invested at ${mk}% a year the ${money(P, 0)} would grow to ${money(stay, 0)}; the repayments rebuild ${money(repay, 0)}. ${ahead ? `Because the loan rate (${r}%) is higher than the assumed return (${mk}%), the loan comes out ${money(-lost, 0)} ahead.` : `That is ${money(lost, 0)} of growth given up.`} Plan limits and what happens if you leave your job vary, so check your plan before borrowing.`,
      chart: {
        type: 'line',
        title: 'Account value from this money: stay invested vs repay path',
        x: xs,
        xLabel: 'Years',
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: 'Stay invested', values: stayVals },
          { name: 'Repay path', values: repayVals },
        ],
      },
      steps: [
        `Monthly rate on the loan = ${r}% ÷ 12; payments = ${n}`,
        `Payment = P × i ÷ (1 − (1 + i)^−n) = ${money(payment)}`,
        `Interest = ${money(payment)} × ${n} − ${money(P)} = ${money(interest)}`,
        `Stay invested = ${money(P)} × (1 + ${mk}% ÷ 12)^${n} = ${money(stay, 0)}`,
        `Repay path = payment × ((1 + m)^${n} − 1) ÷ m = ${money(repay, 0)}`,
        `Growth given up = ${money(stay, 0)} − ${money(repay, 0)} = ${money(lost, 0)}`,
      ],
    };
  },
  content: {
    formula: [
      'Monthly payment = P × i ÷ (1 − (1 + i)^−n), with i the loan rate ÷ 12 and n the number of months',
      'Interest paid = payment × n − P',
      'Stay invested = P × (1 + m)^n, with m the market return ÷ 12',
      'Repay path = payment × ((1 + m)^n − 1) ÷ m',
      'Growth given up = stay invested − repay path',
    ],
    body: [
      'A 401(k) loan feels cheap because the interest goes back to you. The real cost is the growth the borrowed money would have earned had it stayed invested. This calculator compares two paths: leaving the money invested, or taking it out and rebuilding the balance with your monthly repayments.',
      'Example: borrow $20,000 at 8.5% over 5 years. The payment is $410.33 a month and you pay $4,619.84 in interest to yourself. If the $20,000 stayed invested at 10% it would grow to about $32,906. Investing the repayments instead rebuilds about $31,775, so roughly $1,131 of growth is given up.',
      'If your assumed market return is lower than the loan rate, the loan comes out ahead, because you pay yourself more than the market would have. Returns are never guaranteed, so try a few values.',
      'Plan rules differ: how much you can borrow, how long you have to repay, and what happens to the balance if you leave your job all vary by plan. Check your plan documents before borrowing. Taxes and fees are not included. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What does a 401(k) loan really cost?', a: 'The interest goes back to you, so the cost is the market growth you miss. For $20,000 at 8.5% over 5 years with a 10% assumed return, that is about $1,131.' },
      { q: 'How much are the monthly payments?', a: 'For the example, $20,000 at 8.5% over 60 months is $410.33 a month, with $4,619.84 of interest paid in total.' },
      { q: 'When does a 401(k) loan come out ahead?', a: 'When the assumed market return is lower than the loan rate. For example, $10,000 at 6% over 3 years with a 4% return gives a result of about -$343, meaning the loan comes out roughly $343 ahead.' },
      { q: 'What if I leave my job?', a: 'Rules vary by plan. Some plans require the balance to be repaid on a short timeline after you leave. Check your plan before borrowing.' },
      { q: 'How much can I borrow?', a: 'Limits are set by your plan, so they vary. Check your plan documents. This calculator does not apply any limit.' },
    ],
    sources: [],
  },
  related: ['401k-max-out', 'employer-match-calculator', 'loan', 'compound-interest', 'retirement'],
  examples: [
    // i = 0.085/12; payment = 20000*i/(1-(1+i)^-60) = 410.3306; interest = 410.3306*60 - 20000 = 4619.84
    // m = 0.10/12; stay = 20000*(1+m)^60 = 32906.18; repay = 410.3306*((1+m)^60-1)/m = 31774.80; lost = 1131.38
    { values: { amount: 20000, rate: 8.5, years: 5, market: 10 }, expect: { payment: 410.33, interest: 4619.84, stay: 32906.18, repay: 31774.8, lost: 1131.38 }, tolerance: 0.01 },
    // 10000 at 6%/36 mo: payment 304.2194, interest 951.90; stay = 10000*(1+0.04/12)^36 = 11272.72; repay = 11615.57; lost = -342.85
    { values: { amount: 10000, rate: 6, years: 3, market: 4 }, expect: { payment: 304.22, interest: 951.9, stay: 11272.72, repay: 11615.57, lost: -342.85 }, tolerance: 0.01 },
  ],
});
