/**
 * Interpolate between two chart specs of the same shape, so charts can morph smoothly
 * when inputs change. Returns null when the specs are not compatible (different type,
 * series count or point count) — the caller then just swaps to the new chart.
 */
import type { ChartSpec } from './types';

const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const lerpN = (a: number | null, b: number | null, t: number) => (a === null || b === null || !Number.isFinite(a) || !Number.isFinite(b) ? b : lerp(a, b, t));

function sameLen<T>(a: T[] | undefined, b: T[] | undefined) {
  return (a?.length ?? 0) === (b?.length ?? 0);
}

export function tweenable(a: ChartSpec, b: ChartSpec): boolean {
  if (a.type !== b.type) return false;
  switch (b.type) {
    case 'line':
    case 'area': {
      const A = a as typeof b;
      return sameLen(A.x, b.x) && A.series.length === b.series.length && A.series.every((s, i) => sameLen(s.values, b.series[i].values)) && sameLen(A.markers, b.markers) && A.x.every((x, i) => typeof x === typeof b.x[i]);
    }
    case 'bar': {
      const A = a as typeof b;
      return sameLen(A.categories, b.categories) && A.series.length === b.series.length && A.series.every((s, i) => sameLen(s.values, b.series[i].values));
    }
    case 'donut':
      return sameLen((a as typeof b).slices, b.slices);
    case 'scale':
      return (a as typeof b).bands.length === b.bands.length;
    case 'distribution': {
      const A = a as typeof b;
      return sameLen(A.markers, b.markers) && sameLen(A.shade, b.shade) && A.df === b.df;
    }
    default:
      return false;
  }
}

/** Spec at fraction `t` (0 → a, 1 → b). Text (titles, labels) always comes from `b`. Assumes `tweenable(a, b)`. */
export function tweenSpec(a: ChartSpec, b: ChartSpec, t: number): ChartSpec {
  switch (b.type) {
    case 'line':
    case 'area': {
      const A = a as typeof b;
      return {
        ...b,
        x: b.x.map((x, i) => (typeof x === 'number' && typeof A.x[i] === 'number' ? lerp(A.x[i] as number, x, t) : x)),
        series: b.series.map((s, si) => ({ ...s, values: s.values.map((v, i) => lerpN(A.series[si].values[i], v, t)) })),
        markers: b.markers?.map((m, i) => (typeof m.x === 'number' && typeof A.markers?.[i]?.x === 'number' ? { ...m, x: lerp(A.markers[i].x as number, m.x, t) } : m)),
      };
    }
    case 'bar': {
      const A = a as typeof b;
      return { ...b, series: b.series.map((s, si) => ({ ...s, values: s.values.map((v, i) => lerp(A.series[si].values[i] ?? v, v, t)) })) };
    }
    case 'donut': {
      const A = a as typeof b;
      return { ...b, slices: b.slices.map((s, i) => ({ ...s, value: lerp(Math.max(0, A.slices[i].value), Math.max(0, s.value), t) })) };
    }
    case 'scale': {
      const A = a as typeof b;
      return { ...b, value: lerp(A.value, b.value, t), min: lerp(A.min, b.min, t), max: lerp(A.max, b.max, t) };
    }
    case 'distribution': {
      const A = a as typeof b;
      return {
        ...b,
        mean: lerp(A.mean, b.mean, t),
        sd: lerp(A.sd, b.sd, t),
        markers: b.markers?.map((m, i) => ({ ...m, x: lerp(A.markers![i].x, m.x, t) })),
        shade: b.shade?.map((s, i) => ({
          ...s,
          from: s.from === undefined || A.shade![i].from === undefined ? s.from : lerp(A.shade![i].from!, s.from, t),
          to: s.to === undefined || A.shade![i].to === undefined ? s.to : lerp(A.shade![i].to!, s.to, t),
        })),
      };
    }
    default:
      return b;
  }
}

export const easeOutCubic = (t: number) => 1 - (1 - t) ** 3;
