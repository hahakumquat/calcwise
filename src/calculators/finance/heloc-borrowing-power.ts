import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, amortizedPayment } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'heloc-borrowing-power',
  title: 'HELOC Borrowing Power Calculator',
  category: 'finance',
  description: 'See how much you could borrow with a home equity loan or HELOC from your home value, mortgage balance and a lender CLTV limit, plus the monthly payment.',
  keywords: ['heloc calculator', 'home equity loan calculator', 'how much can i borrow home equity', 'heloc borrowing power', 'cltv limit'],
  updated: '2026-11-18',
  inputs: [
    { id: 'value', label: 'Home value', type: 'number', prefix: '$', default: 400000, min: 0, step: 5000, info: 'Your estimate of what the home would sell for today.' },
    { id: 'balance', label: 'Mortgage balance', type: 'number', prefix: '$', default: 250000, min: 0, step: 5000, info: 'What you still owe on loans secured by the home.' },
    { id: 'cltv', label: 'Lender CLTV limit', type: 'number', suffix: '%', default: 85, min: 1, max: 100, step: 1, info: 'Maximum combined loan-to-value the lender allows. Many lenders use 80-90%; ask yours.' },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 8, min: 0, step: 0.1, info: 'Annual rate on the new loan.' },
    { id: 'years', label: 'Repayment term', type: 'number', suffix: 'years', default: 10, min: 1, max: 30, step: 1, info: 'Years over which the amount is paid back.' },
  ],
  outputs: [
    { id: 'maxBorrow', label: 'Most you could borrow', format: 'currency', precision: 0, primary: true, info: 'Home value × CLTV limit − current balance.' },
    { id: 'equity', label: 'Home equity today', format: 'currency', precision: 0, info: 'Home value minus mortgage balance.' },
    { id: 'currentLtv', label: 'Current LTV', format: 'percent', precision: 2, info: 'Mortgage balance ÷ home value.' },
    { id: 'payment', label: 'Monthly payment (repaid over term)', format: 'currency', precision: 0, info: 'Fixed payment that pays the full amount back over the term.' },
    { id: 'interestOnly', label: 'Interest-only payment', format: 'currency', precision: 0, info: 'Amount × rate ÷ 12, which many HELOCs charge during the draw period.' },
  ],
  compute: (v) => {
    const value = num(v.value) ?? 0, bal = num(v.balance) ?? 0, cltv = num(v.cltv) ?? 0;
    const rate = num(v.rate) ?? 0, years = num(v.years) ?? 0;
    if (value <= 0) return { maxBorrow: null, error: 'Enter a home value above zero.' };
    if (cltv <= 0) return { maxBorrow: null, error: 'Enter a CLTV limit above zero.' };
    if (years <= 0) return { maxBorrow: null, error: 'Enter a repayment term above zero.' };
    const cap = value * cltv / 100;
    const maxB = Math.max(0, cap - bal);
    const equity = value - bal;
    const ltv = bal / value * 100;
    const pay = maxB > 0 ? amortizedPayment(maxB, rate, Math.round(years * 12)) : 0;
    const io = maxB * rate / 100 / 12;
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Your home: what is used and what is available',
      categories: ['Mortgage balance', 'Could borrow', 'Left unborrowable'],
      series: [{ name: 'Amount', values: [Math.round(bal), Math.round(maxB), Math.round(Math.max(0, value - Math.max(bal, cap)))] }],
      format: { format: 'currency' },
      highlight: 1,
    };
    return {
      chart,
      maxBorrow: maxB,
      equity,
      currentLtv: ltv,
      payment: pay,
      interestOnly: io,
      note: maxB > 0
        ? 'This is a ceiling, not an offer. Lenders also check credit, income and debt, and they may use their own appraisal. A home equity loan puts your home at risk if you cannot repay.'
        : 'At this CLTV limit there is no room to borrow. A lower balance or a higher home value would open some up.',
      steps: [
        `Loan cap = ${money(value, 0)} × ${cltv}% = ${money(cap, 0)}`,
        `Most you could borrow = ${money(cap, 0)} − ${money(bal, 0)} = ${money(maxB, 0)}`,
        `Payment over ${years} years at ${rate}% = ${money(pay, 0)} a month`,
      ],
    };
  },
  content: {
    formula: ['Most you could borrow = home value × CLTV limit − mortgage balance', 'Interest-only payment = amount × annual rate ÷ 12', 'Monthly payment = standard amortized payment over the term'],
    body: [
      'A home equity loan or HELOC lets you borrow against the part of your home you own. Lenders do not allow you to borrow all of it. They cap the combined loan-to-value (CLTV), which counts your mortgage plus the new loan, often at 80-90% of the home value.',
      'This calculator takes the home value times that limit and subtracts what you owe. What is left is the most you could borrow. It then shows two payments: one that repays the full amount over your term, and the interest-only payment many HELOCs ask for during the draw period.',
      'Your real limit can be lower. Lenders check credit score, income, other debts and their own appraisal. Borrowing against your home puts it at risk if you fall behind, so borrow only what you need.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: ['A home is worth $400,000 and the mortgage balance is $250,000. With an 85% CLTV limit, the cap is $340,000, so you could borrow up to $90,000. At 8% over 10 years the payment is about $1,092 a month. Interest-only would be $600 a month.'],
      },
    ],
    faq: [
      { q: 'How much can I borrow with a HELOC?', a: 'Multiply your home value by the lender\'s CLTV limit, then subtract your mortgage balance. $400,000 × 85% − $250,000 = $90,000.' },
      { q: 'What is CLTV?', a: 'Combined loan-to-value is all loans secured by the home divided by its value. It includes your mortgage and the new loan.' },
      { q: 'What is the difference between a HELOC and a home equity loan?', a: 'A home equity loan pays a lump sum with fixed payments. A HELOC is a revolving line of credit you draw on, usually with a variable rate and interest-only payments during the draw period.' },
      { q: 'Why is the monthly payment higher than interest-only?', a: 'Interest-only payments do not reduce the balance. The full payment also pays back the principal over the term.' },
    ],
    sources: [{ label: 'CFPB: What is a home equity line of credit (HELOC)?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-home-equity-line-of-credit-heloc-en-1953/' }],
  },
  related: ['ltv-ratio', 'mortgage', 'refinance'],
  examples: [
    // cap 340000; borrow 90000; equity 150000; ltv 62.5; pmt 1091.948349; io 600
    { values: { value: 400000, balance: 250000, cltv: 85, rate: 8, years: 10 }, expect: { maxBorrow: 90000, equity: 150000, currentLtv: 62.5, payment: 1091.948349, interestOnly: 600 }, tolerance: 1e-4 },
    // 0% rate: cap 180000-150000=30000 over 5y=60 payments -> 500; io 0
    { values: { value: 200000, balance: 150000, cltv: 90, rate: 0, years: 5 }, expect: { maxBorrow: 30000, equity: 50000, currentLtv: 75, payment: 500, interestOnly: 0 }, tolerance: 1e-6 },
  ],
});
