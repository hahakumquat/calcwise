import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { moneyDonut } from '../../lib/helpers/finance';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'discount',
  title: 'Discount Calculator',
  category: 'finance',
  description: 'Work out the sale price and how much you save, including stacked "extra % off" discounts and sales tax.',
  keywords: ['percent off', 'sale price', 'discount price', 'extra percent off', 'how much do I save', 'coupon'],
  inputs: [
    { id: 'price', label: 'Original price', type: 'number', prefix: '$', default: 80, min: 0, info: 'The regular price before any discount.' },
    { id: 'discount', label: 'Discount', type: 'number', suffix: '% off', default: 25, min: 0, max: 100, step: 1, info: 'The percentage off advertised, e.g. 25 for \'25% off\'.' },
    { id: 'extra', label: 'Extra discount (applied after)', type: 'number', suffix: '% off', min: 0, max: 100, step: 1, optional: true, placeholder: '0', help: 'e.g. "take an extra 10% off sale prices".', info: 'A second discount taken off the already-reduced price, such as a coupon or \'extra 10% off sale items\'.' },
    { id: 'taxRate', label: 'Sales tax', type: 'number', suffix: '%', min: 0, step: 0.025, optional: true, placeholder: '0', info: 'Your local sales tax rate, applied to the discounted price. Leave blank to ignore tax.' },
  ],
  outputs: [
    { id: 'salePrice', label: 'Sale price', format: 'currency', primary: true, info: 'What you pay after all discounts, before tax.' },
    { id: 'savings', label: 'You save', format: 'currency', info: 'How much less you pay than the original price.' },
    { id: 'totalDiscount', label: 'Total discount', format: 'percent', precision: 2, info: 'The overall percentage off after combining every discount.' },
    { id: 'withTax', label: 'Price with tax', format: 'currency', info: 'The sale price plus sales tax — what you pay at checkout.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const d = num(v.discount);
    const e = num(v.extra) ?? 0;
    const tax = num(v.taxRate) ?? 0;
    if (price === null || d === null || price < 0 || d < 0 || d > 100 || e < 0 || e > 100 || tax < 0) return { salePrice: null };
    const afterFirst = price * (1 - d / 100);
    const salePrice = afterFirst * (1 - e / 100);
    const savings = price - salePrice;
    const totalDiscount = price > 0 ? savings / price : 0;
    return {
      salePrice,
      savings,
      totalDiscount,
      withTax: salePrice * (1 + tax / 100),
      chart: moneyDonut('Original price', [{ label: 'You pay', value: salePrice }, { label: 'You save', value: savings }], pct(totalDiscount, 0), 'off'),
      steps: [
        `${money(price)} × (1 − ${d}%) = ${money(afterFirst)}`,
        ...(e ? [`${money(afterFirst)} × (1 − ${e}%) = ${money(salePrice)}`] : []),
        `Savings = ${money(price)} − ${money(salePrice)} = ${money(savings)}`,
      ],
      note: e ? `${d}% off plus an extra ${e}% off is ${pct(totalDiscount)} off in total — not ${d + e}%.` : undefined,
    };
  },
  content: {
    formula: ['Sale price = price × (1 − d) × (1 − e)', 'Total discount = 1 − (1 − d)(1 − e)'],
    body: [
      'A discount is a percentage taken off the original price. To find the sale price, multiply the price by what is left after the discount: 25% off means you pay 75%, so a $80 item costs $80 × 0.75 = $60.',
      'Stacked discounts multiply rather than add. "30% off, then an extra 20% off" leaves you paying 70% × 80% = 56% of the original price — a 44% discount, not 50%. The calculator applies the extra discount to the already-reduced price, which is how stores almost always do it.',
      'Sales tax is normally charged on the price after discounts, so the "price with tax" line applies your tax rate to the final sale price.',
    ],
    faq: [
      { q: 'How do I calculate a discount in my head?', a: 'Find 10% by moving the decimal one place left, then scale. For 30% off $45: 10% is $4.50, so 30% is $13.50 and the sale price is $31.50.' },
      { q: 'Does the order of stacked discounts matter?', a: 'No. Because the discounts multiply, 20% then 30% off gives exactly the same price as 30% then 20% off.' },
      { q: 'How do I find the original price from a sale price?', a: 'Divide the sale price by the fraction you paid. A $60 item that was 25% off originally cost $60 ÷ 0.75 = $80.' },
    ],
  },
  related: ['sales-tax', 'percentage', 'markup', 'profit-margin'],
  examples: [
    { values: { price: 80, discount: 25, extra: null, taxRate: null }, expect: { salePrice: 60, savings: 20, totalDiscount: 0.25 } },
    { values: { price: 100, discount: 30, extra: 20, taxRate: 10 }, expect: { salePrice: 56, totalDiscount: 0.44, withTax: 61.6 } },
  ],
});
