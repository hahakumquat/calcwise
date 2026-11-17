import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const ML_PER_FL_OZ = 29.5735;
const G_PER_TBSP = 5;

export default defineCalculator({
  slug: 'coffee-ratio',
  title: 'Coffee to Water Ratio Calculator',
  category: 'food',
  description: 'Work out how many grams of coffee to use for the water you are brewing, at any ratio from 1:15 to 1:18. Handy for pour over, French press and drip.',
  keywords: ['coffee ratio calculator', 'coffee to water ratio', 'how much coffee per cup', 'grams of coffee per ml water', 'pour over ratio', 'french press ratio'],
  inputs: [
    { id: 'unit', label: 'Water measured in', type: 'select', segmented: true, default: 'ml', options: [{ value: 'ml', label: 'ml' }, { value: 'g', label: 'grams' }, { value: 'oz', label: 'fl oz' }], info: 'One millilitre of water weighs one gram, so ml and grams give the same answer.' },
    { id: 'water', label: 'Water to brew', type: 'number', default: 500, min: 0, step: 10, help: 'The water that goes into the brew, not the cup size.', info: 'Total water you plan to pour. A 12 fl oz mug is about 355 ml.' },
    { id: 'ratio', label: 'Ratio (1 part coffee to N parts water)', type: 'number', default: 16, min: 1, max: 30, step: 0.5, help: '1:16 is a common starting point. 15 is stronger, 18 is lighter.', info: 'Between 1:15 and 1:18 is a matter of taste, not a standard. Start at 16 and adjust.' },
  ],
  outputs: [
    { id: 'coffee', label: 'Coffee grounds (g)', format: 'number', precision: 1, primary: true, info: 'Water in grams divided by the ratio.' },
    { id: 'tbsp', label: 'About this many level tablespoons', format: 'number', precision: 1, info: 'Rough guide at about 5 g of ground coffee per level tablespoon. Weighing is more accurate.' },
    { id: 'waterG', label: 'Water (g)', format: 'number', precision: 0, info: 'Water converted to grams at 1 g per ml.' },
    { id: 'strength', label: 'Coffee as % of brew water', format: 'percent', precision: 1, info: 'Coffee weight divided by water weight.' },
  ],
  compute: (v) => {
    const water = num(v.water), ratio = num(v.ratio);
    if (water === null || ratio === null || water <= 0 || ratio < 1) return { coffee: null };
    const waterG = v.unit === 'oz' ? water * ML_PER_FL_OZ : water;
    const coffee = waterG / ratio;
    const lo = waterG / 18, hi = waterG / 15;
    return {
      coffee,
      tbsp: coffee / G_PER_TBSP,
      waterG,
      strength: coffee / waterG,
      chart: {
        type: 'bar',
        title: 'Coffee (g) at common ratios',
        categories: ['1:15', '1:16', '1:17', '1:18'],
        series: [{ name: 'Coffee (g)', values: [15, 16, 17, 18].map((n) => waterG / n) }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Water = ${+waterG.toFixed(1)} g`,
        `Coffee = ${+waterG.toFixed(1)} ÷ ${ratio} = ${coffee.toFixed(1)} g`,
        `Range from 1:18 to 1:15 = ${lo.toFixed(1)} to ${hi.toFixed(1)} g`,
      ],
    };
  },
  content: {
    formula: ['Coffee (g) = water (g) ÷ N, for a ratio of 1:N', '1 ml of water = 1 g; 1 fl oz = 29.5735 ml'],
    body: [
      'A coffee ratio says how much water to use for each part of coffee. At 1:16 you use 16 grams of water for every gram of grounds, so 500 ml of water needs 500 ÷ 16 = 31.25 g of coffee.',
      'Most brewers land between 1:15 (stronger) and 1:18 (lighter). Those numbers are a matter of taste, not a rule. Start at 1:16, then use a little more coffee if the cup tastes thin and a little less if it tastes harsh or bitter.',
      'Weighing coffee on a kitchen scale is more consistent than scoops, because beans differ in size and roast. The tablespoon figure is a rough guide only. Note that some of the water stays in the grounds, so you get a bit less coffee in the cup than the water you pour.',
    ],
    faq: [
      { q: 'How much coffee for 12 fl oz of water?', a: 'At 1:16, about 22.2 g of grounds. Twelve fluid ounces is about 354.9 g of water, and 354.9 ÷ 16 = 22.18.' },
      { q: 'What is the best coffee to water ratio?', a: 'There is no single best ratio. 1:16 is a common starting point, 1:15 makes a stronger cup and 1:18 a lighter one. Adjust to taste.' },
      { q: 'Is the tablespoon number exact?', a: 'No. It assumes about 5 g of ground coffee per level tablespoon, which varies with grind and roast. A scale is more accurate.' },
    ],
  },
  related: ['latte-factor', 'recipe-scaler', 'cooking-converter'],
  examples: [
    { values: { unit: 'ml', water: 500, ratio: 16 }, expect: { coffee: 31.25, tbsp: 6.25, waterG: 500, strength: 0.0625 }, tolerance: 1e-6 },
    { values: { unit: 'oz', water: 12, ratio: 16 }, expect: { coffee: 22.18, waterG: 354.882 }, tolerance: 1e-2 },
  ],
});
