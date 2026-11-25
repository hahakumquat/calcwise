import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'sepp-72t-payment',
  title: '72(t) SEPP Payment Calculator',
  category: 'finance',
  description: 'Estimate a yearly 72(t) SEPP payment using the fixed amortization method from your balance, interest rate and payout years. Rates and years are your inputs.',
  keywords: ['72t calculator', 'sepp calculator', '72(t) payment calculator', 'substantially equal periodic payments', 'early retirement penalty free withdrawals'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'balance', label: 'Account balance', type: 'number', prefix: '$', default: 500000, min: 0, step: 5000, help: 'The IRA balance used to set the payment.', info: 'Balance of the account the payments will come from.' },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 5, min: 0, max: 30, step: 0.1, help: 'Illustrative default. Not a current-year claim: the IRS caps the rate you may use, so check it.', info: 'Annual rate used in the amortization formula.' },
    { id: 'years', label: 'Payout years', type: 'number', suffix: 'years', default: 35, min: 1, max: 100, step: 1, help: 'From an IRS life expectancy table for your age. Illustrative default.', info: 'Number of years the balance is amortized over.' },
    { id: 'age', label: 'Your age now', type: 'number', suffix: 'years', default: 50, min: 18, max: 100, step: 1, help: 'Used only to estimate how long payments must continue.', info: 'Payments must run the longer of five years or until age 59.5.' },
    { id: 'penalty', label: 'Early-withdrawal penalty rate', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 0.5, help: 'Illustrative default. Not a current-year claim.', info: 'The additional tax a SEPP is meant to avoid.' },
  ],
  outputs: [
    { id: 'payment', label: 'Yearly SEPP payment', format: 'currency', primary: true, info: 'Balance × rate ÷ (1 − (1 + rate)^−years).' },
    { id: 'monthly', label: 'Per month', format: 'currency', info: 'Yearly payment ÷ 12.' },
    { id: 'saved', label: 'Penalty avoided per year', format: 'currency', info: 'Yearly payment × penalty rate.' },
    { id: 'minYears', label: 'Minimum years of payments', format: 'number', info: 'The longer of 5 years or the years until 59.5.' },
    { id: 'total', label: 'Total over the minimum period', format: 'currency', info: 'Yearly payment × minimum years.' },
  ],
  compute: (v) => {
    const balance = num(v.balance);
    const rate = num(v.rate);
    const years = num(v.years);
    const age = num(v.age);
    const penalty = num(v.penalty);
    if (balance === null || rate === null || years === null || age === null || penalty === null) return { payment: null };
    if (balance < 0 || rate < 0 || years < 1 || age < 0 || penalty < 0) return { payment: null };

    const i = rate / 100;
    const payment = i === 0 ? balance / years : (balance * i) / (1 - (1 + i) ** -years);
    const saved = payment * (penalty / 100);
    const minYears = Math.max(5, Math.ceil(59.5 - age));
    const total = payment * minYears;
    const pctOfBalance = balance > 0 ? payment / balance : 0;

    const charts: ChartSpec[] = [
      {
        type: 'bar',
        title: 'Each year of SEPP payments',
        categories: ['Payment', 'Penalty avoided'],
        series: [{ name: 'Per year', values: [payment, saved] }],
        format: { format: 'currency' },
      },
    ];

    return {
      payment, monthly: payment / 12, saved, minYears, total,
      tone: pctOfBalance > 0.08 ? 'warn' : 'good',
      badge: pctOfBalance > 0.08 ? `Draws ${pct(pctOfBalance, 1)} of the balance a year` : `About ${pct(pctOfBalance, 1)} of the balance a year`,
      chart: charts,
      steps: [
        `Payment = ${money(balance, 0)} × ${pct(i, 2)} ÷ (1 − (1 + ${pct(i, 2)})^−${years})`,
        `Yearly payment = ${money(payment)} (${money(payment / 12)} a month)`,
        `Penalty avoided each year = ${pct(penalty / 100, 2)} × ${money(payment)} = ${money(saved)}`,
        `Minimum period = longer of 5 years or until 59.5 = ${minYears} years, about ${money(total, 0)} in total`,
      ],
      note: 'The rate, payout years and penalty rate are your inputs and the defaults are illustrative, not current-year claims. Only the fixed amortization method is computed. Payments must continue for the full period, and changing or missing them can trigger back penalties plus interest. Not tax advice.',
    };
  },
  content: {
    formula: [
      'Yearly payment = balance × i ÷ (1 − (1 + i)^−n), where i is the annual rate and n the payout years',
      'Penalty avoided per year = yearly payment × penalty rate',
      'Minimum period = longer of 5 years or the years until age 59.5',
    ],
    body: [
      'A 72(t) plan, often called SEPP (substantially equal periodic payments), lets you take money from an IRA before 59.5 without the usual 10% additional tax, as long as the payments follow one of the IRS methods. This calculator uses the fixed amortization method, which works like a level loan payment paid out of your balance.',
      'The payments must continue for the longer of five years or until you reach 59.5. Changing the amount, or taking extra money out, can bring the penalty back on every payment you took, plus interest. That is why the commitment matters more than the math.',
      'The interest rate and payout years are inputs here. The IRS limits the rate you may use and publishes life expectancy tables, so check both. The defaults are illustrative, not claims about the current year. The fixed amortization method is the only one computed.',
    ],
    sections: [
      {
        heading: 'Things this does not model',
        paragraphs: ['The other two IRS methods (required minimum distribution and fixed annuitization), the one-time switch rules, account balance choices and state tax are not computed. Ordinary income tax still applies to the payments. Check the IRS rules or a tax professional before starting.'],
      },
    ],
    faq: [
      { q: 'What is the SEPP payment on $500,000 at 5% over 35 years?', a: 'The fixed amortization payment is $500,000 × 5% ÷ (1 − 1.05^−35) = $30,535.85 a year, about $2,544.65 a month. At a 10% penalty rate that avoids $3,053.59 a year.' },
      { q: 'What about $300,000 at 4.5% over 30 years?', a: 'The payment is $18,417.46 a year, which is about 6.1% of the balance.' },
      { q: 'How long must the payments continue?', a: 'The longer of five years or until you turn 59.5. At age 50 that is 10 years (9.5 rounded up); at 57 it is still 5 years.' },
      { q: 'Are the default rate and years current?', a: 'No. They are illustrative. Use the rate limit and life expectancy table the IRS publishes for your situation.' },
    ],
    sources: [
      { label: 'IRS: Substantially equal periodic payments', url: 'https://www.irs.gov/retirement-plans/retirement-plans-faqs-regarding-substantially-equal-periodic-payments' },
      { label: 'IRS Topic 557: Additional tax on early distributions', url: 'https://www.irs.gov/taxtopics/tc557' },
    ],
  },
  related: ['early-withdrawal-penalty', 'fire-calculator', 'roth-conversion'],
  examples: [
    {
      // 500,000 × 0.05 / (1 − 1.05^−35) = 25,000 / 0.818711 = 30,535.85; penalty 10% = 3,053.59; age 50 -> ceil(9.5) = 10 years.
      values: { balance: 500000, rate: 5, years: 35, age: 50, penalty: 10 },
      expect: { payment: 30535.853615, saved: 3053.585362, minYears: 10 },
      tolerance: 1e-3,
    },
    {
      // 300,000 × 0.045 / (1 − 1.045^−30) = 18,417.46; age 57 -> max(5, 3) = 5 years.
      values: { balance: 300000, rate: 4.5, years: 30, age: 57, penalty: 10 },
      expect: { payment: 18417.462873, minYears: 5 },
      tolerance: 1e-3,
    },
  ],
});
