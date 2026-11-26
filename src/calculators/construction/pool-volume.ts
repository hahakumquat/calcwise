import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const FT = 0.3048;
const FT3 = 0.028316846592; // m³ per ft³
const GAL = 0.003785411784; // m³ per US gallon (1 ft³ = 7.480519 gal)

export default defineCalculator({
  slug: 'pool-volume',
  title: 'Pool Volume Calculator',
  category: 'construction',
  description: 'Find how many gallons or litres a rectangular, round or oval swimming pool holds, plus what it costs to fill with water.',
  metaDescription: 'Pool volume calculator: gallons and litres for rectangular, round or oval pools from length, width and average depth, plus an optional fill cost.',
  keywords: ['pool volume', 'how many gallons in a pool', 'swimming pool gallons', 'pool fill cost', 'oval pool volume', 'round pool volume', 'pool litres'],
  inputs: [
    {
      id: 'shape', label: 'Pool shape', type: 'select', segmented: true, default: 'rect',
      options: [{ value: 'rect', label: 'Rectangle' }, { value: 'round', label: 'Round' }, { value: 'oval', label: 'Oval' }],
      info: 'Rectangle for square-cornered pools, round for circular above-ground pools, oval for ellipse-shaped pools.',
    },
    { id: 'length', label: 'Length', type: 'number', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', default: 20, min: 0, showWhen: { input: 'shape', is: ['rect', 'oval'] }, info: 'The longest side of the pool, measured at the waterline.' },
    { id: 'width', label: 'Width', type: 'number', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', default: 10, min: 0, showWhen: { input: 'shape', is: ['rect', 'oval'] }, info: 'The shorter side of the pool, measured at the waterline.' },
    { id: 'diameter', label: 'Diameter', type: 'number', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', default: 15, min: 0, showWhen: { input: 'shape', is: 'round' }, info: 'Distance straight across the pool through the centre, at the waterline.' },
    { id: 'depth', label: 'Average water depth', type: 'number', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', default: 5, min: 0, help: 'For a sloped floor, use (shallow + deep) ÷ 2.', info: 'Average depth of the water, not the wall height. If the floor slopes evenly, add the shallow and deep ends and divide by 2.' },
    { id: 'price', label: 'Water price per 1,000 gal', type: 'number', prefix: '$', min: 0, step: 0.01, optional: true, placeholder: 'Optional', info: 'Your water rate per 1,000 US gallons, from your utility bill. Leave blank to skip the fill cost.' },
  ],
  outputs: [
    { id: 'volume', label: 'Pool volume', unit: 'volume', units: ['gal', 'l', 'm3', 'ft3'], defaultUnit: 'gal', precision: 0, primary: true, info: 'Water the pool holds at the average depth you entered, in US gallons by default.' },
    { id: 'litres', label: 'Volume in litres', format: 'number', suffix: 'L', precision: 0, info: 'The same volume in litres (1 US gallon = 3.78541 L).' },
    { id: 'cost', label: 'Cost to fill', format: 'currency', info: 'Gallons ÷ 1,000 × your price per 1,000 gallons. Shown only if you enter a price.' },
  ],
  compute: (v) => {
    const shape = typeof v.shape === 'string' ? v.shape : 'rect';
    const d = num(v.depth);
    if (d === null || d <= 0) return { volume: null };
    let area: number | null;
    let stepText: string;
    if (shape === 'round') {
      const dia = num(v.diameter);
      if (dia === null || dia <= 0) return { volume: null };
      area = Math.PI * (dia / 2) ** 2;
      stepText = `Area = π × (${(dia / FT).toFixed(2)} ft ÷ 2)² = ${(area / FT ** 2).toFixed(2)} ft²`;
    } else {
      const L = num(v.length);
      const W = num(v.width);
      if (L === null || W === null || L <= 0 || W <= 0) return { volume: null };
      area = shape === 'oval' ? (Math.PI / 4) * L * W : L * W;
      stepText = shape === 'oval'
        ? `Area = π ÷ 4 × ${(L / FT).toFixed(2)} ft × ${(W / FT).toFixed(2)} ft = ${(area / FT ** 2).toFixed(2)} ft²`
        : `Area = ${(L / FT).toFixed(2)} ft × ${(W / FT).toFixed(2)} ft = ${(area / FT ** 2).toFixed(2)} ft²`;
    }
    const volume = area * d; // m³
    const gal = volume / GAL;
    const price = num(v.price);
    const cost = price !== null && price >= 0 ? (gal / 1000) * price : null;
    const size = gal < 5000 ? 'Small pool' : gal < 20000 ? 'Medium pool' : 'Large pool';
    const depths = [-2, -1, 0, 1, 2].map((k) => d + k * FT).filter((x) => x > 0);
    return {
      volume,
      litres: volume * 1000,
      cost,
      tone: 'ok',
      badge: size,
      note: 'Fill to the waterline, not the wall top: a pool is usually filled about 4–6 in below the rim.',
      chart: {
        type: 'bar',
        title: 'Gallons at different average depths',
        categories: depths.map((x) => `${(x / FT).toFixed(1)} ft`),
        series: [{ name: 'US gallons', values: depths.map((x) => (area as number) * x / GAL) }],
        format: { format: 'integer' },
        highlight: depths.findIndex((x) => Math.abs(x - d) < 1e-9),
      },
      steps: [
        stepText,
        `Volume = ${(area / FT ** 2).toFixed(2)} ft² × ${(d / FT).toFixed(2)} ft = ${(volume / FT3).toFixed(1)} ft³`,
        `Gallons = ${(volume / FT3).toFixed(1)} ft³ × 7.48052 = ${gal.toFixed(0)} US gal`,
      ],
    };
  },
  content: {
    formula: [
      'Rectangle: ft³ = length × width × average depth',
      'Round: ft³ = π × (diameter ÷ 2)² × average depth',
      'Oval: ft³ = π ÷ 4 × length × width × average depth',
      'US gallons = ft³ × 7.48052; litres = US gallons × 3.78541',
    ],
    body: [
      'Multiply the pool’s surface area by its average depth to get cubic feet, then convert to gallons. A 20 × 10 ft rectangle with an average depth of 5 ft holds 20 × 10 × 5 = 1,000 ft³, which is 7,480.5 US gallons or about 28,317 litres. At $5 per 1,000 gallons, filling it costs about $37.40.',
      'A round pool 15 ft across and 4 ft deep is π × 7.5² × 4 = 706.9 ft³, or about 5,288 gallons. An oval pool uses π ÷ 4 of the rectangle that would enclose it, so a 20 × 10 ft oval at 5 ft deep holds about 5,875 gallons, roughly 79% of the rectangle.',
    ],
    sections: [
      {
        heading: 'Use the average depth for a sloped floor',
        paragraphs: [
          'Most pools are shallower at one end. For a floor that slopes evenly, add the shallow and deep depths and divide by 2: a pool that runs from 3 ft to 8 ft has an average depth of 5.5 ft. If the floor has a steep drop or a separate deep hole, split the pool into sections, calculate each one and add them together.',
          'Measure depth to the water level you actually run, not to the top of the wall. Most pools are kept a few inches below the rim, so a wall-top measurement overstates the volume slightly.',
        ],
      },
      {
        heading: 'Why pool volume matters',
        paragraphs: [
          'Chemical doses, pump and filter sizing, heater sizing and cover choices are all based on gallons. The volume also sets your fill cost and how long a hose takes to fill the pool. Take the water price from your utility bill, and check whether sewer charges apply to water that does not return to the drain.',
        ],
      },
    ],
    faq: [
      { q: 'How many gallons are in a 20 × 10 ft pool that is 5 ft deep?', a: '7,480.5 US gallons. 20 × 10 × 5 = 1,000 ft³, and 1 ft³ is 7.48052 US gallons.' },
      { q: 'How many gallons are in a 15 ft round pool that is 4 ft deep?', a: 'About 5,288 US gallons. The area is π × 7.5² = 176.7 ft², times 4 ft is 706.9 ft³, times 7.48052.' },
      { q: 'How do I calculate the volume of an oval pool?', a: 'Multiply π ÷ 4 (0.7854) by the length, the width and the average depth, then multiply by 7.48052 for US gallons.' },
      { q: 'What depth should I use if my pool slopes?', a: 'Use the average of the shallow and deep ends. A floor that slopes evenly from 3 ft to 8 ft averages 5.5 ft.' },
      { q: 'How much does it cost to fill a pool?', a: 'Gallons ÷ 1,000 × your water price per 1,000 gallons. For 7,480.5 gallons at $5 per 1,000 gallons, that is about $37.40. This excludes any sewer charges.' },
    ],
    sources: [
      { label: 'NIST unit conversion: US gallon = 231 cubic inches (3.785411784 L)', url: 'https://www.nist.gov/pml/owm/metric-si/unit-conversion' },
    ],
  },
  related: ['concrete', 'gravel', 'square-footage'],
  examples: [
    // 20 × 10 × 5 ft = 1000 ft³ = 28.316846592 m³ = 7480.519 gal; 7.480519 × $5 = $37.4026
    { values: { shape: 'rect', length: 6.096, width: 3.048, depth: 1.524, price: 5 }, expect: { volume: 28.316846592, litres: 28316.846592, cost: 37.402595 }, tolerance: 1e-4 },
    // 15 ft round × 4 ft: π × 7.5² × 4 = 706.8583 ft³ = 20.016 m³ = 5287.8 gal
    { values: { shape: 'round', diameter: 4.572, depth: 1.2192 }, expect: { volume: 20.016 }, tolerance: 1e-4 },
    // 20 × 10 oval × 5 ft: π/4 × 200 × 5 = 785.3982 ft³ = 22.24 m³
    { values: { shape: 'oval', length: 6.096, width: 3.048, depth: 1.524 }, expect: { volume: 22.24 }, tolerance: 1e-4 },
  ],
});
