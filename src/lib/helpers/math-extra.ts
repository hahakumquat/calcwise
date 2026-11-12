/** Extra helpers shared by the math and statistics calculators. Pure, dependency-free. */
import { normalInv } from '../math';
import type { BarChart, LineChart } from '../types';

/** Format a number compactly for worked steps (up to `sig` significant digits, no trailing zeros). */
export function fmt(x: number, sig = 8): string {
  if (!Number.isFinite(x)) return String(x);
  if (x === 0) return '0';
  const a = Math.abs(x);
  if (a >= 1e15 || a < 1e-7) return x.toExponential(Math.max(0, sig - 3)).replace(/\.?0+e/, 'e');
  return String(Number(x.toPrecision(sig)));
}

/** List input → finite numbers only. */
export const nums = (v: unknown): number[] => (Array.isArray(v) ? v.filter((x): x is number => typeof x === 'number' && Number.isFinite(x)) : []);

/** Text input → trimmed string. */
export const str = (v: unknown): string => (typeof v === 'string' ? v.trim() : '');

/** Two-sided critical z for a confidence level given as a fraction (0.95 → 1.959964). */
export const zCritical = (conf: number) => normalInv(1 - (1 - conf) / 2);

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
/** Integer → superscript string, e.g. -4 → ⁻⁴. */
export const sup = (n: number) => String(n).split('').map((c) => SUP[c] ?? c).join('');

/** A number typed as text, split into exact decimal parts (no floating-point loss). */
export interface DecimalParts {
  negative: boolean;
  intPart: string;
  fracPart: string;
  hasPoint: boolean;
  exp: number;
}

/**
 * Parse "1,234.50", "-0.0042", "6.02e23", "6.02 × 10^23", "6.02x10^23" or "6.02*10^-3".
 * Returns null if the text isn't a plain decimal number.
 */
export function parseDecimal(text: string): DecimalParts | null {
  let s = text.trim().replace(/[\s,_]/g, '').replace(/[−–]/g, '-');
  s = s.replace(/(?:[×x*·]10\^?|[×x*·]10(?=[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]))/i, 'e');
  // superscript exponents
  s = s.replace(/[⁻⁰¹²³⁴⁵⁶⁷⁸⁹]/g, (c) => {
    const i = '⁰¹²³⁴⁵⁶⁷⁸⁹'.indexOf(c);
    return i >= 0 ? String(i) : '-';
  });
  s = s.replace(/e\(([+-]?\d+)\)$/i, 'e$1');
  const m = /^([+-]?)(\d*)(\.?)(\d*)(?:e([+-]?\d+))?$/i.exec(s);
  if (!m) return null;
  const [, sign, intPart, point, fracPart, e] = m;
  if (!intPart && !fracPart) return null;
  const exp = e ? parseInt(e, 10) : 0;
  if (Math.abs(exp) > 10000) return null;
  return { negative: sign === '-', intPart, fracPart, hasPoint: point === '.', exp };
}

/**
 * Normalised significant digits of a parsed decimal: `digits` starts at the first non-zero digit
 * (keeping any trailing zeros as typed), `e` is the power of ten of that first digit.
 * Returns null for zero.
 */
export function normalise(p: DecimalParts): { digits: string; e: number } | null {
  const all = p.intPart + p.fracPart;
  const k = all.search(/[1-9]/);
  if (k < 0) return null;
  return { digits: all.slice(k), e: p.intPart.length - k - 1 + p.exp };
}

/** Round a digit string to n digits (half up). Returns new digits (length n) and exponent shift (0 or 1). */
export function roundDigits(digits: string, n: number): { digits: string; carry: number } {
  if (digits.length <= n) return { digits: digits.padEnd(n, '0'), carry: 0 };
  const d = digits.slice(0, n).split('').map(Number);
  if (Number(digits[n]) >= 5) {
    let i = n - 1;
    while (i >= 0) {
      if (d[i] === 9) {
        d[i] = 0;
        i--;
      } else {
        d[i]++;
        break;
      }
    }
    if (i < 0) return { digits: ('1' + d.join('')).slice(0, n), carry: 1 };
  }
  return { digits: d.join(''), carry: 0 };
}

