import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
/** Width of a 16:9 screen = diagonal x 16 / sqrt(16^2 + 9^2) = diagonal x 16 / sqrt(337). */
const WIDTH_PER_DIAGONAL = 16 / Math.sqrt(337);
const tanHalf = (deg: number) => Math.tan((deg * Math.PI) / 360);

export default defineCalculator({
  slug: 'tv-viewing-distance',
  title: 'TV Size and Viewing Distance Calculator',
  category: 'everyday',
  description: 'Work out how far to sit from a TV of a given size, or what TV size suits your room, using a viewing-angle range of about 30 to 40 degrees for a 16:9 screen.',
  keywords: ['tv viewing distance calculator', 'what size tv for my room', 'how far to sit from tv', 'tv size by distance', 'best tv size for viewing distance', 'tv screen width from diagonal'],
  updated: '2026-11-28',
  inputs: [
    { id: 'mode', label: 'I want to find', type: 'select', segmented: true, default: 'distance', options: [{ value: 'distance', label: 'Seating distance' }, { value: 'size', label: 'TV size' }], info: 'Seating distance: you know the TV size. TV size: you know how far the couch is from the screen.' },
    { id: 'diagonal', label: 'TV size (diagonal)', type: 'number', default: 55, min: 0, step: 1, suffix: 'in', showWhen: { input: 'mode', is: 'distance' }, info: 'The advertised screen size, measured corner to corner, in inches.' },
    { id: 'distance', label: 'Seating distance', type: 'number', default: 8, min: 0, step: 0.5, suffix: 'ft', showWhen: { input: 'mode', is: 'size' }, info: 'From your eyes to the screen, in feet.' },
    { id: 'narrow', label: 'Narrow angle', type: 'number', default: 30, min: 5, max: 90, step: 1, suffix: '°', info: 'How much of your view the screen fills when you sit farthest away. 30 degrees is commonly quoted as an SMPTE guideline. We have not checked it against the primary document.' },
    { id: 'wide', label: 'Wide angle', type: 'number', default: 40, min: 5, max: 90, step: 1, suffix: '°', info: 'How much of your view the screen fills when you sit closest. 40 degrees is commonly quoted as a THX guideline. We have not checked it against the primary document.' },
  ],
  outputs: [
    { id: 'rangeFt', label: 'Seating distance range', format: 'text', primary: true, showWhen: { input: 'mode', is: 'distance' }, info: 'Closest to farthest seat, in feet, for the two viewing angles.' },
    { id: 'closeIn', label: 'Closest (wide angle)', format: 'number', precision: 1, suffix: 'in', showWhen: { input: 'mode', is: 'distance' }, info: 'Screen width ÷ (2 × tan(wide angle ÷ 2)), in inches.' },
    { id: 'farIn', label: 'Farthest (narrow angle)', format: 'number', precision: 1, suffix: 'in', showWhen: { input: 'mode', is: 'distance' }, info: 'Screen width ÷ (2 × tan(narrow angle ÷ 2)), in inches.' },
    { id: 'widthIn', label: 'Screen width', format: 'number', precision: 2, suffix: 'in', showWhen: { input: 'mode', is: 'distance' }, info: 'Diagonal × 16 ÷ √337 = diagonal × 0.8716 for a 16:9 screen.' },
    { id: 'rangeIn', label: 'TV size range', format: 'text', primary: true, showWhen: { input: 'mode', is: 'size' }, info: 'Smallest to largest 16:9 diagonal, in inches, for the two viewing angles.' },
    { id: 'minDiag', label: 'Smallest (narrow angle)', format: 'number', precision: 1, suffix: 'in', showWhen: { input: 'mode', is: 'size' }, info: 'Width = 2 × distance × tan(narrow angle ÷ 2), divided by 0.8716.' },
    { id: 'maxDiag', label: 'Largest (wide angle)', format: 'number', precision: 1, suffix: 'in', showWhen: { input: 'mode', is: 'size' }, info: 'Width = 2 × distance × tan(wide angle ÷ 2), divided by 0.8716.' },
  ],
  compute: (v) => {
    const mode = String(v.mode);
    const a1 = num(v.narrow);
    const a2 = num(v.wide);
    if (a1 === null || a2 === null || a1 <= 0 || a2 <= 0 || a1 >= 180 || a2 >= 180) return { rangeFt: null, rangeIn: null };
    const lo = Math.min(a1, a2);
    const hi = Math.max(a1, a2);
    if (mode === 'size') {
      const dist = num(v.distance);
      if (dist === null || dist <= 0) return { rangeIn: null };
      const d = dist * 12;
      const wMin = 2 * d * tanHalf(lo);
      const wMax = 2 * d * tanHalf(hi);
      const minDiag = wMin / WIDTH_PER_DIAGONAL;
      const maxDiag = wMax / WIDTH_PER_DIAGONAL;
      return {
        rangeIn: `${fmt(minDiag, 0)} to ${fmt(maxDiag, 0)} in`,
        minDiag,
        maxDiag,
        tone: 'good',
        badge: `${fmt(minDiag, 0)} to ${fmt(maxDiag, 0)} inch TV`,
        note: `From ${fmt(dist)} ft, a screen that fills ${fmt(lo, 0)} to ${fmt(hi, 0)} degrees of your view is about ${fmt(minDiag, 1)} to ${fmt(maxDiag, 1)} inches. Picture resolution and room lighting change what feels right, so treat it as a range.`,
        chart: {
          type: 'bar' as const,
          title: `TV size for ${fmt(dist)} ft (diagonal, inches)`,
          categories: [`${fmt(lo, 0)}° view`, `${fmt(hi, 0)}° view`],
          series: [{ name: 'Diagonal', values: [+minDiag.toFixed(1), +maxDiag.toFixed(1)] }],
          format: { format: 'number' as const, suffix: 'in' },
        },
        steps: [
          `Distance = ${fmt(dist)} ft × 12 = ${fmt(d)} in`,
          `Width at ${fmt(lo, 0)}° = 2 × ${fmt(d)} × tan(${fmt(lo / 2, 1)}°) = ${fmt(wMin, 2)} in, so diagonal = ${fmt(wMin, 2)} ÷ 0.8716 = ${fmt(minDiag, 1)} in`,
          `Width at ${fmt(hi, 0)}° = 2 × ${fmt(d)} × tan(${fmt(hi / 2, 1)}°) = ${fmt(wMax, 2)} in, so diagonal = ${fmt(wMax, 2)} ÷ 0.8716 = ${fmt(maxDiag, 1)} in`,
        ],
      };
    }
    const diag = num(v.diagonal);
    if (diag === null || diag <= 0) return { rangeFt: null };
    const width = diag * WIDTH_PER_DIAGONAL;
    const farIn = width / (2 * tanHalf(lo));
    const closeIn = width / (2 * tanHalf(hi));
    return {
      rangeFt: `${fmt(closeIn / 12, 1)} to ${fmt(farIn / 12, 1)} ft`,
      closeIn,
      farIn,
      widthIn: width,
      tone: 'good',
      badge: `Sit ${fmt(closeIn / 12, 1)} to ${fmt(farIn / 12, 1)} ft away`,
      note: `A ${fmt(diag, 0)} inch 16:9 TV is ${fmt(width, 1)} inches wide. Sit about ${fmt(closeIn / 12, 1)} to ${fmt(farIn / 12, 1)} feet away. Resolution and room lighting change what feels right, so treat it as a range.`,
      chart: {
        type: 'bar' as const,
        title: `Seating distance for a ${fmt(diag, 0)} in TV (feet)`,
        categories: [`${fmt(hi, 0)}° view (closest)`, `${fmt(lo, 0)}° view (farthest)`],
        series: [{ name: 'Distance', values: [+(closeIn / 12).toFixed(2), +(farIn / 12).toFixed(2)] }],
        format: { format: 'number' as const, suffix: 'ft' },
      },
      steps: [
        `Width = ${fmt(diag, 0)} × 16 ÷ √337 = ${fmt(diag, 0)} × 0.8716 = ${fmt(width, 2)} in`,
        `Closest = ${fmt(width, 2)} ÷ (2 × tan(${fmt(hi / 2, 1)}°)) = ${fmt(closeIn, 1)} in = ${fmt(closeIn / 12, 1)} ft`,
        `Farthest = ${fmt(width, 2)} ÷ (2 × tan(${fmt(lo / 2, 1)}°)) = ${fmt(farIn, 1)} in = ${fmt(farIn / 12, 1)} ft`,
      ],
    };
  },
  content: {
    formula: [
      'Screen width (16:9) = diagonal × 16 ÷ √337 ≈ diagonal × 0.8716',
      'Distance = width ÷ (2 × tan(angle ÷ 2))',
      'Width needed = 2 × distance × tan(angle ÷ 2), then diagonal = width ÷ 0.8716',
    ],
    body: [
      'How far you sit from a TV decides how big the picture feels. Home theater guidance is often given as a viewing angle: how much of your field of view the screen fills. This calculator turns an angle range into a seating distance for a TV you have, or into a TV size for the room you have.',
      'Example: a 55 inch 16:9 TV is about 47.94 inches wide. At a 40 degree angle you sit about 65.9 inches (5.5 ft) away, and at 30 degrees about 89.5 inches (7.5 ft). So anywhere from 5.5 to 7.5 feet. Working the other way, from 8 feet (96 inches) a 40 degree screen is about 69.9 inches wide, which is an 80 inch diagonal, and a 30 degree screen is about 51.4 inches wide, a 59 inch diagonal.',
      'The 30 degree (often credited to SMPTE) and 40 degree (often credited to THX) angles are commonly quoted guidance. We have not checked them against a primary document, so we show a range rather than a single answer. Sharper screens such as 4K let many people sit closer, a dark room favors a bigger picture, and personal taste matters most. The screen is assumed to be 16:9, as almost all TVs are. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How far should I sit from a 55 inch TV?', a: 'About 5.5 to 7.5 feet. A 55 inch 16:9 TV is 47.94 inches wide, which gives 65.9 inches (5.5 ft) at 40 degrees and 89.5 inches (7.5 ft) at 30 degrees.' },
      { q: 'What size TV should I buy for 8 feet?', a: 'About 59 to 80 inches. At 8 feet (96 inches), a 30 degree screen is a 59 inch diagonal and a 40 degree screen is an 80 inch diagonal.' },
      { q: 'Where do 30 and 40 degrees come from?', a: 'They are commonly quoted as SMPTE (about 30) and THX (about 40) guidance. We have not verified them in a primary document, so treat them as a starting range. You can change both angles in the calculator.' },
      { q: 'Does this work for ultrawide or non-16:9 screens?', a: 'No. It assumes a 16:9 screen, where width is the diagonal times 0.8716. Other shapes have a different width for the same diagonal.' },
      { q: 'Does resolution change the answer?', a: 'It can change what feels comfortable, since a sharper picture lets many people sit closer. The calculator does not model it, which is why the result is a range.' },
    ],
    sources: [
      { label: 'Viewing angles of about 30 degrees (SMPTE) and 40 degrees (THX) are commonly quoted home theater guidance; not verified by us in a primary document. Screen width follows from the 16:9 shape, with a diagonal of √337 units for a 16 by 9 screen.' },
    ],
  },
  related: ['screen-ppi', 'aspect-ratio', 'screen-time-life', 'square-footage'],
  examples: [
    // width = 55*16/sqrt(337) = 47.9370; close = 47.9370/(2*tan20) = 47.9370/0.727940 = 65.85 in = 5.488 ft
    // far = 47.9370/(2*tan15) = 47.9370/0.535898 = 89.45 in = 7.454 ft
    { values: { mode: 'distance', diagonal: 55, narrow: 30, wide: 40 }, expect: { rangeFt: '5.5 to 7.5 ft', widthIn: 47.937, closeIn: 65.85, farIn: 89.45 }, tolerance: 0.01 },
    // 96 in: width at 40 = 2*96*0.363970 = 69.882 -> /0.871576 = 80.18; at 30 = 2*96*0.267949 = 51.446 -> 59.02
    { values: { mode: 'size', distance: 8, narrow: 30, wide: 40 }, expect: { rangeIn: '59 to 80 in', minDiag: 59.02, maxDiag: 80.18 }, tolerance: 0.02 },
  ],
});
