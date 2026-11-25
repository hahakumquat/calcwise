import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 0) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'long-term-gain-wait',
  title: 'Sell Now or Wait for Long-Term Gains Rate',
  category: 'finance',
  description: 'Compare the tax on selling shares now at the short-term rate with waiting for the long-term rate, and find how far the price can fall before waiting loses.',
  keywords: ['short term vs long term capital gains', 'wait for long term capital gains', 'sell now or wait tax', 'long-term gain break-even price', 'holding period tax savings'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'shares', label: 'Shares you hold', type: 'number', default: 100, min: 0, step: 1, info: 'How many shares you are thinking of selling.' },
    { id: 'cost', label: 'Cost per share', type: 'number', prefix: '$', default: 50, min: 0, step: 0.01, info: 'What you paid per share.' },
    { id: 'price', label: 'Price per share now', type: 'number', prefix: '$', default: 100, min: 0, step: 0.01, info: 'The current price.' },
    { id: 'shortRate', label: 'Short-term tax rate', type: 'number', suffix: '%', default: 32, min: 0, max: 100, step: 0.5, info: 'Your rate on gains from shares held a year or less, usually your ordinary rate.' },
    { id: 'longRate', label: 'Long-term tax rate', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 0.5, info: 'Your rate on gains from shares held longer than a year.' },
    { id: 'days', label: 'Days until the holding period passes', type: 'number', default: 30, min: 0, step: 1, info: 'Your own count of days left. Check the rule on irs.gov.' },
  ],
  outputs: [
    { id: 'saving', label: 'Tax saved by waiting', format: 'currency', precision: 2, primary: true, info: 'Tax now − tax later, if the price does not move.' },
    { id: 'taxNow', label: 'Tax if you sell now', format: 'currency', precision: 2, info: 'Short-term rate × gain.' },
    { id: 'taxLater', label: 'Tax if you sell later, same price', format: 'currency', precision: 2, info: 'Long-term rate × gain.' },
    { id: 'breakEven', label: 'Break-even price per share', format: 'currency', precision: 2, info: 'The later price at which waiting leaves you with the same cash as selling now.' },
    { id: 'drop', label: 'Price drop you can absorb', format: 'percent', precision: 2, info: '1 − break-even price ÷ current price.' },
  ],
  compute: (v) => {
    const n = num(v.shares);
    const c = num(v.cost);
    const p = num(v.price);
    const s = num(v.shortRate);
    const l = num(v.longRate);
    const d = num(v.days);
    if (n === null || c === null || p === null || s === null || l === null || d === null) return { saving: null };
    if (n <= 0 || c < 0 || p <= 0 || s < 0 || l < 0 || s >= 100 || l >= 100 || d < 0) return { saving: null };
    if (p <= c) {
      return { saving: 0, taxNow: 0, taxLater: 0, breakEven: p, drop: 0, tone: 'ok', badge: 'No gain to tax', note: 'The price is at or below your cost, so there is no gain and the holding period does not change the tax on it.' };
    }
    const V = p * n;
    const C = c * n;
    const gain = V - C;
    const taxNow = (s / 100) * gain;
    const taxLater = (l / 100) * gain;
    const saving = taxNow - taxLater;
    const be = (V * (1 - s / 100) + C * (s / 100 - l / 100)) / (1 - l / 100);
    const bePrice = be / n;
    const drop = (1 - be / V) * 100;
    return {
      saving,
      taxNow,
      taxLater,
      breakEven: bePrice,
      drop,
      tone: saving > 0 ? 'good' : 'warn',
      badge: saving > 0 ? `Waiting saves ${money(saving)} if the price holds` : 'Waiting does not lower the tax',
      note: saving > 0
        ? `Over the next ${fmt(d)} days the price can fall to ${money(bePrice)} a share (${fmt(drop, 2)}% lower) before selling now would have left you with more cash.`
        : 'Your long-term rate is not below your short-term rate, so waiting only adds price risk.',
      chart: {
        type: 'bar' as const,
        title: 'Tax on the same gain',
        categories: ['Sell now', 'Sell after waiting'],
        series: [{ name: 'Tax', values: [taxNow, taxLater] }],
        format: CURRENCY,
        highlight: 1,
      },
      steps: [
        `Gain = (${money(p)} − ${money(c)}) × ${fmt(n)} = ${money(gain)}`,
        `Tax now = ${fmt(s, 2)}% × ${money(gain)} = ${money(taxNow)}`,
        `Tax later = ${fmt(l, 2)}% × ${money(gain)} = ${money(taxLater)}`,
        `Break-even value = (${money(V)} × (1 − ${fmt(s, 2)}%) + ${money(C)} × (${fmt(s, 2)}% − ${fmt(l, 2)}%)) ÷ (1 − ${fmt(l, 2)}%) = ${money(be)}`,
      ],
    };
  },
  content: {
    formula: [
      'Gain = (price − cost) × shares',
      'Tax now = short-term rate × gain; tax later = long-term rate × gain',
      'Break-even value = (V × (1 − short) + C × (short − long)) ÷ (1 − long), where V = price × shares and C = cost × shares',
      'Price drop you can absorb = 1 − break-even value ÷ V',
    ],
    body: [
      'Gains on shares held a year or less are usually taxed at your ordinary rate; gains on shares held longer are taxed at a lower long-term rate. If you are close to the line, waiting can save tax, but the price can move while you wait.',
      'Example: 100 shares bought at $50 and now $100 give a $5,000 gain. At 32% the tax is $1,600; at 15% it is $750, so waiting saves $850. Waiting nets the same cash as selling now if the price falls to $90.00 a share, a 10% drop: $9,000 − 15% × $4,000 = $8,400, and $10,000 − $1,600 = $8,400.',
      'The rates, the day count and any extra tax such as the net investment income tax are yours to enter and check on irs.gov. This page does not decide when the holding period starts or ends. It is not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How is the break-even price worked out?', a: 'It is the later price at which cash after tax equals selling now: V × (1 − short rate) now against P × (1 − long rate) + C × long rate later, solved for P.' },
      { q: 'With 100 shares at $50 cost and $100 price, what is the break-even?', a: 'At 32% short and 15% long, $90.00 a share, which is a 10.00% drop from $100.' },
      { q: 'Does the day count change the answer?', a: 'No. It is shown in the note only; the calculator does not model the holding period rule, so check the date yourself.' },
      { q: 'What if the price is below my cost?', a: 'There is no gain to tax, so the result shows zero.' },
    ],
    sources: [],
  },
  related: ['capital-gains-tax', 'gains-harvest-headroom', 'tax-loss-harvesting'],
  examples: [
    // gain 5000; now 1600; later 750; saving 850; be=(10000*.68+5000*.17)/.85=(6800+850)/.85=9000 -> 90/share; drop 10
    { values: { shares: 100, cost: 50, price: 100, shortRate: 32, longRate: 15, days: 30 }, expect: { saving: 850, taxNow: 1600, taxLater: 750, breakEven: 90, drop: 10 } },
    // gain 1000; now 240; later 150; saving 90; be=(2200*.76+1200*.09)/.85=(1672+108)/.85=2094.1176 -> 52.3529/share; drop 4.8128
    { values: { shares: 40, cost: 30, price: 55, shortRate: 24, longRate: 15, days: 20 }, expect: { saving: 90, taxNow: 240, taxLater: 150, breakEven: 52.35294, drop: 4.81283 } },
  ],
});
