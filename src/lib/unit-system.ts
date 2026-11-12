import { UNIT_GROUPS, type UnitGroup } from './units';

export type UnitSystem = 'us' | 'metric';

const US = new Set(['in', 'ft', 'yd', 'mi', 'in2', 'ft2', 'yd2', 'ac', 'mi2', 'in3', 'ft3', 'yd3', 'tsp', 'tbsp', 'floz', 'cup', 'pt', 'qt', 'gal', 'oz', 'lb', 'st', 'ton', 'f', 'mph', 'fps', 'psi', 'lbf', 'mpg', 'lbft3', 'btu']);
const METRIC = new Set(['mm', 'cm', 'm', 'km', 'cm2', 'm2', 'km2', 'ha', 'ml', 'l', 'm3', 'cm3', 'mg', 'g', 'kg', 't', 'c', 'kph', 'mps', 'kpa', 'bar', 'n', 'kn', 'kmpl', 'l100', 'kgm3', 'gcm3', 'gml']);

export function systemOf(unitId: string): UnitSystem | null {
  if (US.has(unitId)) return 'us';
  if (METRIC.has(unitId)) return 'metric';
  return null;
}

/** The unit in `allowed` that belongs to `target` system and is closest in scale to `current`. */
export function counterpart(group: UnitGroup, current: string, allowed: string[], target: UnitSystem): string | null {
  if (systemOf(current) === target || systemOf(current) === null) return null;
  const units = UNIT_GROUPS[group].units as { id: string; factor?: number }[];
  const f = (id: string) => units.find((u) => u.id === id)?.factor;
  const special: Record<string, string> = { f: 'c', c: 'f', mpg: 'l100', l100: 'mpg', kmpl: 'mpg' };
  if (special[current] && allowed.includes(special[current]) && systemOf(special[current]) === target) return special[current];
  const cf = f(current);
  const candidates = allowed.filter((id) => systemOf(id) === target);
  if (!candidates.length) return null;
  if (!cf) return candidates[0];
  let best = candidates[0];
  let bestD = Infinity;
  for (const id of candidates) {
    const uf = f(id);
    if (!uf) continue;
    const d = Math.abs(Math.log10(uf) - Math.log10(cf));
    if (d < bestD) {
      bestD = d;
      best = id;
    }
  }
  return best;
}

const KEY = 'unit-system';
export function getSystem(): UnitSystem | null {
  try {
    const v = localStorage.getItem(KEY);
    return v === 'us' || v === 'metric' ? v : null;
  } catch {
    return null;
  }
}
export function setSystem(s: UnitSystem) {
  try {
    localStorage.setItem(KEY, s);
  } catch {}
  document.documentElement.dataset.units = s;
  window.dispatchEvent(new CustomEvent('unitsystem', { detail: s }));
}
