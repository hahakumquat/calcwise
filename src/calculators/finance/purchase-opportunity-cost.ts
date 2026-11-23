import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'purchase-opportunity-cost',
  title: 'Purchase Opportunity Cost Calculator',
  category: 'finance',
  description: 'See what a one-off purchase could grow to if you invested the money instead, before and after inflation, over the years you choose.',
  keywords: ['purchase opportunity cost', 'opportunity cost calculator', 'what if i invested instead', 'cost of a purchase in the future', 'future value of a purchase', 'is it worth it calculator'],
  updated: '2026-11-23',
  inputs: [
    { id: 'price', label: 'Purchase price', type: 'number', prefix: '$', default: 1200, min: 0, step: 50, info: 'A one-off cost: a TV, phone, trip or anything else you are thinking of buying.' },
    { id: 'years', label: 'Years until you would need the money', type: 'number', default: 30, min: 1, max: 60, step: 1, info: 'For example, the years until retirement.' },
    { id: 'rate', label: 'Assumed yearly return', type: 'number', suffix: '%', default: 7, min: 0, max: 20, step: 0.5, info: 'An assumption, not a promise. Returns vary a lot from year to year, and this is a nominal figure, meaning before inflation, tax and fees.' },
    { id: 'inflation', label: 'Inflation (optional)', type: 'number', suffix: '%', default: 3, min: 0, max: 15, step: 0.5, info: 'Used only for the "in today’s money" figure. Set 0 to see no adjustment.' },
  ],
  outputs: [
    { id: 'future', label: 'Could grow to', format: 'currency', primary: true, info: 'Price × (1 + return)^years.' },
    { id: 'growth', label: 'Growth on top', format: 'currency', info: 'The grown value minus the purchase price.' },
    { id: 'real', label: 'In today’s money', format: 'currency', info: 'The grown value divided by (1 + inflation)^years.' },
    { id: 'multiple', label: 'Times your money', format: 'number', info: 'Grown value divided by the price.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const years = num(v.years);
    const rate = num(v.rate);
    const infl = num(v.inflation) ?? 0;
    if (price === null || years === null || rate === null || price < 0 || years < 1 || rate < 0 || infl < 0) return { future: null };
    const n = Math.round(years);
    const r = rate / 100;
    const i = infl / 100;
    const future = price * Math.pow(1 + r, n);
    const real = future / Math.pow(1 + i, n);
    const xs: number[] = [];
    const base: number[] = [];
    const growth: number[] = [];
    for (let y = 0; y <= n; y++) {
      xs.push(y);
      base.push(price);
      growth.push(price * Math.pow(1 + r, y) - price);
    }
    return {
      future,
      growth: future - price,
      real,
      multiple: price > 0 ? future / price : null,
      badge: `${rate}% for ${n} years`,
      note: `$${fmt(price)} invested at ${rate}% a year for ${n} years could be about $${fmt(future)}, or about $${fmt(real)} in today’s money at ${infl}% inflation. That is a what-if, not a forecast: returns are not guaranteed and tax and fees are ignored. Spending on something you value is a fine choice.`,
      chart: {
        type: 'area',
        stacked: true,
        title: 'What the money could become',
        x: xs,
        xLabel: 'Years',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Purchase price', values: base },
          { name: 'Growth', values: growth },
        ],
      },
      steps: [
        `Future value = $${fmt(price, 2)} × (1 + ${r})^${n} = $${fmt(future, 2)}`,
        `In today’s money = $${fmt(future, 2)} ÷ (1 + ${i})^${n} = $${fmt(real, 2)}`,
        ...[10, 20, 30].filter((y) => y <= n).map((y) => `After ${y} years: $${fmt(price * Math.pow(1 + r, y), 2)}`),
      ],
    };
  },
  content: {
    formula: ['Future value = price × (1 + r)ⁿ', 'In today’s money = future value ÷ (1 + inflation)ⁿ'],
    body: [
      'Every dollar you spend now is a dollar that could have been invested. This calculator takes a one-off purchase, assumes you invested that money instead at a steady yearly return, and shows what it could be worth when you would need it, for example at retirement.',
      'It uses plain compound growth with no further deposits. The return is an assumption you set: real returns are uneven, can be negative in a given year, and the default is a nominal figure that ignores tax and fees. The optional inflation figure shows the result in today’s buying power.',
      'This is a way to see the size of a decision, not a rule that you should never spend. Plenty of purchases are worth far more than their invested value, and no single purchase decides your retirement. Everything runs in your browser.',
    ],
    faq: [
      { q: 'What does $1,200 grow to in 30 years at 7%?', a: '$1,200 × 1.07^30 = about $9,135 (1.07^30 is 7.6123). That is roughly 7.6 times the original amount, before tax and fees.' },
      { q: 'What is that in today’s money?', a: 'At 3% inflation over 30 years, $9,135 has the buying power of about $3,763 today ($9,135 ÷ 1.03^30). Growth after inflation is much smaller than the headline number.' },
      { q: 'Is 7% a safe return to assume?', a: 'No. It is a commonly used long-run stock-market figure before inflation, but returns are not guaranteed and vary widely year to year. Try a lower rate to see a more cautious case.' },
      { q: 'Does this mean I should not buy it?', a: 'No. It shows the trade-off, nothing more. Weigh it against what the purchase gives you, and see the latte factor calculator for repeated small spending.' },
    ],
    sources: [{ label: 'Investor.gov: Compound interest calculator (SEC)', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' }],
  },
  related: ['compound-interest', 'latte-factor', 'hours-of-work-cost', 'inflation', 'investment'],
  examples: [
    // 1.07^30 = 7.612255; 1,200 × 7.612255 = 9,134.71; 1.03^30 = 2.427262; 9,134.71 ÷ 2.427262 = 3,763.38.
    { values: { price: 1200, years: 30, rate: 7, inflation: 3 }, expect: { future: 9134.71, growth: 7934.71, real: 3763.38, multiple: 7.612255 }, tolerance: 1e-4 },
    // 0% return, 0% inflation: unchanged.
    { values: { price: 500, years: 10, rate: 0, inflation: 0 }, expect: { future: 500, growth: 0, real: 500, multiple: 1 }, tolerance: 1e-6 },
    // 1,000 at 10% for 2 years = 1,000 × 1.21 = 1,210.
    { values: { price: 1000, years: 2, rate: 10, inflation: 0 }, expect: { future: 1210, growth: 210, real: 1210, multiple: 1.21 }, tolerance: 1e-6 },
  ],
});
