import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'retaining-wall-blocks',
  title: 'Retaining Wall Block Calculator',
  category: 'construction',
  description: 'Estimate how many retaining wall blocks, cap blocks and cubic yards of drainage gravel and base gravel you need for a straight wall, with waste included.',
  keywords: ['retaining wall calculator', 'retaining wall block calculator', 'how many blocks for a retaining wall', 'retaining wall gravel backfill', 'landscape wall blocks', 'retaining wall base gravel'],
  inputs: [
    { id: 'length', label: 'Wall length', type: 'number', suffix: 'ft', default: 20, min: 0, step: 0.5, info: 'Length of the straight wall, in feet. Add separate runs together for a wall with several straight sections.' },
    { id: 'height', label: 'Wall height', type: 'number', suffix: 'ft', default: 3, min: 0, step: 0.25, info: 'Finished height of the wall above ground, plus the buried first course, in feet.' },
    { id: 'blockW', label: 'Block face width', type: 'number', suffix: 'in', default: 12, min: 0, step: 0.5, info: 'Width of one block as seen from the front, in inches. Check the maker label; 12 in is common.' },
    { id: 'blockH', label: 'Block face height', type: 'number', suffix: 'in', default: 4, min: 0, step: 0.25, info: 'Height of one block, in inches. 4 in is common for small landscape blocks.' },
    { id: 'waste', label: 'Waste allowance', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 1, info: 'Extra blocks for breakage and cuts. 5 percent is a common allowance.' },
    { id: 'depth', label: 'Drainage gravel depth behind wall', type: 'number', suffix: 'in', default: 12, min: 0, step: 1, info: 'How far back the clean gravel extends behind the blocks, in inches. 12 in is a common choice.' },
    { id: 'trenchW', label: 'Base trench width', type: 'number', suffix: 'in', default: 24, min: 0, step: 1, info: 'Width of the compacted gravel base under the wall, in inches.' },
    { id: 'baseD', label: 'Base depth', type: 'number', suffix: 'in', default: 6, min: 0, step: 0.5, info: 'Thickness of the compacted gravel base, in inches.' },
  ],
  outputs: [
    { id: 'blocks', label: 'Blocks to buy', format: 'integer', primary: true, info: 'Blocks per course times courses, plus the waste allowance, rounded up. Caps are separate.' },
    { id: 'perCourse', label: 'Blocks per course', format: 'integer', info: 'Wall length divided by block width, rounded up.' },
    { id: 'courses', label: 'Courses (rows)', format: 'integer', info: 'Wall height divided by block height, rounded up.' },
    { id: 'blocksNoWaste', label: 'Blocks before waste', format: 'integer', info: 'Blocks per course times courses.' },
    { id: 'caps', label: 'Cap blocks', format: 'integer', info: 'One cap per block position along the top, so the same as blocks per course.' },
    { id: 'backfillYd', label: 'Drainage gravel', format: 'number', precision: 2, suffix: 'cu yd', info: 'Wall length times height times gravel depth, in cubic feet, divided by 27.' },
    { id: 'baseYd', label: 'Base gravel', format: 'number', precision: 2, suffix: 'cu yd', info: 'Wall length times trench width times base depth, in cubic feet, divided by 27.' },
    { id: 'backfillFt', label: 'Drainage gravel (cu ft)', format: 'number', precision: 1, info: 'Drainage gravel volume in cubic feet.' },
    { id: 'baseFt', label: 'Base gravel (cu ft)', format: 'number', precision: 1, info: 'Base gravel volume in cubic feet.' },
  ],
  compute: (v) => {
    const L = num(v.length);
    const H = num(v.height);
    const bw = num(v.blockW);
    const bh = num(v.blockH);
    const waste = num(v.waste) ?? 0;
    const depth = num(v.depth) ?? 0;
    const tw = num(v.trenchW) ?? 0;
    const bd = num(v.baseD) ?? 0;
    if (L === null || H === null || bw === null || bh === null) return { blocks: null };
    if (L <= 0 || H <= 0 || bw <= 0 || bh <= 0) return { blocks: null, error: 'Wall length, wall height and block size must all be greater than zero.' };
    if (waste < 0 || depth < 0 || tw < 0 || bd < 0) return { blocks: null, error: 'Waste, gravel depth, trench width and base depth cannot be negative.' };
    const perCourse = ceilSafe((L * 12) / bw);
    const courses = ceilSafe((H * 12) / bh);
    const base = perCourse * courses;
    const blocks = ceilSafe(base * (1 + waste / 100));
    const caps = perCourse;
    const backfillFt = (L * H * depth) / 12;
    const baseFt = (L * (tw / 12) * bd) / 12;
    const backfillYd = backfillFt / 27;
    const baseYd = baseFt / 27;
    const r2 = (n: number) => +n.toFixed(2);
    return {
      blocks,
      perCourse,
      courses,
      blocksNoWaste: base,
      caps,
      backfillYd,
      baseYd,
      backfillFt,
      baseFt,
      chart: {
        type: 'bar',
        title: 'Gravel to order (cu yd)',
        categories: ['Drainage gravel', 'Base gravel'],
        series: [{ name: 'Cubic yards', values: [r2(backfillYd), r2(baseYd)] }],
        format: { format: 'number', suffix: ' cu yd' },
      },
      tone: 'ok',
      badge: `${blocks} blocks + ${caps} caps`,
      note: 'The first course is buried, so it is part of the height you enter. Many areas need a permit or an engineer above about 4 ft; confirm with your local building office. Block sizes vary by maker, and drainage pipe is not counted.',
      steps: [
        `Per course = ${L} ft × 12 ÷ ${bw} in = ${r2((L * 12) / bw)}, so ${perCourse}`,
        `Courses = ${H} ft × 12 ÷ ${bh} in = ${r2((H * 12) / bh)}, so ${courses}`,
        `Blocks = ${perCourse} × ${courses} = ${base}, with ${waste}% waste = ${blocks}`,
        `Caps = ${caps}`,
        `Drainage gravel = ${L} × ${H} × ${depth} ÷ 12 = ${r2(backfillFt)} cu ft = ${r2(backfillYd)} cu yd`,
        `Base gravel = ${L} × ${tw} ÷ 12 × ${bd} ÷ 12 = ${r2(baseFt)} cu ft = ${r2(baseYd)} cu yd`,
      ],
    };
  },
  content: {
    formula: [
      'Blocks per course = ceil(length × 12 ÷ block width in inches)',
      'Courses = ceil(height × 12 ÷ block height in inches)',
      'Blocks to buy = ceil(blocks per course × courses × (1 + waste % ÷ 100))',
      'Caps = blocks per course',
      'Drainage gravel (cu ft) = length × height × gravel depth in inches ÷ 12',
      'Base gravel (cu ft) = length × trench width in inches ÷ 12 × base depth in inches ÷ 12',
      'Cubic yards = cubic feet ÷ 27',
    ],
    body: [
      'A segmental retaining wall is built in rows called courses. Divide the wall length by the block width to get blocks per course, divide the height by the block height to get the number of courses, and multiply. Add a waste allowance for breakage and cuts, then round up because blocks are sold whole.',
      'The wall also needs gravel. A compacted gravel base goes under the first course, and clean drainage gravel goes behind the wall so water can escape instead of pushing on it. This calculator treats both as simple boxes and converts cubic feet to cubic yards, the unit gravel is usually sold in. Order a little extra for settling.',
      'The first course is buried, so include it in the height. Many areas need a permit or an engineer once a wall is taller than about 4 ft, and rules differ by place, so check with your local building office. Block sizes vary by maker, and drainage pipe, geotextile fabric and adhesive are not counted. This is an estimate for a straight wall only.',
    ],
    faq: [
      { q: 'How many blocks do I need for a 20 ft by 3 ft wall?', a: 'With 12 in by 4 in blocks, one course takes 20 blocks and the wall has 9 courses, so 180 blocks. With 5 percent waste that is 189 blocks, plus 20 cap blocks.' },
      { q: 'How much drainage gravel is that?', a: 'With 12 in of gravel behind the wall, 20 ft × 3 ft × 1 ft is 60 cu ft, which is 2.22 cu yd.' },
      { q: 'How much base gravel is that?', a: 'A trench 24 in wide and 6 in deep along 20 ft is 20 × 2 × 0.5 = 20 cu ft, which is 0.74 cu yd.' },
      { q: 'Does the height include the buried course?', a: 'Yes. Enter the full height including the buried first course, because it needs blocks too.' },
      { q: 'Do I need a permit?', a: 'Many areas require a permit or an engineer above about 4 ft. Rules vary, so confirm with your local building office before you build.' },
      { q: 'Does this include drainage pipe?', a: 'No. Pipe, fabric and adhesive are not counted. Block sizes also vary by maker, so check the label.' },
    ],
    sources: [],
  },
  related: ['gravel', 'paver-patio'],
  examples: [
    // per course 20*12/12 = 20; courses 3*12/4 = 9; 180; *1.05 = 189; caps 20; backfill 20*3*12/12 = 60 cu ft = 2.2222 yd; base 20*2*6/12 = 20 cu ft = 0.7407 yd
    { values: { length: 20, height: 3, blockW: 12, blockH: 4, waste: 5, depth: 12, trenchW: 24, baseD: 6 }, expect: { blocks: 189, perCourse: 20, courses: 9, blocksNoWaste: 180, caps: 20, backfillFt: 60, backfillYd: 2.222222, baseFt: 20, baseYd: 0.740741 }, tolerance: 1e-4 },
    // 10 ft x 2 ft, 16 x 8 block, 0% waste: 120/16 = 7.5 -> 8; 24/8 = 3; 24 blocks; gravel 10*2*6/12 = 10 cu ft; base 10*1*4/12 = 3.3333 cu ft
    { values: { length: 10, height: 2, blockW: 16, blockH: 8, waste: 0, depth: 6, trenchW: 12, baseD: 4 }, expect: { blocks: 24, perCourse: 8, courses: 3, caps: 8, backfillFt: 10, baseFt: 3.333333 }, tolerance: 1e-4 },
  ],
});
