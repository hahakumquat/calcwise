import { defineCalculator } from '../../lib/types';

const MM_PER_IN = 25.4;
const PT_PER_IN = 72;

// Sizes in portrait orientation, stored in millimetres.
// ISO 216 A series: A0 is 841 x 1189 mm; each next size halves the longer side, rounded down to a whole mm.
// US sizes are defined in inches (Letter 8.5 x 11, Legal 8.5 x 14, Tabloid 11 x 17) and converted at exactly 25.4 mm per inch.
const SIZES: Record<string, { label: string; w: number; h: number }> = {
  a0: { label: 'A0', w: 841, h: 1189 },
  a1: { label: 'A1', w: 594, h: 841 },
  a2: { label: 'A2', w: 420, h: 594 },
  a3: { label: 'A3', w: 297, h: 420 },
  a4: { label: 'A4', w: 210, h: 297 },
  a5: { label: 'A5', w: 148, h: 210 },
  a6: { label: 'A6', w: 105, h: 148 },
  letter: { label: 'Letter', w: 8.5 * MM_PER_IN, h: 11 * MM_PER_IN },
  legal: { label: 'Legal', w: 8.5 * MM_PER_IN, h: 14 * MM_PER_IN },
  tabloid: { label: 'Tabloid', w: 11 * MM_PER_IN, h: 17 * MM_PER_IN },
};
const SIZE_IDS = Object.keys(SIZES);

const UNITS: Record<string, { name: string; perMm: number; dp: number }> = {
  mm: { name: 'mm', perMm: 1, dp: 1 },
  in: { name: 'in', perMm: 1 / MM_PER_IN, dp: 3 },
  pt: { name: 'pt', perMm: PT_PER_IN / MM_PER_IN, dp: 2 },
};

const fmt = (x: number, dp: number) => String(Number(x.toFixed(dp)));
const pct = (x: number) => `${(x * 100).toFixed(2)}%`;

