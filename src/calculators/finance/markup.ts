import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { moneyDonut } from '../../lib/helpers/finance';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'markup',
  title: 'Markup Calculator',
  category: 'finance',
  description: 'Find the selling price from cost and markup percentage, plus the profit and resulting margin.',
  keywords: ['markup', 'markup percentage', 'pricing', 'selling price', 'cost plus pricing', 'wholesale to retail'],
  inputs: [
    { id: 'cost', label: 'Cost', type: 'number', prefix: '$', default: 50, min: 0, info: 'What the item costs you, including purchase price and any per-item costs such as shipping.' },
    { id: 'markup', label: 'Markup', type: 'number', suffix: '%', default: 40, min: 0, step: 1, info: 'The percentage added on top of cost. A 100% markup doubles the price.' },
  ],
  outputs: [
    { id: 'price', label: 'Selling price', format: 'currency', primary: true, info: 'The selling price after adding the markup to cost.' },
    { id: 'profit', label: 'Profit', format: 'currency', info: 'The dollar amount the markup adds per item.' },
    { id: 'margin', label: 'Profit margin', format: 'percent', precision: 2, info: 'The same profit as a share of the selling price. It is always lower than the markup.' },
  ],
  compute: (v) => {
    const cost = num(v.cost);
    const m = num(v.markup);
    if (cost === null || m === null || cost < 0 || m <= -100) return { price: null };
    const profit = (cost * m) / 100;
    const price = cost + profit;
    return {
      price,
      profit,
      margin: price > 0 ? profit / price : null,
      chart: moneyDonut('Selling price', [{ label: 'Cost', value: cost }, { label: 'Markup (profit)', value: profit }], money(price), 'price'),
      steps: [`Profit = ${money(cost)} × ${m}% = ${money(profit)}`, `Price = ${money(cost)} + ${money(profit)} = ${money(price)}`, ...(price > 0 ? [`Margin = ${money(profit)} ÷ ${money(price)} = ${pct(profit / price)}`] : [])],
    };
  },
  content: {
    formula: ['Price = cost × (1 + markup)', 'Profit = cost × markup', 'Margin = markup ÷ (1 + markup)'],
    body: [
      'Markup is the amount added on top of cost to set a selling price, expressed as a percentage of the cost. It is the natural way to price when you know what something costs you: a $50 item with a 40% markup sells for $70.',
      'Markup always overstates your margin. The same $20 profit is 40% of the $50 cost but only 28.6% of the $70 price. Retailers often quote "keystone" pricing — a 100% markup, doubling the cost — which works out to a 50% margin.',
      'When setting prices, make sure the markup covers not just the item cost but its share of overhead such as rent, wages, shipping and payment fees. Use the break-even calculator to check how many sales you need at a given price.',
    ],
    faq: [
      { q: 'How do I convert markup to margin?', a: 'Margin = markup ÷ (1 + markup). A 25% markup gives 0.25 ÷ 1.25 = 20% margin. To go the other way, markup = margin ÷ (1 − margin).' },
      { q: 'What markup do I need for a 50% margin?', a: 'A 100% markup — selling at double the cost.' },
    ],
  },
  related: ['profit-margin', 'break-even', 'discount', 'sales-tax'],
  examples: [
    { values: { cost: 50, markup: 40 }, expect: { price: 70, profit: 20, margin: 0.2857142857 } },
    { values: { cost: 30, markup: 100 }, expect: { price: 60, margin: 0.5 } },
  ],
});
