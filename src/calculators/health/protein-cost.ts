import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number, d = 2) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
const g = (n: number) => n.toLocaleString('en-US', { maximumFractionDigits: 1 });

export default defineCalculator({
  slug: 'protein-cost',
  title: 'Protein Cost Per Gram Calculator',
  category: 'health',
  description: 'Compare two protein sources by what each gram costs. Enter price, servings and protein per serving to see cost per 100 g and per day.',
  keywords: ['protein cost per gram', 'cheapest protein', 'protein powder cost per serving', 'price per gram of protein', 'cheap protein sources', 'protein per dollar'],
  updated: '2026-11-22',
  inputs: [
    { id: 'priceA', label: 'Product A price', type: 'number', prefix: '$', default: 24.99, min: 0, step: 0.01, info: 'What you pay for the whole pack, tub or tray of product A.' },
    { id: 'servingsA', label: 'Product A servings', type: 'number', default: 30, min: 0, step: 1, info: 'How many servings or units are in the pack (for example scoops, eggs or cans).' },
    { id: 'proteinA', label: 'Product A protein per serving', type: 'number', suffix: 'g', default: 24, min: 0, step: 0.5, info: 'Grams of protein in one serving, from the nutrition label.' },
    { id: 'priceB', label: 'Product B price', type: 'number', prefix: '$', default: 12, min: 0, step: 0.01, info: 'What you pay for the whole pack of product B.' },
    { id: 'servingsB', label: 'Product B servings', type: 'number', default: 12, min: 0, step: 1, info: 'How many servings or units are in the pack.' },
    { id: 'proteinB', label: 'Product B protein per serving', type: 'number', suffix: 'g', default: 6, min: 0, step: 0.5, info: 'Grams of protein in one serving, from the label.' },
    { id: 'target', label: 'Daily protein target', type: 'number', suffix: 'g', default: 140, min: 0, step: 1, info: 'Grams of protein you want per day. Use the protein calculator if you are not sure.' },
  ],
  outputs: [
    { id: 'best100', label: 'Cheapest protein, per 100 g', format: 'currency', primary: true, info: 'Price per 100 g of protein for the cheaper product.' },
    { id: 'cheaper', label: 'Cheaper product', format: 'text', info: 'The product with the lower cost per gram of protein.' },
    { id: 'per100A', label: 'Product A per 100 g protein', format: 'currency', info: 'Price ÷ (servings × protein per serving) × 100.' },
    { id: 'per100B', label: 'Product B per 100 g protein', format: 'currency', info: 'Price ÷ (servings × protein per serving) × 100.' },
    { id: 'perGramA', label: 'Product A per gram', format: 'currency', precision: 4, info: 'Price ÷ total grams of protein in the pack.' },
    { id: 'perGramB', label: 'Product B per gram', format: 'currency', precision: 4, info: 'Price ÷ total grams of protein in the pack.' },
    { id: 'dailyA', label: 'Product A, cost per day at target', format: 'currency', info: 'Cost per gram × daily target, if all your protein came from A.' },
    { id: 'dailyB', label: 'Product B, cost per day at target', format: 'currency', info: 'Cost per gram × daily target, if all your protein came from B.' },
    { id: 'dailySaving', label: 'Saving per day with the cheaper one', format: 'currency', info: 'Difference between the two daily costs.' },
  ],
  compute: (v) => {
    const pA = num(v.priceA), sA = num(v.servingsA), prA = num(v.proteinA);
    const pB = num(v.priceB), sB = num(v.servingsB), prB = num(v.proteinB);
    const target = num(v.target);
    if (pA === null || sA === null || prA === null || pB === null || sB === null || prB === null || target === null) return { best100: null };
    if (pA < 0 || pB < 0 || sA <= 0 || sB <= 0 || prA <= 0 || prB <= 0 || target < 0) return { best100: null };
    const gramsA = sA * prA;
    const gramsB = sB * prB;
    const perGramA = pA / gramsA;
    const perGramB = pB / gramsB;
    const dailyA = perGramA * target;
    const dailyB = perGramB * target;
    const aWins = perGramA < perGramB;
    const tied = perGramA === perGramB;
    const best = Math.min(perGramA, perGramB);
    const dailySaving = Math.abs(dailyA - dailyB);
    const name = tied ? 'Tie' : aWins ? 'Product A' : 'Product B';
    return {
      best100: best * 100,
      cheaper: name,
      per100A: perGramA * 100,
      per100B: perGramB * 100,
      perGramA,
      perGramB,
      dailyA,
      dailyB,
      dailySaving,
      tone: 'good' as const,
      badge: tied ? 'Same price per gram' : `${name} is cheaper`,
      note: tied
        ? `Both products cost ${usd(perGramA * 100)} per 100 g of protein.`
        : `${name} costs ${usd(best * 100)} per 100 g of protein, against ${usd(Math.max(perGramA, perGramB) * 100)} for the other. At ${g(target)} g a day that is ${usd(Math.min(dailyA, dailyB))} versus ${usd(Math.max(dailyA, dailyB))}, a difference of ${usd(dailySaving)} a day. This compares protein only, not calories, taste or other nutrients.`,
      chart: {
        type: 'bar',
        title: 'Cost per 100 g of protein',
        categories: ['Product A', 'Product B'],
        series: [{ name: 'Per 100 g protein', values: [perGramA * 100, perGramB * 100] }],
        format: { format: 'currency' },
        highlight: tied ? undefined : aWins ? 0 : 1,
      },
      steps: [
        `A protein per pack = ${g(sA)} × ${g(prA)} g = ${g(gramsA)} g`,
        `B protein per pack = ${g(sB)} × ${g(prB)} g = ${g(gramsB)} g`,
        `A per gram = ${usd(pA)} ÷ ${g(gramsA)} = ${usd(perGramA, 4)}`,
        `B per gram = ${usd(pB)} ÷ ${g(gramsB)} = ${usd(perGramB, 4)}`,
        `Per day at ${g(target)} g: A ${usd(dailyA)}, B ${usd(dailyB)}`,
      ],
    };
  },
  content: {
    formula: [
      'Protein per pack (g) = servings × protein per serving',
      'Cost per gram = price ÷ protein per pack',
      'Cost per 100 g = cost per gram × 100',
      'Cost per day = cost per gram × daily protein target',
    ],
    body: [
      'The cheapest tub on the shelf is not always the cheapest protein. What matters is how many grams of protein you get for each dollar, and that depends on the price, the number of servings and the protein in each serving.',
      'Enter two products side by side. The calculator turns each one into a cost per gram and per 100 g of protein, then shows what you would spend per day if all your protein came from that product, using your daily target.',
      'The protein values are whatever you type in from the label. This tool only does arithmetic on those numbers. It does not judge protein quality, calories, fat or sugar, and it makes no health claims. Everything runs in your browser.',
    ],
    sections: [
      {
        heading: 'Compare like with like',
        paragraphs: [
          'Check that servings means the same thing for both products. A tub with 30 scoops and a tray of 12 eggs are both fine, as long as the servings and protein per serving are for the same unit. Do not mix a serving size from the front of the pack with a count from the back.',
          'Real eating mixes foods. If you want to see the cost of a mixed plan, run each food on its own and add up the grams each will supply.',
        ],
      },
    ],
    faq: [
      { q: 'How do you work out protein cost per gram?', a: 'Multiply servings by protein per serving to get grams in the pack, then divide the price by that. For $24.99, 30 servings and 24 g each, that is 720 g, so $24.99 ÷ 720 = $0.0347 per gram, or $3.47 per 100 g.' },
      { q: 'How much does 140 g of protein a day cost?', a: 'Multiply the cost per gram by 140. At $0.0347 per gram that is $4.86 a day. For 12 eggs at $12.00 with 6 g each, the pack has 72 g, so $0.1667 per gram and $23.33 a day.' },
      { q: 'Does the cheapest per gram always win?', a: 'It wins on price per gram of protein, nothing more. Calories, other nutrients, taste and how easy it is to eat all matter too, and this calculator does not score them.' },
      { q: 'Where do I find protein per serving?', a: 'On the nutrition label of the product. The calculator uses whatever you enter and does not check it.' },
    ],
  },
  related: ['protein', 'unit-price', 'macro', 'recipe-cost'],
  examples: [
    // A: 30 × 24 = 720 g; 24.99 ÷ 720 = 0.03470833; per 100 g = 3.470833; daily 140 × 0.03470833 = 4.859167.
    // B: 12 × 6 = 72 g; 12 ÷ 72 = 0.1666667; per 100 g = 16.66667; daily 23.33333; saving 23.333333 − 4.859167 = 18.474167.
    { values: { priceA: 24.99, servingsA: 30, proteinA: 24, priceB: 12, servingsB: 12, proteinB: 6, target: 140 }, expect: { best100: 24.99 / 7.2, per100A: 24.99 / 7.2, per100B: 100 / 6, perGramA: 24.99 / 720, perGramB: 12 / 72, dailyA: (140 * 24.99) / 720, dailyB: 140 / 6, dailySaving: 140 / 6 - (140 * 24.99) / 720 }, tolerance: 1e-9 },
    // Swap: A is 12 eggs at $12 (72 g, $0.16667/g), B is 30 × 24 g at $24.99 -> cheaper is B, best100 3.470833.
    { values: { priceA: 12, servingsA: 12, proteinA: 6, priceB: 24.99, servingsB: 30, proteinB: 24, target: 100 }, expect: { best100: 24.99 / 7.2, dailyA: 100 / 6, dailyB: 2499 / 720 }, tolerance: 1e-9 },
  ],
});
