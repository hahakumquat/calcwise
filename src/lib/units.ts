/**
 * Unit system. Every group has a base unit (factor 1). compute() always sees base units.
 * Linear units: base = value * factor. Temperature uses explicit functions.
 */

export interface Unit {
  id: string;
  label: string;
  /** Multiply by this to get the base unit. */
  factor?: number;
  toBase?: (v: number) => number;
  fromBase?: (v: number) => number;
}

const lin = (id: string, label: string, factor: number): Unit => ({ id, label, factor });

export const UNIT_GROUPS = {
  length: {
    base: 'm',
    units: [
      lin('mm', 'mm', 0.001),
      lin('cm', 'cm', 0.01),
      lin('m', 'm', 1),
      lin('km', 'km', 1000),
      lin('in', 'in', 0.0254),
      lin('ft', 'ft', 0.3048),
      lin('yd', 'yd', 0.9144),
      lin('mi', 'mi', 1609.344),
      lin('nmi', 'nmi', 1852),
    ],
  },
  area: {
    base: 'm2',
    units: [
      lin('cm2', 'cm²', 1e-4),
      lin('m2', 'm²', 1),
      lin('km2', 'km²', 1e6),
      lin('in2', 'in²', 0.00064516),
      lin('ft2', 'ft²', 0.09290304),
      lin('yd2', 'yd²', 0.83612736),
      lin('ac', 'acres', 4046.8564224),
      lin('ha', 'hectares', 10000),
      lin('mi2', 'mi²', 2589988.110336),
    ],
  },
  volume: {
    base: 'm3',
    units: [
      lin('ml', 'mL', 1e-6),
      lin('l', 'L', 0.001),
      lin('m3', 'm³', 1),
      lin('cm3', 'cm³', 1e-6),
      lin('in3', 'in³', 1.6387064e-5),
      lin('ft3', 'ft³', 0.028316846592),
      lin('yd3', 'yd³', 0.764554857984),
      lin('tsp', 'tsp', 4.92892159375e-6),
      lin('tbsp', 'tbsp', 1.478676478125e-5),
      lin('floz', 'US fl oz', 2.95735295625e-5),
      lin('cup', 'US cup', 2.365882365e-4),
      lin('pt', 'US pint', 4.73176473e-4),
      lin('qt', 'US quart', 9.46352946e-4),
      lin('gal', 'US gal', 0.003785411784),
      lin('impgal', 'UK gal', 0.00454609),
    ],
  },
  mass: {
    base: 'kg',
    units: [
      lin('mg', 'mg', 1e-6),
      lin('g', 'g', 0.001),
      lin('kg', 'kg', 1),
      lin('t', 'tonnes', 1000),
      lin('oz', 'oz', 0.028349523125),
      lin('lb', 'lb', 0.45359237),
      lin('st', 'stone', 6.35029318),
      lin('ton', 'US tons', 907.18474),
    ],
  },
  time: {
    base: 's',
    units: [
      lin('ms', 'ms', 0.001),
      lin('s', 'sec', 1),
      lin('min', 'min', 60),
      lin('h', 'hours', 3600),
      lin('d', 'days', 86400),
      lin('wk', 'weeks', 604800),
      lin('mo', 'months', 2629746),
      lin('yr', 'years', 31556952),
    ],
  },
  speed: {
    base: 'mps',
    units: [
      lin('mps', 'm/s', 1),
      lin('kph', 'km/h', 1 / 3.6),
      lin('mph', 'mph', 0.44704),
      lin('fps', 'ft/s', 0.3048),
      lin('kn', 'knots', 1852 / 3600),
    ],
  },
  temperature: {
    base: 'c',
    units: [
      { id: 'c', label: '°C', toBase: (v) => v, fromBase: (v) => v },
      { id: 'f', label: '°F', toBase: (v) => ((v - 32) * 5) / 9, fromBase: (v) => (v * 9) / 5 + 32 },
      { id: 'k', label: 'K', toBase: (v) => v - 273.15, fromBase: (v) => v + 273.15 },
    ] as Unit[],
  },
  energy: {
    base: 'j',
    units: [
      lin('j', 'J', 1),
      lin('kj', 'kJ', 1000),
      lin('cal', 'cal', 4.184),
      lin('kcal', 'kcal', 4184),
      lin('wh', 'Wh', 3600),
      lin('kwh', 'kWh', 3.6e6),
      lin('btu', 'BTU', 1055.05585262),
      lin('ev', 'eV', 1.602176634e-19),
    ],
  },
  power: {
    base: 'w',
    units: [lin('w', 'W', 1), lin('kw', 'kW', 1000), lin('mw', 'MW', 1e6), lin('hp', 'hp', 745.69987158227)],
  },
  pressure: {
    base: 'pa',
    units: [
      lin('pa', 'Pa', 1),
      lin('kpa', 'kPa', 1000),
      lin('bar', 'bar', 1e5),
      lin('atm', 'atm', 101325),
      lin('psi', 'psi', 6894.757293168),
      lin('mmhg', 'mmHg', 133.322387415),
    ],
  },
  force: {
    base: 'n',
    units: [lin('n', 'N', 1), lin('kn', 'kN', 1000), lin('lbf', 'lbf', 4.4482216152605), lin('kgf', 'kgf', 9.80665)],
  },
  data: {
    base: 'B',
    units: [
      lin('b', 'bits', 0.125),
      lin('B', 'bytes', 1),
      lin('KB', 'KB', 1e3),
      lin('MB', 'MB', 1e6),
      lin('GB', 'GB', 1e9),
      lin('TB', 'TB', 1e12),
      lin('KiB', 'KiB', 1024),
      lin('MiB', 'MiB', 1024 ** 2),
      lin('GiB', 'GiB', 1024 ** 3),
      lin('TiB', 'TiB', 1024 ** 4),
    ],
  },
  angle: {
    base: 'rad',
    units: [lin('rad', 'rad', 1), lin('deg', '°', Math.PI / 180), lin('grad', 'grad', Math.PI / 200), lin('turn', 'turns', 2 * Math.PI)],
  },
  frequency: {
    base: 'hz',
    units: [lin('hz', 'Hz', 1), lin('khz', 'kHz', 1e3), lin('mhz', 'MHz', 1e6), lin('ghz', 'GHz', 1e9), lin('rpm', 'rpm', 1 / 60)],
  },
  density: {
    base: 'kgm3',
    units: [lin('kgm3', 'kg/m³', 1), lin('gcm3', 'g/cm³', 1000), lin('gml', 'g/mL', 1000), lin('lbft3', 'lb/ft³', 16.018463374)],
  },
  fuel: {
    // base: km per litre
    base: 'kmpl',
    units: [
      lin('kmpl', 'km/L', 1),
      lin('mpg', 'mpg (US)', 0.425143707),
      lin('mpguk', 'mpg (UK)', 0.354006189),
      { id: 'l100', label: 'L/100 km', toBase: (v) => 100 / v, fromBase: (v) => 100 / v },
    ] as Unit[],
  },
} satisfies Record<string, { base: string; units: Unit[] }>;

export type UnitGroup = keyof typeof UNIT_GROUPS;

export function getUnit(group: UnitGroup, id: string): Unit {
  const u = UNIT_GROUPS[group].units.find((x) => x.id === id);
  if (!u) throw new Error(`Unknown unit ${id} in ${group}`);
  return u;
}

export function toBase(group: UnitGroup, unitId: string, v: number): number {
  const u = getUnit(group, unitId);
  return u.toBase ? u.toBase(v) : v * (u.factor ?? 1);
}

export function fromBase(group: UnitGroup, unitId: string, v: number): number {
  const u = getUnit(group, unitId);
  return u.fromBase ? u.fromBase(v) : v / (u.factor ?? 1);
}

export function unitsFor(group: UnitGroup, subset?: string[]): Unit[] {
  const all = UNIT_GROUPS[group].units as Unit[];
  return subset ? subset.map((id) => getUnit(group, id)) : all;
}

export function defaultUnitFor(group: UnitGroup, preferred?: string, subset?: string[]): string {
  if (preferred) return preferred;
  if (subset?.length) return subset[0];
  return UNIT_GROUPS[group].base;
}
