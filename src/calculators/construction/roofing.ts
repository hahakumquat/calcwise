import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

const FT2 = 0.09290304;

export default defineCalculator({
  slug: 'roofing',
  title: 'Roofing Calculator',
  category: 'construction',
  description: 'Estimate roof area, roofing squares and shingle bundles from the house footprint and roof pitch.',
  keywords: ['roof area', 'roofing squares', 'shingle bundles', 'roof pitch', 'how many shingles', 'roof replacement'],
  inputs: [
    { id: 'length', label: 'Footprint length (incl. overhang)', type: 'number', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', default: 40, min: 0, info: 'Length of the house footprint seen from above, including the roof overhang at both ends.' },
    { id: 'width', label: 'Footprint width (incl. overhang)', type: 'number', unit: 'length', units: ['ft', 'm'], defaultUnit: 'ft', default: 30, min: 0, info: 'Width of the footprint including the eaves overhang on both sides.' },
    { id: 'pitch', label: 'Roof pitch', type: 'number', suffix: 'in 12', default: 6, min: 0, max: 24, help: 'Inches of rise per 12 inches of run, e.g. 6 for a 6/12 roof.', info: 'Inches of vertical rise per 12 inches of horizontal run. 4/12–6/12 is common; 12/12 is a 45° roof.' },
    { id: 'waste', label: 'Waste allowance', type: 'number', suffix: '%', default: 10, min: 0, max: 50, help: '10% for simple gables, 15% or more for hips and valleys.', info: 'Extra shingles for starter rows, ridge caps and cut-offs. 10% for simple gables, 15%+ for complex roofs.' },
    { id: 'bundlesPerSquare', label: 'Bundles per square', type: 'number', default: 3, min: 1, step: 1, info: 'How many bundles cover one 100 ft² square. Most asphalt shingles are 3; heavy designer shingles can be 4–5.' },
  ],
  outputs: [
    { id: 'roofArea', label: 'Roof area', unit: 'area', units: ['ft2', 'm2'], defaultUnit: 'ft2', precision: 0, primary: true, info: 'The sloped surface area of the roof before waste: footprint × pitch multiplier.' },
    { id: 'squares', label: 'Squares to order (with waste)', precision: 2, info: 'Roofing squares to order (1 square = 100 ft²), including the waste allowance.' },
    { id: 'bundles', label: 'Shingle bundles', format: 'integer', info: 'Shingle bundles to buy, rounded up.' },
    { id: 'factor', label: 'Pitch multiplier', precision: 4, info: 'How much larger the sloped roof is than its footprint: √(1 + (rise ÷ 12)²).' },
    { id: 'angle', label: 'Roof angle', precision: 1, suffix: '°', info: 'The roof slope in degrees from horizontal.' },
  ],
  compute: (v) => {
    const L = num(v.length);
    const W = num(v.width);
    const p = num(v.pitch);
    const waste = num(v.waste) ?? 0;
    const bps = num(v.bundlesPerSquare) ?? 3;
    if (L === null || W === null || p === null || L < 0 || W < 0 || p < 0 || waste < 0 || bps <= 0) return { roofArea: null };
    const factor = Math.sqrt(1 + (p / 12) ** 2);
    const roofArea = L * W * factor;
    const squares = ((roofArea / FT2) * (1 + waste / 100)) / 100;
    return {
      chart: {
        type: 'bar',
        title: 'From footprint to order',
        categories: ['Footprint', 'Roof surface', 'With waste'],
        series: [{ name: 'Area', values: [L * W, roofArea, roofArea * (1 + waste / 100)] }],
        format: { unit: 'area' },
        highlight: 2,
      },
      roofArea,
      squares,
      bundles: ceilSafe(squares * bps),
      factor,
      angle: (Math.atan(p / 12) * 180) / Math.PI,
      note: p < 2 ? 'Pitches under 2/12 are low-slope: standard asphalt shingles are not allowed — use membrane roofing.' : p < 4 ? 'Pitches of 2/12 to 4/12 need a double underlayment for asphalt shingles.' : undefined,
      steps: [
        `Footprint = ${((L * W) / FT2).toFixed(0)} ft²`,
        `Pitch multiplier = √(1 + (${p}/12)²) = ${factor.toFixed(4)}`,
        `Roof area = ${(roofArea / FT2).toFixed(0)} ft² → × ${1 + waste / 100} ÷ 100 = ${squares.toFixed(2)} squares`,
      ],
    };
  },
  content: {
    formula: ['Pitch multiplier = √(1 + (rise ÷ 12)²)', 'Roof area = footprint × multiplier', 'Squares = roof area × (1 + waste) ÷ 100 ft²', 'Bundles = squares × 3 (typical 3-tab or architectural shingles)'],
    body: [
      'A sloped roof has more surface than the ground it covers. Measure the house footprint including the eaves overhang, then multiply by a pitch factor: a 6/12 roof rises 6 inches for every 12 inches of run, so its surface is √(1 + 0.5²) ≈ 1.118 times the footprint.',
      'Roofing is ordered in “squares” of 100 ft². Most shingles come three bundles to the square, though some heavy designer shingles need four or five — check the wrapper. Add waste for starter strips, ridge caps and cut-offs at hips and valleys.',
      'This method assumes the whole roof has one pitch. For roofs with mixed slopes, dormers or large porches, work out each section separately and add them together, or ask a roofer to measure from aerial imagery.',
    ],
    faq: [
      { q: 'How do I find my roof pitch?', a: 'Hold a level horizontally against the rafter or roof surface, measure 12 inches along it, and measure straight up to the roof. That rise in inches is the pitch (x/12).' },
      { q: 'Does the gable shape matter?', a: 'Not for area. Gable and hip roofs with the same footprint and the same pitch on every plane have the same surface area; hips just create more waste.' },
    ],
  },
  related: ['square-footage', 'drywall', 'board-feet'],
  examples: [
    // 40 × 30 = 1200 ft² × √1.25 = 1341.64 ft² = 124.6426 m²; 13.416 squares → 41 bundles
    { values: { length: 12.192, width: 9.144, pitch: 6, waste: 0, bundlesPerSquare: 3 }, expect: { roofArea: 1200 * Math.sqrt(1.25) * 0.09290304, squares: 13.416407865, bundles: 41, angle: 26.565051177 }, tolerance: 1e-8 },
    { values: { length: 12.192, width: 9.144, pitch: 6, waste: 10, bundlesPerSquare: 3 }, expect: { squares: 14.758048651, bundles: 45 }, tolerance: 1e-8 },
  ],
});
