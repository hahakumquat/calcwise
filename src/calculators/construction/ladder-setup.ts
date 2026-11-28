import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const FT = 0.3048;
// OSHA 1926.1053(b)(5)(i): foot of a non-self-supporting ladder is set about 1/4 of the working length from the wall.
// Height reached on the wall = L * sqrt(1 - (1/4)^2) = L * sqrt(15) / 4.
const REACH = Math.sqrt(15) / 4; // 0.968246
const ANGLE = (Math.acos(0.25) * 180) / Math.PI; // 75.5225 degrees
// OSHA 1926.1053(b)(1): a ladder used to get onto a roof or landing extends at least 3 ft above it.
const EXTENSION = 3;
const SIZES = [6, 8, 10, 12, 16, 20, 24, 28, 32, 36, 40];
const EPS = 1e-9;
const fmt = (m: number, d = 2) => (m / FT).toFixed(d);

export default defineCalculator({
  slug: 'ladder-setup',
  title: 'Ladder Setup Calculator (4-to-1 Rule)',
  category: 'construction',
  description: 'Find the safe base distance and reach for a leaning ladder using the OSHA 4-to-1 rule, or the ladder length you need to reach a roof or landing.',
  metaDescription: 'Ladder angle calculator using the OSHA 4-to-1 rule: how far to set the base from the wall, how high it reaches, and what ladder length you need for a roof.',
  keywords: ['ladder setup', 'ladder angle calculator', '4 to 1 ladder rule', 'ladder distance from wall', 'osha ladder rule', 'what size ladder do i need', 'ladder for christmas lights'],
  inputs: [
    {
      id: 'mode', label: 'What do you know?', type: 'select', segmented: true, default: 'length',
      options: [{ value: 'length', label: 'Ladder length' }, { value: 'height', label: 'Height needed' }],
      info: 'Pick "Ladder length" to see how to set up a ladder you already have, or "Height needed" to find the ladder you should get for a roof or landing.',
    },
    { id: 'length', label: 'Ladder length', type: 'number', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', default: 24, min: 4, max: 60, showWhen: { input: 'mode', is: 'length' }, info: 'The working length of the leaning ladder: the distance along the ladder from the ground to where it rests on the wall (4 to 60 ft).' },
    { id: 'height', label: 'Height of the support you want to reach', type: 'number', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', default: 20, min: 2, max: 50, showWhen: { input: 'mode', is: 'height' }, info: 'The vertical height from level ground to the roof edge, gutter or landing the ladder will rest against.' },
  ],
  outputs: [
    { id: 'base', label: 'Base distance from the wall', unit: 'length', units: ['ft', 'm', 'in', 'cm'], defaultUnit: 'ft', precision: 2, primary: true, showWhen: { input: 'mode', is: 'length' }, info: 'How far to set the feet of the ladder from the wall: one quarter of the working length.' },
    { id: 'baseIn', label: 'Base distance in inches', format: 'number', precision: 1, suffix: 'in', showWhen: { input: 'mode', is: 'length' }, info: 'The same base distance in inches, handy for a tape measure.' },
    { id: 'reach', label: 'Height reached on the wall', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', precision: 2, showWhen: { input: 'mode', is: 'length' }, info: 'How high up the wall the top of the ladder touches: about 96.8% of the ladder length.' },
    { id: 'needed', label: 'Ladder length needed', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', precision: 2, primary: true, showWhen: { input: 'mode', is: 'height' }, info: 'Height ÷ 0.9682 to reach the support, plus 3 ft extending above it.' },
    { id: 'rounded', label: 'Round up to whole feet', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', precision: 0, showWhen: { input: 'mode', is: 'height' }, info: 'The needed length rounded up to the next whole foot.' },
    { id: 'size', label: 'Standard ladder size', format: 'text', showWhen: { input: 'mode', is: 'height' }, info: 'The smallest common ladder size (6, 8, 10, 12, 16, 20, 24, 28, 32, 36 or 40 ft) that is long enough.' },
    { id: 'hbase', label: 'Base distance from the wall', unit: 'length', units: ['ft', 'm', 'in', 'cm'], defaultUnit: 'ft', precision: 2, showWhen: { input: 'mode', is: 'height' }, info: 'One quarter of the length from the ground to the support (not counting the 3 ft above it).' },
    { id: 'hbaseIn', label: 'Base distance in inches', format: 'number', precision: 1, suffix: 'in', showWhen: { input: 'mode', is: 'height' }, info: 'The same base distance in inches.' },
    { id: 'angle', label: 'Ladder angle', format: 'number', precision: 1, suffix: '°', info: 'The angle between the ladder and the ground when set at 4 to 1: about 75.5°.' },
  ],
  compute: (v) => {
    const height = v.mode === 'height';
    let work: number; // working length, ground to support, metres
    let reach: number;
    let out: Record<string, number | string>;
    if (!height) {
      const L = num(v.length);
      if (L === null || L < 4 * FT - EPS || L > 60 * FT + EPS) return { base: null };
      work = L;
      reach = L * REACH;
      const base = L / 4;
      out = { base, baseIn: base / 0.0254, reach, angle: ANGLE };
      return {
        ...out,
        tone: 'ok',
        badge: '4-to-1 setup',
        note: 'Set the feet one quarter of the ladder length from the wall, on firm level ground.',
        chart: {
          type: 'line', title: 'Side view: ladder against the wall', x: [0, base],
          xLabel: 'Distance from wall', xFormat: { unit: 'length' }, yLabel: 'Height', yFormat: { unit: 'length' },
          series: [{ name: 'Ladder', values: [reach, 0] }],
        },
        steps: [
          `Base distance = ${fmt(L)} ft ÷ 4 = ${fmt(base)} ft (${(base / 0.0254).toFixed(1)} in)`,
          `Height reached = ${fmt(L)} ft × √15 ÷ 4 = ${fmt(reach)} ft`,
          `Angle = arccos(1 ÷ 4) = ${ANGLE.toFixed(1)}°`,
        ],
      };
    }
    const H = num(v.height);
    if (H === null || H < 2 * FT - EPS || H > 50 * FT + EPS) return { needed: null };
    work = H / REACH;
    const needed = work + EXTENSION * FT;
    const rounded = Math.ceil(needed / FT - EPS) * FT;
    const sizeFt = SIZES.find((s) => s >= rounded / FT - EPS);
    const base = work / 4;
    return {
      needed,
      rounded,
      size: sizeFt ? `${sizeFt} ft ladder` : 'Longer than 40 ft: ask a supplier about a rated extension ladder',
      hbase: base,
      hbaseIn: base / 0.0254,
      angle: ANGLE,
      tone: sizeFt ? 'ok' : 'warn',
      badge: sizeFt ? `Use a ${sizeFt} ft ladder` : 'Over 40 ft',
      note: 'Assumes the ladder reaches the support at the 4-to-1 angle and extends 3 ft above it.',
      chart: {
        type: 'line', title: 'Side view: ladder and 3 ft extension', x: [0, base],
        xLabel: 'Distance from wall', xFormat: { unit: 'length' }, yLabel: 'Height', yFormat: { unit: 'length' },
        series: [{ name: 'Ladder up to the support', values: [H, 0] }],
      },
      steps: [
        `Length to the support = ${fmt(H)} ft ÷ 0.9682 = ${fmt(work)} ft`,
        `Add 3 ft above the support: ${fmt(work)} + 3 = ${fmt(needed)} ft, rounded up to ${(rounded / FT).toFixed(0)} ft`,
        `Base distance = ${fmt(work)} ft ÷ 4 = ${fmt(base)} ft (${(base / 0.0254).toFixed(1)} in)`,
      ],
    };
  },
  content: {
    formula: ['Base distance = working length ÷ 4', 'Height reached = length × √15 ÷ 4 ≈ 0.9682 × length', 'Angle = arccos(1 ÷ 4) ≈ 75.5°', 'Ladder needed = support height ÷ 0.9682 + 3 ft'],
    body: [
      'The 4-to-1 rule is the simple setup used for a leaning ladder: for every 4 feet of ladder from the ground to where it rests, put the feet 1 foot away from the wall. A 24 ft ladder goes 6 ft out. That puts the ladder at about 75.5° to the ground, steep enough to feel stable and shallow enough that it will not tip backwards or slide at the base.',
      'Choosing a ladder for a roof, gutter or landing is a little different. OSHA requires the side rails to extend at least 3 ft above the surface you step onto, so the ladder must be longer than the height you want to reach. This calculator finds the length to the support (height ÷ 0.9682), adds 3 ft along the ladder, rounds up to the next whole foot and suggests the nearest standard size. It assumes the 3 ft extension is measured along the ladder.',
      'Hanging holiday lights from the eaves is a common job where the setup matters: you reach sideways, work high up and move the ladder often. Measure the height to the gutter or roof edge, pick a ladder with the 3 ft extension if you will step onto the roof, and reset the base with a tape measure each time you move.',
      'Safety: this is a rule of thumb for setup only. Use a ladder whose duty rating covers you plus your tools, set it on firm level ground, keep three points of contact, never overreach, and read the manufacturer label, which overrides anything here. Not for self-supporting stepladders.',
    ],
    faq: [
      { q: 'How far from the wall should a 24 ft ladder be?', a: 'A 24 ft ladder goes 6.00 ft (72 in) from the wall, one quarter of its length. At that setting it touches the wall about 23.24 ft up, at an angle of 75.5°.' },
      { q: 'What ladder length do I need to reach a 20 ft roof?', a: '20 ÷ 0.9682 = 20.66 ft to the roof edge, plus 3 ft to extend above it gives 23.66 ft. Round up to 24 ft, which is a standard size. The feet go about 5.16 ft (62 in) from the wall.' },
      { q: 'What angle is the 4-to-1 rule?', a: 'arccos(1 ÷ 4) is about 75.5° from the ground.' },
      { q: 'Does the rule apply to stepladders?', a: 'No. It is for non-self-supporting (leaning) ladders such as straight and extension ladders. Open a stepladder fully and follow its label.' },
    ],
    sources: [{ label: 'OSHA, 29 CFR 1926.1053 Ladders (construction standard)', url: 'https://www.osha.gov/laws-regs/regulations/standardnumber/1926/1926.1053' }],
  },
  related: ['stair-calculator', 'rafter-length', 'roof-pitch-converter'],
  examples: [
    // 24 ft: base 24/4 = 6 ft; 24 * 0.968246 = 23.238 ft; baseIn = 72; angle acos(.25) = 75.52 deg
    { values: { mode: 'length', length: 24 * FT, height: null }, expect: { base: 6 * FT, baseIn: 72, reach: 23.2379 * FT, angle: 75.5225 }, tolerance: 0.001 },
    // 20 ft: 20/0.968246 = 20.6559; +3 = 23.6559 -> 24 ft; base 20.6559/4 = 5.1640 ft = 61.97 in
    { values: { mode: 'height', length: null, height: 20 * FT }, expect: { needed: 23.6559 * FT, rounded: 24 * FT, size: '24 ft ladder', hbase: 5.164 * FT, hbaseIn: 61.968 }, tolerance: 0.001 },
  ],
});
