import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const CM_PER_IN = 2.54;

export default defineCalculator({
  slug: 'pizza-size-comparison',
  title: 'Pizza Size Comparison Calculator',
  category: 'everyday',
  description: 'Compare two pizza sizes by area and price per square inch to see which is the better deal and how much more pizza you get.',
  keywords: ['pizza size comparison', 'which pizza is a better deal', '12 inch vs 16 inch pizza', 'pizza area', 'pizza price per square inch', 'pizza value'],
  inputs: [
    { id: 'unit', label: 'Diameter unit', type: 'select', segmented: true, default: 'in', options: [{ value: 'in', label: 'Inches' }, { value: 'cm', label: 'Centimetres' }], info: 'The unit the menu uses for pizza diameters. Both pizzas use the same unit.' },
    { id: 'dA', label: 'Pizza A diameter', type: 'number', default: 12, min: 0, step: 0.5, info: 'Across the widest part of the pizza, as printed on the menu.' },
    { id: 'pA', label: 'Pizza A price', type: 'number', prefix: '$', default: 14, min: 0, step: 0.01, info: 'What you pay for one pizza A, after any discount.' },
    { id: 'nA', label: 'Pizza A count', type: 'number', default: 1, min: 1, step: 1, help: 'Use 2 to price two of the same pizza.', info: 'How many of pizza A you would buy. The price is per pizza.' },
    { id: 'dB', label: 'Pizza B diameter', type: 'number', default: 16, min: 0, step: 0.5, info: 'Across the widest part of the second pizza.' },
    { id: 'pB', label: 'Pizza B price', type: 'number', prefix: '$', default: 22, min: 0, step: 0.01, info: 'What you pay for one pizza B, after any discount.' },
    { id: 'nB', label: 'Pizza B count', type: 'number', default: 1, min: 1, step: 1, info: 'How many of pizza B you would buy. The price is per pizza.' },
  ],
  outputs: [
    { id: 'best', label: 'Better deal', format: 'text', primary: true, info: 'The option with the lower price per square inch.' },
    { id: 'areaA', label: 'Pizza A total area (sq in)', format: 'number', precision: 1, info: 'Area of one pizza (π × radius²) times the count.' },
    { id: 'areaB', label: 'Pizza B total area (sq in)', format: 'number', precision: 1, info: 'Area of one pizza (π × radius²) times the count.' },
    { id: 'unitA', label: 'Pizza A price per sq in', format: 'currency', precision: 3, info: 'Total price divided by total area.' },
    { id: 'unitB', label: 'Pizza B price per sq in', format: 'currency', precision: 3, info: 'Total price divided by total area.' },
    { id: 'moreB', label: 'Extra pizza with B vs A', format: 'percent', precision: 1, info: 'How much more area B has than A. Negative means B is smaller.' },
  ],
  compute: (v) => {
    const dA = num(v.dA), pA = num(v.pA), nA = num(v.nA);
    const dB = num(v.dB), pB = num(v.pB), nB = num(v.nB);
    if (dA === null || pA === null || nA === null || dB === null || pB === null || nB === null) return { best: null };
    if (dA <= 0 || dB <= 0 || pA < 0 || pB < 0 || nA < 1 || nB < 1) return { best: null };
    const k = v.unit === 'cm' ? 1 / CM_PER_IN : 1;
    const areaA = Math.PI * ((dA * k) / 2) ** 2 * nA;
    const areaB = Math.PI * ((dB * k) / 2) ** 2 * nB;
    const unitA = (pA * nA) / areaA;
    const unitB = (pB * nB) / areaB;
    const same = Math.abs(unitA - unitB) < 1e-9;
    return {
      best: same ? 'Same price per square inch' : unitA < unitB ? 'Pizza A' : 'Pizza B',
      areaA,
      areaB,
      unitA,
      unitB,
      moreB: areaB / areaA - 1,
      chart: {
        type: 'bar',
        title: 'Price per square inch (lower is better)',
        categories: ['Pizza A', 'Pizza B'],
        series: [{ name: 'Price per sq in', values: [unitA, unitB] }],
        format: { format: 'currency', precision: 3 },
        ...(same ? {} : { highlight: unitA < unitB ? 0 : 1 }),
      },
      steps: [
        `A: π × (${+(dA * k).toFixed(2)} ÷ 2)² × ${nA} = ${areaA.toFixed(1)} sq in`,
        `B: π × (${+(dB * k).toFixed(2)} ÷ 2)² × ${nB} = ${areaB.toFixed(1)} sq in`,
      ],
    };
  },
  content: {
    formula: ['Area = π × (diameter ÷ 2)²', 'Price per square inch = total price ÷ total area'],
    body: [
      'A pizza is sold by its diameter, but you eat its area, and area grows with the square of the diameter. A 16 inch pizza is not 4 inches bigger than a 12 inch one: it has 256 ÷ 144 = 1.78 times the area, about 78% more pizza.',
      'That is why the bigger size is usually the better value, unless the price jumps by more than the area does. Enter the diameter and price of each option to see the price per square inch. Set a count of 2 to check whether two small pizzas beat one large one.',
      'This compares dough, sauce and cheese by area only. Thickness, toppings and crust style change how filling a pizza is, so treat the result as a guide.',
    ],
    faq: [
      { q: 'Is a 16 inch pizza really that much bigger than a 12 inch?', a: 'Yes. A 12 inch pizza is about 113.1 square inches and a 16 inch is about 201.1, so the 16 inch has roughly 78% more pizza.' },
      { q: 'Do two 12 inch pizzas beat one 16 inch?', a: 'On area, yes: two 12 inch pizzas are about 226.2 square inches against 201.1. Set the count to 2 on one side to compare prices.' },
      { q: 'Does the calculator include the crust?', a: 'Yes. It uses the full diameter, so the crust counts as pizza.' },
    ],
  },
  related: ['unit-price', 'bill-splitter', 'tip'],
  examples: [
    { values: { unit: 'in', dA: 12, pA: 14, nA: 1, dB: 16, pB: 22, nB: 1 }, expect: { best: 'Pizza B', areaA: 113.0973355, areaB: 201.0619298, unitA: 0.1237, unitB: 0.10942, moreB: 0.7777778 }, tolerance: 1e-3 },
    { values: { unit: 'in', dA: 12, pA: 10, nA: 2, dB: 16, pB: 22, nB: 1 }, expect: { best: 'Pizza A', areaA: 226.1946711 }, tolerance: 1e-3 },
  ],
});
