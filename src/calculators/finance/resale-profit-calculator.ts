import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'resale-profit-calculator',
  title: 'Resale Profit Calculator',
  category: 'finance',
  description: 'Work out what you really keep when you resell an item: platform fee, fixed fee, shipping and item cost taken off, with profit, margin and profit per hour.',
  keywords: ['resale profit calculator', 'reseller profit calculator', 'ebay profit calculator', 'poshmark profit', 'depop profit', 'flipping profit per hour', 'marketplace fee calculator'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'price', label: 'Sale price', type: 'number', prefix: '$', default: 60, min: 0, step: 1, info: 'What the buyer pays for the item, before the platform takes its cut.' },
    { id: 'feePct', label: 'Platform fee', type: 'number', default: 12, min: 0, max: 100, step: 0.1, suffix: '% of price', info: 'The percentage the marketplace takes from the sale. Check your platform\'s current fee page.' },
    { id: 'feeFixed', label: 'Fixed fee per sale', type: 'number', prefix: '$', default: 0.3, min: 0, step: 0.05, optional: true, info: 'A flat amount charged on each sale, such as a payment processing fee. Leave blank if none.' },
    { id: 'shipping', label: 'Shipping you pay', type: 'number', prefix: '$', default: 7, min: 0, step: 0.5, optional: true, info: 'Postage and packaging that comes out of your pocket. Leave blank if the buyer pays it all.' },
    { id: 'cost', label: 'Item cost', type: 'number', prefix: '$', default: 15, min: 0, step: 1, info: 'What you paid for the item.' },
    { id: 'hours', label: 'Hours spent', type: 'number', default: 1.5, min: 0, step: 0.25, suffix: 'hours', optional: true, info: 'Sourcing, photos, listing, messages and packing. Optional; used for profit per hour.' },
  ],
  outputs: [
    { id: 'profit', label: 'Profit', format: 'currency', precision: 2, primary: true, info: 'Sale price minus fees, shipping and item cost.' },
    { id: 'fees', label: 'Total fees', format: 'currency', precision: 2, info: 'Sale price × platform fee % + fixed fee.' },
    { id: 'margin', label: 'Profit margin', format: 'percent', precision: 1, info: 'Profit ÷ sale price.' },
    { id: 'perHour', label: 'Profit per hour', format: 'currency', precision: 2, info: 'Profit ÷ hours spent. Blank if no hours are entered.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const pct = num(v.feePct);
    const fixed = num(v.feeFixed) ?? 0;
    const ship = num(v.shipping) ?? 0;
    const cost = num(v.cost);
    const hours = num(v.hours);
    if (price === null || pct === null || cost === null) return { profit: null };
    if (price < 0 || pct < 0 || pct > 100 || fixed < 0 || ship < 0 || cost < 0 || (hours !== null && hours < 0)) return { profit: null };
    if (price === 0) return { profit: null, error: 'Enter a sale price above zero.' };
    const fees = price * (pct / 100) + fixed;
    const profit = price - fees - ship - cost;
    const margin = profit / price;
    const perHour = hours !== null && hours > 0 ? profit / hours : null;
    const loss = profit < 0;
    const chart = loss
      ? undefined
      : {
          type: 'donut' as const,
          title: 'Where the sale price goes',
          slices: [
            { label: 'Your profit', value: profit },
            { label: 'Item cost', value: cost },
            { label: 'Shipping', value: ship },
            { label: 'Fees', value: fees },
          ],
          format: { format: 'currency' as const, precision: 2 },
          centerLabel: 'Sale price',
          centerValue: money(price),
        };
    return {
      profit,
      fees,
      margin,
      perHour,
      tone: loss ? 'bad' : margin >= 0.2 ? 'good' : 'ok',
      badge: loss ? `${money(-profit)} loss` : `${fmt(margin * 100, 1)}% margin`,
      note: loss
        ? `After ${money(fees)} of fees, ${money(ship)} shipping and ${money(cost)} item cost, this sale loses ${money(-profit)}.`
        : `You keep ${money(profit)} of the ${money(price)} sale, a ${fmt(margin * 100, 1)}% margin.${perHour !== null ? ` Over ${fmt(hours as number)} hours that is ${money(perHour)} an hour.` : ''}`,
      chart,
      steps: [
        `Fees = ${money(price)} × ${fmt(pct)}% + ${money(fixed)} = ${money(fees)}`,
        `Profit = ${money(price)} − ${money(fees)} − ${money(ship)} − ${money(cost)} = ${money(profit)}`,
        `Margin = ${money(profit)} ÷ ${money(price)} = ${fmt(margin * 100, 1)}%`,
        ...(perHour !== null ? [`Per hour = ${money(profit)} ÷ ${fmt(hours as number)} = ${money(perHour)}`] : []),
      ],
    };
  },
  content: {
    formula: [
      'Fees = sale price × platform fee % + fixed fee',
      'Profit = sale price − fees − shipping you pay − item cost',
      'Margin = profit ÷ sale price',
      'Profit per hour = profit ÷ hours spent',
    ],
    body: [
      'The sale price is not what you keep. A marketplace takes a percentage and often a flat fee, you may pay for postage, and you already paid for the item. This calculator takes each of those off so you see the real profit on a flip.',
      'Example: an item sells for $60 on a platform that charges 12% plus $0.30. Fees are $60 × 0.12 + $0.30 = $7.50. With $7 of shipping and a $15 item cost, profit is $60 − $7.50 − $7 − $15 = $30.50, a 50.8% margin. If it took 1.5 hours to source, list and pack, that is $20.33 an hour.',
      'Fee rates differ by platform and change over time, so enter the figures from your own seller dashboard. This does not include income tax, returns, listing upgrades or promoted-listing charges; add those to the fixed fee or item cost if they apply. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I calculate resale profit?', a: 'Take the sale price, subtract the platform fees, the shipping you pay and what you paid for the item. For a $60 sale with 12% + $0.30 fees, $7 shipping and a $15 cost, profit is $30.50.' },
      { q: 'What is the profit margin in that example?', a: '$30.50 ÷ $60 is 50.8%. Margin is measured against the sale price, not the cost.' },
      { q: 'How is profit per hour worked out?', a: 'Profit divided by the hours you spent. $30.50 over 1.5 hours is $20.33 an hour.' },
      { q: 'Can the result be negative?', a: 'Yes. If fees, shipping and cost add up to more than the sale price, the calculator shows a loss.' },
    ],
    sources: [],
  },
  related: ['profit-margin', 'markup', 'side-hustle-goal', 'break-even'],
  examples: [
    // fees 60*0.12 + 0.30 = 7.5; profit 60 - 7.5 - 7 - 15 = 30.5; margin 30.5/60 = 0.508333; per hour 30.5/1.5 = 20.3333
    { values: { price: 60, feePct: 12, feeFixed: 0.3, shipping: 7, cost: 15, hours: 1.5 }, expect: { fees: 7.5, profit: 30.5, margin: 0.508333, perHour: 20.3333 }, tolerance: 1e-4 },
    // fees 100*0.10 = 10; profit 100 - 10 - 0 - 40 = 50; margin 0.5; per hour 50/2 = 25
    { values: { price: 100, feePct: 10, feeFixed: 0, shipping: 0, cost: 40, hours: 2 }, expect: { fees: 10, profit: 50, margin: 0.5, perHour: 25 }, tolerance: 1e-6 },
  ],
});
