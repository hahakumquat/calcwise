import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'free-shipping-threshold',
  title: 'Free Shipping Threshold Calculator',
  category: 'finance',
  description: 'See how far your cart is from free shipping and whether adding a filler item costs less than paying the shipping fee. Gap, net cost and total either way.',
  keywords: ['free shipping threshold calculator', 'is free shipping worth it', 'add item for free shipping', 'shipping fee vs filler item', 'free shipping minimum', 'how much to add for free shipping'],
  updated: '2026-11-21',
  inputs: [
    { id: 'cart', label: 'Cart total', type: 'number', prefix: '$', default: 38, min: 0, step: 0.01, info: 'Your items before shipping.' },
    { id: 'threshold', label: 'Free shipping threshold', type: 'number', prefix: '$', default: 50, min: 0, step: 0.01, info: 'The order total at which shipping becomes free.' },
    { id: 'fee', label: 'Shipping fee if you do not reach it', type: 'number', prefix: '$', default: 6.99, min: 0, step: 0.01, info: 'What the store would charge for shipping on your current cart.' },
    { id: 'filler', label: 'Price of the item you would add', type: 'number', prefix: '$', default: 12, min: 0, step: 0.01, help: 'It must be at least the gap to the threshold.', info: 'The extra item you are thinking of adding to reach free shipping.' },
  ],
  outputs: [
    { id: 'netCost', label: 'Net cost of adding the item', format: 'currency', primary: true, info: 'Item price − shipping fee you avoid. Negative means adding it costs less than paying shipping.' },
    { id: 'gap', label: 'Gap to free shipping', format: 'currency', info: 'Threshold − cart total.' },
    { id: 'payWithout', label: 'Total without the item', format: 'currency', info: 'Cart total + shipping fee.' },
    { id: 'payWith', label: 'Total with the item', format: 'currency', info: 'Cart total + item price, with free shipping.' },
  ],
  compute: (v) => {
    const cart = num(v.cart);
    const threshold = num(v.threshold);
    const fee = num(v.fee);
    const filler = num(v.filler);
    if (cart === null || threshold === null || fee === null || filler === null) return { netCost: null };
    if (cart < 0 || threshold < 0 || fee < 0 || filler < 0) return { netCost: null, error: 'Values cannot be negative.' };
    if (threshold === 0) return { netCost: null, error: 'Threshold must be above zero.' };
    if (cart >= threshold) return { netCost: null, error: 'Your cart already reaches the threshold, so shipping is free.' };
    const gap = threshold - cart;
    if (filler < gap - 1e-9) return { netCost: null, error: `The item must cost at least ${money(gap)} to reach the threshold.` };
    const netCost = filler - fee;
    const payWithout = cart + fee;
    const payWith = cart + filler;
    const tone = netCost <= 0 ? 'good' : netCost < filler / 2 ? 'ok' : 'warn';
    const badge = netCost <= 0 ? `Adding it costs ${money(-netCost)} less than paying shipping` : `Adding it costs ${money(netCost)} more than paying shipping`;
    return {
      netCost,
      gap,
      payWithout,
      payWith,
      tone,
      badge,
      note: 'Adding an item only makes sense if you want it. Check the store\'s return and shipping terms, and whether the threshold is measured before or after discounts and tax.',
      chart: {
        type: 'bar',
        title: 'What you pay: without vs with the item',
        categories: ['Pay shipping', 'Add the item'],
        series: [
          { name: 'Cart', values: [cart, cart] },
          { name: 'Shipping', values: [fee, 0] },
          { name: 'Added item', values: [0, filler] },
        ],
        format: CURRENCY,
        stacked: true,
      },
      steps: [
        `Gap = ${money(threshold)} − ${money(cart)} = ${money(gap)}.`,
        `Without the item you pay ${money(cart)} + ${money(fee)} shipping = ${money(payWithout)}.`,
        `With the item you pay ${money(cart)} + ${money(filler)} = ${money(payWith)}, so its net cost is ${money(filler)} − ${money(fee)} = ${money(netCost)}.`,
      ],
    };
  },
  content: {
    formula: [
      'Gap = free shipping threshold − cart total',
      'Net cost of the item = item price − shipping fee avoided',
      'Total without = cart + shipping fee; total with = cart + item price',
    ],
    body: [
      'Free shipping thresholds nudge you to add one more item. Whether that is a good move comes down to simple arithmetic: the item you add costs its price, but you stop paying the shipping fee.',
      'Enter your cart total, the threshold, the shipping fee and the price of the item you would add. The calculator shows the gap, the net cost of the item once the saved fee is taken off, and the total each way.',
      'If the net cost is above zero you are paying more overall to avoid the fee. That is fine if you want the item, but not a saving. The cheapest way to qualify is an item priced at exactly the gap.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'Your cart is $38, the threshold is $50 and shipping is $6.99. The gap is $12.00. Adding a $12 item brings the total to $50.00 with free shipping, versus $44.99 if you just pay the fee. The item\'s net cost is $12.00 − $6.99 = $5.01.',
        ],
      },
    ],
    faq: [
      { q: 'Is it worth adding an item to get free shipping?', a: 'Only if you want the item. With a $38 cart, $50 threshold and $6.99 fee, a $12 item makes you pay $50.00 instead of $44.99, a net cost of $5.01.' },
      { q: 'When does adding an item actually save money?', a: 'When the item costs less than the shipping fee you avoid. A $5 item reaching the threshold on a $6.99 fee would cost $1.99 less than paying shipping, and only if the gap is $5 or less.' },
      { q: 'What if my item costs less than the gap?', a: 'Then the cart still does not reach the threshold and shipping is still charged. The calculator asks for an item at least as large as the gap, here $12.00.' },
      { q: 'Does the threshold include tax and discounts?', a: 'It depends on the store. Check its shipping policy, since some measure the total before coupons or tax. This is general information, not financial advice.' },
    ],
  },
  related: ['discount', 'sales-tax', 'dimensional-weight', 'holiday-spending-total'],
  examples: [
    // gap 50-38 = 12; net 12-6.99 = 5.01; without 38+6.99 = 44.99; with 38+12 = 50
    { values: { cart: 38, threshold: 50, fee: 6.99, filler: 12 }, expect: { netCost: 5.01, gap: 12, payWithout: 44.99, payWith: 50 } },
    // gap 75-70 = 5; net 5-8 = -3; without 78; with 75
    { values: { cart: 70, threshold: 75, fee: 8, filler: 5 }, expect: { netCost: -3, gap: 5, payWithout: 78, payWith: 75 } },
  ],
});
