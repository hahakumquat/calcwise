import type { Calculator, Values } from './types';
import { toBase, defaultUnitFor } from './units';

export const parseList = (s: string): number[] =>
  s
    .split(/[\s,;]+/)
    .filter(Boolean)
    .map(Number)
    .filter((n) => Number.isFinite(n));

/** Values for compute() from each input's defaults. Returns null if a default depends on "today". */
export function defaultValues(c: Calculator): Values | null {
  const v: Values = {};
  for (const i of c.inputs) {
    switch (i.type) {
      case 'number':
        v[i.id] = i.default === undefined ? null : i.unit ? toBase(i.unit, defaultUnitFor(i.unit, i.defaultUnit, i.units), i.default) : i.default;
        break;
      case 'select':
        v[i.id] = i.default ?? i.options[0]?.value ?? null;
        break;
      case 'list':
        v[i.id] = parseList(i.default ?? '');
        break;
      case 'date':
        if (i.default === 'today') return null;
        v[i.id] = i.default ?? null;
        break;
      case 'textarea':
        v[i.id] = i.default ?? '';
        break;
      case 'toggle':
        v[i.id] = i.default ? 'on' : 'off';
        break;
      default:
        v[i.id] = i.default ?? null;
    }
  }
  return v;
}
