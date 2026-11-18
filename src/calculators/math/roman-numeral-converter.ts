import { defineCalculator } from '../../lib/types';

const PAIRS: [number, string][] = [
  [1000, 'M'], [900, 'CM'], [500, 'D'], [400, 'CD'], [100, 'C'], [90, 'XC'],
  [50, 'L'], [40, 'XL'], [10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I'],
];
const VAL: Record<string, number> = { I: 1, V: 5, X: 10, L: 50, C: 100, D: 500, M: 1000 };

function toRoman(n: number): string {
  let out = '';
  for (const [v, s] of PAIRS) {
    while (n >= v) {
      out += s;
      n -= v;
    }
  }
  return out;
}

function fromRoman(s: string): number | null {
  if (!/^[IVXLCDM]+$/.test(s)) return null;
  let total = 0;
  for (let i = 0; i < s.length; i++) {
    const a = VAL[s[i]];
    const b = i + 1 < s.length ? VAL[s[i + 1]] : 0;
    total += a < b ? -a : a;
  }
  // Accept only the standard form, so "IIII" or "VX" are rejected.
  return total >= 1 && total <= 3999 && toRoman(total) === s ? total : null;
}

export default defineCalculator({
  slug: 'roman-numeral-converter',
  title: 'Roman Numeral Converter',
  category: 'math',
  description: 'Convert numbers to Roman numerals and Roman numerals back to numbers, from 1 to 3999, with the working shown step by step.',
  keywords: ['roman numeral converter', 'roman numerals', 'number to roman numerals', 'roman numeral to number', 'roman numeral chart', 'year in roman numerals'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'mode', label: 'Convert', type: 'select', segmented: true, info: 'Choose which direction to convert.', default: 'toRoman', options: [{ value: 'toRoman', label: 'Number → Roman' }, { value: 'toNumber', label: 'Roman → Number' }] },
    { id: 'value', label: 'Value', type: 'text', default: '2026', placeholder: 'e.g. 2026 or MMXXVI', info: 'A whole number from 1 to 3999, or a Roman numeral such as MMXXVI.' },
  ],
  outputs: [
    { id: 'result', label: 'Result', format: 'text', primary: true, info: 'The converted value.' },
    { id: 'number', label: 'As a number', format: 'number', precision: 0, info: 'The value in ordinary digits.' },
    { id: 'roman', label: 'As Roman numerals', format: 'text', info: 'The value in standard Roman numerals.' },
  ],
  compute: (v) => {
    const raw = String(v.value ?? '').trim();
    if (!raw) return { result: null };
    let n: number | null;
    if (v.mode === 'toNumber') {
      n = fromRoman(raw.toUpperCase());
      if (n === null) return { result: null, error: 'Enter a valid Roman numeral using I, V, X, L, C, D and M, in standard form (for example 4 is IV, not IIII).' };
    } else {
      if (!/^\d+$/.test(raw)) return { result: null, error: 'Enter a whole number from 1 to 3999.' };
      n = Number(raw);
      if (n < 1 || n > 3999) return { result: null, error: 'Roman numerals in standard form cover 1 to 3999.' };
    }
    const roman = toRoman(n);
    const steps: string[] = [];
    const cats: string[] = [];
    const amts: number[] = [];
    let rest = n;
    for (const [val, sym] of PAIRS) {
      let count = 0;
      while (rest >= val) {
        rest -= val;
        count++;
      }
      if (count) {
        cats.push(sym.repeat(count));
        amts.push(val * count);
      }
      if (count) steps.push(`${val} → ${sym.repeat(count)}${count > 1 ? ` (${count} × ${val})` : ''}`);
    }
    return {
      result: v.mode === 'toNumber' ? String(n) : roman,
      number: n,
      roman,
      steps,
      chart: { type: 'bar', title: 'What each part of the numeral is worth', categories: cats, series: [{ name: 'Value', values: amts }], format: { format: 'number' } },
      note: `${n} is ${roman} in Roman numerals.`,
    };
  },
  content: {
    formula: ['Symbols: I = 1, V = 5, X = 10, L = 50, C = 100, D = 500, M = 1000', 'Write the largest symbol that fits, subtract it, repeat. A smaller symbol before a larger one is subtracted (IV = 4, IX = 9, XL = 40, XC = 90, CD = 400, CM = 900).'],
    body: [
      'Roman numerals write numbers with seven letters. To convert a number, take the largest value that fits, write its symbol, subtract it and repeat. 2026 is 2000 (MM) + 20 (XX) + 6 (VI), so MMXXVI.',
      'Reading goes the other way: add the symbols left to right, but when a smaller symbol sits directly before a larger one, subtract it. In MCMXCIV, CM is 900, XC is 90 and IV is 4, which gives 1994.',
      'This converter uses the standard form, where the subtractive pairs are only IV, IX, XL, XC, CD and CM, and no symbol repeats more than three times. That form covers 1 to 3999. Classical Roman numerals had no zero and no fractions in this system.',
      'Roman numerals still appear on clock faces, book chapters, film copyright years, monarchs and event numbers such as Super Bowls.',
    ],
    faq: [
      { q: 'What is 2026 in Roman numerals?', a: 'MMXXVI: MM is 2000, XX is 20 and VI is 6.' },
      { q: 'Why does the converter stop at 3999?', a: 'The standard form allows at most three M in a row, so the largest number is MMMCMXCIX = 3999. Larger numbers used a bar over a symbol to multiply it by 1000, which this tool does not handle.' },
      { q: 'Is IIII a valid Roman numeral?', a: 'Standard form writes 4 as IV. IIII does appear on some clock faces, but this converter rejects it so every number has exactly one answer.' },
      { q: 'Is there a Roman numeral for zero?', a: 'No. The Roman system had no symbol for zero, so the converter starts at 1.' },
    ],
    sources: [
      { label: 'Roman numerals (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Roman_numerals' },
      { label: 'Roman numerals (Britannica)', url: 'https://www.britannica.com/topic/Roman-numeral' },
    ],
  },
  related: ['number-base-converter', 'scientific-notation', 'rounding', 'sequence-calculator'],
  examples: [
    { values: { mode: 'toRoman', value: '2026' }, expect: { result: 'MMXXVI', number: 2026 } },
    { values: { mode: 'toRoman', value: '1994' }, expect: { result: 'MCMXCIV', number: 1994 } },
    { values: { mode: 'toNumber', value: 'MCMXCIV' }, expect: { result: '1994', roman: 'MCMXCIV' } },
    { values: { mode: 'toRoman', value: '3999' }, expect: { result: 'MMMCMXCIX' } },
  ],
});
