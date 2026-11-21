import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'sourdough-starter',
  title: 'Sourdough Starter Feeding Calculator',
  category: 'food',
  description: 'Enter how much starter you want and a feeding ratio like 1:2:2 to get the grams of starter to keep, flour and water. Free, in your browser.',
  keywords: ['sourdough starter feeding calculator', 'starter feeding ratio', '1:2:2 starter', '1:5:5 starter', 'how much to feed sourdough starter', 'sourdough discard calculator'],
  updated: '2026-11-21',
  inputs: [
    { id: 'target', label: 'Starter wanted after feeding (g)', type: 'number', default: 200, min: 1, max: 5000, step: 10, info: 'The total weight of starter in the jar once it has been fed.' },
    { id: 'a', label: 'Ratio: starter', type: 'number', default: 1, min: 0.1, max: 100, step: 1, info: 'First number of the ratio, the starter part. In 1:2:2 this is 1.' },
    { id: 'b', label: 'Ratio: flour', type: 'number', default: 2, min: 0, max: 100, step: 1, info: 'Second number of the ratio, the flour part. In 1:2:2 this is 2.' },
    { id: 'c', label: 'Ratio: water', type: 'number', default: 2, min: 0, max: 100, step: 1, info: 'Third number of the ratio, the water part. In 1:2:2 this is 2.' },
    { id: 'onHand', label: 'Starter you have now (g)', type: 'number', default: 0, min: 0, max: 5000, step: 10, help: 'Optional. Leave at 0 to skip discard.', info: 'If you enter your current starter weight, the calculator shows how much would be left over to discard after keeping the amount needed.' },
  ],
  outputs: [
    { id: 'total', label: 'Total starter after feeding (g)', format: 'number', precision: 1, primary: true, info: 'Starter kept + flour + water. This is the amount you asked for.' },
    { id: 'keep', label: 'Starter to keep (g)', format: 'number', precision: 1, info: 'Target × starter part ÷ (starter + flour + water parts).' },
    { id: 'flour', label: 'Flour (g)', format: 'number', precision: 1, info: 'Target × flour part ÷ sum of parts.' },
    { id: 'water', label: 'Water (g)', format: 'number', precision: 1, info: 'Target × water part ÷ sum of parts.' },
    { id: 'hydration', label: 'Hydration of the feed', format: 'percent', precision: 0, info: 'Water part ÷ flour part. The kept starter is not counted.' },
    { id: 'discard', label: 'Starter to discard (g)', format: 'number', precision: 1, info: 'Starter you have now minus the starter to keep, never below zero. Shown only when you enter your current starter.' },
  ],
  compute: (v) => {
    const target = num(v.target);
    const a = num(v.a);
    const b = num(v.b);
    const c = num(v.c);
    const onHand = num(v.onHand) ?? 0;
    if (target === null || a === null || b === null || c === null || target <= 0 || a <= 0 || b < 0 || c < 0 || onHand < 0) return { total: null };
    const parts = a + b + c;
    const keep = (target * a) / parts;
    const flour = (target * b) / parts;
    const water = (target * c) / parts;
    const out: Record<string, unknown> = {
      total: keep + flour + water,
      keep,
      flour,
      water,
      chart: {
        type: 'bar',
        title: 'Grams to combine',
        categories: ['Starter', 'Flour', 'Water'],
        format: { format: 'number', precision: 1 },
        series: [{ name: 'Grams', values: [keep, flour, water] }],
      },
    };
    if (b > 0) out.hydration = c / b;
    const steps = [
      `Parts: ${fmt(a, 1)} + ${fmt(b, 1)} + ${fmt(c, 1)} = ${fmt(parts, 1)}`,
      `Starter: ${fmt(target, 1)} × ${fmt(a, 1)} ÷ ${fmt(parts, 1)} = ${fmt(keep, 1)} g`,
      `Flour: ${fmt(target, 1)} × ${fmt(b, 1)} ÷ ${fmt(parts, 1)} = ${fmt(flour, 1)} g`,
      `Water: ${fmt(target, 1)} × ${fmt(c, 1)} ÷ ${fmt(parts, 1)} = ${fmt(water, 1)} g`,
    ];
    let note = `Keep ${fmt(keep, 1)} g of starter, add ${fmt(flour, 1)} g flour and ${fmt(water, 1)} g water for ${fmt(target, 1)} g in total.`;
    let tone: 'good' | 'ok' = 'good';
    let badge = 'Ready to mix';
    if (onHand > 0) {
      const discard = Math.max(0, onHand - keep);
      out.discard = discard;
      steps.push(`Discard: ${fmt(onHand, 1)} − ${fmt(keep, 1)} = ${fmt(discard, 1)} g`);
      if (onHand < keep) {
        tone = 'ok';
        badge = 'Not enough starter';
        note = `You have ${fmt(onHand, 1)} g but this ratio needs ${fmt(keep, 1)} g to keep. Lower the target or use a smaller starter part.`;
      }
    }
    return { ...out, steps, tone, badge, note };
  },
  content: {
    formula: [
      'Parts = starter part + flour part + water part',
      'Each ingredient = target weight × its part ÷ parts',
      'Discard = starter on hand − starter to keep (not below 0)',
    ],
    body: [
      'A feeding ratio such as 1:2:2 means 1 part starter, 2 parts flour and 2 parts water, by weight. Add the parts together, then split the amount of starter you want into that many equal shares. For 200 g at 1:2:2 there are 5 parts of 40 g each, so you keep 40 g of starter and add 80 g of flour and 80 g of water.',
      'Enter the total weight you want after feeding and the three numbers of your ratio. The calculator gives grams of starter to keep, flour and water. Weigh everything in grams on a kitchen scale, since cups and spoons vary.',
      'If you type in how much starter you have now, it also shows how much is left over once you have set aside the amount to keep. That is simple subtraction. Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'Reading a ratio',
        paragraphs: [
          'The first number is always the starter, so the ratio tells you how much new flour and water go in for each part kept. Equal flour and water parts, as in 1:2:2 or 1:10:10, make the feed 100% hydration (water ÷ flour = 1). A ratio like 1:2:3 has more water than flour, so 150 g of it splits into 25 g, 50 g and 75 g. Use whichever ratio your own recipe calls for.',
        ],
      },
    ],
    faq: [
      { q: 'How do I calculate a 1:2:2 feeding for 200 g?', a: 'The parts add up to 1 + 2 + 2 = 5, so each part is 200 ÷ 5 = 40 g. Keep 40 g of starter and add 80 g of flour and 80 g of water.' },
      { q: 'What does 1:10:10 give for 210 g?', a: 'The parts add up to 21, so each is 210 ÷ 21 = 10 g. That is 10 g of starter, 100 g of flour and 100 g of water.' },
      { q: 'What if the flour and water parts differ, like 1:2:3 for 150 g?', a: 'The parts add up to 6, so each is 25 g. That is 25 g of starter, 50 g of flour and 75 g of water, a feed with 150% water to flour.' },
      { q: 'How much starter is discarded?', a: 'It is what you have minus what you keep. With 100 g on hand and 10 g kept (the 210 g, 1:10:10 case), that is 90 g.' },
    ],
  },
  related: ['bakers-percentage', 'recipe-scaler', 'cooking-converter', 'coffee-ratio'],
  examples: [
    // parts 5; each 200/5 = 40 -> 40 / 80 / 80; hydration 2/2 = 1
    { values: { target: 200, a: 1, b: 2, c: 2, onHand: 0 }, expect: { total: 200, keep: 40, flour: 80, water: 80, hydration: 1 }, tolerance: 1e-9 },
    // parts 6; each 150/6 = 25 -> 25 / 50 / 75; hydration 3/2 = 1.5
    { values: { target: 150, a: 1, b: 2, c: 3, onHand: 0 }, expect: { total: 150, keep: 25, flour: 50, water: 75, hydration: 1.5 }, tolerance: 1e-9 },
    // parts 21; each 210/21 = 10 -> 10 / 100 / 100; discard 100 - 10 = 90
    { values: { target: 210, a: 1, b: 10, c: 10, onHand: 100 }, expect: { total: 210, keep: 10, flour: 100, water: 100, hydration: 1, discard: 90 }, tolerance: 1e-9 },
  ],
});
