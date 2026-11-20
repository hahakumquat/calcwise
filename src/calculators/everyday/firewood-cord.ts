import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const CUBIC_FEET_PER_CORD = 128;

export default defineCalculator({
  slug: 'firewood-cord',
  title: 'Firewood Cord Calculator',
  category: 'everyday',
  description: 'Work out how much of a cord your firewood stack is, and what it should cost, from stack length, height, log length and the price per full cord.',
  keywords: ['firewood cord calculator', 'face cord to cord', 'how much is a cord of wood', 'cord of firewood cost', 'firewood stack size', 'face cord'],
  inputs: [
    { id: 'length', label: 'Stack length', type: 'number', suffix: 'ft', default: 8, min: 0, step: 0.5, info: 'How long the stack runs along the ground, in feet.' },
    { id: 'height', label: 'Stack height', type: 'number', suffix: 'ft', default: 4, min: 0, step: 0.5, info: 'How tall the stack is, in feet.' },
    { id: 'depth', label: 'Log length (stack depth)', type: 'number', suffix: 'in', default: 16, min: 0, step: 1, info: 'The length of each log, which is how deep the stack is. Common lengths are 12, 16 and 24 inches; a full 4 ft cord uses 48-inch logs.' },
    { id: 'price', label: 'Price per full cord', type: 'number', prefix: '$', default: 300, min: 0, step: 5, info: 'The price quoted for a full 128 cubic foot cord. Prices vary a lot by region and wood type.' },
  ],
  outputs: [
    { id: 'cords', label: 'Share of a full cord', precision: 3, suffix: 'cord', primary: true, info: 'Stack volume ÷ 128 cubic feet.' },
    { id: 'cubicFeet', label: 'Stack volume', precision: 1, suffix: 'cu ft', info: 'Length × height × log length (in feet).' },
    { id: 'stackCost', label: 'Fair price for this stack', format: 'currency', info: 'Share of a cord × price per full cord.' },
    { id: 'perCord', label: 'Stacks like this in a full cord', precision: 2, info: '128 ÷ stack volume.' },
  ],
  compute: (v) => {
    const l = num(v.length);
    const h = num(v.height);
    const d = num(v.depth);
    const p = num(v.price);
    if (l === null || h === null || d === null || p === null) return { cords: null };
    if (l <= 0 || h <= 0 || d <= 0 || p < 0) return { cords: null };
    const cubicFeet = l * h * (d / 12);
    const cords = cubicFeet / CUBIC_FEET_PER_CORD;
    const stackCost = cords * p;
    const perCord = CUBIC_FEET_PER_CORD / cubicFeet;
    return {
      tone: 'ok',
      badge: `${cubicFeet.toFixed(1)} cu ft is ${cords.toFixed(3)} of a cord`,
      cords,
      cubicFeet,
      stackCost,
      perCord,
      chart: {
        type: 'bar',
        title: 'Your stack vs a full cord (cubic feet)',
        categories: ['Your stack', 'Full cord'],
        series: [{ name: 'Volume', values: [cubicFeet, CUBIC_FEET_PER_CORD] }],
        format: { format: 'integer', suffix: ' cu ft' },
      },
      steps: [
        `Volume = ${l} ft × ${h} ft × (${d} ÷ 12) ft = ${cubicFeet.toFixed(2)} cu ft`,
        `Share of a cord = ${cubicFeet.toFixed(2)} ÷ 128 = ${cords.toFixed(4)}`,
        `Fair price = ${cords.toFixed(4)} × $${p} = $${stackCost.toFixed(2)}`,
      ],
    };
  },
  content: {
    formula: ['Stack volume (cu ft) = length (ft) × height (ft) × log length (in) ÷ 12', 'Share of a cord = volume ÷ 128', 'Fair price = share of a cord × price per full cord'],
    body: [
      'A full cord of firewood is a tightly stacked pile 4 feet high, 4 feet wide and 8 feet long: 128 cubic feet. The US Forest Service uses this definition for firewood permits, and state weights and measures offices treat the cord, or a stated fraction of one, as the legal way to sell firewood.',
      'The confusing part is the "face cord" (also called a rick or rack). It is a stack 4 feet high and 8 feet long, but only as deep as one log, so its size depends on log length. With 16-inch logs it is 8 × 4 × 1.333 = 42.7 cubic feet, one third of a cord. With 24-inch logs it is half a cord. Always ask the seller for the log length, or measure the stack yourself.',
      'Enter your stack\'s length, height and log length to see its volume, what share of a cord it is, and what it should cost at your local full-cord price. The volume assumes the wood is stacked neatly with the pieces parallel; a loose or tossed pile holds less wood than the same space neatly stacked.',
    ],
    faq: [
      { q: 'How big is a cord of firewood?', a: 'A full cord is 128 cubic feet, a stack 4 ft high × 4 ft wide × 8 ft long, with the wood neatly stacked.' },
      { q: 'How much of a cord is a face cord?', a: 'It depends on the log length. A stack 8 ft long and 4 ft high with 16-inch logs is 42.7 cubic feet, one third of a cord. With 12-inch logs it is a quarter, and with 24-inch logs it is half.' },
      { q: 'How much should a face cord cost?', a: 'Take your local price for a full cord and multiply by the share of a cord. At $300 a cord, a 16-inch face cord (one third) should cost about $100.' },
      { q: 'Why does this calculator not include BTU or wood type?', a: 'Heat per cord varies with species and dryness, and this tool measures volume only. To compare heating cost with other fuels, use the space heater vs furnace calculator.' },
    ],
    sources: [
      { label: 'US Forest Service: Firewood permits (standard cord is 128 cubic feet, 4 × 4 × 8 ft)', url: 'https://www.fs.usda.gov/r06/mthood/permits/firewood' },
      { label: 'Washington State Dept. of Agriculture: Firewood sales and measurement', url: 'https://agr.wa.gov/Services/Inspections-and-Investigations/Inspections/Weights-and-Measures/Firewood' },
      { label: 'Maine Forest Service: Firewood facts (face cord and fitted cord)', url: 'https://www1.maine.gov/DACF/mfs/projects/woodheatmaine/downloads/firewoodfacts2.pdf' },
    ],
  },
  related: ['heating-cost', 'electricity-cost', 'volume-converter'],
  examples: [
    // 8 x 4 x (16/12) = 42.6667 cu ft; /128 = 1/3 cord; $300/3 = $100; 128/42.6667 = 3 stacks.
    { values: { length: 8, height: 4, depth: 16, price: 300 }, tolerance: 1e-4, expect: { cubicFeet: 42.6667, cords: 0.333333, stackCost: 100, perCord: 3 } },
    // 8 x 4 x 2 = 64 cu ft = half a cord; $150.
    { values: { length: 8, height: 4, depth: 24, price: 300 }, tolerance: 1e-4, expect: { cubicFeet: 64, cords: 0.5, stackCost: 150, perCord: 2 } },
    // 8 x 4 x 4 = 128 cu ft = 1 cord.
    { values: { length: 8, height: 4, depth: 48, price: 250 }, tolerance: 1e-4, expect: { cubicFeet: 128, cords: 1, stackCost: 250 } },
  ],
});
