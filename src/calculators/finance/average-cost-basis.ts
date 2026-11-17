import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'average-cost-basis',
  title: 'Average Cost Basis Calculator',
  category: 'finance',
  description: 'Find your average cost per share across buys, your profit or loss at the current price, and how many shares to buy to bring your average down to a target.',
  keywords: ['average cost basis calculator', 'average down calculator', 'stock average calculator', 'how many shares to lower average cost', 'cost basis per share'],
  updated: '2026-11-17',
  inputs: [
    { id: 'sh1', label: 'Lot 1 shares', type: 'number', default: 100, min: 0, step: 1, info: 'Shares bought in your first purchase.' },
    { id: 'px1', label: 'Lot 1 price per share', type: 'number', prefix: '$', default: 50, min: 0, step: 0.5, info: 'Price paid per share, including fees if you want them counted.' },
    { id: 'sh2', label: 'Lot 2 shares', type: 'number', default: 50, min: 0, step: 1, info: 'Shares bought in a second purchase. Leave at 0 if none.' },
    { id: 'px2', label: 'Lot 2 price per share', type: 'number', prefix: '$', default: 30, min: 0, step: 0.5, info: 'Price paid per share in the second purchase.' },
    { id: 'cur', label: 'Current price per share', type: 'number', prefix: '$', default: 35, min: 0, step: 0.5, info: 'Used for profit or loss, and as the price of the new shares you would buy.' },
    { id: 'target', label: 'Target average price', type: 'number', prefix: '$', default: 40, min: 0, step: 0.5, info: 'The average cost per share you want to reach by buying more at the current price.' },
  ],
  outputs: [
    { id: 'avg', label: 'Average cost per share', format: 'currency', precision: 2, primary: true, info: 'Total spent ÷ total shares.' },
    { id: 'shares', label: 'Total shares', format: 'number', info: 'Shares across both lots.' },
    { id: 'cost', label: 'Total cost', format: 'currency', info: 'Sum of shares × price for each lot.' },
    { id: 'pl', label: 'Profit / loss at current price', format: 'currency', info: '(Current price − average cost) × total shares.' },
    { id: 'buy', label: 'Shares to buy to hit target', format: 'number', precision: 1, info: 'Shares needed at the current price to reach the target average. Zero when the target cannot be reached by buying at this price.' },
  ],
  compute: (v) => {
    const s1 = num(v.sh1) ?? 0, p1 = num(v.px1) ?? 0, s2 = num(v.sh2) ?? 0, p2 = num(v.px2) ?? 0;
    const cur = num(v.cur) ?? 0, T = num(v.target) ?? 0;
    if (s1 < 0 || s2 < 0 || p1 < 0 || p2 < 0) return { avg: null, error: 'Shares and prices cannot be negative.' };
    const S = s1 + s2;
    if (S <= 0) return { avg: null };
    const cost = s1 * p1 + s2 * p2;
    const avg = cost / S;
    const pl = (cur - avg) * S;
    // Buying n shares at cur: (cost + n*cur)/(S+n) = T  ->  n = (cost - T*S)/(T - cur) = S(avg - T)/(T - cur)
    let buy = 0;
    let note = 'Average cost ignores taxes and the lot method your broker uses. This is not tax advice.';
    if (T > 0 && cur > 0 && cur < T && T < avg) buy = (S * (avg - T)) / (T - cur);
    else if (T > 0 && T >= avg) note = 'Your average is already at or below the target, so no extra shares are needed. ' + note;
    else if (T > 0 && cur >= T) note = 'The current price is at or above the target, so buying more cannot bring your average down to it. ' + note;
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Price per share',
      categories: ['Lot 1', 'Lot 2', 'Average', 'Current'],
      series: [{ name: 'Price', values: [p1, p2, Math.round(avg * 100) / 100, cur] }],
      format: { format: 'currency' },
      highlight: 2,
    };
    return {
      chart,
      avg,
      shares: S,
      cost,
      pl,
      buy,
      tone: pl >= 0 ? 'good' : 'bad',
      note,
      steps: [
        `Total cost = ${s1} × ${money(p1, 2)} + ${s2} × ${money(p2, 2)} = ${money(cost, 2)}`,
        `Average = ${money(cost, 2)} ÷ ${S} = ${money(avg, 2)}`,
        `P/L = (${money(cur, 2)} − ${money(avg, 2)}) × ${S} = ${money(pl, 2)}`,
      ],
    };
  },
  content: {
    formula: ['Average cost = Σ(shares × price) ÷ Σ shares', 'Shares to buy n = S × (average − target) ÷ (target − current price), valid when current price < target < average'],
    body: [
      'Your average cost per share is the total you spent divided by the total shares you own. Each time you buy at a different price, the average moves toward that price, weighted by how many shares you bought.',
      '"Averaging down" means buying more at a lower price to pull your average cost under where it was. The last output tells you how many shares you would need at the current price to reach a target average.',
      'The result is a cost average, not tax advice. Brokers can report gains using different lot methods such as FIFO or specific lots, so your tax basis may differ.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: ['100 shares at $50 and 50 shares at $30 cost $6,500 for 150 shares, an average of $43.33. To reach a $40 average by buying at $30: 150 × (43.33 − 40) ÷ (40 − 30) = 50 shares. Check: ($6,500 + 50 × $30) ÷ 200 = $40.'],
      },
    ],
    faq: [
      { q: 'How do I calculate average cost per share?', a: 'Multiply shares by price for each purchase, add them up, and divide by total shares. For 100 at $50 and 50 at $30, that is $6,500 ÷ 150 = $43.33.' },
      { q: 'Does averaging down always help?', a: 'It lowers your average cost, but it also increases how much you have invested in the same position. It does not change whether the price recovers.' },
      { q: 'Why does it say zero shares to buy?', a: 'Either your average is already at or below the target, or the current price is at or above the target, so extra shares at that price cannot reach it.' },
      { q: 'Is this my tax cost basis?', a: 'Not necessarily. Your broker reports basis using a lot method, and fees, splits and wash sales can change it.' },
    ],
    sources: [{ label: 'SEC Investor.gov: Stocks', url: 'https://www.investor.gov/introduction-investing/investing-basics/investment-products/stocks' }],
  },
  related: ['roi', 'capital-gains-tax', 'investment'],
  examples: [
    // cost 6500; 150 sh; avg 43.3333; P/L (30-43.3333)*150 = -2000; buy 150*3.3333/10 = 50; check 8000/200 = 40
    { values: { sh1: 100, px1: 50, sh2: 50, px2: 30, cur: 30, target: 40 }, expect: { avg: 43.33333333, shares: 150, cost: 6500, pl: -2000, buy: 50 } },
    { values: { sh1: 100, px1: 50, sh2: 0, px2: 0, cur: 60, target: 40 }, expect: { avg: 50, shares: 100, cost: 5000, pl: 1000, buy: 0 } },
  ],
});
