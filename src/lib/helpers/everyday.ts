/** Shared helpers for everyday, grade, construction and conversion calculators. Pure, no dependencies. */
import type { ChartSpec, ComputeResult, Output, ScaleChart, Values } from '../types';
import { fromBase, getUnit, type UnitGroup } from '../units';
import { num } from '../math';

/* ---------- rounding ---------- */

/** Ceiling that ignores floating-point dust (220.00000000001 → 220, not 221). */
export const ceilSafe = (x: number) => Math.ceil(x - 1e-9);

/* ---------- dates (all UTC) ---------- */

export const daysInMonth = (y: number, m0: number) => new Date(Date.UTC(y, m0 + 1, 0)).getUTCDate();

export const isoDate = (d: Date) => d.toISOString().slice(0, 10);

/** Calendar difference a → b (a ≤ b) as whole years, months and days. */
export function ymdDiff(a: Date, b: Date): { years: number; months: number; days: number } {
  let years = b.getUTCFullYear() - a.getUTCFullYear();
  let months = b.getUTCMonth() - a.getUTCMonth();
  let days = b.getUTCDate() - a.getUTCDate();
  if (days < 0) {
    months--;
    // borrow the length of the month before b's month
    const pm = b.getUTCMonth() - 1;
    days += daysInMonth(pm < 0 ? b.getUTCFullYear() - 1 : b.getUTCFullYear(), (pm + 12) % 12);
  }
  if (months < 0) {
    years--;
    months += 12;
  }
  return { years, months, days };
}

/** Add whole months to a date, clamping to the end of the target month (Jan 31 + 1 month → Feb 28/29). */
export function addMonths(d: Date, months: number): Date {
  const total = d.getUTCMonth() + months;
  const y = d.getUTCFullYear() + Math.floor(total / 12);
  const m = ((total % 12) + 12) % 12;
  return new Date(Date.UTC(y, m, Math.min(d.getUTCDate(), daysInMonth(y, m))));
}

/** Number of Monday–Friday days among `count` consecutive days starting at `start`. */
export function countWeekdays(start: Date, count: number): number {
  const weeks = Math.floor(count / 7);
  let n = weeks * 5;
  const dow = start.getUTCDay();
  for (let i = 0; i < count % 7; i++) {
    const w = (dow + i) % 7;
    if (w !== 0 && w !== 6) n++;
  }
  return n;
}

export const plural = (n: number, word: string) => `${n} ${word}${n === 1 ? '' : 's'}`;

/* ---------- clock times ---------- */

/** Parse "17:45", "5:45 pm", "9am" → minutes after midnight, or null. */
export function parseClock(s: unknown): number | null {
  if (typeof s !== 'string') return null;
  const m = s.trim().match(/^(\d{1,2})(?:[:.](\d{2}))?\s*([ap])?\.?\s*m?\.?$/i);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  if (min > 59) return null;
  if (m[3]) {
    if (h < 1 || h > 12) return null;
    h = (h % 12) + (m[3].toLowerCase() === 'p' ? 12 : 0);
  } else if (h > 24 || (h === 24 && min > 0)) return null;
  return h * 60 + min;
}

/** 465 → "7 h 45 min". */
export function formatHM(minutes: number): string {
  const total = Math.round(minutes);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `${h} h ${m} min`;
}

/* ---------- grades ---------- */

/** Standard US 4.0-scale grade points. */
export const LETTER_POINTS: Record<string, number> = {
  'A+': 4.0, A: 4.0, 'A-': 3.7,
  'B+': 3.3, B: 3.0, 'B-': 2.7,
  'C+': 2.3, C: 2.0, 'C-': 1.7,
  'D+': 1.3, D: 1.0, 'D-': 0.7,
  F: 0,
};

/** Common US letter grade for a percentage (0–100), using 93/90/87… cut-offs. */
export function letterFromPercent(p: number): string {
  const cuts: [number, string][] = [
    [93, 'A'], [90, 'A-'], [87, 'B+'], [83, 'B'], [80, 'B-'],
    [77, 'C+'], [73, 'C'], [70, 'C-'], [67, 'D+'], [63, 'D'], [60, 'D-'],
  ];
  for (const [c, l] of cuts) if (p >= c - 1e-9) return l;
  return 'F';
}

/** Split a textarea into trimmed, non-empty lines with their 1-based line numbers. */
export function nonEmptyLines(s: unknown): { line: string; n: number }[] {
  if (typeof s !== 'string') return [];
  return s
    .split(/\r?\n/)
    .map((line, i) => ({ line: line.trim(), n: i + 1 }))
    .filter((x) => x.line && !x.line.startsWith('#'));
}

/** Letter-grade bands for a percent scale chart (fractions 0–1, plus an extra-credit band up to `max`). */
export function gradeBands(max = 1): ScaleChart['bands'] {
  const b: ScaleChart['bands'] = [
    { from: 0, to: 0.6, label: 'F', tone: 'bad' },
    { from: 0.6, to: 0.7, label: 'D', tone: 'warn' },
    { from: 0.7, to: 0.8, label: 'C', tone: 'ok' },
    { from: 0.8, to: 0.9, label: 'B', tone: 'good' },
    { from: 0.9, to: 1, label: 'A', tone: 'good' },
  ];
  if (max > 1) b.push({ from: 1, to: max, label: 'Over 100%', tone: 'neutral' });
  return b;
}

/* ---------- unit converters ---------- */

export interface ConvUnit {
  id: string;
  /** Full name used as the output label, e.g. "Meters". */
  name: string;
  /** Tooltip for the output. */
  info: string;
  precision?: number;
}

export interface ConverterOptions {
  /** Derived outputs (e.g. feet-and-inches text) from the base value. */
  extra?: (base: number) => ComputeResult;
  /** Units of similar magnitude to compare in a horizontal bar chart. */
  chartUnits?: string[];
  chartTitle?: string;
}

/**
 * Builds outputs + compute() for a one-input converter: every listed unit becomes its own output.
 * The chart compares the value in a few units of similar size, so the bars stay readable.
 */
export function makeConverter(
  group: UnitGroup,
  units: ConvUnit[],
  primary: string,
  opts: ConverterOptions = {},
): { outputs: Output[]; compute: (v: Values) => ComputeResult } {
  const outputs: Output[] = units.map((u) => ({
    id: u.id,
    label: u.name,
    format: 'number',
    precision: u.precision ?? 6,
    suffix: getUnit(group, u.id).label,
    info: u.info,
    ...(u.id === primary ? { primary: true } : {}),
  }));
  const compute = (v: Values): ComputeResult => {
    const x = num(v.value);
    if (x === null) return { [primary]: null };
    const r: ComputeResult = {};
    for (const u of units) r[u.id] = fromBase(group, u.id, x);
    const cu = opts.chartUnits ?? [];
    const chart: ChartSpec | undefined = cu.length
      ? {
          type: 'bar',
          title: opts.chartTitle ?? 'The same amount in similar-sized units',
          horizontal: true,
          categories: cu.map((id) => getUnit(group, id).label),
          series: [{ name: 'Value', values: cu.map((id) => fromBase(group, id, x)) }],
          format: { format: 'number' },
        }
      : undefined;
    return { ...r, ...(chart ? { chart } : {}), ...(opts.extra ? opts.extra(x) : {}) };
  };
  return { outputs, compute };
}
