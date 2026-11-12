/** Shared helpers for finance calculators. Pure and dependency-free. */
import type { ChartFormat, ChartSpec, SelectInput } from '../types';

/** Seconds in one month / one year in the `time` unit group (1 yr = 12 mo exactly). */
export const MONTH_S = 2629746;
export const YEAR_S = 31556952;

/** Time input (base seconds) → whole months. */
export const toMonths = (s: number) => Math.round(s / MONTH_S);
/** Time input (base seconds) → fractional years. */
export const toYears = (s: number) => s / YEAR_S;

/** Fixed payment for an amortizing loan. `ratePct` is the annual rate in percent, `n` the number of monthly payments. */
export function amortizedPayment(principal: number, ratePct: number, n: number): number {
  const r = ratePct / 100 / 12;
  return r === 0 ? principal / n : (principal * r) / (1 - (1 + r) ** -n);
}

/** Present value of `n` level payments at periodic rate `r`. */
export const pvAnnuity = (pmt: number, r: number, n: number) => (r === 0 ? pmt * n : (pmt * (1 - (1 + r) ** -n)) / r);

/** Future value of `n` level end-of-period payments at periodic rate `r`. */
export const fvAnnuity = (pmt: number, r: number, n: number) => (r === 0 ? pmt * n : (pmt * ((1 + r) ** n - 1)) / r);

/** $1,234.56 style string for steps and notes. */
export function money(x: number, digits = 2): string {
  const sign = x < 0 ? '−' : '';
  return `${sign}$${Math.abs(x).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits })}`;
}

/** 0.1234 → "12.34%". */
export const pct = (fraction: number, digits = 2) => `${+(fraction * 100).toFixed(digits)}%`;

/* ------------------------------------------------------------------ */
/* US federal income tax — tax year 2026                               */
/* Source: IRS inflation adjustments for tax year 2026 (Rev. Proc.     */
/* 2025-32), which reflect the 2025 tax law (P.L. 119-21).             */
/* ------------------------------------------------------------------ */

export const TAX_YEAR = 2026;

export type FilingStatus = 'single' | 'mfj' | 'mfs' | 'hoh';

export const FILING_STATUS_OPTIONS: SelectInput['options'] = [
  { value: 'single', label: 'Single' },
  { value: 'mfj', label: 'Married filing jointly' },
  { value: 'mfs', label: 'Married filing separately' },
  { value: 'hoh', label: 'Head of household' },
];

export const asStatus = (v: unknown): FilingStatus =>
  v === 'mfj' || v === 'mfs' || v === 'hoh' ? v : 'single';

export const STANDARD_DEDUCTION: Record<FilingStatus, number> = {
  single: 16100,
  mfj: 32200,
  mfs: 16100,
  hoh: 24150,
};

const RATES = [0.1, 0.12, 0.22, 0.24, 0.32, 0.35, 0.37];

/** Upper bound of each bracket (the 37% bracket is open-ended). */
const BRACKET_TOPS: Record<FilingStatus, number[]> = {
  single: [12400, 50400, 105700, 201775, 256225, 640600],
  mfj: [24800, 100800, 211400, 403550, 512450, 768700],
  mfs: [12400, 50400, 105700, 201775, 256225, 384350],
  hoh: [17700, 67450, 105700, 201750, 256200, 640600],
};

export interface BracketSlice {
  rate: number;
  from: number;
  to: number;
  amount: number;
  tax: number;
}

/** Federal income tax on ordinary taxable income (after deductions). */
export function federalIncomeTax(taxable: number, status: FilingStatus) {
  const tops = BRACKET_TOPS[status];
  const slices: BracketSlice[] = [];
  let tax = 0;
  let lower = 0;
  let marginal = RATES[0];
  const t = Math.max(0, taxable);
  for (let i = 0; i < RATES.length; i++) {
    const upper = i < tops.length ? tops[i] : Infinity;
    if (t > lower) {
      const amount = Math.min(t, upper) - lower;
      const sliceTax = amount * RATES[i];
      tax += sliceTax;
      marginal = RATES[i];
      slices.push({ rate: RATES[i], from: lower, to: Math.min(t, upper), amount, tax: sliceTax });
    }
    lower = upper;
  }
  return { tax, marginal, slices };
}

