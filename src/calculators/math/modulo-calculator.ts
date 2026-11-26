import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const MAX = 1e12;
const g = (n: number) => (Object.is(n, -0) ? 0 : n).toLocaleString('en-US').replace('-', '−');

export default defineCalculator({
  slug: 'modulo-calculator',
  title: 'Modulo Calculator (Mod and Remainder)',
  category: 'math',
  description: 'Find a mod n for any whole numbers, including negatives. See the floored modulo and the truncated remainder (JavaScript %) side by side.',
  keywords: ['modulo calculator', 'mod calculator', 'remainder calculator', 'a mod b', 'negative modulo', 'modulus calculator', 'floored modulo', 'javascript remainder operator'],
  updated: '2026-11-26',
  inputs: [
    { id: 'dividend', label: 'Number (a)', type: 'number', default: -7, step: 1, info: 'The number you want to take the modulo of. Any whole number from −1,000,000,000,000 to 1,000,000,000,000, negative numbers included.' },
    { id: 'divisor', label: 'Modulus (n)', type: 'number', default: 3, step: 1, info: 'The number you divide by. Any whole number except zero; it can be negative.' },
  ],
  outputs: [
    { id: 'result', label: 'a mod n (floored)', format: 'text', primary: true, info: 'The mathematical modulo, used by Python, Ruby and most maths texts. It has the same sign as the modulus, so with a positive modulus it is never negative.' },
    { id: 'floored', label: 'Floored modulo', format: 'integer', info: 'a − n × floor(a ÷ n). Same sign as the modulus.' },
    { id: 'truncated', label: 'Truncated remainder (a % n)', format: 'integer', info: 'a − n × trunc(a ÷ n). Same sign as the number a. This is what the % operator gives in JavaScript, Java, C and C++.' },
    { id: 'flooredQuotient', label: 'Floored quotient', format: 'integer', info: 'a ÷ n rounded down toward negative infinity. It pairs with the floored modulo.' },
    { id: 'truncatedQuotient', label: 'Truncated quotient', format: 'integer', info: 'a ÷ n with the fraction cut off, rounded toward zero. It pairs with the truncated remainder.' },
  ],
  compute: (v) => {
    const a = num(v.dividend), n = num(v.divisor);
    if (a === null || n === null) return { result: null, note: 'Enter a number and a modulus.' };
    if (!Number.isInteger(a) || !Number.isInteger(n)) return { result: null, error: 'Use whole numbers only.' };
    if (n === 0) return { result: null, error: 'The modulus cannot be zero. You cannot divide by zero.' };
    if (Math.abs(a) > MAX || Math.abs(n) > MAX) return { result: null, error: 'Numbers must be between −1,000,000,000,000 and 1,000,000,000,000.' };

    const t = (a % n) + 0; // truncated remainder, sign of a (+0 turns -0 into 0)
    const f = t !== 0 && (t < 0) !== (n < 0) ? t + n : t; // floored modulo, sign of n
    const fq = (a - f) / n + 0;
    const tq = (a - t) / n + 0;
    const same = f === t;

    const steps = [
      `Floored: ${g(a)} = ${g(fq)} × ${g(n)} + ${g(f)}, so ${g(a)} mod ${g(n)} = ${g(f)}`,
      `Truncated: ${g(a)} = ${g(tq)} × ${g(n)} + ${g(t)}, so ${g(a)} % ${g(n)} = ${g(t)}`,
      same ? 'Both rules agree here because the number and the modulus have the same sign (or the division is exact).' : 'The two rules differ because the number and the modulus have opposite signs and the division is not exact.',
    ];
    return {
      result: `${g(a)} mod ${g(n)} = ${g(f)}`,
      floored: f,
      truncated: t,
      flooredQuotient: fq,
      truncatedQuotient: tq,
      tone: 'ok',
      badge: f === 0 ? 'Divides evenly' : same ? 'Both rules agree' : 'Rules differ',
      note: same ? undefined : `Floored modulo is ${g(f)}, but the truncated remainder (a % n in JavaScript) is ${g(t)}.`,
      steps,
      chart: {
        type: 'bar',
        title: 'Floored modulo vs truncated remainder',
        categories: ['Floored mod', 'Truncated %'],
        series: [{ name: 'Value', values: [f, t] }],
        format: { format: 'integer' },
        highlight: 0,
      },
    };
  },
  content: {
    formula: ['floored: a mod n = a − n × floor(a ÷ n)', 'truncated: a % n = a − n × trunc(a ÷ n)', 'a = quotient × n + remainder'],
    body: [
      'The modulo operation gives the remainder left after dividing one whole number by another. 17 mod 5 = 2, because 5 fits into 17 three times (15) and 2 is left over. It is how clocks wrap around, how you test for even and odd numbers (n mod 2) and how many programs cycle through a list.',
      'With positive numbers every method agrees. With a negative number there are two common conventions. The floored modulo rounds the quotient down toward negative infinity, so its result takes the sign of the modulus. The truncated remainder cuts off the fraction, rounding the quotient toward zero, so its result takes the sign of the number a. For −7 and 3, the floored answer is 2 and the truncated answer is −1.',
      'Python, Ruby and most maths textbooks use the floored version for their mod operator. JavaScript, Java, C and C++ use the truncated version for %, which is why −7 % 3 gives −1 there. This calculator shows both, with the matching quotient, so you can pick the one your course or language uses. The calculator works with whole numbers only.',
    ],
    faq: [
      { q: 'What is −7 mod 3?', a: 'The floored (mathematical) modulo is 2, because −7 = −3 × 3 + 2. The truncated remainder, which is what −7 % 3 gives in JavaScript, is −1, because −7 = −2 × 3 + (−1).' },
      { q: 'What is 17 mod 5?', a: '17 mod 5 = 2, because 3 × 5 = 15 and 17 − 15 = 2. Both rules give 2 because both numbers are positive.' },
      { q: 'What is 7 mod −3?', a: 'The floored modulo is −2, because 7 = −3 × (−3) + (−2). The truncated remainder is 1, because 7 = −2 × (−3) + 1.' },
      { q: 'Why does JavaScript give a negative result for −7 % 3?', a: 'The % operator in JavaScript is a remainder, not a modulo: it truncates the quotient toward zero, so the result has the sign of the first number. To get the floored modulo, use ((a % n) + n) % n for a positive n.' },
      { q: 'What does it mean when a mod n is 0?', a: 'It means n divides a exactly, so a is a multiple of n. For example 12 mod 4 = 0.' },
    ],
    sources: [
      { label: 'MDN: Remainder (%) operator', url: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/Remainder' },
      { label: 'Wikipedia: Modulo', url: 'https://en.wikipedia.org/wiki/Modulo' },
    ],
  },
  related: ['long-division', 'gcf-lcm', 'prime-number-checker', 'factorial-calculator'],
  examples: [
    // −7 = −3×3 + 2 (floored); −7 = −2×3 + (−1) (truncated)
    { values: { dividend: -7, divisor: 3 }, expect: { floored: 2, truncated: -1, flooredQuotient: -3, truncatedQuotient: -2, result: '−7 mod 3 = 2' } },
    // 17 = 3×5 + 2
    { values: { dividend: 17, divisor: 5 }, expect: { floored: 2, truncated: 2, flooredQuotient: 3, truncatedQuotient: 3 } },
    // 7 = (−3)(−3) + (−2) = 9 − 2; 7 = (−2)(−3) + 1 = 6 + 1
    { values: { dividend: 7, divisor: -3 }, expect: { floored: -2, truncated: 1, flooredQuotient: -3, truncatedQuotient: -2 } },
    // −7 = 2×(−3) + (−1) = −6 − 1 (both rules agree)
    { values: { dividend: -7, divisor: -3 }, expect: { floored: -1, truncated: -1, flooredQuotient: 2, truncatedQuotient: 2 } },
    // 12 = 3×4 + 0
    { values: { dividend: 12, divisor: 4 }, expect: { floored: 0, truncated: 0, flooredQuotient: 3, truncatedQuotient: 3, result: '12 mod 4 = 0' } },
  ],
});
