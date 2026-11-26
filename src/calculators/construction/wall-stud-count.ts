import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

const IN = 0.0254;

export default defineCalculator({
  slug: 'wall-stud-count',
  title: 'Wall Stud Calculator',
  category: 'construction',
  description: 'Estimate how many studs a framed wall needs from its length and 16 or 24 in spacing, plus editable extras for each opening and corner.',
  keywords: ['wall stud calculator', 'how many studs in a wall', 'stud count', 'wall framing calculator', '16 inch on center studs', '2x4 stud estimate'],
  inputs: [
    { id: 'length', label: 'Wall length', type: 'number', unit: 'length', units: ['ft', 'in', 'm', 'cm'], defaultUnit: 'ft', default: 12, min: 0, info: 'The length of the wall measured along its plates, end to end.' },
    {
      id: 'spacing',
      label: 'Stud spacing (on centre)',
      type: 'select',
      segmented: true,
      default: '16',
      options: [
        { value: '16', label: '16 in' },
        { value: '24', label: '24 in' },
      ],
      info: 'The distance from the centre of one stud to the centre of the next. 16 in is the common default for walls; 24 in is used where the framing design allows it.',
    },
    { id: 'openings', label: 'Doors and windows', type: 'number', default: 0, min: 0, max: 50, step: 1, info: 'How many door and window openings this wall has. Each one adds the extra studs set below.' },
    { id: 'openingExtra', label: 'Extra studs per opening', type: 'number', default: 2, min: 0, max: 20, step: 1, help: 'A rule of thumb, not a code figure. Edit it to match your plan.', info: 'Studs added around each opening beyond the regular layout, for example the doubled studs at the sides. Rough default: 2. Headers, sills and cripple studs are not counted.' },
    { id: 'corners', label: 'Corners and T-intersections', type: 'number', default: 0, min: 0, max: 50, step: 1, info: 'Places where this wall meets another wall and needs extra studs to nail the drywall to.' },
    { id: 'cornerExtra', label: 'Extra studs per corner', type: 'number', default: 2, min: 0, max: 20, step: 1, help: 'A rule of thumb, not a code figure. Edit it to match your plan.', info: 'Studs added at each corner or T beyond the regular layout, so there is a backer for the finish on both sides. Rough default: 2.' },
  ],
  outputs: [
    { id: 'studs', label: 'Studs (rough estimate)', format: 'integer', primary: true, info: 'Layout studs plus the extras for openings and corners. Plates, headers and blocking are not included.' },
    { id: 'base', label: 'Layout studs', format: 'integer', info: 'Studs on the regular spacing, rounded up, plus one for the end of the wall: ceil(length ÷ spacing) + 1.' },
    { id: 'extras', label: 'Extra studs', format: 'integer', info: 'Openings × extra per opening, plus corners × extra per corner.' },
  ],
  compute: (v) => {
    const L = num(v.length);
    const sp = Number(v.spacing) || 16;
    const openings = Math.floor(num(v.openings) ?? 0);
    const oe = Math.floor(num(v.openingExtra) ?? 0);
    const corners = Math.floor(num(v.corners) ?? 0);
    const ce = Math.floor(num(v.cornerExtra) ?? 0);
    if (L === null || L <= 0 || openings < 0 || oe < 0 || corners < 0 || ce < 0) return { studs: null };
    const inches = L / IN;
    const base = ceilSafe(inches / sp) + 1;
    const openStuds = openings * oe;
    const cornerStuds = corners * ce;
    const extras = openStuds + cornerStuds;
    const studs = base + extras;
    return {
      chart: {
        type: 'donut',
        title: 'Where the studs go',
        slices: [
          { label: 'Layout studs', value: base },
          ...(openStuds ? [{ label: 'Openings', value: openStuds }] : []),
          ...(cornerStuds ? [{ label: 'Corners', value: cornerStuds }] : []),
        ],
        centerValue: String(studs),
        centerLabel: 'studs',
      },
      studs,
      base,
      extras,
      steps: [
        `Layout studs = ceil(${+inches.toFixed(2)} in ÷ ${sp} in) + 1 = ${ceilSafe(inches / sp)} + 1 = ${base}`,
        `Extras = ${openings} × ${oe} (openings) + ${corners} × ${ce} (corners) = ${extras}`,
        `Total = ${base} + ${extras} = ${studs} studs`,
      ],
    };
  },
  content: {
    formula: ['Layout studs = ceil(length ÷ spacing) + 1', 'Extras = openings × extra per opening + corners × extra per corner', 'Total = layout studs + extras'],
    body: [
      'Studs are placed on a regular grid, measured centre to centre, with one more at the end of the wall to close it off. So a wall length divided by the spacing, rounded up, plus one gives the basic count. A 12 ft wall at 16 in is 144 ÷ 16 = 9 spaces, so 10 studs.',
      'Doors, windows and corners need more studs than the plain grid. The extras here are rough rules of thumb that you can edit, because the real number depends on your framing plan: king and trimmer studs, headers, cripples and corner details all vary.',
      'This is a rough material estimate, not building-code or structural advice. It does not include top and bottom plates, headers, sills, blocking or waste, and it does not size lumber. Check your drawings, local code and the supplier before you order.',
    ],
    faq: [
      { q: 'How many studs are in a 20 ft wall at 16 in on centre?', a: '20 ft is 240 in. 240 ÷ 16 = 15 spaces, plus 1 for the end gives 16 studs before any extras.' },
      { q: 'What if the length does not divide evenly?', a: 'The spaces are rounded up, so the last stud still lands at the end of the wall. A 14 ft wall at 16 in is 168 ÷ 16 = 10.5, rounded up to 11, plus 1 is 12 studs.' },
      { q: 'How many studs for a door?', a: 'With the default of 2 extra studs per opening, a 12 ft wall at 16 in with one door is 10 + 2 = 12 studs. That default is a rough rule of thumb, so change it to match your plan.' },
      { q: 'How many studs does 24 in spacing need?', a: 'Fewer. A 12 ft wall at 24 in is 144 ÷ 24 = 6 spaces, plus 1 gives 7 studs, against 10 at 16 in. Whether 24 in is allowed depends on the design and local code.' },
      { q: 'Does this include plates?', a: 'No. Top and bottom plates, headers, blocking and waste are not included. Add them separately.' },
    ],
    sources: [{ label: 'Standard on-centre stud layout arithmetic (length ÷ spacing, rounded up, plus one); extras per opening and corner are rules of thumb, not code requirements' }],
  },
  related: ['drywall', 'board-feet', 'wall-heat-loss', 'rafter-length'],
  examples: [
    // 20 ft = 240 in; 240/16 = 15; +1 = 16
    { values: { length: 20 * 12 * IN, spacing: '16', openings: 0, openingExtra: 2, corners: 0, cornerExtra: 2 }, expect: { studs: 16, base: 16, extras: 0 } },
    // 14 ft = 168 in; 168/16 = 10.5 -> 11; +1 = 12
    { values: { length: 14 * 12 * IN, spacing: '16', openings: 0, openingExtra: 2, corners: 0, cornerExtra: 2 }, expect: { studs: 12, base: 12 } },
    // 12 ft = 144 in; 144/24 = 6; +1 = 7
    { values: { length: 12 * 12 * IN, spacing: '24', openings: 0, openingExtra: 2, corners: 0, cornerExtra: 2 }, expect: { studs: 7 } },
    // 12 ft at 16: 9 + 1 = 10; 1 door x 2 = 2 -> 12
    { values: { length: 12 * 12 * IN, spacing: '16', openings: 1, openingExtra: 2, corners: 0, cornerExtra: 2 }, expect: { studs: 12, base: 10, extras: 2 } },
    // 12 ft at 16: 10; 2 openings x 2 = 4; 1 corner x 2 = 2 -> 16
    { values: { length: 12 * 12 * IN, spacing: '16', openings: 2, openingExtra: 2, corners: 1, cornerExtra: 2 }, expect: { studs: 16, base: 10, extras: 6 } },
  ],
});
