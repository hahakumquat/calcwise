import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'group-gift-split',
  title: 'Group Gift Split Calculator',
  category: 'everyday',
  description: 'Split the cost of a group gift between everyone chipping in. Add sales tax, shipping and a card, and see what each person pays, rounded up to the cent.',
  keywords: ['group gift split', 'split gift cost', 'office gift calculator', 'how much each for a group gift', 'gift contribution calculator', 'split a gift with tax and shipping'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'price', label: 'Gift price', type: 'number', prefix: '$', default: 90, min: 0, step: 5, info: 'The price of the gift before tax.' },
    { id: 'tax', label: 'Sales tax', type: 'number', suffix: '%', default: 8, min: 0, max: 30, step: 0.25, optional: true, info: 'Sales tax rate on the gift. Leave at 0 if the price already includes it.' },
    { id: 'shipping', label: 'Shipping', type: 'number', prefix: '$', default: 6, min: 0, step: 1, optional: true, info: 'Delivery cost, if any.' },
    { id: 'card', label: 'Card or wrapping', type: 'number', prefix: '$', default: 4, min: 0, step: 1, optional: true, info: 'Anything extra you are buying for the gift, such as a card.' },
    { id: 'people', label: 'People chipping in', type: 'number', default: 7, min: 1, max: 500, step: 1, info: 'Everyone who pays, including you.' },
  ],
  outputs: [
    { id: 'each', label: 'Each person pays', format: 'currency', primary: true, info: 'Total ÷ people, rounded up to the next cent so the group never comes up short.' },
    { id: 'total', label: 'Total cost', format: 'currency', info: 'Price plus tax, shipping and card.' },
    { id: 'collected', label: 'Total collected', format: 'currency', info: 'What each person pays × number of people.' },
    { id: 'overage', label: 'Left over', format: 'currency', info: 'Collected minus total. A few cents at most, from rounding up.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const tax = num(v.tax) ?? 0;
    const ship = num(v.shipping) ?? 0;
    const card = num(v.card) ?? 0;
    const people = num(v.people);
    if (price === null || people === null || price < 0 || tax < 0 || ship < 0 || card < 0 || people < 1) return { each: null };
    const n = Math.round(people);
    const totalCents = Math.round(price * (1 + tax / 100) * 100) + Math.round(ship * 100) + Math.round(card * 100);
    if (totalCents <= 0) return { each: null, error: 'Enter a gift price above zero.' };
    const eachCents = Math.ceil(totalCents / n - 1e-9);
    const collectedCents = eachCents * n;
    const overCents = collectedCents - totalCents;
    const total = totalCents / 100;
    const each = eachCents / 100;
    return {
      each,
      total,
      collected: collectedCents / 100,
      overage: overCents / 100,
      tone: 'good',
      badge: `${money(each)} each`,
      note: `The gift comes to ${money(total)} with tax, shipping and extras. Split ${n} ways that is ${money(each)} each, rounded up to the cent, so the group collects ${money(collectedCents / 100)} and has ${money(overCents / 100)} left over.`,
      chart: {
        type: 'donut',
        title: 'Where the total goes',
        format: { format: 'currency' },
        slices: [
          { label: 'Gift', value: price },
          { label: 'Tax', value: totalCents / 100 - price - ship - card },
          { label: 'Shipping', value: ship },
          { label: 'Card', value: card },
        ],
        centerValue: money(total),
        centerLabel: 'total',
      },
      steps: [
        `Total = ${money(price)} × (1 + ${tax}%) + ${money(ship)} + ${money(card)} = ${money(total)}`,
        `Each = ${money(total)} ÷ ${n}, rounded up to the cent = ${money(each)}`,
        `Collected = ${money(each)} × ${n} = ${money(collectedCents / 100)}, left over ${money(overCents / 100)}`,
      ],
    };
  },
  content: {
    formula: [
      'Total = price × (1 + tax rate) + shipping + card',
      'Each person = total ÷ people, rounded up to the next cent',
      'Left over = each × people − total',
    ],
    body: [
      'Splitting a group gift is easy until tax, shipping and a card get added. This calculator adds them to the gift price first, then divides by the number of people, so everyone pays the same amount and nobody has to chase a few dollars.',
      'The share is rounded up to the next cent. That means the group always collects at least the full cost, and any left-over change is only a few cents. Rounding down would leave the organiser out of pocket.',
      'Count everyone who is paying, including yourself. If you want to round each share up to a whole dollar instead, take the result and round it up yourself; the extra becomes a small tip jar for the card or next year. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I split a group gift fairly?', a: 'Add the price, tax, shipping and any card, then divide by the number of people. For a $90 gift with 8% tax, $6 shipping and a $4 card, the total is $107.20, and 7 people pay $15.32 each.' },
      { q: 'Why is the share rounded up?', a: '$107.20 ÷ 7 is $15.3143, which is not a payable amount. Rounding up to $15.32 collects $107.24, so the group is 4 cents over rather than short.' },
      { q: 'Should the organiser pay too?', a: 'Usually yes. Count yourself in the number of people so the total is shared evenly.' },
      { q: 'What if the price already includes tax?', a: 'Set the sales tax to 0 so it is not added twice.' },
    ],
    sources: [],
  },
  related: ['bill-splitter', 'gift-budget', 'tip', 'rent-split', 'holiday-tipping-budget'],
  examples: [
    // 90 × 1.08 = 97.20 + 6 + 4 = 107.20; ÷ 7 = 15.3143 → 15.32; 15.32 × 7 = 107.24; over 0.04.
    { values: { price: 90, tax: 8, shipping: 6, card: 4, people: 7 }, expect: { each: 15.32, total: 107.2, collected: 107.24, overage: 0.04 }, tolerance: 1e-6 },
    // 60 + 0 + 0 + 0 = 60; ÷ 4 = 15 exactly; no overage.
    { values: { price: 60, tax: 0, shipping: 0, card: 0, people: 4 }, expect: { each: 15, total: 60, collected: 60, overage: 0 }, tolerance: 1e-6 },
    // 50 × 1.10 = 55 + 5 = 60; ÷ 8 = 7.50 exactly.
    { values: { price: 50, tax: 10, shipping: 5, card: 0, people: 8 }, expect: { each: 7.5, total: 60, collected: 60, overage: 0 }, tolerance: 1e-6 },
  ],
});
