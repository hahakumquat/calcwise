import { defineCalculator } from '../../lib/types';
import { makeConverter } from '../../lib/helpers/everyday';

const conv = makeConverter(
  'temperature',
  [
    { id: 'c', name: 'Celsius', precision: 2, info: 'Celsius: water freezes at 0 °C and boils at 100 °C at sea level. Used almost everywhere outside the US.' },
    { id: 'f', name: 'Fahrenheit', precision: 2, info: 'Fahrenheit: water freezes at 32 °F and boils at 212 °F. Used for weather and cooking in the US.' },
    { id: 'k', name: 'Kelvin', precision: 2, info: 'Kelvin, the SI temperature unit: Celsius-sized steps starting at absolute zero (0 K = −273.15 °C).' },
  ],
  'c',
  { extra: (c) => ({ r: ((c + 273.15) * 9) / 5 }) },
);

export default defineCalculator({
  slug: 'temperature-converter',
  title: 'Temperature Converter',
  category: 'conversion',
  description: 'Convert temperatures between Fahrenheit, Celsius, Kelvin and Rankine.',
  keywords: ['fahrenheit to celsius', 'celsius to fahrenheit', 'f to c', 'c to f', 'kelvin', 'rankine'],
  popular: true,
  inputs: [{ id: 'value', label: 'Temperature', type: 'number', unit: 'temperature', defaultUnit: 'f', default: 72, info: 'Enter a temperature and pick its scale; the other scales update instantly.' }],
  outputs: [...conv.outputs, { id: 'r', label: 'Rankine', precision: 2, suffix: '°R', info: 'Rankine: Fahrenheit-sized steps starting at absolute zero. Still used in some US engineering.' }],
  compute: (v) => {
    const r = conv.compute(v);
    if (typeof r.k === 'number' && r.k < -1e-9) return { c: null, error: 'That is below absolute zero (−273.15 °C / −459.67 °F), which is physically impossible.' };
    if (typeof r.c === 'number') {
      const lo = Math.min(-30, Math.floor(r.c / 10) * 10);
      const hi = Math.max(110, Math.ceil(r.c / 10) * 10);
      r.chart = {
        type: 'scale',
        title: 'How hot is that?',
        min: lo,
        max: hi,
        value: r.c,
        format: { unit: 'temperature' },
        bands: [
          { from: lo, to: 0, label: 'Freezing', tone: 'neutral' },
          { from: 0, to: 10, label: 'Cold', tone: 'ok' },
          { from: 10, to: 20, label: 'Mild', tone: 'good' },
          { from: 20, to: 30, label: 'Warm', tone: 'good' },
          { from: 30, to: 100, label: 'Hot', tone: 'warn' },
          { from: 100, to: hi, label: 'Boiling', tone: 'bad' },
        ],
      };
    }
    if (typeof r.c === 'number' && typeof r.f === 'number') r.steps = [`°C = (°F − 32) × 5/9`, `°F = ${r.c.toFixed(2)} × 9/5 + 32 = ${r.f.toFixed(2)}`];
    return r;
  },
  content: {
    formula: ['°C = (°F − 32) × 5/9', '°F = °C × 9/5 + 32', 'K = °C + 273.15', '°R = °F + 459.67'],
    body: [
      'Celsius and Fahrenheit differ in both their zero point and the size of a degree. Water freezes at 0 °C (32 °F) and boils at 100 °C (212 °F) at sea level, so 100 Celsius degrees span the same range as 180 Fahrenheit degrees — a ratio of 5 to 9.',
      'Kelvin is the SI unit of temperature. It uses Celsius-sized steps but starts at absolute zero, −273.15 °C, so it never goes negative; scientists write “300 K”, not “300 degrees Kelvin”. Rankine does the same for Fahrenheit and still appears in some US engineering work.',
      'Handy reference points: −40 is the same in °C and °F; room temperature is about 20–22 °C (68–72 °F); normal body temperature is about 37 °C (98.6 °F); a hot oven at 180 °C is 356 °F.',
    ],
    faq: [
      { q: 'Is there a quick mental shortcut for °C to °F?', a: 'Double the Celsius figure and add 30. It is within a couple of degrees for everyday weather (20 °C → 70 °F; the exact answer is 68 °F).' },
      { q: 'At what temperature are Celsius and Fahrenheit equal?', a: 'At −40°. Solve x = x × 9/5 + 32 to see why.' },
    ],
  },
  related: ['length-converter', 'weight-converter', 'energy-converter'],
  examples: [
    { values: { value: 100 }, expect: { f: 212, k: 373.15, r: 671.67 } },
    { values: { value: -40 }, expect: { f: -40 } },
    { values: { value: 22.2222222222 }, expect: { f: 72 }, tolerance: 1e-9 },
  ],
});
