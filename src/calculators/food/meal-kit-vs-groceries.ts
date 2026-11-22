import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number, d = 2) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'meal-kit-vs-groceries',
  title: 'Meal Kit vs Groceries Cost Calculator',
  category: 'food',
  description: 'Is a meal kit worth it? Compare the kit price per serving with buying the same recipes at the shop, including waste and the value of time saved.',
  keywords: ['meal kit vs groceries', 'is a meal kit worth it', 'meal kit cost per serving', 'meal kit vs cooking from scratch', 'meal delivery cost', 'meal kit subscription cost'],
  updated: '2026-11-22',
  inputs: [
    { id: 'kit', label: 'Kit price per box', type: 'number', prefix: '$', default: 69.99, min: 0, step: 0.01, info: 'What one box costs, after any discount you actually get.' },
    { id: 'ship', label: 'Shipping per box', type: 'number', prefix: '$', default: 0, min: 0, step: 0.01, info: 'Delivery fee per box. Leave at 0 if shipping is free or already in the price.' },
    { id: 'servings', label: 'Servings per box', type: 'number', default: 6, min: 1, step: 1, info: 'Total portions in the box, for example 3 recipes for 2 people is 6 servings.' },
    { id: 'groceries', label: 'Grocery cost of the same recipes', type: 'number', prefix: '$', default: 38, min: 0, step: 0.01, info: 'What the same ingredients would cost at your shop for the whole box. Price the recipes from the box.' },
    { id: 'waste', label: 'Food waste when shopping', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 1, info: 'The share of grocery ingredients you would end up throwing away, for example the rest of a bunch of herbs. Use 0 if you use everything.' },
    { id: 'minutes', label: 'Minutes saved per box', type: 'number', default: 60, min: 0, step: 5, info: 'Time the kit saves you on planning, shopping and prep compared with buying the ingredients.' },
    { id: 'boxes', label: 'Boxes per year', type: 'number', default: 52, min: 1, max: 52, step: 1, info: 'How many boxes you order in a year. Weekly is 52.' },
  ],
  outputs: [
    { id: 'premiumYear', label: 'Extra cost per year', format: 'currency', primary: true, info: 'Premium per box × boxes per year. Negative means the kit is cheaper.' },
    { id: 'kitServing', label: 'Kit cost per serving', format: 'currency', info: '(Box price + shipping) ÷ servings.' },
    { id: 'groceryServing', label: 'Grocery cost per serving', format: 'currency', info: 'Grocery cost × (1 + waste %) ÷ servings.' },
    { id: 'premiumBox', label: 'Extra cost per box', format: 'currency', info: 'Kit cost per box minus grocery cost per box including waste.' },
    { id: 'perHour', label: 'Extra cost per hour saved', format: 'currency', info: 'Premium per box ÷ hours saved per box. Compare with what an hour of your time is worth to you.' },
  ],
  compute: (v) => {
    const kit = num(v.kit), ship = num(v.ship) ?? 0, servings = num(v.servings), groceries = num(v.groceries);
    const waste = num(v.waste) ?? 0, minutes = num(v.minutes) ?? 0, boxes = num(v.boxes);
    if (kit === null || servings === null || groceries === null || boxes === null) return { premiumYear: null };
    if (kit < 0 || ship < 0 || servings < 1 || groceries < 0 || waste < 0 || minutes < 0 || boxes < 1) return { premiumYear: null };
    const kitBox = kit + ship;
    const groceryBox = groceries * (1 + waste / 100);
    const premiumBox = kitBox - groceryBox;
    const premiumYear = premiumBox * boxes;
    const kitServing = kitBox / servings;
    const groceryServing = groceryBox / servings;
    const perHour = minutes > 0 ? premiumBox / (minutes / 60) : null;
    const cheaper = premiumBox <= 0;
    const hourText = perHour === null ? '' : cheaper ? ` The kit also saves you ${minutes} minutes a box.` : ` That works out at ${usd(perHour)} for each hour it saves you, so the question is whether an hour of your time is worth more than that.`;
    return {
      premiumYear,
      kitServing,
      groceryServing,
      premiumBox,
      perHour,
      tone: cheaper ? ('good' as const) : premiumBox / groceryBox > 0.5 ? ('bad' as const) : ('warn' as const),
      badge: cheaper ? 'Kit is cheaper' : `${usd(premiumBox)} extra a box`,
      note: cheaper
        ? `The kit costs ${usd(kitServing)} a serving against ${usd(groceryServing)} from the shop, which saves ${usd(-premiumBox)} a box.${hourText}`
        : `The kit costs ${usd(kitServing)} a serving against ${usd(groceryServing)} from the shop. That is ${usd(premiumBox)} more per box, or ${usd(premiumYear)} over ${boxes} boxes.${hourText}`,
      chart: {
        type: 'bar',
        title: 'Cost per serving',
        categories: ['Meal kit', 'Groceries'],
        series: [{ name: 'Per serving', values: [kitServing, groceryServing] }],
        format: { format: 'currency' },
        highlight: cheaper ? 0 : 1,
      },
      steps: [
        `Kit per serving = (${usd(kit)} + ${usd(ship)}) ÷ ${servings} = ${usd(kitServing)}`,
        `Groceries per box = ${usd(groceries)} × (1 + ${waste}%) = ${usd(groceryBox)}; per serving = ${usd(groceryServing)}`,
        `Premium per box = ${usd(kitBox)} − ${usd(groceryBox)} = ${usd(premiumBox)}`,
        `Per year = ${usd(premiumBox)} × ${boxes} = ${usd(premiumYear)}`,
      ],
    };
  },
  content: {
    formula: [
      'Kit per serving = (box price + shipping) ÷ servings',
      'Grocery per serving = grocery cost × (1 + waste %) ÷ servings',
      'Premium per box = kit cost per box − grocery cost per box',
      'Premium per hour saved = premium per box ÷ (minutes saved ÷ 60)',
    ],
    body: [
      'Meal kits sell convenience: the recipes are planned, portioned and delivered. This calculator puts a number on that convenience by comparing the kit with buying the same ingredients at the shop.',
      'Enter the box price, shipping and servings, then price the same recipes at your usual shop. Add a waste percentage for the part of the groceries you would not use, such as leftover herbs or half a bag of something. Then say how many minutes the kit saves you.',
      'The result is the extra cost per box, per year and per hour saved. Whether that is worth it is your call: it depends on what your time is worth to you. The prices are whatever you enter, and everything runs in your browser.',
    ],
    sections: [
      {
        heading: 'Price the recipes honestly',
        paragraphs: [
          'The most important input is the grocery cost. Look up each ingredient in the recipes at the shop where you really buy, and count only what the recipe uses plus the waste you expect. Pantry items you already own can be left out if you would not buy them again for this meal.',
          'Kit discounts often apply to early boxes only. Use the price you will pay in a normal week.',
        ],
      },
    ],
    faq: [
      { q: 'How is the kit cost per serving worked out?', a: 'Add the box price and shipping, then divide by the servings. For $69.99, free shipping and 6 servings, that is $69.99 ÷ 6 = $11.67 a serving.' },
      { q: 'How is waste included?', a: 'The grocery cost is multiplied by 1 plus the waste percentage. With $38 of groceries and 15% waste, the cost is $38 × 1.15 = $43.70, or $7.28 a serving over 6 servings.' },
      { q: 'What does cost per hour saved mean?', a: 'It is the extra you pay per box divided by the hours the kit saves. With a $26.29 premium and 60 minutes saved, that is $26.29 for each hour of time saved.' },
      { q: 'How much extra is that over a year?', a: 'Multiply the premium per box by the number of boxes. $26.29 × 52 boxes is $1,367.08 a year.' },
      { q: 'What if the kit is cheaper than groceries?', a: 'The premium shows as negative, meaning the kit saves you money, and the result card turns green.' },
    ],
  },
  related: ['recipe-cost', 'eating-out-cost', 'subscription-cost', 'party-food-quantity'],
  examples: [
    // kit/serving 69.99 / 6 = 11.665; groceries 38 × 1.15 = 43.70, /6 = 7.28333; premium 69.99 − 43.70 = 26.29; year 26.29 × 52 = 1,367.08; per hour 26.29 ÷ 1 = 26.29.
    { values: { kit: 69.99, ship: 0, servings: 6, groceries: 38, waste: 15, minutes: 60, boxes: 52 }, expect: { kitServing: 11.665, groceryServing: 43.7 / 6, premiumBox: 26.29, premiumYear: 1367.08, perHour: 26.29 }, tolerance: 1e-9 },
    // (50 + 10) = 60; groceries 80 × 1.0 = 80; premium −20; 30 min -> −20 ÷ 0.5 = −40; year −20 × 26 = −520; per serving 60/4 = 15 vs 20.
    { values: { kit: 50, ship: 10, servings: 4, groceries: 80, waste: 0, minutes: 30, boxes: 26 }, expect: { kitServing: 15, groceryServing: 20, premiumBox: -20, premiumYear: -520, perHour: -40 }, tolerance: 1e-9 },
  ],
});
