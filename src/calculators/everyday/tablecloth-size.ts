import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

// Comparison drops: 6, 12 and 15 in, or the usual metric equivalents 15, 30 and 38 cm.
const DROPS_IN = [6, 12, 15];
const DROPS_CM = [15, 30, 38];

export default defineCalculator({
  slug: 'tablecloth-size',
  title: 'Tablecloth Size Calculator',
  category: 'everyday',
  description: 'Find the right tablecloth size for a rectangle, oval or round table from its measurements and the drop you want. Shows sizes for 6, 12 and 15 inch drops.',
  keywords: ['tablecloth size calculator', 'what size tablecloth do i need', 'tablecloth drop', 'round tablecloth size', 'oval tablecloth size', 'tablecloth for 60 inch table'],
  updated: '2026-11-27',
  inputs: [
    { id: 'shape', label: 'Table shape', type: 'select', segmented: true, default: 'rect', options: [{ value: 'rect', label: 'Rectangle or oval' }, { value: 'round', label: 'Round' }], info: 'Rectangle and oval tables use length and width. Round tables use the diameter.' },
    { id: 'unit', label: 'Units', type: 'select', segmented: true, default: 'in', options: [{ value: 'in', label: 'Inches' }, { value: 'cm', label: 'Centimetres' }], info: 'Table size and drop use this unit.' },
    { id: 'l', label: 'Table length', type: 'number', default: 60, min: 0, step: 0.5, showWhen: { input: 'shape', is: 'rect' }, info: 'The long side of the tabletop, edge to edge. For an oval, the longest distance across.' },
    { id: 'w', label: 'Table width', type: 'number', default: 36, min: 0, step: 0.5, showWhen: { input: 'shape', is: 'rect' }, info: 'The short side of the tabletop, edge to edge. For an oval, the widest distance across.' },
    { id: 'd', label: 'Table diameter', type: 'number', default: 48, min: 0, step: 0.5, showWhen: { input: 'shape', is: 'round' }, info: 'The distance straight across the tabletop, through the centre.' },
    { id: 'drop', label: 'Drop per side', type: 'number', default: 10, min: 0, step: 0.5, help: 'How far the cloth hangs below the tabletop, in the unit above.', info: 'About 6 in (15 cm) is a short drop, 10 to 12 in (25 to 30 cm) is common, and 15 in (38 cm) or more reaches near a chair seat.' },
  ],
  outputs: [
    { id: 'clothL', label: 'Cloth length', format: 'number', precision: 1, primary: true, showWhen: { input: 'shape', is: 'rect' }, info: 'Table length plus a drop on each end. Same unit as your table.' },
    { id: 'clothW', label: 'Cloth width', format: 'number', precision: 1, showWhen: { input: 'shape', is: 'rect' }, info: 'Table width plus a drop on each side. Same unit as your table.' },
    { id: 'clothD', label: 'Cloth diameter', format: 'number', precision: 1, primary: true, showWhen: { input: 'shape', is: 'round' }, info: 'Table diameter plus a drop on each side. Same unit as your table.' },
    { id: 'size', label: 'Cloth size', format: 'text', info: 'The same size written out with units.' },
    { id: 'd1', label: 'With a small drop', format: 'text', info: 'Cloth size if you choose a 6 in (15 cm) drop.' },
    { id: 'd2', label: 'With a medium drop', format: 'text', info: 'Cloth size if you choose a 12 in (30 cm) drop.' },
    { id: 'd3', label: 'With a long drop', format: 'text', info: 'Cloth size if you choose a 15 in (38 cm) drop.' },
  ],
  compute: (v) => {
    const round = v.shape === 'round';
    const metric = v.unit === 'cm';
    const u = metric ? 'cm' : 'in';
    const drop = num(v.drop);
    const l = round ? num(v.d) : num(v.l);
    const w = round ? l : num(v.w);
    if (drop === null || l === null || w === null) return { clothL: null, clothD: null };
    if (l <= 0 || w <= 0) return { clothL: null, clothD: null, error: 'Enter table sizes above 0.' };
    if (drop < 0) return { clothL: null, clothD: null };
    const size = (dr: number) => (round ? `${fmt(l + 2 * dr)} ${u}` : `${fmt(l + 2 * dr)} × ${fmt(w + 2 * dr)} ${u}`);
    const drops = metric ? DROPS_CM : DROPS_IN;
    const clothL = l + 2 * drop;
    const clothW = w + 2 * drop;
    const mine = size(drop);
    const cats = [`${fmt(drop)} ${u} (yours)`, ...drops.map((x) => `${x} ${u}`)];
    const longest = (dr: number) => l + 2 * dr;
    return {
      clothL,
      clothW,
      clothD: clothL,
      size: mine,
      d1: size(drops[0]),
      d2: size(drops[1]),
      d3: size(drops[2]),
      tone: 'ok',
      badge: `${mine} cloth`,
      note: `Round up to the nearest size the store sells. Stores usually stock set sizes, and a cloth slightly larger just hangs a little lower. Measure the tabletop itself, not the legs or any leaf extensions you are not using.`,
      chart: {
        type: 'bar',
        title: round ? `Cloth diameter by drop (${u})` : `Cloth length by drop (${u})`,
        categories: cats,
        series: [{ name: round ? 'Diameter' : 'Length', values: [longest(drop), ...drops.map(longest)] }],
        highlight: 0,
      },
      steps: round
        ? [`Cloth diameter = table diameter + 2 × drop = ${fmt(l)} + 2 × ${fmt(drop)} = ${fmt(clothL)} ${u}`]
        : [
            `Cloth length = ${fmt(l)} + 2 × ${fmt(drop)} = ${fmt(clothL)} ${u}`,
            `Cloth width = ${fmt(w)} + 2 × ${fmt(drop)} = ${fmt(clothW)} ${u}`,
          ],
    };
  },
  content: {
    formula: [
      'Rectangle or oval cloth = (length + 2 × drop) × (width + 2 × drop)',
      'Round cloth diameter = table diameter + 2 × drop',
    ],
    body: [
      'The drop is how far the cloth hangs below the edge of the tabletop. Because it hangs on every side, add the drop twice to each measurement: once for each end or side.',
      'For a 60 × 36 inch table with a 10 inch drop, the cloth is 60 + 20 = 80 inches long and 36 + 20 = 56 inches wide, so 80 × 56 inches. For a 48 inch round table with a 10 inch drop, the cloth is 48 + 20 = 68 inches across.',
      'A 6 inch drop is short and tidy, 10 to 12 inches is the everyday choice, and 15 inches or more reaches toward a seated guest\'s lap. The calculator also shows the size for 6, 12 and 15 inch drops (15, 30 and 38 cm in centimetre mode) so you can compare.',
      'Shops sell cloths in set sizes, so round up to the nearest one available. An oval table uses the same maths as a rectangle: measure the longest and widest points, then buy an oval cloth of that size. For seating, see the party seating calculator. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What size tablecloth do I need for a 60 × 36 inch table?', a: 'With a 10 inch drop you need 80 × 56 inches. That is 60 + 2 × 10 by 36 + 2 × 10. Round up to the nearest size the store sells.' },
      { q: 'What size tablecloth fits a 48 inch round table?', a: 'With a 10 inch drop the cloth is 68 inches across (48 + 2 × 10). With a 15 inch drop it is 78 inches.' },
      { q: 'How long should the drop be?', a: 'About 6 inches (15 cm) is short, 10 to 12 inches (25 to 30 cm) is the common choice, and 15 inches (38 cm) or more is dressy. It is a style choice, so pick what you like.' },
      { q: 'How do I size a cloth for an oval table?', a: 'Use the rectangle formula with the table\'s longest length and widest width. A 60 × 36 inch oval with a 10 inch drop needs an 80 × 56 inch oval cloth.' },
      { q: 'What if my size is not sold?', a: 'Round up to the nearest size the store sells. A slightly larger cloth just hangs a bit lower.' },
    ],
    sources: [],
  },
  related: ['party-seating', 'event-cost-per-guest', 'wrapping-paper'],
  examples: [
    // rect: 60 + 2*10 = 80; 36 + 2*10 = 56
    { values: { shape: 'rect', unit: 'in', l: 60, w: 36, drop: 10 }, expect: { clothL: 80, clothW: 56 }, tolerance: 1e-9 },
    // round: 48 + 2*10 = 68
    { values: { shape: 'round', unit: 'in', d: 48, drop: 10 }, expect: { clothD: 68 }, tolerance: 1e-9 },
    // cm: 150 + 2*25 = 200; 90 + 2*25 = 140
    { values: { shape: 'rect', unit: 'cm', l: 150, w: 90, drop: 25 }, expect: { clothL: 200, clothW: 140 }, tolerance: 1e-9 },
  ],
});
