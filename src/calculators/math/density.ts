import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const M = { type: 'number' as const, unit: 'mass' as const, units: ['g', 'kg', 'lb'], min: 0 };
const V = { type: 'number' as const, unit: 'volume' as const, units: ['m3', 'l', 'cm3', 'ml', 'ft3'], min: 0 };
const D = { type: 'number' as const, unit: 'density' as const, units: ['kgm3', 'gcm3', 'gml', 'lbft3'], min: 0 };
const when = (...modes: string[]) => ({ input: 'mode', is: modes });

// Approximate, well-known room-temperature values in kg/m3.
const MATERIALS: [string, number][] = [
  ['Cork', 240],
  ['Ice', 917],
  ['Water', 1000],
  ['Aluminium', 2700],
  ['Iron', 7870],
  ['Copper', 8960],
  ['Lead', 11340],
  ['Gold', 19300],
];

export default defineCalculator({
  slug: 'density',
  title: 'Density Calculator',
  category: 'math',
  description: 'Find density, mass or volume from the other two, with kg, g, lb, litre, mL and cubic units. Includes a table of common material densities.',
  metaDescription: 'Solve density, mass or volume from the other two. Pick kg, g or lb and m3, L, mL or ft3, and compare with water, iron and other common materials.',
  keywords: ['density calculator', 'mass volume density', 'density formula', 'how to calculate density', 'density of water', 'mass from density and volume'],
  updated: '2026-11-26',
  inputs: [
    {
      id: 'mode', label: 'Solve for', type: 'select', default: 'density',
      options: [{ value: 'density', label: 'Density' }, { value: 'mass', label: 'Mass' }, { value: 'volume', label: 'Volume' }],
      info: 'Pick the one you do not know. The other two fields stay.',
    },
    { id: 'mass', label: 'Mass', ...M, defaultUnit: 'g', default: 500, showWhen: when('density', 'volume'), info: 'How much matter the object has, as weighed on a scale.' },
    { id: 'volume', label: 'Volume', ...V, defaultUnit: 'ml', default: 250, showWhen: when('density', 'mass'), info: 'The space the object takes up. 1 mL equals 1 cm³ and 1 L equals 1,000 mL.' },
    { id: 'density', label: 'Density', ...D, defaultUnit: 'gml', default: 2, showWhen: when('mass', 'volume'), info: 'Mass per unit of volume. Water is about 1 g/mL, which is 1,000 kg/m³.' },
  ],
  outputs: [
    { id: 'rho', label: 'Density', unit: 'density', units: ['kgm3', 'gcm3', 'gml', 'lbft3'], defaultUnit: 'kgm3', primary: true, precision: 4, showWhen: when('density'), info: 'Density = mass ÷ volume.' },
    { id: 'mOut', label: 'Mass', unit: 'mass', units: ['g', 'kg', 'lb'], defaultUnit: 'kg', primary: true, precision: 4, showWhen: when('mass'), info: 'Mass = density × volume.' },
    { id: 'vOut', label: 'Volume', unit: 'volume', units: ['m3', 'l', 'cm3', 'ml', 'ft3'], defaultUnit: 'l', primary: true, precision: 4, showWhen: when('volume'), info: 'Volume = mass ÷ density.' },
  ],
  compute: (v) => {
    const mode = v.mode === 'mass' || v.mode === 'volume' ? (v.mode as string) : 'density';
    const m = num(v.mass), vol = num(v.volume), d = num(v.density);
    let mass: number, volume: number, rho: number;
    let step: string;
    if (mode === 'density') {
      if (m === null || vol === null) return { rho: null };
      if (m < 0 || vol < 0) return { rho: null, error: 'Mass and volume cannot be negative.' };
      if (vol === 0) return { rho: null, error: 'Volume must be more than zero.' };
      mass = m; volume = vol; rho = m / vol;
      step = `Density = ${fmt(mass)} kg ÷ ${fmt(volume)} m³ = ${fmt(rho)} kg/m³`;
    } else if (mode === 'mass') {
      if (d === null || vol === null) return { mOut: null };
      if (d < 0 || vol < 0) return { mOut: null, error: 'Density and volume cannot be negative.' };
      rho = d; volume = vol; mass = d * vol;
      step = `Mass = ${fmt(rho)} kg/m³ × ${fmt(volume)} m³ = ${fmt(mass)} kg`;
    } else {
      if (d === null || m === null) return { vOut: null };
      if (d < 0 || m < 0) return { vOut: null, error: 'Density and mass cannot be negative.' };
      if (d === 0) return { vOut: null, error: 'Density must be more than zero.' };
      rho = d; mass = m; volume = m / d;
      step = `Volume = ${fmt(mass)} kg ÷ ${fmt(rho)} kg/m³ = ${fmt(volume)} m³`;
    }

    const out: Record<string, number> = mode === 'density' ? { rho } : mode === 'mass' ? { mOut: mass } : { vOut: volume };
    const rel = rho > 1000 ? 'denser than water, so it sinks' : rho < 1000 ? 'less dense than water, so it floats' : 'the same density as water';
    const sorted = [...MATERIALS.map(([n, x]) => ({ n, x })), { n: 'Your sample', x: rho }].sort((a, b) => a.x - b.x);
    return {
      ...out,
      tone: 'ok',
      badge: rho > 1000 ? 'Denser than water' : rho < 1000 ? 'Less dense than water' : 'Same as water',
      note: `A density of ${fmt(rho)} kg/m³ is ${rel}. Values are in SI units internally; change the result unit to see it in others.`,
      steps: [
        'Everything is converted to kg and m³ first.',
        step,
        `Water is about 1,000 kg/m³, so this is ${fmt(rho / 1000)} times the density of water.`,
      ],
      chart: {
        type: 'bar' as const,
        title: 'Your density next to common materials (kg/m³, approximate)',
        categories: sorted.map((s) => s.n),
        series: [{ name: 'Density', values: sorted.map((s) => s.x) }],
        format: { format: 'number' as const, suffix: ' kg/m³' },
        horizontal: true,
        highlight: sorted.findIndex((s) => s.n === 'Your sample'),
      },
    };
  },
  content: {
    formula: ['Density = mass ÷ volume', 'Mass = density × volume', 'Volume = mass ÷ density'],
    body: [
      'Density tells you how much matter is packed into a given space. Pick what you want to find, enter the other two values in whatever units you have, and the calculator converts everything to kilograms and cubic metres before solving.',
      'Water is the usual yardstick: about 1 g/mL, 1 kg per litre or 1,000 kg/m³. Anything with a higher density sinks in water and anything lower floats, provided it is solid and not hollow. The chart places your result among a few common materials.',
      'Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'Common material densities',
        paragraphs: [
          'Approximate room-temperature values, in kg/m³. Real samples vary with temperature, purity and alloy, so treat these as rough guides, not specifications.',
          'Cork 240. Ice 917. Water 1,000. Aluminium 2,700. Iron 7,870. Copper 8,960. Lead 11,340. Gold 19,300. For comparison, air is about 1.2 kg/m³.',
          'To convert: 1 g/cm³ = 1 g/mL = 1,000 kg/m³, and 1 lb/ft³ is about 16.02 kg/m³.',
        ],
      },
    ],
    faq: [
      { q: 'What is the density of 500 g in 250 mL?', a: '500 g ÷ 250 mL = 2 g/mL, which is 2,000 kg/m³. That is twice the density of water.' },
      { q: 'How do I find mass from density and volume?', a: 'Multiply them. A 2 litre bottle of water (1,000 kg/m³, or 0.002 m³) has a mass of 1,000 × 0.002 = 2 kg.' },
      { q: 'How do I find volume from mass and density?', a: 'Divide mass by density. 7.87 kg of iron at 7,870 kg/m³ is 7.87 ÷ 7,870 = 0.001 m³, which is 1 litre.' },
      { q: 'How do I convert pounds per cubic foot to kg/m³?', a: 'Multiply by about 16.0185. For example 10 lb in 1 ft³ is 10 lb/ft³, or about 160.18 kg/m³.' },
      { q: 'What is the density of water?', a: 'About 1,000 kg/m³ (1 g/mL) near 4 °C, and slightly less when warmer. This calculator treats it as 1,000 kg/m³.' },
    ],
    sources: [],
  },
  related: ['volume', 'weight-converter', 'volume-converter', 'ratio'],
  examples: [
    // 500 g = 0.5 kg; 250 mL = 0.00025 m3; 0.5 / 0.00025 = 2000 kg/m3 (= 2 g/mL)
    { values: { mode: 'density', mass: 0.5, volume: 0.00025 }, expect: { rho: 2000 }, tolerance: 1e-9 },
    // water 1000 kg/m3 * 2 L (0.002 m3) = 2 kg
    { values: { mode: 'mass', density: 1000, volume: 0.002 }, expect: { mOut: 2 }, tolerance: 1e-9 },
    // iron: 7.87 kg / 7870 kg/m3 = 0.001 m3 (1 L)
    { values: { mode: 'volume', mass: 7.87, density: 7870 }, expect: { vOut: 0.001 }, tolerance: 1e-12 },
    // 10 lb = 4.5359237 kg; 1 ft3 = 0.028316846592 m3; ratio = 10 * 1.6018463374e1/10 = 160.18463374 kg/m3
    { values: { mode: 'density', mass: 4.5359237, volume: 0.028316846592 }, expect: { rho: 160.18463374 }, tolerance: 1e-5 },
  ],
});
