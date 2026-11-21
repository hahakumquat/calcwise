import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number) => +n.toFixed(2);

export default defineCalculator({
  slug: 'cookie-exchange',
  title: 'Cookie Exchange Calculator: Batches and Trays',
  category: 'food',
  description: 'Plan a cookie swap: how many cookies you need, how many dough batches to bake, how many baking sheets, and the butter and flour for the whole run.',
  keywords: ['cookie exchange calculator', 'cookie swap planner', 'how many cookies per person', 'cookie batches calculator', 'holiday baking planner', 'how many dozen cookies'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'guests', label: 'People taking cookies home', type: 'number', default: 12, min: 1, step: 1, info: 'Everyone who leaves with a box, including you.' },
    { id: 'dozens', label: 'Dozens each person takes home', type: 'number', suffix: 'dozen', default: 2, min: 0.25, step: 0.25, info: 'A dozen is 12 cookies. Two dozen is a common swap amount.' },
    { id: 'perBatch', label: 'Cookies one batch of dough makes', type: 'number', default: 36, min: 1, step: 1, info: 'The yield printed on your recipe.' },
    { id: 'perSheet', label: 'Cookies per baking sheet', type: 'number', default: 12, min: 1, step: 1, info: 'How many fit on one sheet. A baking sheet is used once per round of baking.' },
    { id: 'butter', label: 'Butter per batch', type: 'number', suffix: 'cups', default: 1, min: 0, step: 0.25, optional: true, info: 'From your recipe. Leave 0 to skip.' },
    { id: 'flour', label: 'Flour per batch', type: 'number', suffix: 'cups', default: 2.25, min: 0, step: 0.25, optional: true, info: 'From your recipe. Leave 0 to skip.' },
  ],
  outputs: [
    { id: 'batches', label: 'Batches of dough to make', format: 'integer', primary: true, info: 'Total cookies needed ÷ cookies per batch, rounded up.' },
    { id: 'total', label: 'Cookies needed', format: 'integer', info: 'People × dozens × 12.' },
    { id: 'baked', label: 'Cookies you will bake', format: 'integer', info: 'Batches × cookies per batch. The extras are for tasting.' },
    { id: 'sheets', label: 'Baking sheet loads', format: 'integer', info: 'Cookies baked ÷ cookies per sheet, rounded up.' },
    { id: 'butterTotal', label: 'Butter in total (cups)', format: 'number', info: 'Batches × butter per batch.' },
    { id: 'flourTotal', label: 'Flour in total (cups)', format: 'number', info: 'Batches × flour per batch.' },
  ],
  compute: (v) => {
    const guests = num(v.guests);
    const dozens = num(v.dozens);
    const perBatch = num(v.perBatch);
    const perSheet = num(v.perSheet);
    const butter = num(v.butter) ?? 0;
    const flour = num(v.flour) ?? 0;
    if (guests === null || dozens === null || perBatch === null || perSheet === null) return { batches: null };
    if (guests < 1 || dozens <= 0 || perBatch < 1 || perSheet < 1 || butter < 0 || flour < 0) return { batches: null };

    const total = Math.round(guests * dozens * 12);
    const batches = Math.ceil(total / perBatch);
    const baked = batches * perBatch;
    const sheets = Math.ceil(baked / perSheet);
    const butterTotal = batches * butter;
    const flourTotal = batches * flour;

    return {
      batches,
      total,
      baked,
      sheets,
      butterTotal,
      flourTotal,
      tone: 'good',
      badge: `${batches} batch${batches === 1 ? '' : 'es'}`,
      chart: {
        type: 'bar',
        title: 'Cookies needed vs baked',
        categories: ['Needed', 'Baked'],
        series: [{ name: 'Cookies', values: [total, baked] }],
        format: { format: 'integer' },
      },
      steps: [
        `Cookies needed = ${guests} × ${dozens} dozen × 12 = ${total}`,
        `Batches = ${total} ÷ ${perBatch} = ${fmt(total / perBatch)}, rounded up to ${batches}`,
        `Cookies baked = ${batches} × ${perBatch} = ${baked} (${baked - total} extra)`,
        `Baking sheet loads = ${baked} ÷ ${perSheet} = ${fmt(baked / perSheet)}, rounded up to ${sheets}`,
        ...(butter > 0 ? [`Butter = ${batches} × ${butter} = ${fmt(butterTotal)} cups`] : []),
        ...(flour > 0 ? [`Flour = ${batches} × ${flour} = ${fmt(flourTotal)} cups`] : []),
      ],
      note: `Whole batches mean ${baked - total} extra cookies, so there is room for a few that break or get eaten. Ingredient totals use the per-batch amounts you entered; add the rest of your recipe, such as sugar and eggs, with the recipe scaler.`,
    };
  },
  content: {
    formula: [
      'Cookies needed = people × dozens each × 12',
      'Batches = cookies needed ÷ cookies per batch, rounded up',
      'Baking sheet loads = (batches × cookies per batch) ÷ cookies per sheet, rounded up',
      'Ingredient total = batches × amount per batch',
    ],
    body: [
      'At a cookie exchange everyone bakes one kind and trades so each person goes home with a mix. If you are hosting, or baking for a swap, the math is mostly about rounding: you cannot make 7.5 batches of dough.',
      'Enter how many people take cookies home, how many dozen each gets, and the yield of your recipe. The calculator rounds up to whole batches, tells you how many cookies that really makes, and how many baking sheet loads you will bake.',
      'Add the butter and flour per batch from your recipe to get shopping totals. For a full ingredient list at a different size, use the recipe scaler, and for planning the rest of the party, the party food quantity calculator.',
    ],
    sections: [],
    faq: [
      { q: 'How many cookies for 12 people at 2 dozen each?', a: '12 × 2 × 12 = 288 cookies. With a 36-cookie recipe that is exactly 8 batches.' },
      { q: 'How much butter and flour for those 8 batches?', a: 'With 1 cup of butter and 2.25 cups of flour per batch, you need 8 cups of butter and 18 cups of flour.' },
      { q: 'Why does the calculator round up batches?', a: 'Dough comes in whole batches. 180 cookies from a 48-cookie recipe is 3.75 batches, so you make 4 and bake 192 cookies.' },
      { q: 'How many cookies fit on a baking sheet?', a: 'It depends on cookie size, so it is an input. Twelve is typical for medium drop cookies.' },
      { q: 'How many cookies per person is normal?', a: 'Two dozen is a common swap amount, but you can set any number of dozens, including quarter dozens.' },
    ],
    sources: [
      { label: 'USDA FoodKeeper: cookie storage times', url: 'https://www.foodsafety.gov/keep-food-safe/foodkeeper-app' },
    ],
  },
  related: ['recipe-scaler', 'party-food-quantity', 'cooking-converter', 'baking-pan-converter', 'dinner-timeline'],
  examples: [
    {
      // 12 × 2 × 12 = 288; 288/36 = 8 batches; baked 288; sheets 288/12 = 24; butter 8; flour 8 × 2.25 = 18.
      values: { guests: 12, dozens: 2, perBatch: 36, perSheet: 12, butter: 1, flour: 2.25 },
      expect: { batches: 8, total: 288, baked: 288, sheets: 24, butterTotal: 8, flourTotal: 18 },
      tolerance: 0.001,
    },
    {
      // 10 × 1.5 × 12 = 180; 180/48 = 3.75 -> 4 batches; baked 192; sheets 192/15 = 12.8 -> 13; butter 4; flour 9.
      values: { guests: 10, dozens: 1.5, perBatch: 48, perSheet: 15, butter: 1, flour: 2.25 },
      expect: { batches: 4, total: 180, baked: 192, sheets: 13, butterTotal: 4, flourTotal: 9 },
      tolerance: 0.001,
    },
  ],
});
