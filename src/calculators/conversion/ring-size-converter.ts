import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Common US ring size formula: inside diameter (mm) = 0.8128 × size + 11.63.
const SLOPE = 0.8128;
const BASE = 11.63;

const half = (size: number) => (Math.round(size * 2) / 2).toString();

export default defineCalculator({
  slug: 'ring-size-converter',
  title: 'Ring Size Converter (US, mm)',
  category: 'conversion',
  description: 'Convert finger circumference or ring diameter in mm to a US ring size, and back. Uses the common US formula; brand charts can differ a little.',
  keywords: ['ring size converter', 'ring size calculator', 'finger circumference to ring size', 'ring diameter to us size', 'ring size chart mm'],
  updated: '2026-11-27',
  inputs: [
    { id: 'mode', label: 'I know my', type: 'select', default: 'circ', options: [{ value: 'circ', label: 'Finger circumference (mm)' }, { value: 'diam', label: 'Ring inside diameter (mm)' }, { value: 'size', label: 'US ring size' }], info: 'Pick the value you have measured. Circumference is the length of a string wrapped once around the finger.' },
    { id: 'circ', label: 'Finger circumference', type: 'number', suffix: 'mm', default: 54.4, min: 0, step: 0.1, info: 'Wrap a strip of paper or string around the base of the finger and measure the length in mm.', showWhen: { input: 'mode', is: 'circ' } },
    { id: 'diam', label: 'Inside diameter', type: 'number', suffix: 'mm', default: 17.3, min: 0, step: 0.1, info: 'The width across the inside of a ring that fits you.', showWhen: { input: 'mode', is: 'diam' } },
    { id: 'size', label: 'US ring size', type: 'number', default: 7, min: 0, max: 16, step: 0.25, info: 'Whole and half sizes are common, such as 7 or 7.5.', showWhen: { input: 'mode', is: 'size' } },
  ],
  outputs: [
    { id: 'usSize', label: 'US ring size', format: 'number', precision: 2, primary: true, info: 'Exact size from the formula. Round to the nearest half size when ordering.' },
    { id: 'nearest', label: 'Nearest half size', format: 'text', info: 'The size rounded to the nearest 0.5.' },
    { id: 'diameter', label: 'Inside diameter', format: 'number', precision: 2, suffix: 'mm', info: '0.8128 × size + 11.63.' },
    { id: 'circumference', label: 'Inside circumference', format: 'number', precision: 2, suffix: 'mm', info: 'Diameter × π.' },
  ],
  compute: (v) => {
    const mode = String(v.mode ?? 'circ');
    let d: number;
    if (mode === 'size') {
      const s = num(v.size);
      if (s === null) return { usSize: null };
      if (s < 0 || s > 16) return { usSize: null, error: 'Enter a US size between 0 and 16.' };
      d = SLOPE * s + BASE;
    } else if (mode === 'diam') {
      const x = num(v.diam);
      if (x === null) return { usSize: null };
      if (x <= 0) return { usSize: null, error: 'Enter a diameter above 0.' };
      d = x;
    } else {
      const c = num(v.circ);
      if (c === null) return { usSize: null };
      if (c <= 0) return { usSize: null, error: 'Enter a circumference above 0.' };
      d = c / Math.PI;
    }
    const size = (d - BASE) / SLOPE;
    if (size < 0 || size > 16) return { usSize: null, error: 'That is outside the 0 to 16 US size range this formula covers.' };
    const circ = d * Math.PI;
    return {
      usSize: size, nearest: half(size), diameter: d, circumference: circ,
      chart: (() => {
        const base = Math.round(size);
        const sizes = [base - 2, base - 1, base, base + 1, base + 2].filter((x) => x >= 0 && x <= 16);
        return {
          type: 'bar' as const,
          title: 'Inside circumference by US size (mm)',
          categories: sizes.map((x) => String(x)),
          series: [{ name: 'Circumference (mm)', values: sizes.map((x) => (SLOPE * x + BASE) * Math.PI) }],
          format: { format: 'number' as const, precision: 1 },
        };
      })(),
      tone: 'good',
      badge: `About US size ${half(size)}`,
      steps: [
        `Inside diameter: ${d.toFixed(2)} mm${mode === 'circ' ? ` (circumference ÷ π)` : ''}`,
        `US size: (${d.toFixed(2)} − ${BASE}) ÷ ${SLOPE} = ${size.toFixed(2)}`,
        `Circumference: ${d.toFixed(2)} × π = ${circ.toFixed(2)} mm`,
      ],
      note: 'Brands and jewellers use slightly different charts, and fingers swell with heat and time of day. Measure more than once, and if the ring is wide, go up a little. Ask the seller for their own chart before buying.',
    };
  },
  content: {
    formula: [
      'Inside diameter (mm) = 0.8128 × US size + 11.63',
      'US size = (inside diameter − 11.63) ÷ 0.8128',
      'Circumference = diameter × π',
    ],
    body: [
      'US ring sizes step up by about 0.8128 mm of inside diameter per full size, starting from 11.63 mm at size 0. This converter uses that common formula to go between a finger circumference, a ring diameter and a US size.',
      'To measure, wrap a thin strip of paper around the base of the finger, mark where it overlaps, and measure the length in mm. Do it at the end of the day when fingers are largest, and check twice.',
      'Charts vary by brand and country, so the result is a guide. Wide bands feel tighter than thin ones, so many people go up a quarter or half size for them.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A 54.4 mm circumference gives a diameter of 54.4 ÷ π = 17.32 mm, and a size of (17.32 − 11.63) ÷ 0.8128 = 7.00. So it is about US size 7.' },
      { q: 'What size is a 62 mm circumference?', a: '62 ÷ π = 19.73 mm, then (19.73 − 11.63) ÷ 0.8128 = 9.97, so about US size 10.' },
      { q: 'Why does my result differ from a jeweller chart?', a: 'Charts round to the nearest size and brands differ by a fraction of a millimetre. Use the nearest half size as a guide and check with the seller.' },
      { q: 'Does this cover UK or EU sizes?', a: 'No. It converts to US sizes and millimetres only.' },
    ],
    sources: [],
  },
  related: ['length-converter', 'circle', 'tire-size-comparison'],
  examples: [
    // d=54.4/pi=17.31606; size=(17.31606-11.63)/0.8128=6.9961
    { values: { mode: 'circ', circ: 54.4 }, expect: { usSize: 6.9961, diameter: 17.316 }, tolerance: 0.01 },
    // size 10: d=0.8128*10+11.63=19.758; circ=62.0719
    { values: { mode: 'size', size: 10 }, expect: { usSize: 10, diameter: 19.758, circumference: 62.0719 }, tolerance: 0.01 },
  ],
});
