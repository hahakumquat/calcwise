import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'volume',
  [
    { id: 'l', name: 'Liters', info: 'The volume of a 10 cm cube, 1,000 mL. About 1.06 US quarts.' },
    { id: 'ml', name: 'Milliliters', info: 'One thousandth of a liter, the same as a cubic centimeter.' },
    { id: 'm3', name: 'Cubic meters', precision: 8, info: '1,000 liters — used for water tanks, pools and shipping.' },
    { id: 'gal', name: 'US gallons', info: 'The US liquid gallon: exactly 231 in³, or 3.785 L.' },
    { id: 'qt', name: 'US quarts', info: 'A quarter of a US gallon, about 946 mL.' },
    { id: 'pt', name: 'US pints', info: 'Half a US quart, about 473 mL. A UK pint is larger (568 mL).' },
    { id: 'cup', name: 'US cups', info: 'The US customary cup, 8 fl oz or about 237 mL.' },
    { id: 'floz', name: 'US fluid ounces', info: 'One 128th of a US gallon, about 29.6 mL.' },
    { id: 'tbsp', name: 'Tablespoons', info: 'The US tablespoon: half a fluid ounce, about 14.8 mL.' },
    { id: 'tsp', name: 'Teaspoons', info: 'The US teaspoon: a third of a tablespoon, about 4.9 mL.' },
    { id: 'impgal', name: 'Imperial (UK) gallons', info: 'The UK imperial gallon, exactly 4.54609 L — about 20% larger than a US gallon.' },
    { id: 'in3', name: 'Cubic inches', info: 'The volume of a one-inch cube, about 16.4 mL.' },
    { id: 'ft3', name: 'Cubic feet', info: 'The volume of a one-foot cube: 1,728 in³ or about 28.3 L.' },
    { id: 'yd3', name: 'Cubic yards', precision: 8, info: '27 cubic feet, about 765 L. Concrete, mulch and soil are sold by the cubic yard.' },
  ],
  'l',
  { chartUnits: ['gal', 'impgal', 'l', 'qt'], chartTitle: 'Gallons, liters and quarts side by side' },
);

export default defineCalculator({
  slug: 'volume-converter',
  title: 'Volume Converter',
  category: 'conversion',
  description: 'Convert between liters, milliliters, gallons, quarts, cups, fluid ounces, spoons and cubic units.',
  keywords: ['gallons to liters', 'liters to gallons', 'ml to oz', 'cups to ml', 'cubic feet', 'capacity converter'],
  inputs: [{ id: 'value', label: 'Volume', type: 'number', unit: 'volume', defaultUnit: 'gal', default: 1, info: 'Enter a volume and pick its unit; every other unit updates instantly.' }],
  outputs: conv.outputs,
  compute: conv.compute,
  content: {
    formula: ['1 US gal = 231 in³ = 3.785411784 L (exact)', '1 gal = 4 qt = 8 pt = 16 cups = 128 fl oz', '1 cup = 16 tbsp = 48 tsp', '1 UK gal = 4.54609 L', '1 L = 1,000 mL = 1 dm³'],
    body: [
      'The US liquid gallon is defined as exactly 231 cubic inches, and because the inch is exactly 2.54 cm, a US gallon is exactly 3.785411784 liters. Quarts, pints, cups, fluid ounces and spoons are fixed fractions of it.',
      'The imperial gallon used in the UK is about 20% larger (4.54609 L), and imperial pints and fluid ounces differ too, so recipes and fuel figures from Britain need the right unit. This converter uses US measures except where “UK” is shown.',
      'A liter is the volume of a 10 cm cube; a milliliter is the same as a cubic centimeter. A cubic meter holds 1,000 liters — useful for tanks, pools and shipping containers.',
    ],
    faq: [
      { q: 'How many cups are in a liter?', a: 'About 4.23 US cups. Recipes often round this to 4 cups, which is 946 mL (a US quart).' },
      { q: 'Are kitchen measuring cups US cups?', a: 'In the US, yes (236.6 mL), although nutrition labels use a rounded 240 mL. Australia, Canada and the UK commonly use a 250 mL metric cup.' },
    ],
  },
  related: ['length-converter', 'weight-converter', 'area-converter', 'concrete'],
  examples: [
    { values: { value: 0.003785411784 }, expect: { gal: 1, l: 3.785411784, qt: 4, cup: 16, floz: 128, in3: 231 } },
    { values: { value: 0.001 }, expect: { ml: 1000, tsp: 202.8841362 }, tolerance: 1e-9 },
  ],
});
