import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

const LB_PER_PERSON: Record<string, number> = { bone: 0.5, boneless: 0.33, spiral: 0.5 };
const LEFTOVER: Record<string, number> = { none: 0, some: 0.25, lots: 0.5 };

export default defineCalculator({
  slug: 'holiday-ham-size',
  title: 'Holiday Ham Size Calculator',
  category: 'food',
  description: 'How big a ham to buy for Christmas or Easter. Enter guests, ham type and how many leftovers you want to get the pounds to buy, using common portion rules.',
  keywords: ['how big a ham do i need', 'ham per person', 'how much ham per person', 'ham size for guests', 'easter ham size', 'bone-in vs boneless ham'],
  updated: '2026-11-28',
  inputs: [
    { id: 'guests', label: 'Guests', type: 'number', default: 10, min: 1, step: 1, info: 'Total number of people eating, children included.' },
    { id: 'type', label: 'Ham type', type: 'select', default: 'bone', options: [
      { value: 'bone', label: 'Bone-in (0.5 lb each)' },
      { value: 'boneless', label: 'Boneless (0.33 lb each)' },
      { value: 'spiral', label: 'Spiral-cut (0.5 lb each)' },
    ], info: 'Bone-in and spiral-cut hams are sold with bone, so plan for more weight per person. Boneless is nearly all meat.' },
    { id: 'leftovers', label: 'Leftovers wanted', type: 'select', default: 'some', segmented: true, options: [
      { value: 'none', label: 'None' },
      { value: 'some', label: 'Some (+25%)' },
      { value: 'lots', label: 'Lots (+50%)' },
    ], info: 'Extra ham on top of the serving amount, for sandwiches and soup.' },
  ],
  outputs: [
    { id: 'pounds', label: 'Ham to buy', precision: 2, suffix: 'lb', primary: true, info: 'Guests × pounds per person × (1 + leftover share).' },
    { id: 'perPerson', label: 'Pounds per person', precision: 2, suffix: 'lb', info: 'Serving amount for this ham type, before leftovers.' },
    { id: 'servingLb', label: 'Ham for serving only', precision: 2, suffix: 'lb', info: 'Guests × pounds per person, with no leftovers.' },
    { id: 'leftoverLb', label: 'Extra for leftovers', precision: 2, suffix: 'lb', info: 'Serving pounds × leftover share.' },
  ],
  compute: (v) => {
    const g = num(v.guests);
    const pp = LB_PER_PERSON[String(v.type)];
    const lo = LEFTOVER[String(v.leftovers)];
    if (g === null || g < 1 || pp === undefined || lo === undefined) return { pounds: null };
    const servingLb = g * pp;
    const pounds = servingLb * (1 + lo);
    const leftoverLb = pounds - servingLb;
    return {
      pounds,
      perPerson: pp,
      servingLb,
      leftoverLb,
      tone: 'ok',
      badge: 'Rule of thumb',
      note: `Buy about ${fmt(pounds, 1)} lb of ham. Portions are rules of thumb, so follow the package for cooking time and safe temperature.`,
      chart: {
        type: 'donut' as const,
        title: 'Where the ham goes (lb)',
        slices: [
          { label: 'Serving', value: servingLb },
          { label: 'Leftovers', value: leftoverLb },
        ].filter((x) => x.value > 0),
        format: { format: 'number' as const, precision: 2 },
        centerLabel: 'lb total',
        centerValue: fmt(pounds, 1),
      },
      steps: [
        `Serving: ${fmt(g, 0)} guests × ${fmt(pp)} lb = ${fmt(servingLb)} lb`,
        `With leftovers: ${fmt(servingLb)} lb × (1 + ${fmt(lo)}) = ${fmt(pounds)} lb`,
      ],
    };
  },
  content: {
    formula: [
      'Ham to buy = guests × pounds per person × (1 + leftover share)',
      'Pounds per person: bone-in 0.5, boneless 0.33, spiral-cut 0.5',
      'Leftover share: none 0, some 0.25, lots 0.5',
    ],
    body: [
      'Ham is sold by weight, and the bone changes how much of that weight you can eat. The usual guidance is about 1/2 lb per person for bone-in ham and about 1/3 lb per person for boneless ham, which is the amount extension services and food safety agencies commonly quote for a single meal.',
      'Spiral-cut hams still have a bone, so this calculator treats them like bone-in. If you want sandwiches and soup afterwards, add a leftover share on top: 25 percent for some, 50 percent for plenty.',
      'These are assumptions, not standards. A big appetite, a short menu or many children will move the numbers. Check the package for the cooking time and the safe internal temperature. For the rest of the meal, see the turkey size, roast cooking time and dinner timeline calculators. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How big a ham for 10 guests?', a: 'A bone-in ham with some leftovers is 10 × 0.5 × 1.25 = 6.25 lb. With no leftovers it is 5 lb.' },
      { q: 'How much boneless ham for 12 guests?', a: 'At 0.33 lb per person and no leftovers, 12 guests need 3.96 lb, so a 4 lb boneless ham.' },
      { q: 'Why does bone-in need more?', a: 'The bone and some fat weigh a lot but are not eaten, so you buy more weight per person than for boneless ham.' },
      { q: 'Does this give cooking time?', a: 'No. Follow the package label for heating time and safe temperature.' },
    ],
    sources: [
      { label: 'USDA FSIS: Ham and Food Safety', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/meat/ham-and-food-safety' },
    ],
  },
  related: ['turkey-size', 'roast-cooking-time', 'dinner-timeline'],
  examples: [
    // 10 * 0.5 = 5; * 1.25 = 6.25; leftover = 1.25
    { values: { guests: 10, type: 'bone', leftovers: 'some' }, expect: { pounds: 6.25, servingLb: 5, leftoverLb: 1.25, perPerson: 0.5 }, tolerance: 1e-9 },
    // 12 * 0.33 = 3.96
    { values: { guests: 12, type: 'boneless', leftovers: 'none' }, expect: { pounds: 3.96, leftoverLb: 0 }, tolerance: 1e-9 },
  ],
});
