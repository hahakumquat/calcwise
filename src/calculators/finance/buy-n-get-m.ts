import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'buy-n-get-m',
  title: 'Buy N Get M Free Calculator',
  category: 'finance',
  description: 'Find the real percent off and the price per item of a "buy 2 get 1 free" or any buy N get M free deal, with the total you pay and what you save.',
  keywords: ['buy 2 get 1 free calculator', 'buy one get one free discount', 'bogo calculator', 'buy n get m free', 'bogo percent off', 'buy 3 get 2 free'],
  updated: '2026-11-27',
  inputs: [
    { id: 'price', label: 'Regular price per item', type: 'number', prefix: '$', default: 10, min: 0, step: 0.5, info: 'The normal shelf price of one item before the deal.' },
    { id: 'buy', label: 'Items you pay for (N)', type: 'number', default: 2, min: 1, step: 1, info: 'The "buy" number. In "buy 2 get 1 free" this is 2.' },
    { id: 'free', label: 'Free items (M)', type: 'number', default: 1, min: 1, step: 1, info: 'The "get" number. In "buy 2 get 1 free" this is 1.' },
  ],
  outputs: [
    { id: 'percentOff', label: 'Real discount', format: 'percent', precision: 1, primary: true, info: 'Free items ÷ total items you receive (M ÷ (N + M)).' },
    { id: 'effective', label: 'Effective price per item', format: 'currency', info: 'Regular price × N ÷ (N + M).' },
    { id: 'total', label: 'You pay in total', format: 'currency', info: 'Regular price × N.' },
    { id: 'items', label: 'Items you get', format: 'integer', info: 'Items you pay for plus free items (N + M).' },
    { id: 'saved', label: 'You save', format: 'currency', info: 'Regular price × M, the value of the free items.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const buy = num(v.buy);
    const free = num(v.free);
    if (price === null || buy === null || free === null || price < 0 || buy < 1 || free < 1 || !Number.isInteger(buy) || !Number.isInteger(free)) return { percentOff: null };
    const items = buy + free;
    const percentOff = free / items;
    const effective = (price * buy) / items;
    const total = price * buy;
    const saved = price * free;
    return {
      percentOff,
      effective,
      total,
      items,
      saved,
      tone: percentOff >= 0.4 ? ('good' as const) : ('ok' as const),
      badge: `${fmt(percentOff * 100, 1)}% off`,
      note: `Buy ${fmt(buy)} get ${fmt(free)} free is ${fmt(percentOff * 100, 1)}% off if you actually want all ${fmt(items)} items. You pay $${fmt(total, 2)} and each item costs $${fmt(effective, 2)}.`,
      chart: {
        type: 'bar',
        title: 'Price per item ($)',
        categories: ['Regular price', 'With the deal'],
        series: [{ name: 'Per item', values: [price, effective] }],
        format: { format: 'currency' },
        highlight: 1,
      },
      steps: [
        `Items you get = ${fmt(buy)} + ${fmt(free)} = ${fmt(items)}`,
        `You pay = $${fmt(price, 2)} × ${fmt(buy)} = $${fmt(total, 2)}`,
        `Effective price per item = $${fmt(total, 2)} ÷ ${fmt(items)} = $${fmt(effective, 2)}`,
        `Real discount = ${fmt(free)} ÷ ${fmt(items)} = ${fmt(percentOff * 100, 1)}%`,
        `You save = $${fmt(price, 2)} × ${fmt(free)} = $${fmt(saved, 2)}`,
      ],
    };
  },
  content: {
    formula: [
      'Items you get = N + M',
      'Real discount = M ÷ (N + M)',
      'Effective price per item = regular price × N ÷ (N + M)',
      'Total paid = regular price × N; saved = regular price × M',
    ],
    body: [
      'A "buy 2 get 1 free" sign does not mean a third off in your head, but in arithmetic it does: you receive three items and pay for two, so one of three is free. The calculator turns any buy N get M free offer into a real percent off and a price per item you can compare with other deals.',
      'Buy one get one free is 50% off, buy 2 get 1 free is 33.3% off, and buy 3 get 2 free is 40% off. The more free items relative to paid ones, the bigger the discount.',
      'The percentage only holds if you would have bought all the items anyway. If you only needed one, a smaller straight discount on a single item can cost you less. Everything runs in your browser.',
    ],
    faq: [
      { q: 'How much is buy 2 get 1 free really?', a: 'You get 3 items and pay for 2, so 1 ÷ 3 = 33.3% off. At a regular price of $10, you pay $20 for 3 items, which is $6.67 each.' },
      { q: 'Is buy one get one free the same as 50% off?', a: 'Yes, if you take both items. You pay for 1 of 2, so 1 ÷ 2 = 50% off. At $10 regular, you pay $10 for 2 items, $5 each.' },
      { q: 'What about buy 3 get 2 free?', a: 'You receive 5 items and pay for 3, so 2 ÷ 5 = 40% off. At $25 each you pay $75 in total, which is $15 per item, and you save $50.' },
      { q: 'When is a straight percent off better?', a: 'When you do not want all the items. A free item you do not need has no value to you, so compare the total you pay with what you would pay for only the items you need.' },
    ],
  },
  related: ['discount', 'unit-price', 'bulk-buy-break-even', 'black-friday-deal-check'],
  examples: [
    // buy 2 get 1: items 3; pct 1/3; total 10 x 2 = 20; effective 20/3 = 6.6667; saved 10.
    { values: { price: 10, buy: 2, free: 1 }, expect: { percentOff: 1 / 3, effective: 20 / 3, total: 20, items: 3, saved: 10 }, tolerance: 1e-9 },
    // buy 3 get 2: items 5; pct 2/5 = 0.4; total 75; effective 75/5 = 15; saved 50.
    { values: { price: 25, buy: 3, free: 2 }, expect: { percentOff: 0.4, effective: 15, total: 75, items: 5, saved: 50 }, tolerance: 1e-9 },
    // buy 1 get 1: pct 0.5; effective 5; total 10; saved 10.
    { values: { price: 10, buy: 1, free: 1 }, expect: { percentOff: 0.5, effective: 5, total: 10, items: 2, saved: 10 }, tolerance: 1e-9 },
  ],
});
