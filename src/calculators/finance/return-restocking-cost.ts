import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'return-restocking-cost',
  title: 'Return Restocking Fee: What a Return Costs',
  category: 'finance',
  description: 'See what you get back after a restocking fee and return shipping, and whether returning an item beats keeping it.',
  keywords: ['restocking fee calculator', 'return shipping cost', 'is it worth returning', 'return vs keep', 'refund after restocking fee'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'price', label: 'Item price', type: 'number', prefix: '$', default: 129.99, min: 0, step: 1, info: 'What you paid for the item.' },
    { id: 'fee', label: 'Restocking fee', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 1, info: 'Percent of the price the store keeps. Check the return policy; many stores charge 0%.' },
    { id: 'ship', label: 'Return shipping you pay', type: 'number', prefix: '$', default: 12, min: 0, step: 1, info: 'Use 0 if the store pays or you drop it off for free.' },
    { id: 'worth', label: 'What it is worth to you if you keep it', type: 'number', prefix: '$', default: 80, min: 0, step: 5, info: 'A price you would pay for it today, or what you could resell it for.' },
  ],
  outputs: [
    { id: 'refund', label: 'Refund you get', format: 'currency', precision: 2, primary: true, info: 'Price minus restocking fee minus return shipping.' },
    { id: 'feeAmt', label: 'Restocking fee', format: 'currency', precision: 2, info: 'Price × fee percent.' },
    { id: 'lost', label: 'Lost to the return', format: 'currency', precision: 2, info: 'Fee plus return shipping.' },
    { id: 'gain', label: 'Return vs keep', format: 'currency', precision: 2, info: 'Refund minus what the item is worth to you. Positive means returning wins.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const fee = num(v.fee);
    const ship = num(v.ship);
    const worth = num(v.worth);
    if (price === null || fee === null || ship === null || worth === null) return { refund: null };
    if (price <= 0 || fee < 0 || fee > 100 || ship < 0 || worth < 0) return { refund: null };
    const feeAmt = price * fee / 100;
    const refund = price - feeAmt - ship;
    const lost = feeAmt + ship;
    const gain = refund - worth;
    const win = gain > 0;
    return {
      refund,
      feeAmt,
      lost,
      gain,
      tone: win ? 'ok' : 'warn',
      badge: win ? 'Return it' : 'Keep it',
      note: win
        ? `You would get ${money(refund)} back and lose ${money(lost)}. That is ${money(gain)} more than the item is worth to you, so returning comes out ahead.`
        : `You would get ${money(refund)} back and lose ${money(lost)}. The item is worth ${money(Math.abs(gain))} more to you than the refund, so keeping it comes out ahead. Policies differ by store, so check yours.`,
      chart: {
        type: 'bar' as const,
        title: 'Where the price goes if you return it',
        categories: ['Refund', 'Restocking fee', 'Return shipping'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Amount', values: [refund, feeAmt, ship] }],
      },
      steps: [
        `Fee = ${money(price)} × ${fmt(fee)}% = ${money(feeAmt)}`,
        `Refund = ${money(price)} − ${money(feeAmt)} − ${money(ship)} = ${money(refund)}`,
        `Lost = ${money(feeAmt)} + ${money(ship)} = ${money(lost)}`,
        `Return vs keep = ${money(refund)} − ${money(worth)} = ${money(gain)}`,
      ],
    };
  },
  content: {
    formula: [
      'Fee = price × restocking fee %',
      'Refund = price − fee − return shipping',
      'Return vs keep = refund − what the item is worth to you',
    ],
    body: [
      'After the holidays, many returns come with a restocking fee and a shipping label you pay for. Both come out of your refund, so the money you get back can be well below the price. This calculator shows the refund and compares it with what the item is worth to you.',
      'Example: a $129.99 item with a 15% fee and $12.00 return shipping. The fee is $19.50, so the refund is $98.49 and $31.50 is lost. If you would value the item at $80, returning gains $18.49. If you would value it at $110, keeping it is better.',
      'Return windows, fee rules and who pays shipping differ by store, so read the policy before you ship anything. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is a restocking fee?', a: 'It is a percentage of the price that a store keeps when you return an item. On a $129.99 item at 15% the fee is $19.50.' },
      { q: 'How much do I get back after the fee and shipping?', a: 'Price minus fee minus shipping. For $129.99, 15% and $12.00 shipping that is $98.49.' },
      { q: 'How do I decide between returning and keeping?', a: 'Compare the refund with what the item is worth to you. If the refund is higher, return it; if not, keep it or resell it.' },
      { q: 'What should I enter as the item\'s worth?', a: 'A price you would pay for it today, or what you could sell it for secondhand. It is your own estimate.' },
      { q: 'Are restocking fees always the same?', a: 'No. Many stores charge nothing, and some waive the fee for defective items. Check the return policy for your order.' },
    ],
    sources: [],
  },
  related: ['free-shipping-threshold', 'cost-per-use', 'black-friday-deal-check', 'discount'],
  examples: [
    // fee 19.4985; refund 98.4915; lost 31.4985; gain 18.4915
    { values: { price: 129.99, fee: 15, ship: 12, worth: 80 }, expect: { refund: 98.49, feeAmt: 19.5, lost: 31.5, gain: 18.49 }, tolerance: 0.001 },
    // no fee, no shipping: refund 100, gain -20
    { values: { price: 100, fee: 0, ship: 0, worth: 120 }, expect: { refund: 100, feeAmt: 0, lost: 0, gain: -20 } },
  ],
});