/** Write significant digits with leading-digit exponent e as a plain decimal string. */
export function digitsToDecimal(digits: string, e: number, negative = false): string {
  let out: string;
  if (e >= digits.length - 1) out = digits + '0'.repeat(e - digits.length + 1);
  else if (e >= 0) out = digits.slice(0, e + 1) + '.' + digits.slice(e + 1);
  else out = '0.' + '0'.repeat(-e - 1) + digits;
  return (negative ? '-' : '') + out;
}

/** Mantissa string "d.ddd" from significant digits (optionally trimming trailing zeros). */
export function mantissa(digits: string, trim = true): string {
  const d = trim ? digits.replace(/0+$/, '') || '0' : digits;
  return d.length > 1 ? `${d[0]}.${d.slice(1)}` : d;
}

/** Prime factorisation of a positive integer, e.g. 360 → [[2,3],[3,2],[5,1]]. */
export function primeFactors(n: number): [number, number][] {
  const out: [number, number][] = [];
  let x = Math.abs(Math.round(n));
  for (let p = 2; p * p <= x; p++) {
    let k = 0;
    while (x % p === 0) {
      x /= p;
      k++;
    }
    if (k) out.push([p, k]);
  }
  if (x > 1) out.push([x, 1]);
  return out;
}

/** "2³ × 3² × 5" */
export const factorString = (f: [number, number][]) => (f.length ? f.map(([p, k]) => (k > 1 ? `${p}${sup(k)}` : `${p}`)).join(' × ') : '1');

/* ───────── chart helpers ───────── */

/** Sample y = f(x) on [lo, hi] as a line chart (non-finite values become gaps). */
export function plotFn(
  f: (x: number) => number,
  lo: number,
  hi: number,
  opts: { name: string; title?: string; xLabel?: string; yLabel?: string; markers?: { x: number; label: string }[] },
  n = 80,
): LineChart {
  const x: number[] = [];
  const y: (number | null)[] = [];
  for (let i = 0; i <= n; i++) {
    const t = Number((lo + ((hi - lo) * i) / n).toPrecision(8));
    const v = f(t);
    x.push(t);
    y.push(Number.isFinite(v) ? v : null);
  }
  return { type: 'line', title: opts.title, x, xLabel: opts.xLabel, yLabel: opts.yLabel, series: [{ name: opts.name, values: y }], markers: opts.markers };
}

/** Frequency histogram of a data list. Small sets of whole numbers get one bar per value. */
export function histogram(xs: number[], title: string, highlightValue?: number): BarChart {
  const sorted = [...xs].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const distinct = [...new Set(sorted)];
  if (distinct.length <= 12 && distinct.every(Number.isInteger) && max - min <= 20) {
    const cats: number[] = [];
    for (let v = min; v <= max; v++) cats.push(v);
    const hl = highlightValue === undefined ? undefined : cats.findIndex((c) => Math.abs(c - highlightValue) < 0.5);
    return {
      type: 'bar',
      title,
      categories: cats.map(String),
      series: [{ name: 'Count', values: cats.map((c) => sorted.filter((x) => x === c).length) }],
      format: { format: 'integer' },
      highlight: hl !== undefined && hl >= 0 ? hl : undefined,
    };
  }
  const bins = Math.max(1, Math.min(12, Math.ceil(Math.sqrt(xs.length))));
  const width = (max - min) / bins || 1;
  const counts = new Array(bins).fill(0);
  for (const x of xs) counts[Math.min(bins - 1, Math.floor((x - min) / width))]++;
  const cats = counts.map((_, i) => `${fmt(min + i * width, 4)}–${fmt(min + (i + 1) * width, 4)}`);
  const hl = highlightValue === undefined ? undefined : Math.min(bins - 1, Math.max(0, Math.floor((highlightValue - min) / width)));
  return { type: 'bar', title, categories: cats, series: [{ name: 'Count', values: counts }], format: { format: 'integer' }, highlight: hl };
}
