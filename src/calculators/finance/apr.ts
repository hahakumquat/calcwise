import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { moneyDonut } from '../../lib/helpers/finance';
import { amortizedPayment, money, MONTH_S, pct, pvAnnuity, toMonths, YEAR_S } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'apr',
  title: 'APR Calculator',
  category: 'finance',
  description: 'Find the true annual percentage rate (APR) of a loan once upfront fees are included.',
  keywords: ['annual percentage rate', 'true cost of loan', 'loan fees', 'origination fee', 'APR vs interest rate'],
  inputs: [
    { id: 'amount', label: 'Loan amount', type: 'number', prefix: '$', default: 20000, min: 0, info: 'The loan amount stated on the offer, before fees are subtracted or added.' },
    { id: 'fees', label: 'Upfront fees', type: 'number', prefix: '$', default: 600, min: 0, help: 'Origination, points, and other required finance charges.', info: 'Required upfront finance charges such as origination fees and discount points, listed on the loan disclosure.' },
    {
      id: 'feeHandling',
      info: 'Fees taken out of the money you receive, or added on top of the loan balance.',
      label: 'Fees are',
      type: 'select',
      segmented: true,
      default: 'deducted',
      options: [
        { value: 'deducted', label: 'Paid at closing' },
        { value: 'financed', label: 'Added to the loan' },
      ],
    },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 7, min: 0, step: 0.05, info: 'The nominal interest rate used to set your payment.' },
    { id: 'term', label: 'Loan term', type: 'number', unit: 'time', units: ['yr', 'mo'], defaultUnit: 'yr', default: 5, min: 0, info: 'How long you have to repay the loan.' },
  ],
  outputs: [
    { id: 'apr', label: 'APR', format: 'percent', precision: 3, primary: true, info: 'The yearly rate that makes your payments exactly repay the cash you actually received — the true cost including fees.' },
    { id: 'payment', label: 'Monthly payment', format: 'currency', info: 'Your fixed monthly payment at the stated interest rate.' },
    { id: 'interest', label: 'Total interest', format: 'currency', info: 'Interest paid over the life of the loan, not counting fees.' },
    { id: 'financeCharge', label: 'Total finance charge (interest + fees)', format: 'currency', info: 'Everything borrowing costs you: interest plus the upfront fees.' },
  ],
  compute: (v) => {
    const amount = num(v.amount);
    const fees = num(v.fees) ?? 0;
    const rate = num(v.rate);
    const termS = num(v.term);
    if (amount === null || rate === null || termS === null || amount <= 0 || rate < 0 || fees < 0) return { apr: null };
    const n = toMonths(termS);
    if (n <= 0) return { apr: null, error: 'Enter a loan term of at least one month.' };
    const financed = v.feeHandling === 'financed';
    const principal = financed ? amount + fees : amount;
    const received = financed ? amount : amount - fees;
    if (received <= 0) return { apr: null, error: 'Fees are as large as the loan itself.' };
    const payment = amortizedPayment(principal, rate, n);
    // Solve PV(payment, i, n) = cash received for the monthly rate i (PV falls as i rises).
    let lo = 0;
    let hi = 1;
    if (pvAnnuity(payment, lo, n) < received) return { apr: null, error: 'Payments are smaller than the amount received.' };
    for (let k = 0; k < 200; k++) {
      const mid = (lo + hi) / 2;
      if (pvAnnuity(payment, mid, n) > received) lo = mid;
      else hi = mid;
    }
    const apr = ((lo + hi) / 2) * 12;
    const interest = payment * n - principal;
    return {
      apr,
      payment,
      interest,
      financeCharge: payment * n - received,
      chart: [{ type: 'bar', title: 'Stated rate vs APR', categories: ['Interest rate', 'APR'], series: [{ name: 'Rate', values: [rate / 100, apr] }], format: { format: 'percent' }, highlight: 1 }, moneyDonut('Total of all payments', [{ label: 'Cash you receive', value: received }, { label: 'Interest', value: interest }, { label: 'Fees', value: fees }])],
      steps: [
        `Payment on ${money(principal)} at ${rate}% for ${n} months = ${money(payment)}`,
        `You actually receive ${money(received)}`,
        `APR is the rate i × 12 where the ${n} payments are worth exactly ${money(received)} today: ${pct(apr, 3)}`,
      ],
      note: `Fees add ${pct(apr - rate / 100, 3)} to the ${rate}% interest rate.`,
    };
  },
  content: {
    formula: ['Payment = L · r ÷ (1 − (1 + r)^−n)', 'Solve: cash received = Payment × (1 − (1 + i)^−n) ÷ i', 'APR = i × 12'],
    body: [
      'The interest rate tells you what the lender charges on the balance. The APR folds in the required upfront fees as well, so it reflects what borrowing really costs per year. In the U.S., the Truth in Lending Act requires lenders to disclose it, which makes it the best single number for comparing offers.',
      'The calculation asks: given the payments you will make, what interest rate would make them exactly repay the cash you actually get? If a $20,000 loan carries a $600 fee taken at closing, you only receive $19,400 but repay as if you borrowed $20,000 — so the effective rate is higher.',
      'Fees matter more on short loans. A fee spread over 30 years barely moves the APR, while the same fee on a two-year loan can add a full percentage point or more. If you will pay off or refinance early, the real cost of the fees is even higher than the APR suggests.',
    ],
    faq: [
      { q: 'Which fees are included in APR?', a: 'Finance charges required to get the loan: origination fees, discount points, mortgage broker fees and some closing costs. Third-party fees like appraisals, title insurance and recording fees are usually excluded on mortgages.' },
      { q: 'Is APR the same as APY?', a: 'No. APR is a simple annual rate (monthly rate × 12) used for loans. APY includes compounding and is used for savings. A 12% APR charged monthly equals about a 12.68% APY.' },
    ],
  },
  related: ['loan', 'mortgage', 'auto-loan', 'credit-card-payoff', 'refinance'],
  examples: [
    { values: { amount: 20000, fees: 0, feeHandling: 'deducted', rate: 7, term: 5 * YEAR_S }, expect: { apr: 0.07 }, tolerance: 1e-9 },
    { values: { amount: 1000, fees: 50, feeHandling: 'deducted', rate: 0, term: 12 * MONTH_S }, expect: { apr: 0.0957705 }, tolerance: 0.00001 },
    { values: { amount: 20000, fees: 600, feeHandling: 'deducted', rate: 7, term: 5 * YEAR_S }, expect: { apr: 0.0828613, payment: 396.024 }, tolerance: 0.00001 },
  ],
});
