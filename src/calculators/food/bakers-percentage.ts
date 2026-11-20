import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'bakers-percentage',
  title: "Baker's Percentage & Dough Hydration Calculator",
  category: 'food',
  description: "Enter your flour, water, salt and yeast in grams to get baker's percentages and dough hydration. Counts sourdough starter as flour and water.",
  keywords: ["baker's percentage calculator", 'dough hydration calculator', 'bread hydration', 'sourdough hydration calculator', 'baker percent', 'bread dough ratios'],
  inputs: [
    { id: 'flour', label: 'Flour (g)', type: 'number', default: 500, min: 0, step: 10, help: 'All the flour you add, not counting the starter.', info: 'Baker\'s percentages use total flour weight as the 100% base.' },
    { id: 'water', label: 'Water (g)', type: 'number', default: 350, min: 0, step: 10, help: 'Water you add, not counting the starter.', info: 'Water weight in grams. Hydration is this plus any water in the starter, divided by total flour.' },
    { id: 'salt', label: 'Salt (g)', type: 'number', default: 10, min: 0, step: 1, info: 'Salt weight in grams. About 2 percent of the flour is common for bread.' },
    { id: 'yeast', label: 'Yeast (g)', type: 'number', default: 5, min: 0, step: 0.5, help: 'Leave at 0 for a sourdough made with starter only.', info: 'Yeast weight in grams, any type. It is shown as a percentage of total flour.' },
    { id: 'starter', label: 'Sourdough starter (g)', type: 'number', default: 0, min: 0, step: 10, help: 'Optional. Half-flour, half-water starters are 100% hydration.', info: 'The starter is split into flour and water and added to the totals.' },
    { id: 'starterHyd', label: 'Starter hydration (%)', type: 'number', default: 100, min: 0, max: 300, step: 5, info: 'Water weight divided by flour weight in the starter. A 100% starter is equal parts flour and water.' },
  ],
  outputs: [
    { id: 'hydration', label: 'Dough hydration', format: 'percent', precision: 1, primary: true, info: 'Total water divided by total flour.' },
    { id: 'saltPct', label: 'Salt', format: 'percent', precision: 1, info: 'Salt weight divided by total flour. 1.8 to 2.2 percent is typical for bread.' },
    { id: 'yeastPct', label: 'Yeast', format: 'percent', precision: 2, info: 'Yeast weight divided by total flour.' },
    { id: 'totalFlour', label: 'Total flour (g)', format: 'number', precision: 0, info: 'Flour added plus the flour inside the starter.' },
    { id: 'totalWater', label: 'Total water (g)', format: 'number', precision: 0, info: 'Water added plus the water inside the starter.' },
    { id: 'dough', label: 'Total dough (g)', format: 'number', precision: 0, info: 'Everything you put in the bowl.' },
  ],
  compute: (v) => {
    const f = num(v.flour), w = num(v.water), s = num(v.salt) ?? 0, y = num(v.yeast) ?? 0;
    const st = num(v.starter) ?? 0, sh = (num(v.starterHyd) ?? 100) / 100;
    if (f === null || w === null || f < 0 || w < 0 || s < 0 || y < 0 || st < 0 || sh < 0) return { hydration: null };
    const starterFlour = st / (1 + sh);
    const starterWater = st - starterFlour;
    const flour = f + starterFlour, water = w + starterWater;
    if (flour <= 0) return { hydration: null };
    const dough = f + w + s + y + st;
    const pct = (x: number) => (x / flour) * 100;
    return {
      hydration: water / flour,
      saltPct: s / flour,
      yeastPct: y / flour,
      totalFlour: flour,
      totalWater: water,
      dough,
      chart: {
        type: 'bar',
        title: "Baker's percentage (flour = 100%)",
        categories: ['Flour', 'Water', 'Salt', 'Yeast'],
        series: [{ name: '% of flour', values: [100, pct(water), pct(s), pct(y)] }],
        format: { format: 'number', precision: 1 },
        horizontal: true,
      },
      steps: [
        starterFlour > 0 ? `Starter ${+st.toFixed(1)} g at ${+(sh * 100).toFixed(0)}% = ${starterFlour.toFixed(1)} g flour + ${starterWater.toFixed(1)} g water` : 'No starter',
        `Total flour = ${flour.toFixed(1)} g, total water = ${water.toFixed(1)} g`,
        `Hydration = ${water.toFixed(1)} ÷ ${flour.toFixed(1)} = ${((water / flour) * 100).toFixed(1)}%`,
      ],
    };
  },
  content: {
    formula: ["Baker's % = ingredient weight ÷ total flour weight × 100", 'Hydration = total water ÷ total flour', 'Starter flour = starter ÷ (1 + hydration); starter water = the rest'],
    body: [
      "Baker's percentage describes a recipe by comparing every ingredient to the flour, which is always 100%. A dough with 500 g of flour, 350 g of water, 10 g of salt and 5 g of yeast is 100% flour, 70% water, 2% salt and 1% yeast. The total dough weighs 865 g.",
      'Hydration is the water percentage. Around 60 to 65% gives a stiff dough such as bagels, 70% is a common sandwich or country loaf, and 75% or more makes a wet, open-crumb dough such as ciabatta. Those ranges are rules of thumb, not standards.',
      'Sourdough starter is flour and water too, so it counts toward both. A 100% hydration starter is half flour and half water: 100 g of starter adds 50 g of flour and 50 g of water. Enter it in the starter field and the calculator adds both to the totals.',
    ],
    faq: [
      { q: 'What is 70% hydration?', a: 'It means the dough has 70 g of water for every 100 g of flour. With 500 g of flour, that is 350 g of water.' },
      { q: 'How is sourdough starter counted?', a: 'It is split into flour and water using its hydration. At 100% hydration, 100 g of starter is 50 g flour and 50 g water, and both go into the totals.' },
      { q: 'Why can the percentages add up to more than 100%?', a: 'Because flour is the 100% base and every other ingredient is measured against it. The total of all ingredients is normally about 170 to 180% of the flour.' },
    ],
  },
  related: ['recipe-scaler', 'cooking-converter', 'coffee-ratio'],
  examples: [
    { values: { flour: 500, water: 350, salt: 10, yeast: 5, starter: 0, starterHyd: 100 }, expect: { hydration: 0.7, saltPct: 0.02, yeastPct: 0.01, totalFlour: 500, totalWater: 350, dough: 865 }, tolerance: 1e-9 },
    { values: { flour: 400, water: 250, salt: 10, yeast: 0, starter: 200, starterHyd: 100 }, expect: { hydration: 0.7, saltPct: 0.02, totalFlour: 500, totalWater: 350, dough: 860 }, tolerance: 1e-9 },
  ],
});
