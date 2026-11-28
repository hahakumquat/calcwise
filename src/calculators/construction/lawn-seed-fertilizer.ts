import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'lawn-seed-fertilizer',
  title: 'Lawn Seed & Fertilizer Calculator',
  category: 'construction',
  description: 'Work out how many pounds of grass seed and fertilizer your lawn needs from its area, seed rate, nitrogen target and bag size, and how many bags to buy.',
  keywords: ['lawn seed calculator', 'grass seed calculator', 'fertilizer calculator', 'how much grass seed do i need', 'lawn fertilizer calculator', 'nitrogen per 1000 sq ft'],
  updated: '2026-11-28',
  inputs: [
    { id: 'area', label: 'Lawn area', type: 'number', default: 5000, min: 0, step: 100, suffix: 'sq ft', info: 'Total grass area to seed and feed. Measure the lawn and subtract beds, paths and the house. Use the Square Footage calculator if needed.' },
    { id: 'seedRate', label: 'Seed rate (lb per 1,000 sq ft)', type: 'number', default: 4, min: 0, step: 0.5, suffix: 'lb', info: 'A typical overseeding assumption. Rates vary by grass species and by new seeding versus overseeding, so follow the seed bag label.' },
    { id: 'nTarget', label: 'Nitrogen target (lb N per 1,000 sq ft)', type: 'number', default: 1, min: 0, step: 0.25, suffix: 'lb N', info: 'Pounds of actual nitrogen per 1,000 sq ft per application. 1 is a common figure; check your fertilizer label and local guidance.' },
    { id: 'nPct', label: 'Fertilizer nitrogen content', type: 'number', default: 24, min: 0, max: 100, step: 1, suffix: '%', info: 'The first number of the N-P-K on the bag, for example 24 in 24-0-6.' },
    { id: 'bag', label: 'Fertilizer bag size', type: 'number', default: 40, min: 0, step: 1, suffix: 'lb', info: 'Weight of one bag of fertilizer in pounds.' },
  ],
  outputs: [
    { id: 'seedLb', label: 'Grass seed needed', format: 'number', precision: 1, suffix: 'lb', primary: true, info: 'Area ÷ 1,000 × seed rate.' },
    { id: 'fertLb', label: 'Fertilizer needed', format: 'number', precision: 2, suffix: 'lb', info: 'Area ÷ 1,000 × nitrogen target ÷ (nitrogen % ÷ 100).' },
    { id: 'bags', label: 'Fertilizer bags to buy', format: 'integer', info: 'Fertilizer pounds ÷ bag size, rounded up.' },
    { id: 'leftover', label: 'Fertilizer left over', format: 'number', precision: 2, suffix: 'lb', info: 'Bags × bag size minus the fertilizer needed.' },
  ],
  compute: (v) => {
    const area = num(v.area), rate = num(v.seedRate), nT = num(v.nTarget), nPct = num(v.nPct), bag = num(v.bag);
    if (area === null || rate === null || nT === null || nPct === null || bag === null) return { seedLb: null };
    if (area <= 0) return { seedLb: null, error: 'Lawn area must be greater than zero.' };
    if (nPct <= 0 || nPct > 100) return { seedLb: null, error: 'Fertilizer nitrogen must be above 0% and at most 100%.' };
    if (rate < 0 || nT < 0) return { seedLb: null, error: 'Rates cannot be negative.' };
    if (bag <= 0) return { seedLb: null, error: 'Bag size must be greater than zero.' };
    const k = area / 1000;
    const sqft = area;
    const seedLb = k * rate;
    const fertLb = (k * nT) / (nPct / 100);
    const bags = Math.ceil(fertLb / bag - 1e-9);
    const leftover = bags * bag - fertLb;
    return {
      seedLb, fertLb, bags, leftover,
      tone: 'ok',
      badge: `${fmt(seedLb, 1)} lb seed, ${bags} bag${bags === 1 ? '' : 's'}`,
      chart: {
        type: 'bar',
        title: 'Fertilizer: needed vs bought (lb)',
        categories: ['Needed', 'In bags bought'],
        series: [{ name: 'Pounds', values: [fertLb, bags * bag] }],
        format: { format: 'number', precision: 1, suffix: ' lb' },
      },
      steps: [
        `Area = ${fmt(sqft, 0)} sq ft = ${fmt(k, 3)} thousand sq ft`,
        `Seed = ${fmt(k, 3)} × ${fmt(rate)} lb = ${fmt(seedLb)} lb`,
        `Fertilizer = ${fmt(k, 3)} × ${fmt(nT)} lb N ÷ ${fmt(nPct / 100, 4)} = ${fmt(fertLb)} lb`,
        `Bags = ${fmt(fertLb)} ÷ ${fmt(bag)} lb, rounded up = ${bags}; ${fmt(leftover)} lb left over`,
      ],
      note: 'Seed rates vary by species, and the bag label rules, so check it before spreading. Do not exceed the fertilizer label rate, and keep fertilizer off hard surfaces and away from water.',
    };
  },
  content: {
    formula: [
      'Seed (lb) = area ÷ 1,000 × seed rate (lb per 1,000 sq ft)',
      'Fertilizer (lb) = area ÷ 1,000 × nitrogen target ÷ (nitrogen % ÷ 100)',
      'Bags = fertilizer lb ÷ bag size, rounded up',
    ],
    body: [
      'Lawn products are labeled per 1,000 square feet, so the math is the area in thousands times a rate. This calculator turns your lawn size into pounds of seed and pounds of fertilizer, then into whole bags.',
      'Fertilizer is sized by nitrogen. A bag marked 24-0-6 is 24% nitrogen by weight, so delivering 1 lb of nitrogen takes 1 ÷ 0.24 = 4.17 lb of product per 1,000 sq ft.',
      'The default seed rate of 4 lb per 1,000 sq ft is a typical overseeding assumption you can edit. Seed rates vary by species and by new seeding versus overseeding, and the bag label rules. Always follow the label for both seed and fertilizer.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A 5,000 sq ft lawn at 4 lb per 1,000 sq ft needs 20 lb of seed. At 1 lb N per 1,000 sq ft with 24% fertilizer, it needs 5 × 1 ÷ 0.24 = 20.83 lb, which is 1 bag of 40 lb with about 19.17 lb left.' },
      { q: 'How much grass seed do I need per square foot?', a: 'The default of 4 lb per 1,000 sq ft is a typical overseeding assumption. New lawns often use more, and rates vary by species. Follow the seed bag label.' },
      { q: 'Why is fertilizer sized by nitrogen?', a: 'Nitrogen drives leaf growth and is what lawn guidance is written in. The bag percentage tells you how much of its weight is nitrogen, so lower-percent products need more pounds for the same nitrogen.' },
      { q: 'How do I find my lawn area?', a: 'Multiply length by width for each rectangle of grass and add them up, or use the Square Footage calculator. Subtract beds, paths and buildings.' },
    ],
    sources: [],
  },
  related: ['square-footage', 'mulch', 'gravel'],
  examples: [
    // 5000 sq ft: seed 5*4=20; fert 5*1/0.24=20.833333; 1 bag; leftover 40-20.833333=19.166667
    { values: { area: 5000, seedRate: 4, nTarget: 1, nPct: 24, bag: 40 }, expect: { seedLb: 20, fertLb: 20.833333, bags: 1, leftover: 19.166667 }, tolerance: 1e-4 },
    // 12000 sq ft, 3 lb seed -> 36; fert 12*1.5/0.30 = 60 lb exactly; bag 25 -> 3 bags (60/25=2.4)
    { values: { area: 12000, seedRate: 3, nTarget: 1.5, nPct: 30, bag: 25 }, expect: { seedLb: 36, fertLb: 60, bags: 3, leftover: 15 }, tolerance: 1e-4 },
  ],
});
