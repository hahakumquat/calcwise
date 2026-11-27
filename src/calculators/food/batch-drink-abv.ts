import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Assumptions stated on the page (not sourced from a page we opened):
const DENSITY = 0.789; // g/mL, ethanol at about 20 C
const US_DRINK_G = 14; // grams of pure alcohol in a US standard drink
const SLOTS = [1, 2, 3, 4, 5, 6];

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

const ingredientInputs = SLOTS.flatMap((i) => [
  {
    id: `vol${i}`, label: `Ingredient ${i} volume`, type: 'number' as const, unit: 'volume' as const, units: ['ml', 'floz'], defaultUnit: 'ml',
    ...(i === 1 ? { default: 750e-6 } : i === 2 ? { default: 1500e-6 } : i === 3 ? { default: 500e-6 } : {}),
    min: 0, optional: i > 1, placeholder: i > 1 ? 'Optional' : undefined,
    info: i === 1 ? 'How much of this ingredient goes into the batch, for example a 750 mL bottle of spirit.' : 'Leave blank if you are not using this slot. Juice, soda and ice-free mixers count too, at 0% ABV.',
  },
  {
    id: `abv${i}`, label: `Ingredient ${i} ABV`, type: 'number' as const, suffix: '%', min: 0, max: 100, step: 0.1,
    ...(i === 1 ? { default: 40 } : i === 2 || i === 3 ? { default: 0 } : {}),
    optional: i > 1, placeholder: i > 1 ? 'Optional' : undefined,
    info: 'Alcohol by volume from the label. Use 0 for juice, soda and other non-alcoholic mixers. 80 proof is 40%.',
  },
]);

