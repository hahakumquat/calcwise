import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, money } from '../../lib/helpers/finance';

/** Pay a fixed amount each month until the balance is gone. Returns months and total paid. */
function payoff(balance: number, ratePct: number, payment: number) {
  const r = ratePct / 100 / 12;
  let bal = balance;
  let paid = 0;
  let months = 0;
  const balances = [balance];
  while (bal > 0.005 && months < 1200) {
    const interest = bal * r;
    const pay = Math.min(payment, bal + interest);
    bal = bal + interest - pay;
    paid += pay;
    months += 1;
    balances.push(Math.max(bal, 0));
  }
  return { months, paid, balances };
}

export default defineCalculator({
  slug: 'extra-mortgage-payment',
  title: 'Extra Mortgage Payment Calculator',
  category: 'finance',
  description: 'See how much interest and how many months you save by paying extra on your mortgage each month, from your balance, rate and years left.',
  keywords: ['extra mortgage payment calculator', 'pay off mortgage early', 'mortgage extra payment', 'how much interest will i save paying extra', 'mortgage payoff calculator'],
  inputs: [
    { id: 'balance', label: 'Current loan balance', type: 'number', prefix: '$', default: 250000, min: 0, step: 1000, info: 'What you still owe, from your latest mortgage statement.' },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 6, min: 0, max: 30, step: 0.125, info: 'The yearly rate on your loan.' },
    { id: 'years', label: 'Years left on the loan', type: 'number', default: 30, min: 1, max: 40, step: 1, info: 'Years remaining on your current schedule.' },
    { id: 'extra', label: 'Extra paid each month', type: 'number', prefix: '$', default: 200, min: 0, step: 25, help: 'Goes entirely to principal.', info: 'Extra on top of your normal payment. Tell your lender to apply it to principal.' },
  ],
  outputs: [
    { id: 'saved', label: 'Interest saved', format: 'currency', precision: 0, primary: true, info: 'Interest on the normal schedule minus interest with the extra payment.' },
    { id: 'monthsSaved', label: 'Months sooner', format: 'integer', suffix: 'months', info: 'Scheduled payments minus payments needed with the extra.' },
    { id: 'payment', label: 'Normal monthly payment (P&I)', format: 'currency', info: 'Principal and interest only, no taxes or insurance.' },
    { id: 'newMonths', label: 'Payments needed with extra', format: 'integer', info: 'Number of monthly payments until the loan is paid off. The last one may be smaller.' },
    { id: 'interestNow', label: 'Interest on normal schedule', format: 'currency', precision: 0, info: 'Total interest if you only pay the scheduled amount.' },
    { id: 'interestNew', label: 'Interest with extra', format: 'currency', precision: 0, info: 'Total interest with the extra payment each month.' },
  ],
  compute: (v) => {
    const balance = num(v.balance), rate = num(v.rate), years = num(v.years), extra = num(v.extra) ?? 0;
    if (balance === null || rate === null || years === null) return { saved: null };
    if (balance <= 0 || rate < 0 || years < 1 || extra < 0) return { saved: null };
    const n = Math.round(years * 12);
    const payment = amortizedPayment(balance, rate, n);
    const base = payoff(balance, rate, payment);
    const fast = payoff(balance, rate, payment + extra);
    const interestNow = base.paid - balance;
    const interestNew = fast.paid - balance;
    const len = Math.max(base.balances.length, fast.balances.length);
    const idx = Array.from({ length: Math.ceil((len - 1) / 12) + 1 }, (_, i) => i);
    const at = (arr: number[], y: number) => arr[Math.min(y * 12, arr.length - 1)];
    return {
      saved: interestNow - interestNew,
      monthsSaved: base.months - fast.months,
      payment,
      newMonths: fast.months,
      interestNow,
      interestNew,
      chart: {
        type: 'line',
        title: 'Loan balance by year',
        x: idx,
        xLabel: 'Year',
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: 'Normal schedule', values: idx.map((y) => at(base.balances, y)) },
          { name: 'With extra payment', values: idx.map((y) => at(fast.balances, y)) },
        ],
      },
      steps: [
        `Normal payment = ${money(payment)} for ${n} months, interest ${money(interestNow, 0)}`,
        `With ${money(extra, 0)} extra: ${fast.months} months, interest ${money(interestNew, 0)}`,
      ],
    };
  },
  content: {
    formula: ['Payment = balance × r ÷ (1 − (1 + r)⁻ⁿ), with r the monthly rate and n the months left', 'With extra: pay payment + extra each month until the balance reaches 0'],
    body: [
      'Extra money paid toward a mortgage goes straight to principal, so the next month’s interest is charged on a smaller balance. The saving compounds: the earlier the extra is paid, the more interest it removes.',
      'Take $250,000 at 6% with 30 years left. The normal payment is $1,498.88 and the total interest is about $289,595. Adding $200 a month pays the loan off in 267 months instead of 360, and cuts the interest by about $86,233.',
      'This assumes a fixed rate, extra payments every month from now, and that your lender applies the extra to principal. Check for prepayment penalties first, and compare against other uses of the money, such as paying off higher-rate debt or investing. Taxes and insurance are not included.',
    ],
    faq: [
      { q: 'How much does an extra $200 a month save?', a: 'On $250,000 at 6% with 30 years left, it saves about $86,233 of interest and 93 months.' },
      { q: 'Should I pay extra on my mortgage or invest?', a: 'It depends on your rate and risk. Paying extra is a guaranteed return equal to your mortgage rate, so it tends to look better when the rate is high. This calculator only shows the mortgage side.' },
      { q: 'Does the extra go to principal?', a: 'Only if you tell your lender to apply it that way. Check your statement after the first extra payment.' },
    ],
  },
  related: ['mortgage', 'refinance', 'loan'],
  examples: [
    { values: { balance: 250000, rate: 6, years: 30, extra: 200 }, expect: { payment: 1498.88, newMonths: 267, monthsSaved: 93, interestNow: 289595.47, interestNew: 203362.51, saved: 86232.96 }, tolerance: 1e-2 },
    { values: { balance: 250000, rate: 6, years: 30, extra: 0 }, expect: { saved: 0, monthsSaved: 0 }, tolerance: 1e-2 },
  ],
});
