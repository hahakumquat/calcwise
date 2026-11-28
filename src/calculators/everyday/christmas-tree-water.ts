import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const LITRES_PER_QUART = 0.946352946;

export default defineCalculator({
  slug: 'christmas-tree-water',
  title: 'Christmas Tree Water Per Day Calculator',
  category: 'everyday',
  description: 'Find how much water a cut Christmas tree drinks each day from its trunk diameter, plus refills per week and how long a full stand lasts.',
  keywords: ['christmas tree water calculator', 'how much water does a christmas tree need', 'christmas tree stand water', 'tree stem diameter water', 'christmas tree watering', 'how often to water christmas tree'],
  updated: '2026-11-28',
  inputs: [
    { id: 'diameter', label: 'Trunk (stem) diameter at the cut', type: 'number', default: 3, min: 0.5, max: 12, step: 0.25, suffix: 'in', info: 'Measure straight across the trunk at the fresh cut, in inches. Most home trees are 2 to 6 inches.' },
    { id: 'capacity', label: 'Stand water capacity', type: 'number', default: 6, min: 0.5, step: 0.5, suffix: 'qt', info: 'How much water the stand holds when full, in US quarts (4 quarts = 1 gallon). It is on the box or in the manual.' },
  ],
  outputs: [
    { id: 'quarts', label: 'Water per day', format: 'number', precision: 2, suffix: 'qt', primary: true, info: 'Rule of thumb: about 1 quart per inch of trunk diameter per day.' },
    { id: 'cups', label: 'Water per day (cups)', format: 'number', precision: 1, suffix: 'cups', info: 'Water per day in quarts, times 4 cups to the quart.' },
    { id: 'litres', label: 'Water per day (litres)', format: 'number', precision: 2, suffix: 'L', info: 'Water per day in quarts, times 0.9464 litres to the quart.' },
    { id: 'daysLast', label: 'A full stand lasts', format: 'number', precision: 1, suffix: 'days', info: 'Stand capacity ÷ water used per day.' },
    { id: 'refills', label: 'Full refills per week', format: 'number', precision: 1, info: 'Water used in a week (per day × 7) divided by the stand size.' },
  ],
  compute: (v) => {
    const d = num(v.diameter);
    const cap = num(v.capacity);
    if (d === null || cap === null || d <= 0 || cap <= 0) return { quarts: null };
    const quarts = d; // about 1 quart per inch of diameter per day
    const lasts = cap / quarts;
    const refills = (quarts * 7) / cap;
    const tight = lasts < 1;
    return {
      quarts,
      cups: quarts * 4,
      litres: quarts * LITRES_PER_QUART,
      daysLast: lasts,
      refills,
      tone: tight ? 'warn' : 'good',
      badge: tight ? 'Stand holds under a day' : `Top up every ${fmt(Math.floor(lasts * 10) / 10)} days or less`,
      note: tight
        ? `Your stand holds less than one day of water for this trunk. Check it at least twice a day, and never let it run dry.`
        : `A ${fmt(d, 2)} in trunk drinks about ${fmt(quarts, 2)} qt a day, so a ${fmt(cap)} qt stand lasts about ${fmt(lasts)} days. Check it daily and never let it run dry.`,
      chart: {
        type: 'bar' as const,
        title: 'Tree thirst vs stand size (quarts)',
        categories: ['Tree drinks per day', 'Stand holds'],
        series: [{ name: 'Quarts', values: [quarts, cap] }],
        format: { format: 'number' as const, suffix: 'qt' },
        highlight: 0,
      },
      steps: [
        `Water per day ≈ ${fmt(d, 2)} in × 1 qt per inch = ${fmt(quarts, 2)} qt`,
        `= ${fmt(quarts * 4, 1)} cups = ${fmt(quarts * LITRES_PER_QUART, 2)} L`,
        `A full stand lasts ${fmt(cap)} qt ÷ ${fmt(quarts, 2)} qt = ${fmt(lasts)} days`,
        `Refills per week = ${fmt(quarts, 2)} × 7 ÷ ${fmt(cap)} = ${fmt(refills)}`,
      ],
    };
  },
  content: {
    formula: [
      'Water per day (quarts) ≈ trunk diameter (inches) × 1',
      'Days a full stand lasts = stand capacity ÷ water per day',
      'Refills per week = water per day × 7 ÷ stand capacity',
    ],
    body: [
      'A cut tree keeps drinking for weeks, and the thicker the trunk, the more it drinks. Tree growers give a simple rule of thumb: about one quart of water per inch of trunk diameter per day. This calculator turns that into quarts, cups and litres, and tells you how often a stand of your size needs a refill.',
      'Example: a tree with a 3 inch trunk in a 6 quart stand drinks about 3 quarts a day. That is 12 cups, or 2.84 litres. A full stand lasts 6 ÷ 3 = 2 days, which is 3.5 full refills a week.',
      'Never let the stand go dry. If the water drops below the base of the trunk, sap can seal the cut and the tree may stop taking up water, even after you refill. Check the stand every day, and more often in the first few days, when a fresh tree drinks the most. Keep the tree away from heaters and vents, and use plain water.',
      'The rule is an average, not a measurement. Real use varies with the tree species, how fresh the cut is, and how warm and dry your room is. Use the number as a guide, then look at the stand. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much water does a Christmas tree need per day?', a: 'About one quart per inch of trunk diameter per day. This calculator uses exactly that, so a 3 inch trunk gives 3 quarts, or 12 cups, a day.' },
      { q: 'How do I measure the stem diameter?', a: 'Measure straight across the trunk at the fresh cut, in inches. If you only know the circumference, divide it by 3.14.' },
      { q: 'How long does a full stand last?', a: 'Stand capacity divided by daily water. A 6 quart stand with a 3 inch trunk lasts 6 ÷ 3 = 2 days. If the answer is under 1 day, check the stand more than once a day.' },
      { q: 'What happens if the stand runs dry?', a: 'The cut can seal over with sap and the tree may stop drinking, which dries it out faster and raises the fire risk. Refill before the water drops below the base of the trunk.' },
      { q: 'Does this work in litres?', a: 'Yes. The result is shown in quarts, cups and litres. Enter the stand size in US quarts (1 litre is about 1.06 quarts).' },
    ],
    sources: [
      { label: 'National Christmas Tree Association, tree care guidance (rule of thumb of about 1 quart of water per inch of trunk diameter per day)', url: 'https://realchristmastrees.org' },
    ],
  },
  related: ['christmas-tree-cost', 'tree-light-strands', 'holiday-lights', 'ice-melt-coverage'],
  examples: [
    // 3 in -> 3 qt; 12 cups; 3*0.946352946 = 2.839058838 L; 6/3 = 2 days; 3*7/6 = 3.5
    { values: { diameter: 3, capacity: 6 }, expect: { quarts: 3, cups: 12, litres: 2.839058838, daysLast: 2, refills: 3.5 } },
    // 6 in -> 6 qt; 4/6 = 0.6667 days; 6*7/4 = 10.5
    { values: { diameter: 6, capacity: 4 }, expect: { quarts: 6, cups: 24, daysLast: 0.6666666667, refills: 10.5 }, tolerance: 1e-6 },
  ],
});
