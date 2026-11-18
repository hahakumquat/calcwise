import { defineCalculator } from '../../lib/types';
import { primeFactors, factorString } from '../../lib/helpers/math-extra';

const isPrime = (n: number): boolean => {
  if (n < 2) return false;
  if (n % 2 === 0) return n === 2;
  for (let p = 3; p * p <= n; p += 2) if (n % p === 0) return false;
  return true;
};

export default defineCalculator({
  slug: 'prime-number-checker',
  title: 'Prime Number Checker',
  category: 'math',
  description: 'Check if a number is prime, see its prime factorization, how many divisors it has, their sum, and the next prime after it.',
  keywords: ['is it prime', 'prime number checker', 'prime factorization', 'number of divisors', 'next prime', 'composite number'],
  inputs: [{ id: 'n', info: 'A whole number from 2 up to 1,000,000,000,000.', label: 'Number', type: 'number', default: 360, min: 0, step: 1, help: 'A whole number, 2 or more' }],
  outputs: [
    { id: 'verdict', info: 'Whether the number is prime (only divisible by 1 and itself) or composite.', label: 'Prime or composite?', format: 'text', primary: true },
    { id: 'factorization', info: 'The number written as a product of primes.', label: 'Prime factorization', format: 'text' },
    { id: 'divisorCount', info: 'How many whole numbers divide it evenly, including 1 and itself.', label: 'Number of divisors', format: 'integer' },
    { id: 'divisorSum', info: 'The sum of all its divisors, including 1 and itself.', label: 'Sum of divisors', format: 'integer' },
    { id: 'nextPrime', info: 'The smallest prime strictly greater than your number.', label: 'Next prime', format: 'integer' },
  ],
  compute: (v) => {
    const n = v.n as number | null;
    if (n === null || n === undefined) return { verdict: null, note: 'Enter a whole number.' };
    if (!Number.isInteger(n) || n < 2) return { verdict: null, error: 'Use a whole number that is 2 or more.' };
    if (n > 1e12) return { verdict: null, error: 'Number must be at most 1,000,000,000,000.' };
    const f = primeFactors(n);
    const prime = f.length === 1 && f[0][1] === 1;
    const count = f.reduce((a, [, k]) => a * (k + 1), 1);
    const sum = f.reduce((a, [p, k]) => a * ((p ** (k + 1) - 1) / (p - 1)), 1);
    let next = n + 1;
    while (!isPrime(next)) next++;
    return {
      verdict: prime ? `${n} is prime` : `${n} is composite`,
      factorization: prime ? `${n} (prime)` : factorString(f),
      divisorCount: count,
      divisorSum: sum,
      nextPrime: next,
      chart: {
        type: 'bar',
        title: 'How many times each prime divides it',
        categories: f.map(([p]) => String(p)),
        series: [{ name: 'Power', values: f.map(([, k]) => k) }],
        format: { format: 'integer' },
      },
      steps: [
        `Divide out primes from smallest up: ${n} = ${factorString(f)}`,
        `Divisors: multiply (power + 1) for each prime = ${f.map(([, k]) => k + 1).join(' × ')} = ${count}`,
        `The next prime after ${n} is ${next}.`,
      ],
    };
  },
  content: {
    formula: ['n = p₁^a × p₂^b × …', 'Number of divisors = (a + 1)(b + 1)…', 'Sum of divisors = ∏ (p^(a+1) − 1) / (p − 1)'],
    body: [
      'A prime number is a whole number greater than 1 whose only divisors are 1 and itself. Every other whole number above 1 is composite, and can be written in exactly one way as a product of primes (the fundamental theorem of arithmetic).',
      'This calculator divides out primes from the smallest upward, stopping once the prime being tried is larger than the square root of what is left. If nothing divides it, what remains is prime. That is trial division: simple, exact, and fast for numbers up to a trillion.',
      'Once you know the factorization, the divisor count and sum follow directly. For 360 = 2³ × 3² × 5 there are 4 × 3 × 2 = 24 divisors, and they add up to 15 × 13 × 6 = 1,170.',
    ],
    faq: [
      { q: 'Is 1 a prime number?', a: 'No. Primes must have exactly two divisors, and 1 has only one. Excluding 1 keeps prime factorizations unique. The calculator starts at 2.' },
      { q: 'Is 2 prime?', a: 'Yes, and it is the only even prime, since every other even number is divisible by 2.' },
      { q: 'How can I tell by hand if a number is divisible by 3?', a: 'Add its digits. If the digit sum is divisible by 3, so is the number. For 91 the digit sum is 10, so it is not divisible by 3 (but 91 = 7 × 13 is still composite).' },
    ],
  },
  related: ['gcf-lcm', 'fraction', 'square-root'],
  examples: [
    { values: { n: 360 }, expect: { divisorCount: 24, divisorSum: 1170, nextPrime: 367 } },
    { values: { n: 97 }, expect: { divisorCount: 2, divisorSum: 98, nextPrime: 101 } },
    { values: { n: 91 }, expect: { divisorCount: 4, divisorSum: 112, nextPrime: 97 } },
  ],
});
