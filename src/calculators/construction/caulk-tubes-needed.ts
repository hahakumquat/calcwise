import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { ceilSafe } from '../../lib/helpers/everyday';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
/** 1 US fluid ounce = 1.8046875 cubic inches (exact: 231 in3 per gallon / 128). */
const IN3_PER_FLOZ = 231 / 128;

export default defineCalculator({
  slug: 'caulk-tubes-needed',
  title: 'Caulk Tubes Needed Calculator',
  category: 'construction',
  description: 'Work out how many tubes of caulk you need for a joint from its length, width and depth, with a waste allowance, based on a standard 10.1 fl oz cartridge.',
  keywords: ['caulk calculator', 'how many tubes of caulk do i need', 'caulk bead length per tube', 'caulking calculator', 'sealant tubes needed', 'how far does a tube of caulk go'],
  updated: '2026-11-28',
  inputs: [
    { id: 'length', label: 'Total joint length', type: 'number', default: 60, min: 0, step: 1, suffix: 'ft', info: 'Add up every joint you will seal, in feet. A bathtub and tile edge, window frames and baseboards all count.' },
    { id: 'width', label: 'Joint width', type: 'number', default: 0.25, min: 0, step: 0.0625, suffix: 'in', info: 'How wide the gap is, in inches. 1/4 inch is 0.25 and 3/8 inch is 0.375.' },
    { id: 'depth', label: 'Joint depth', type: 'number', default: 0.25, min: 0, step: 0.0625, suffix: 'in', info: 'How deep the caulk fills, in inches. Backer rod in a deep gap makes the filled depth smaller.' },
    { id: 'size', label: 'Cartridge size', type: 'number', default: 10.1, min: 0, step: 0.1, suffix: 'fl oz', info: 'Printed on the tube. The standard cartridge is 10.1 fl oz (about 300 mL).' },
    { id: 'waste', label: 'Waste allowance', type: 'number', default: 10, min: 0, max: 100, step: 1, suffix: '%', info: 'Extra for nozzle waste, uneven joints and mistakes. 10 percent is a common allowance.' },
  ],
  outputs: [
    { id: 'tubes', label: 'Tubes to buy', format: 'integer', primary: true, info: 'Joint length with waste divided by the bead length one tube gives, rounded up.' },
    { id: 'tubesExact', label: 'Tubes before rounding', format: 'number', precision: 2, info: 'Joint length with waste ÷ feet of bead per tube.' },
    { id: 'ftPerTube', label: 'Bead per tube', format: 'number', precision: 1, suffix: 'ft', info: 'Cartridge volume ÷ (width × depth), turned into feet.' },
    { id: 'ftWaste', label: 'Joint length with waste', format: 'number', precision: 1, suffix: 'ft', info: 'Joint length × (1 + waste %).' },
    { id: 'volume', label: 'Cartridge volume', format: 'number', precision: 2, suffix: 'in³', info: 'Fluid ounces × 1.8047 cubic inches per fluid ounce.' },
  ],
  compute: (v) => {
    const L = num(v.length);
    const w = num(v.width);
    const d = num(v.depth);
    const size = num(v.size);
    const waste = num(v.waste) ?? 0;
    if (L === null || w === null || d === null || size === null) return { tubes: null };
    if (L <= 0 || w <= 0 || d <= 0 || size <= 0 || waste < 0) return { tubes: null };
    const volume = size * IN3_PER_FLOZ;
    const inPerTube = volume / (w * d);
    const ftPerTube = inPerTube / 12;
    const ftWaste = L * (1 + waste / 100);
    const exact = ftWaste / ftPerTube;
    const tubes = ceilSafe(exact);
    return {
      tubes,
      tubesExact: exact,
      ftPerTube,
      ftWaste,
      volume,
      tone: 'ok',
      badge: `${tubes} ${tubes === 1 ? 'tube' : 'tubes'}`,
      note: `One ${fmt(size, 1)} fl oz tube fills about ${fmt(ftPerTube, 1)} ft of a ${fmt(w, 3)} by ${fmt(d, 3)} in joint. Real yield is lower with uneven joints, backer rod gaps and nozzle waste, so check the cartridge size on the label.`,
      chart: {
        type: 'bar' as const,
        title: 'Joint with waste vs what the tubes cover (ft)',
        categories: ['Joint with waste', `${tubes} ${tubes === 1 ? 'tube' : 'tubes'} cover`],
        series: [{ name: 'Feet', values: [+ftWaste.toFixed(1), +(tubes * ftPerTube).toFixed(1)] }],
        format: { format: 'number' as const, suffix: 'ft' },
        highlight: 1,
      },
      steps: [
        `Cartridge volume = ${fmt(size, 1)} fl oz × 1.8047 = ${fmt(volume, 2)} in³`,
        `Bead per tube = ${fmt(volume, 2)} ÷ (${fmt(w, 3)} × ${fmt(d, 3)}) = ${fmt(inPerTube, 1)} in = ${fmt(ftPerTube, 1)} ft`,
        `Joint with waste = ${fmt(L, 1)} × ${fmt(1 + waste / 100, 2)} = ${fmt(ftWaste, 1)} ft`,
        `Tubes = ${fmt(ftWaste, 1)} ÷ ${fmt(ftPerTube, 1)} = ${fmt(exact, 2)}, rounded up to ${tubes}`,
      ],
    };
  },
  content: {
    formula: [
      'Cartridge volume (in³) = fluid ounces × 1.8047',
      'Bead per tube (in) = cartridge volume ÷ (joint width × joint depth)',
      'Tubes = ceiling of [length × (1 + waste) ÷ (bead per tube ÷ 12)]',
    ],
    body: [
      'A tube of caulk is a fixed volume, and a bead of caulk is a long thin box: width times depth times length. Divide the volume by the cross-section and you know how far one tube goes. This calculator does that and rounds up to whole tubes.',
      'Example: a standard 10.1 fl oz cartridge holds about 18.23 cubic inches. In a 1/4 by 1/4 inch joint that is 291.6 inches, or 24.3 feet, of bead. For 60 feet of joint plus 10 percent waste, which is 66 feet, you need 66 ÷ 24.3 = 2.72, so 3 tubes. In a wider 3/8 by 3/8 inch joint one tube only goes 10.8 feet, so the same 66 feet takes 6.11, which rounds up to 7 tubes.',
      'The result is a clean-geometry estimate. In practice, yield is lower with uneven or tapered joints, gaps around backer rod, and caulk left in the nozzle. The waste allowance covers some of that. Check the cartridge size printed on your tube, as some are 9 or 10.3 fl oz, and use the real joint width and depth. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How many feet does one tube of caulk cover?', a: 'For a standard 10.1 fl oz cartridge, about 24.3 feet of a 1/4 by 1/4 inch joint, and about 10.8 feet of a 3/8 by 3/8 inch joint. Wider or deeper joints use much more.' },
      { q: 'How many tubes for 60 feet of 1/4 inch caulk?', a: 'With a 10 percent waste allowance the joint is 66 feet. One tube covers 24.3 feet, so 66 ÷ 24.3 = 2.72, which rounds up to 3 tubes.' },
      { q: 'How many tubes for a 3/8 inch joint?', a: 'One 10.1 fl oz tube covers about 10.8 feet, so 66 feet with waste needs 6.11, which rounds up to 7 tubes.' },
      { q: 'Why add waste?', a: 'Nozzle waste, uneven gaps and mistakes all use caulk the geometry does not count. 10 percent is a common allowance, and you can change it.' },
      { q: 'Does the cartridge size matter?', a: 'Yes. Enter the size printed on your tube in fluid ounces. The calculator multiplies it by 1.8047 to get cubic inches.' },
    ],
    sources: [
      { label: 'Unit conversion: 1 US gallon is 231 cubic inches and 128 fluid ounces, so 1 fluid ounce is 1.8047 cubic inches. The 10.1 fl oz cartridge is the common standard size; check your label.' },
    ],
  },
  related: ['draft-sealing-payback', 'tile', 'trim-molding-length', 'paint'],
  examples: [
    // volume = 10.1*231/128 = 18.2273; per tube = 18.2273/0.0625 = 291.64 in = 24.303 ft; 60*1.1 = 66 ft; 66/24.303 = 2.7157 -> 3
    { values: { length: 60, width: 0.25, depth: 0.25, size: 10.1, waste: 10 }, expect: { tubes: 3, ftPerTube: 24.303, ftWaste: 66, volume: 18.2273, tubesExact: 2.7157 }, tolerance: 0.001 },
    // per tube = 18.2273/0.140625 = 129.62 in = 10.802 ft; 66/10.802 = 6.110 -> 7
    { values: { length: 60, width: 0.375, depth: 0.375, size: 10.1, waste: 10 }, expect: { tubes: 7, ftPerTube: 10.802, tubesExact: 6.110 }, tolerance: 0.001 },
  ],
});
