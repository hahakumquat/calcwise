import { defineCalculator } from '../../lib/types';

const factorial = (n: number): bigint => {
  let r = 1n;
  for (let i = 2n; i <= BigInt(n); i++) r *= i;
  return r;
};

const trailingZeros = (n: number): number => {
  let z = 0;
  for (let k = 5; k <= n; k *= 5) z += Math.floor(n / k);
  return z;
};

const group = (s: string): string => s.replace(/\B(?=(\d{3})+(?!\d))/g, ',');

export default defineCalculator({
  slug: 'factorial-calculator',
  title: 'Factorial Calculator',
  category: 'math',
  description: 'Work out n! exactly for any whole number from 0 to 170: the full digits, how many digits it has, and how many zeros it ends with.',
  keywords: ['factorial calculator', 'n factorial', 'what is 10 factorial', 'trailing zeros in factorial', 'how many digits in factorial', '0 factorial'],
  inputs: [{ id: 'n', info: 'A whole number from 0 to 170. Above 170 the result no longer fits in a standard double-precision number.', label: 'n', type: 'number', default: 20, min: 0, max: 170, step: 1, help: 'A whole number, 0 to 170' }],
  outputs: [
    { id: 'result', info: 'n! = n × (n − 1) × … × 1. Shown in full up to 20 digits, otherwise in scientific notation.', label: 'n!', format: 'text', primary: true },
    { id: 'digits', info: 'How many digits n! has when written out.', label: 'Number of digits', format: 'integer' },
    { id: 'zeros', info: 'How many zeros n! ends with: floor(n/5) + floor(n/25) + floor(n/125) + …', label: 'Trailing zeros', format: 'integer' },
  ],
  compute: (v) => {
    const n = v.n as number | null;
    if (n === null || n === undefined) return { result: null, note: 'Enter a whole number from 0 to 170.' };
    if (!Number.isInteger(n) || n < 0) return { result: null, error: 'Use a whole number that is 0 or more.' };
    if (n > 170) return { result: null, error: 'n must be at most 170. 171! is about 1.24e309, which overflows a standard double-precision number (max about 1.8e308).' };
    const exact = factorial(n).toString();
    const digits = exact.length;
    const zeros = trailingZeros(n);
    const sci = `${exact[0]}.${exact.slice(1, 6).padEnd(5, '0')}e${digits - 1}`;
    const result = digits <= 20 ? group(exact) : sci;
    const terms: string[] = [];
    for (let k = 5; k <= n; k *= 5) terms.push(`floor(${n}/${k}) = ${Math.floor(n / k)}`);
    return {
      result,
      tone: 'good',
      badge: 'Exact',
      digits,
      zeros,
      chart: n < 2 ? undefined : {
        type: 'line',
        title: 'Digits in n! as n grows',
        x: Array.from({ length: n + 1 }, (_, i) => i),
        series: [{ name: 'Digits', values: Array.from({ length: n + 1 }, (_, i) => factorial(i).toString().length) }],
        xFormat: { format: 'integer' },
        yFormat: { format: 'integer' },
      },
      steps: [
        n < 2 ? `${n}! = 1 by definition.` : `${n}! = ${n} × ${n - 1} × … × 1`,
        digits <= 20 ? `Exact value: ${group(exact)}` : `Exact value (${digits} digits): ${exact}`,
        terms.length ? `Trailing zeros = ${terms.join(' + ')} = ${zeros}` : `Trailing zeros = 0, since n is below 5.`,
      ],
    };
  },
  content: {
    formula: ['n! = n × (n − 1) × (n − 2) × … × 2 × 1', '0! = 1', 'Trailing zeros = ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + …'],
    body: [
      'The factorial of a whole number n, written n!, is the product of every whole number from 1 up to n. So 5! = 5 × 4 × 3 × 2 × 1 = 120. Factorials count the ways to arrange n distinct things in a row, which is why they show up in permutations, combinations and probability.',
      'They grow extremely fast. 10! is 3,628,800, 20! already has 19 digits, and 100! has 158. This calculator uses exact whole-number arithmetic, so every digit is right. Results of up to 20 digits are shown in full; larger ones are shown in scientific notation, with the exact digits in the steps.',
      'The limit is 170 because 171! is about 1.24 × 10³⁰⁹, more than the largest standard double-precision number (about 1.8 × 10³⁰⁸), which is what most spreadsheets and programming languages use. Trailing zeros come from factors of 10, and every 10 needs a 2 and a 5. Twos are plentiful, so you just count the fives: ⌊n/5⌋ + ⌊n/25⌋ + ⌊n/125⌋ + …',
    ],
    faq: [
      { q: 'Why is 0! equal to 1?', a: 'By convention, and for good reason: there is exactly one way to arrange zero items (do nothing), and it keeps formulas like n! = n × (n − 1)! and the combinations formula working. The calculator returns 0! = 1.' },
      { q: 'How many zeros does 100! end with?', a: '24. ⌊100/5⌋ + ⌊100/25⌋ = 20 + 4 = 24, and 125 is already above 100. The calculator shows this under Trailing zeros, and also that 100! has 158 digits.' },
      { q: 'Why does the calculator stop at 170?', a: '171! is roughly 1.24e309, above the largest double-precision number (about 1.8e308), so many tools show it as infinity. 170! is about 7.26e306 and is the largest that fits.' },
      { q: 'Can I take the factorial of a negative number or a fraction?', a: 'Not with the plain definition. This calculator accepts whole numbers from 0 to 170 only. The gamma function extends factorials to non-integers, but that is a different calculation.' },
    ],
    sources: [
      { label: 'Wolfram MathWorld: Factorial', url: 'https://mathworld.wolfram.com/Factorial.html' },
      { label: 'Wikipedia: Factorial', url: 'https://en.wikipedia.org/wiki/Factorial' },
    ],
  },
  related: ['permutation-combination', 'prime-number-checker', 'sequence-calculator', 'scientific-notation'],
  examples: [
    // 10! = 3,628,800 (7 digits); floor(10/5)=2
    { values: { n: 10 }, expect: { result: '3,628,800', digits: 7, zeros: 2 } },
    { values: { n: 0 }, expect: { result: '1', digits: 1, zeros: 0 } },
    // 20! = 2,432,902,008,176,640,000; floor(20/5)=4
    { values: { n: 20 }, expect: { result: '2,432,902,008,176,640,000', digits: 19, zeros: 4 } },
    // 100!: 158 digits; floor(100/5)+floor(100/25)=20+4
    { values: { n: 100 }, expect: { result: '9.33262e157', digits: 158, zeros: 24 } },
  ],
});
