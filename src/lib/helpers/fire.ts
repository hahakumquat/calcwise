/**
 * Shared math for the FIRE (financial independence, retire early) calculators.
 * Everything works in TODAY'S dollars: nominal returns are converted to real returns,
 * so spending and FIRE numbers keep their purchasing power however far out they are.
 */
import type { ChartSpec, NumberInput } from '../types';
import { CURRENCY, money } from './finance';

/** Real (after-inflation) annual return from nominal return and inflation, both in percent. */
export const realReturn = (nominalPct: number, inflationPct: number) => (1 + nominalPct / 100) / (1 + inflationPct / 100) - 1;

/** Portfolio needed to support `spending` a year at withdrawal rate `swrPct`. */
export const fireNumber = (spending: number, swrPct: number) => (swrPct > 0 ? spending / (swrPct / 100) : Infinity);

export interface AccumulateOpts {
  /** Starting portfolio. */
  start: number;
  /** Money added per year (spread monthly), in today's dollars. */
  savings: number;
  /** Real annual return (fraction). */
  real: number;
  /** Target portfolio. */
  target: number;
  /** Real yearly growth of savings (fraction), e.g. raises above inflation. */
  savingsGrowth?: number;
  /** Stop contributing after this many years (e.g. RSUs that stop vesting). */
  maxYears?: number;
}

/**
 * Months until the portfolio first reaches `target` with monthly compounding and monthly contributions.
 * Returns 0 if already there and null if it never gets there within `maxYears` (default 80).
 */
export function monthsToTarget({ start, savings, real, target, savingsGrowth = 0, maxYears = 80 }: AccumulateOpts): number | null {
  if (start >= target) return 0;
  const rm = (1 + real) ** (1 / 12) - 1;
  let b = start;
  let s = savings;
  for (let m = 1; m <= maxYears * 12; m++) {
    b = b * (1 + rm) + s / 12;
    if (m % 12 === 0) s *= 1 + savingsGrowth;
    if (b >= target) {
      // Interpolate within the month for a smooth answer.
      const prev = (b - s / 12) / (1 + rm);
      const frac = b > prev ? (target - prev) / (b - prev) : 1;
      return m - 1 + Math.min(1, Math.max(0, frac));
    }
  }
  return null;
}

/** Year-end balances for `years` years of saving (index 0 = today). */
export function growPath(start: number, savings: number, real: number, years: number, savingsGrowth = 0): number[] {
  const rm = (1 + real) ** (1 / 12) - 1;
  const out = [start];
  let b = start;
  let s = savings;
  for (let y = 0; y < years; y++) {
    for (let m = 0; m < 12; m++) b = b * (1 + rm) + s / 12;
    s *= 1 + savingsGrowth;
    out.push(b);
  }
  return out;
}

/** Continue a path after FI: withdraw `spending` at the start of each year, grow at `real`. */
export function drawPath(start: number, spending: number, real: number, years: number): number[] {
  const out = [start];
  let b = start;
  for (let y = 0; y < years; y++) {
    b = Math.max(0, (b - spending) * (1 + real));
    out.push(b);
  }
  return out;
}

/** "12 years, 4 months" / "8 months" / "now". */
export function yearsMonths(months: number): string {
  const m = Math.ceil(months - 1e-9);
  if (m <= 0) return 'now';
  const y = Math.floor(m / 12);
  const r = m % 12;
  const ys = y ? `${y} year${y === 1 ? '' : 's'}` : '';
  const rs = r ? `${r} month${r === 1 ? '' : 's'}` : '';
  return [ys, rs].filter(Boolean).join(', ');
}

