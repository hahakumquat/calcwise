import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt, plotFn } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'log',
  title: 'Logarithm Calculator',
  category: 'math',
  description: 'Calculate the logarithm of a number in any base, plus the natural log (ln), log₁₀ and log₂.',
  keywords: ['logarithm', 'natural log', 'ln', 'log base 10', 'log base 2', 'common log', 'antilog'],
  popular: true,
  inputs: [
    { id: 'x', info: 'The number you are taking the logarithm of. It must be greater than zero.', label: 'Number (x)', type: 'number', default: 1000, help: 'Must be greater than 0' },
    {
      id: 'baseType', info: 'The base of the logarithm: 10 (common log), e (natural log, ln), 2 (binary log), or another base you choose.',
      label: 'Base',
      type: 'select',
      default: '10',
      segmented: true,
      options: [
        { value: '10', label: '10' },
        { value: 'e', label: 'e' },
        { value: '2', label: '2' },
        { value: 'custom', label: 'Other' },
      ],
    },
    { id: 'base', info: 'Your own base b for log_b(x). It must be positive and not equal to 1.', label: 'Custom base (b)', type: 'number', default: 3, help: 'Must be positive and not 1.', showWhen: { input: 'baseType', is: 'custom' } },
  ],
  outputs: [
    { id: 'result', info: 'The power you must raise the base to in order to get x.', label: 'Logarithm', primary: true, precision: 10 },
    { id: 'ln', info: 'The natural logarithm, which uses base e ≈ 2.71828.', label: 'Natural log ln(x)', precision: 10 },
    { id: 'log10', info: 'The common logarithm, base 10 — roughly the number of digits minus one for whole numbers.', label: 'Common log log₁₀(x)', precision: 10 },
    { id: 'log2', info: 'The binary logarithm, base 2 — how many times you can halve x to get down to 1.', label: 'Binary log log₂(x)', precision: 10 },
  ],
  compute: (v) => {
    const x = num(v.x);
    if (x === null) return { result: null };
    if (x <= 0) return { result: null, error: 'Logarithms are only defined for positive numbers (x > 0).' };
    const t = v.baseType as string;
    const b = t === 'e' ? Math.E : t === '10' ? 10 : t === '2' ? 2 : num(v.base);
    if (b === null) return { result: null };
    if (b <= 0 || b === 1) return { result: null, error: 'The base must be positive and not equal to 1.' };
    const ln = Math.log(x);
    const log10 = Math.log10(x);
    const log2 = Math.log2(x);
    let result = t === 'e' ? ln : t === '10' ? log10 : t === '2' ? log2 : ln / Math.log(b);
    // Clean up exact powers (e.g. log₃ 81 = 4, not 3.9999999999999996).
    const r = Math.round(result);
    if (Math.abs(result - r) < 1e-12 && Math.abs(b ** r - x) <= 1e-12 * x) result = r;
    const bName = t === 'e' ? 'e' : fmt(b);
    return {
      result,
      ln,
      log10,
      log2,
      chart: plotFn((t) => Math.log(t) / Math.log(b), x / 50, x * 2, {
        name: `log_${bName}(x)`,
        title: `y = log_${bName}(x)`,
        xLabel: 'x',
        markers: [{ x, label: `log = ${fmt(result, 5)}` }],
      }),
      steps: [
        `log_${bName}(${fmt(x)}) asks: ${bName} to what power equals ${fmt(x)}?`,
        `Change of base: log_${bName}(${fmt(x)}) = ln(${fmt(x)}) ÷ ln(${bName}) = ${fmt(ln, 10)} ÷ ${fmt(Math.log(b), 10)}`,
        `= ${fmt(result, 12)}`,
        `Check: ${bName}^${fmt(result, 10)} = ${fmt(b ** result, 10)}`,
      ],
    };
  },
  content: {
    formula: ['log_b(x) = y  ⇔  bʸ = x', 'log_b(x) = ln(x) ÷ ln(b)   (change of base)', 'ln(x) = log_e(x),  e ≈ 2.718281828'],
    body: [
      'A logarithm answers the question “what power do I raise the base to, to get this number?” Because 10³ = 1000, log₁₀(1000) = 3. Logarithms undo exponents in the same way subtraction undoes addition.',
      'Three bases come up constantly. Base 10 (the common log) is used for orders of magnitude, pH and decibels. Base e ≈ 2.71828 (the natural log, ln) appears in growth, decay and calculus. Base 2 is used in computing and information theory.',
      'Any other base can be computed with the change-of-base formula: divide the natural log of the number by the natural log of the base. That is exactly what this calculator does, and the steps show the division so you can repeat it on a basic scientific calculator.',
    ],
    faq: [
      { q: 'Why can’t I take the log of zero or a negative number?', a: 'A positive base raised to any real power is always positive, so no real exponent can produce 0 or a negative number. Those logs are undefined in the real numbers.' },
      { q: 'What are the main log rules?', a: 'log(ab) = log a + log b, log(a/b) = log a − log b, and log(aⁿ) = n·log a. They hold in every base.' },
      { q: 'What is an antilog?', a: 'The antilog reverses a logarithm: the antilog of y in base b is bʸ. Use the exponent calculator to compute it.' },
    ],
  },
  related: ['exponent', 'scientific-notation', 'square-root'],
  examples: [
    { values: { x: 1000, baseType: '10', base: null }, expect: { result: 3 } },
    { values: { x: 8, baseType: '2', base: null }, expect: { result: 3 } },
    { values: { x: 81, baseType: 'custom', base: 3 }, expect: { result: 4 } },
    { values: { x: 100, baseType: 'e', base: null }, expect: { result: 4.605170186, ln: 4.605170186 }, tolerance: 1e-9 },
  ],
});
