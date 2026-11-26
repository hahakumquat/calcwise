import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const GAL_L = 3.78541;

export default defineCalculator({
  slug: 'aquarium-water-change',
  title: 'Aquarium Water Change Calculator',
  category: 'everyday',
  description: 'Work out how many gallons and liters your fish tank holds from its length, width and height, and how much water a 25% or 30% water change removes.',
  keywords: ['aquarium water change calculator', 'fish tank volume calculator', 'how many gallons is my tank', 'water change percentage', 'aquarium gallons from dimensions'],
  updated: '2026-11-26',
  inputs: [
    { id: 'length', label: 'Tank length', type: 'number', suffix: 'in', default: 48, min: 1, step: 1, info: 'Inside length of the long side, in inches.' },
    { id: 'width', label: 'Tank width', type: 'number', suffix: 'in', default: 13, min: 1, step: 0.5, info: 'Inside depth from front glass to back glass, in inches.' },
    { id: 'height', label: 'Water height', type: 'number', suffix: 'in', default: 21, min: 1, step: 0.5, info: 'Height of the water, not the glass. Measure from the bottom to the waterline.' },
    { id: 'displace', label: 'Substrate and decor displacement', type: 'number', suffix: '%', default: 0, min: 0, max: 60, step: 1, info: 'Share of the tank volume taken up by gravel, rock and decor. Leave at 0 if you are unsure.' },
    { id: 'change', label: 'Water change size', type: 'number', suffix: '%', default: 25, min: 1, max: 100, step: 5, info: 'The share of the water you plan to swap. A safe size depends on your fish and water tests.' },
  ],
  outputs: [
    { id: 'changeGal', label: 'Water to change', format: 'number', precision: 2, suffix: 'gal', primary: true, info: 'Water volume × change size.' },
    { id: 'changeL', label: 'Water to change', format: 'number', precision: 1, suffix: 'L', info: 'Gallons × 3.78541.' },
    { id: 'waterGal', label: 'Water in the tank', format: 'number', precision: 2, suffix: 'gal', info: 'Length × width × height ÷ 231, less displacement.' },
    { id: 'waterL', label: 'Water in the tank', format: 'number', precision: 1, suffix: 'L', info: 'Gallons × 3.78541.' },
    { id: 'keepGal', label: 'Water that stays', format: 'number', precision: 2, suffix: 'gal', info: 'Water volume less the water you change.' },
  ],
  compute: (v) => {
    const l = num(v.length), w = num(v.width), h = num(v.height), d = num(v.displace), c = num(v.change);
    if ([l, w, h, d, c].some((x) => x === null)) return { changeGal: null };
    if ((l as number) <= 0 || (w as number) <= 0 || (h as number) <= 0 || (d as number) < 0 || (d as number) >= 100 || (c as number) <= 0 || (c as number) > 100) return { changeGal: null };
    const cuIn = (l as number) * (w as number) * (h as number);
    const full = cuIn / 231;
    const water = full * (1 - (d as number) / 100);
    const changeGal = water * ((c as number) / 100);
    const keepGal = water - changeGal;
    return {
      changeGal,
      changeL: changeGal * GAL_L,
      waterGal: water,
      waterL: water * GAL_L,
      keepGal,
      tone: 'ok',
      badge: `${fmt(c as number, 0)}% change`,
      note: `Swap about ${fmt(changeGal)} gallons (${fmt(changeGal * GAL_L, 1)} liters) out of ${fmt(water)} gallons. How much is safe at once depends on your species and your water tests, so treat this as arithmetic, not fish advice.`,
      chart: {
        type: 'donut' as const,
        title: 'Water changed vs water kept',
        slices: [
          { label: 'Changed', value: changeGal },
          { label: 'Kept', value: keepGal },
        ],
        format: { format: 'number', precision: 2, suffix: ' gal' },
        centerLabel: 'to change',
        centerValue: `${fmt(changeGal)} gal`,
      },
      steps: [
        `Volume: ${fmt(l as number)} × ${fmt(w as number)} × ${fmt(h as number)} = ${fmt(cuIn, 0)} cubic in ÷ 231 = ${fmt(full, 3)} gal`,
        `After ${fmt(d as number)}% displacement: ${fmt(full, 3)} × ${fmt(1 - (d as number) / 100, 2)} = ${fmt(water, 3)} gal`,
        `Change: ${fmt(water, 3)} × ${fmt(c as number)}% = ${fmt(changeGal, 3)} gal`,
        `Liters: ${fmt(changeGal, 3)} × 3.78541 = ${fmt(changeGal * GAL_L, 2)} L`,
      ],
    };
  },
  content: {
    formula: [
      'Gallons = length × width × height (inches) ÷ 231',
      'Water in tank = gallons × (1 − displacement %)',
      'Water to change = water in tank × change %',
      'Liters = gallons × 3.78541',
    ],
    body: [
      'Weekly water changes are a routine of fishkeeping, and the first step is knowing how much water is actually in the tank. Enter the inside length, width and water height to get the volume, then pick a change percentage to see how many gallons and liters to remove and refill.',
      'A US gallon is 231 cubic inches, so multiplying the three measurements and dividing by 231 gives the full volume. Gravel, rock and decor take up space, so the real amount of water is lower: enter a displacement percentage if you want to account for it, or leave it at 0 for a simple upper figure.',
      'This is arithmetic only. How large a change is safe depends on your species, stocking and water tests, so follow the advice for your fish. For the long-run cost of keeping pets, see the pet lifetime cost calculator. Everything runs in your browser and nothing is stored.',
    ],
    faq: [
      { q: 'How many gallons is a 48 x 13 x 21 inch tank?', a: '48 × 13 × 21 = 13,104 cubic inches, and 13,104 ÷ 231 = 56.73 gallons, or about 214.7 liters, with no displacement.' },
      { q: 'How much water is a 25% change?', a: 'With the defaults, 25% of 56.73 gallons is 14.18 gallons, which is about 53.7 liters. 56.73 − 14.18 leaves 42.55 gallons in the tank.' },
      { q: 'What about a smaller tank?', a: 'A 20 × 10 × 12 inch tank holds 2,400 ÷ 231 = 10.39 gallons. A 30% change is 3.12 gallons, or about 11.8 liters.' },
      { q: 'How big should a water change be?', a: 'That depends on your fish, stocking level and water test results, so this calculator does not recommend a size. It only turns the percentage you choose into gallons and liters.' },
    ],
    sources: [],
  },
  related: ['pet-lifetime-cost', 'pet-food-duration'],
  examples: [
    // 48*13*21 = 13104 in3 / 231 = 56.7273 gal; 25% = 14.1818 gal; liters 14.1818*3.78541 = 53.684; tank 214.736 L; keep 42.5455
    { values: { length: 48, width: 13, height: 21, displace: 0, change: 25 }, expect: { waterGal: 56.7273, changeGal: 14.1818, changeL: 53.684, waterL: 214.736, keepGal: 42.5455 }, tolerance: 0.001 },
    // 20*10*12 = 2400 / 231 = 10.3896 gal; 30% = 3.1169 gal; liters 11.7987; tank 39.3289 L; keep 7.2727
    { values: { length: 20, width: 10, height: 12, displace: 0, change: 30 }, expect: { waterGal: 10.3896, changeGal: 3.1169, changeL: 11.7987, waterL: 39.3289, keepGal: 7.2727 }, tolerance: 0.001 },
  ],
});