export default defineCalculator({
  slug: 'batch-drink-abv',
  title: 'Batch Drink ABV and Servings Calculator',
  category: 'food',
  description: 'Mix up to six ingredients for a punch or batch cocktail and get the final ABV, servings and standard drinks per serving. An estimate; never drink and drive.',
  keywords: ['batch cocktail abv calculator', 'punch abv calculator', 'cocktail abv calculator', 'final abv of a mixed drink', 'standard drinks in punch', 'party punch strength'],
  updated: '2026-11-27',
  inputs: [
    ...ingredientInputs,
    { id: 'serving', label: 'Serving size', type: 'number', unit: 'volume', units: ['ml', 'floz'], defaultUnit: 'ml', default: 150e-6, min: 0, info: 'The volume of one cup or glass you plan to pour, not counting ice.' },
  ],
  outputs: [
    { id: 'abv', label: 'Final ABV', primary: true, precision: 2, suffix: '%', info: 'Total pure alcohol divided by total liquid volume, times 100.' },
    { id: 'totalMl', label: 'Total volume', precision: 0, suffix: 'mL', info: 'All ingredients added together, before any ice.' },
    { id: 'ethanolMl', label: 'Pure alcohol', precision: 1, suffix: 'mL', info: 'Sum of volume × ABV ÷ 100 for each ingredient.' },
    { id: 'standardDrinks', label: 'Standard drinks in the batch', precision: 2, info: 'Pure alcohol in mL × 0.789 g/mL ÷ 14 g per US standard drink.' },
    { id: 'servings', label: 'Servings', precision: 2, info: 'Total volume divided by serving size.' },
    { id: 'drinksPerServing', label: 'Standard drinks per serving', precision: 2, info: 'Standard drinks in the batch divided by the number of servings.' },
  ],
  compute: (v) => {
    const serving = num(v.serving);
    if (serving === null || serving <= 0) return { abv: null, error: 'Enter a serving size above zero.' };
    let totalM3 = 0, ethanolM3 = 0, used = 0;
    const parts: { label: string; ml: number; eth: number }[] = [];
    for (const i of SLOTS) {
      const vol = num(v[`vol${i}`]);
      const abv = num(v[`abv${i}`]);
      if (vol === null && abv === null) continue;
      if (vol === null || vol <= 0) {
        if (abv !== null && abv > 0) return { abv: null, error: `Ingredient ${i} has an ABV but no volume.` };
        continue;
      }
      const a = abv ?? 0;
      if (a < 0 || a > 100) return { abv: null, error: `Ingredient ${i} ABV must be between 0 and 100.` };
      totalM3 += vol;
      ethanolM3 += vol * a / 100;
      used++;
      parts.push({ label: `Ingredient ${i}`, ml: vol * 1e6, eth: vol * a / 100 * 1e6 });
    }
    if (used === 0 || totalM3 <= 0) return { abv: null, error: 'Enter at least one ingredient with a volume.' };
    const totalMl = totalM3 * 1e6;
    const ethanolMl = ethanolM3 * 1e6;
    const abv = ethanolMl / totalMl * 100;
    const standardDrinks = ethanolMl * DENSITY / US_DRINK_G;
    const servings = totalMl / (serving * 1e6);
    const perServing = standardDrinks / servings;
    return {
      abv,
      totalMl,
      ethanolMl,
      standardDrinks,
      servings,
      drinksPerServing: perServing,
      tone: 'ok',
      badge: `About ${fmt(abv, 1)}% ABV, ${fmt(perServing, 1)} standard drinks per serving`,
      note: 'This is an estimate from the numbers you entered. Melting ice dilutes a drink, so the real strength in the cup is lower. It is arithmetic, not advice on how much is safe, and it does not tell you how alcohol will affect you. Never drink and drive.',
      chart: {
        type: 'bar' as const,
        title: 'Pure alcohol by ingredient (mL)',
        categories: parts.map((p) => p.label),
        series: [{ name: 'Pure alcohol (mL)', values: parts.map((p) => p.eth) }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Pure alcohol = ${parts.map((p) => fmt(p.eth, 1)).join(' + ')} = ${fmt(ethanolMl, 1)} mL`,
        `Total volume = ${parts.map((p) => fmt(p.ml, 0)).join(' + ')} = ${fmt(totalMl, 0)} mL`,
        `ABV = ${fmt(ethanolMl, 1)} ÷ ${fmt(totalMl, 0)} × 100 = ${fmt(abv, 2)}%`,
        `Standard drinks = ${fmt(ethanolMl, 1)} mL × ${DENSITY} g/mL ÷ ${US_DRINK_G} g = ${fmt(standardDrinks, 2)}`,
        `Servings = ${fmt(totalMl, 0)} ÷ ${fmt(serving * 1e6, 0)} mL = ${fmt(servings, 2)}, so ${fmt(perServing, 2)} standard drinks each`,
      ],
    };
  },
  content: {
    formula: [
      'Pure alcohol (mL) = sum of each ingredient volume × ABV ÷ 100',
      'Final ABV = pure alcohol ÷ total volume × 100',
      'Standard drinks = pure alcohol (mL) × 0.789 ÷ 14',
      'Servings = total volume ÷ serving size',
    ],
    body: [
      'Enter each ingredient in your punch or batch cocktail with its volume and the ABV on the label. Use 0% for juice, soda and other mixers. The calculator adds up the pure alcohol, divides by the total liquid and gives you the final ABV, the number of servings and the standard drinks in each serving.',
      'Two assumptions are built in. A US standard drink is taken to be 14 grams of pure alcohol, and pure ethanol is taken to weigh 0.789 grams per millilitre (at about 20 C). Other countries use different standard drink sizes, so check yours if you are not in the US. For one drink at a time, or UK units, use the alcohol units calculator.',
      'The result is an estimate. It assumes volumes simply add up, which is close but not exact because alcohol and water shrink slightly when mixed, and it ignores ice. Ice melting in a punch bowl lowers the strength over time, so the first cup is stronger than the last. Labels are also rounded.',
      'Plan for people who do not drink, and have water and non-alcoholic options out. Nothing here is a reason to drink more. Never drink and drive: arrange a ride, a designated driver or somewhere to stay. To plan how many bottles to buy for a crowd, see the party drinks calculator.',
    ],
    faq: [
      { q: 'What is the ABV of vodka, cranberry juice and ginger ale punch?', a: 'With 750 mL of 40% vodka, 1,500 mL of cranberry juice and 500 mL of ginger ale, the pure alcohol is 750 × 0.40 = 300 mL in 2,750 mL of liquid. That is 300 ÷ 2,750 × 100 = 10.91% ABV.' },
      { q: 'How many standard drinks are in that batch?', a: '300 mL of pure alcohol × 0.789 g/mL = 236.7 g. Divided by 14 g per US standard drink, that is 16.91 standard drinks in the whole batch.' },
      { q: 'How many servings and how strong is each one?', a: 'At 150 mL per serving, 2,750 mL makes 18.33 servings. Each serving then holds 16.91 ÷ 18.33 = 0.92 standard drinks.' },
      { q: 'Does ice change the ABV?', a: 'Yes. Melting ice adds water, so the drink gets weaker the longer it sits. The calculator ignores ice, so treat the ABV as the strength before dilution.' },
      { q: 'Why is the result only an estimate?', a: 'Volumes are assumed to add up exactly, label ABVs are rounded, and a real pour is rarely exact. Alcohol and water also shrink slightly when mixed. The figures are for planning, not for judging how much is safe to drink.' },
    ],
  },
  related: ['party-drinks', 'alcohol-units', 'recipe-scaler'],
  examples: [
    // ethanol = 750 x 0.40 = 300 mL; total = 750 + 1500 + 500 = 2750 mL; ABV = 300 / 2750 x 100 = 10.9091
    // std = 300 x 0.789 / 14 = 236.7 / 14 = 16.9071; servings = 2750 / 150 = 18.3333; per serving = 16.9071 / 18.3333 = 0.92222
    { values: { vol1: 750e-6, abv1: 40, vol2: 1500e-6, abv2: 0, vol3: 500e-6, abv3: 0, serving: 150e-6 }, expect: { abv: 10.909091, totalMl: 2750, ethanolMl: 300, standardDrinks: 16.907143, servings: 18.333333, drinksPerServing: 0.922208 }, tolerance: 1e-4 },
    // 1000 mL at 12% wine + 1000 mL at 0%: ethanol 120 mL; total 2000; ABV 6; std = 120 x 0.789 / 14 = 6.762857; servings 2000 / 200 = 10; per = 0.676286
    { values: { vol1: 1000e-6, abv1: 12, vol2: 1000e-6, abv2: 0, vol3: null, abv3: null, serving: 200e-6 }, expect: { abv: 6, totalMl: 2000, ethanolMl: 120, standardDrinks: 6.762857, servings: 10, drinksPerServing: 0.676286 }, tolerance: 1e-4 },
  ],
});