/** Standard "portfolio vs FIRE target by age" line chart with a marker at the FI age. */
export function fiPathChart(opts: {
  title?: string;
  age: number;
  series: { name: string; values: number[] }[];
  target: number;
  targetLabel?: string;
  fiAge?: number | null;
  markerLabel?: string;
}): ChartSpec {
  const n = Math.max(...opts.series.map((s) => s.values.length));
  const x = Array.from({ length: n }, (_, i) => opts.age + i);
  return {
    type: 'line',
    title: opts.title ?? 'Your path to financial independence',
    x,
    xLabel: 'Age',
    yFormat: CURRENCY,
    series: [...opts.series, { name: opts.targetLabel ?? 'FIRE number', values: x.map(() => opts.target) }],
    markers: opts.fiAge != null && opts.fiAge <= x[x.length - 1] ? [{ x: Math.round(opts.fiAge * 10) / 10, label: opts.markerLabel ?? `FI at ${opts.fiAge.toFixed(1)}` }] : [],
  };
}

/* ───────────── Monte Carlo ───────────── */

/** Small, fast seeded PRNG so server-rendered and in-browser results match exactly. */
export function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface MarketAssumptions {
  /** Share of the portfolio in stocks (0–1); the rest is bonds. */
  stockShare: number;
  /** Real arithmetic mean returns and volatilities (fractions). */
  stockMean: number;
  stockSd: number;
  bondMean: number;
  bondSd: number;
}

/** Default real-return assumptions: deliberately a little below long-run US history. */
export const DEFAULT_MARKET = { stockMean: 0.07, stockSd: 0.17, bondMean: 0.02, bondSd: 0.07 };

/**
 * Pre-draw `sims × years` yearly real portfolio returns (independent normal draws, annually rebalanced).
 * Reusing one matrix for every withdrawal rate ("common random numbers") keeps comparisons smooth and monotonic.
 */
export function drawReturns(m: MarketAssumptions, sims: number, years: number, seed = 20260101): Float64Array[] {
  const rand = mulberry32(seed);
  const gauss = () => {
    let u = 0;
    while (u === 0) u = rand();
    return Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * rand());
  };
  const out: Float64Array[] = [];
  for (let i = 0; i < sims; i++) {
    const row = new Float64Array(years);
    for (let y = 0; y < years; y++) {
      const s = m.stockMean + m.stockSd * gauss();
      const b = m.bondMean + m.bondSd * gauss();
      row[y] = Math.max(-0.95, m.stockShare * s + (1 - m.stockShare) * b);
    }
    out.push(row);
  }
  return out;
}

/** Share of simulations in which the money lasts all `years`, withdrawing `spending` (real) at the start of each year. */
export function successRate(returns: Float64Array[], start: number, spending: number, years: number): number {
  let ok = 0;
  for (const row of returns) {
    let b = start;
    let alive = true;
    for (let y = 0; y < years; y++) {
      b -= spending;
      if (b < 0) {
        alive = false;
        break;
      }
      b *= 1 + row[y];
    }
    if (alive) ok++;
  }
  return ok / returns.length;
}

/** 10th/50th/75th/90th percentile balance paths across simulations. */
export function percentilePaths(returns: Float64Array[], start: number, spending: number, years: number) {
  const paths = returns.map((row) => {
    const p = [start];
    let b = start;
    for (let y = 0; y < years; y++) {
      b = Math.max(0, (b - spending) * (1 + row[y]));
      p.push(b);
    }
    return p;
  });
  const pick = (q: number) =>
    Array.from({ length: years + 1 }, (_, y) => {
      const col = paths.map((p) => p[y]).sort((a, b) => a - b);
      return col[Math.min(col.length - 1, Math.floor(q * col.length))];
    });
  return { p10: pick(0.1), p50: pick(0.5), p75: pick(0.75), p90: pick(0.9) };
}

/** Highest withdrawal rate (percent, 0.05 steps) whose success rate is at least `target`. */
export function safeRate(returns: Float64Array[], start: number, years: number, target: number): number {
  let lo = 0.5;
  let hi = 15;
  for (let i = 0; i < 11; i++) {
    const mid = (lo + hi) / 2;
    if (successRate(returns, start, (start * mid) / 100, years) >= target) lo = mid;
    else hi = mid;
  }
  return Math.floor(lo * 20) / 20;
}

