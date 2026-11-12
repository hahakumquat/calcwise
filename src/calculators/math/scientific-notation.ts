import { defineCalculator, type ChartSpec } from '../../lib/types';

const PREFIXES: [number, string][] = [
  [-15, 'femto'], [-12, 'pico'], [-9, 'nano'], [-6, 'micro'], [-3, 'milli'], [0, 'ones'], [3, 'kilo'], [6, 'mega'], [9, 'giga'], [12, 'tera'],
];

/** Where the exponent sits on the metric-prefix ladder. */
const magnitudeChart = (e: number): ChartSpec => ({
  type: 'scale',
  title: 'Order of magnitude (power of ten)',
  min: -15,
  max: 15,
  value: Math.max(-15, Math.min(15, e)),
  valueLabel: `10^${e}`,
  bands: PREFIXES.map(([from, label]) => ({ from, to: from + 3, label, tone: 'neutral' as const })),
});
import { str, parseDecimal, normalise, mantissa, digitsToDecimal, sup } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'scientific-notation',
  title: 'Scientific Notation Calculator',
  category: 'math',
  description: 'Convert any number to scientific, engineering and E notation — or turn scientific notation back into a decimal.',
  keywords: ['standard form', 'e notation', 'engineering notation', 'powers of ten', 'convert to decimal'],
  popular: true,
  inputs: [
    {
      id: 'value', info: 'Type any number, such as 0.00042 or 6.02e23. You can also paste scientific notation to get the decimal form.',
      label: 'Number',
      type: 'text',
      default: '0.000045600',
      placeholder: 'e.g. 123000, 0.0042, 6.02e23 or 6.02 × 10^23',
      help: 'Accepts decimals, E notation (1.5e-7) and “× 10^” notation.',
    },
  ],
  outputs: [
    { id: 'scientific', info: 'The number as a value between 1 and 10 times a power of ten.', label: 'Scientific notation', format: 'text', primary: true },
    { id: 'eNotation', info: 'The computer and calculator style, where e+8 means × 10⁸.', label: 'E notation', format: 'text' },
    { id: 'engineering', info: 'Like scientific notation but the power of ten is always a multiple of 3, matching prefixes like kilo and micro.', label: 'Engineering notation', format: 'text' },
    { id: 'decimal', info: 'The number written out in full without powers of ten.', label: 'Decimal form', format: 'text' },
    { id: 'exponent', info: 'The power of ten — how many places the decimal point moved. Negative means the number is less than 1.', label: 'Exponent (power of ten)', format: 'integer' },
  ],
  compute: (v) => {
    const text = str(v.value);
    if (!text) return { scientific: null };
    const p = parseDecimal(text);
    if (!p) return { scientific: null, error: 'Couldn’t read that number. Try a form like 123000, 0.0042 or 6.02e23.' };
    const sign = p.negative ? '-' : '';
    const nrm = normalise(p);
    if (!nrm) return { scientific: '0 × 10⁰', eNotation: '0e+0', engineering: '0 × 10⁰', decimal: '0', exponent: 0, chart: magnitudeChart(0) };
    const { digits, e } = nrm;
    const trimmed = digits.replace(/0+$/, '') || '0';
    const m = mantissa(digits);
    // Engineering: exponent a multiple of 3, mantissa 1–999.
    const e3 = Math.floor(e / 3) * 3;
    const shift = e - e3;
    const engDigits = trimmed.padEnd(shift + 1, '0');
    const engM = engDigits.slice(0, shift + 1) + (engDigits.length > shift + 1 ? '.' + engDigits.slice(shift + 1) : '');
    const decimal = Math.abs(e) > 200 ? 'Too long to display' : digitsToDecimal(trimmed, e, p.negative);
    const steps = [
      `Significant digits: ${trimmed}`,
      `Move the decimal point so one non-zero digit is left of it: ${m}`,
      e === 0
        ? 'The point did not move, so the exponent is 0'
        : `The point moved ${Math.abs(e)} place${Math.abs(e) === 1 ? '' : 's'} to the ${e > 0 ? 'left' : 'right'}, so the exponent is ${e}`,
      `Result: ${sign}${m} × 10${sup(e)}`,
    ];
    if (shift) steps.push(`Engineering form: round the exponent down to a multiple of 3 (${e3}) and shift the point ${shift} place${shift > 1 ? 's' : ''} right → ${sign}${engM} × 10${sup(e3)}`);
    return {
      scientific: `${sign}${m} × 10${sup(e)}`,
      eNotation: `${sign}${m}e${e >= 0 ? '+' : ''}${e}`,
      engineering: `${sign}${engM} × 10${sup(e3)}`,
      decimal,
      exponent: e,
      chart: magnitudeChart(e),
      steps,
    };
  },
  content: {
    formula: ['N = a × 10ⁿ, where 1 ≤ |a| < 10 and n is an integer', 'Engineering: N = a × 10ⁿ, where n is a multiple of 3 and 1 ≤ |a| < 1000'],
    body: [
      'Scientific notation writes a number as a value between 1 and 10 multiplied by a power of ten. It is the standard way to handle very large or very small quantities: the mass of the Earth is about 5.97 × 10²⁴ kg, and a red blood cell is about 8 × 10⁻⁶ m across.',
      'To convert, slide the decimal point until exactly one non-zero digit sits in front of it. Count how many places you moved: moving left gives a positive exponent (big numbers), moving right gives a negative exponent (numbers smaller than 1).',
      'Engineering notation is a variant where the exponent is always a multiple of three, so it lines up with metric prefixes — 10³ is kilo, 10⁻⁶ is micro, 10⁹ is giga. E notation (like 4.56e-5) is how calculators and programming languages print the same thing.',
      'You can also go the other way: type something like 3.2e-4 or 3.2 × 10^-4 and read the plain decimal from the results. The digits are handled as text, so nothing is lost to rounding.',
    ],
    faq: [
      { q: 'What does a negative exponent mean?', a: 'It means the number is smaller than 1. 10⁻³ is 1/1000, so 4.5 × 10⁻³ = 0.0045.' },
      { q: 'Are trailing zeros kept?', a: 'In the scientific form shown here, trailing zeros are dropped. If those zeros are significant figures in your measurement, use the significant figures calculator to keep them, e.g. 4.5600 × 10⁻⁵.' },
      { q: 'How do I multiply numbers in scientific notation?', a: 'Multiply the front numbers and add the exponents: (2 × 10³) × (4 × 10⁵) = 8 × 10⁸. If the front number reaches 10 or more, shift it back and adjust the exponent.' },
    ],
  },
  related: ['significant-figures', 'exponent', 'log', 'rounding'],
  examples: [
    { values: { value: '123456789' }, expect: { scientific: '1.23456789 × 10⁸', engineering: '123.456789 × 10⁶', eNotation: '1.23456789e+8', exponent: 8 } },
    { values: { value: '0.000045600' }, expect: { scientific: '4.56 × 10⁻⁵', engineering: '45.6 × 10⁻⁶', decimal: '0.0000456' } },
    { values: { value: '-6.02 × 10^23' }, expect: { scientific: '-6.02 × 10²³', engineering: '-602 × 10²¹' } },
    { values: { value: '3.2e-4' }, expect: { decimal: '0.00032' } },
  ],
});
