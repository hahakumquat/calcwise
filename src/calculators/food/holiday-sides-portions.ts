import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const APPETITE: Record<string, number> = { light: 0.75, normal: 1, big: 1.25 };
const TBSP_PER_CUP = 16;

export default defineCalculator({
  slug: 'holiday-sides-portions',
  title: 'Holiday Side Dish Portions Calculator',
  category: 'food',
  description: 'How much mashed potatoes, vegetables, stuffing, gravy and cranberry sauce to make for Thanksgiving or Christmas dinner, from guests and appetite.',
  keywords: ['how many potatoes per person', 'thanksgiving side dish portions', 'how much stuffing per person', 'how much gravy per person', 'holiday side dishes quantity'],
  updated: '2026-11-28',
  inputs: [
    { id: 'guests', label: 'Guests', type: 'number', default: 10, min: 1, step: 1, info: 'Total number of people eating, children included.' },
    { id: 'appetite', label: 'Appetite', type: 'select', default: 'normal', segmented: true, options: [
      { value: 'light', label: 'Light (×0.75)' },
      { value: 'normal', label: 'Normal (×1)' },
      { value: 'big', label: 'Big (×1.25)' },
    ], info: 'Scales every dish. Pick light if you serve many sides, big if there are few or you want leftovers.' },
  ],
  outputs: [
    { id: 'potatoes', label: 'Potatoes (raw)', precision: 2, suffix: 'lb', primary: true, info: 'Guests × 0.5 lb × appetite.' },
    { id: 'vegetables', label: 'Vegetables', precision: 2, suffix: 'lb', info: 'Guests × 0.25 lb × appetite.' },
    { id: 'stuffing', label: 'Stuffing', precision: 2, suffix: 'cups', info: 'Guests × 0.75 cup × appetite.' },
    { id: 'gravy', label: 'Gravy', precision: 2, suffix: 'cups', info: 'Guests × 0.25 cup × appetite.' },
    { id: 'cranberryTbsp', label: 'Cranberry sauce', precision: 1, suffix: 'tbsp', info: 'Guests × 2 tbsp × appetite.' },
    { id: 'cranberryCups', label: 'Cranberry sauce in cups', precision: 2, suffix: 'cups', info: 'Tablespoons ÷ 16.' },
  ],
  compute: (v) => {
    const g = num(v.guests);
    const m = APPETITE[String(v.appetite)];
    if (g === null || g < 1 || m === undefined) return { potatoes: null };
    const f = g * m;
    const potatoes = f * 0.5, vegetables = f * 0.25, stuffing = f * 0.75, gravy = f * 0.25, cranberryTbsp = f * 2;
    return {
      potatoes, vegetables, stuffing, gravy, cranberryTbsp,
      cranberryCups: cranberryTbsp / TBSP_PER_CUP,
      tone: 'ok',
      badge: 'Rule of thumb',
      note: 'Portions are rules of thumb. The more side dishes you serve, the smaller the portion of each one.',
      chart: {
        type: 'bar',
        title: 'Cups of prepared side dishes',
        categories: ['Stuffing', 'Gravy', 'Cranberry sauce'],
        series: [{ name: 'Cups', values: [stuffing, gravy, cranberryTbsp / TBSP_PER_CUP] }],
        format: { format: 'number', precision: 2, suffix: ' cups' },
      },
      steps: [
        `Serving factor: ${fmt(g, 0)} guests × ${m} = ${fmt(f)}`,
        `Potatoes: ${fmt(f)} × 0.5 lb = ${fmt(potatoes)} lb`,
        `Vegetables: ${fmt(f)} × 0.25 lb = ${fmt(vegetables)} lb`,
        `Stuffing: ${fmt(f)} × 0.75 cup = ${fmt(stuffing)} cups`,
        `Gravy: ${fmt(f)} × 0.25 cup = ${fmt(gravy)} cups`,
        `Cranberry: ${fmt(f)} × 2 tbsp = ${fmt(cranberryTbsp)} tbsp = ${fmt(cranberryTbsp / TBSP_PER_CUP)} cups`,
      ],
    };
  },
  content: {
    formula: [
      'Serving factor = guests × appetite multiplier (0.75, 1 or 1.25)',
      'Potatoes = factor × 0.5 lb raw; vegetables = factor × 0.25 lb',
      'Stuffing = factor × 0.75 cup; gravy = factor × 0.25 cup; cranberry sauce = factor × 2 tbsp',
    ],
    body: [
      'Side dishes are often most of the plate. The planning amounts here are common holiday-cooking rules of thumb: about 1/2 lb of raw potatoes, 1/4 lb of vegetables, 3/4 cup of stuffing, 1/4 cup of gravy and 2 tablespoons of cranberry sauce per guest. They are assumptions for a normal appetite, not official figures.',
      'The appetite setting scales all five dishes together. The more side dishes on your table, the smaller each portion needs to be, so drop to light for a big spread. Raw vegetable weight is before peeling and trimming. For the bird and the timing see the turkey size and dinner timeline calculators. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How many potatoes for 10 guests?', a: 'At a normal appetite that is 10 × 0.5 = 5 lb of raw potatoes, with 2.5 lb of vegetables.' },
      { q: 'How much stuffing and gravy for 10?', a: '7.5 cups of stuffing and 2.5 cups of gravy at a normal appetite.' },
      { q: 'How much cranberry sauce for 10?', a: '20 tablespoons, which is 1.25 cups.' },
      { q: 'What if I serve lots of sides?', a: 'Choose the light appetite, which cuts every dish to 75 percent.' },
    ],
    sources: [
      { label: 'USDA FSIS: Let\'s Talk Turkey (holiday meal planning and food safety)', url: 'https://www.fsis.usda.gov/food-safety/safe-food-handling-and-preparation/poultry/lets-talk-turkey' },
    ],
  },
  related: ['turkey-size', 'dinner-timeline'],
  examples: [
    // 10 normal: 5 lb, 2.5 lb, 7.5 cups, 2.5 cups, 20 tbsp = 1.25 cups
    { values: { guests: 10, appetite: 'normal' }, expect: { potatoes: 5, vegetables: 2.5, stuffing: 7.5, gravy: 2.5, cranberryTbsp: 20, cranberryCups: 1.25 }, tolerance: 1e-9 },
    // 8 light: factor 6 -> 3, 1.5, 4.5, 1.5, 12 tbsp
    { values: { guests: 8, appetite: 'light' }, expect: { potatoes: 3, vegetables: 1.5, stuffing: 4.5, gravy: 1.5, cranberryTbsp: 12 }, tolerance: 1e-9 },
  ],
});
