import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { moneyDonut } from '../../lib/helpers/finance';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'discount',
  title: 'Stacked Discount Calculator (Black Friday)',
  category: 'finance',
  description: 'Stack two percent-off discounts, add a coupon and sales tax, and see the real total off and final price. Is 30% + 20% off 50%? Find out.',
  keywords: ['percent off', 'sale price', 'discount price', 'extra percent off', 'how much do I save', 'coupon', 'stacked discounts', 'black friday', '30% off then 20% off', 'real total discount'],
  inputs: [
    { id: 'price', label: 'Original price', type: 'number', prefix: '$', default: 80, min: 0, info: 'The regular price before any discount.' },
    { id: 'discount', label: 'Discount', type: 'number', suffix: '% off', default: 25, min: 0, max: 100, step: 1, info: 'The percentage off advertised, e.g. 25 for \'25% off\'.' },
    { id: 'extra', label: 'Extra discount (applied after)', type: 'number', suffix: '% off', min: 0, max: 100, step: 1, optional: true, placeholder: '0', help: 'e.g. "take an extra 10% off sale prices".', info: 'A second discount taken off the already-reduced price, such as a coupon or \'extra 10% off sale items\'.' },
    { id: 'coupon', label: 'Coupon or gift card ($ off)', type: 'number', prefix: '$', min: 0, optional: true, placeholder: '0', help: 'A fixed dollar amount taken off after the percentage discounts.', info: 'A fixed amount off, such as \'$10 off your order\'. It is taken off after both percentage discounts and before tax. The price never goes below $0.' },
    { id: 'taxRate', label: 'Sales tax', type: 'number', suffix: '%', min: 0, step: 0.025, optional: true, placeholder: '0', info: 'Your local sales tax rate, applied to the discounted price. Leave blank to ignore tax.' },
  ],
  outputs: [
    { id: 'salePrice', label: 'Price after discounts', format: 'currency', info: 'What you pay after all discounts and the coupon, before tax.' },
    { id: 'savings', label: 'Total savings (before tax)', format: 'currency', info: 'How much less you pay than the original price, including the coupon.' },
    { id: 'totalDiscount', label: 'Real total off', format: 'percent', precision: 2, info: 'The overall percentage off the original price after combining every discount, including any coupon. Tax is not counted.' },
    { id: 'withTax', label: 'Final price (with tax)', format: 'currency', primary: true, info: 'The price after discounts plus sales tax, which is what you pay at checkout. With no tax entered it equals the price after discounts.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const d = num(v.discount);
    const e = num(v.extra) ?? 0;
    const coupon = num(v.coupon) ?? 0;
    const tax = num(v.taxRate) ?? 0;
    if (price === null || d === null || price < 0 || d < 0 || d > 100 || e < 0 || e > 100 || coupon < 0 || tax < 0) return { salePrice: null };
    const afterFirst = price * (1 - d / 100);
    const afterExtra = afterFirst * (1 - e / 100);
    const salePrice = Math.max(0, afterExtra - coupon);
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
        ...(e ? [`${money(afterFirst)} × (1 − ${e}%) = ${money(afterExtra)}`] : []),
        ...(coupon ? [`${money(afterExtra)} − ${money(coupon)} coupon = ${money(salePrice)}`] : []),
        `Savings = ${money(price)} − ${money(salePrice)} = ${money(savings)}`,
        ...(tax ? [`${money(salePrice)} × (1 + ${tax}%) = ${money(salePrice * (1 + tax / 100))} with tax`] : []),
      ],
      note: e ? `${d}% off plus an extra ${e}% off is ${pct(1 - (1 - d / 100) * (1 - e / 100))} off, not ${d + e}%.${coupon ? ` With the coupon, the real total off is ${pct(totalDiscount)}.` : ''}` : undefined,
    };
  },
  content: {
    formula: ['Sale price = price × (1 − d) × (1 − e)', 'Price after discounts = max(0, price × (1 − d) × (1 − e) − coupon)', 'Real total off = 1 − (1 − d)(1 − e), or (price − price after discounts) ÷ price with a coupon', 'Final price = price after discounts × (1 + tax rate)'],
    body: [
      'A discount is a percentage taken off the original price. To find the sale price, multiply the price by what is left after the discount: 25% off means you pay 75%, so a $80 item costs $80 × 0.75 = $60.',
      'Stacked discounts multiply rather than add. "30% off, then an extra 20% off" leaves you paying 70% × 80% = 56% of the original price — a 44% discount, not 50%. The calculator applies the extra discount to the already-reduced price, which is how stores almost always do it.',
      'A coupon or gift card with a dollar amount is taken off after the percentage discounts here, and the real total off then includes it. Stores differ, and some apply a coupon before the sale percentage, so check your receipt.',
      'Sales tax is normally charged on the price after discounts, so the "final price" applies your tax rate to the price after discounts and the coupon. Rules vary by state and store.',
    ],
    faq: [
      { q: 'Is 30% off plus 20% off the same as 50% off?', a: 'No. 30% off leaves 70% of the price, and 20% off that leaves 80% of it, so you pay 0.70 × 0.80 = 56%. That is 44% off, not 50%. On $200 you pay $112.00 and save $88.00.' },
      { q: 'How do I add a coupon to a Black Friday sale price?', a: 'Enter the percentage discounts, then the dollar coupon. The coupon comes off after the percentages: $200 at 30% then 20% off is $112, and a $10 coupon makes it $102, which is 49% off in total.' },
      { q: 'Is sales tax charged before or after the discount?', a: 'In most US states tax is charged on the price after discounts, which is how this calculator works. Manufacturer coupons can be treated differently, so check your state rules.' },
      { q: 'How do I calculate a discount in my head?', a: 'Find 10% by moving the decimal one place left, then scale. For 30% off $45: 10% is $4.50, so 30% is $13.50 and the sale price is $31.50.' },
      { q: 'Does the order of stacked discounts matter?', a: 'No. Because the discounts multiply, 20% then 30% off gives exactly the same price as 30% then 20% off.' },
      { q: 'How do I find the original price from a sale price?', a: 'Divide the sale price by the fraction you paid. A $60 item that was 25% off originally cost $60 ÷ 0.75 = $80.' },
    ],
  },
  related: ['sales-tax', 'percentage', 'markup', 'profit-margin', 'gift-budget'],
  examples: [
    { values: { price: 80, discount: 25, extra: null, taxRate: null }, expect: { salePrice: 60, savings: 20, totalDiscount: 0.25 } },
    { values: { price: 100, discount: 30, extra: 20, taxRate: 10 }, expect: { salePrice: 56, totalDiscount: 0.44, withTax: 61.6 } },
    // 200 × 0.7 = 140; × 0.8 = 112; 1 − 0.7 × 0.8 = 0.44; savings 88
    { values: { price: 200, discount: 30, extra: 20, coupon: null, taxRate: null }, expect: { salePrice: 112, savings: 88, totalDiscount: 0.44, withTax: 112 } },
    // 112 − 10 coupon = 102; savings 98 → 98/200 = 0.49; 102 × 1.08 = 110.16
    { values: { price: 200, discount: 30, extra: 20, coupon: 10, taxRate: 8 }, expect: { salePrice: 102, savings: 98, totalDiscount: 0.49, withTax: 110.16 } },
  ],
});
