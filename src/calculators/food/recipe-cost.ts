import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const SLOTS = [1, 2, 3, 4, 5, 6, 7, 8];
const DEFAULTS: Record<number, [number, number, number]> = { 1: [4, 80, 32], 2: [3.6, 12, 3], 3: [5, 16, 4] };

const rowInputs = SLOTS.flatMap((n) => {
  const optional = n > 3;
  const d = DEFAULTS[n];
  const tail = optional ? ' Leave all three boxes blank if you have fewer ingredients.' : '';
  return [
    { id: `p${n}`, label: `Ingredient ${n} package price`, type: 'number' as const, prefix: '$', min: 0, step: 0.01, optional, ...(d ? { default: d[0] } : {}), info: `What you paid for the whole package of ingredient ${n}.${tail}` },
    { id: `q${n}`, label: `Ingredient ${n} package size`, type: 'number' as const, min: 0, step: 0.1, optional, ...(d ? { default: d[1] } : {}), help: 'Any unit, as long as the next box uses the same one.', info: 'How much is in the package, e.g. 80 oz of flour or 12 eggs.' },
    { id: `u${n}`, label: `Ingredient ${n} amount used`, type: 'number' as const, min: 0, step: 0.1, optional, ...(d ? { default: d[2] } : {}), info: 'How much the recipe uses, in the same unit as the package size.' },
  ];
});

export default defineCalculator({
  slug: 'recipe-cost',
  title: 'Recipe Cost Per Serving Calculator',
  category: 'food',
  description: 'Add up what a recipe really costs from the price of each package and the amount you use, then see the cost per serving and your margin if you sell it.',
  keywords: ['recipe cost calculator', 'cost per serving calculator', 'how much does a recipe cost', 'meal cost calculator', 'food cost per portion', 'homemade vs takeout cost'],
  inputs: [
    ...rowInputs,
    { id: 'servings', label: 'Servings', type: 'number', default: 6, min: 1, step: 1, info: 'How many portions the recipe makes.' },
    { id: 'sell', label: 'Selling price per serving (optional)', type: 'number', prefix: '$', min: 0, step: 0.01, optional: true, help: 'Fill in to see your margin, e.g. for a bake sale.', info: 'What you charge for one serving. Leave blank if you are not selling.' },
  ],
  outputs: [
    { id: 'perServing', label: 'Cost per serving', format: 'currency', precision: 2, primary: true, info: 'Total recipe cost divided by servings.' },
    { id: 'total', label: 'Total recipe cost', format: 'currency', precision: 2, info: 'Each ingredient’s package price × amount used ÷ package size, added together.' },
    { id: 'margin', label: 'Margin on selling price', format: 'percent', precision: 1, info: '(Selling price − cost per serving) ÷ selling price. Only shown when you enter a selling price.' },
  ],
  compute: (v) => {
    const servings = num(v.servings);
    if (servings === null || servings < 1) return { perServing: null };
    const rows: { n: number; cost: number }[] = [];
    for (const n of SLOTS) {
      const p = num(v[`p${n}`]), q = num(v[`q${n}`]), u = num(v[`u${n}`]);
      if (p === null && q === null && u === null) continue;
      if (p === null || q === null || u === null) return { perServing: null, error: `Fill in all three boxes for ingredient ${n}, or leave them all blank.` };
      if (p < 0 || q <= 0 || u < 0) return { perServing: null, error: `Ingredient ${n}: the package size must be above 0.` };
      rows.push({ n, cost: (p * u) / q });
    }
    if (!rows.length) return { perServing: null };
    const total = rows.reduce((s, r) => s + r.cost, 0);
    const perServing = total / servings;
    const sell = num(v.sell);
    return {
      perServing,
      total,
      margin: sell !== null && sell > 0 ? (sell - perServing) / sell : null,
      chart: {
        type: 'bar',
        title: 'Cost of each ingredient',
        categories: rows.map((r) => `Ingredient ${r.n}`),
        series: [{ name: 'Cost', values: rows.map((r) => r.cost) }],
        format: { format: 'currency', precision: 2 },
        horizontal: true,
      },
      steps: [...rows.map((r) => `Ingredient ${r.n}: $${r.cost.toFixed(2)}`), `Total $${total.toFixed(2)} ÷ ${servings} servings = $${perServing.toFixed(3)}`],
    };
  },
  content: {
    formula: ['Ingredient cost = package price × amount used ÷ package size', 'Cost per serving = total of all ingredients ÷ servings', 'Margin = (selling price − cost per serving) ÷ selling price'],
    body: [
      'A recipe only costs what you actually use, not the whole package. If flour is $4.00 for 80 oz and the recipe uses 32 oz, that is $4.00 × 32 ÷ 80 = $1.60. Do that for each ingredient and add them up.',
      'For example, $1.60 of flour, $0.90 of eggs (3 of a $3.60 dozen) and $1.25 of butter (4 oz of a $5.00, 16 oz pack) come to $3.75. Spread over 6 servings, that is about $0.63 each.',
      'This counts ingredients only. Energy, packaging, your time and waste are not included, so add a margin if you sell the food. Use the same unit for the package size and the amount used in each row.',
    ],
    faq: [
      { q: 'Does the calculator convert units?', a: 'No. For each ingredient, enter the package size and the amount used in the same unit, such as ounces, grams or a count of eggs.' },
      { q: 'Does it include energy, packaging or my time?', a: 'No, only ingredients. Add those separately if you are pricing food to sell.' },
      { q: 'How is margin worked out?', a: 'Margin is the profit as a share of the selling price: (price − cost) ÷ price. A $2.00 serving that costs $0.625 has a margin of 68.75%.' },
    ],
  },
  related: ['recipe-scaler', 'markup', 'profit-margin'],
  examples: [
    { values: { p1: 4, q1: 80, u1: 32, p2: 3.6, q2: 12, u2: 3, p3: 5, q3: 16, u3: 4, servings: 6, sell: 2 }, expect: { total: 3.75, perServing: 0.625, margin: 0.6875 }, tolerance: 1e-6 },
  ],
});
