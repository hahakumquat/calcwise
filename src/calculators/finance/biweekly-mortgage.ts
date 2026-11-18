import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, money } from '../../lib/helpers/finance';

/** Pay `payment` every period at `periodRate` (a fraction) until the balance is gone. */
function payoff(balance: number, periodRate: number, payment: number, cap: number) {
  let bal = balance;
  let paid = 0;
  let periods = 0;
  while (bal > 0.005 && periods < cap) {
    const interest = bal * periodRate;
    const pay = Math.min(payment, bal + interest);
    bal = bal + interest - pay;
    paid += pay;
    periods += 1;
  }
  return { periods, paid };
}

export default defineCalculator({
  slug: 'biweekly-mortgage',
  title: 'Biweekly Mortgage Payment Calculator',
  category: 'finance',
  description: 'See how much interest and time you save by paying half your mortgage payment every two weeks instead of once a month, from your balance, rate and term.',
  keywords: ['biweekly mortgage calculator', 'bi-weekly mortgage payments', 'biweekly vs monthly mortgage', 'pay mortgage every two weeks', 'mortgage payoff calculator'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'balance', label: 'Loan balance', type: 'number', prefix: '$', default: 300000, min: 0, step: 1000, info: 'What you owe now, from your latest mortgage statement.' },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 6.5, min: 0, max: 30, step: 0.125, info: 'The yearly rate on your loan.' },
    { id: 'years', label: 'Years left on the loan', type: 'number', default: 30, min: 1, max: 40, step: 1, info: 'Years remaining on your current schedule.' },
  ],
  outputs: [
    { id: 'saved', label: 'Interest saved', format: 'currency', precision: 0, primary: true, info: 'Interest on the monthly schedule minus interest on the biweekly schedule.' },
    { id: 'yearsSooner', label: 'Paid off sooner by', format: 'number', precision: 1, suffix: 'years', info: 'Monthly schedule length minus biweekly payoff time.' },
    { id: 'monthly', label: 'Monthly payment (P&I)', format: 'currency', info: 'Principal and interest only, no taxes or insurance.' },
    { id: 'biweekly', label: 'Biweekly payment', format: 'currency', info: 'Half the monthly payment, paid every two weeks (26 times a year).' },
    { id: 'payoffYears', label: 'Biweekly payoff time', format: 'number', precision: 1, suffix: 'years', info: 'Years until the balance reaches zero paying biweekly.' },
    { id: 'interestMonthly', label: 'Interest, monthly plan', format: 'currency', precision: 0, info: 'Total interest on the normal monthly schedule.' },
    { id: 'interestBiweekly', label: 'Interest, biweekly plan', format: 'currency', precision: 0, info: 'Total interest paying half each two weeks.' },
  ],
  compute: (v) => {
    const balance = num(v.balance), rate = num(v.rate), years = num(v.years);
    if (balance === null || rate === null || years === null) return { saved: null };
    if (balance <= 0 || rate < 0 || years < 1) return { saved: null };
    const n = Math.round(years * 12);
    const monthly = amortizedPayment(balance, rate, n);
    const half = monthly / 2;
    const base = payoff(balance, rate / 100 / 12, monthly, 1200);
    const fast = payoff(balance, rate / 100 / 26, half, 26 * 60);
    const interestMonthly = base.paid - balance;
    const interestBiweekly = fast.paid - balance;
    const payoffYears = fast.periods / 26;
    return {
      saved: interestMonthly - interestBiweekly,
      yearsSooner: base.periods / 12 - payoffYears,
      monthly,
      biweekly: half,
      payoffYears,
      interestMonthly,
      interestBiweekly,
      chart: {
        type: 'bar',
        title: 'Total interest ($)',
        categories: ['Monthly', 'Biweekly'],
        series: [{ name: 'Interest', values: [interestMonthly, interestBiweekly] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Monthly payment = ${money(monthly)} for ${n} months, interest ${money(interestMonthly, 0)}`,
        `Biweekly payment = ${money(monthly)} ÷ 2 = ${money(half)}, paid 26 times a year (13 full payments)`,
        `Balance reaches zero after ${fast.periods} payments (${payoffYears.toFixed(1)} years), interest ${money(interestBiweekly, 0)}`,
      ],
      note: 'Only works if your lender applies each half payment right away. Some hold them and post once a month, which saves nothing, and some charge a fee for the program. Paying one extra monthly payment a year yourself has almost the same effect.',
    };
  },
  content: {
    formula: [
      'Monthly payment = P × r ÷ (1 − (1 + r)^−n), with r the monthly rate and n the number of months',
      'Biweekly payment = monthly payment ÷ 2, paid 26 times a year',
      'Each biweekly period adds interest at (annual rate ÷ 26) on the balance, then subtracts the payment',
    ],
    body: [
      'Paying half your mortgage payment every two weeks means 26 half payments a year. That equals 13 full monthly payments instead of 12, so you pay one extra payment a year without noticing it.',
      'The extra payment goes straight to principal. A smaller balance earns less interest, and the savings snowball, which is why a 30-year loan can finish several years early.',
      'This calculator assumes your lender takes each half payment as soon as it arrives and charges interest every two weeks. Programs that only forward the money once a month, or that charge a setup fee, do not give this result.',
      'You can get nearly the same outcome without any program. Pay your normal payment and add one-twelfth of it extra each month, or make one extra payment a year.',
    ],
    faq: [
      { q: 'How much does a biweekly mortgage save?', a: 'It depends on the rate and term. With the default $300,000 loan at 6.5% over 30 years, paying biweekly saves tens of thousands of dollars and takes several years off the loan. A 0% loan saves no interest but still finishes sooner.' },
      { q: 'Is biweekly the same as twice a month?', a: 'No. Twice a month is 24 payments a year, which equals 12 full payments and saves nothing. Biweekly is every 14 days, 26 payments, which equals 13 full payments.' },
      { q: 'How is the payoff time worked out?', a: 'The calculator steps through each two-week period, adds interest at the annual rate divided by 26, subtracts the half payment, and counts periods until the balance is zero. For a 0% loan of $260,000 over 30 years, the monthly payment is $722.22, the biweekly payment is $361.11, and it takes 720 payments, which is 27.7 years.' },
      { q: 'Does my lender allow it?', a: 'Many do, some for a fee. Ask whether payments are applied on receipt and whether extra goes to principal. You can also mimic it by adding an extra monthly payment yourself.' },
    ],
    sources: [
      { label: 'Consumer Financial Protection Bureau: paying off your mortgage early', url: 'https://www.consumerfinance.gov/ask-cfpb/can-i-save-money-by-making-extra-payments-on-my-mortgage-en-2191/' },
    ],
  },
  related: ['extra-mortgage-payment', 'mortgage', 'refinance', 'mortgage-points', 'interest-only-loan', 'loan'],
  examples: [
    // 0% rate: monthly 260000/360 = 722.2222, biweekly 361.1111, 720 payments = 720/26 years
    { values: { balance: 260000, rate: 0, years: 30 }, expect: { saved: 0, monthly: 722.2222222222222, biweekly: 361.1111111111111, payoffYears: 720 / 26, yearsSooner: 30 - 720 / 26, interestBiweekly: 0 }, tolerance: 1e-3 },
  ],
});
