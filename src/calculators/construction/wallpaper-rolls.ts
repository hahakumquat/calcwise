import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'wallpaper-rolls',
  title: 'Wallpaper Rolls Calculator',
  category: 'construction',
  description: 'Work out how many rolls of wallpaper to buy from your room size, wall height, roll size, pattern repeat and any doors or windows.',
  keywords: ['wallpaper calculator', 'how many rolls of wallpaper', 'wallpaper rolls needed', 'wallpaper pattern repeat', 'wallpaper strips', 'wallpaper estimator'],
  inputs: [
    { id: 'length', label: 'Room length', type: 'number', suffix: 'ft', default: 12, min: 0, step: 0.1, info: 'One side of the room, in feet. The calculator papers all four walls.' },
    { id: 'width', label: 'Room width', type: 'number', suffix: 'ft', default: 10, min: 0, step: 0.1, info: 'The other side of the room, in feet.' },
    { id: 'height', label: 'Wall height', type: 'number', suffix: 'ft', default: 8, min: 0, step: 0.1, info: 'Floor to ceiling, in feet.' },
    { id: 'rollWidth', label: 'Roll width', type: 'number', suffix: 'in', default: 20.5, min: 0, step: 0.1, info: 'Printed on the roll label. 20.5 in is a common width.' },
    { id: 'rollLength', label: 'Roll length', type: 'number', suffix: 'ft', default: 33, min: 0, step: 1, info: 'Usable length of one roll, printed on the label. Many rolls are about 33 ft.' },
    { id: 'repeat', label: 'Pattern repeat', type: 'number', suffix: 'in', default: 0, min: 0, step: 0.5, info: 'The vertical distance before the pattern repeats, from the label. Use 0 for a plain or random-match paper.' },
    { id: 'openings', label: 'Doors and windows (total width)', type: 'number', suffix: 'ft', default: 0, min: 0, step: 0.1, info: 'Add up the widths of doorways and windows. This is taken off the distance around the room.' },
    { id: 'waste', label: 'Extra allowance', type: 'number', suffix: '%', default: 0, min: 0, max: 100, info: 'Optional extra strips for mistakes and awkward corners. 0 means none.' },
  ],
  outputs: [
    { id: 'rolls', label: 'Rolls to buy', format: 'integer', primary: true, info: 'Strips needed divided by strips you can cut from one roll, rounded up.' },
    { id: 'strips', label: 'Strips (drops) needed', format: 'integer', info: 'Distance around the room, less openings, divided by roll width, rounded up.' },
    { id: 'dropsPerRoll', label: 'Strips per roll', format: 'integer', info: 'Roll length divided by strip length (wall height plus pattern repeat), rounded down.' },
    { id: 'area', label: 'Wallpaper you will buy (sq ft)', format: 'number', info: 'Rolls times roll width times roll length. It includes the offcuts you cannot use.' },
  ],
  compute: (v) => {
    const L = num(v.length);
    const W = num(v.width);
    const H = num(v.height);
    const rw = num(v.rollWidth);
    const rl = num(v.rollLength);
    const repeat = num(v.repeat) ?? 0;
    const openings = num(v.openings) ?? 0;
    const waste = num(v.waste) ?? 0;
    if (L === null || W === null || H === null || rw === null || rl === null) return { rolls: null };
    if (L <= 0 || W <= 0 || H <= 0 || rw <= 0 || rl <= 0 || repeat < 0 || openings < 0 || waste < 0) return { rolls: null };
    const perimeter = 2 * (L + W);
    const net = perimeter - openings;
    if (net <= 0) return { rolls: null, error: 'The doors and windows are as wide as the walls, so there is nothing to paper.' };
    const strips = ceilSafe(((net * 12) / rw) * (1 + waste / 100));
    const dropLen = H * 12 + repeat;
    const dropsPerRoll = Math.floor((rl * 12) / dropLen + 1e-9);
    if (dropsPerRoll < 1) return { rolls: null, error: 'One roll is too short to cut a single strip. Check the roll length, wall height and pattern repeat.' };
    const rolls = ceilSafe(strips / dropsPerRoll);
    const area = +((rolls * rw * rl) / 12).toFixed(1);
    return {
      chart: {
        type: 'donut',
        title: 'Strips and rolls',
        slices: [
          { label: 'Strips needed', value: strips },
          { label: 'Spare strips in the rolls', value: rolls * dropsPerRoll - strips },
        ],
        centerValue: String(rolls),
        centerLabel: rolls === 1 ? 'roll' : 'rolls',
      },
      rolls,
      strips,
      dropsPerRoll,
      area,
      tone: 'ok',
      badge: `${rolls} ${rolls === 1 ? 'roll' : 'rolls'}`,
      note: 'Check the roll label, and buy one spare roll from the same batch (dye lot) so colours match.',
      steps: [
        `Distance around the room = 2 × (${L} + ${W}) = ${+perimeter.toFixed(2)} ft, less ${openings} ft of openings = ${+net.toFixed(2)} ft`,
        `Strips = ceil(${+(net * 12).toFixed(2)} in ÷ ${rw} in × ${+(1 + waste / 100).toFixed(4)}) = ${strips}`,
        `Strip length = ${H} ft × 12 + ${repeat} in repeat = ${+dropLen.toFixed(2)} in`,
        `Strips per roll = floor(${+(rl * 12).toFixed(2)} in ÷ ${+dropLen.toFixed(2)} in) = ${dropsPerRoll}`,
        `Rolls = ceil(${strips} ÷ ${dropsPerRoll}) = ${rolls}`,
      ],
    };
  },
  content: {
    formula: [
      'Strips = ceil((distance around the room − openings) in inches ÷ roll width × (1 + extra % ÷ 100))',
      'Strip length = wall height in inches + pattern repeat',
      'Strips per roll = floor(roll length in inches ÷ strip length)',
      'Rolls = ceil(strips ÷ strips per roll)',
    ],
    body: [
      'Wallpaper goes up in vertical strips, called drops. Dividing the distance around the room by the roll width tells you how many strips you need. Then work out how many full-height strips one roll can give you. You cannot join offcuts across a wall, so that number is rounded down.',
      'A pattern repeat makes each strip longer, because every strip has to start at the right point in the pattern. A large repeat can cut the strips per roll sharply, and that can add rolls even though the room has not changed. Use 0 for plain or random-match paper.',
      'Check the roll label for the real width, length and repeat, since they vary between makers. Buy one spare roll from the same batch (dye lot) as the rest, because colours can differ slightly between batches and a later roll may not match. This is an estimate only.',
    ],
    faq: [
      { q: 'How many rolls of wallpaper does a 12 ft by 10 ft room need?', a: 'With 8 ft walls, 20.5 in by 33 ft rolls, no repeat and no openings, the room is 44 ft around. 528 in ÷ 20.5 in is 25.76, so 26 strips. Each roll gives floor(396 ÷ 96) = 4 strips, so ceil(26 ÷ 4) = 7 rolls.' },
      { q: 'How does a pattern repeat change the number of rolls?', a: 'It lengthens each strip. With a 16 in repeat in the same room, each strip is 112 in, so a roll gives floor(396 ÷ 112) = 3 strips. 26 strips ÷ 3 is 8.67, so you need 9 rolls instead of 7.' },
      { q: 'Should I subtract doors and windows?', a: 'You can. Enter their total width and it is taken off the distance around the room. This only saves strips if the openings are wide, and many people leave a small allowance instead.' },
      { q: 'Should I buy a spare roll?', a: 'Yes. Buy one extra roll from the same batch (dye lot), because a later batch may not match in colour. Keep it for repairs too.' },
      { q: 'What if the calculator says a roll is too short?', a: 'It means one roll cannot give even one strip, because the wall height plus the repeat is longer than the roll. Check the roll length on the label.' },
    ],
    sources: [],
  },
  related: ['paint', 'drywall'],
  examples: [
    // 12x10: perimeter 44 ft = 528 in; 528/20.5 = 25.76 -> 26 strips; drop 96 in; 396/96 = 4.125 -> 4; 26/4 = 6.5 -> 7 rolls
    { values: { length: 12, width: 10, height: 8, rollWidth: 20.5, rollLength: 33, repeat: 0, openings: 0, waste: 0 }, expect: { rolls: 7, strips: 26, dropsPerRoll: 4 } },
    // 16 in repeat: drop 112 in; 396/112 = 3.54 -> 3; 26/3 = 8.67 -> 9 rolls
    { values: { length: 12, width: 10, height: 8, rollWidth: 20.5, rollLength: 33, repeat: 16, openings: 0, waste: 0 }, expect: { rolls: 9, strips: 26, dropsPerRoll: 3 } },
    // 6 ft of openings: 38 ft = 456 in; 456/20.5 = 22.24 -> 23 strips; 23/4 = 5.75 -> 6 rolls
    { values: { length: 12, width: 10, height: 8, rollWidth: 20.5, rollLength: 33, repeat: 0, openings: 6, waste: 0 }, expect: { rolls: 6, strips: 23, dropsPerRoll: 4 } },
  ],
});
