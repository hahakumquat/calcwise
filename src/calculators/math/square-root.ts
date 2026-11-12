import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt, plotFn } from '../../lib/helpers/math-extra';

/** Write ⁿ√x (integer x) as k·ⁿ√r with the largest possible k. */
function simplifyRadical(x: number, n: number): { k: number; r: number } {
  let k = 1;
  let r = x;
  for (let f = 2; f ** n <= r; f++) {
    while (r % f ** n === 0) {
      r /= f ** n;
      k *= f;
    }
  }
  return { k, r };
}

const rootSym = (n: number) => (n === 2 ? '√' : n === 3 ? '∛' : n === 4 ? '∜' : `${n}√`);

export default defineCalculator({
  slug: 'square-root',
  title: 'Square Root Calculator',
  category: 'math',
  description: 'Find the square root, cube root or any nth root of a number, with the simplified radical form.',
  keywords: ['square root', 'cube root', 'nth root', 'radical', 'simplify square root', 'sqrt'],
  inputs: [
    { id: 'x', info: 'The number you want the root of (the radicand).', label: 'Number (x)', type: 'number', default: 72 },
    { id: 'n', info: 'Which root: 2 for a square root, 3 for a cube root, and so on.', label: 'Root (n)', type: 'number', default: 2, min: 2, step: 1, help: '2 = square root, 3 = cube root…' },
  ],
  outputs: [
    { id: 'root', info: 'The number that, raised to the power n, gives x.', label: 'Root', primary: true, precision: 10 },
    { id: 'radical', info: 'The exact answer in simplest radical form, like 6√2, for whole-number inputs.', label: 'Simplified radical', format: 'text' },
    { id: 'perfect', info: 'Whether x is a perfect square (or cube, …), meaning its root is a whole number.', label: 'Perfect power?', format: 'text' },
  ],
  compute: (v) => {
    const x = num(v.x);
    const n = num(v.n);
    if (x === null || n === null) return { root: null };
    if (!Number.isInteger(n) || n < 2) return { root: null, error: 'The root index must be a whole number of 2 or more.' };
    const sym = rootSym(n);
    if (x < 0 && n % 2 === 0) {
      const im = Math.abs(x) ** (1 / n);
      return {
        root: null,
        error:
          n === 2
            ? `The square root of a negative number isn’t a real number. In complex numbers, √(${fmt(x)}) = ${fmt(im)}i.`
            : `An even root of a negative number isn’t a real number.`,
      };
    }
    let root = Math.sign(x) * Math.abs(x) ** (1 / n);
    const rr = Math.round(root);
    if (rr ** n === x) root = rr;
    const steps = [`${sym}${fmt(x)} is the number that, raised to the power ${n}, gives ${fmt(x)}`];
    let radical: string | null = null;
    let perfect = 'No';
    if (Number.isInteger(x) && Math.abs(x) <= 1e12) {
      const { k, r } = simplifyRadical(Math.abs(x), n);
      const s = x < 0 ? '-' : '';
      if (r === 1) {
        radical = `${s}${k}`;
        perfect = `Yes — ${s}${k}^${n} = ${fmt(x)}`;
        steps.push(`${fmt(x)} = ${s}${k}^${n}, so the root is exactly ${s}${k}`);
      } else if (k > 1) {
        radical = `${s}${k}${sym}${r}`;
        steps.push(`Pull out the largest perfect ${n === 2 ? 'square' : n === 3 ? 'cube' : `${n}th power`}: ${fmt(Math.abs(x))} = ${k ** n} × ${r}`);
        steps.push(`${sym}${fmt(Math.abs(x))} = ${sym}${k ** n} × ${sym}${r} = ${k}${sym}${r}`);
      } else {
        radical = `${s}${sym}${r}`;
        steps.push(`${fmt(Math.abs(x))} has no perfect-${n === 2 ? 'square' : 'power'} factor, so ${sym}${fmt(Math.abs(x))} can’t be simplified`);
      }
    }
    steps.push(`Decimal value ≈ ${fmt(root, 12)}`);
    steps.push(`Check: ${fmt(root, 10)}^${n} ≈ ${fmt(root ** n, 10)}`);
    const span = Math.max(1, Math.abs(x) * 1.5);
    const chart = plotFn((t) => Math.sign(t) * Math.abs(t) ** (1 / n), n % 2 ? -span : 0, span, {
      name: `${sym}x`,
      title: `y = ${sym}x`,
      xLabel: 'x',
      markers: [{ x, label: `${sym}${fmt(x)} ≈ ${fmt(root, 5)}` }],
    });
    return { root, radical, perfect, chart, steps };
  },
  content: {
    formula: ['ⁿ√x = x^(1/n)', '√(a·b) = √a · √b   (used to simplify radicals)'],
    body: [
      'The square root of x is the number that multiplies by itself to give x: √49 = 7 because 7 × 7 = 49. A cube root works with three copies (∛27 = 3) and an nth root with n copies.',
      'Most square roots are irrational — their decimals never end or repeat — so teachers often want the simplified radical form instead. To simplify √72, find the largest perfect square that divides 72, which is 36. Then √72 = √36 × √2 = 6√2.',
      'Odd roots of negative numbers are fine (∛−8 = −2), but even roots of negative numbers have no real answer, because any real number raised to an even power is non-negative. Those roots live in the complex numbers, written with i = √−1.',
    ],
    faq: [
      { q: 'Does a square root have two answers?', a: 'The equation x² = 49 has two solutions, 7 and −7. The symbol √49 means the principal (non-negative) root only, which is 7.' },
      { q: 'How can I estimate a square root by hand?', a: 'Find the perfect squares on either side. √50 is between √49 = 7 and √64 = 8, and much closer to 7, so it’s a bit over 7 (actually 7.071).' },
    ],
  },
  related: ['exponent', 'pythagorean-theorem', 'log', 'quadratic'],
  examples: [
    { values: { x: 72, n: 2 }, expect: { radical: '6√2', root: 8.485281374 }, tolerance: 1e-9 },
    { values: { x: 144, n: 2 }, expect: { root: 12, radical: '12' } },
    { values: { x: -27, n: 3 }, expect: { root: -3, radical: '-3' } },
    { values: { x: 54, n: 3 }, expect: { radical: '3∛2' } },
  ],
});
