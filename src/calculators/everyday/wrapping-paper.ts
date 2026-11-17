import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'wrapping-paper',
  title: 'Wrapping Paper Calculator',
  category: 'everyday',
  description: 'Find out how much wrapping paper one box needs and how many rolls to buy for all your gifts, from the box size and the roll size.',
  keywords: ['wrapping paper calculator', 'how much wrapping paper do i need', 'wrapping paper size for box', 'gift wrap rolls needed', 'how many gifts per roll of wrapping paper'],
  inputs: [
    { id: 'unit', label: 'Units', type: 'select', segmented: true, default: 'in', options: [{ value: 'in', label: 'Inches / feet' }, { value: 'cm', label: 'cm / metres' }], info: 'Box and roll width use inches or cm. Roll length uses feet or metres.' },
    { id: 'l', label: 'Box length', type: 'number', default: 12, min: 0, step: 0.5, info: 'The longest side of the box.' },
    { id: 'w', label: 'Box width', type: 'number', default: 8, min: 0, step: 0.5, info: 'The second side of the box.' },
    { id: 'h', label: 'Box height', type: 'number', default: 4, min: 0, step: 0.5, info: 'How tall the box is.' },
    { id: 'overlap', label: 'Seam overlap', type: 'number', default: 1, min: 0, step: 0.5, help: 'Extra paper where the two edges meet.', info: 'About 1 inch (2.5 cm) is usual.' },
    { id: 'rw', label: 'Roll width', type: 'number', default: 30, min: 0, step: 1, info: 'Printed on the roll. Common rolls are 30 in (76 cm).' },
    { id: 'rl', label: 'Roll length (ft or m)', type: 'number', default: 15, min: 0, step: 1, info: 'Printed on the roll, in feet (or metres in metric mode).' },
    { id: 'n', label: 'Number of boxes', type: 'number', default: 1, min: 1, step: 1, info: 'How many gifts of this size you want to wrap.' },
  ],
  outputs: [
    { id: 'perRoll', label: 'Boxes per roll', format: 'number', precision: 0, primary: true, info: 'How many pieces of this size you can cut from one roll, using the better of the two ways to lay the box.' },
    { id: 'rolls', label: 'Rolls to buy', format: 'number', precision: 0, info: 'Boxes divided by boxes per roll, rounded up.' },
    { id: 'across', label: 'Paper piece, around the box', format: 'number', precision: 1, info: '2 × (width + height) + overlap.' },
    { id: 'along', label: 'Paper piece, along the box', format: 'number', precision: 1, info: 'Length + height.' },
    { id: 'area', label: 'Paper per box (sq in or sq cm)', format: 'number', precision: 0, info: 'Across times along.' },
  ],
  compute: (v) => {
    const l = num(v.l), w = num(v.w), h = num(v.h), o = num(v.overlap), rw = num(v.rw), rl = num(v.rl), n = num(v.n);
    if ([l, w, h, o, rw, rl, n].some((x) => x === null)) return { perRoll: null };
    if (l! <= 0 || w! <= 0 || h! <= 0 || o! < 0 || rw! <= 0 || rl! <= 0 || n! < 1) return { perRoll: null };
    const rollLen = rl! * (v.unit === 'cm' ? 100 : 12);
    const across = 2 * (w! + h!) + o!;
    const along = l! + h!;
    // Option 1: roll width covers the "along" side, pieces cut every "across" along the roll.
    // Option 2: roll width covers the "across" side, pieces cut every "along".
    const opt1 = rw! >= along ? Math.floor(rollLen / across) : 0;
    const opt2 = rw! >= across ? Math.floor(rollLen / along) : 0;
    const perRoll = Math.max(opt1, opt2);
    if (perRoll < 1) return { perRoll: null };
    const rolls = Math.ceil(n! / perRoll);
    const area = across * along;
    return {
      perRoll,
      rolls,
      across,
      along,
      area,
      chart: {
        type: 'bar',
        title: 'Boxes per roll by way of laying the box',
        categories: ['Roll width covers wrap-around side', 'Roll width covers length side'],
        series: [{ name: 'Boxes per roll', values: [opt2, opt1] }],
        format: { format: 'number', precision: 0 },
        highlight: opt2 >= opt1 ? 0 : 1,
      },
      steps: [
        `Around = 2 × (${w} + ${h}) + ${o} = ${+across.toFixed(1)}`,
        `Along = ${l} + ${h} = ${+along.toFixed(1)}`,
        `Boxes per roll = ${perRoll}; rolls = ⌈${n} ÷ ${perRoll}⌉ = ${rolls}`,
      ],
    };
  },
  content: {
    formula: ['Around the box = 2 × (width + height) + overlap', 'Along the box = length + height', 'Boxes per roll = roll length ÷ the side you cut along, rounded down'],
    body: [
      'A common rule of thumb for wrapping a box is to cut a piece that wraps once around the box with a little overlap, and is long enough to fold over both ends. This calculator uses 2 × (width + height) + overlap for the wrap-around side, and length + height for the other side. It is a guide, not a standard, so add a little extra for thick or oddly shaped gifts.',
      'For a 12 × 8 × 4 inch box with a 1 inch overlap, the piece is 25 × 16 inches, which is 400 square inches. A roll 30 inches wide and 15 feet (180 inches) long can fit the 25 inch side across the width, so you cut a 16 inch piece each time: 180 ÷ 16 = 11 boxes.',
      'The calculator tries both ways of laying the box on the roll and picks the one that gives more boxes. If the roll is too narrow for either, it shows no result.',
    ],
    faq: [
      { q: 'How much wrapping paper do I need for a 12 × 8 × 4 inch box?', a: 'About 25 × 16 inches (400 square inches) with a 1 inch overlap.' },
      { q: 'How many boxes can I wrap with one roll?', a: 'It depends on the roll. A 30 inch by 15 foot roll covers about 11 boxes of 12 × 8 × 4 inches.' },
      { q: 'Does it work for odd shapes?', a: 'Not well. It assumes a rectangular box. For odd shapes, measure the smallest box that fits the gift and add extra paper.' },
    ],
  },
  related: ['gift-budget', 'unit-price', 'holiday-lights'],
  examples: [
    { values: { unit: 'in', l: 12, w: 8, h: 4, overlap: 1, rw: 30, rl: 15, n: 1 }, expect: { perRoll: 11, rolls: 1, across: 25, along: 16, area: 400 }, tolerance: 1e-9 },
    { values: { unit: 'in', l: 12, w: 8, h: 4, overlap: 1, rw: 30, rl: 15, n: 25 }, expect: { perRoll: 11, rolls: 3 }, tolerance: 1e-9 },
  ],
});
