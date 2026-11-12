import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'mass',
  [
    { id: 'kg', name: 'Kilograms', info: 'The SI unit of mass. 1 kg is about 2.2 lb.' },
    { id: 'g', name: 'Grams', info: 'One thousandth of a kilogram. A US nickel weighs about 5 g.' },
    { id: 'mg', name: 'Milligrams', info: 'One thousandth of a gram — the unit for medicine doses and nutrients.' },
    { id: 't', name: 'Metric tonnes', precision: 8, info: 'The metric tonne: 1,000 kg, about 2,205 lb.' },
    { id: 'lb', name: 'Pounds', info: 'The avoirdupois pound, exactly 0.45359237 kg. Used for body weight in the US.' },
    { id: 'oz', name: 'Ounces', info: 'One sixteenth of a pound, about 28.35 g. Not the same as a fluid ounce.' },
    { id: 'st', name: 'Stone', info: '14 pounds, about 6.35 kg. Common for body weight in the UK and Ireland.' },
    { id: 'ton', name: 'US short tons', precision: 8, info: 'The US short ton: 2,000 lb, about 907 kg.' },
  ],
  'kg',
  {
  chartUnits: ['kg', 'lb', 'st'], chartTitle: 'Kilograms, pounds and stone side by side',
  extra: (kg) => {
    const totalOz = kg / 0.028349523125;
    let lb = Math.floor(Math.abs(totalOz) / 16);
    let oz = Math.round((Math.abs(totalOz) - lb * 16) * 10) / 10;
    if (oz >= 16) {
      lb += 1;
      oz -= 16;
    }
    return { lboz: `${totalOz < 0 ? '−' : ''}${lb} lb ${oz} oz` };
  } },
);

export default defineCalculator({
  slug: 'weight-converter',
  title: 'Weight Converter',
  category: 'conversion',
  description: 'Convert between kilograms, grams, pounds, ounces, stone and tons.',
  keywords: ['lbs to kg', 'kg to lbs', 'pounds to kilograms', 'grams to ounces', 'mass converter', 'stone to kg'],
  inputs: [{ id: 'value', label: 'Weight', type: 'number', unit: 'mass', defaultUnit: 'lb', default: 150, info: 'Enter a weight (mass) and pick its unit; every other unit updates instantly.' }],
  outputs: [...conv.outputs, { id: 'lboz', label: 'Pounds and ounces', format: 'text', info: 'The weight in whole pounds plus remaining ounces — how US baby and package weights are given.' }],
  compute: conv.compute,
  content: {
    formula: ['1 lb = 0.45359237 kg (exact)', '1 lb = 16 oz; 1 oz = 28.349523125 g', '1 stone = 14 lb', '1 US ton = 2,000 lb; 1 tonne = 1,000 kg'],
    body: [
      'The avoirdupois pound is defined as exactly 0.45359237 kilograms, so pounds and kilograms convert precisely: multiply pounds by 0.4536 for kilograms, or kilograms by 2.2046 for pounds.',
      'Since 2019 the kilogram has been defined through the Planck constant rather than a metal cylinder in Paris, but nothing changed for everyday conversions. Grams and milligrams are simply thousandths and millionths of a kilogram.',
      'Three different “tons” are in use: the US short ton (2,000 lb), the UK long ton (2,240 lb) and the metric tonne (1,000 kg, about 2,205 lb). Body weight in the UK and Ireland is often quoted in stone; one stone is 14 pounds.',
    ],
    faq: [
      { q: 'How many pounds are in a kilogram?', a: 'About 2.20462 lb.' },
      { q: 'Is weight the same as mass?', a: 'Strictly, kilograms and pounds measure mass, while weight is a force. On Earth the two are used interchangeably in everyday life, and this converter follows that convention.' },
      { q: 'Are troy ounces the same as ounces?', a: 'No. Precious metals use the troy ounce of 31.1035 g, about 10% heavier than the ordinary 28.35 g ounce used here.' },
    ],
  },
  related: ['length-converter', 'volume-converter', 'bmi'],
  examples: [
    { values: { value: 0.45359237 }, expect: { lb: 1, oz: 16, kg: 0.45359237, g: 453.59237, lboz: '1 lb 0 oz' } },
    { values: { value: 1 }, expect: { lb: 2.2046226218, st: 0.1574730444 }, tolerance: 1e-9 },
    { values: { value: 907.18474 }, expect: { ton: 1, lb: 2000 } },
  ],
});
