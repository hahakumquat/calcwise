import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const trim = (n: number) => String(+n.toPrecision(6));

export default defineCalculator({
  slug: 'solution-dilution',
  title: 'Solution Dilution Calculator (C1V1 = C2V2)',
  category: 'other',
  description: 'Work out how much stock solution and water to mix to reach a target strength, using C1V1 = C2V2. Handy for diluting alcohol, bleach or lab solutions.',
  keywords: ['dilution calculator', 'c1v1 c2v2 calculator', 'solution dilution calculator', 'how to dilute isopropyl alcohol', 'dilution formula', 'stock solution calculator'],
  updated: '2026-11-27',
  inputs: [
    { id: 'c1', label: 'Stock strength (C1)', type: 'number', suffix: '%', default: 70, min: 0, step: 1, info: 'Concentration of what you start with, such as 70 for 70% alcohol. Any concentration unit works if C1 and C2 use the same one.' },
    { id: 'c2', label: 'Target strength (C2)', type: 'number', suffix: '%', default: 50, min: 0, step: 1, info: 'Concentration you want. It must be lower than the stock strength.' },
    { id: 'v2', label: 'Final volume (V2)', type: 'number', unit: 'volume', defaultUnit: 'ml', default: 500, min: 0, step: 10, info: 'Total amount of diluted solution you want to end up with.' },
  ],
  outputs: [
    { id: 'v1', label: 'Stock solution to use (V1)', unit: 'volume', defaultUnit: 'ml', primary: true, precision: 4, info: 'V1 = C2 × V2 ÷ C1.' },
    { id: 'water', label: 'Water to add', unit: 'volume', defaultUnit: 'ml', precision: 4, info: 'Final volume minus stock volume.' },
  ],
  compute: (v) => {
    const c1 = num(v.c1), c2 = num(v.c2), v2 = num(v.v2);
    if (c1 === null || c2 === null || v2 === null) return { v1: null };
    if (c1 <= 0) return { v1: null, error: 'Stock strength must be greater than 0.' };
    if (c2 < 0 || v2 <= 0) return { v1: null, error: 'Target strength cannot be negative and final volume must be above 0.' };
    if (c2 > c1) return { v1: null, error: 'Target strength cannot be higher than the stock strength. Dilution only lowers it.' };
    const v2m3 = v2;
    const v1 = (c2 * v2m3) / c1;
    const water = v2m3 - v1;
    return {
      v1,
      water,
      chart: {
        type: 'bar',
        title: 'What goes into the final mix (share of volume, %)',
        categories: ['Stock solution', 'Water'],
        series: [{ name: 'Share of volume (%)', values: [(v1 / v2m3) * 100, (water / v2m3) * 100] }],
      },
      steps: [
        'Volumes are converted to cubic meters first, then back to your unit.',
        `V1 = C2 × V2 ÷ C1 = ${trim(c2)} × ${trim(v2m3)} ÷ ${trim(c1)} = ${trim(v1)} m³`,
        `Water = V2 − V1 = ${trim(v2m3)} − ${trim(v1)} = ${trim(water)} m³`,
      ],
      note: 'Assumes volumes add up. That is close for water-based mixes but not exact for strong alcohol or acid, so top up to the final mark rather than pouring a measured amount of water.',
    };
  },
  content: {
    formula: ['C1 × V1 = C2 × V2', 'C1 = stock strength, V1 = stock volume, C2 = target strength, V2 = final volume'],
    body: [
      'Dilution keeps the amount of the dissolved substance the same while adding more solvent, so strength times volume is equal before and after: C1V1 = C2V2. Enter the stock strength, the strength you want and the final volume, and the calculator gives the stock volume to measure and the water to add.',
      'For example, to make 500 mL of 50% isopropyl alcohol from a 70% bottle, V1 = 50 × 500 ÷ 70 = 357.1 mL of stock topped up with 142.9 mL of water.',
      'Concentration can be any unit, such as percent, molarity or mg/mL, as long as C1 and C2 use the same one. Always add the stronger solution to water, not the other way round, for acids, and follow the safety guidance on the label.',
    ],
    faq: [
      { q: 'How do I dilute 70% alcohol to 50%?', a: 'Use V1 = C2 × V2 ÷ C1. For 500 mL final, V1 = 50 × 500 ÷ 70 = 357.1 mL of 70% alcohol, then add water up to 500 mL (142.9 mL).' },
      { q: 'What does C1V1 = C2V2 mean?', a: 'The amount of dissolved substance (concentration times volume) is unchanged by adding solvent, so the stock side equals the diluted side.' },
      { q: 'Can I use molarity instead of percent?', a: 'Yes. Any concentration unit works if C1 and C2 are in the same one. The volume results do not change.' },
      { q: 'Why does the volume not add up exactly?', a: 'Some mixtures, like alcohol and water, shrink slightly when mixed. For precise work, add the stock to a flask and fill with water to the final mark.' },
      { q: 'Can this make a solution stronger?', a: 'No. Diluting only lowers strength, so the target must be at or below the stock strength.' },
    ],
    sources: [{ label: 'LibreTexts Chemistry, dilution of solutions', url: 'https://chem.libretexts.org/Bookshelves/Introductory_Chemistry/Introductory_Chemistry_(LibreTexts)/13%3A_Solutions/13.07%3A_Dilutions' }],
  },
  related: ['cold-brew-dilution', 'percentage'],
  examples: [
    { values: { c1: 70, c2: 50, v2: 0.0005 }, expect: { v1: 0.00035714285714, water: 0.00014285714286 }, tolerance: 1e-9 },
    { values: { c1: 10, c2: 1, v2: 0.001 }, expect: { v1: 0.0001, water: 0.0009 }, tolerance: 1e-9 },
    { values: { c1: 50, c2: 70, v2: 0.0005 }, expect: { error: 'Target strength cannot be higher than the stock strength. Dilution only lowers it.' } },
  ],
});
