import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';
import { num } from '../../lib/math';

const conv = makeConverter(
  'angle',
  [
    { id: 'deg', name: 'Degrees', info: 'Degrees: a full circle is 360°, a right angle is 90°.' },
    { id: 'rad', name: 'Radians', info: 'Radians, the SI unit of angle: a full circle is 2π (about 6.2832) radians.' },
    { id: 'grad', name: 'Gradians', info: 'Gradians (gon): a full circle is 400 grad, so a right angle is exactly 100 grad. Used in some surveying.' },
    { id: 'turn', name: 'Turns', info: 'Turns: 1 turn is one full rotation, 360°.' },
  ],
  'deg',
  {
    chartUnits: ['deg', 'grad'],
    chartTitle: 'Degrees and gradians for the same angle',
    extra: (rad) => {
      const deg = (rad * 180) / Math.PI;
      const sign = deg < 0 ? '-' : '';
      // Work in whole arcseconds so rounding can never produce 60 minutes or 60 seconds.
      const total = Math.round(Math.abs(deg) * 3600);
      const d = Math.floor(total / 3600);
      const m = Math.floor((total % 3600) / 60);
      const s = total % 60;
      return { dms: `${sign}${d}° ${m}′ ${s}″` };
    },
  },
);

export default defineCalculator({
  slug: 'angle-converter',
  title: 'Angle Converter',
  category: 'conversion',
  description: 'Convert angles between degrees, radians, gradians and turns, with degrees-minutes-seconds shown too.',
  metaDescription: 'Convert angles between degrees, radians, gradians and turns instantly, and see the same angle as degrees, minutes and seconds (DMS).',
  updated: '2026-11-20',
  keywords: ['degrees to radians', 'radians to degrees', 'angle converter', 'degrees to gradians', 'degrees minutes seconds', 'dms converter'],
  inputs: [{ id: 'value', label: 'Angle', type: 'number', unit: 'angle', defaultUnit: 'deg', default: 180, info: 'Enter an angle and pick its unit; every other unit updates instantly.' }],
  outputs: [...conv.outputs, { id: 'dms', label: 'Degrees, minutes, seconds', format: 'text', info: 'The same angle as whole degrees, arcminutes (′) and arcseconds (″), rounded to the nearest arcsecond.' }],
  compute: (v) => {
    if (num(v.value) === null) return { deg: null };
    return conv.compute(v);
  },
  content: {
    formula: ['radians = degrees × π / 180', 'gradians = degrees × 10 / 9', 'turns = degrees / 360', 'minutes = fractional degrees × 60; seconds = fractional minutes × 60'],
    body: [
      'A full circle is 360 degrees, 2π radians, 400 gradians or 1 turn, so every conversion is a straight ratio. To turn degrees into radians multiply by π/180 (about 0.017453); to go back multiply by 180/π (about 57.2958).',
      'Degrees, minutes and seconds (DMS) split one degree into 60 arcminutes and each arcminute into 60 arcseconds. It is how map coordinates and telescope positions are usually written, so 45.5° is 45° 30′ 0″.',
      'Radians are the natural unit in maths and programming: sine, cosine and tangent functions in most languages expect radians, not degrees.',
    ],
    faq: [
      { q: 'How many degrees is 1 radian?', a: 'About 57.2958°, which is 180 divided by π.' },
      { q: 'What is 180 degrees in radians?', a: 'Exactly π radians, about 3.14159.' },
      { q: 'How many gradians are in a right angle?', a: '100 grad. A full circle is 400 grad, which makes right angles easy to count in tens.' },
    ],
  },
  related: ['triangle', 'slope', 'pythagorean-theorem'],
  // Example values are in base units (radians), like every converter's compute().
  examples: [
    { values: { value: Math.PI }, expect: { deg: 180, grad: 200, turn: 0.5, dms: '180° 0′ 0″' }, tolerance: 1e-9 },
    { values: { value: Math.PI / 2 }, expect: { deg: 90, grad: 100, turn: 0.25 }, tolerance: 1e-9 },
    { values: { value: (45.5 * Math.PI) / 180 }, expect: { dms: '45° 30′ 0″' } },
    { values: { value: 1 }, expect: { deg: 57.29577951308232 }, tolerance: 1e-9 },
    { values: { value: (10.5125 * Math.PI) / 180 }, expect: { dms: '10° 30′ 45″' } },
  ],
});
