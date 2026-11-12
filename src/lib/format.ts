import type { Output } from './types';
import { fromBase, getUnit, defaultUnitFor } from './units';

const nf = (opts: Intl.NumberFormatOptions) => new Intl.NumberFormat('en-US', opts);

/** Formats a plain number: grouping, trimmed decimals, scientific notation for extremes. */
export function formatNumber(x: number, precision = 4): string {
  if (!Number.isFinite(x)) return x > 0 ? '∞' : x < 0 ? '−∞' : '—';
  const ax = Math.abs(x);
  if (ax !== 0 && (ax >= 1e15 || ax < 1e-6)) {
    const [m, e] = x.toExponential(Math.min(precision, 6)).split('e');
    return `${String(+m)} × 10${superscript(e.replace('+', ''))}`;
  }
  return nf({ maximumFractionDigits: precision }).format(x).replace('-', '−');
}

const SUP: Record<string, string> = { '-': '⁻', '0': '⁰', '1': '¹', '2': '²', '3': '³', '4': '⁴', '5': '⁵', '6': '⁶', '7': '⁷', '8': '⁸', '9': '⁹' };
const superscript = (s: string) => [...s].map((c) => SUP[c] ?? c).join('');

/** Returns { value, unitLabel } for display. `unitId` overrides the output's default unit. */
export function formatOutput(o: Output, raw: unknown, unitId?: string): { value: string; unit: string } {
  if (raw === null || raw === undefined || raw === '') return { value: '—', unit: unitLabelFor(o, unitId) };
  if (typeof raw === 'string') return { value: raw, unit: o.format === 'text' || o.format === 'code' ? '' : unitLabelFor(o, unitId) };
  if (typeof raw !== 'number') return { value: String(raw), unit: '' };
  let x = raw;
  if (o.unit) {
    const u = unitId ?? defaultUnitFor(o.unit, o.defaultUnit, o.units);
    x = fromBase(o.unit, u, raw);
  }
  if (!Number.isFinite(x)) return { value: '—', unit: '' };
  switch (o.format) {
    case 'currency':
      return { value: nf({ style: 'currency', currency: 'USD', maximumFractionDigits: o.precision ?? 2, minimumFractionDigits: Math.min(2, o.precision ?? 2) }).format(x).replace('-', '−'), unit: o.suffix ?? '' };
    case 'percent':
      return { value: formatNumber(x * 100, o.precision ?? 2) + '%', unit: o.suffix ?? '' };
    case 'integer':
      return { value: nf({ maximumFractionDigits: 0 }).format(Math.round(x)), unit: unitLabelFor(o, unitId) };
    default:
      return { value: formatNumber(x, o.precision ?? 4), unit: unitLabelFor(o, unitId) };
  }
}

function unitLabelFor(o: Output, unitId?: string): string {
  if (o.unit) return getUnit(o.unit, unitId ?? defaultUnitFor(o.unit, o.defaultUnit, o.units)).label;
  return o.suffix ?? '';
}
