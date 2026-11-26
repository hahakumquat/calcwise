import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Standard UK gas mark table (Fahrenheit). Marks 1 to 9 follow F = 275 + 25 x (mark - 1); 1/4 and 1/2 sit at 225 and 250.
const MARKS: { mark: number; label: string; f: number }[] = [
  { mark: 0.25, label: '1/4', f: 225 },
  { mark: 0.5, label: '1/2', f: 250 },
  ...Array.from({ length: 9 }, (_, i) => ({ mark: i + 1, label: String(i + 1), f: 275 + 25 * i })),
];

const toC = (f: number) => ((f - 32) * 5) / 9;
const toF = (c: number) => (c * 9) / 5 + 32;
const r1 = (x: number) => Math.round(x * 10) / 10;

/** Fahrenheit for a gas mark (piecewise linear between the table rows). */
function markToF(g: number): number {
  for (let i = 1; i < MARKS.length; i++) {
    const a = MARKS[i - 1];
    const b = MARKS[i];
    if (g <= b.mark) return a.f + ((g - a.mark) / (b.mark - a.mark)) * (b.f - a.f);
  }
  return MARKS[MARKS.length - 1].f;
}

/** Nearest standard mark by temperature, or null when more than half a step off the scale. */
function nearestMark(f: number) {
  if (f < 225 - 12.5 - 1e-9 || f > 475 + 12.5 + 1e-9) return null;
  let best = MARKS[0];
  for (const m of MARKS) if (Math.abs(m.f - f) < Math.abs(best.f - f) - 1e-9) best = m;
  return best;
}

const BANDS = [
  { from: 0, to: 145, label: 'Very low', tone: 'neutral' as const },
  { from: 145, to: 175, label: 'Low', tone: 'ok' as const },
  { from: 175, to: 195, label: 'Moderate', tone: 'good' as const },
  { from: 195, to: 225, label: 'Hot', tone: 'warn' as const },
  { from: 225, to: 300, label: 'Very hot', tone: 'bad' as const },
];

