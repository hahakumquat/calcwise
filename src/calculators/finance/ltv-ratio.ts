import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'ltv-ratio',
  title: 'Loan-to-Value (LTV) Ratio Calculator',
  category: 'finance',
  description: 'Work out your loan-to-value ratio, combined LTV with a second loan, home equity, and how much to pay down to reach 80% LTV and drop PMI.',
  keywords: ['ltv calculator', 'loan to value ratio', 'combined ltv', 'cltv calculator', 'ltv for pmi', 'home equity calculator'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'value', label: 'Home value', type: 'number', prefix: '$', default: 400000, min: 0, step: 5000, info: 'The appraised value or purchase price. Lenders use the lower of the two when buying.' },
    { id: 'loan', label: 'Mortgage balance', type: 'number', prefix: '$', default: 340000, min: 0, step: 1000, info: 'What you owe on the main mortgage, or the amount you want to borrow.' },
    { id: 'second', label: 'Second loan or HELOC balance', type: 'number', prefix: '$', default: 20000, min: 0, step: 1000, optional: true, info: 'Any other loan secured by the home. Leave empty if none.' },
  ],
  outputs: [
    { id: 'ltv', label: 'Loan-to-value (LTV)', format: 'number', precision: 2, suffix: '%', primary: true, info: 'Mortgage balance ÷ home value.' },
    { id: 'cltv', label: 'Combined LTV (CLTV)', format: 'number', precision: 2, suffix: '%', info: '(Mortgage + second loan) ÷ home value.' },
    { id: 'equity', label: 'Home equity', format: 'currency', precision: 0, info: 'Home value minus all loans secured by it.' },
    { id: 'paydown', label: 'Pay down to reach 80% LTV', format: 'currency', precision: 0, info: 'How much to cut the main mortgage balance so LTV is 80%. Zero if already at or below 80%.' },
  ],
  compute: (v) => {
    const value = num(v.value);
    const loan = num(v.loan);
    const second = num(v.second) ?? 0;
    if (value === null || loan === null || value <= 0 || loan < 0 || second < 0) return { ltv: null };
    const ltv = (loan / value) * 100;
    const cltv = ((loan + second) / value) * 100;
    const equity = value - loan - second;
    const paydown = Math.max(0, loan - 0.8 * value);
    return {
      ltv,
      cltv,
      equity,
      paydown,
      chart: {
        type: 'bar',
        title: 'LTV vs the 80% line (%)',
        categories: ['LTV', 'CLTV', '80% target'],
        series: [{ name: 'Percent of home value', values: [ltv, cltv, 80] }],
        format: { format: 'number', precision: 1, suffix: '%' },
      },
      steps: [
        `LTV = $${fmt(loan, 0)} ÷ $${fmt(value, 0)} = ${fmt(ltv)}%`,
        `CLTV = ($${fmt(loan, 0)} + $${fmt(second, 0)}) ÷ $${fmt(value, 0)} = ${fmt(cltv)}%`,
        `Loan at 80% LTV = 0.8 × $${fmt(value, 0)} = $${fmt(0.8 * value, 0)}, so pay down $${fmt(paydown, 0)}`,
      ],
      note: ltv <= 80
        ? `Your LTV is ${fmt(ltv)}%, at or under 80%, so a lender would not usually ask for mortgage insurance on this loan.`
        : `Your LTV is ${fmt(ltv)}%. Paying the mortgage down by $${fmt(paydown, 0)} would reach 80%.`,
    };
  },
  content: {
    formula: ['LTV = mortgage balance ÷ home value × 100', 'CLTV = (all loans secured by the home) ÷ home value × 100'],
    body: [
      'Loan-to-value compares what you owe with what the home is worth. A $340,000 mortgage on a $400,000 home is 85% LTV. The lower the ratio, the more equity you have and the less risk the lender takes.',
      'Lenders often ask for private mortgage insurance (PMI) on conventional loans above 80% LTV. Paying the balance down to 80%, or the home gaining value, can get you to that line.',
      'Combined LTV (CLTV) adds a second mortgage or HELOC to the balance. Lenders look at it when you apply for a home equity loan, and many cap it at around 80-90%, though limits differ by lender and loan type.',
      'This is a general guide. Your lender decides which value it uses and what thresholds apply.',
    ],
    faq: [
      { q: 'How do you calculate LTV?', a: 'Divide the loan balance by the home value. $340,000 ÷ $400,000 = 0.85, or 85% LTV.' },
      { q: 'What is a good LTV?', a: 'Generally 80% or lower. At that level conventional lenders usually do not require PMI, and rates tend to be better.' },
      { q: 'What is the difference between LTV and CLTV?', a: 'LTV counts only the main mortgage. CLTV also counts second loans and HELOCs secured by the same home.' },
      { q: 'How much do I need to pay down to reach 80% LTV?', a: 'Subtract 80% of the home value from the mortgage balance. On a $400,000 home with $340,000 owed, 80% is $320,000, so pay down $20,000.' },
    ],
    sources: [
      { label: 'Loan-to-value ratio (Investopedia)', url: 'https://www.investopedia.com/terms/l/loantovalue.asp' },
      { label: 'What is private mortgage insurance? (CFPB)', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-private-mortgage-insurance-en-122/' },
    ],
  },
  related: ['mortgage', 'home-affordability', 'refinance', 'extra-mortgage-payment', 'debt-to-income', 'mortgage-points'],
  examples: [
    { values: { value: 400000, loan: 340000, second: 20000 }, expect: { ltv: 85, cltv: 90, equity: 40000, paydown: 20000 }, tolerance: 1e-6 },
    { values: { value: 250000, loan: 150000, second: null }, expect: { ltv: 60, cltv: 60, equity: 100000, paydown: 0 }, tolerance: 1e-6 },
  ],
});
