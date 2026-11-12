import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt, plotFn } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'exponent',
  title: 'Exponent Calculator',
  category: 'math',
  description: 'Raise any number to any power, including negative and fractional exponents.',
  keywords: ['power', 'powers', 'raise to the power', 'x to the y', 'antilog', 'negative exponent'],
  inputs: [
    { id: 'base', info: 'The number being multiplied by itself (a in aⁿ). It can be negative or a decimal.', label: 'Base (a)', type: 'number', default: 2 },
    { id: 'exp', info: 'How many times to use the base as a factor. Negative exponents mean reciprocals and fractions mean roots.', label: 'Exponent (n)', type: 'number', default: 10 },
  ],
  outputs: [
    { id: 'result', info: 'The value of the base raised to the exponent.', label: 'aⁿ', primary: true, precision: 10 },
    { id: 'sci', info: 'The same result in E notation, handy for very large or very small answers.', label: 'Scientific notation', format: 'text' },
  ],
  compute: (v) => {
    const a = num(v.base);
    const n = num(v.exp);
    if (a === null || n === null) return { result: null };
    if (a === 0 && n < 0) return { result: null, error: 'Zero raised to a negative power is undefined (it would mean dividing by zero).' };
    if (a < 0 && !Number.isInteger(n)) return { result: null, error: 'A negative base with a fractional exponent has no real-number answer.' };
    const result = a ** n;
    if (!Number.isFinite(result)) return { result: null, error: 'The result is too large to represent.' };
    const steps: string[] = [];
    if (Number.isInteger(n) && n > 0 && n <= 8) steps.push(`${fmt(a)}^${n} = ${Array(n).fill(fmt(a)).join(' × ')}`);
    else if (Number.isInteger(n) && n > 8) steps.push(`${fmt(a)}^${n} means ${n} factors of ${fmt(a)} multiplied together`);
    else if (Number.isInteger(n) && n < 0) steps.push(`A negative exponent means a reciprocal: ${fmt(a)}^${n} = 1 ÷ ${fmt(a)}^${-n} = 1 ÷ ${fmt(a ** -n)}`);
    else if (n === 0) steps.push('Any non-zero number to the power 0 equals 1');
    else if (!Number.isInteger(n)) steps.push(`A fractional exponent is a root: ${fmt(a)}^${fmt(n)} = e^(${fmt(n)} × ln ${fmt(a)})`);
    steps.push(`= ${fmt(result, 12)}`);
    // Plot x ↦ xⁿ around the base so the student sees where aⁿ sits on the curve.
    const span = Math.max(1, Math.abs(a) * 1.5);
    const lo = Number.isInteger(n) ? -span : 0;
    const chart = plotFn((t) => t ** n, lo, span, { name: `x^${fmt(n)}`, title: `y = x^${fmt(n)}`, xLabel: 'x', markers: [{ x: a, label: `${fmt(a)}^${fmt(n)} = ${fmt(result, 5)}` }] });
    return { result, chart, sci: result === 0 ? '0' : result.toExponential(6).replace(/\.?0+e/, 'e'), steps };
  },
  content: {
    formula: ['aⁿ = a × a × … × a  (n times)', 'a⁻ⁿ = 1 ÷ aⁿ', 'a^(1/n) = ⁿ√a,  a^(m/n) = (ⁿ√a)ᵐ', 'a⁰ = 1  (a ≠ 0)'],
    body: [
      'An exponent tells you how many times to multiply the base by itself: 2¹⁰ means ten 2s multiplied together, which is 1024. Exponents are shorthand for repeated multiplication, just as multiplication is shorthand for repeated addition.',
      'Negative exponents flip the number into a fraction, so 2⁻³ = 1/8 = 0.125. Fractional exponents are roots: 9^0.5 is the square root of 9, and 8^(1/3) is the cube root of 8.',
      'The key rules: when you multiply powers with the same base, add the exponents (aᵐ·aⁿ = aᵐ⁺ⁿ); when you divide, subtract them; and a power of a power multiplies them ((aᵐ)ⁿ = aᵐⁿ).',
    ],
    faq: [
      { q: 'Why is anything to the power 0 equal to 1?', a: 'Follow the pattern: 2³ = 8, 2² = 4, 2¹ = 2 — each step divides by 2. One more step gives 2⁰ = 1. It also keeps the rule aᵐ ÷ aᵐ = aᵐ⁻ᵐ = a⁰ = 1 consistent.' },
      { q: 'Is −2² equal to 4 or −4?', a: 'By convention −2² = −(2²) = −4, because exponents are applied before the minus sign. To square negative two, write (−2)² = 4. Here, entering −2 as the base squares the whole −2.' },
    ],
  },
  related: ['log', 'square-root', 'scientific-notation'],
  examples: [
    { values: { base: 2, exp: 10 }, expect: { result: 1024 } },
    { values: { base: 2, exp: -3 }, expect: { result: 0.125 } },
    { values: { base: 27, exp: 1 / 3 }, expect: { result: 3 }, tolerance: 1e-12 },
    { values: { base: -2, exp: 3 }, expect: { result: -8 } },
  ],
});
