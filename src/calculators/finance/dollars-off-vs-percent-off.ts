import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'dollars-off-vs-percent-off',
  title: 'Dollars Off vs Percent Off Calculator',
  category: 'finance',
  description: 'Compare a dollars-off coupon with a percent-off coupon at your price, and find the break-even price where the two offers save the same.',
  metaDescription: 'Dollars off vs percent off calculator: see which coupon saves more at your price and the break-even price where $ off and % off are equal.',
  updated: '2026-11-27',
  keywords: ['dollars off vs percent off', '$ off or % off calculator', 'which coupon is better', 'percent off vs dollar off', 'coupon break-even price', 'compare discounts'],
  inputs: [
    { id: 'price', label: 'Price before any offer', type: 'number', prefix: '$', default: 100, min: 0, step: 0.01, info: 'The full price of what you are buying.' },
    { id: 'dollars', label: 'Offer A: dollars off', type: 'number', prefix: '$', default: 20, min: 0, step: 0.01, info: 'A fixed amount taken off, such as $20 off.' },
    { id: 'pct', label: 'Offer B: percent off', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 0.1, info: 'A share of the price taken off, such as 15% off.' },
  ],
  outputs: [
    { id: 'diff', label: 'Extra you save with the better offer', format: 'currency', primary: true, info: 'The gap between the two final prices.' },
    { id: 'winner', label: 'Better offer', format: 'text', info: 'Which offer leaves the lower price at this price.' },
    { id: 'priceA', label: 'Final price with offer A', format: 'currency', info: 'Price minus the dollars off, never below $0.' },
    { id: 'priceB', label: 'Final price with offer B', format: 'currency', info: 'Price × (1 − percent off).' },
    { id: 'breakEven', label: 'Break-even price', format: 'currency', info: 'Dollars off ÷ percent off. Below this price the dollars-off offer wins; above it the percent-off offer wins.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const dollars = num(v.dollars);
    const pct = num(v.pct);
    if (price === null || dollars === null || pct === null) return { diff: null };
    if (price < 0 || dollars < 0) return { diff: null, error: 'Price and dollars off cannot be negative.' };
    if (pct < 0 || pct > 100) return { diff: null, error: 'Percent off must be between 0 and 100.' };
    const priceA = Math.max(0, price - dollars);
    const priceB = price * (1 - pct / 100);
    const diff = Math.abs(priceA - priceB);
    const breakEven = pct > 0 ? dollars / (pct / 100) : null;
    const tie = diff < 0.005;
    const winner = tie ? 'Tie' : priceA < priceB ? 'Dollars off' : 'Percent off';
    const dLabel = `${money(dollars)} off`;
    const pLabel = `${+pct.toFixed(2)}% off`;
    const steps = [
      `Offer A: ${money(price)} − ${money(dollars)} = ${money(priceA)}`,
      `Offer B: ${money(price)} × (1 − ${+pct.toFixed(2)}%) = ${money(priceB)}`,
      tie ? 'The two final prices are equal at this price.' : `${winner} wins by ${money(diff)}.`,
    ];
    if (breakEven !== null) steps.push(`Break-even price = ${money(dollars)} ÷ ${+pct.toFixed(2)}% = ${money(breakEven)}`);
    return {
      diff,
      winner,
      priceA,
      priceB,
      breakEven,
      tone: tie ? 'ok' : 'good',
      badge: tie ? 'Same price either way' : `${winner === 'Dollars off' ? dLabel : pLabel} wins by ${money(diff)}`,
      chart: {
        type: 'bar',
        title: 'Final price with each offer',
        categories: [dLabel, pLabel],
        series: [{ name: 'Final price', values: [priceA, priceB] }],
        format: { format: 'currency' },
        highlight: tie ? undefined : priceA < priceB ? 0 : 1,
      },
      steps,
    };
  },
  content: {
    formula: ['Offer A price = price − dollars off', 'Offer B price = price × (1 − percent off ÷ 100)', 'Break-even price = dollars off ÷ (percent off ÷ 100)'],
    body: [
      'A dollars-off coupon takes the same amount off every purchase, while a percent-off coupon takes more off as the price goes up. That means the better one depends on how much you are spending.',
      'The break-even price is where the two save exactly the same. For $20 off against 15% off it is $20 ÷ 0.15 = $133.33. At $100, $20 off gives $80.00 and 15% off gives $85.00, so dollars off wins by $5.00. At $200, $20 off gives $180.00 and 15% off gives $170.00, so percent off wins by $10.00.',
      'Check the fine print of each offer, such as minimum spend, excluded items and whether offers can be stacked. This tool compares one offer against the other, not both together.',
    ],
    faq: [
      { q: 'How do I know whether dollars off or percent off is better?', a: 'Divide the dollars off by the percent off (as a decimal). That is the break-even price. Below it the dollars-off offer saves more; above it the percent-off offer saves more.' },
      { q: 'What is the break-even price for $20 off vs 15% off?', a: '$20 ÷ 0.15 = $133.33. At that price both offers save $20.00.' },
      { q: 'Which is better at $100, $20 off or 15% off?', a: '$20 off. It brings the price to $80.00, while 15% off brings it to $85.00, so you save $5.00 more.' },
      { q: 'What if the dollars off is more than the price?', a: 'The final price stops at $0. You cannot get a negative price, so the calculator clamps offer A at $0.' },
    ],
    sources: [],
  },
  related: ['discount', 'black-friday-deal-check'],
  examples: [
    // A = 100-20 = 80; B = 100*0.85 = 85; diff 5; break-even 20/0.15 = 133.3333
    { values: { price: 100, dollars: 20, pct: 15 }, expect: { priceA: 80, priceB: 85, diff: 5, winner: 'Dollars off', breakEven: 133.3333 }, tolerance: 0.001 },
    // A = 180; B = 200*0.85 = 170; diff 10
    { values: { price: 200, dollars: 20, pct: 15 }, expect: { priceA: 180, priceB: 170, diff: 10, winner: 'Percent off' }, tolerance: 0.001 },
    // $10 off vs 25% off: break-even 10/0.25 = 40; at $40 both give 30
    { values: { price: 40, dollars: 10, pct: 25 }, expect: { priceA: 30, priceB: 30, diff: 0, winner: 'Tie', breakEven: 40 }, tolerance: 0.001 },
  ],
});
