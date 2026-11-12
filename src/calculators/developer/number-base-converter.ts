import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { str } from '../../lib/helpers/text';

const DIGITS = '0123456789abcdefghijklmnopqrstuvwxyz';
const NAMES: Record<number, string> = { 2: 'binary', 8: 'octal', 10: 'decimal', 16: 'hexadecimal' };

function parseBig(s: string, base: number): bigint | null {
  const b = BigInt(base);
  let n = BigInt(0);
  for (const ch of s.toLowerCase()) {
    const d = DIGITS.indexOf(ch);
    if (d < 0 || d >= base) return null;
    n = n * b + BigInt(d);
  }
  return n;
}

function toBase(n: bigint, base: number): string {
  if (base === 10) return n.toString();
  return n.toString(base); // BigInt supports radix 2–36
}

export default defineCalculator({
  slug: 'number-base-converter',
  title: 'Number Base Converter',
  category: 'developer',
  description: 'Convert numbers between binary, octal, decimal and hexadecimal (or any base from 2 to 36), with no size limit.',
  keywords: ['binary to decimal', 'decimal to binary', 'hex to decimal', 'decimal to hex', 'binary converter', 'hex converter', 'radix'],
  layout: 'wide',
  inputs: [
    { id: 'value', info: 'The whole number to convert. Prefixes 0x, 0b and 0o set the base automatically; any size works.', label: 'Number', type: 'text', default: '0xFF_EE', placeholder: 'e.g. 255, 0xff, 0b1010, 0o17', help: 'Prefixes 0x, 0b and 0o are recognised; spaces and underscores are ignored.' },
    {
      id: 'from', info: 'Which base the number above is written in. Auto assumes decimal unless there is a 0x, 0b or 0o prefix.',
      label: 'Input base',
      type: 'select',
      default: 'auto',
      options: [
        { value: 'auto', label: 'Auto (decimal unless prefixed)' },
        { value: '2', label: 'Binary (2)' },
        { value: '8', label: 'Octal (8)' },
        { value: '10', label: 'Decimal (10)' },
        { value: '16', label: 'Hexadecimal (16)' },
        { value: 'custom', label: 'Custom base below' },
      ],
    },
    { id: 'base', info: 'Any base from 2 to 36 (digits 0–9 then A–Z). Used as the input base for Custom, and always shown as an extra result.', label: 'Custom base', type: 'number', default: 36, min: 2, max: 36, step: 1, optional: true, help: 'Used as the input base when "Custom" is chosen, and always shown as an extra output.' },
  ],
  outputs: [
    { id: 'decimal', info: 'The value in everyday base 10.', label: 'Decimal', format: 'code', primary: true },
    { id: 'hex', info: 'Base 16, using 0–9 and A–F. Each hex digit is exactly four bits.', label: 'Hexadecimal', format: 'code' },
    { id: 'binary', info: 'Base 2 — the ones and zeros a computer stores.', label: 'Binary', format: 'code' },
    { id: 'octal', info: 'Base 8, still seen in Unix file permissions like 755.', label: 'Octal', format: 'code' },
    { id: 'custom', info: 'The value written in the custom base you chose (base 36 if left blank).', label: 'Custom base', format: 'code' },
    { id: 'bits', info: 'The minimum number of bits needed to store the value as an unsigned integer.', label: 'Bits needed', format: 'integer' },
  ],
  compute: (v) => {
    let s = str(v.value).replace(/[\s_,']/g, '');
    if (!s) return { decimal: null, error: 'Enter a number.' };
    let neg = false;
    if (s[0] === '-' || s[0] === '+') {
      neg = s[0] === '-';
      s = s.slice(1);
    }
    const custom = num(v.base);
    const from = str(v.from) || 'auto';
    let base: number;
    const prefix = s.match(/^0([xbo])/i);
    if (from === 'custom') {
      if (custom === null || !Number.isInteger(custom) || custom < 2 || custom > 36) return { decimal: null, error: 'The custom base must be a whole number from 2 to 36.' };
      base = custom;
    } else if (from === 'auto') base = prefix ? { x: 16, b: 2, o: 8 }[prefix[1].toLowerCase() as 'x' | 'b' | 'o'] : 10;
    else base = Number(from);
    if (prefix && ({ x: 16, b: 2, o: 8 } as Record<string, number>)[prefix[1].toLowerCase()] === base) s = s.slice(2);
    if (!s) return { decimal: null, error: 'Enter digits after the prefix.' };
    const n = parseBig(s, base);
    if (n === null) {
      const allowed = DIGITS.slice(0, base).toUpperCase();
      return { decimal: null, error: `"${str(v.value).trim()}" is not a valid ${NAMES[base] ?? `base-${base}`} number. Allowed digits: ${base <= 10 ? allowed : `0–9 and A–${allowed.slice(-1)}`}.` };
    }
    const sign = neg && n !== BigInt(0) ? '-' : '';
    const outBase = custom !== null && Number.isInteger(custom) && custom >= 2 && custom <= 36 ? custom : 36;
    return {
      decimal: sign + toBase(n, 10),
      hex: sign + toBase(n, 16).toUpperCase(),
      binary: sign + toBase(n, 2),
      octal: sign + toBase(n, 8),
      custom: `${sign}${toBase(n, outBase).toUpperCase()} (base ${outBase})`,
      bits: n === BigInt(0) ? 1 : n.toString(2).length,
      note: `Read as ${NAMES[base] ?? `base ${base}`}`,
    };
  },
  content: {
    formula: ['value = Σ digitᵢ × baseⁱ (i counted from the right, starting at 0)'],
    body: [
      'A number base says how many distinct digits are used before you carry to the next position. Decimal uses ten (0–9), binary two (0 and 1), octal eight (0–7) and hexadecimal sixteen (0–9 then A–F). The value is the same; only the way it is written changes. For example 255 in decimal is 11111111 in binary and FF in hex.',
      'Programmers use hex because each hex digit maps to exactly four bits, so a byte is always two hex digits — handy for colors (#FF8800), memory addresses and byte dumps. Octal survives mainly in Unix file permissions such as 755. Bases above 16 continue with letters up to Z for base 36, which is sometimes used for short IDs.',
      'Conversions use arbitrary-precision integers (BigInt), so 64-bit, 128-bit and even longer values convert exactly with no rounding. Negative numbers are shown with a minus sign rather than in two\'s complement. Everything is calculated in your browser.',
    ],
    faq: [
      { q: 'How do I convert binary to decimal by hand?', a: 'Multiply each bit by its place value (1, 2, 4, 8, … from the right) and add them up. 1011 = 8 + 0 + 2 + 1 = 11.' },
      { q: 'Why does "Bits needed" matter?', a: 'It tells you the smallest integer type that can hold the value: up to 8 bits fits a byte, 32 bits an int32, 64 bits an int64 (unsigned). Signed types need one more bit.' },
      { q: 'Does it handle fractions?', a: 'No — only whole numbers. Fractional parts often have no exact representation in another base (0.1 in decimal repeats forever in binary).' },
    ],
  },
  related: ['color-converter', 'hash-generator', 'scientific-notation'],
  examples: [
    { values: { value: '255', from: 'auto', base: 36 }, expect: { decimal: '255', hex: 'FF', binary: '11111111', octal: '377', custom: '73 (base 36)', bits: 8 } },
    { values: { value: '0xFF_EE', from: 'auto', base: 36 }, expect: { decimal: '65518', binary: '1111111111101110' } },
    { values: { value: '18446744073709551615', from: '10', base: 36 }, expect: { hex: 'FFFFFFFFFFFFFFFF', bits: 64 } },
    { values: { value: '-1010', from: '2', base: 36 }, expect: { decimal: '-10', hex: '-A' } },
    { values: { value: 'ZZ', from: 'custom', base: 36 }, expect: { decimal: '1295' } },
    { values: { value: '129', from: '8', base: 36 }, expect: { error: '"129" is not a valid octal number. Allowed digits: 01234567.' } },
  ],
});