/** "10% on $12,400 = $1,240.00" lines for steps. */
export const sliceSteps = (slices: BracketSlice[]) =>
  slices.map((s) => `${pct(s.rate, 0)} on ${money(s.from, 0)}–${money(s.to, 0)} (${money(s.amount, 0)}) = ${money(s.tax)}`);

/* Payroll (FICA) taxes, 2026 */
/** Social Security wage base for 2026 as announced by the SSA in October 2025. */
export const SS_WAGE_BASE = 184500;
export const SS_RATE = 0.062;
export const MEDICARE_RATE = 0.0145;
export const ADDL_MEDICARE_RATE = 0.009;
/** Additional Medicare Tax thresholds (not inflation-indexed). */
export const ADDL_MEDICARE_THRESHOLD: Record<FilingStatus, number> = {
  single: 200000,
  hoh: 200000,
  mfj: 250000,
  mfs: 125000,
};

/** Employee share of FICA on `wages` (one earner; Additional Medicare threshold per filing status). */
export function ficaTax(wages: number, status: FilingStatus) {
  const w = Math.max(0, wages);
  const socialSecurity = Math.min(w, SS_WAGE_BASE) * SS_RATE;
  const medicare = w * MEDICARE_RATE + Math.max(0, w - ADDL_MEDICARE_THRESHOLD[status]) * ADDL_MEDICARE_RATE;
  return { socialSecurity, medicare };
}

/** 2026 employee elective-deferral limit for 401(k)/403(b) plans, and the age-50+ catch-up. */
export const LIMIT_401K = 24500;
export const CATCHUP_401K = 8000;

/** Federal supplemental-wage flat withholding rates (and the $1 million threshold for the higher rate). */
export const SUPPLEMENTAL_RATE = 0.22;
export const SUPPLEMENTAL_RATE_HIGH = 0.37;
export const SUPPLEMENTAL_HIGH_THRESHOLD = 1_000_000;

/* ------------------------------------------------------------------ */
/* Chart builders                                                      */
/* ------------------------------------------------------------------ */

export const CURRENCY: ChartFormat = { format: 'currency' };

/** Donut of currency slices (non-positive slices are dropped by the renderer). */
export function moneyDonut(title: string, slices: { label: string; value: number }[], centerValue?: string, centerLabel?: string): ChartSpec {
  return { type: 'donut', title, format: CURRENCY, slices, ...(centerValue ? { centerValue } : {}), ...(centerLabel ? { centerLabel } : {}) };
}

/** Pick at most ~`max` evenly spaced indices from 0..n (always including both ends). */
export function sampleIdx(n: number, max = 60): number[] {
  const step = Math.max(1, Math.ceil(n / max));
  const out: number[] = [];
  for (let i = 0; i <= n; i += step) out.push(i);
  if (out[out.length - 1] !== n) out.push(n);
  return out;
}

/**
 * Stacked area of money put in vs growth, plus a donut of the final split.
 * `x` are the time points (years); `deposits[i]` is the running total put in, `balance[i]` the account value.
 */
export function growthCharts(x: number[], deposits: number[], balance: number[], depositLabel = 'Contributions', growthLabel = 'Growth'): ChartSpec[] {
  const growth = balance.map((b, i) => Math.max(0, b - deposits[i]));
  const lastD = deposits[deposits.length - 1] ?? 0;
  const lastB = balance[balance.length - 1] ?? 0;
  const share = lastB > 0 ? Math.round((Math.max(0, lastB - lastD) / lastB) * 100) : 0;
  return [
    { type: 'area', title: 'Balance over time', x, xLabel: 'Years', xFormat: { format: 'number' }, yFormat: CURRENCY, stacked: true, series: [{ name: depositLabel, values: deposits }, { name: growthLabel, values: growth }] },
    moneyDonut('Final balance', [{ label: depositLabel, value: lastD }, { label: growthLabel, value: Math.max(0, lastB - lastD) }], `${share}%`, 'is growth'),
  ];
}

/** Month indices 0..n for charting: monthly for short spans, yearly (or coarser) for long ones; ≤ ~100 points. */
export function monthIdx(n: number): number[] {
  const step = n <= 24 ? 1 : 12 * Math.max(1, Math.ceil(n / 12 / 100));
  const out: number[] = [];
  for (let m = 0; m <= n; m += step) out.push(m);
  if (out[out.length - 1] !== n) out.push(n);
  return out;
}

/** Round to cents/years for tidy chart x values. */
export const yr = (months: number) => +(months / 12).toFixed(2);
