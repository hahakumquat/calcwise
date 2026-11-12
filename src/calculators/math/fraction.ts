import { defineCalculator } from '../../lib/types';
import { num, gcd, lcm } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const frac = (n: number, d: number) => (d === 1 ? `${n}` : `${n}/${d}`);

function mixed(n: number, d: number): string {
  if (d === 1) return `${n}`;
  const whole = Math.trunc(n / d);
  const rest = Math.abs(n % d);
  if (whole === 0) return `${n}/${d}`;
  return `${whole} ${rest}/${d}`;
}

export default defineCalculator({
  slug: 'fraction',
  title: 'Fraction Calculator',
  category: 'math',
  description: 'Add, subtract, multiply or divide two fractions and get the simplified answer, mixed number and decimal.',
  keywords: ['adding fractions', 'subtracting fractions', 'multiplying fractions', 'dividing fractions', 'simplify fraction', 'mixed number'],
  popular: true,
  inputs: [
    { id: 'n1', info: 'The top number of the first fraction. Use a minus sign here for a negative fraction.', label: 'First numerator', type: 'number', default: 1, step: 1 },
    { id: 'd1', info: 'The bottom number of the first fraction — how many equal parts make a whole. It can’t be zero.', label: 'First denominator', type: 'number', default: 2, step: 1 },
    {
      id: 'op', info: 'The operation to perform: add, subtract, multiply or divide the two fractions.',
      label: 'Operation',
      type: 'select',
      default: 'add',
      segmented: true,
      options: [
        { value: 'add', label: '+' },
        { value: 'sub', label: '−' },
        { value: 'mul', label: '×' },
        { value: 'div', label: '÷' },
      ],
    },
    { id: 'n2', info: 'The top number of the second fraction.', label: 'Second numerator', type: 'number', default: 3, step: 1 },
    { id: 'd2', info: 'The bottom number of the second fraction. It can’t be zero.', label: 'Second denominator', type: 'number', default: 4, step: 1 },
  ],
  outputs: [
    { id: 'result', info: 'The answer as a fraction in lowest terms (top and bottom share no common factor).', label: 'Simplified result', format: 'text', primary: true },
    { id: 'mixedNumber', info: 'The answer written as a whole number plus a proper fraction, e.g. 1 1/4.', label: 'Mixed number', format: 'text' },
    { id: 'decimal', info: 'The answer as a decimal number (top divided by bottom).', label: 'Decimal', precision: 8 },
    { id: 'unsimplified', info: 'The fraction straight after the operation, before reducing it to lowest terms.', label: 'Before simplifying', format: 'text' },
  ],
  compute: (v) => {
    const a = num(v.n1);
    const b = num(v.d1);
    const c = num(v.n2);
    const d = num(v.d2);
    if (a === null || b === null || c === null || d === null) return { result: null };
    if (![a, b, c, d].every(Number.isInteger)) return { result: null, error: 'Enter whole numbers for every numerator and denominator.' };
    if (b === 0 || d === 0) return { result: null, error: 'A denominator can’t be zero.' };
    const sym = { add: '+', sub: '−', mul: '×', div: '÷' }[v.op as string] ?? '+';
    const steps: string[] = [];
    let n: number;
    let m: number;
    if (v.op === 'mul') {
      n = a * c;
      m = b * d;
      steps.push(`Multiply straight across: (${a} × ${c}) / (${b} × ${d}) = ${n}/${m}`);
    } else if (v.op === 'div') {
      if (c === 0) return { result: null, error: 'You can’t divide by a fraction equal to zero.' };
      n = a * d;
      m = b * c;
      steps.push(`Dividing is multiplying by the reciprocal: ${a}/${b} × ${d}/${c}`);
      steps.push(`= (${a} × ${d}) / (${b} × ${c}) = ${n}/${m}`);
    } else {
      const L = lcm(b, d);
      const ka = L / Math.abs(b);
      const kc = L / Math.abs(d);
      const A = a * ka * Math.sign(b);
      const C = c * kc * Math.sign(d);
      n = v.op === 'sub' ? A - C : A + C;
      m = L;
      steps.push(`Least common denominator of ${b} and ${d} is ${L}`);
      steps.push(`Rewrite: ${a}/${b} = ${A}/${L} and ${c}/${d} = ${C}/${L}`);
      steps.push(`${v.op === 'sub' ? 'Subtract' : 'Add'} the numerators: ${A} ${sym} ${C} = ${n}, so ${n}/${L}`);
    }
    if (m < 0) {
      n = -n;
      m = -m;
    }
    const unsimplified = `${n}/${m}`;
    const g = gcd(n, m) || 1;
    const sn = n / g;
    const sm = m / g;
    if (g > 1) steps.push(`Divide top and bottom by the greatest common factor ${g}: ${n}/${m} = ${frac(sn, sm)}`);
    else steps.push(`${n}/${m} is already in lowest terms`);
    const decimal = sn / sm;
    steps.push(`As a decimal: ${sn} ÷ ${sm} = ${fmt(decimal, 10)}`);
    return {
      result: frac(sn, sm),
      mixedNumber: mixed(sn, sm),
      decimal,
      unsimplified,
      chart: {
        type: 'bar',
        title: 'Decimal values',
        categories: [`${a}/${b}`, `${c}/${d}`, `= ${frac(sn, sm)}`],
        series: [{ name: 'Value', values: [a / b, c / d, decimal] }],
        highlight: 2,
      },
      steps,
      note: `${a}/${b} ${sym} ${c}/${d} = ${frac(sn, sm)}`,
    };
  },
  content: {
    formula: [
      'a/b + c/d = (a·d + c·b) / (b·d)   (or use the least common denominator)',
      'a/b − c/d = (a·d − c·b) / (b·d)',
      'a/b × c/d = (a·c) / (b·d)',
      'a/b ÷ c/d = (a·d) / (b·c)',
    ],
    body: [
      'To add or subtract fractions, they first need the same denominator. This calculator uses the least common denominator — the smallest number both denominators divide into — which keeps the numbers small. Once the bottoms match, you simply add or subtract the tops.',
      'Multiplying is easier: multiply the numerators together and the denominators together. To divide, flip the second fraction upside down (take its reciprocal) and multiply.',
      'Every answer is reduced to lowest terms by dividing the numerator and denominator by their greatest common factor. If the result is larger than 1, it is also shown as a mixed number — a whole number plus a proper fraction — which is how many textbooks expect final answers.',
    ],
    faq: [
      { q: 'How do I enter a mixed number like 2 1/3?', a: 'Convert it to an improper fraction first: multiply the whole number by the denominator and add the numerator. 2 1/3 becomes (2 × 3 + 1)/3 = 7/3.' },
      { q: 'How do I enter a negative fraction?', a: 'Put the minus sign on the numerator, for example −3 over 4. The calculator keeps the sign on the numerator in the answer.' },
      { q: 'Why do I flip the second fraction when dividing?', a: 'Dividing by a number is the same as multiplying by its reciprocal. Dividing by 3/4 asks “how many 3/4s fit?”, which equals multiplying by 4/3.' },
    ],
  },
  related: ['gcf-lcm', 'ratio', 'percentage', 'rounding'],
  examples: [
    { values: { n1: 1, d1: 2, op: 'add', n2: 3, d2: 4 }, expect: { result: '5/4', mixedNumber: '1 1/4', decimal: 1.25 } },
    { values: { n1: 2, d1: 3, op: 'div', n2: 4, d2: 9 }, expect: { result: '3/2', decimal: 1.5 } },
    { values: { n1: 1, d1: 6, op: 'sub', n2: 3, d2: 4 }, expect: { result: '-7/12', mixedNumber: '-7/12' } },
    { values: { n1: 4, d1: 6, op: 'mul', n2: 3, d2: 2 }, expect: { result: '1' } },
  ],
});
