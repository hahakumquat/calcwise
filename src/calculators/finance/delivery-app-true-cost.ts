import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'delivery-app-true-cost',
  title: 'Delivery App True Cost Calculator',
  category: 'finance',
  description: 'See what a food delivery order really costs after app markup, delivery and service fees, tax and tip, compared with pickup, and the yearly total.',
  keywords: ['delivery app true cost', 'doordash real cost', 'uber eats cost calculator', 'food delivery fees calculator', 'delivery vs pickup cost', 'how much do delivery apps cost'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'menu', label: 'Menu price in the restaurant', type: 'number', prefix: '$', default: 20, min: 0, step: 0.5, info: 'The food price on the restaurant\'s own menu or in-store.' },
    { id: 'markup', label: 'App menu markup', type: 'number', suffix: '%', default: 15, min: 0, step: 1, optional: true, info: 'How much higher the same items are priced in the app. Check one item in both places. Leave blank for none.' },
    { id: 'delivery', label: 'Delivery fee', type: 'number', prefix: '$', default: 3.99, min: 0, step: 0.25, optional: true, info: 'The delivery fee shown at checkout.' },
    { id: 'service', label: 'Service fee', type: 'number', prefix: '$', default: 2.5, min: 0, step: 0.25, optional: true, info: 'Service, small-order and other fees at checkout.' },
    { id: 'tip', label: 'Tip', type: 'number', suffix: '%', default: 18, min: 0, step: 1, optional: true, info: 'Tip as a percent of the in-app food price. Assumption: tip is on food only.' },
    { id: 'tax', label: 'Sales tax', type: 'number', suffix: '%', default: 8, min: 0, step: 0.25, optional: true, info: 'Assumption: tax applies to the in-app food price only, not fees. Rules vary by place.' },
    { id: 'orders', label: 'Orders per week', type: 'number', default: 2, min: 0, step: 0.5, optional: true, suffix: 'a week', info: 'Used for the yearly cost. Leave blank to skip.' },
  ],
  outputs: [
    { id: 'total', label: 'Real cost of the order', format: 'currency', precision: 2, primary: true, info: 'App food price + tax + tip + delivery fee + service fee.' },
    { id: 'pickup', label: 'Same food, picked up', format: 'currency', precision: 2, info: 'Menu price plus tax, no tip.' },
    { id: 'premium', label: 'Delivery premium', format: 'currency', precision: 2, info: 'Real cost minus the pickup cost.' },
    { id: 'premiumPct', label: 'Premium over pickup', format: 'percent', precision: 1, info: 'Premium ÷ pickup cost.' },
    { id: 'yearly', label: 'Premium per year', format: 'currency', precision: 2, info: 'Premium × orders per week × 52.' },
  ],
  compute: (v) => {
    const menu = num(v.menu);
    const markup = num(v.markup) ?? 0;
    const delivery = num(v.delivery) ?? 0;
    const service = num(v.service) ?? 0;
    const tip = num(v.tip) ?? 0;
    const tax = num(v.tax) ?? 0;
    const orders = num(v.orders) ?? 0;
    if (menu === null || menu <= 0) return { total: null };
    if (markup < 0 || delivery < 0 || service < 0 || tip < 0 || tax < 0 || orders < 0) return { total: null };
    const food = menu * (1 + markup / 100);
    const taxAmt = food * tax / 100;
    const tipAmt = food * tip / 100;
    const total = food + taxAmt + tipAmt + delivery + service;
    const pickup = menu * (1 + tax / 100);
    const premium = total - pickup;
    const premiumPct = premium / pickup;
    const yearly = premium * orders * 52;
    return {
      total,
      pickup,
      premium,
      premiumPct,
      yearly,
      tone: 'bad',
      badge: `${money(total)} for a ${money(menu)} order`,
      note: `A ${money(menu)} menu order costs ${money(total)} through the app, ${money(premium)} (${(premiumPct * 100).toFixed(1)}%) more than picking it up for ${money(pickup)}.${orders > 0 ? ` At ${orders} a week, that premium is ${money(yearly)} a year.` : ''}`,
      chart: {
        type: 'donut',
        title: 'Where the money goes',
        slices: [
          { label: 'Food at menu price', value: menu },
          { label: 'App markup', value: food - menu },
          { label: 'Tax', value: taxAmt },
          { label: 'Tip', value: tipAmt },
          { label: 'Delivery fee', value: delivery },
          { label: 'Service fee', value: service },
        ].filter((s) => s.value > 0),
        format: { format: 'currency', precision: 2 },
        centerLabel: 'Total',
        centerValue: money(total),
      },
      steps: [
        `App food = ${money(menu)} × (1 + ${markup}%) = ${money(food)}`,
        `Tax = ${money(taxAmt)}, tip = ${money(tipAmt)}, fees = ${money(delivery + service)}`,
        `Total = ${money(food)} + ${money(taxAmt)} + ${money(tipAmt)} + ${money(delivery + service)} = ${money(total)}`,
        `Pickup = ${money(menu)} × (1 + ${tax}%) = ${money(pickup)}; premium = ${money(premium)}`,
      ],
    };
  },
  content: {
    formula: [
      'App food = menu price × (1 + markup)',
      'Tax = app food × tax rate; tip = app food × tip rate',
      'Total = app food + tax + tip + delivery fee + service fee',
      'Premium = total − menu price × (1 + tax rate)',
      'Per year = premium × orders per week × 52',
    ],
    body: [
      'A delivery order is rarely the price on the menu. Many apps list items higher than the restaurant does, then add a delivery fee and a service fee, and tax and tip land on the higher food price. This calculator stacks it all up and compares it with collecting the same food yourself.',
      'Example: a $20 menu order with a 15% app markup, an 18% tip, 8% tax, a $3.99 delivery fee and a $2.50 service fee. App food is $23.00, tax $1.84, tip $4.14, so the total is $35.47. Picking it up costs $21.60, so delivery adds $13.87, or 64.2%. Twice a week, that is $1,442.48 a year.',
      'Markup, fees, tax and tip are your own inputs, because they differ by app, restaurant and place. Tax and tip are assumed to apply to the in-app food price only. A tip for the driver is not a waste: the point is to see the whole cost before you tap order. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does a delivery order really cost?', a: 'Add the app food price, tax, tip, delivery fee and service fee. In the example, a $20 menu order comes to $35.47.' },
      { q: 'How much more is delivery than pickup?', a: 'In the example, pickup is $21.60 and delivery is $35.47, a premium of $13.87 or 64.2%. Your figure depends on the markup, fees and tip you enter.' },
      { q: 'How much does the premium cost per year?', a: 'Premium × orders per week × 52. At $13.87 and two orders a week, that is $1,442.48 a year.' },
      { q: 'Is tip and tax calculated on fees?', a: 'No. This calculator assumes both apply to the in-app food price only. Rules vary, so adjust the percentages to match your checkout.' },
    ],
    sources: [],
  },
  related: ['eating-out-cost', 'subscription-cost', 'tip', 'lifestyle-creep', 'hours-of-work-cost'],
  examples: [
    // food 23; tax 1.84; tip 4.14; total 23+1.84+4.14+3.99+2.5 = 35.47; pickup 21.6; premium 13.87; pct 13.87/21.6*100 = 64.213; yearly 13.87*2*52 = 1442.48
    { values: { menu: 20, markup: 15, delivery: 3.99, service: 2.5, tip: 18, tax: 8, orders: 2 }, expect: { total: 35.47, pickup: 21.6, premium: 13.87, premiumPct: 0.642130, yearly: 1442.48 }, tolerance: 1e-3 },
    // no extras: food 10, tax 0.5, total 10.5 = pickup; premium 0
    { values: { menu: 10, markup: 0, delivery: 0, service: 0, tip: 0, tax: 5, orders: 1 }, expect: { total: 10.5, pickup: 10.5, premium: 0, yearly: 0 }, tolerance: 1e-6 },
  ],
});
