/** Shared helpers for health, sports and food calculators. Pure and dependency-free. */
import { DAY_MS } from '../math';

export const SEX_OPTIONS = [
  { value: 'male', label: 'Male' },
  { value: 'female', label: 'Female' },
];

export const ACTIVITY_LEVELS: { value: string; label: string; factor: number }[] = [
  { value: 'sedentary', label: 'Sedentary (little or no exercise)', factor: 1.2 },
  { value: 'light', label: 'Light (exercise 1–3 days/week)', factor: 1.375 },
  { value: 'moderate', label: 'Moderate (exercise 3–5 days/week)', factor: 1.55 },
  { value: 'active', label: 'Very active (hard exercise 6–7 days/week)', factor: 1.725 },
  { value: 'extra', label: 'Extra active (physical job or twice-daily training)', factor: 1.9 },
];

export const activityFactor = (v: unknown): number | null => ACTIVITY_LEVELS.find((a) => a.value === v)?.factor ?? null;

/** Mifflin–St Jeor resting energy expenditure in kcal/day. */
export function mifflinStJeor(sex: unknown, kg: number, cm: number, age: number): number {
  return 10 * kg + 6.25 * cm - 5 * age + (sex === 'female' ? -161 : 5);
}

/** Revised Harris–Benedict (Roza & Shizgal, 1984) in kcal/day. */
export function harrisBenedict(sex: unknown, kg: number, cm: number, age: number): number {
  return sex === 'female' ? 447.593 + 9.247 * kg + 3.098 * cm - 4.33 * age : 88.362 + 13.397 * kg + 4.799 * cm - 5.677 * age;
}

/** Format a whole number with thousands separators. */
export const fmtInt = (x: number) => Math.round(x).toLocaleString('en-US');

/** Seconds → "m:ss" or "h:mm:ss" (rounded to the nearest second). */
export function fmtDuration(seconds: number): string {
  const t = Math.round(seconds);
  const h = Math.floor(t / 3600);
  const m = Math.floor((t % 3600) / 60);
  const s = t % 60;
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${ss}` : `${m}:${ss}`;
}

/** Sum of hour/minute/second fields (blank counts as 0). Returns null when all are blank or any is negative. */
export function hmsToSeconds(h: unknown, m: unknown, s: unknown): number | null {
  const parts = [h, m, s].map((x) => (typeof x === 'number' && Number.isFinite(x) ? x : null));
  if (parts.every((x) => x === null)) return null;
  if (parts.some((x) => x !== null && x < 0)) return null;
  const [hh, mm, ss] = parts.map((x) => x ?? 0);
  return hh * 3600 + mm * 60 + ss;
}

/**
 * Parse a clock time such as "07:00", "7:30", "23:15", "7 am" or "11:30 pm".
 * Returns minutes after midnight, or null.
 */
export function parseClock(input: unknown): number | null {
  if (typeof input !== 'string') return null;
  const m = input.trim().toLowerCase().match(/^(\d{1,2})(?::|\.|h)?(\d{2})?\s*(am|pm|a|p)?$/);
  if (!m) return null;
  let h = Number(m[1]);
  const min = m[2] ? Number(m[2]) : 0;
  const ap = m[3];
  if (min > 59) return null;
  if (ap) {
    if (h < 1 || h > 12) return null;
    if (h === 12) h = 0;
    if (ap.startsWith('p')) h += 12;
  } else if (h > 23) return null;
  return h * 60 + min;
}

/** Minutes after midnight (any integer, wraps around) → "10:45 PM". */
export function fmtClock(minutes: number): string {
  const t = ((Math.round(minutes) % 1440) + 1440) % 1440;
  const h = Math.floor(t / 60);
  const m = t % 60;
  const h12 = h % 12 === 0 ? 12 : h % 12;
  return `${h12}:${String(m).padStart(2, '0')} ${h < 12 ? 'AM' : 'PM'}`;
}

/** Today's date at 00:00 UTC (matches parseDate's convention). */
export function todayUtc(): Date {
  const n = new Date();
  return new Date(Date.UTC(n.getFullYear(), n.getMonth(), n.getDate()));
}

export const addDays = (d: Date, days: number) => new Date(d.getTime() + days * DAY_MS);

/** Whole days from a to b (b − a). */
export const daysBetween = (a: Date, b: Date) => Math.round((b.getTime() - a.getTime()) / DAY_MS);

/** Short date like "Jan 15" for compact ranges. */
export const fmtShortDate = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
