import { defineCalculator } from '../../lib/types';
import { gcd, lcm } from '../../lib/math';
import { nums, primeFactors, factorString } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'gcf-lcm',
  title: 'GCF and LCM Calculator',
  category: 'math',
  description: 'Find the greatest common factor and least common multiple of two or more whole numbers, with prime factorizations.',
  keywords: ['greatest common factor', 'greatest common divisor', 'gcd', 'hcf', 'least common multiple', 'lowest common denominator', 'prime factorization'],
  inputs: [{ id: 'numbers', info: 'Two or more positive whole numbers, separated by commas or spaces.', label: 'Whole numbers', type: 'list', default: '12, 18, 30', placeholder: 'e.g. 12, 18, 30', help: 'Two or more positive integers' }],
  outputs: [
    { id: 'gcf', info: 'The largest number that divides evenly into every number in your list.', label: 'Greatest common factor (GCF)', format: 'integer', primary: true },
    { id: 'lcm', info: 'The smallest number that every number in your list divides into evenly.', label: 'Least common multiple (LCM)', format: 'integer' },
    { id: 'factorizations', info: 'Each number written as a product of prime numbers — the building blocks used to find the GCF and LCM.', label: 'Prime factorizations', format: 'text' },
  ],
  compute: (v) => {
    const xs = nums(v.numbers);
    if (xs.length < 2) return { gcf: null, note: 'Enter at least two numbers.' };
    if (!xs.every((x) => Number.isInteger(x) && x > 0)) return { gcf: null, error: 'Use positive whole numbers only.' };
    if (xs.some((x) => x > 1e12)) return { gcf: null, error: 'Numbers must be at most 1,000,000,000,000.' };
    const g = xs.reduce((a, b) => gcd(a, b));
    const l = xs.reduce((a, b) => lcm(a, b));
    const facs = xs.map((x) => primeFactors(x));
    const steps = xs.map((x, i) => `${x} = ${factorString(facs[i])}`);
    // Collect primes for the GCF/LCM explanation.
    const primes = [...new Set(facs.flatMap((f) => f.map(([p]) => p)))].sort((a, b) => a - b);
    const pow = (f: [number, number][], p: number) => f.find(([q]) => q === p)?.[1] ?? 0;
    const gParts: [number, number][] = primes.map((p): [number, number] => [p, Math.min(...facs.map((f) => pow(f, p)))]).filter(([, k]) => k > 0);
    const lParts: [number, number][] = primes.map((p): [number, number] => [p, Math.max(...facs.map((f) => pow(f, p)))]);
    steps.push(`GCF: take each prime the numbers share, with its smallest power → ${factorString(gParts)} = ${g}`);
    steps.push(`LCM: take every prime that appears, with its largest power → ${factorString(lParts)} = ${l}`);
    if (xs.length === 2) steps.push(`Check: GCF × LCM = ${g} × ${l} = ${g * l} = ${xs[0]} × ${xs[1]}`);
    return {
      gcf: g,
      lcm: Number.isSafeInteger(l) ? l : null,
      chart: {
        type: 'bar',
        title: 'Your numbers, their GCF and LCM',
        categories: [...xs.slice(0, 10).map(String), 'GCF', 'LCM'],
        series: [{ name: 'Value', values: [...xs.slice(0, 10), g, Number.isSafeInteger(l) ? l : 0] }],
        format: { format: 'integer' },
        highlight: Math.min(xs.length, 10),
      },
      factorizations: xs.map((x, i) => `${x} = ${factorString(facs[i])}`).join('; '),
      steps,
      note: g === 1 ? 'The numbers are coprime — they share no factor except 1.' : undefined,
    };
  },
  content: {
    formula: ['GCF = product of shared primes, each to its lowest power', 'LCM = product of all primes, each to its highest power', 'For two numbers: GCF(a, b) × LCM(a, b) = a × b'],
    body: [
      'The greatest common factor (GCF, also called the greatest common divisor or highest common factor) is the largest number that divides evenly into every number in the list. The least common multiple (LCM) is the smallest number that every number in the list divides into.',
      'Prime factorization makes both easy. Write each number as a product of primes. The GCF uses only the primes that all the numbers share, each raised to the smallest power that appears. The LCM uses every prime that appears anywhere, raised to the largest power.',
      'You will use the GCF to simplify fractions (divide top and bottom by it) and the LCM to add fractions (it is the least common denominator). Behind the scenes, this calculator uses Euclid’s algorithm, which finds the GCF by repeatedly replacing the larger number with the remainder of a division.',
    ],
    faq: [
      { q: 'What is the GCF of two prime numbers?', a: 'It is always 1, because primes have no factors other than 1 and themselves. Numbers whose GCF is 1 are called coprime or relatively prime.' },
      { q: 'How does Euclid’s algorithm work?', a: 'Divide the larger number by the smaller and keep the remainder. Then repeat with the smaller number and that remainder. When the remainder hits 0, the last non-zero remainder is the GCF. For 48 and 18: 48 mod 18 = 12, 18 mod 12 = 6, 12 mod 6 = 0, so the GCF is 6.' },
    ],
  },
  related: ['fraction', 'ratio', 'permutation-combination'],
  examples: [
    { values: { numbers: [12, 18, 30] }, expect: { gcf: 6, lcm: 180 } },
    { values: { numbers: [48, 18] }, expect: { gcf: 6, lcm: 144 } },
    { values: { numbers: [7, 13] }, expect: { gcf: 1, lcm: 91 } },
  ],
});
