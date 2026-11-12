import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'unit-price',
  title: 'Unit Price Calculator',
  category: 'everyday',
  description: 'Compare two package sizes by price per unit to see which is the better deal and by how much.',
  keywords: ['price per ounce', 'price per unit', 'best buy', 'compare prices', 'bulk deal', 'grocery comparison'],
  inputs: [
    { id: 'priceA', label: 'Package A price', type: 'number', prefix: '$', default: 3.99, min: 0, step: 0.01, info: 'The shelf price of the first package, after any discount or coupon.' },
    { id: 'sizeA', label: 'Package A size', type: 'number', default: 16, min: 0, help: 'Any unit — ounces, grams, count… use the same unit for both.', info: 'How much the first package contains — weight, volume or item count, as printed on the label.' },
    { id: 'priceB', label: 'Package B price', type: 'number', prefix: '$', default: 5.49, min: 0, step: 0.01, info: 'The shelf price of the second package.' },
    { id: 'sizeB', label: 'Package B size', type: 'number', default: 24, min: 0, info: 'How much the second package contains, in the same unit as package A.' },
  ],
  outputs: [
    { id: 'best', label: 'Better deal', format: 'text', primary: true, info: 'The package with the lower price per unit.' },
    { id: 'unitA', label: 'Package A price per unit', format: 'currency', precision: 4, info: 'Package A price divided by its size.' },
    { id: 'unitB', label: 'Package B price per unit', format: 'currency', precision: 4, info: 'Package B price divided by its size.' },
    { id: 'savings', label: 'Saving per unit with the better deal', format: 'percent', precision: 1, info: 'How much cheaper the better deal is per unit, as a share of the dearer unit price.' },
    { id: 'equivalent', label: 'Package B price that would match A', format: 'currency', info: 'The break-even price: what package B would need to cost to have the same unit price as package A.' },
  ],
  compute: (v) => {
    const pA = num(v.priceA);
    const sA = num(v.sizeA);
    const pB = num(v.priceB);
    const sB = num(v.sizeB);
    if (pA === null || pB === null || !sA || !sB || pA < 0 || pB < 0 || sA <= 0 || sB <= 0) return { best: null };
    const unitA = pA / sA;
    const unitB = pB / sB;
    const diff = Math.abs(unitA - unitB);
    const same = diff < 1e-12;
    const hi = Math.max(unitA, unitB);
    return {
      best: same ? 'Same price per unit' : unitA < unitB ? 'Package A' : 'Package B',
      unitA,
      unitB,
      savings: same || hi === 0 ? 0 : diff / hi,
      equivalent: unitA * sB,
      chart: {
        type: 'bar',
        title: 'Price per unit (lower is better)',
        categories: ['Package A', 'Package B'],
        series: [{ name: 'Price per unit', values: [unitA, unitB] }],
        format: { format: 'currency' },
        ...(same ? {} : { highlight: unitA < unitB ? 0 : 1 }),
      },
      steps: [`A: $${pA} ÷ ${sA} = $${unitA.toFixed(4)} per unit`, `B: $${pB} ÷ ${sB} = $${unitB.toFixed(4)} per unit`],
    };
  },
  content: {
    formula: ['Unit price = price ÷ size', 'Saving = (higher unit price − lower unit price) ÷ higher unit price'],
    body: [
      'Shelf prices hide the real cost of a product because package sizes differ. Dividing each price by its size puts both on the same footing — dollars per ounce, per gram, per sheet or per item — so the cheaper one is obvious.',
      'Enter both sizes in the same unit. If one jar is in grams and the other in ounces, convert first (1 oz = 28.35 g). For multipacks, use the total quantity, such as 12 cans × 12 fl oz = 144 fl oz.',
      'A lower unit price is only a better deal if you will use it all. Bulk packs of perishables, or a sale on a size you would not normally buy, can cost more in the end if some goes to waste.',
    ],
    faq: [
      { q: 'Is the bigger package always cheaper per unit?', a: 'Often, but not always. Sales and coupons on smaller sizes regularly beat the bulk price, which is why it pays to check the unit price every time.' },
      { q: 'What does “Package B price that would match A” mean?', a: 'It is what package B would have to cost to have exactly the same unit price as package A — a handy break-even figure when one item is on sale.' },
    ],
  },
  related: ['tip', 'gas-cost', 'percentage'],
  examples: [
    { values: { priceA: 3.99, sizeA: 16, priceB: 5.49, sizeB: 24 }, expect: { best: 'Package B', unitA: 0.249375, unitB: 0.22875, savings: 0.0827067669, equivalent: 5.985 }, tolerance: 1e-6 },
    { values: { priceA: 2, sizeA: 10, priceB: 4, sizeB: 20 }, expect: { best: 'Same price per unit', savings: 0 } },
  ],
});
