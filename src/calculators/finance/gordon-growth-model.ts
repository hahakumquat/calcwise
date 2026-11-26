import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'gordon-growth-model',
  title: 'Gordon Growth Model Calculator',
  category: 'finance',
  description: 'Value a stock from its dividend, expected dividend growth and the return you require, then compare that value with the market price.',
  metaDescription: 'Gordon growth model calculator: value a dividend stock from its dividend, growth rate and required return, and see the implied return at today\'s price.',
  updated: '2026-11-26',
  keywords: ['gordon growth model calculator', 'dividend discount model calculator', 'stock valuation dividend', 'intrinsic value dividend stock', 'ddm calculator', 'implied return dividend stock'],
  inputs: [
    { id: 'd0', label: 'Last annual dividend per share', type: 'number', prefix: '$', default: 2, min: 0, step: 0.01, info: 'Total dividends paid per share over the last 12 months.' },
    { id: 'g', label: 'Dividend growth forever', type: 'number', suffix: '% a year', default: 3, step: 0.1, info: 'The steady yearly growth you assume for the dividend. It must stay below the required return.' },
    { id: 'r', label: 'Required return', type: 'number', suffix: '% a year', default: 8, step: 0.1, info: 'The yearly return you want to earn to hold this stock.' },
    { id: 'price', label: 'Current share price', type: 'number', prefix: '$', default: 50, min: 0, step: 0.01, info: 'Today\'s market price, used to find the return the market is pricing in.' },
  ],
  outputs: [
    { id: 'value', label: 'Value per share', format: 'currency', primary: true, info: 'Next year\'s dividend ÷ (required return − growth).' },
    { id: 'd1', label: 'Next year\'s dividend', format: 'currency', info: 'Last dividend × (1 + growth).' },
    { id: 'implied', label: 'Return implied by the price', format: 'percent', precision: 2, info: 'Next year\'s dividend ÷ price + growth: what you earn if the assumptions hold and you pay today\'s price.' },
    { id: 'gap', label: 'Value vs price', format: 'percent', precision: 1, info: 'Positive means the model value is above the price; negative means below.' },
  ],
  compute: (v) => {
    const d0 = num(v.d0);
    const g = num(v.g);
    const r = num(v.r);
    const price = num(v.price);
    if (d0 === null || g === null || r === null || price === null) return { value: null };
    if (d0 < 0 || price <= 0) return { value: null, error: 'Dividend cannot be negative and the price must be above zero.' };
    if (r <= g) return { value: null, error: 'Required return must be higher than the growth rate, or the formula breaks down.' };
    if (r <= 0) return { value: null, error: 'Required return must be above zero.' };
    const gr = g / 100;
    const rr = r / 100;
    const d1 = d0 * (1 + gr);
    const value = d1 / (rr - gr);
    const implied = d1 / price + gr;
    const gap = value / price - 1;
    return {
      value,
      d1,
      implied,
      gap,
      tone: gap >= 0 ? 'ok' : 'warn',
      badge: `${money(value)} vs ${money(price)}`,
      chart: {
        type: 'bar',
        title: 'Model value vs market price',
        categories: ['Model value', 'Market price'],
        series: [{ name: 'Per share', values: [value, price] }],
      },
      steps: [
        `Next year's dividend = ${money(d0)} × (1 + ${g}%) = ${money(d1)}`,
        `Value = ${money(d1)} ÷ (${r}% − ${g}%) = ${money(value)}`,
        `Implied return at ${money(price)} = ${money(d1)} ÷ ${money(price)} + ${g}% = ${+(implied * 100).toFixed(2)}%`,
        'A simple model, not advice: small changes in growth or required return move the value a lot.',
      ],
    };
  },
  content: {
    formula: ['D1 = D0 × (1 + g)', 'Value = D1 ÷ (r − g)', 'Implied return = D1 ÷ Price + g'],
    body: [
      'The Gordon growth model values a stock as a stream of dividends that grows at a steady rate forever. Take next year\'s dividend and divide it by the gap between the return you require and the growth rate.',
      'With a $2.00 dividend, 3% growth and an 8% required return, next year\'s dividend is $2.06 and the value is $2.06 ÷ 0.05 = $41.20. If the stock trades at $50 you would earn about $2.06 ÷ $50 + 3% = 7.12% if the assumptions hold, below the 8% you wanted.',
      'It is a simple model, not advice. It only suits companies that pay steady, growing dividends, and the answer swings sharply when the required return and growth rate are close. Growth must stay below the required return or the formula has no answer.',
    ],
    faq: [
      { q: 'What is the Gordon growth model formula?', a: 'Value = D1 ÷ (r − g), where D1 is next year\'s dividend, r is the required return and g is the constant dividend growth rate.' },
      { q: 'What is the value of a $2 dividend growing 3% at an 8% required return?', a: 'Next year\'s dividend is $2.06, so the value is $2.06 ÷ (0.08 − 0.03) = $41.20 per share.' },
      { q: 'Why must the required return be higher than growth?', a: 'If growth were equal or higher, the dividends would be worth an infinite amount in the formula. Real companies cannot out-grow the economy forever, so the model needs r above g.' },
      { q: 'Does this work for stocks with no dividend?', a: 'No. With no dividend the model gives a value of zero. Use it only for companies that pay a steady dividend.' },
    ],
    sources: [],
  },
  related: ['yield-on-cost', 'dividend-payout-ratio-calculator'],
  examples: [
    // D1 = 2*1.03 = 2.06; value = 2.06/0.05 = 41.20; implied = 2.06/50 + 0.03 = 0.0712; gap = 41.2/50 - 1 = -0.176
    { values: { d0: 2, g: 3, r: 8, price: 50 }, expect: { value: 41.2, d1: 2.06, implied: 0.0712, gap: -0.176 }, tolerance: 0.0001 },
    // no growth: value = 1/0.05 = 20; implied = 1/25 = 0.04; gap = 20/25 - 1 = -0.2
    { values: { d0: 1, g: 0, r: 5, price: 25 }, expect: { value: 20, d1: 1, implied: 0.04, gap: -0.2 }, tolerance: 0.0001 },
  ],
});
