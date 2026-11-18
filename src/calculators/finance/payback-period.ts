import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'payback-period',
  title: 'Payback Period Calculator',
  category: 'finance',
  description: 'Find how many years it takes for an investment to pay for itself. Simple and discounted payback from your cost, yearly cash flow and discount rate.',
  keywords: ['payback period calculator', 'discounted payback period', 'how long to break even investment', 'payback period formula', 'solar payback'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'cost', label: 'Upfront cost', type: 'number', prefix: '$', default: 10000, min: 0, step: 100, info: 'What you pay at the start.' },
    { id: 'cash', label: 'Cash flow per year', type: 'number', prefix: '$', default: 2500, min: 0, step: 50, info: 'Money earned or saved each year, assumed level.' },
    { id: 'rate', label: 'Discount rate', type: 'number', default: 8, min: 0, max: 100, step: 0.1, suffix: '% a year', info: 'Used only for the discounted payback. It reflects what the money could earn elsewhere.' },
  ],
  outputs: [
    { id: 'simple', label: 'Simple payback', format: 'number', precision: 2, suffix: ' years', primary: true, info: 'Cost ÷ yearly cash flow.' },
    { id: 'discounted', label: 'Discounted payback', format: 'number', precision: 2, suffix: ' years', info: 'Years until the present value of the cash flows covers the cost.' },
    { id: 'total10', label: 'Net gain after 10 years', format: 'currency', precision: 0, info: '10 years of cash flow minus the cost, undiscounted.' },
  ],
  compute: (v) => {
    const cost = num(v.cost);
    const cash = num(v.cash);
    const r = num(v.rate);
    if (cost === null || cash === null || r === null || cost < 0 || cash <= 0 || r < 0 || r > 100) return { simple: null };
    const simple = cost / cash;
    let discounted: number | null = cost === 0 ? 0 : null;
    let cum = 0;
    const x: number[] = [0];
    const plain: number[] = [-cost];
    const disc: number[] = [-cost];
    for (let t = 1; t <= 100; t++) {
      const pv = cash / Math.pow(1 + r / 100, t);
      if (discounted === null && cum + pv >= cost) discounted = t - 1 + (cost - cum) / pv;
      cum += pv;
      if (t <= 20) {
        x.push(t);
        plain.push(-cost + cash * t);
        disc.push(-cost + cum);
      }
    }
    return {
      simple,
      discounted,
      total10: cash * 10 - cost,
      chart: {
        type: 'line',
        title: 'Cumulative position over 20 years',
        x,
        xLabel: 'Years',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Simple', values: plain },
          { name: 'Discounted', values: disc },
        ],
      },
      steps: [
        `Simple payback = $${fmt(cost, 0)} ÷ $${fmt(cash, 0)} = ${fmt(simple, 2)} years`,
        discounted === null
          ? `At ${fmt(r)}% the discounted cash flows do not cover the cost within 100 years`
          : `Discounting each year’s cash flow at ${fmt(r)}% stretches payback to ${fmt(discounted, 2)} years`,
      ],
      note: `Level cash flow of $${fmt(cash, 0)} a year repays $${fmt(cost, 0)} in ${fmt(simple, 1)} years before discounting.`,
    };
  },
  content: {
    formula: ['Simple payback = cost ÷ yearly cash flow', 'Discounted payback: find when the sum of cash flow ÷ (1 + r)^t reaches the cost, counting part of the final year.'],
    body: [
      'Payback period is the time an investment takes to earn back what you put in. It is a quick way to compare things like solar panels, a new machine or a side business.',
      'The simple version ignores timing: $10,000 cost with $2,500 a year back is exactly 4 years. The discounted version values later money at less than money today, so the same deal takes longer. At an 8% discount rate it is about 5.0 years.',
      'The chart shows both lines starting below zero. Where each one crosses zero is that version of payback.',
      'Payback tells you how fast you get your money back, not how much you make afterwards. A project with a short payback can still be a worse investment than one with a longer payback and larger returns. Pair it with NPV and IRR.',
    ],
    faq: [
      { q: 'How do you calculate the payback period?', a: 'Divide the upfront cost by the yearly cash flow. $10,000 ÷ $2,500 = 4 years.' },
      { q: 'What is discounted payback?', a: 'It discounts each year’s cash flow by the discount rate before adding them up. With $10,000 cost, $2,500 a year and 8%, payback is about 5 years instead of 4.' },
      { q: 'What is a good payback period?', a: 'There is no standard. Shorter is lower risk, and what is acceptable depends on the asset, for example a few years for equipment.' },
      { q: 'Does this handle uneven cash flows?', a: 'No. It assumes the same cash flow every year. For uneven flows use the NPV and IRR calculator.' },
    ],
    sources: [
      { label: 'Payback period (Investopedia)', url: 'https://www.investopedia.com/terms/p/paybackperiod.asp' },
      { label: 'Discounted payback period (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Discounted_payback_period' },
    ],
  },
  related: ['npv-irr-calculator', 'present-value', 'roi', 'break-even', 'cost-per-use'],
  examples: [
    { values: { cost: 10000, cash: 2500, rate: 8 }, expect: { simple: 4, total10: 15000, discounted: 5.0116 }, tolerance: 1e-3 },
    { values: { cost: 6000, cash: 1500, rate: 0 }, expect: { simple: 4, discounted: 4 }, tolerance: 1e-6 },
  ],
});