export default defineCalculator({
  slug: 'paper-size-converter',
  title: 'Paper Size Converter: A4, Letter, Legal',
  category: 'conversion',
  description: 'Convert A0 to A6, Letter, Legal and Tabloid paper sizes to mm, inches or points, and compare two sizes side by side, including scale to fit.',
  keywords: ['paper size converter', 'a4 size in inches', 'a4 in mm', 'a4 vs letter', 'letter size in mm', 'paper sizes', 'iso 216', 'a4 in points', 'legal size paper'],
  updated: '2026-11-27',
  inputs: [
    {
      id: 'size', label: 'Paper size', type: 'select', default: 'a4',
      options: SIZE_IDS.map((id) => ({ value: id, label: SIZES[id].label })),
      info: 'A0 to A6 follow ISO 216, used almost everywhere outside North America. Letter, Legal and Tabloid are the US sizes. Sizes are shown in portrait: width first, then height.',
    },
    {
      id: 'unit', label: 'Show in', type: 'select', default: 'mm', segmented: true,
      options: [{ value: 'mm', label: 'mm' }, { value: 'in', label: 'in' }, { value: 'pt', label: 'pt' }],
      info: 'Millimetres, inches, or PostScript points (1/72 inch), the unit PDF and design software use.',
    },
    {
      id: 'other', label: 'Compare with (optional)', type: 'select', default: 'none',
      options: [{ value: 'none', label: 'No comparison' }, ...SIZE_IDS.map((id) => ({ value: id, label: SIZES[id].label }))],
      info: 'Pick a second size to see how much narrower or taller the first size is, and the scale needed to fit it onto the second.',
    },
  ],
  outputs: [
    { id: 'dims', label: 'Size (width × height)', format: 'text', primary: true, info: 'Width and height in portrait orientation, in the unit you chose.' },
    { id: 'mm', label: 'Millimetres', format: 'text', info: 'Width × height in millimetres.' },
    { id: 'inch', label: 'Inches', format: 'text', info: 'Width × height in inches, to three decimals.' },
    { id: 'pt', label: 'Points', format: 'text', info: 'Width × height in PostScript points (72 per inch), to two decimals.' },
    { id: 'diffW', label: 'Width difference', format: 'text', showWhen: { input: 'other', is: SIZE_IDS }, info: 'How much narrower or wider the first size is than the comparison size.' },
    { id: 'diffH', label: 'Height difference', format: 'text', showWhen: { input: 'other', is: SIZE_IDS }, info: 'How much shorter or taller the first size is than the comparison size.' },
    { id: 'fit', label: 'Scale to fit', format: 'text', showWhen: { input: 'other', is: SIZE_IDS }, info: 'The largest scale at which the first size fits entirely on the comparison size: the smaller of width ratio and height ratio. Above 100% means it can be enlarged to fit.' },
  ],
  compute: (v) => {
    const a = SIZES[String(v.size)];
    const u = UNITS[String(v.unit)] ?? UNITS.mm;
    if (!a) return { dims: null };
    const pair = (s: { w: number; h: number }, unit: { perMm: number; dp: number }) => `${fmt(s.w * unit.perMm, unit.dp)} × ${fmt(s.h * unit.perMm, unit.dp)}`;
    const dimsOf = (s: { w: number; h: number }) => `${pair(s, u)} ${u.name}`;
    const res: Record<string, string> = {
      dims: dimsOf(a),
      mm: `${pair(a, UNITS.mm)} mm`,
      inch: `${pair(a, UNITS.in)} in`,
      pt: `${pair(a, UNITS.pt)} pt`,
    };
    const steps = [
      `${a.label}: ${dimsOf(a)}`,
      `Inches = mm ÷ 25.4, points = inches × 72`,
    ];
    const b = SIZES[String(v.other)];
    const chart = {
      type: 'bar' as const,
      title: `Width and height in ${u.name}`,
      categories: ['Width', 'Height'],
      series: [{ name: a.label, values: [a.w * u.perMm, a.h * u.perMm].map((x) => Number(x.toFixed(u.dp))) }],
    };
    if (!b) return { ...res, note: 'ISO 216 and US paper sizes are fixed standards, so these figures never change.', steps, chart };
    chart.series.push({ name: b.label, values: [b.w * u.perMm, b.h * u.perMm].map((x) => Number(x.toFixed(u.dp))) });
    const dw = (a.w - b.w) * u.perMm;
    const dh = (a.h - b.h) * u.perMm;
    const word = (d: number, neg: string, pos: string) => (Number(Math.abs(d).toFixed(u.dp)) === 0 ? 'the same' : `${fmt(Math.abs(d), u.dp)} ${u.name} ${d < 0 ? neg : pos}`);
    const fit = Math.min(b.w / a.w, b.h / a.h);
    res.diffW = `${a.label} is ${word(dw, 'narrower', 'wider')}`;
    res.diffH = `${a.label} is ${word(dh, 'shorter', 'taller')}`;
    res.fit = pct(fit);
    steps.push(`${b.label}: ${dimsOf(b)}`, `Scale to fit = min(${fmt(b.w, 1)} ÷ ${fmt(a.w, 1)}, ${fmt(b.h, 1)} ÷ ${fmt(a.h, 1)}) = ${pct(fit)}`);
    return {
      ...res,
      tone: fit >= 1 ? 'good' : 'ok',
      badge: fit >= 1 ? 'Fits at full size' : 'Needs shrinking',
      note: `To print ${a.label} on ${b.label}, set the scale to ${pct(fit)} or lower.`,
      steps,
      chart,
    };
  },
  content: {
    formula: [
      'A0 = 841 × 1189 mm; each next A size halves the longer side, rounded down',
      'Letter = 8.5 × 11 in, Legal = 8.5 × 14 in, Tabloid = 11 × 17 in',
      '1 in = 25.4 mm = 72 pt',
      'Scale to fit = min(target width ÷ width, target height ÷ height)',
    ],
    body: [
      'Pick a paper size and a unit to see its width and height in millimetres, inches and PostScript points. Sizes are in portrait orientation, width first. For landscape, swap the two numbers.',
      'The A series is defined by ISO 216. A0 is 841 × 1189 mm, close to one square metre, and each size is made by cutting the one before in half across its longer side, rounding down to a whole millimetre. That is why A4 is 210 × 297 mm and A5 is 148 × 210 mm. The US sizes Letter, Legal and Tabloid are defined in inches. All of these are fixed standards, so the numbers do not change.',
      'To compare two sizes, choose a second one. You get how much narrower or taller the first size is, and the scale to fit: the percentage you must print the first size at so it fits inside the second without cropping. It is the smaller of the width ratio and the height ratio, because the tighter dimension decides.',
    ],
    faq: [
      { q: 'What is A4 in mm, inches and points?', a: 'A4 is 210 × 297 mm, which is 8.268 × 11.693 in or 595.28 × 841.89 pt.' },
      { q: 'What is the difference between A4 and US Letter?', a: 'Letter is 215.9 × 279.4 mm. Compared with Letter, A4 is 5.9 mm narrower and 17.6 mm taller.' },
      { q: 'How do I print A4 on Letter paper without cropping?', a: 'Scale the page to 94.07%. The height is the limit: 279.4 ÷ 297 = 94.07%, while the width ratio is 215.9 ÷ 210 = 102.81%, so the smaller one wins.' },
      { q: 'What size is A3 in inches?', a: 'A3 is 297 × 420 mm, which is 11.693 × 16.535 in, or 841.89 × 1190.55 pt.' },
    ],
    sources: [
      { label: 'ISO 216: Writing paper and certain classes of printed matter, trimmed sizes, A and B series' },
      { label: 'International yard and pound agreement (1959): 1 inch = 25.4 mm exactly' },
    ],
  },
  related: ['length-converter', 'aspect-ratio', 'area-converter'],
  examples: [
    // A4 = 210 x 297 mm; /25.4 = 8.268 x 11.693 in; x72/25.4 = 595.28 x 841.89 pt
    { values: { size: 'a4', unit: 'mm', other: 'none' }, expect: { dims: '210 × 297 mm', mm: '210 × 297 mm', inch: '8.268 × 11.693 in', pt: '595.28 × 841.89 pt' } },
    // Letter = 8.5 x 11 in = 215.9 x 279.4 mm; 215.9/25.4 = 8.5; 72 x 8.5 = 612 pt, 792 pt
    { values: { size: 'letter', unit: 'in', other: 'none' }, expect: { dims: '8.5 × 11 in', mm: '215.9 × 279.4 mm', pt: '612 × 792 pt' } },
    // A4 vs Letter: 210-215.9 = -5.9 (narrower); 297-279.4 = 17.6 (taller); min(215.9/210, 279.4/297) = min(1.0281, 0.9407) = 94.07%
    { values: { size: 'a4', unit: 'mm', other: 'letter' }, expect: { diffW: 'A4 is 5.9 mm narrower', diffH: 'A4 is 17.6 mm taller', fit: '94.07%' } },
    // A3 = 297 x 420 mm; 420/25.4 = 16.535; 420 x 72/25.4 = 1190.55 pt
    { values: { size: 'a3', unit: 'pt', other: 'none' }, expect: { dims: '841.89 × 1190.55 pt', inch: '11.693 × 16.535 in' } },
  ],
});
