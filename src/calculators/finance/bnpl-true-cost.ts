import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, money, moneyDonut } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'bnpl-true-cost',
  title: 'Buy Now Pay Later True Cost Calculator',
  category: 'finance',
  description: 'See what a buy now, pay later plan really costs once you add the plan fee, interest and late fees, and how much extra you pay over the sticker price.',
  keywords: ['buy now pay later calculator', 'bnpl cost calculator', 'pay in 4 calculator', 'afterpay cost', 'klarna true cost', 'installment plan cost'],
  updated: '2026-11-17',
  inputs: [
    { id: 'price', label: 'Purchase price', type: 'number', prefix: '$', default: 600, min: 0, step: 10, info: 'The price at checkout, including tax and shipping if the plan covers them.' },
    { id: 'down', label: 'Paid today (down payment)', type: 'number', prefix: '$', default: 150, min: 0, step: 10, info: 'Many pay-in-4 plans take 25% at checkout. Enter 0 if nothing is due today.' },
    { id: 'months', label: 'Number of monthly payments', type: 'number', default: 6, min: 1, max: 60, step: 1, info: 'Payments after the down payment. For a pay-in-4 plan paid every two weeks, use 3 payments over about 1.5 months and read this as a rough fit.' },
    { id: 'apr', label: 'Interest rate (APR)', type: 'number', suffix: '%', default: 0, min: 0, max: 60, step: 0.5, info: 'Zero for interest-free plans. Longer plans from some providers charge APR; check your agreement.' },
    { id: 'fee', label: 'Plan or service fee', type: 'number', prefix: '$', default: 0, min: 0, step: 1, info: 'Any one-off fee charged by the provider for the plan.' },
    { id: 'late', label: 'Late fees you expect to pay', type: 'number', prefix: '$', default: 0, min: 0, step: 1, info: 'Total late fees across the plan. Set to 0 if you pay on time.' },
  ],
  outputs: [
    { id: 'extra', label: 'Extra cost over the price', format: 'currency', primary: true, info: 'Interest + plan fee + late fees. This is what the plan costs you beyond the price.' },
    { id: 'total', label: 'Total you pay', format: 'currency', info: 'Down payment + all monthly payments + fee + late fees.' },
    { id: 'pmt', label: 'Monthly payment', format: 'currency', info: 'The level payment after the down payment, including interest.' },
    { id: 'extraPct', label: 'Extra as % of price', format: 'percent', precision: 1, info: 'Extra cost ÷ purchase price.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const down = num(v.down) ?? 0;
    const months = num(v.months);
    const apr = num(v.apr) ?? 0;
    const fee = num(v.fee) ?? 0;
    const late = num(v.late) ?? 0;
    if (price === null || months === null || price <= 0 || months < 1) return { extra: null };
    if (down < 0 || apr < 0 || fee < 0 || late < 0) return { extra: null, error: 'Amounts cannot be negative.' };
    if (down > price) return { extra: null, error: 'The down payment cannot be more than the price.' };
    const n = Math.round(months);
    const financed = price - down;
    const pmt = financed === 0 ? 0 : amortizedPayment(financed, apr, n);
    const interest = pmt * n - financed;
    const extra = interest + fee + late;
    const total = price + extra;
    const extraPct = extra / price;
    const tone = extra < 0.005 ? 'good' : extraPct <= 0.05 ? 'warn' : 'bad';
    const badge = extra < 0.005 ? 'No extra cost' : extraPct <= 0.05 ? `Costs ${(extraPct * 100).toFixed(1)}% more` : `Costs ${(extraPct * 100).toFixed(1)}% more: worth a second look`;
    return {
      extra,
      total,
      pmt,
      extraPct,
      tone,
      badge,
      chart: moneyDonut('Where your money goes', [
        { label: 'Price', value: price },
        { label: 'Interest', value: interest },
        { label: 'Fees', value: fee + late },
      ], money(total, 2), 'total'),
      note: 'Interest assumes equal monthly payments on the balance after the down payment. Your plan\'s agreement is what counts, so check its exact terms.',
      steps: [
        `Financed = ${money(price, 2)} − ${money(down, 2)} = ${money(financed, 2)}`,
        `Monthly payment over ${n} months at ${apr}% APR = ${money(pmt, 2)}`,
        `Interest = ${money(pmt, 2)} × ${n} − ${money(financed, 2)} = ${money(interest, 2)}`,
        `Extra = ${money(interest, 2)} + ${money(fee, 2)} fee + ${money(late, 2)} late = ${money(extra, 2)}`,
      ],
    };
  },
  content: {
    formula: ['Payment = financed × r ÷ (1 − (1 + r)^−n), with r = APR ÷ 12 (or financed ÷ n at 0%)', 'Extra cost = payment × n − financed + plan fee + late fees'],
    body: [
      'Buy now, pay later splits a purchase into instalments. Many plans charge no interest, but some add interest or a fee, and late fees can add up fast. This calculator puts all of it into one number: what you pay beyond the sticker price.',
      'Enter the price, what you pay today, the number of monthly payments, any APR, the plan fee and any late fees you expect. The result shows the extra cost, the total and the monthly payment.',
      'Even at 0% the plan can cost you in another way: it makes it easier to buy more than you planned. Adding your instalments to your monthly budget is a useful check.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: ['A $600 purchase with $150 down leaves $450 financed. Over 6 monthly payments at 0% APR with no fees, each payment is 450 ÷ 6 = $75 and the extra cost is $0. At 12% APR over 12 months on $1,200 financed, the payment is $106.62, the total repaid is $1,279.42, and interest is about $79.42.'],
      },
      {
        heading: 'Costs to watch for',
        paragraphs: ['Late fees, interest that starts after a promotional period, rescheduling fees and returns that do not instantly cancel the plan. Read the agreement for the exact terms.'],
      },
    ],
    faq: [
      { q: 'Is buy now, pay later free?', a: 'Often, if you pay on time and the plan charges 0% interest. Some plans charge interest or fees, and late fees apply if you miss a payment.' },
      { q: 'How is the extra cost worked out?', a: 'Interest on the financed amount, plus the plan fee, plus late fees. With $1,200 financed at 12% APR over 12 months the interest is about $79.42.' },
      { q: 'Does this work for pay in 4?', a: 'Roughly. Pay in 4 is usually four payments two weeks apart, interest-free. Enter 25% of the price as the down payment and 3 monthly payments at 0% APR to see the schedule, and add any fee.' },
      { q: 'Does BNPL affect my credit?', a: 'It depends on the provider and how it reports. This calculator only computes the cost of the plan.' },
    ],
    sources: [{ label: 'CFPB: Buy now, pay later', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-buy-now-pay-later-en-2111/' }],
  },
  related: ['credit-card-payoff', 'apr', 'loan', 'cost-per-use'],
  examples: [
    // 450 financed / 6 = 75; no interest or fees -> extra 0.
    { values: { price: 600, down: 150, months: 6, apr: 0, fee: 0, late: 0 }, expect: { extra: 0, total: 600, pmt: 75, extraPct: 0 } },
    // 0% APR, $50 fee on $1,000 over 12 months: payment 1000/12 = 83.333, extra = 50.
    { values: { price: 1000, down: 0, months: 12, apr: 0, fee: 50, late: 0 }, expect: { extra: 50, total: 1050, extraPct: 0.05 } },
    // $1,200 at 12% over 12 months: 106.6185 x 12 = 1279.42, interest 79.42 (standard $88.85 per $1,000 payment).
    { values: { price: 1200, down: 0, months: 12, apr: 12, fee: 0, late: 0 }, expect: { pmt: 106.6185, extra: 79.4226 } },
  ],
});
