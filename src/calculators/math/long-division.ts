import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const MAX = 1e12;
const group = (n: number) => n.toLocaleString('en-US');

/** Decimal expansion of a / b (a >= 0, b > 0) by long division, with repeating digits marked (…) and a 12-digit cap. */
function decimalExpansion(a: number, b: number): string {
  const whole = Math.floor(a / b);
  let r = a % b;
  if (r === 0) return String(whole);
  const digits: number[] = [];
  const seen = new Map<number, number>();
  while (r !== 0 && !seen.has(r) && digits.length < 12) {
    seen.set(r, digits.length);
    r *= 10;
    digits.push(Math.floor(r / b));
    r %= b;
  }
  if (r === 0) return `${whole}.${digits.join('')}`;
  if (seen.has(r)) {
    const at = seen.get(r)!;
    const block = digits.slice(at).join('');
    return `${whole}.${digits.slice(0, at).join('')}${block}… (${block} repeats)`;
  }
  return `${whole}.${digits.join('')}… (rounded)`;
}

export default defineCalculator({
  slug: 'long-division',
  title: 'Long Division Calculator with Remainder',
  category: 'math',
  description: 'Divide any whole numbers and get the quotient, remainder and decimal answer, with the long division steps and a check.',
  keywords: ['long division calculator', 'division with remainder', 'quotient and remainder calculator', 'long division steps', 'remainder calculator', 'divide with remainders'],
  updated: '2026-11-22',
  inputs: [
    { id: 'dividend', label: 'Dividend (number being divided)', type: 'number', default: 1000, min: 0, step: 1, info: 'The number you are dividing, the one that goes inside the division bracket. A whole number from 0 up to 1,000,000,000,000.' },
    { id: 'divisor', label: 'Divisor (number you divide by)', type: 'number', default: 7, min: 1, step: 1, info: 'The number you divide by. A positive whole number; it cannot be zero.' },
  ],
  outputs: [
    { id: 'result', label: 'Quotient and remainder', format: 'text', primary: true, info: 'How many whole times the divisor fits into the dividend, and what is left over (R).' },
    { id: 'quotient', label: 'Quotient', format: 'integer', info: 'The whole-number part of the answer.' },
    { id: 'remainder', label: 'Remainder', format: 'integer', info: 'What is left over after taking out as many whole copies of the divisor as possible. Always smaller than the divisor.' },
    { id: 'decimal', label: 'Decimal result', format: 'text', info: 'The same division written as a decimal. Repeating digits are marked, and long expansions stop at 12 decimal places.' },
    { id: 'check', label: 'Check', format: 'text', info: 'Quotient × divisor + remainder should equal the dividend.' },
  ],
  compute: (v) => {
    const a = num(v.dividend), b = num(v.divisor);
    if (a === null || b === null) return { result: null, note: 'Enter a dividend and a divisor.' };
    if (!Number.isInteger(a) || !Number.isInteger(b)) return { result: null, error: 'Use whole numbers only.' };
    if (b === 0) return { result: null, error: 'The divisor cannot be zero. You cannot divide by zero.' };
    if (a < 0 || b < 0) return { result: null, error: 'Use a dividend of 0 or more and a divisor above 0.' };
    if (a > MAX || b > MAX) return { result: null, error: 'Numbers must be at most 1,000,000,000,000.' };

    const q = Math.floor(a / b);
    const r = a - q * b;
    const dec = decimalExpansion(a, b);

    // Digit-by-digit long division steps.
    const steps: string[] = [];
    let rem = 0;
    let started = false;
    for (const ch of String(a)) {
      const cur = rem * 10 + Number(ch);
      const d = Math.floor(cur / b);
      if (!started && d === 0 && ch !== String(a).slice(-1)) { rem = cur; continue; }
      started = true;
      steps.push(`Bring down ${ch}: ${group(cur)} ÷ ${group(b)} = ${d}, ${group(d * b)} subtracted, ${group(cur - d * b)} left`);
      rem = cur - d * b;
    }
    steps.push(`Quotient ${group(q)}, remainder ${group(r)}`);
    steps.push(`Check: ${group(q)} × ${group(b)} + ${group(r)} = ${group(q * b + r)}`);

    const result = r === 0 ? `${group(q)} (divides evenly)` : `${group(q)} R ${group(r)}`;
    return {
      result,
      quotient: q,
      remainder: r,
      decimal: dec,
      check: `${group(q)} × ${group(b)} + ${group(r)} = ${group(q * b + r)}`,
      tone: 'ok',
      badge: r === 0 ? 'Divides evenly' : `Remainder ${group(r)}`,
      steps,
      chart: {
        type: 'bar',
        title: 'How the dividend splits up',
        categories: ['Dividend', 'Quotient × divisor', 'Remainder'],
        series: [{ name: 'Value', values: [a, q * b, r] }],
        format: { format: 'integer' },
        highlight: 2,
      },
    };
  },
  content: {
    formula: ['dividend = quotient × divisor + remainder', 'remainder is always less than the divisor', 'decimal result = dividend ÷ divisor'],
    body: [
      'Long division splits a division into small steps, one digit at a time. You take the first digits of the dividend, see how many times the divisor fits, write that digit in the quotient, subtract, bring down the next digit and repeat. What is left at the end is the remainder.',
      'The answer can be written two ways. With a remainder, 17 ÷ 5 = 3 R 2: five fits into 17 three times with 2 left over. As a decimal, the same division is 3.4, because the remainder 2 is two fifths, or 0.4. Some divisions never end as decimals. For example 1 ÷ 3 = 0.333…, and the calculator marks the repeating digits.',
      'Every answer can be checked by multiplying back: quotient × divisor + remainder must equal the dividend. The calculator shows this check, and a list of the digit-by-digit steps so you can compare them with your own working.',
    ],
    faq: [
      { q: 'What is 17 divided by 5 with a remainder?', a: '17 ÷ 5 = 3 R 2, because 3 × 5 = 15 and 17 − 15 = 2. As a decimal it is 3.4.' },
      { q: 'What is 1000 divided by 7?', a: '1000 ÷ 7 = 142 R 6, because 142 × 7 = 994 and 1000 − 994 = 6. As a decimal it is 142.857142… with the digits 857142 repeating.' },
      { q: 'What does it mean when the remainder is 0?', a: 'The divisor goes into the dividend exactly, so it is a factor of the dividend. For example 144 ÷ 12 = 12 R 0.' },
      { q: 'Why can I not divide by zero?', a: 'No number multiplied by 0 gives a non-zero dividend, so the division has no answer. The calculator asks for a divisor above 0.' },
      { q: 'Can the remainder be bigger than the divisor?', a: 'No. If it were, the divisor would fit one more time. The remainder is always from 0 up to one less than the divisor.' },
    ],
    sources: [
      { label: 'Khan Academy: Long division', url: 'https://www.khanacademy.org/math/arithmetic/arith-review-multiply-divide/arith-review-long-division/v/long-division-with-remainders' },
    ],
  },
  related: ['fraction', 'gcf-lcm', 'decimal-to-fraction', 'prime-factorization'],
  examples: [
    // 3 × 5 = 15; 17 − 15 = 2; 2/5 = 0.4
    { values: { dividend: 17, divisor: 5 }, expect: { quotient: 3, remainder: 2, result: '3 R 2', decimal: '3.4', check: '3 × 5 + 2 = 17' } },
    // 142 × 7 = 994; 1000 − 994 = 6; 6/7 = 0.857142 repeating
    { values: { dividend: 1000, divisor: 7 }, expect: { quotient: 142, remainder: 6, decimal: '142.857142… (857142 repeats)' } },
    // 12 × 12 = 144
    { values: { dividend: 144, divisor: 12 }, expect: { quotient: 12, remainder: 0, result: '12 (divides evenly)', decimal: '12' } },
    // 3 < 8 so quotient 0, remainder 3; 3/8 = 0.375
    { values: { dividend: 3, divisor: 8 }, expect: { quotient: 0, remainder: 3, decimal: '0.375' } },
  ],
});
