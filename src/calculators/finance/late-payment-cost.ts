import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'late-payment-cost',
  title: 'Late Payment Cost: Fee Plus Interest',
  category: 'finance',
  description: 'Work out what paying a bill late really costs: the flat late fee plus daily interest, shown as a share of the bill and as an annual rate.',
  keywords: ['late payment fee calculator', 'cost of paying bill late', 'late fee plus interest', 'credit card late payment cost', 'late fee annualized rate'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'bill', label: 'Bill amount', type: 'number', prefix: '$', default: 850, min: 0, step: 50, info: 'The balance you are paying late.' },
    { id: 'fee', label: 'Flat late fee', type: 'number', prefix: '$', default: 35, min: 0, step: 5, info: 'The one-time fee on your statement or contract.' },
    { id: 'apr', label: 'APR charged on the balance', type: 'number', default: 29.99, min: 0, max: 100, step: 0.25, suffix: '%', info: 'Yearly interest rate. Use 0 if no interest is charged.' },
    { id: 'days', label: 'Days late', type: 'number', default: 10, min: 1, step: 1, info: 'How many days past the due date you pay.' },
  ],
  outputs: [
    { id: 'cost', label: 'Total cost of paying late', format: 'currency', precision: 2, primary: true, info: 'Late fee + interest for the days late.' },
    { id: 'interest', label: 'Interest for the delay', format: 'currency', precision: 2, info: 'Bill × APR × days ÷ 365.' },
    { id: 'pct', label: 'Cost as a share of the bill', format: 'percent', precision: 2, info: 'Total cost ÷ bill.' },
    { id: 'annual', label: 'Annualized rate', format: 'percent', precision: 1, info: 'Cost ÷ bill × 365 ÷ days. Shows how expensive the short delay is as a yearly rate.' },
  ],
  compute: (v) => {
    const bill = num(v.bill);
    const fee = num(v.fee);
    const apr = num(v.apr);
    const days = num(v.days);
    if (bill === null || fee === null || apr === null || days === null) return { cost: null };
    if (bill <= 0 || fee < 0 || apr < 0 || days < 1) return { cost: null };
    const d = Math.round(days);
    const interest = bill * (apr / 100) * d / 365;
    const cost = fee + interest;
    const pct = cost / bill;
    const annual = pct * 365 / d;
    return {
      cost,
      interest,
      pct,
      annual,
      tone: pct >= 0.03 ? 'warn' : 'ok',
      badge: `${money(cost)} for ${d} days late`,
      note: `A ${money(fee)} fee plus ${money(interest)} of interest costs ${money(cost)}, which is ${fmt(pct * 100, 2)}% of the bill. Over a year that pace would be ${fmt(annual * 100, 1)}%. Credit report effects and penalty APR terms are not modelled.`,
      chart: {
        type: 'bar' as const,
        title: 'Cost of paying late',
        categories: ['Late fee', 'Interest'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Cost', values: [fee, interest] }],
      },
      steps: [
        `Interest = ${money(bill)} × ${fmt(apr)}% × ${d} ÷ 365 = ${money(interest)}`,
        `Total cost = ${money(fee)} + ${money(interest)} = ${money(cost)}`,
        `Share of bill = ${money(cost)} ÷ ${money(bill)} = ${fmt(pct * 100, 2)}%`,
        `Annualized = ${fmt(pct * 100, 2)}% × 365 ÷ ${d} = ${fmt(annual * 100, 1)}%`,
      ],
    };
  },
  content: {
    formula: [
      'Interest = bill × APR × days late ÷ 365',
      'Total cost = late fee + interest',
      'Share of bill = total cost ÷ bill',
      'Annualized rate = share of bill × 365 ÷ days late',
    ],
    body: [
      'A late fee is small next to the bill, but it lands on top of interest and it is charged for a delay of only a few days. This calculator adds the two and shows the result as an annual rate, so a short delay can be compared with other ways to borrow money for a short time.',
      'Example: an $850 bill, a $35 fee, 29.99% APR and 10 days late. Interest is 850 × 29.99% × 10 ÷ 365 = $6.98. The total is $35 + $6.98 = $41.98, which is 4.94% of the bill. Scaled to a full year that pace is 180.3%.',
      'The interest uses simple daily interest on the whole bill. Real accounts may compound daily, use an average daily balance or apply a higher penalty APR, none of which is modelled here. Late payments can also be reported to credit bureaus, which is not a dollar figure and is not computed. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does paying a bill late cost?', a: 'The late fee plus interest for the days late. With a $35 fee and $6.98 of interest on an $850 bill, that is $41.98.' },
      { q: 'Why show an annualized rate?', a: 'A flat fee on a short delay is a very high yearly rate. Showing it that way lets you compare it with a short loan or a cash advance.' },
      { q: 'Does this include the penalty APR?', a: 'No. Enter the APR you expect to be charged. If your card raises it after a late payment, use that higher rate.' },
      { q: 'Does a late payment hurt my credit?', a: 'Payments reported late can affect your credit report, but that effect cannot be turned into dollars here.' },
      { q: 'What if there is no interest?', a: 'Enter 0 for the APR. The cost is then just the flat fee.' },
    ],
    sources: [],
  },
  related: ['daily-interest', 'credit-card-payoff', 'bill-negotiation-savings', 'apr'],
  examples: [
    // interest 850*.2999*10/365 = 6.98397; cost 41.98397; pct .049393; annual .049393*36.5 = 1.80284
    { values: { bill: 850, fee: 35, apr: 29.99, days: 10 }, expect: { interest: 6.98, cost: 41.98, pct: 0.0494, annual: 1.8028 }, tolerance: 0.001 },
    // no interest: cost 25; pct .025; annual .025*365/5 = 1.825
    { values: { bill: 1000, fee: 25, apr: 0, days: 5 }, expect: { interest: 0, cost: 25, pct: 0.025, annual: 1.825 } },
  ],
});