/* ───────────── Shared inputs ───────────── */

export const IN = {
  age: (d = 30): NumberInput => ({ id: 'age', label: 'Current age', type: 'number', suffix: 'years', default: d, min: 0, max: 100, step: 1, info: 'Your age today, in whole years. Used to turn "years from now" into the age you reach each milestone.' }),
  portfolio: (d: number): NumberInput => ({ id: 'portfolio', label: 'Invested today', type: 'number', prefix: '$', default: d, min: 0, step: 1000, info: 'Everything invested for the long term: 401(k), IRA, HSA and brokerage accounts. Leave out your home equity and emergency fund.' }),
  spending: (d: number, label = 'Annual spending in retirement'): NumberInput => ({ id: 'spending', label, type: 'number', prefix: '$', default: d, min: 0, step: 1000, info: 'What you expect to spend each year once you stop working, in today\'s dollars. Include health insurance, which you pay yourself before Medicare at 65.' }),
  savings: (d: number): NumberInput => ({ id: 'savings', label: 'Annual savings', type: 'number', prefix: '$', default: d, min: 0, step: 1000, info: 'How much you invest each year, including 401(k) contributions and any employer match.' }),
  returnRate: (d = 7): NumberInput => ({ id: 'returnRate', label: 'Expected return', type: 'number', suffix: '% / yr', default: d, step: 0.1, info: 'Average yearly return before inflation. A stock-heavy portfolio has returned about 7–10% historically; 6–7% is a common, more cautious planning figure.' }),
  inflation: (d = 3): NumberInput => ({ id: 'inflation', label: 'Inflation', type: 'number', suffix: '% / yr', default: d, step: 0.1, info: 'Expected yearly rise in prices. Return minus inflation is your real return, which is what grows your purchasing power. The US long-run average is about 3%.' }),
  swr: (d = 4): NumberInput => ({ id: 'swr', label: 'Withdrawal rate', type: 'number', suffix: '%', default: d, min: 0.5, max: 15, step: 0.05, info: 'The share of your portfolio you withdraw in year one, then adjust for inflation. 4% is the classic rule for 30 years; early retirees often use 3.25–3.75%.' }),
};

/** "7% − 3% inflation ≈ 3.88% real" step. */
export const realStep = (nominal: number, infl: number, real: number) => `Real return = (1 + ${nominal}%) ÷ (1 + ${infl}%) − 1 = ${(real * 100).toFixed(2)}%`;

export const fireStep = (spending: number, swr: number, target: number) => `FIRE number = ${money(spending, 0)} ÷ ${swr}% = ${money(target, 0)}`;

/** Sources cited across FIRE pages. */
export const SOURCES = {
  bengen: { label: 'Bengen, W. P. (1994). "Determining Withdrawal Rates Using Historical Data." Journal of Financial Planning.' },
  trinity: { label: 'Cooley, Hubbard & Walz (1998). "Retirement Savings: Choosing a Withdrawal Rate That Is Sustainable." AAII Journal (the "Trinity study").' },
  ern: { label: 'Early Retirement Now — Safe Withdrawal Rate Series', url: 'https://earlyretirementnow.com/safe-withdrawal-rate-series/' },
  mmm: { label: 'Mr. Money Mustache — "The Shockingly Simple Math Behind Early Retirement"', url: 'https://www.mrmoneymustache.com/2012/01/13/the-shockingly-simple-math-behind-early-retirement/' },
  irs525: { label: 'IRS Publication 525 — Taxable and Nontaxable Income', url: 'https://www.irs.gov/publications/p525' },
  ssa: { label: 'Social Security Administration — Retirement benefits', url: 'https://www.ssa.gov/benefits/retirement/' },
  aca: { label: 'HealthCare.gov — coverage options if you retire before 65', url: 'https://www.healthcare.gov/' },
};

export const FIRE_UPDATED = '2026-11-12';
