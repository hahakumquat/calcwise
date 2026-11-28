import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, amortizedPayment, money, monthIdx, toMonths, yr, YEAR_S } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'student-loan-refinance',
  title: 'Student Loan Refinance Calculator',
  category: 'finance',
  description: 'Compare your current student loan with a refinance offer: new monthly payment, change per month, total interest on each, and interest saved or added.',
  keywords: ['student loan refinance calculator', 'refinance student loans', 'student loan refi savings', 'should I refinance student loans', 'student loan interest saved'],
  updated: '2026-11-28',
  inputs: [
    { id: 'balance', label: 'Loan balance', type: 'number', prefix: '$', default: 40000, min: 0, step: 500, info: 'What you owe now, from your servicer.' },
    { id: 'currentRate', label: 'Current interest rate', type: 'number', suffix: '%', default: 7, min: 0, step: 0.125, info: 'Your current rate. If you have several loans, use the weighted average.' },
    { id: 'remaining', label: 'Time left on current loan', type: 'number', unit: 'time', units: ['yr', 'mo'], defaultUnit: 'yr', default: 10, min: 0, info: 'Years or months left at your current payment.' },
    { id: 'newRate', label: 'New interest rate', type: 'number', suffix: '%', default: 5, min: 0, step: 0.125, info: 'The rate on the refinance offer.' },
    { id: 'newTerm', label: 'New loan term', type: 'number', unit: 'time', units: ['yr', 'mo'], defaultUnit: 'yr', default: 10, min: 0, info: 'The term of the new loan. A longer term lowers the payment but usually adds interest.' },
  ],
  outputs: [
    { id: 'change', label: 'Monthly payment change', format: 'currency', primary: true, help: 'Positive means the new payment is lower.', info: 'Current payment minus new payment.' },
    { id: 'currentPayment', label: 'Current monthly payment', format: 'currency', info: 'Worked out from the balance, rate and time left.' },
    { id: 'newPayment', label: 'New monthly payment', format: 'currency', info: 'Worked out from the same balance at the new rate and term.' },
    { id: 'currentInterest', label: 'Total interest, current loan', format: 'currency', info: 'Interest you would pay by keeping the current loan to the end.' },
    { id: 'newInterest', label: 'Total interest, new loan', format: 'currency', info: 'Interest over the full new term.' },
    { id: 'saved', label: 'Interest saved', format: 'currency', help: 'Negative means the refinance adds interest.', info: 'Current total interest minus new total interest.' },
  ],
  compute: (v) => {
    const balance = num(v.balance), r1 = num(v.currentRate), r2 = num(v.newRate);
    const remS = num(v.remaining), newS = num(v.newTerm);
    if (balance === null || r1 === null || r2 === null || remS === null || newS === null) return { change: null };
    if (balance <= 0 || r1 < 0 || r2 < 0) return { change: null };
    const n1 = toMonths(remS), n2 = toMonths(newS);
    if (n1 <= 0 || n2 <= 0) return { change: null, error: 'Loan terms must be at least one month.' };
    const p1 = amortizedPayment(balance, r1, n1);
    const p2 = amortizedPayment(balance, r2, n2);
    const i1 = p1 * n1 - balance;
    const i2 = p2 * n2 - balance;
    const saved = i1 - i2;
    const change = p1 - p2;
    const idx = monthIdx(Math.max(n1, n2));
    const cum = idx.map((m) => p1 * Math.min(m, n1) - p2 * Math.min(m, n2));
    return {
      change, currentPayment: p1, newPayment: p2, currentInterest: i1, newInterest: i2, saved,
      tone: saved > 0 ? 'good' : saved < 0 ? 'warn' : 'ok',
      badge: saved > 0 ? `Saves ${money(saved, 0)} in interest` : saved < 0 ? `Adds ${money(-saved, 0)} in interest` : 'Same total interest',
      chart: [
        { type: 'bar', title: 'Total interest', categories: ['Current loan', 'Refinanced'], series: [{ name: 'Interest', values: [i1, i2] }], format: CURRENCY, highlight: 1 },
        { type: 'line', title: 'Cumulative payments saved', x: idx.map(yr), xLabel: 'Years', yFormat: CURRENCY, series: [{ name: 'Paid less so far', values: cum }] },
      ],
      steps: [
        `Current: ${money(balance, 0)} at ${r1}% over ${n1} months = ${money(p1)}/month`,
        `New: ${money(balance, 0)} at ${r2}% over ${n2} months = ${money(p2)}/month`,
        `Monthly change = ${money(p1)} − ${money(p2)} = ${money(change)}`,
        `Interest: ${money(p1)} × ${n1} − ${money(balance, 0)} = ${money(i1)} (current); ${money(p2)} × ${n2} − ${money(balance, 0)} = ${money(i2)} (new)`,
        `Interest saved = ${money(i1)} − ${money(i2)} = ${money(saved)}`,
      ],
      note: 'Warning: refinancing federal student loans with a private lender permanently gives up federal protections, including income-driven repayment, forbearance and deferment options, and loan forgiveness programs. It cannot be undone. Fees, rate type (fixed or variable) and any co-signer terms are not included. Not financial advice.',
    };
  },
  content: {
    formula: [
      'Payment = balance × r ÷ (1 − (1 + r)^−n), with r = annual rate ÷ 12 and n = months',
      'Total interest = payment × n − balance',
      'Interest saved = current total interest − new total interest',
    ],
    body: [
      'Refinancing swaps your student loan for a new one, ideally at a lower rate. This calculator runs your balance through both loans and shows the payment, the monthly change and the total interest on each.',
      'The term matters as much as the rate. A lower rate over the same term saves interest. A longer term lowers the payment but can cost more in total, which the interest saved line shows as a negative number.',
      'Before you refinance federal loans with a private lender, know that you permanently lose federal protections: income-driven repayment, forbearance and deferment options, and forgiveness programs. Private-to-private refinancing does not carry that trade-off.',
    ],
    sections: [
      {
        heading: 'What this leaves out',
        paragraphs: ['Origination fees, a variable rate that can rise, autopay discounts, and any co-signer release terms are not included. Compare real offers and read the loan terms.'],
      },
    ],
    faq: [
      { q: 'What does refinancing $40,000 from 7% to 5% over 10 years save?', a: 'The payment falls from $464.43 to $424.26, a drop of $40.17 a month. Total interest falls from $15,732.07 to $10,911.45, saving $4,820.62.' },
      { q: 'What if I stretch the new loan to 15 years at 5%?', a: 'The payment drops to $316.32, which is $148.12 a month less, but total interest rises to $16,937.14 against $15,732.07. That adds $1,205.07 in interest.' },
      { q: 'Should I refinance federal loans?', a: 'Only after weighing what you give up. A private refinance ends access to income-driven repayment, federal forbearance and deferment, and forgiveness programs, and it cannot be reversed.' },
      { q: 'Does this include fees?', a: 'No. If your lender charges an origination fee, add it to your cost when comparing offers.' },
    ],
    sources: [
      { label: 'Federal Student Aid: Student loan consolidation and refinancing', url: 'https://studentaid.gov/' },
    ],
  },
  related: ['student-loan-payoff', 'idr-student-loan-payment', 'refinance', 'loan-comparison', 'student-loan-interest-deduction'],
  examples: [
    { // 40,000 at 7%/120: 464.4339; at 5%/120: 424.2621; interest 55,732.07-40,000 = 15,732.07 vs 50,911.45-40,000 = 10,911.45.
      values: { balance: 40000, currentRate: 7, remaining: 10 * YEAR_S, newRate: 5, newTerm: 10 * YEAR_S },
      expect: { currentPayment: 464.4339, newPayment: 424.2621, change: 40.1719, currentInterest: 15732.07, newInterest: 10911.45, saved: 4820.62 },
      tolerance: 0.001,
    },
    { // 5%/180: 316.3175; interest 56,937.14-40,000 = 16,937.14; saved 15,732.07-16,937.14 = -1,205.07.
      values: { balance: 40000, currentRate: 7, remaining: 10 * YEAR_S, newRate: 5, newTerm: 15 * YEAR_S },
      expect: { newPayment: 316.3175, change: 148.1165, newInterest: 16937.14, saved: -1205.07 },
      tolerance: 0.001,
    },
  ],
});
