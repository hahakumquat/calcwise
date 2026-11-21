import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'mortgage-interest-year',
  title: 'Mortgage Interest Paid This Year (1098 Estimate)',
  category: 'finance',
  description: 'Estimate the mortgage interest you pay in a calendar year before Form 1098 arrives. Enter your loan, rate, term and how many payments you have made.',
  keywords: ['mortgage interest paid this year', 'form 1098 mortgage interest estimate', 'mortgage interest deduction calculator', 'how much mortgage interest did i pay', 'yearly mortgage interest', 'mortgage interest for taxes'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'loan', label: 'Original loan amount', type: 'number', prefix: '$', default: 300000, min: 1, step: 1000, info: 'The amount you borrowed when the loan started.' },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 6, min: 0, max: 30, step: 0.125, info: 'Yearly rate on a fixed-rate loan. Interest is charged monthly at rate ÷ 12.' },
    { id: 'term', label: 'Loan term', type: 'number', suffix: 'years', default: 30, min: 1, max: 50, step: 1, info: 'Total length of the loan.' },
    { id: 'before', label: 'Payments made before this year', type: 'number', default: 0, min: 0, step: 1, info: 'How many monthly payments were made before January of the year you are checking. Use 0 if the loan started this year.' },
    { id: 'inYear', label: 'Payments made in the year', type: 'number', default: 12, min: 1, max: 12, step: 1, info: 'Up to 12. Use fewer if the loan started mid-year (a first payment in March means 10 payments).' },
  ],
  outputs: [
    { id: 'interest', label: 'Interest paid in the year', format: 'currency', primary: true, info: 'Sum of the interest part of each payment in the year.' },
    { id: 'principal', label: 'Principal paid in the year', format: 'currency', info: 'The part of the payments that reduced your balance.' },
    { id: 'paid', label: 'Total paid in the year', format: 'currency', info: 'Monthly payment × payments in the year.' },
    { id: 'payment', label: 'Monthly payment (principal and interest)', format: 'currency', info: 'Excludes taxes and insurance held in escrow.' },
    { id: 'endBalance', label: 'Balance at year end', format: 'currency', info: 'What you still owe after the last payment of the year.' },
  ],
  compute: (v) => {
    const loan = num(v.loan);
    const rate = num(v.rate);
    const term = num(v.term);
    const before = num(v.before);
    const inYear = num(v.inYear);
    if (loan === null || rate === null || term === null || before === null || inYear === null) return { interest: null };
    if (loan <= 0 || rate < 0 || term < 1 || before < 0 || inYear < 1 || inYear > 12) return { interest: null };
    const n = Math.round(term * 12);
    const b0 = Math.round(before);
    const k = Math.round(inYear);
    if (b0 + k > n) return { interest: null };

    const r = rate / 100 / 12;
    const pmt = amortizedPayment(loan, rate, n);
    let bal = loan;
    for (let i = 0; i < b0; i++) bal -= pmt - bal * r;
    const startBal = bal;
    const interestByMonth: number[] = [];
    let interest = 0;
    for (let i = 0; i < k; i++) {
      const int = bal * r;
      interest += int;
      interestByMonth.push(int);
      bal -= pmt - int;
    }
    if (bal < 0) bal = 0;
    const paid = pmt * k;
    const principal = paid - interest;
    const over = startBal > 750000;

    return {
      interest,
      principal,
      paid,
      payment: pmt,
      endBalance: bal,
      tone: over ? 'warn' : 'ok',
      badge: `${Math.round((interest / paid) * 100)}% of payments was interest`,
      chart: {
        type: 'bar',
        title: 'Interest in each payment of the year',
        categories: interestByMonth.map((_, i) => `#${b0 + i + 1}`),
        format: { format: 'currency' },
        series: [{ name: 'Interest', values: interestByMonth }],
      },
      steps: [
        `Payment = ${money(loan, 0)} at ${rate}% over ${n} months = ${money(pmt, 2)} a month`,
        `Balance at the start of the year (after ${b0} payments) = ${money(startBal, 2)}`,
        `Each month: interest = balance × ${+(rate / 12).toFixed(4)}%, the rest of the payment is principal`,
        `${k} payments add up to ${money(interest, 2)} interest and ${money(principal, 2)} principal`,
      ],
      note: `About ${money(interest, 0)} of your ${money(paid, 0)} in payments was interest.` +
        (over ? ' Your balance is above $750,000, and the tax deduction for home loan interest is generally limited to interest on the first $750,000 of debt (check IRS Publication 936).' : '') +
        ' This is an estimate for a fixed-rate loan with no extra payments; your lender’s Form 1098 is the number to use on a tax return.',
    };
  },
  content: {
    formula: [
      'Monthly payment = loan × r ÷ (1 − (1 + r)^−n), where r = rate ÷ 12 and n = term in months',
      'Each month: interest = balance × r, principal = payment − interest',
      'Interest for the year = the sum of the monthly interest over the payments made that year',
    ],
    body: [
      'Your lender reports the mortgage interest you paid on Form 1098, but it usually arrives in late January. This calculator estimates the same figure from your loan terms, so you can plan year-end tax moves before it shows up.',
      'Enter the original amount, the rate, the term and how many payments you made before this year. The calculator walks through the payment schedule, adds up the interest in each payment of the year and shows how much went to principal.',
      'Early in a long loan most of each payment is interest, which is why the number is large in the first years and shrinks over time.',
    ],
    sections: [
      {
        heading: 'Why the estimate can differ from your 1098',
        paragraphs: [
          'Extra principal payments, a rate change on an adjustable loan, a payment made in a different month than the due date, and points paid at closing all change the real figure. Escrow for taxes and insurance is not part of the interest. If you paid mortgage interest to buy a home this year, only part of it may be deductible, and only if you itemize, so treat the output as a planning number, not tax advice.',
        ],
      },
    ],
    faq: [
      { q: 'How much interest do I pay in year one on $300,000 at 6% for 30 years?', a: 'The payment is about $1,798.65 a month, and the first 12 payments include about $17,900 of interest and about $3,684 of principal.' },
      { q: 'Does this match Form 1098?', a: 'Only for a standard fixed-rate loan with no extra payments. Your lender’s 1098 is the official number.' },
      { q: 'What if my loan started mid-year?', a: 'Set payments in the year to the number you have made, for example 10 if your first payment was in March, and keep payments before this year at 0.' },
      { q: 'Is all mortgage interest deductible?', a: 'No. You must itemize, and the deduction is generally limited to interest on up to $750,000 of acquisition debt. See IRS Publication 936.' },
      { q: 'Does it include escrow?', a: 'No. Only principal and interest. Property tax and insurance held in escrow are separate.' },
    ],
    sources: [
      { label: 'IRS Publication 936: Home Mortgage Interest Deduction', url: 'https://www.irs.gov/publications/p936' },
    ],
  },
  related: ['mortgage', 'extra-mortgage-payment', 'biweekly-mortgage', 'mortgage-points', 'loan'],
  examples: [
    {
      // payment 1798.6515; closed form with r = 0.005: balance after 12 = P(1+r)^12 − pmt((1+r)^12 − 1)/r = 296,315.96; principal = 3,684.04; interest = 12 × pmt − principal = 17,899.78.
      values: { loan: 300000, rate: 6, term: 30, before: 0, inYear: 12 },
      expect: { payment: 1798.65, paid: 21583.82, interest: 17899.78, principal: 3684.04, endBalance: 296315.96 },
      tolerance: 1,
    },
    {
      // 0% loan: payment = 120000/120 = 1000; no interest; after 24 + 12 payments balance = 120000 − 36000.
      values: { loan: 120000, rate: 0, term: 10, before: 24, inYear: 12 },
      expect: { payment: 1000, paid: 12000, interest: 0, principal: 12000, endBalance: 84000 },
      tolerance: 0.01,
    },
  ],
});
