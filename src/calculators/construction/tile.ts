import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

const ROOM = { unit: 'length' as const, units: ['ft', 'm'], defaultUnit: 'ft' };
const TILE = { unit: 'length' as const, units: ['in', 'cm', 'mm'], defaultUnit: 'in' };

export default defineCalculator({
  slug: 'tile',
  title: 'Tile Calculator',
  category: 'construction',
  description: 'How many floor or wall tiles do you need? Enter the room and tile size, grout joint and waste allowance to get tiles and boxes to buy.',
  keywords: ['tile calculator', 'how many tiles do i need', 'floor tile calculator', 'tile with grout joint', 'tile waste factor', 'boxes of tile'],
  inputs: [
    { id: 'length', label: 'Room length', type: 'number', ...ROOM, default: 3.048, min: 0, info: 'Length of the area to tile. For an L-shaped room, split it into rectangles and add the tiles from each.' },
    { id: 'width', label: 'Room width', type: 'number', ...ROOM, default: 3.6576, min: 0, info: 'Width of the area to tile.' },
    { id: 'tileLen', label: 'Tile length', type: 'number', ...TILE, default: 0.3048, min: 0, info: 'Printed on the box. A "12 × 12" tile is 12 inches on each side. Use the real size, not the nominal one, if they differ.' },
    { id: 'tileWid', label: 'Tile width', type: 'number', ...TILE, default: 0.3048, min: 0, info: 'For a square tile, enter the same value as the length.' },
    { id: 'joint', label: 'Grout joint width', type: 'number', unit: 'length', units: ['in', 'mm'], defaultUnit: 'in', default: 0.003175, min: 0, help: '1/8 in is about 3 mm.', info: 'Gap between tiles. Each tile takes up its own size plus one joint. Enter 0 for rectified tiles laid tight.' },
    { id: 'waste', label: 'Waste allowance', type: 'number', suffix: '%', default: 10, min: 0, max: 100, help: 'About 10% for straight layouts; 15% or more for diagonal or complex ones. A rule of thumb.', info: 'Extra tiles for cuts, breakage and mistakes. About 10% is common for a straight layout and 15% or more for diagonal, herringbone or small rooms with many cuts.' },
    { id: 'perBox', label: 'Tiles per box', type: 'number', default: 10, min: 1, step: 1, optional: true, placeholder: 'Optional', info: 'Printed on the box. Leave blank if you only need the tile count.' },
  ],
  outputs: [
    { id: 'tiles', label: 'Tiles to buy', format: 'integer', primary: true, info: 'Tiles covering the area plus the waste allowance, rounded up.' },
    { id: 'raw', label: 'Tiles without waste', format: 'number', precision: 1, info: 'Room area divided by the area one tile takes up, including its joint.' },
    { id: 'boxes', label: 'Boxes to buy', format: 'integer', info: 'Tiles to buy divided by tiles per box, rounded up.' },
    { id: 'area', label: 'Room area', unit: 'area', units: ['ft2', 'm2'], defaultUnit: 'ft2', precision: 1, info: 'Length times width.' },
  ],
  compute: (v) => {
    const l = num(v.length), w = num(v.width), tl = num(v.tileLen), tw = num(v.tileWid);
    const j = num(v.joint) ?? 0, waste = num(v.waste) ?? 0, per = num(v.perBox);
    if (l === null || w === null || tl === null || tw === null || l <= 0 || w <= 0 || tl <= 0 || tw <= 0 || j < 0 || waste < 0) return { tiles: null };
    const area = l * w;
    const raw = area / ((tl + j) * (tw + j));
    const tiles = ceilSafe(raw * (1 + waste / 100));
    const boxes = per && per >= 1 ? ceilSafe(tiles / per) : null;
    return {
      tiles,
      raw,
      boxes,
      area,
      chart: {
        type: 'donut',
        title: 'What you are buying',
        slices: [
          { label: 'Tiles for the floor', value: raw },
          { label: 'Waste allowance', value: Math.max(0, tiles - raw) },
        ],
        centerValue: String(tiles),
        centerLabel: 'tiles',
      },
      steps: [
        `Each tile takes ${((tl + j) * 1000).toFixed(0)} × ${((tw + j) * 1000).toFixed(0)} mm including the joint`,
        `Tiles = ${area.toFixed(2)} m² ÷ ${((tl + j) * (tw + j)).toFixed(4)} m² = ${raw.toFixed(1)}`,
        `Plus ${waste}% = ${(raw * (1 + waste / 100)).toFixed(1)} → round up to ${tiles}`,
      ],
    };
  },
  content: {
    formula: ['Tiles = room area ÷ ((tile length + joint) × (tile width + joint))', 'Tiles to buy = tiles × (1 + waste % ÷ 100), rounded up', 'Boxes = tiles to buy ÷ tiles per box, rounded up'],
    body: [
      'Every tile covers its own size plus one grout joint, so the count is the room area divided by that slightly larger footprint. A 10 × 12 foot room is 120 square feet. With 12 inch tiles and a 1/8 inch joint, each tile takes up 12.125 × 12.125 inches, which gives 117.5 tiles. Add 10% for cuts and you buy 130 tiles, or 13 boxes of 10.',
      'Waste depends on the layout. About 10% is a common allowance for a straight grid, and diagonal, herringbone or small rooms with many cuts need more, often 15% or above. These are rules of thumb, not standards, so ask your installer for their number.',
      'Buy every box from the same production lot so the colour matches, and keep a few spare tiles for future repairs. For an irregular room, split it into rectangles, run each one through the calculator and add the results.',
    ],
    faq: [
      { q: 'How many 12 × 12 tiles do I need for 100 square feet?', a: 'With no joint and no waste it is exactly 100. A 1/8 inch joint makes it about 98 tiles, and a 10% waste allowance brings it to 108.' },
      { q: 'Does the grout joint really matter?', a: 'Slightly. On small tiles with wide joints it can cut the count by several percent, so it is worth entering.' },
      { q: 'Does this work for walls?', a: 'Yes. Enter the wall height and width as the room length and width, and subtract large openings by tiling the wall in sections.' },
    ],
  },
  related: ['flooring', 'square-footage', 'paint'],
  examples: [
    // 120 ft² / (12.125 in)² = 117.54; ×1.1 = 129.29 → 130 tiles → 13 boxes of 10
    { values: { length: 3.048, width: 3.6576, tileLen: 0.3048, tileWid: 0.3048, joint: 0.003175, waste: 10, perBox: 10 }, expect: { tiles: 130, boxes: 13, raw: 117.5386, area: 11.148 }, tolerance: 1e-3 },
    // 100 ft² of 12 in tile, no joint, no waste: exactly 100
    { values: { length: 3.048, width: 3.048, tileLen: 0.3048, tileWid: 0.3048, joint: 0, waste: 0, perBox: null }, expect: { tiles: 100 }, tolerance: 1e-6 },
  ],
});
