export type UnitSystem = 'us' | 'metric';

const US = new Set(['in', 'ft', 'yd', 'mi', 'in2', 'ft2', 'yd2', 'ac', 'mi2', 'in3', 'ft3', 'yd3', 'tsp', 'tbsp', 'floz', 'cup', 'pt', 'qt', 'gal', 'oz', 'lb', 'st', 'ton', 'f', 'mph', 'fps', 'psi', 'lbf', 'mpg', 'lbft3', 'btu']);
const METRIC = new Set(['mm', 'cm', 'm', 'km', 'cm2', 'm2', 'km2', 'ha', 'ml', 'l', 'm3', 'cm3', 'mg', 'g', 'kg', 't', 'c', 'kph', 'mps', 'kpa', 'bar', 'n', 'kn', 'kmpl', 'l100', 'kgm3', 'gcm3', 'gml']);

export function systemOf(unitId: string): UnitSystem | null {
  if (US.has(unitId)) return 'us';
  if (METRIC.has(unitId)) return 'metric';
  return null;
}
