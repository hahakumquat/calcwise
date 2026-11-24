import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment } from '../../lib/helpers/finance';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'car-loan-interest-deduction',
  title: 'Car Loan Interest Deduction Calculator',
  category: 'finance',
  description: 'Estimate the car loan interest you paid in a year, the deduction after the cap and income phase-out, and the income tax it saves. Limits are editable inputs.',
  keywords: ['car loan interest deduction calculator', 'auto loan interest tax deduction', 'how much will the car loan interest deduction save me', 'new car loan interest deduction 2026', 'deductible auto loan interest'],
  updated: '2026-11-24',
  inputs: [
    { id: 'loan', label: 'Original loan amount', type: 'number', prefix: '$', default: 40000, min: 0, step: 1000, info: 'The amount you borrowed.' },
    { id: 'apr', label: 'Interest rate (APR)', type: 'number', suffix: '%', default: 7, min: 0, max: 40, step: 0.1, info: 'The annual rate on your loan.' },
    { id: 'term', label: 'Loan term', type: 'number', suffix: 'months', default: 60, min: 1, max: 120, step: 1, info: 'Total number of monthly payments.' },
    { id: 'prior', label: 'Payments made before this tax year', type: 'number', suffix: 'months', default: 0, min: 0, max: 119, step: 1, info: '0 if the loan started this year or you are looking at its first year.' },
    { id: 'months', label: 'Payments in this tax year', type: 'number', suffix: 'months', default: 12, min: 1, max: 12, step: 1, info: 'Use fewer than 12 if the loan began partway through the year.' },
    { id: 'cap', label: 'Deduction cap', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The yearly limit as reported. Check the IRS page before relying on it.' },
    { id: 'income', label: 'Modified adjusted gross income', type: 'number', prefix: '$', default: 70000, min: 0, step: 5000, info: 'Your income for the phase-out test.' },
    { id: 'threshold', label: 'Phase-out starts at', type: 'number', prefix: '$', default: 100000, min: 0, step: 5000, info: '$100,000 reported for single filers, $200,000 for joint. Confirm yours.' },
    { id: 'step', label: 'Reduction per $1,000 over', type: 'number', prefix: '$', default: 200, min: 0, step: 10, info: 'How much the deduction drops for each $1,000 (or part) over the threshold.' },
    { id: 'taxRate', label: 'Your marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 50, step: 1, info: 'Your federal bracket. Turns the deduction into income tax saved.' },
  ],
  outputs: [
    { id: 'saved', label: 'Estimated income tax saved', format: 'currency', primary: true, info: 'Deduction × marginal rate.' },
    { id: 'interest', label: 'Loan interest paid this year', format: 'currency', info: 'Interest in the payments you made this tax year.' },
    { id: 'deduction', label: 'Deduction after cap and phase-out', format: 'currency', info: 'Smaller of interest and cap, minus any phase-out.' },
    { id: 'payment', label: 'Monthly payment', format: 'currency', info: 'Level payment that pays off the loan over the term.' },
  ],
  compute: (v) => {
    const loan = num(v.loan), apr = num(v.apr), term = num(v.term), prior = num(v.prior), months = num(v.months);
    const cap = num(v.cap), inc = num(v.income), th = num(v.threshold), st = num(v.step), t = num(v.taxRate);
    if ([loan, apr, term, prior, months, cap, inc, th, st, t].some((x) => x === null)) return { saved: null };
    if ([loan, apr, term, prior, months, cap, inc, th, st, t].some((x) => (x as number) < 0)) return { saved: null, error: 'Values cannot be negative.' };
    if ((t as number) > 50) return { saved: null, error: 'Enter a tax rate of 50% or less.' };
    const n = Math.round(term as number), k = Math.round(prior as number), m = Math.round(months as number);
    if (n < 1) return { saved: null, error: 'Loan term must be at least 1 month.' };
    if (m < 1 || m > 12) return { saved: null, error: 'Payments in the tax year must be between 1 and 12.' };
    if (k >= n) return { saved: null, error: 'Payments made before this year must be fewer than the loan term.' };
    const pmt = amortizedPayment(loan as number, apr as number, n);
    const r = (apr as number) / 100 / 12;
    let bal = loan as number;
    for (let i = 0; i < k; i++) bal -= pmt - bal * r;
    let interest = 0;
    const last = Math.min(k + m, n);
    for (let i = k; i < last; i++) {
      const int = bal * r;
      interest += int;
      bal -= pmt - int;
    }
    const capped = Math.min(interest, cap as number);
    const over = Math.max(0, (inc as number) - (th as number));
    const reduction = Math.ceil(over / 1000) * (st as number);
    const deduction = Math.max(0, capped - reduction);
    const saved = deduction * (t as number) / 100;
    return {
      saved, interest, deduction, payment: pmt,
      tone: saved > 0 ? 'good' : 'warn',
      badge: saved > 0 ? `Deduction ${usd(deduction)}, tax saved ${usd(saved)}` : 'No deduction at these numbers',
      chart: {
        type: 'bar',
        title: 'From interest to tax saved',
        categories: ['Interest paid', 'Deduction', 'Tax saved'],
        series: [{ name: 'Amount', values: [interest, deduction, saved] }],
        format: { format: 'currency' },
      },
      steps: [
        `Monthly payment: ${usd(pmt)}`,
        `Interest in payments ${k + 1} to ${last}: ${usd(interest)}`,
        `Capped at ${usd(cap as number)}: ${usd(capped)}`,
        `Phase-out: ${usd(reduction)}, so deduction = ${usd(deduction)}`,
        `Tax saved: ${usd(deduction)} × ${t}% = ${usd(saved)}`,
      ],
      note: 'The cap, income limit and phase-out rate are inputs because they depend on your filing status and the final IRS rules. Whether your vehicle and loan qualify (for example, new, assembled in the US, loan taken out in 2025 or later) is not checked here. Check irs.gov. This is arithmetic, not tax advice.',
    };
  },
  content: {
    formula: [
      'Monthly payment = loan × r ÷ (1 − (1 + r)^−term), where r = APR ÷ 12',
      'Interest in a month = remaining balance × r; sum the months paid this tax year',
      'Deduction = max(0, min(interest, cap) − reduction per $1,000 × each $1,000 of income over the threshold, rounded up)',
      'Income tax saved = deduction × marginal tax rate',
    ],
    body: [
      'Recent federal law lets some buyers of qualifying new vehicles deduct interest on the loan, up to a yearly cap, with the deduction shrinking at higher incomes. Because it lowers taxable income, it saves your marginal rate times the deductible amount.',
      'Enter the loan, rate and term. The calculator builds the payment schedule, adds up the interest in the payments you made this tax year, applies the cap and any income phase-out, and shows the tax saved. For a later year of the loan, enter how many payments you made before it.',
      'The rules are new, so every limit is editable. Whether your car and loan qualify is not checked here. Read the IRS page linked below first.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A $40,000 loan at 7% over 60 months has a payment of $792.05. Interest in the first 12 payments is $2,580.66. Income of $70,000 is under $100,000, so the deduction is the full $2,580.66. At 22% that saves $567.74.' },
      { q: 'Does the deduction shrink in later years?', a: 'Yes, because interest falls as you pay down the balance. In the same loan, payments 13 to 24 carry $2,080.13 of interest. Set payments made before this year to 12 to see it.' },
      { q: 'How does the phase-out work here?', a: 'For each $1,000 (or part) of income over the threshold, the deduction drops by the reduction amount. At $105,500 with a $100,000 threshold and $200 per $1,000, that is 6 × $200 = $1,200.' },
      { q: 'Does my car qualify?', a: 'This calculator does not check. The reported rules cover certain new vehicles and loans, so confirm yours on the IRS page.' },
    ],
    sources: [
      { label: 'IRS: Tax information on tips and overtime deductions', url: 'https://www.irs.gov/node/157206' },
    ],
  },
  related: ['auto-loan', 'tips-deduction', 'overtime-deduction'],
  examples: [
    // pmt 792.0479; interest months 1-12 = 12*pmt-(P-bal12)=2580.6569; saved 2580.6569*.22=567.7445
    { values: { loan: 40000, apr: 7, term: 60, prior: 0, months: 12, cap: 10000, income: 70000, threshold: 100000, step: 200, taxRate: 22 }, expect: { saved: 567.74, interest: 2580.66, deduction: 2580.66, payment: 792.05 }, tolerance: 0.01 },
    // cap 2000; over 5500 -> 6*200=1200; deduction 800; saved 800*.24=192
    { values: { loan: 40000, apr: 7, term: 60, prior: 0, months: 12, cap: 2000, income: 105500, threshold: 100000, step: 200, taxRate: 24 }, expect: { saved: 192, interest: 2580.66, deduction: 800 }, tolerance: 0.01 },
    // months 13-24 interest 2080.1262; saved *.22=457.6278
    { values: { loan: 40000, apr: 7, term: 60, prior: 12, months: 12, cap: 10000, income: 70000, threshold: 100000, step: 200, taxRate: 22 }, expect: { interest: 2080.13, deduction: 2080.13, saved: 457.63 }, tolerance: 0.01 },
  ],
});
