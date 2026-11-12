import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

const FT2 = 0.09290304;
const GAL = 0.003785411784;
const DOOR_FT2 = 20; // ~3 × 6.7 ft
const WINDOW_FT2 = 15; // ~3 × 5 ft

export default defineCalculator({
  slug: 'paint',
  title: 'Paint Calculator',
  category: 'construction',
  description: 'Estimate how many gallons of paint a room needs from its size, doors, windows and number of coats.',
  keywords: ['how much paint', 'gallons of paint', 'wall paint', 'paint coverage', 'room painting estimate'],
  inputs: [
    { id: 'length', label: 'Room length', type: 'number', unit: 'length', units: ['ft', 'm', 'in'], defaultUnit: 'ft', default: 12, min: 0, info: 'The length of the room along one wall, measured at floor level.' },
    { id: 'width', label: 'Room width', type: 'number', unit: 'length', units: ['ft', 'm', 'in'], defaultUnit: 'ft', default: 12, min: 0, info: 'The width of the room along the adjoining wall.' },
    { id: 'height', label: 'Wall height', type: 'number', unit: 'length', units: ['ft', 'm', 'in'], defaultUnit: 'ft', default: 8, min: 0, info: 'Floor-to-ceiling height of the walls. Most US rooms are 8 ft; newer homes often 9 ft.' },
    { id: 'doors', label: 'Doors', type: 'number', default: 1, min: 0, step: 1, optional: true, info: 'Doors you will not paint. Each standard door removes about 20 ft² from the wall area.' },
    { id: 'windows', label: 'Windows', type: 'number', default: 2, min: 0, step: 1, optional: true, info: 'Windows in the walls. Each average window removes about 15 ft².' },
    { id: 'coats', label: 'Coats', type: 'number', default: 2, min: 1, step: 1, info: 'How many coats you plan to apply. Two is normal for a color change or new drywall.' },
    { id: 'coverage', label: 'Coverage per gallon', type: 'number', suffix: 'ft²/gal', default: 350, min: 1, help: 'Check the can; most interior paints cover 250–400 ft² per gallon (about 6–10 m² per litre).', info: 'Square feet one gallon covers per coat, printed on the can. Use 300 for rough or porous walls.' },
    { id: 'ceiling', label: 'Paint the ceiling too', type: 'toggle', default: false, info: 'Adds the ceiling area (length × width) to the paintable surface.' },
  ],
  outputs: [
    { id: 'paint', label: 'Paint needed', unit: 'volume', units: ['gal', 'l', 'qt'], defaultUnit: 'gal', precision: 2, primary: true, info: 'Total paint for all coats. Switch to litres or quarts if you prefer.' },
    { id: 'cans', label: 'Gallon cans to buy', format: 'integer', info: 'Whole one-gallon cans to buy, rounded up. Leftover paint is handy for touch-ups.' },
    { id: 'area', label: 'Paintable area (one coat)', unit: 'area', units: ['ft2', 'm2'], defaultUnit: 'ft2', precision: 1, info: 'Walls minus doors and windows, plus the ceiling if selected — the surface for one coat.' },
  ],
  compute: (v) => {
    const L = num(v.length);
    const W = num(v.width);
    const H = num(v.height);
    const coats = num(v.coats);
    const cov = num(v.coverage);
    if (L === null || W === null || H === null || !coats || !cov || L < 0 || W < 0 || H < 0 || coats < 0 || cov <= 0) return { paint: null };
    const doors = num(v.doors) ?? 0;
    const windows = num(v.windows) ?? 0;
    const walls = 2 * (L + W) * H;
    const openings = (doors * DOOR_FT2 + windows * WINDOW_FT2) * FT2;
    const ceiling = v.ceiling === 'on' ? L * W : 0;
    const area = Math.max(0, walls - openings) + ceiling;
    const gallons = ((area / FT2) * coats) / cov;
    return {
      chart: {
        type: 'donut',
        title: 'Surface breakdown',
        format: { unit: 'area' },
        slices: [
          { label: 'Walls to paint', value: Math.max(0, walls - openings) },
          ...(ceiling ? [{ label: 'Ceiling', value: ceiling }] : []),
          { label: 'Doors & windows (skipped)', value: Math.min(walls, openings) },
        ],
        centerValue: gallons.toFixed(2),
        centerLabel: 'gallons',
      },
      paint: gallons * GAL,
      cans: ceilSafe(gallons),
      area,
      note: gallons < 0.25 ? 'A quart (¼ gal) should be enough.' : undefined,
      steps: [
        `Walls = 2 × (L + W) × H = ${(walls / FT2).toFixed(1)} ft²`,
        `− ${doors} door(s) × 20 ft² − ${windows} window(s) × 15 ft²${ceiling ? ` + ceiling ${(ceiling / FT2).toFixed(1)} ft²` : ''} = ${(area / FT2).toFixed(1)} ft²`,
        `Paint = ${(area / FT2).toFixed(1)} × ${coats} coats ÷ ${cov} = ${gallons.toFixed(2)} gal`,
      ],
    };
  },
  content: {
    formula: ['Wall area = 2 × (length + width) × height − openings', 'Gallons = area × coats ÷ coverage per gallon'],
    body: [
      'Add up the area of the four walls, subtract the doors and windows you will not paint, multiply by the number of coats and divide by the coverage printed on the can. A typical door takes out about 20 ft² and an average window about 15 ft².',
      'Two coats are the norm for a color change or fresh drywall (which should also be primed); one coat may do when refreshing the same color. Rough or porous surfaces such as textured plaster, brick or bare wood soak up more paint, so use the low end of the coverage range.',
      'Buy whole gallons and keep the leftover for touch-ups — it is far easier than matching a color later. For large jobs, a 5-gallon bucket is usually cheaper than five single gallons.',
    ],
    faq: [
      { q: 'How much does a gallon of paint cover?', a: 'Most interior wall paints claim 350–400 ft² per gallon on smooth, primed walls. Real-world coverage is often closer to 300–350 ft².' },
      { q: 'Should I include trim?', a: 'Trim, doors and cabinets are usually painted in a different sheen, so estimate them separately. A quart covers the trim of an average room.' },
    ],
  },
  related: ['drywall', 'square-footage', 'flooring'],
  examples: [
    // 2 × (12 + 12) × 8 = 384 ft² − 20 − 30 = 334 ft²; × 2 ÷ 350 = 1.90857 gal
    { values: { length: 3.6576, width: 3.6576, height: 2.4384, doors: 1, windows: 2, coats: 2, coverage: 350, ceiling: 'off' }, expect: { paint: 1.9085714286 * 0.003785411784, cans: 2, area: 334 * 0.09290304 }, tolerance: 1e-8 },
    // With the 144 ft² ceiling: 478 ft² × 2 ÷ 350 = 2.7314 gal → 3 cans
    { values: { length: 3.6576, width: 3.6576, height: 2.4384, doors: 1, windows: 2, coats: 2, coverage: 350, ceiling: 'on' }, expect: { cans: 3 } },
  ],
});
