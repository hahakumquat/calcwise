import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const G_PER_OZ = 28.3495;
const EXTRAS_OZ = 1.5;
const ROLES: Record<string, { cheese: number; meat: number }> = {
  appetizer: { cheese: 2, meat: 1.5 },
  main: { cheese: 4, meat: 3 },
};

export default defineCalculator({
  slug: 'charcuterie-board-quantity',
  title: 'Charcuterie Board Quantity Calculator',
  category: 'food',
  description: 'How much cheese, cured meat and crackers to put on a charcuterie or cheese board, in ounces and grams, for an appetizer or a board served as the meal.',
  keywords: ['charcuterie board quantity', 'how much cheese per person', 'how much charcuterie per person', 'cheese board size', 'grazing board amounts'],
  updated: '2026-11-28',
  inputs: [
    { id: 'guests', label: 'Guests', type: 'number', default: 12, min: 1, step: 1, info: 'Number of people eating from the board.' },
    { id: 'role', label: 'Board is the', type: 'select', default: 'appetizer', segmented: true, options: [
      { value: 'appetizer', label: 'Appetizer' },
      { value: 'main', label: 'Main meal' },
    ], info: 'Appetizer plans 2 oz cheese and 1.5 oz meat per guest. Main meal plans 4 oz cheese and 3 oz meat.' },
  ],
  outputs: [
    { id: 'cheeseOz', label: 'Cheese', precision: 1, suffix: 'oz', primary: true, info: 'Guests × cheese ounces per guest.' },
    { id: 'meatOz', label: 'Cured meat', precision: 1, suffix: 'oz', info: 'Guests × meat ounces per guest.' },
    { id: 'extrasOz', label: 'Crackers and extras', precision: 1, suffix: 'oz', info: 'Guests × 1.5 oz for crackers, nuts, fruit and olives.' },
    { id: 'cheeseG', label: 'Cheese in grams', precision: 0, suffix: 'g', info: 'Cheese ounces × 28.3495.' },
    { id: 'meatG', label: 'Meat in grams', precision: 0, suffix: 'g', info: 'Meat ounces × 28.3495.' },
    { id: 'extrasG', label: 'Extras in grams', precision: 0, suffix: 'g', info: 'Extras ounces × 28.3495.' },
  ],
  compute: (v) => {
    const g = num(v.guests);
    const r = ROLES[String(v.role)];
    if (g === null || g < 1 || !r) return { cheeseOz: null };
    const cheeseOz = g * r.cheese, meatOz = g * r.meat, extrasOz = g * EXTRAS_OZ;
    return {
      cheeseOz, meatOz, extrasOz,
      cheeseG: cheeseOz * G_PER_OZ,
      meatG: meatOz * G_PER_OZ,
      extrasG: extrasOz * G_PER_OZ,
      tone: 'ok',
      badge: 'Rule of thumb',
      note: `For ${fmt(g, 0)} guests, plan about ${fmt(cheeseOz)} oz of cheese and ${fmt(meatOz)} oz of meat. Amounts are rules of thumb.`,
      chart: {
        type: 'bar',
        title: 'Board shopping list (oz)',
        categories: ['Cheese', 'Meat', 'Extras'],
        series: [{ name: 'Ounces', values: [cheeseOz, meatOz, extrasOz] }],
        format: { format: 'number', precision: 1, suffix: ' oz' },
      },
      steps: [
        `Cheese: ${fmt(g, 0)} × ${r.cheese} oz = ${fmt(cheeseOz)} oz = ${fmt(cheeseOz * G_PER_OZ, 0)} g`,
        `Meat: ${fmt(g, 0)} × ${r.meat} oz = ${fmt(meatOz)} oz = ${fmt(meatOz * G_PER_OZ, 0)} g`,
        `Extras: ${fmt(g, 0)} × ${EXTRAS_OZ} oz = ${fmt(extrasOz)} oz = ${fmt(extrasOz * G_PER_OZ, 0)} g`,
      ],
    };
  },
  content: {
    formula: [
      'Cheese = guests × 2 oz (appetizer) or 4 oz (main)',
      'Meat = guests × 1.5 oz (appetizer) or 3 oz (main)',
      'Crackers and extras = guests × 1.5 oz',
      'Grams = ounces × 28.3495',
    ],
    body: [
      'A board is easy to overbuy. The common caterer guideline is about 2 oz of cheese and 1.5 oz of cured meat per guest when the board is a starter, and about double that when it is the meal. Crackers, nuts, fruit and olives are planned at 1.5 oz per guest here.',
      'These figures are assumptions and rules of thumb, not a standard. If other food is served, or the party is short, go lower. Pick 3 to 5 cheeses for a mix of soft, firm and blue, and cut a few slices so guests feel free to start. Weights are for edible food, so leave out rinds and packaging when you shop.',
      'For the rest of the party see the party food quantity and party drinks calculators. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much for 12 appetizer guests?', a: '12 × 2 oz is 24 oz of cheese (about 680 g), 12 × 1.5 oz is 18 oz of meat (about 510 g) and 18 oz of crackers and extras.' },
      { q: 'How much if the board is dinner?', a: 'The main-meal setting doubles cheese and meat to 4 oz and 3 oz per guest. For 12 guests that is 48 oz of cheese and 36 oz of meat.' },
      { q: 'How many grams are in an ounce?', a: '1 oz is 28.3495 g, so 24 oz of cheese is 680.4 g.' },
    ],
    sources: [
      { label: 'NIST: Handbook 44 and 133 unit conversions (ounce to gram)', url: 'https://www.nist.gov/pml/owm/metric-program/metric-conversion-factors' },
    ],
  },
  related: ['party-food-quantity', 'party-drinks'],
  examples: [
    // 12*2 = 24; 12*1.5 = 18; 18; 24*28.3495 = 680.388
    { values: { guests: 12, role: 'appetizer' }, expect: { cheeseOz: 24, meatOz: 18, extrasOz: 18, cheeseG: 680.388 }, tolerance: 1e-6 },
    // 5*4 = 20; 5*3 = 15; 5*1.5 = 7.5
    { values: { guests: 5, role: 'main' }, expect: { cheeseOz: 20, meatOz: 15, extrasOz: 7.5 }, tolerance: 1e-9 },
  ],
});
