import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => n.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: d });

const TYPES = [
  { value: 'active', label: 'Active dry yeast' },
  { value: 'instant', label: 'Instant (rapid-rise) yeast' },
  { value: 'fresh', label: 'Fresh (cake) yeast' },
];

export default defineCalculator({
  slug: 'yeast-converter',
  title: 'Yeast Converter: Active Dry, Instant, Fresh',
  category: 'food',
  description: 'Swap active dry, instant and fresh yeast in a recipe. Enter the amount you have and get the other two, using ratios you can edit.',
  keywords: ['yeast converter', 'active dry to instant yeast', 'fresh yeast to dry yeast conversion', 'instant yeast substitute', 'cake yeast to active dry'],
  updated: '2026-11-27',
  inputs: [
    { id: 'type', label: 'Yeast in the recipe', type: 'select', default: 'active', options: TYPES, info: 'The type of yeast your recipe calls for.' },
    { id: 'amount', label: 'Amount in the recipe (g)', type: 'number', default: 7, min: 0, step: 0.5, info: 'Weight in grams. A scale is more reliable than spoons for yeast.' },
    { id: 'instantRatio', label: 'Instant per 1 g active dry (rule of thumb)', type: 'number', default: 0.75, min: 0.1, max: 3, step: 0.05, info: 'A common rule of thumb is about three quarters as much instant as active dry. Brands differ, so edit it if your packet says otherwise.' },
    { id: 'freshRatio', label: 'Fresh per 1 g active dry (rule of thumb)', type: 'number', default: 3, min: 0.5, max: 6, step: 0.25, info: 'A common rule of thumb is about three times as much fresh as active dry. Edit it to match your recipe or packet.' },
  ],
  outputs: [
    { id: 'active', label: 'Active dry yeast (g)', format: 'number', precision: 1, primary: true, info: 'Amount of active dry yeast that does the same job.' },
    { id: 'instant', label: 'Instant yeast (g)', format: 'number', precision: 1, info: 'Amount of instant yeast that does the same job.' },
    { id: 'fresh', label: 'Fresh yeast (g)', format: 'number', precision: 1, info: 'Amount of fresh yeast that does the same job.' },
  ],
  compute: (v) => {
    const type = String(v.type ?? 'active');
    const amount = num(v.amount);
    const iR = num(v.instantRatio);
    const fR = num(v.freshRatio);
    if (amount === null || iR === null || fR === null || amount < 0 || iR <= 0 || fR <= 0) return { active: null };
    // Express everything relative to active dry.
    const weight = type === 'instant' ? iR : type === 'fresh' ? fR : 1;
    const active = amount / weight;
    const instant = active * iR;
    const fresh = active * fR;
    const label = TYPES.find((t) => t.value === type)?.label.toLowerCase() ?? 'yeast';
    return {
      active,
      instant,
      fresh,
      tone: 'ok' as const,
      badge: `${fmt(amount)} g ${label}`,
      note: `${fmt(amount)} g of ${label} equals ${fmt(active)} g active dry, ${fmt(instant)} g instant or ${fmt(fresh)} g fresh, using the ratios you set. These are rules of thumb, so rising times can vary a little.`,
      chart: {
        type: 'bar',
        title: 'Same rise, three yeasts (g)',
        categories: ['Active dry', 'Instant', 'Fresh'],
        format: { format: 'number', precision: 1 },
        series: [{ name: 'Grams', values: [active, instant, fresh] }],
      },
      steps: [
        `Active dry equivalent = ${fmt(amount, 2)} ÷ ${fmt(weight, 2)} = ${fmt(active, 2)} g`,
        `Instant = ${fmt(active, 2)} × ${fmt(iR, 2)} = ${fmt(instant, 2)} g`,
        `Fresh = ${fmt(active, 2)} × ${fmt(fR, 2)} = ${fmt(fresh, 2)} g`,
      ],
    };
  },
  content: {
    formula: [
      'Active dry equivalent = amount ÷ ratio of the type you have (1 for active dry)',
      'Instant = active dry × instant ratio (default 0.75)',
      'Fresh = active dry × fresh ratio (default 3)',
    ],
    body: [
      'Recipes call for different kinds of yeast, and the one in your cupboard is often not the one on the page. Active dry, instant and fresh yeast all do the same job, but a gram of each is not equally strong, so swapping them one for one can give a slow or over-fast rise.',
      'Pick the yeast the recipe uses, enter the weight, and the calculator shows the matching amount of the other two. The defaults are common rules of thumb: about three quarters as much instant as active dry, and about three times as much fresh. Packets and bakers differ a little, so both ratios are editable.',
      'Fresh yeast is usually crumbled into the dough or dissolved in warm liquid, active dry is often proofed first, and instant can go straight into the flour. Follow your recipe for the method. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How much instant yeast replaces 7 g of active dry?', a: 'With the default 0.75 ratio, 7 × 0.75 = 5.25 g of instant yeast.' },
      { q: 'How much fresh yeast replaces 7 g of active dry?', a: 'With the default ratio of 3, 7 × 3 = 21 g of fresh yeast.' },
      { q: 'How do I swap instant for active dry?', a: 'Divide by the instant ratio. With the default 0.75, 5 g of instant is 5 ÷ 0.75 = 6.67 g of active dry.' },
      { q: 'Are these ratios exact?', a: 'No. They are common rules of thumb, and brands and recipes differ. Edit the ratios if your packet or recipe gives different numbers.' },
      { q: 'Does the dough need more or less time?', a: 'It can. A swap that is slightly off changes the rise time, so judge the dough by how it looks and feels rather than the clock.' },
    ],
    sources: [],
  },
  related: ['bakers-percentage', 'sourdough-starter', 'cooking-converter', 'recipe-scaler'],
  examples: [
    // 7 g active dry: instant 7 x 0.75 = 5.25; fresh 7 x 3 = 21
    { values: { type: 'active', amount: 7, instantRatio: 0.75, freshRatio: 3 }, expect: { active: 7, instant: 5.25, fresh: 21 }, tolerance: 1e-9 },
    // 5 g instant: active 5 / 0.75 = 6.6667; fresh 6.6667 x 3 = 20
    { values: { type: 'instant', amount: 5, instantRatio: 0.75, freshRatio: 3 }, expect: { active: 5 / 0.75, instant: 5, fresh: 20 }, tolerance: 1e-9 },
    // 21 g fresh: active 7; instant 5.25
    { values: { type: 'fresh', amount: 21, instantRatio: 0.75, freshRatio: 3 }, expect: { active: 7, instant: 5.25, fresh: 21 }, tolerance: 1e-9 },
  ],
});
