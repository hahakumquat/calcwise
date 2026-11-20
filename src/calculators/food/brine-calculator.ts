import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const L_PER_GAL = 3.785411784;
const G_PER_OZ = 28.349523125;

export default defineCalculator({
  slug: 'brine-calculator',
  title: 'Brine Calculator',
  category: 'food',
  description: 'Work out how much salt to add to your water for a brine at the strength you want. Gives grams, ounces and the salt percent of the finished brine.',
  keywords: ['brine calculator', 'how much salt for brine', 'turkey brine salt per gallon', 'pickle brine percentage', 'salt to water ratio', 'brine salinity calculator'],
  inputs: [
    { id: 'unit', label: 'Water measured in', type: 'select', default: 'l', options: [{ value: 'l', label: 'Litres' }, { value: 'gal', label: 'US gallons' }], info: 'Pick the unit you measure the water in.' },
    { id: 'water', label: 'Water', type: 'number', default: 4, min: 0.1, step: 0.5, info: 'How much plain water goes in the brine. This calculator treats 1 litre of water as 1,000 g.' },
    { id: 'pct', label: 'Brine strength (% salt of the water weight)', type: 'number', default: 5, min: 0.1, max: 26, step: 0.5, suffix: '%', help: 'Salt weight as a percent of the water weight.', info: 'Many home brines use roughly 3 to 10 percent; follow your recipe. Table salt stops dissolving at about 26 percent.' },
  ],
  outputs: [
    { id: 'saltG', label: 'Salt to add (grams)', format: 'number', precision: 0, primary: true, info: 'Water weight × strength. Weigh the salt on a scale: a cup of fine salt and a cup of flaky salt weigh very different amounts.' },
    { id: 'saltOz', label: 'Salt to add (ounces)', format: 'number', precision: 1, info: 'The same salt weight in ounces.' },
    { id: 'waterG', label: 'Water weight (grams)', format: 'number', precision: 0, info: 'Litres × 1,000, treating water as 1 g per millilitre.' },
    { id: 'solutionPct', label: 'Salt as % of finished brine', format: 'number', precision: 2, info: 'Salt ÷ (water + salt) × 100. Always a little lower than the strength on the water, because the salt adds weight to the total.' },
  ],
  compute: (v) => {
    const w = num(v.water);
    const p = num(v.pct);
    if (w === null || p === null || w <= 0 || p <= 0) return { saltG: null };
    const litres = v.unit === 'gal' ? w * L_PER_GAL : w;
    const waterG = litres * 1000;
    const saltG = (waterG * p) / 100;
    const total = waterG + saltG;
    const solutionPct = (saltG / total) * 100;
    return {
      saltG,
      saltOz: saltG / G_PER_OZ,
      waterG,
      solutionPct,
      chart: {
        type: 'bar',
        title: 'Grams in your brine',
        categories: ['Water', 'Salt'],
        series: [{ name: 'Grams', values: [waterG, saltG] }],
        format: { format: 'number', precision: 0 },
      },
      steps: [
        `Water = ${litres.toFixed(2)} L × 1,000 = ${waterG.toFixed(0)} g`,
        `Salt = ${waterG.toFixed(0)} g × ${p}% = ${saltG.toFixed(1)} g`,
        `Finished brine = ${total.toFixed(0)} g, of which salt is ${solutionPct.toFixed(2)}%`,
      ],
    };
  },
  content: {
    formula: ['Water (g) = litres × 1,000', 'Salt (g) = water (g) × strength ÷ 100', 'Salt as % of finished brine = salt ÷ (water + salt) × 100'],
    body: [
      'A brine is salt dissolved in water, and its strength is the weight of salt compared with the weight of water. Four litres of water weigh about 4,000 g, so a 5 percent brine needs 200 g of salt. Weighing is far more reliable than measuring by volume, because a cup of fine table salt can hold nearly twice the salt of a cup of coarse flaky salt.',
      'Recipes quote strength in two ways, and the difference matters. Percent of the water weight, used here, gives 200 g of salt for 4 litres at 5 percent. Percent of the whole solution counts the salt as part of the total, so that same brine is 4.76 percent. The gap is small at low strengths and grows as the brine gets saltier, so check which definition your recipe uses.',
      'This calculator only does the arithmetic. It does not say how long to brine anything, which depends on the food, its size and the temperature. Follow a tested recipe for timing, and keep brined food cold.',
    ],
    faq: [
      { q: 'How much salt do I need for 4 litres of 5% brine?', a: '200 g. Water weighs 4,000 g, and 5 percent of that is 200 g. The finished brine is 4,200 g, so salt is 4.76 percent of the solution.' },
      { q: 'How much salt for one gallon of water at 6%?', a: 'About 227 g (8 oz). One US gallon is 3.785 litres, about 3,785 g of water, and 6 percent of that is 227 g.' },
      { q: 'Why is the solution percentage lower than the strength I entered?', a: 'Because the salt adds weight to the total. A 5 percent brine on the water is 200 g in 4,200 g, which is 4.76 percent of the whole.' },
      { q: 'Can I use cups of salt instead of grams?', a: 'Not reliably. Salt types differ in grain size, so a cup can weigh anywhere from roughly 140 g to over 280 g. Use a kitchen scale.' },
    ],
  },
  related: ['turkey-cooking-time', 'cooking-converter', 'recipe-scaler'],
  examples: [
    { values: { unit: 'l', water: 4, pct: 5 }, expect: { saltG: 200, waterG: 4000, solutionPct: (200 / 4200) * 100, saltOz: 200 / 28.349523125 }, tolerance: 1e-9 },
    { values: { unit: 'gal', water: 1, pct: 6 }, expect: { waterG: 3785.411784, saltG: 3785.411784 * 0.06 }, tolerance: 1e-9 },
    { values: { unit: 'l', water: 1, pct: 10 }, expect: { saltG: 100, solutionPct: (100 / 1100) * 100 }, tolerance: 1e-9 },
  ],
});
