import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Exact arithmetic with BigInt so long decimals never lose digits.
const bgcd = (a: bigint, b: bigint): bigint => {
  a = a < 0n ? -a : a;
  b = b < 0n ? -b : b;
  while (b) [a, b] = [b, a % b];
  return a;
};
const babs = (a: bigint) => (a < 0n ? -a : a);

/** Closest fraction h/k to p/q (p, q > 0) with k <= max: continued-fraction convergents plus the best semiconvergent. */
function closest(p: bigint, q: bigint, max: bigint): [bigint, bigint] {
  let h0 = 0n, k0 = 1n, h1 = 1n, k1 = 0n;
  let n = p, d = q;
  while (d !== 0n) {
    const a = n / d;
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    if (k2 > max) {
      const t = (max - k0) / k1; // largest multiplier that keeps the denominator within the cap
      const ch = t * h1 + h0;
      const ck = t * k1 + k0;
      // compare |p/q - h1/k1| with |p/q - ch/ck| by cross-multiplying
      const e1 = babs(p * k1 - h1 * q) * ck;
      const e2 = babs(p * ck - ch * q) * k1;
      return e2 < e1 ? [ch, ck] : [h1, k1];
    }
    h0 = h1; k0 = k1; h1 = h2; k1 = k2;
    [n, d] = [d, n - a * d];
  }
  return [h1, k1];
}

