import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const p = (f: number, d = 2) => `${+(f * 100).toFixed(d)}%`;

export default defineCalculator({
  slug: 'shrinkflation',
  title: 'Shrinkflation Calculator',
  category: 'finance',
  description: 'Compare a product before and after it shrank. Enter old and new size and price to see the real price per unit, the true increase and the size cut.',
  keywords: ['shrinkflation calculator', 'shrinkflation true price', 'smaller package same price', 'real price increase', 'price per unit change', 'hidden price increase'],
  updated: '2026-11-27',
  inputs: [
    { id: 'oldSize', label: 'Old size', type: 'number', default: 16, min: 0, step: 0.01, info: 'How much the product contained before. Any unit, but use the same unit for old and new size.' },
    { id: 'oldPrice', label: 'Old price', type: 'number', prefix: '$', default: 4, min: 0, step: 0.01, info: 'The shelf price before the change.' },
    { id: 'newSize', label: 'New size', type: 'number', default: 14.5, min: 0, step: 0.01, info: 'How much the product contains now, in the same unit as the old size.' },
    { id: 'newPrice', label: 'New price', type: 'number', prefix: '$', default: 4, min: 0, step: 0.01, info: 'The shelf price now.' },
    { id: 'unit', label: 'Unit label (optional)', type: 'text', default: 'oz', optional: true, placeholder: 'oz, g, ct', info: 'Only used to label the steps, for example oz, g or ct.' },
  ],
  outputs: [
    { id: 'increase', label: 'Effective price increase', format: 'percent', precision: 2, primary: true, info: 'New price per unit ÷ old price per unit − 1. Negative means the price per unit fell.' },
    { id: 'oldUnit', label: 'Old price per unit', format: 'currency', precision: 4, info: 'Old price ÷ old size.' },
    { id: 'newUnit', label: 'New price per unit', format: 'currency', precision: 4, info: 'New price ÷ new size.' },
    { id: 'sizeCut', label: 'Size change (cut)', format: 'percent', precision: 2, info: '1 − new size ÷ old size. Negative means the package got bigger.' },
    { id: 'sticker', label: 'Sticker price change', format: 'percent', precision: 2, info: 'New price ÷ old price − 1: the change in the number on the shelf tag.' },
  ],
  compute: (v) => {
    const os = num(v.oldSize);
    const op = num(v.oldPrice);
    const ns = num(v.newSize);
    const np = num(v.newPrice);
    if (os === null || op === null || ns === null || np === null) return { increase: null };
    if (os <= 0 || ns <= 0) return { increase: null, error: 'Sizes must be greater than 0.' };
    if (op <= 0 || np <= 0) return { increase: null, error: 'Prices must be greater than 0.' };
    const u = (typeof v.unit === 'string' ? v.unit.trim() : '').slice(0, 12);
    const per = u ? ` per ${u}` : ' per unit';
    const oldUnit = op / os;
    const newUnit = np / ns;
    const increase = newUnit / oldUnit - 1;
    const sizeCut = 1 - ns / os;
    const sticker = np / op - 1;
    const tone = increase > 0.0005 ? 'warn' : increase < -0.0005 ? 'good' : 'ok';
    return {
      increase, oldUnit, newUnit, sizeCut, sticker,
      tone,
      badge: `${increase >= 0 ? '+' : ''}${p(increase, 1)} per unit`,
      chart: { type: 'bar', title: 'Change, as a percent', categories: ['Sticker price', 'Size cut', 'Price per unit'], series: [{ name: 'Change', values: [sticker, sizeCut, increase] }], format: { format: 'percent', precision: 1 } },
      steps: [
        `Old price${per} = ${money(op)} ÷ ${os} = ${money(oldUnit, 4)}`,
        `New price${per} = ${money(np)} ÷ ${ns} = ${money(newUnit, 4)}`,
        `Effective increase = ${money(newUnit, 4)} ÷ ${money(oldUnit, 4)} − 1 = ${p(increase, 3)}`,
        `Size cut = 1 − ${ns} ÷ ${os} = ${p(sizeCut, 3)}; sticker price change = ${p(sticker, 3)}`,
      ],
      note: 'This reports the maths only. Quality, packaging or recipe changes are not counted.',
    };
  },
  content: {
    formula: [
      'Price per unit = price ÷ size',
      'Effective price increase = new price per unit ÷ old price per unit − 1',
      'Size cut = 1 − new size ÷ old size',
      'Sticker price change = new price ÷ old price − 1',
    ],
    body: [
      'Shrinkflation is when a package gets smaller while the price stays the same or rises a little. The shelf tag may barely move, so the change is easy to miss. The fair way to compare is price per unit, which is what this calculator works out.',
      'Enter the old size and price, then the new size and price, using the same unit for both sizes (ounces, grams, count, sheets). You get the price per unit before and after, the effective price increase, how much smaller the package is, and the change in the sticker price.',
      'For example, a 16 oz item at $4.00 that becomes 14.5 oz at $4.00 goes from $0.25 to about $0.2759 per ounce. The tag is unchanged, but the price per ounce is up 10.345%, with the package 9.375% smaller.',
      'The result is arithmetic, not a judgement about any company. Costs, recipes and packaging all change over time. To compare two products on the shelf today, use the unit price calculator. For a plain percent change in a bill or subscription, try the price hike impact calculator, and see the inflation calculator for how prices drift over years.',
    ],
    faq: [
      { q: 'What is shrinkflation?', a: 'It is a price rise delivered through size rather than the tag: the package gets smaller while the price stays the same or goes up less than the size cut would justify. Price per unit shows the real change.' },
      { q: 'How much did the price rise for 16 oz at $4.00 becoming 14.5 oz at $4.00?', a: 'Price per ounce goes from $0.25 to about $0.2759, an effective increase of 10.345%. The size is cut by 9.375% and the sticker price change is 0%.' },
      { q: 'What about 12 ct at $5.00 becoming 10 ct at $5.00?', a: 'Price per count goes from about $0.4167 to $0.50, an effective increase of 20%. The size cut is 16.667%.' },
      { q: 'Can a small sticker rise hide a bigger real rise?', a: 'Yes. 16 oz at $4.00 becoming 14 oz at $4.20 is a 5% sticker rise, but price per ounce goes from $0.25 to $0.30, a 20% effective increase.' },
      { q: 'Do the old and new sizes need the same unit?', a: 'Yes. Use one unit for both sizes, such as ounces or grams, so the price per unit is comparable. The optional label only names the unit in the steps.' },
      { q: 'Can the result be negative?', a: 'Yes. If the new package is bigger or cheaper per unit, the effective increase is negative and the size cut is negative, meaning the package grew.' },
    ],
    sources: [],
  },
  related: ['unit-price', 'price-hike-impact', 'inflation'],
  examples: [
    // 16 oz $4 -> 14.5 oz $4: 4/16 = 0.25; 4/14.5 = 0.275862; 0.275862/0.25 - 1 = 0.103448; cut = 1 - 14.5/16 = 0.09375
    { values: { oldSize: 16, oldPrice: 4, newSize: 14.5, newPrice: 4 }, expect: { oldUnit: 0.25, newUnit: 4 / 14.5, increase: 16 / 14.5 - 1, sizeCut: 0.09375, sticker: 0 }, tolerance: 1e-9 },
    // 12 ct $5 -> 10 ct $5: 5/12 = 0.416667; 0.5; 0.5/0.416667 - 1 = 0.2; cut = 1 - 10/12 = 0.166667
    { values: { oldSize: 12, oldPrice: 5, newSize: 10, newPrice: 5 }, expect: { oldUnit: 5 / 12, newUnit: 0.5, increase: 0.2, sizeCut: 1 / 6, sticker: 0 }, tolerance: 1e-9 },
    // 16 oz $4 -> 14 oz $4.20: 0.25; 4.2/14 = 0.30; 0.30/0.25 - 1 = 0.2; cut = 0.125; sticker = 0.05
    { values: { oldSize: 16, oldPrice: 4, newSize: 14, newPrice: 4.2 }, expect: { oldUnit: 0.25, newUnit: 0.3, increase: 0.2, sizeCut: 0.125, sticker: 0.05 }, tolerance: 1e-9 },
  ],
});
