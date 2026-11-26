import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const DENSITY = 0.789; // g/mL, ethanol at about 20 C
const KCAL_PER_G = 7; // kcal per gram of alcohol
const US_DRINK_G = 14; // grams of pure alcohol in a US standard drink (NIAAA)

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'alcohol-units',
  title: 'Alcohol Units and Calories Calculator',
  category: 'health',
  description: 'Turn drink size, ABV and number of drinks into UK units, US standard drinks, grams of alcohol and calories from the alcohol itself.',
  keywords: ['alcohol units calculator', 'standard drink calculator', 'units in a bottle of wine', 'alcohol calories', 'ABV to units', 'how many units in a pint'],
  updated: '2026-11-26',
  inputs: [
    { id: 'volume', label: 'Drink size', type: 'number', unit: 'volume', units: ['ml', 'floz'], defaultUnit: 'ml', default: 750e-6, min: 0, info: 'The volume of one drink. A wine bottle is 750 mL; a US pint is about 473 mL; a UK pint is 568 mL.' },
    { id: 'abv', label: 'Alcohol by volume (ABV)', type: 'number', suffix: '%', default: 13, min: 0, max: 100, step: 0.1, info: 'The ABV printed on the label.' },
    { id: 'count', label: 'Number of drinks', type: 'number', default: 1, min: 0, step: 1, info: 'How many drinks of this size and strength.' },
  ],
  outputs: [
    { id: 'units', label: 'UK units', primary: true, precision: 2, info: 'Drink size in mL × ABV % ÷ 1000, times the number of drinks. One UK unit is 10 mL of pure alcohol.' },
    { id: 'usDrinks', label: 'US standard drinks', precision: 1, info: 'Grams of pure alcohol ÷ 14. A US standard drink contains 14 g of pure alcohol.' },
    { id: 'grams', label: 'Pure alcohol', precision: 1, suffix: 'g', info: 'Pure alcohol in mL × 0.789 g/mL.' },
    { id: 'kcal', label: 'Calories from alcohol', precision: 0, suffix: 'kcal', info: 'Grams of alcohol × 7 kcal. Sugar and mixers are not included.' },
    { id: 'ethanolMl', label: 'Pure alcohol (volume)', precision: 1, suffix: 'mL', info: 'Drink size × ABV ÷ 100, times the number of drinks.' },
  ],
  compute: (v) => {
    const vol = num(v.volume), abv = num(v.abv), count = num(v.count);
    if (vol === null || abv === null || count === null) return { units: null };
    if (vol < 0 || abv < 0 || abv > 100 || count < 0) return { units: null };
    const ml = vol * 1e6; // volume input arrives in m3
    const ethanolMl = ml * (abv / 100) * count;
    const units = ethanolMl / 10;
    const grams = ethanolMl * DENSITY;
    const kcal = grams * KCAL_PER_G;
    const usDrinks = grams / US_DRINK_G;
    const counts = [...new Set([1, 2, 3, 4, 5, Math.round(count)])].filter((c) => c >= 0).sort((a, b) => a - b);
    return {
      units,
      usDrinks,
      grams,
      kcal,
      ethanolMl,
      tone: 'ok',
      badge: `${fmt(units, 2)} units, ${fmt(kcal, 0)} kcal`,
      note: 'Calories shown are from the alcohol only. Sugar, juice and mixers add more. This is arithmetic, not medical advice. Ask a doctor or pharmacist if you are unsure what is safe for you.',
      chart: {
        type: 'bar' as const,
        title: 'UK units by number of drinks',
        categories: counts.map((c) => `${c} drink${c === 1 ? '' : 's'}`),
        series: [{ name: 'UK units', values: counts.map((c) => (ml * (abv / 100) * c) / 10) }],
        format: { format: 'number', precision: 1 },
        highlight: counts.indexOf(Math.round(count)),
      },
      steps: [
        `Pure alcohol = ${fmt(ml, 0)} mL × ${fmt(abv, 1)}% × ${fmt(count, 1)} = ${fmt(ethanolMl, 1)} mL`,
        `UK units = ${fmt(ml, 0)} × ${fmt(abv, 1)} ÷ 1000 × ${fmt(count, 1)} = ${fmt(units, 2)}`,
        `Grams = ${fmt(ethanolMl, 1)} mL × ${DENSITY} g/mL = ${fmt(grams, 1)} g`,
        `Calories = ${fmt(grams, 1)} g × ${KCAL_PER_G} kcal = ${fmt(kcal, 0)} kcal`,
        `US standard drinks = ${fmt(grams, 1)} ÷ ${US_DRINK_G} = ${fmt(usDrinks, 1)}`,
      ],
    };
  },
  content: {
    formula: [
      'Pure alcohol (mL) = drink size (mL) × ABV ÷ 100 × number of drinks',
      'UK units = drink size (mL) × ABV ÷ 1000 × number of drinks',
      'Grams of alcohol = pure alcohol (mL) × 0.789 g/mL',
      'Calories from alcohol = grams × 7 kcal/g',
      'US standard drinks = grams ÷ 14',
    ],
    body: [
      'A glass, a can and a bottle all hold different amounts of alcohol, and the label rarely says how much. Enter the drink size, the ABV on the label and how many you have, and this calculator converts them to UK units, US standard drinks, grams of pure alcohol and the calories that come from the alcohol itself.',
      'One UK unit is 10 mL (about 8 g) of pure alcohol. A US standard drink is 14 g. Ethanol weighs about 0.789 g per mL, and alcohol provides about 7 calories per gram, so a full bottle of 13% wine holds more than 500 kcal from alcohol alone.',
      'The calorie figure leaves out sugar, juice, soda and other mixers, which can add a lot. Nothing here is medical advice, and the numbers say nothing about how alcohol will affect you. To estimate blood alcohol, see the BAC calculator, and for a month off drinking, try Dry January. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How many units are in a bottle of wine?', a: 'A 750 mL bottle at 13% ABV is 750 × 13 ÷ 1000 = 9.75 UK units. It holds 97.5 mL of pure alcohol, which is about 76.9 g, or 5.5 US standard drinks.' },
      { q: 'How many calories are in the alcohol in a bottle of wine?', a: 'About 76.9 g of alcohol × 7 kcal per gram is roughly 538 kcal for a 750 mL bottle at 13%. That counts the alcohol only, not any sugar in the wine.' },
      { q: 'How many units are in a pint of beer?', a: 'A 500 mL beer at 5% ABV is 2.5 UK units. It holds 25 mL of pure alcohol, about 19.7 g, which is 138 kcal from alcohol and 1.4 US standard drinks.' },
      { q: 'What is the difference between a UK unit and a US standard drink?', a: 'A UK unit is 10 mL of pure alcohol, about 7.9 g. A US standard drink is 14 g, so one US standard drink is about 1.8 UK units.' },
      { q: 'Why does the calculator use 0.789 g/mL?', a: 'That is the approximate density of pure ethanol at room temperature. It converts the volume of alcohol in your drink into grams, which is how standard drinks and calories are counted.' },
    ],
    sources: [
      { label: 'NHS: Alcohol units', url: 'https://www.nhs.uk/live-well/alcohol-advice/calculating-alcohol-units/' },
      { label: 'NIAAA: What is a standard drink?', url: 'https://www.niaaa.nih.gov/alcohols-effects-health/what-standard-drink' },
    ],
  },
  related: ['dry-january', 'bac', 'sugary-drink-swap', 'food-burn-off'],
  examples: [
    // 750 mL x 13% = 97.5 mL ethanol; units 750 x 13 / 1000 = 9.75; g = 97.5 x 0.789 = 76.9275; kcal = 538.4925; std = 76.9275 / 14 = 5.4948
    { values: { volume: 750e-6, abv: 13, count: 1 }, expect: { units: 9.75, ethanolMl: 97.5, grams: 76.9275, kcal: 538.4925, usDrinks: 5.494821 }, tolerance: 1e-4 },
    // 500 mL x 5% = 25 mL; units 2.5; g = 19.725; kcal = 138.075; std = 1.40893
    { values: { volume: 500e-6, abv: 5, count: 1 }, expect: { units: 2.5, ethanolMl: 25, grams: 19.725, kcal: 138.075, usDrinks: 1.408929 }, tolerance: 1e-4 },
  ],
});