export default defineCalculator({
  slug: 'decimal-to-fraction',
  title: 'Decimal to Fraction Calculator',
  category: 'math',
  description: 'Turn any decimal, including repeating decimals like 0.1666…, into a simplified fraction, mixed number and percent, with the steps shown.',
  metaDescription: 'Convert a decimal to a fraction in lowest terms. Handles repeating decimals like 0.333… and gives the mixed number, percent and the working.',
  updated: '2026-11-20',
  keywords: ['decimal to fraction', 'repeating decimal to fraction', 'convert decimal to fraction', 'decimal to mixed number', '0.75 as a fraction', 'recurring decimal'],
  inputs: [
    { id: 'decimal', label: 'Decimal', type: 'text', default: '0.75', placeholder: 'e.g. 0.75 or 2.5', info: 'The decimal number to convert, such as 0.75, 2.5 or -0.125. If part of it repeats forever, type only the part before the repeat here and put the repeating digits in the next box.' },
    { id: 'repeat', label: 'Repeating digits (optional)', type: 'text', optional: true, placeholder: 'e.g. 6', help: 'Digits that repeat forever after the decimal above', info: 'Digits that repeat forever, placed straight after the decimal you typed. For 0.1666… type 0.1 above and 6 here. For 0.333… type 0.333 above and 3 here (or 0 above and 3 here). Leave blank for an ordinary decimal.' },
    { id: 'maxDen', label: 'Max denominator', type: 'number', default: 1000, min: 1, max: 1000000, step: 1, info: 'The largest bottom number you will accept. An exact answer is always shown when it fits. If it does not, you get the closest fraction whose denominator is at most this value.' },
  ],
  outputs: [
    { id: 'result', label: 'Simplified fraction', format: 'text', primary: true, info: 'The decimal as a fraction in lowest terms (top and bottom share no common factor).' },
    { id: 'mixedNumber', label: 'Mixed number', format: 'text', info: 'The same value as a whole number plus a proper fraction, e.g. 2 1/2. Equal to the fraction itself when it is already below 1.' },
    { id: 'percent', label: 'Percent', format: 'percent', precision: 6, info: 'The value of the fraction written as a percentage (decimal × 100).' },
    { id: 'match', label: 'Exact or closest', format: 'text', info: 'Exact means the fraction equals your decimal. Closest fraction means the exact answer needed a bigger denominator than your limit, so this is the nearest fraction within it.' },
  ],
  compute: (v) => {
    const raw = String(v.decimal ?? '').trim().replace(/\s+/g, '');
    if (!raw) return { result: null };
    const m = /^([+\-−]?)(\d*)(?:\.(\d*))?$/.exec(raw);
    if (!m || (!m[2] && !m[3])) return { result: null, error: 'Enter a decimal such as 0.75, 2.5 or -0.125.' };
    const rep = String(v.repeat ?? '').trim().replace(/\s+/g, '');
    if (rep && !/^\d+$/.test(rep)) return { result: null, error: 'Repeating digits must be digits only, e.g. 6 or 142857.' };
    const maxN = num(v.maxDen);
    if (maxN === null || !Number.isInteger(maxN) || maxN < 1 || maxN > 1e6) return { result: null, error: 'Max denominator must be a whole number from 1 to 1,000,000.' };
    const intPart = m[2] || '0';
    const nonRep = m[3] ?? '';
    if (intPart.length + nonRep.length + rep.length > 40) return { result: null, error: 'That is too many digits. Use at most 40 in total.' };
    const neg = m[1] === '-' || m[1] === '−';
    const k = nonRep.length;
    const steps: string[] = [];
    const fr = (a: bigint, b: bigint) => (b === 1n ? `${a}` : `${a}/${b}`);

    let n: bigint;
    let d: bigint;
    if (rep) {
      const A = BigInt(intPart + nonRep);
      const B = BigInt(intPart + nonRep + rep);
      const shown = `${intPart}.${nonRep}(${rep})`;
      n = B - A;
      d = 10n ** BigInt(k) * (10n ** BigInt(rep.length) - 1n);
      steps.push(`Write ${shown} with the repeating block in brackets: ${k} digit${k === 1 ? '' : 's'} before it, ${rep.length} in it.`);
      steps.push(`Numerator: all digits (${B}) minus the digits before the repeat (${A}) = ${n}`);
      steps.push(`Denominator: 10^${k} × (10^${rep.length} − 1) = ${d}`);
    } else {
      n = BigInt(intPart + nonRep);
      d = 10n ** BigInt(k);
      steps.push(k ? `Write the ${k} decimal digit${k === 1 ? '' : 's'} over 10^${k}: ${intPart}.${nonRep} = ${n}/${d}` : `${intPart} is a whole number, so it is ${n}/1.`);
    }
    const g = bgcd(n, d);
    if (g > 1n) {
      steps.push(`Divide top and bottom by the greatest common factor ${g}: ${n}/${d} = ${fr(n / g, d / g)}`);
      n /= g;
      d /= g;
    } else steps.push(`${n}/${d} is already in lowest terms.`);

    const cap = BigInt(maxN);
    let exact = true;
    if (d > cap) {
      exact = false;
      const [h, kk] = closest(n, d, cap);
      steps.push(`The exact denominator ${d} is above your limit of ${maxN}, so the closest fraction with a denominator up to ${maxN} is ${fr(h, kk)}.`);
      n = h;
      d = kk;
    }
    const sg = neg && n !== 0n ? '-' : '';
    const whole = n / d;
    const rest = n % d;
    const result = `${sg}${fr(n, d)}`;
    const mixedNumber = rest === 0n || whole === 0n ? result : `${sg}${whole} ${rest}/${d}`;
    if (rest !== 0n && whole !== 0n) steps.push(`Mixed number: ${n} ÷ ${d} = ${whole} remainder ${rest}, so ${whole} ${rest}/${d}.`);
    const value = (neg ? -1 : 1) * (Number(n) / Number(d));
    // approximation error vs the typed decimal (non-repeating reading), only shown for closest fractions
    let matchText = 'Exact';
    if (!exact) {
      const approx = Number(`${intPart}.${nonRep || '0'}${(rep ? rep.repeat(Math.ceil(17 / rep.length)) : '')}`);
      const diff = Math.abs(Number(n) / Number(d) - approx);
      matchText = `Closest fraction (denominator up to ${maxN}), off by ${diff < 1e-12 ? '< 0.000000000001' : diff.toPrecision(2)}`;
    }
    const frac = rest === 0n ? null : Number(rest) / Number(d);
    return {
      result,
      mixedNumber,
      percent: value,
      match: matchText,
      tone: exact ? 'good' : 'ok',
      badge: exact ? 'Exact' : 'Closest fraction',
      chart: frac === null
        ? undefined
        : {
            type: 'donut',
            title: 'Fractional part of the value',
            slices: [
              { label: `${rest}/${d} filled`, value: Number(rest) },
              { label: 'Left to the next whole', value: Number(d - rest) },
            ],
            centerLabel: whole === 0n ? 'of one whole' : 'past the whole',
            centerValue: `${rest}/${d}`,
          },
      steps,
      note: `${raw}${rep ? `(${rep} repeating)` : ''} = ${result}${exact ? '' : ' (closest fraction)'}`,
    };
  },
  content: {
    formula: [
      'Terminating: 0.d₁d₂…dₖ = (digits as a whole number) / 10ᵏ, then divide top and bottom by their GCF',
      'Repeating: (all digits − non-repeating digits) / (10ᵏ × (10ᵐ − 1)), where k is the number of non-repeating decimal digits and m the length of the repeating block',
    ],
    body: [
      'A decimal that ends, like 0.75, is already a fraction in disguise: 0.75 is 75 hundredths, or 75/100. Count the digits after the point, put the digits over a 1 followed by that many zeros, then reduce by dividing top and bottom by their greatest common factor. 75/100 becomes 3/4.',
      'A repeating decimal needs a slightly different trick. For 0.1666… the 1 is the non-repeating part (k = 1 digit) and the 6 is the repeating block (m = 1 digit). Take all the digits (16) minus the non-repeating digits (1) to get 15, and divide by 10¹ × (10¹ − 1) = 90. That gives 15/90, which reduces to 1/6. In the calculator you type 0.1 in the Decimal box and 6 in the repeating box.',
      'Some decimals never end and never repeat in a pattern you can type, such as π ≈ 3.14159. For these the calculator uses continued fractions to find the closest fraction whose denominator is no bigger than your max denominator, and labels it as the closest fraction rather than an exact match. The same happens when an exact answer would need a denominator above your limit.',
      'To see where a fraction sits, the mixed number splits it into a whole part and a remainder (2.5 is 2 1/2), and the percent is simply the decimal times 100.',
    ],
    faq: [
      { q: 'How do I convert 0.75 to a fraction?', a: '0.75 is 75/100. The greatest common factor of 75 and 100 is 25, so dividing both by 25 gives 3/4.' },
      { q: 'How do I enter a repeating decimal like 0.333…?', a: 'Type 0.333 in the Decimal box and 3 in the repeating-digits box, since the repeating 3 continues straight after the digits you typed. The result is 1/3. For 0.1666…, type 0.1 and 6 to get 1/6.' },
      { q: 'What does "closest fraction" mean?', a: 'When the exact fraction would have a denominator larger than your max denominator, the calculator finds the nearest fraction that fits within it, using continued fractions. For 3.14159 with a limit of 100 it returns 311/99. The result card says "Closest fraction" so you know it is an approximation.' },
      { q: 'Is 0.999… equal to 1?', a: 'Yes. With 9 as the repeating digit, the formula gives 9/9, which is exactly 1.' },
      { q: 'Can I convert a negative decimal?', a: 'Yes. Put a minus sign in front, such as -0.125. The sign stays on the fraction, giving -1/8.' },
    ],
  },
  related: ['fraction', 'gcf-lcm', 'percentage'],
  examples: [
    // 0.75 = 75/100, gcd 25 -> 3/4
    { values: { decimal: '0.75', repeat: '', maxDen: 1000 }, expect: { result: '3/4', mixedNumber: '3/4', percent: 0.75 } },
    // 0.125 = 125/1000, gcd 125 -> 1/8
    { values: { decimal: '0.125', repeat: '', maxDen: 1000 }, expect: { result: '1/8', percent: 0.125 } },
    // 2.5 = 25/10 = 5/2 = 2 remainder 1 -> 2 1/2
    { values: { decimal: '2.5', repeat: '', maxDen: 1000 }, expect: { result: '5/2', mixedNumber: '2 1/2', percent: 2.5 } },
    // 0.333(3): all digits 3333 - 333 = 3000; 10^3 x 9 = 9000; 3000/9000 = 1/3
    { values: { decimal: '0.333', repeat: '3', maxDen: 1000 }, expect: { result: '1/3', match: 'Exact' } },
    // 0.1(6): 16 - 1 = 15; 10 x 9 = 90; 15/90 = 1/6
    { values: { decimal: '0.1', repeat: '6', maxDen: 1000 }, expect: { result: '1/6' } },
    // 3.14159 = 314159/100000 (too big for max 100). Convergent 22/7; best semiconvergent (14*22+3)/(14*7+1) = 311/99 is closer (error 0.00118 vs 0.00126)
    { values: { decimal: '3.14159', repeat: '', maxDen: 100 }, expect: { result: '311/99', mixedNumber: '3 14/99' } },
  ],
});
