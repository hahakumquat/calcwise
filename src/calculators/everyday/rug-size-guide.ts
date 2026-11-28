import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

/** Common US rug sizes in feet, shorter side first. */
const STANDARD: [number, number][] = [[5, 8], [6, 9], [8, 10], [9, 12], [10, 14], [12, 15]];
const EPS = 1e-9;

export default defineCalculator({
  slug: 'rug-size-guide',
  title: 'Area Rug Size Calculator',
  category: 'everyday',
  description: 'Find the right area rug size for a room from its size and border, or for a dining table from its size and chair pull-out, and the nearest standard size.',
  keywords: ['rug size calculator', 'what size rug do i need', 'area rug size guide', 'dining room rug size', 'rug size for living room', 'standard rug sizes'],
  updated: '2026-11-28',
  inputs: [
    { id: 'mode', label: 'Rug for', type: 'select', segmented: true, default: 'room', options: [{ value: 'room', label: 'A room' }, { value: 'dining', label: 'A dining table' }], info: 'Room: a rug that leaves a bare floor border all round. Dining: a rug big enough for chairs to stay on it when pulled out.' },
    { id: 'length', label: 'Room length', type: 'number', default: 15, min: 0, step: 0.5, suffix: 'ft', showWhen: { input: 'mode', is: 'room' }, info: 'One side of the room in feet. Measure wall to wall.' },
    { id: 'width', label: 'Room width', type: 'number', default: 12, min: 0, step: 0.5, suffix: 'ft', showWhen: { input: 'mode', is: 'room' }, info: 'The other side of the room in feet.' },
    { id: 'border', label: 'Bare floor border', type: 'number', default: 18, min: 12, max: 24, step: 1, suffix: 'in', showWhen: { input: 'mode', is: 'room' }, info: 'Floor left showing between the rug and each wall. Decorators often suggest 12 to 24 inches; 18 is a common middle.' },
    { id: 'tableLength', label: 'Table length', type: 'number', default: 72, min: 0, step: 1, suffix: 'in', showWhen: { input: 'mode', is: 'dining' }, info: 'Long side of the table, in inches.' },
    { id: 'tableWidth', label: 'Table width', type: 'number', default: 36, min: 0, step: 1, suffix: 'in', showWhen: { input: 'mode', is: 'dining' }, info: 'Short side of the table, in inches.' },
    { id: 'pullout', label: 'Chair pull-out', type: 'number', default: 24, min: 0, step: 1, suffix: 'in', showWhen: { input: 'mode', is: 'dining' }, info: 'How far a chair slides back when someone sits down. 24 inches on each side is a common allowance.' },
  ],
  outputs: [
    { id: 'rug', label: 'Rug size', format: 'text', primary: true, info: 'Room: the floor left after the border on every side. Dining: the table plus the pull-out on every side. Shown as shorter side by longer side, in feet.' },
    { id: 'shortFt', label: 'Shorter side', format: 'number', precision: 2, suffix: 'ft', info: 'The shorter side of the rug size above, in feet.' },
    { id: 'longFt', label: 'Longer side', format: 'number', precision: 2, suffix: 'ft', info: 'The longer side of the rug size above, in feet.' },
    { id: 'standard', label: 'Nearest standard size', format: 'text', info: 'Room: the largest common size that fits inside the space. Dining: the smallest common size that covers the table and pull-out. Sizes checked: 5x8, 6x9, 8x10, 9x12, 10x14, 12x15 ft.' },
  ],
  compute: (v) => {
    const mode = String(v.mode);
    let shortFt: number;
    let longFt: number;
    let standard: [number, number] | null = null;
    const steps: string[] = [];
    if (mode === 'dining') {
      const tl = num(v.tableLength);
      const tw = num(v.tableWidth);
      const p = num(v.pullout);
      if (tl === null || tw === null || p === null || tl <= 0 || tw <= 0 || p < 0) return { rug: null };
      const a = tl + 2 * p;
      const b = tw + 2 * p;
      shortFt = Math.min(a, b) / 12;
      longFt = Math.max(a, b) / 12;
      standard = STANDARD.find(([s, l]) => s >= shortFt - EPS && l >= longFt - EPS) ?? null;
      steps.push(`Rug = table + 2 × pull-out: ${fmt(tl)} + ${fmt(2 * p)} = ${fmt(a)} in by ${fmt(tw)} + ${fmt(2 * p)} = ${fmt(b)} in`);
      steps.push(`= ${fmt(shortFt, 2)} ft by ${fmt(longFt, 2)} ft`);
      steps.push(standard ? `Smallest standard size that covers it: ${standard[0]}x${standard[1]} ft` : 'No standard size up to 12x15 ft covers it, so look at custom sizes');
    } else {
      const L = num(v.length);
      const W = num(v.width);
      const bd = num(v.border);
      if (L === null || W === null || bd === null || L <= 0 || W <= 0 || bd < 0) return { rug: null };
      const a = L - (2 * bd) / 12;
      const b = W - (2 * bd) / 12;
      if (a <= 0 || b <= 0) return { rug: null, error: 'The border leaves no room for a rug. Use a smaller border or a bigger room.' };
      shortFt = Math.min(a, b);
      longFt = Math.max(a, b);
      const fits = STANDARD.filter(([s, l]) => s <= shortFt + EPS && l <= longFt + EPS);
      standard = fits.length ? fits[fits.length - 1] : null;
      steps.push(`Rug = room − 2 × border: ${fmt(L)} − ${fmt((2 * bd) / 12, 2)} = ${fmt(a, 2)} ft by ${fmt(W)} − ${fmt((2 * bd) / 12, 2)} = ${fmt(b, 2)} ft`);
      steps.push(standard ? `Largest standard size that fits: ${standard[0]}x${standard[1]} ft` : 'The space is smaller than the smallest standard size (5x8 ft)');
    }
    const rug = `${fmt(shortFt, 2)} × ${fmt(longFt, 2)} ft`;
    const std = standard ? `${standard[0]}x${standard[1]} ft` : mode === 'dining' ? 'Larger than 12x15 ft' : 'Smaller than 5x8 ft';
    return {
      rug,
      shortFt,
      longFt,
      standard: std,
      tone: standard ? 'good' : 'warn',
      badge: standard ? `Go for ${std}` : mode === 'dining' ? 'Needs a custom size' : 'Smaller than standard',
      note: mode === 'dining'
        ? `Chairs stay on the rug when pulled out. Standard rugs are a guide, so check the real size of the rug you like.`
        : `A bare border of the width you chose keeps the room looking framed. Whether furniture legs sit on the rug is a style call.`,
      chart: {
        type: 'bar' as const,
        title: 'Calculated rug vs nearest standard size (ft)',
        categories: ['Shorter side', 'Longer side'],
        series: [
          { name: 'Calculated', values: [+shortFt.toFixed(2), +longFt.toFixed(2)] },
          ...(standard ? [{ name: 'Standard', values: [standard[0], standard[1]] }] : []),
        ],
        format: { format: 'number' as const, suffix: 'ft' },
      },
      steps,
    };
  },
  content: {
    formula: [
      'Room rug = (length − 2 × border ÷ 12) × (width − 2 × border ÷ 12), in feet',
      'Dining rug = table size + 2 × chair pull-out, in inches',
      'Room: largest standard size that fits. Dining: smallest standard size that covers.',
    ],
    body: [
      'Picking a rug is mostly a measuring problem. For a room, leave a strip of bare floor all round so the rug looks framed. For a dining table, make the rug big enough that the chairs stay on it when people pull them out. This calculator does the arithmetic for both, then names a common ready-made size.',
      'Example: a 12 by 15 foot room with an 18 inch border leaves 12 − 3 = 9 feet by 15 − 3 = 12 feet, so a 9x12 rug. A 10 by 12 foot room with a 24 inch border leaves 6 by 8 feet, so the largest standard size that fits is 5x8 (6x9 would need 9 feet and only 8 are free). A 72 by 36 inch table with 24 inches of pull-out needs 120 by 84 inches, which is 10 by 7 feet, so the smallest standard size that covers it is 8x10.',
      'These are decorator rules of thumb, not standards. A 12 to 24 inch border and about 24 inches of chair pull-out are common suggestions, and the exact look is a taste call. Whether the front legs of a sofa sit on the rug or all legs sit off it is up to you. The sizes listed (5x8, 6x9, 8x10, 9x12, 10x14, 12x15 feet) are common in US stores, but makers also sell other sizes and runners. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What size rug do I need for a 12 by 15 foot room?', a: 'With an 18 inch border the rug is 9 by 12 feet, which is a standard 9x12. A smaller border gives a bigger rug and a larger border a smaller one.' },
      { q: 'How big should a rug be under a dining table?', a: 'Take the table size and add the chair pull-out on every side. For a 72 by 36 inch table with 24 inches of pull-out that is 120 by 84 inches, or 10 by 7 feet. The smallest standard size that covers it is 8x10.' },
      { q: 'How much floor should show around the rug?', a: 'Many decorators suggest 12 to 24 inches. This calculator uses 18 inches by default and lets you change it. It is a rule of thumb, not a rule.' },
      { q: 'Why does the dining result round up and the room result round down?', a: 'A dining rug has to cover the chairs, so it must be at least as big as the space needed. A room rug has to fit inside the border, so it must be no bigger than the space available.' },
      { q: 'What if no standard size fits?', a: 'For a room, the space is under 5x8 feet, so look at smaller rugs or runners. For a dining table the need is over 12x15 feet, so look at custom sizes.' },
    ],
    sources: [
      { label: 'Rug border and chair pull-out figures are common decorator rules of thumb, not published standards. Standard sizes are typical US retail sizes, which vary by maker.' },
    ],
  },
  related: ['flooring', 'tile', 'square-footage', 'wallpaper-rolls'],
  examples: [
    // 12 - 18*2/12 = 9; 15 - 3 = 12 -> 9 x 12; standard 9x12 fits exactly
    { values: { mode: 'room', length: 12, width: 15, border: 18 }, expect: { rug: '9 × 12 ft', shortFt: 9, longFt: 12, standard: '9x12 ft' } },
    // 10 - 4 = 6; 12 - 4 = 8 -> 6 x 8; 5x8 fits (6x9 needs 9 ft > 8)
    { values: { mode: 'room', length: 10, width: 12, border: 24 }, expect: { rug: '6 × 8 ft', shortFt: 6, longFt: 8, standard: '5x8 ft' } },
    // 72 + 48 = 120 in = 10 ft; 36 + 48 = 84 in = 7 ft; smallest covering: 8x10
    { values: { mode: 'dining', tableLength: 72, tableWidth: 36, pullout: 24 }, expect: { rug: '7 × 10 ft', shortFt: 7, longFt: 10, standard: '8x10 ft' } },
  ],
});
