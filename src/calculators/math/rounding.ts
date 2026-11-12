import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

/** Strip binary floating-point noise: 267.49999999999997 → 267.5. */
const tidy = (x: number) => Number(x.toPrecision(15));

function roundBy(x: number, places: number, mode: string): number {
  const f = 10 ** places;
  const s = tidy(x * f);
  let r: number;
  switch (mode) {
    case 'up':
      r = Math.ceil(s);
      break;
    case 'down':
      r = Math.floor(s);
      break;
    case 'trunc':
      r = Math.trunc(s);
      break;
    case 'even': {
      const fl = Math.floor(s);
      const diff = tidy(s - fl);
      r = diff > 0.5 ? fl + 1 : diff < 0.5 ? fl : fl % 2 === 0 ? fl : fl + 1;
      break;
    }
    default:
      // half away from zero
      r = Math.sign(s) * Math.round(Math.abs(s));
  }
  return tidy(r / f);
}

const placeName = (p: number) =>
  p > 0 ? `${p} decimal place${p > 1 ? 's' : ''}` : p === 0 ? 'the nearest whole number' : `the nearest ${(10 ** -p).toLocaleString('en-US')}`;

export default defineCalculator({
  slug: 'rounding',
  title: 'Rounding Calculator',
  category: 'math',
  description: 'Round a number to any number of decimal places, or to the nearest 10, 100 or 1000, using your choice of rounding rule.',
  keywords: ['round to nearest', 'decimal places', 'round to nearest tenth', 'round to nearest hundred', 'bankers rounding', 'round half to even'],
  inputs: [
    { id: 'x', info: 'The number you want to round.', label: 'Number', type: 'number', default: 2.675 },
    { id: 'places', info: 'How many digits to keep after the decimal point. Use negative values to round to tens, hundreds and so on.', label: 'Decimal places', type: 'number', default: 2, step: 1, min: -12, max: 15, help: 'Use 0 for whole numbers, −1 for nearest 10, −2 for nearest 100…' },
    {
      id: 'mode', info: 'The rule for breaking ties and choosing direction. Most schools use “round half up”.',
      label: 'Rounding rule',
      type: 'select',
      default: 'half-up',
      options: [
        { value: 'half-up', label: 'Round half up (standard school rule)' },
        { value: 'even', label: 'Round half to even (banker’s rounding)' },
        { value: 'up', label: 'Always round up (ceiling)' },
        { value: 'down', label: 'Always round down (floor)' },
        { value: 'trunc', label: 'Truncate (chop off digits)' },
      ],
    },
  ],
  outputs: [
    { id: 'rounded', info: 'Your number after rounding with the chosen rule.', label: 'Rounded number', primary: true, precision: 15 },
    { id: 'roundingError', info: 'How much rounding changed the number: rounded minus original.', label: 'Change from original', precision: 10 },
  ],
  compute: (v) => {
    const x = num(v.x);
    const p = num(v.places);
    if (x === null || p === null) return { rounded: null };
    if (!Number.isInteger(p) || p < -12 || p > 15) return { rounded: null, error: 'Decimal places must be a whole number from −12 to 15.' };
    const mode = (v.mode as string) || 'half-up';
    const rounded = roundBy(x, p, mode);
    const scaled = tidy(x * 10 ** p);
    const steps = [
      `Rounding to ${placeName(p)}`,
      p === 0 ? `Look at the digits after the decimal point: ${fmt(x, 15)}` : `Shift the decimal point ${Math.abs(p)} place${Math.abs(p) > 1 ? 's' : ''} ${p > 0 ? 'right' : 'left'}: ${fmt(scaled, 15)}`,
    ];
    const fracPart = tidy(Math.abs(scaled) - Math.floor(Math.abs(scaled)));
    if (mode === 'half-up') steps.push(`Fractional part is ${fmt(fracPart)} — ${fracPart >= 0.5 ? '0.5 or more, so round away from zero' : 'less than 0.5, so keep the digit'}`);
    else if (mode === 'even') steps.push(fracPart === 0.5 ? 'Exactly halfway, so round to the even neighbour' : `Not a tie (${fmt(fracPart)}), so round to the nearest`);
    else if (mode === 'up') steps.push('Ceiling: move up to the next value (toward +∞)');
    else if (mode === 'down') steps.push('Floor: move down to the next value (toward −∞)');
    else steps.push('Truncate: drop the extra digits (toward zero)');
    steps.push(`Shift back: ${fmt(rounded, 15)}`);
    // Show the number between its two rounding candidates, with the halfway point.
    const step = 10 ** -p;
    const lo = tidy(Math.floor(scaled) / 10 ** p);
    const hi = tidy(lo + step);
    const mid = tidy(lo + step / 2);
    const chart: ChartSpec =
      lo === x
        ? { type: 'bar', title: 'Already exact at this precision', categories: ['Original', 'Rounded'], series: [{ name: 'Value', values: [x, rounded] }], highlight: 1 }
        : {
            type: 'scale',
            title: `${fmt(x, 15)} lies between ${fmt(lo, 15)} and ${fmt(hi, 15)}`,
            min: lo,
            max: hi,
            value: x,
            valueLabel: fmt(x, 15),
            bands: [
              { from: lo, to: mid, label: `closer to ${fmt(lo, 15)}`, tone: rounded === lo ? 'good' : 'neutral' },
              { from: mid, to: hi, label: `closer to ${fmt(hi, 15)}`, tone: rounded === hi ? 'good' : 'neutral' },
            ],
          };
    return { rounded, roundingError: tidy(rounded - x), chart, steps };
  },
  content: {
    formula: ['Round half up: look at the first dropped digit; 5–9 rounds up, 0–4 rounds down', 'Nearest 10ⁿ: shift, round to a whole number, shift back'],
    body: [
      'Rounding replaces a number with a simpler one that is close to it. To round to two decimal places, look at the third decimal digit: if it is 5 or more, increase the second digit by one; otherwise leave it. So 3.14159 rounds to 3.14 and 2.675 rounds to 2.68.',
      'Negative “decimal places” round to the left of the decimal point: −1 rounds to the nearest ten, −2 to the nearest hundred, and so on. 1,849 rounded to the nearest hundred is 1,800.',
      'The standard school rule always rounds a 5 up (away from zero), which slightly biases totals upward when many numbers are rounded. Banker’s rounding avoids that bias by sending exact halves to the nearest even digit, so 2.5 becomes 2 and 3.5 becomes 4. Ceiling, floor and truncate always move in one direction, which is useful for things like “how many boxes do I need?”.',
    ],
    faq: [
      { q: 'Why does my spreadsheet round 2.675 to 2.67?', a: 'Computers store decimals in binary, so 2.675 is really 2.67499999… This calculator removes that tiny error before rounding, giving the answer you would get by hand: 2.68.' },
      { q: 'How do negative numbers round?', a: 'With the standard rule, halves round away from zero, so −2.5 becomes −3. Floor always goes down (−2.5 → −3) and ceiling always goes up (−2.5 → −2).' },
      { q: 'Is rounding the same as significant figures?', a: 'Not quite. Rounding to decimal places fixes the position of the last digit, while significant figures fix how many meaningful digits are kept. Use the significant figures calculator for the latter.' },
    ],
  },
  related: ['significant-figures', 'scientific-notation', 'percentage'],
  examples: [
    { values: { x: 2.675, places: 2, mode: 'half-up' }, expect: { rounded: 2.68 } },
    { values: { x: 2.5, places: 0, mode: 'even' }, expect: { rounded: 2 } },
    { values: { x: 3.5, places: 0, mode: 'even' }, expect: { rounded: 4 } },
    { values: { x: -2.5, places: 0, mode: 'half-up' }, expect: { rounded: -3 } },
    { values: { x: 1849, places: -2, mode: 'half-up' }, expect: { rounded: 1800 } },
    { values: { x: 3.14159, places: 3, mode: 'down' }, expect: { rounded: 3.141 } },
  ],
});
