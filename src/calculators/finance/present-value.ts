import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'present-value',
  title: 'Present Value Calculator',
  category: 'finance',
  description: 'Find what a future sum of money is worth today. Enter the future amount, a discount rate and the years to wait, and see the present value and the discount.',
  keywords: ['present value calculator', 'pv calculator', 'discount future money', 'present value formula', 'time value of money', 'discounted value'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'fv', label: 'Future amount', type: 'number', prefix: '$', default: 10000, min: 0, step: 100, info: 'The sum you expect to receive or need at a future date.' },
    { id: 'rate', label: 'Discount rate', type: 'number', default: 5, min: 0, max: 100, step: 0.1, suffix: '% a year', info: 'The yearly return you could earn elsewhere, or the inflation rate. Higher rates make the future sum worth less today.' },
    { id: 'years', label: 'Years until you get it', type: 'number', default: 10, min: 0, max: 100, step: 0.5, suffix: 'years', info: 'How long until the money arrives. Decimals are fine.' },
  ],
  outputs: [
    { id: 'pv', label: 'Present value', format: 'currency', precision: 2, primary: true, info: 'Future amount ÷ (1 + rate)^years. What the future sum is worth in today’s money at this rate.' },
    { id: 'discount', label: 'Value lost to waiting', format: 'currency', precision: 2, info: 'Future amount minus present value.' },
    { id: 'factor', label: 'Discount factor', precision: 4, info: '1 ÷ (1 + rate)^years. Multiply any future sum by this to get today’s value.' },
  ],
  compute: (v) => {
    const fv = num(v.fv);
    const r = num(v.rate);
    const y = num(v.years);
    if (fv === null || r === null || y === null || fv < 0 || r < 0 || r > 100 || y < 0 || y > 100) return { pv: null };
    const factor = 1 / Math.pow(1 + r / 100, y);
    const pv = fv * factor;
    const steps = Math.max(1, Math.min(Math.ceil(y), 60));
    const x: number[] = [];
    const vals: number[] = [];
    for (let i = 0; i <= steps; i++) {
      const t = (y * i) / steps;
      x.push(+t.toFixed(2));
      vals.push(fv / Math.pow(1 + r / 100, y - t));
    }
    return {
      pv,
      discount: fv - pv,
      factor,
      chart: {
        type: 'line',
        title: 'Value growing from today to the future amount',
        x,
        xLabel: 'Years from now',
        yFormat: { format: 'currency' },
        series: [{ name: 'Value at this rate', values: vals }],
      },
      steps: [
        `Discount factor = 1 ÷ (1 + ${fmt(r / 100, 4)})^${fmt(y)} = ${fmt(factor, 6)}`,
        `Present value = $${fmt(fv)} × ${fmt(factor, 6)} = $${fmt(pv)}`,
      ],
      note: `$${fmt(fv)} in ${fmt(y)} years is worth $${fmt(pv)} today at ${fmt(r)}% a year.`,
    };
  },
  content: {
    formula: ['Present value = future amount ÷ (1 + r)^n', 'r = yearly discount rate as a decimal, n = years'],
    body: [
      'Present value answers one question: what is a future sum of money worth today? A dollar today can be invested and grow, so a dollar promised later is worth less. Discounting reverses that growth.',
      'If you will receive $10,000 in 10 years and could earn 5% a year elsewhere, divide by 1.05 ten times over. 1.05^10 is about 1.6289, so the present value is about $6,139. Put $6,139 away at 5% and in 10 years you would have $10,000.',
      'The discount rate does the heavy lifting. Use the return you could realistically earn on a similar-risk investment, or an inflation rate if you only want to see the loss of buying power. A higher rate or a longer wait both shrink the present value. At a 0% rate the future sum is worth exactly the same today.',
      'This is a single lump sum. It does not cover a stream of payments, such as an annuity, and it ignores tax and fees. It is a tool for comparing money at different times, not a forecast.',
    ],
    faq: [
      { q: 'How do you calculate present value?', a: 'Divide the future amount by (1 + rate) raised to the number of years. For $1,000 in 5 years at 8%, that is 1,000 ÷ 1.08^5 = about $680.58.' },
      { q: 'What discount rate should I use?', a: 'Use the return you could earn on an alternative with similar risk, or the expected inflation rate to see buying power. The result is only as good as that assumption.' },
      { q: 'Why is present value lower than the future amount?', a: 'Because money today can earn a return. Receiving it later means giving up that growth, so the later sum is discounted.' },
      { q: 'What happens at a 0% discount rate?', a: 'The discount factor is 1, so the present value equals the future amount.' },
    ],
    sources: [
      { label: 'Time value of money (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Time_value_of_money' },
      { label: 'Present value (Investor.gov glossary)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/present-value' },
    ],
  },
  related: ['compound-interest', 'inflation', 'cagr-calculator', 'lump-sum-vs-payments', 'rule-of-72'],
  examples: [
    {
      // 1.05^10 = 1.628895; 10000 / 1.628895 = 6139.13; discount 3860.87; factor 0.613913.
      values: { fv: 10000, rate: 5, years: 10 },
      expect: { pv: 6139.13, discount: 3860.87, factor: 0.613913 },
      tolerance: 1e-3,
    },
    {
      // 1.08^5 = 1.469328; 1000 / 1.469328 = 680.58.
      values: { fv: 1000, rate: 8, years: 5 },
      expect: { pv: 680.58 },
      tolerance: 1e-2,
    },
    { values: { fv: 500, rate: 0, years: 7 }, expect: { pv: 500, discount: 0, factor: 1 }, tolerance: 1e-9 },
  ],
});
