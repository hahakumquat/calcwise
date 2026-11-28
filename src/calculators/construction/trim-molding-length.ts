import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'trim-molding-length',
  title: 'Baseboard and Crown Molding Calculator',
  category: 'construction',
  description: 'Work out how many linear feet and how many pieces of baseboard or crown molding to buy for a rectangular room, after doors, openings and waste.',
  keywords: ['baseboard calculator', 'crown molding calculator', 'trim molding length', 'how much baseboard do i need', 'linear feet of trim', 'molding pieces needed'],
  inputs: [
    { id: 'length', label: 'Room length', type: 'number', suffix: 'ft', default: 14, min: 0, step: 0.1, info: 'One side of the room, in feet. The calculator assumes a plain rectangle.' },
    { id: 'width', label: 'Room width', type: 'number', suffix: 'ft', default: 12, min: 0, step: 0.1, info: 'The other side of the room, in feet.' },
    { id: 'trim', label: 'Trim type', type: 'select', default: 'baseboard', options: [{ value: 'baseboard', label: 'Baseboard' }, { value: 'crown', label: 'Crown molding' }, { value: 'both', label: 'Both' }], info: 'Baseboard skips door openings. Crown runs the full distance around the room.' },
    { id: 'doors', label: 'Number of doors', type: 'number', default: 2, min: 0, step: 1, info: 'Doorways where baseboard is not needed. Count each opening once.' },
    { id: 'doorWidth', label: 'Door width', type: 'number', suffix: 'ft', default: 3, min: 0, step: 0.1, info: 'Width of one doorway including the frame. 3 ft is a common size.' },
    { id: 'openings', label: 'Other openings to skip', type: 'number', suffix: 'ft', default: 0, min: 0, step: 0.1, info: 'Total width of closet openings, built-ins or archways with no baseboard. Use 0 if none.' },
    { id: 'waste', label: 'Waste allowance', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, info: 'Extra length for miter cuts and mistakes. 10 percent is a common allowance.' },
    { id: 'pieceLength', label: 'Piece length', type: 'number', suffix: 'ft', default: 8, min: 0, step: 0.5, info: 'Length of one stick of trim at the store. 8 ft is common; 12 ft and 16 ft also exist.' },
  ],
  outputs: [
    { id: 'pieces', label: 'Pieces to buy', format: 'integer', primary: true, info: 'Length with waste divided by piece length, rounded up, for each trim type you picked.' },
    { id: 'basePieces', label: 'Baseboard pieces', format: 'integer', showWhen: { input: 'trim', is: ['baseboard', 'both'] }, info: 'Baseboard length with waste divided by piece length, rounded up.' },
    { id: 'baseLength', label: 'Baseboard length (ft)', format: 'number', precision: 2, showWhen: { input: 'trim', is: ['baseboard', 'both'] }, info: 'Distance around the room minus doors and other openings.' },
    { id: 'baseWaste', label: 'Baseboard with waste (ft)', format: 'number', precision: 2, showWhen: { input: 'trim', is: ['baseboard', 'both'] }, info: 'Baseboard length times one plus the waste allowance.' },
    { id: 'crownPieces', label: 'Crown pieces', format: 'integer', showWhen: { input: 'trim', is: ['crown', 'both'] }, info: 'Crown length with waste divided by piece length, rounded up.' },
    { id: 'crownLength', label: 'Crown length (ft)', format: 'number', precision: 2, showWhen: { input: 'trim', is: ['crown', 'both'] }, info: 'Crown runs the full distance around the room, so doors are not taken off.' },
    { id: 'crownWaste', label: 'Crown with waste (ft)', format: 'number', precision: 2, showWhen: { input: 'trim', is: ['crown', 'both'] }, info: 'Crown length times one plus the waste allowance.' },
    { id: 'corners', label: 'Inside corners', format: 'integer', info: 'A plain rectangle has 4 inside corners. Cut each as a miter or a cope.' },
  ],
  compute: (v) => {
    const L = num(v.length);
    const W = num(v.width);
    const doors = num(v.doors) ?? 0;
    const doorW = num(v.doorWidth) ?? 0;
    const other = num(v.openings) ?? 0;
    const waste = num(v.waste) ?? 0;
    const piece = num(v.pieceLength);
    const trim = String(v.trim);
    if (L === null || W === null || piece === null) return { pieces: null };
    if (L <= 0 || W <= 0 || piece <= 0 || doors < 0 || doorW < 0 || other < 0 || waste < 0) return { pieces: null };
    if (!['baseboard', 'crown', 'both'].includes(trim)) return { pieces: null };
    const perimeter = 2 * (L + W);
    const skip = Math.round(doors) * doorW + other;
    if (skip >= perimeter) return { pieces: null, error: 'The doors and openings are as long as the walls, so there is no trim to run.' };
    const factor = 1 + waste / 100;
    const wantBase = trim !== 'crown';
    const wantCrown = trim !== 'baseboard';
    const baseLength = perimeter - skip;
    const baseWaste = baseLength * factor;
    const basePieces = ceilSafe(baseWaste / piece);
    const crownLength = perimeter;
    const crownWaste = crownLength * factor;
    const crownPieces = ceilSafe(crownWaste / piece);
    const pieces = (wantBase ? basePieces : 0) + (wantCrown ? crownPieces : 0);
    const categories: string[] = [];
    const values: number[] = [];
    if (wantBase) { categories.push('Baseboard'); values.push(+baseWaste.toFixed(2)); }
    if (wantCrown) { categories.push('Crown'); values.push(+crownWaste.toFixed(2)); }
    const steps = [`Distance around the room = 2 × (${L} + ${W}) = ${+perimeter.toFixed(2)} ft`];
    if (wantBase) {
      steps.push(`Baseboard = ${+perimeter.toFixed(2)} − ${+skip.toFixed(2)} ft of openings = ${+baseLength.toFixed(2)} ft`);
      steps.push(`With ${waste}% waste = ${+baseWaste.toFixed(2)} ft, ÷ ${piece} ft = ${+(baseWaste / piece).toFixed(2)}, so ${basePieces} pieces`);
    }
    if (wantCrown) {
      steps.push(`Crown = ${+crownLength.toFixed(2)} ft, with ${waste}% waste = ${+crownWaste.toFixed(2)} ft, ÷ ${piece} ft = ${+(crownWaste / piece).toFixed(2)}, so ${crownPieces} pieces`);
    }
    return {
      pieces,
      basePieces,
      baseLength: +baseLength.toFixed(2),
      baseWaste: +baseWaste.toFixed(2),
      crownPieces,
      crownLength: +crownLength.toFixed(2),
      crownWaste: +crownWaste.toFixed(2),
      corners: 4,
      chart: {
        type: 'bar',
        title: 'Trim to buy, with waste (ft)',
        categories,
        series: [{ name: 'Length with waste', values }],
        format: { format: 'number', suffix: ' ft' },
      },
      tone: 'ok',
      badge: `${pieces} ${pieces === 1 ? 'piece' : 'pieces'}`,
      note: 'Long walls need joined pieces, so the waste allowance matters. Buy one spare piece for mistakes.',
      steps,
    };
  },
  content: {
    formula: [
      'Distance around the room = 2 × (length + width)',
      'Baseboard length = distance around the room − door widths − other openings',
      'Crown length = distance around the room',
      'Pieces = ceil(length × (1 + waste % ÷ 100) ÷ piece length)',
    ],
    body: [
      'Trim is bought by the piece but planned by the foot. Measure the distance around the room, take off anything that will not get baseboard, such as doorways, then add a waste allowance and divide by the length of one stick. Round up, because you cannot buy part of a piece.',
      'Crown molding sits at the ceiling and runs across the top of doorways, so it uses the full distance around the room. Baseboard stops at each door, so it is shorter. A plain rectangle has 4 inside corners, and each one is cut as a miter or a cope.',
      'Long walls often need two pieces joined, and joins waste offcuts, so do not set the waste allowance to zero. Buy one spare piece for mistakes and check the real lengths at the store. This is an estimate for a rectangular room only.',
    ],
    faq: [
      { q: 'How much baseboard does a 14 ft by 12 ft room need?', a: 'The room is 52 ft around. With two 3 ft doors, baseboard is 46 ft. Adding 10 percent waste gives 50.6 ft, and 50.6 ÷ 8 ft is 6.33, so you need 7 pieces of 8 ft.' },
      { q: 'How much crown molding does the same room need?', a: 'Crown runs the full 52 ft because doors are not taken off. With 10 percent waste that is 57.2 ft, and 57.2 ÷ 8 ft is 7.15, so you need 8 pieces of 8 ft.' },
      { q: 'How much waste should I allow?', a: '10 percent is a common starting point. Use a little more for crown molding or rooms with many corners, because miters use up offcuts.' },
      { q: 'How many inside corners are there?', a: 'A plain rectangular room has 4 inside corners. This calculator does not handle bump-outs or L-shaped rooms, so add the extra corners yourself.' },
      { q: 'Should I buy a spare piece?', a: 'Yes. A spare piece covers a bad cut, and trim from a later batch may not match in colour or profile.' },
    ],
    sources: [],
  },
  related: ['square-footage', 'wallpaper-rolls'],
  examples: [
    // perimeter 2*(14+12)=52; base 52-6=46; *1.1=50.6; /8=6.325 -> 7; crown 52*1.1=57.2; /8=7.15 -> 8; total 15
    { values: { length: 14, width: 12, trim: 'both', doors: 2, doorWidth: 3, openings: 0, waste: 10, pieceLength: 8 }, expect: { pieces: 15, basePieces: 7, baseLength: 46, baseWaste: 50.6, crownPieces: 8, crownLength: 52, crownWaste: 57.2, corners: 4 }, tolerance: 1e-6 },
    // baseboard only: 7 pieces
    { values: { length: 14, width: 12, trim: 'baseboard', doors: 2, doorWidth: 3, openings: 0, waste: 10, pieceLength: 8 }, expect: { pieces: 7, baseLength: 46 }, tolerance: 1e-6 },
    // 10x10 crown, 12 ft sticks, 0% waste: 40 ft / 12 = 3.33 -> 4
    { values: { length: 10, width: 10, trim: 'crown', doors: 0, doorWidth: 3, openings: 0, waste: 0, pieceLength: 12 }, expect: { pieces: 4, crownLength: 40, crownWaste: 40 }, tolerance: 1e-6 },
  ],
});
