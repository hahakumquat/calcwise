import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';

/** Uniform integer in [0, n) using crypto when available. */
function randInt(n: number): number {
  const c = (globalThis as { crypto?: Crypto }).crypto;
  if (c?.getRandomValues && n <= 2 ** 32) {
    const lim = Math.floor(2 ** 32 / n) * n; // rejection sampling removes modulo bias
    const buf = new Uint32Array(1);
    do c.getRandomValues(buf);
    while (buf[0] >= lim);
    return buf[0] % n;
  }
  return Math.floor(Math.random() * n);
}

/** One bar per number for small draws; a 10-bin histogram for larger ones. */
function drawChart(out: number[], lo: number, hi: number): ChartSpec {
  if (out.length <= 30)
    return {
      type: 'bar',
      title: 'Numbers drawn',
      categories: out.map((_, i) => `#${i + 1}`),
      series: [{ name: 'Value', values: out }],
      format: { format: 'integer' },
    };
  const bins = Math.min(10, hi - lo + 1);
  const width = (hi - lo + 1) / bins;
  const counts = new Array<number>(bins).fill(0);
  for (const x of out) counts[Math.min(bins - 1, Math.floor((x - lo) / width))]++;
  const cats = counts.map((_, i) => {
    const a = Math.ceil(lo + i * width);
    const b = Math.ceil(lo + (i + 1) * width) - 1;
    return a === b ? String(a) : `${a}–${b}`;
  });
  return { type: 'bar', title: 'How the draws are spread', categories: cats, series: [{ name: 'Count', values: counts }], format: { format: 'integer' } };
}

export default defineCalculator({
  slug: 'random-number',
  title: 'Random Number Generator',
  category: 'other',
  description: 'Generate one or more random whole numbers in a range, with or without repeats.',
  keywords: ['rng', 'random number', 'pick a number', 'number picker', 'raffle draw', 'dice', 'lottery numbers'],
  random: true,
  inputs: [
    { id: 'min', label: 'Minimum', type: 'number', default: 1, step: 1, info: 'The smallest number that can be drawn. It is included in the range.' },
    { id: 'max', label: 'Maximum', type: 'number', default: 100, step: 1, info: 'The largest number that can be drawn. It is included in the range.' },
    { id: 'count', label: 'How many numbers', type: 'number', default: 1, min: 1, max: 1000, step: 1, info: 'How many numbers to draw at once, up to 1,000.' },
    { id: 'unique', label: 'No repeats', type: 'toggle', default: true, info: 'On draws without replacement, like raffle tickets — each number appears at most once. Off allows repeats, like rolling dice.' },
    { id: 'sorted', label: 'Sort the results', type: 'toggle', default: false, info: 'List the drawn numbers from smallest to largest instead of in the order they were drawn.' },
  ],
  outputs: [
    { id: 'result', label: 'Random number(s)', format: 'text', primary: true, info: 'The numbers drawn, separated by commas. Press regenerate for a new draw.' },
    { id: 'n', label: 'Numbers drawn', format: 'integer', info: 'How many numbers were generated in this draw.' },
    { id: 'rangeSize', label: 'Possible values', format: 'integer', info: 'How many different whole numbers lie between the minimum and maximum, inclusive.' },
  ],
  compute: (v) => {
    const lo = num(v.min);
    const hi = num(v.max);
    const count = num(v.count);
    if (lo === null || hi === null || count === null) return { result: null };
    if (!Number.isInteger(lo) || !Number.isInteger(hi) || !Number.isInteger(count)) return { result: null, error: 'Use whole numbers for the range and the count.' };
    if (lo > hi) return { result: null, error: 'Minimum must not be greater than maximum.' };
    if (count < 1 || count > 1000) return { result: null, error: 'Draw between 1 and 1,000 numbers.' };
    const size = hi - lo + 1;
    if (!Number.isSafeInteger(size)) return { result: null, error: 'That range is too large.' };
    const unique = v.unique === 'on';
    if (unique && count > size) return { result: null, error: `Only ${size} different numbers exist between ${lo} and ${hi}.` };
    const out: number[] = [];
    if (unique) {
      const seen = new Set<number>();
      if (count > size / 2) {
        // dense draw: partial Fisher–Yates over the whole range
        const pool = Array.from({ length: size }, (_, i) => lo + i);
        for (let i = 0; i < count; i++) {
          const j = i + randInt(size - i);
          [pool[i], pool[j]] = [pool[j], pool[i]];
          out.push(pool[i]);
        }
      } else {
        while (out.length < count) {
          const x = lo + randInt(size);
          if (!seen.has(x)) {
            seen.add(x);
            out.push(x);
          }
        }
      }
    } else for (let i = 0; i < count; i++) out.push(lo + randInt(size));
    if (v.sorted === 'on') out.sort((a, b) => a - b);
    return { result: out.join(', '), n: out.length, rangeSize: size, chart: drawChart(out, lo, hi) };
  },
  content: {
    formula: ['x = min + ⌊U × (max − min + 1)⌋, U uniform on [0, 1)'],
    body: [
      'Each draw picks a whole number between the minimum and the maximum, both included, with every value equally likely. The page uses your browser’s cryptographic random source and rejects out-of-range values, so there is no bias toward small numbers.',
      'With “No repeats” on, numbers are drawn without replacement, like pulling raffle tickets from a hat — useful for picking winners, assigning seats or choosing lottery-style numbers. Turn it off to simulate independent events such as dice rolls, where the same value can come up again.',
      'Press regenerate for a fresh draw. Results are never stored or sent anywhere.',
    ],
    faq: [
      { q: 'How do I roll a die?', a: 'Set the minimum to 1, the maximum to 6 and turn “No repeats” off. Set “How many” to the number of dice.' },
      { q: 'Are the numbers truly random?', a: 'They come from the operating system’s cryptographically secure generator, which is unpredictable for all practical purposes, though not suitable for regulated lotteries that require certified hardware.' },
    ],
  },
  related: ['test-grade', 'percentage'],
  examples: [
    { values: { min: 1, max: 10, count: 5, unique: 'on', sorted: 'on' }, expect: { n: 5, rangeSize: 10 } },
    { values: { min: 7, max: 7, count: 3, unique: 'off', sorted: 'off' }, expect: { result: '7, 7, 7', n: 3 } },
    { values: { min: 1, max: 3, count: 3, unique: 'on', sorted: 'on' }, expect: { result: '1, 2, 3' } },
  ],
});
