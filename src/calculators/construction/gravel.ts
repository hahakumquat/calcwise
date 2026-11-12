import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const TON = 907.18474;

export default defineCalculator({
  slug: 'gravel',
  title: 'Gravel Calculator',
  category: 'construction',
  description: 'Estimate the cubic yards and tons of gravel, crushed stone or sand needed to cover an area to a given depth.',
  keywords: ['tons of gravel', 'crushed stone', 'driveway gravel', 'pea gravel', 'sand calculator', 'aggregate'],
  inputs: [
    { id: 'area', label: 'Area', type: 'number', unit: 'area', units: ['ft2', 'm2', 'yd2'], defaultUnit: 'ft2', default: 100, min: 0, info: 'The surface to cover, such as a driveway, path or patio base.' },
    { id: 'depth', label: 'Depth', type: 'number', unit: 'length', units: ['in', 'cm', 'ft'], defaultUnit: 'in', default: 3, min: 0, info: 'Layer thickness. 2–3 in for paths, 4–6 in or more for driveway bases.' },
    {
      id: 'density',
      info: 'Weight per unit volume of the loose material. Gravel and crushed stone run about 95–110 lb/ft³ (1.3–1.5 tons per cubic yard).',
      label: 'Material density',
      type: 'number',
      unit: 'density',
      units: ['lbft3', 'kgm3'],
      defaultUnit: 'lbft3',
      default: 105,
      min: 0,
      help: 'Typical: gravel / crushed stone 95–110 lb/ft³, dry sand ~100, topsoil ~75.',
    },
    { id: 'pricePerTon', label: 'Price per ton', type: 'number', prefix: '$', min: 0, optional: true, placeholder: 'Optional', info: 'Supplier price per US ton, if you want a cost estimate. Delivery is usually extra.' },
  ],
  outputs: [
    { id: 'weight', label: 'Weight', unit: 'mass', units: ['ton', 't', 'lb', 'kg'], defaultUnit: 'ton', precision: 2, primary: true, info: 'Total weight of material to order. Quarries usually sell by the ton.' },
    { id: 'volume', label: 'Volume', unit: 'volume', units: ['yd3', 'ft3', 'm3'], defaultUnit: 'yd3', precision: 2, info: 'Volume of material: area × depth.' },
    { id: 'cost', label: 'Cost', format: 'currency', info: 'Weight in US tons × price per ton.' },
  ],
  compute: (v) => {
    const A = num(v.area);
    const d = num(v.depth);
    const rho = num(v.density);
    if (A === null || d === null || rho === null || A < 0 || d < 0 || rho <= 0) return { weight: null };
    const volume = A * d;
    const weight = volume * rho;
    const price = num(v.pricePerTon);
    const LBFT3 = 16.018463374;
    const mats: [string, number][] = [['Topsoil (~75 lb/ft³)', 75], ['Mulch (~25 lb/ft³)', 25], ['Sand (~100 lb/ft³)', 100], ['Crushed stone (~110 lb/ft³)', 110]];
    return {
      chart: {
        type: 'bar',
        title: 'Same volume, different materials',
        horizontal: true,
        categories: ['Your material', ...mats.map((m) => m[0])],
        series: [{ name: 'Weight', values: [weight, ...mats.map((m) => volume * m[1] * LBFT3)] }],
        format: { unit: 'mass' },
        highlight: 0,
      },
      weight,
      volume,
      cost: price !== null ? (weight / TON) * price : null,
      steps: [`Volume = area × depth = ${(volume / 0.764554857984).toFixed(3)} yd³`, `Weight = volume × density = ${(weight / 0.45359237).toFixed(0)} lb = ${(weight / TON).toFixed(3)} US tons`],
    };
  },
  content: {
    formula: ['Volume = area × depth', 'Weight = volume × density', '1 US ton = 2,000 lb; 1 yd³ = 27 ft³'],
    body: [
      'Quarries sell gravel by weight but you design by volume, so the calculation has two steps: area × depth gives the volume, and volume × density gives the weight. At about 105 lb/ft³, a cubic yard of gravel weighs roughly 2,800 lb, or 1.4 US tons.',
      'Density depends on the stone and how wet it is. Washed, uniform pea gravel packs less tightly than crushed stone with fines (such as #57 or crusher run), and wet material is heavier. Ask your supplier for their figure if you need an exact order.',
      'For driveways, plan 4–6 inches of compacted base under a 2–3 inch top layer; for walkways and patios, 2–3 inches over landscape fabric is typical. Compaction reduces depth by about 10%, so add that margin when ordering for a compacted base.',
    ],
    faq: [
      { q: 'How many tons are in a cubic yard of gravel?', a: 'Usually 1.3–1.5 US tons, depending on the stone size and moisture. 1.4 is a good planning number.' },
      { q: 'What is the difference between a ton and a tonne?', a: 'A US (short) ton is 2,000 lb (907 kg); a metric tonne is 1,000 kg (2,205 lb). Switch the output unit to match your supplier.' },
    ],
  },
  related: ['concrete', 'mulch', 'square-footage', 'weight-converter'],
  examples: [
    // 100 ft² × 3 in = 25 ft³; × 105 lb/ft³ = 2,625 lb = 1.3125 tons = 1190.68 kg
    { values: { area: 9.290304, depth: 0.0762, density: 105 * 16.018463374, pricePerTon: 40 }, expect: { weight: 1190.6799713, volume: 0.7079211648, cost: 52.5 }, tolerance: 1e-6 },
  ],
});
