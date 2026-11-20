import { defineCalculator } from '../../lib/types';

const SUP: Record<string, string> = { '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const sup = (n: number): string => String(n).replace(/\d/g, (d) => SUP[d]);
const group = (n: number): string => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ',');

const factorize = (n: number): Array<[number, number]> => {
  const out: Array<[number, number]> = [];
  let m = n;
  for (let p = 2; p * p <= m; p += p === 2 ? 1 : 2) {
    let e = 0;
    while (m % p === 0) { m /= p; e++; }
    if (e) out.push([p, e]);
  }
  if (m > 1) out.push([m, 1]);
  return out;
};

export default defineCalculator({
  slug: 'prime-factorization',
  title: 'Prime Factorization Calculator',
  category: 'math',
  description: 'Break any whole number up to 1 trillion into prime factors, then see how many divisors it has, their sum, and the full list of divisors.',
  keywords: ['prime factorization calculator', 'prime factors of a number', 'factor tree calculator', 'number of divisors', 'sum of divisors', 'list all factors of a number'],
  inputs: [{ id: 'n', info: 'A whole number from 2 to 1,000,000,000,000 (10^12).', label: 'Number', type: 'number', default: 360, min: 2, max: 1000000000000, step: 1, help: 'A whole number, 2 to 1 trillion' }],
  outputs: [
    { id: 'factors', info: 'The number written as a product of primes, with exponents for repeats.', label: 'Prime factorization', format: 'text', primary: true },
    { id: 'count', info: 'Divisor count = (e1 + 1) × (e2 + 1) × … over the exponents of the prime factorization.', label: 'Number of divisors', format: 'integer' },
    { id: 'sum', info: 'Sum of all positive divisors, including 1 and the number itself.', label: 'Sum of divisors', format: 'integer' },
    { id: 'divisors', info: 'Every positive divisor in increasing order (first 100 shown).', label: 'Divisors', format: 'text' },
  ],
  compute: (v) => {
    const n = v.n as number | null;
    if (n === null || n === undefined) return { factors: null, note: 'Enter a whole number from 2 to 1,000,000,000,000.' };
    if (!Number.isInteger(n) || n < 2) return { factors: null, error: 'Use a whole number that is 2 or more.' };
    if (n > 1e12) return { factors: null, error: 'The number must be at most 1,000,000,000,000.' };
    const f = factorize(n);
    let divs = [1];
    for (const [p, e] of f) {
      const next: number[] = [];
      for (const d of divs) for (let k = 0, pk = 1; k <= e; k++, pk *= p) next.push(d * pk);
      divs = next;
    }
    divs.sort((a, b) => a - b);
    const count = divs.length;
    const sum = divs.reduce((a, b) => a + b, 0);
    const isPrime = f.length === 1 && f[0][1] === 1;
    const product = f.map(([p, e]) => (e > 1 ? `${p}${sup(e)}` : String(p))).join(' × ');
    const expanded = f.flatMap(([p, e]) => Array(e).fill(p)).join(' × ');
    const shown = divs.slice(0, 100).map(group).join(', ') + (count > 100 ? ` … (${count - 100} more)` : '');
    return {
      factors: isPrime ? `${group(n)} (prime)` : product,
      tone: 'good',
      badge: isPrime ? 'Prime' : 'Composite',
      count,
      sum,
      divisors: shown,
      chart: {
        type: 'bar',
        title: 'How many times each prime divides the number',
        categories: f.map(([p]) => String(p)),
        series: [{ name: 'Exponent', values: f.map(([, e]) => e) }],
        format: { format: 'integer' },
      },
      steps: [
        isPrime ? `${group(n)} has no divisor between 2 and its square root, so it is prime.` : `${group(n)} = ${expanded}`,
        `Divisors = ${f.map(([, e]) => `(${e} + 1)`).join(' × ')} = ${count}`,
        `Sum of divisors = ${f.map(([p, e]) => `(${Array.from({ length: e + 1 }, (_, k) => p ** k).join(' + ')})`).join(' × ')} = ${group(sum)}`,
      ],
    };
  },
  content: {
    formula: ['n = p₁^e₁ × p₂^e₂ × … × pₖ^eₖ', 'Number of divisors = (e₁ + 1)(e₂ + 1)…(eₖ + 1)', 'Sum of divisors = Π (1 + p + p² + … + p^e)'],
    body: [
      'Every whole number above 1 is either prime or can be written as a product of primes in exactly one way (ignoring order). This is the fundamental theorem of arithmetic. For example 360 = 2 × 2 × 2 × 3 × 3 × 5, written 2³ × 3² × 5.',
      'The calculator finds the factors by trial division: it tries 2, then odd numbers, up to the square root of what is left. That is fast enough for any number up to 1 trillion, since the loop never needs to pass 1 million.',
      'Once you have the exponents, divisors are easy to count. Add 1 to each exponent and multiply: 360 has (3 + 1)(2 + 1)(1 + 1) = 24 divisors. The sum of divisors is the product of each prime power series, so for 360 it is (1 + 2 + 4 + 8)(1 + 3 + 9)(1 + 5) = 1,170. Useful for simplifying fractions, finding GCF and LCM, and number-theory homework.',
    ],
    faq: [
      { q: 'What is the prime factorization of 360?', a: '2³ × 3² × 5. That is 8 × 9 × 5 = 360. It has 24 divisors and they add up to 1,170.' },
      { q: 'Is 1 a prime number?', a: 'No. A prime has exactly two divisors, 1 and itself, and 1 has only one. That is also why the calculator starts at 2.' },
      { q: 'How do I know if my number is prime?', a: 'If the result shows a single prime factor with exponent 1, the number is prime. For example 97 is prime and has 2 divisors, 1 and 97, which sum to 98.' },
      { q: 'Why is the limit 1 trillion?', a: 'Trial division checks divisors up to the square root, about 1 million at the limit, which runs instantly in your browser. Larger numbers also stop being exactly representable as ordinary JavaScript numbers.' },
    ],
    sources: [
      { label: 'Wolfram MathWorld: Prime Factorization', url: 'https://mathworld.wolfram.com/PrimeFactorization.html' },
      { label: 'Wikipedia: Fundamental theorem of arithmetic', url: 'https://en.wikipedia.org/wiki/Fundamental_theorem_of_arithmetic' },
    ],
  },
  related: ['prime-number-checker', 'gcf-lcm', 'factorial-calculator', 'fraction'],
  examples: [
    // 2^3*3^2*5; (3+1)(2+1)(1+1)=24; (1+2+4+8)(1+3+9)(1+5)=15*13*6=1170
    { values: { n: 360 }, expect: { factors: '2³ × 3² × 5', count: 24, sum: 1170 } },
    // 2^2*3*7; 3*2*2=12; 7*4*8=224
    { values: { n: 84 }, expect: { factors: '2² × 3 × 7', count: 12, sum: 224 } },
    { values: { n: 97 }, expect: { factors: '97 (prime)', count: 2, sum: 98 } },
    // 7*11*13; 2*2*2=8; 8*12*14=1344
    { values: { n: 1001 }, expect: { factors: '7 × 11 × 13', count: 8, sum: 1344 } },
  ],
});