export default defineCalculator({
  slug: 'oven-temperature',
  title: 'Oven Temperature Converter: F, C, Fan & Gas Mark',
  seoTitle: 'Oven Temperature Converter: F, C, Fan, Gas Mark',
  category: 'conversion',
  description: 'Convert oven temperatures between Fahrenheit, Celsius and gas mark, with a fan oven setting that lowers the heat by an amount you choose.',
  keywords: ['oven temperature conversion', 'gas mark to celsius', 'gas mark to fahrenheit', 'fan oven temperature', 'fan oven conversion', '350 f to c', '180 c to f', 'gas mark 4'],
  updated: '2026-11-26',
  inputs: [
    { id: 'temp', label: 'Oven temperature', type: 'number', default: 350, step: 5, info: 'The temperature on the recipe, in the scale you pick next. For gas mark enter 0.25, 0.5 or 1 to 9.' },
    {
      id: 'scale', label: 'Recipe scale', type: 'select', default: 'f', segmented: true,
      options: [{ value: 'f', label: '°F' }, { value: 'c', label: '°C' }, { value: 'gas', label: 'Gas mark' }],
      info: 'Which scale the recipe uses. The other scales are worked out for you.',
    },
    { id: 'fan', label: 'Fan oven reduction', type: 'number', default: 20, min: 0, max: 50, step: 5, suffix: '°C', info: 'Fan ovens run hotter for the same dial setting, so recipes often say to lower the heat by about 20 °C (some ovens say 10 to 25). It is a common rule of thumb: check your oven manual.' },
  ],
  outputs: [
    { id: 'c', label: 'Celsius (conventional)', primary: true, precision: 1, suffix: '°C', info: '°C = (°F − 32) × 5/9. Conventional (non-fan) oven.' },
    { id: 'f', label: 'Fahrenheit', precision: 1, suffix: '°F', info: '°F = °C × 9/5 + 32.' },
    { id: 'gas', label: 'Gas mark (approximate)', format: 'text', info: 'The nearest standard gas mark. Gas marks come in steps of about 25 °F (14 °C), so this is approximate. Shown only between 1/4 and 9.' },
    { id: 'fanC', label: 'Fan oven Celsius', precision: 1, suffix: '°C', info: 'Celsius minus the fan reduction you entered.' },
    { id: 'fanF', label: 'Fan oven Fahrenheit', precision: 1, suffix: '°F', info: 'The fan oven temperature in Fahrenheit: Fahrenheit minus the reduction × 9/5.' },
  ],
  compute: (v) => {
    const t = num(v.temp);
    const red = num(v.fan) ?? 0;
    const scale = v.scale === 'c' || v.scale === 'gas' ? v.scale : 'f';
    if (t === null) return { c: null };
    if (red < 0 || red > 50) return { c: null, error: 'Fan reduction should be between 0 and 50 °C.' };
    let f: number;
    if (scale === 'gas') {
      if (t < 0.25 || t > 9) return { c: null, error: 'Gas marks run from 1/4 up to 9. Enter 0.25, 0.5 or a number from 1 to 9.' };
      f = markToF(t);
    } else {
      f = scale === 'c' ? toF(t) : t;
    }
    if (f < -459.67 - 1e-9) return { c: null, error: 'That is below absolute zero.' };
    const c = toC(f);
    const near = nearestMark(f);
    const fanC = c - red;
    const fanF = f - (red * 9) / 5;
    const band = BANDS.find((b) => c < b.to) ?? BANDS[BANDS.length - 1];
    const lo = Math.min(0, Math.floor(c / 10) * 10);
    const hi = Math.max(300, Math.ceil(c / 10) * 10);
    const steps = [`°C = (${r1(f)} − 32) × 5/9 = ${r1(c)}`, `Fan oven = ${r1(c)} − ${red} = ${r1(fanC)} °C`];
    steps.push(near ? `Nearest standard gas mark: ${near.label} (${near.f} °F, about ${Math.round(toC(near.f))} °C)` : 'Outside the gas mark scale (1/4 to 9, 225 to 475 °F).');
    return {
      c,
      f,
      gas: near ? `Gas mark ${near.label}` : 'Off the gas mark scale',
      fanC,
      fanF,
      tone: band.tone === 'neutral' ? undefined : band.tone === 'bad' ? 'warn' : band.tone,
      badge: `${band.label} oven`,
      note: `Set a fan oven to about ${Math.round(fanC)} °C.`,
      steps,
      chart: {
        type: 'scale',
        title: 'How hot is that oven?',
        min: lo,
        max: hi,
        value: c,
        format: { unit: 'temperature' },
        bands: BANDS.map((b, i) => ({ ...b, from: i === 0 ? lo : b.from, to: i === BANDS.length - 1 ? hi : b.to })),
      },
    };
  },
  content: {
    formula: ['°C = (°F − 32) × 5/9', '°F = °C × 9/5 + 32', 'Gas mark 1 to 9: °F = 275 + 25 × (mark − 1)', 'Fan oven °C = conventional °C − reduction (default 20)'],
    body: [
      'Recipes use three oven scales: Fahrenheit in the US, Celsius in most other places, and gas marks on many UK gas cookers. Enter the temperature on your recipe, choose its scale and the other two are filled in, along with a fan oven setting.',
      'Gas marks are a table rather than a formula. From mark 1 (275 °F) to mark 9 (475 °F) each step adds 25 °F, with 1/4 at 225 °F and 1/2 at 250 °F. Printed charts round to friendly Celsius numbers, so gas mark 4 is usually shown as 180 °C although 350 °F is 176.7 °C. This calculator shows the nearest standard mark and labels it approximate.',
      'A fan oven circulates hot air, so food cooks faster than in a conventional oven at the same setting. The usual advice is to lower the temperature by about 20 °C, or to shorten the time. It is a rule of thumb and varies by oven, so the reduction is an input you can change; check your oven manual.',
    ],
    sections: [
      {
        heading: 'Gas mark chart',
        paragraphs: ['Mark 1/4: 225 °F, 110 °C. Mark 1/2: 250 °F, 130 °C. Mark 1: 275 °F, 140 °C. Mark 2: 300 °F, 150 °C. Mark 3: 325 °F, 170 °C. Mark 4: 350 °F, 180 °C. Mark 5: 375 °F, 190 °C. Mark 6: 400 °F, 200 °C. Mark 7: 425 °F, 220 °C. Mark 8: 450 °F, 230 °C. Mark 9: 475 °F, 240 °C. The Celsius column is the rounded figure used on oven dials; exact conversion of the Fahrenheit value is slightly different.'],
      },
    ],
    faq: [
      { q: 'What is 350 °F in Celsius, fan and gas mark?', a: '350 °F is 176.7 °C for a conventional oven, gas mark 4, and 156.7 °C in a fan oven with the default 20 °C reduction.' },
      { q: 'What is gas mark 6 in °F and °C?', a: 'Gas mark 6 is 400 °F, which converts to 204.4 °C (oven charts round it to 200 °C). A fan oven at a 20 °C reduction would be 184.4 °C.' },
      { q: 'What gas mark is 180 °C?', a: '180 °C is 356 °F. The nearest standard mark is gas mark 4, which the exact formula puts at 4.24, so treat it as approximate.' },
      { q: 'How much do I lower the temperature for a fan oven?', a: 'A common rule is 20 °C (about 36 °F) lower, but ovens differ. Change the reduction box to match your oven manual.' },
    ],
    sources: [{ label: 'Standard UK gas mark table: 25 °F steps from mark 1 at 275 °F' }],
  },
  related: ['temperature-converter', 'volume-converter', 'weight-converter'],
  examples: [
    // 350 F: (350-32)*5/9 = 176.667 C; fan 176.667-20 = 156.667; fan F 350-36 = 314; nearest mark 4 (350)
    { values: { temp: 350, scale: 'f', fan: 20 }, expect: { c: 176.6667, f: 350, fanC: 156.6667, fanF: 314, gas: 'Gas mark 4' }, tolerance: 1e-3 },
    // gas mark 6 = 275 + 25*5 = 400 F; (400-32)*5/9 = 204.444 C; fan 184.444
    { values: { temp: 6, scale: 'gas', fan: 20 }, expect: { f: 400, c: 204.4444, fanC: 184.4444, gas: 'Gas mark 6' }, tolerance: 1e-3 },
    // 180 C = 180*9/5+32 = 356 F; (356-275)/25+1 = 4.24 -> nearest mark 4; fan 160 C = 320 F
    { values: { temp: 180, scale: 'c', fan: 20 }, expect: { f: 356, c: 180, fanC: 160, fanF: 320, gas: 'Gas mark 4' }, tolerance: 1e-6 },
    // 200 F is more than half a step below mark 1/4 (212.5 F): off the scale
    { values: { temp: 200, scale: 'f', fan: 20 }, expect: { gas: 'Off the gas mark scale' } },
  ],
});
