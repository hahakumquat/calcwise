import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';

// Plates per side, largest first. Every plate is a multiple of the smallest one,
// so greedy loading always lands within one smallest plate of any target.
const PLATES: Record<string, number[]> = {
  lb: [45, 35, 25, 10, 5, 2.5],
  kg: [25, 20, 15, 10, 5, 2.5, 1.25],
};
const BARS: Record<string, Record<string, number>> = {
  lb: { men: 45, women: 35 },
  kg: { men: 20, women: 15 },
};

const fmt = (n: number) => String(Math.round(n * 100) / 100);

export default defineCalculator({
  slug: 'plate-calculator',
  title: 'Barbell Plate Calculator',
  category: 'sports',
  description: 'Find which plates to load on each side of the barbell for your target weight, in lb or kg, and see the nearest loadable weight if it is not exact.',
  keywords: ['plate calculator', 'barbell plate calculator', 'what plates do I need', 'barbell loading', 'weight plates per side', 'plate math', 'lb kg plates'],
  updated: '2026-11-16',
  inputs: [
    { id: 'target', label: 'Target weight', type: 'number', default: 225, min: 0, step: 0.5, info: 'The total weight you want on the bar, including the bar itself, in the unit chosen below.' },
    {
      id: 'unit',
      label: 'Unit',
      type: 'select',
      segmented: true,
      default: 'lb',
      options: [
        { value: 'lb', label: 'lb' },
        { value: 'kg', label: 'kg' },
      ],
      info: 'Pounds use 45, 35, 25, 10, 5 and 2.5 lb plates. Kilograms use 25, 20, 15, 10, 5, 2.5 and 1.25 kg plates.',
    },
    {
      id: 'bar',
      label: 'Barbell',
      type: 'select',
      default: 'men',
      options: [
        { value: 'men', label: 'Standard bar (45 lb / 20 kg)' },
        { value: 'women', label: 'Women’s bar (35 lb / 15 kg)' },
        { value: 'custom', label: 'Custom weight' },
      ],
      info: 'A standard Olympic men’s bar weighs 45 lb or 20 kg, and a women’s bar 35 lb or 15 kg. The weight follows the unit you picked. Choose custom for any other bar.',
    },
    { id: 'customBar', label: 'Bar weight', type: 'number', default: 25, min: 0, step: 0.5, showWhen: { input: 'bar', is: 'custom' }, info: 'The weight of your bar alone, in the unit chosen above, for example a 25 lb training bar or a 10 kg technique bar.' },
  ],
  outputs: [
    { id: 'total', label: 'Loaded weight (bar and plates)', primary: true, precision: 2, info: 'What the bar weighs once the plates below are on both sides, in your chosen unit. It equals your target when the target is exactly loadable.' },
    { id: 'plates', label: 'Plates on each side', format: 'text', info: 'The plates to put on each end of the bar, from the largest (closest to the bar) to the smallest.' },
    { id: 'perSide', label: 'Weight per side', precision: 2, info: 'The total weight of the plates on one end of the bar.' },
    { id: 'below', label: 'Nearest loadable at or below', precision: 2, info: 'The heaviest weight you can load with these plates that does not exceed your target.' },
    { id: 'above', label: 'Next loadable above', precision: 2, info: 'The lightest weight above your target you can load with these plates. It is one smallest plate on each side heavier than the weight at or below.' },
  ],
  compute: (v) => {
    const unit = v.unit === 'kg' ? 'kg' : 'lb';
    const target = num(v.target);
    const bar = v.bar === 'custom' ? num(v.customBar) : (BARS[unit][String(v.bar)] ?? null);
    if (target === null || target <= 0 || bar === null || bar < 0) return { total: null };

    if (target <= bar) {
      const empty = target === bar;
      return {
        total: bar,
        plates: 'No plates',
        perSide: 0,
        below: bar,
        above: bar + 2 * PLATES[unit][PLATES[unit].length - 1],
        tone: empty ? 'ok' : 'warn',
        badge: empty ? 'Just the bar' : 'Below the bar weight',
        note: empty
          ? `Your target equals the bar, so there is nothing to load.`
          : `${fmt(target)} ${unit} is lighter than the ${fmt(bar)} ${unit} bar, so the lightest you can lift is the bar on its own.`,
      };
    }

    // Work in hundredths so 2.5 and 1.25 plates add up without floating-point drift.
    const h = (x: number) => Math.round(x * 100);
    let left = h((target - bar) / 2);
    const counts: { plate: number; n: number }[] = [];
    for (const p of PLATES[unit]) {
      const n = Math.floor(left / h(p));
      if (n > 0) counts.push({ plate: p, n });
      left -= n * h(p);
    }
    const perSide = counts.reduce((s, c) => s + c.plate * c.n, 0);
    const total = bar + 2 * perSide;
    const smallest = PLATES[unit][PLATES[unit].length - 1];
    const above = total + 2 * smallest;
    const exact = left === 0;
    const text = counts.length ? counts.map((c) => `${c.n} × ${c.plate}`).join(' + ') : 'No plates';

    const chart: ChartSpec = {
      type: 'bar',
      title: `Plates per side (${unit})`,
      categories: counts.length ? counts.map((c) => String(c.plate)) : ['None'],
      series: [{ name: 'Plates per side', values: counts.length ? counts.map((c) => c.n) : [0] }],
      format: { format: 'integer' },
    };

    const steps = [
      `Per side = (${fmt(target)} − ${fmt(bar)}) ÷ 2 = ${fmt((target - bar) / 2)} ${unit}`,
      ...counts.map((c) => `${c.n} × ${c.plate} ${unit} = ${fmt(c.n * c.plate)} ${unit}`),
      exact
        ? `Loaded total = ${fmt(bar)} + 2 × ${fmt(perSide)} = ${fmt(total)} ${unit}`
        : `${fmt(left / 100)} ${unit} per side is left over, smaller than the ${smallest} ${unit} plate`,
    ];

    return {
      total,
      plates: text,
      perSide,
      below: total,
      above,
      chart,
      steps,
      tone: exact ? 'good' : 'warn',
      badge: exact ? 'Exact' : 'Not exactly loadable',
      note: exact
        ? undefined
        : `${fmt(target)} ${unit} cannot be loaded exactly with these plates. The closest at or below is ${fmt(total)} ${unit}; the next one up is ${fmt(above)} ${unit}.`,
    };
  },
  content: {
    formula: ['Per side = (target − bar) ÷ 2', 'Then take the largest plate that fits, repeat with what is left, and stop at the smallest plate'],
    body: [
      'Enter the weight you want on the bar and this calculator tells you which plates to slide onto each end. It subtracts the weight of the bar, splits the rest evenly between the two sides, and then loads the biggest plates first until nothing more fits.',
      'Plates are loaded the same on both sides so the bar stays balanced. The standard Olympic men’s bar weighs 20 kg (45 lb) and the women’s bar 15 kg (35 lb). If your gym has a different bar, choose custom and type its weight.',
      'The set of plates is a plain default: 45, 35, 25, 10, 5 and 2.5 lb, or 25, 20, 15, 10, 5, 2.5 and 1.25 kg. If your target cannot be built from these plates, the result says so and shows the closest weight at or below your target and the next one above it.',
    ],
    sections: [
      {
        heading: 'Worked examples',
        paragraphs: [
          'For 225 lb on a 45 lb bar, each side carries (225 − 45) ÷ 2 = 90 lb, which is two 45 lb plates. For 135 lb the sides carry 45 lb, a single 45 lb plate. For 100 kg on a 20 kg bar, each side carries 40 kg, which is a 25 kg plate and a 15 kg plate.',
          'For 227 lb on a 45 lb bar, each side would carry 91 lb. Two 45 lb plates make 90 lb and the last 1 lb is smaller than the smallest 2.5 lb plate, so the target is not exactly loadable. The closest at or below is 225 lb, and the next one up is 230 lb.',
        ],
      },
    ],
    faq: [
      { q: 'How many plates do I need on each side?', a: 'Subtract the bar weight from your target and divide by two. For 225 lb with a 45 lb bar that is 90 lb per side, so two 45 lb plates on each end.' },
      { q: 'How much does an Olympic barbell weigh?', a: 'A standard men’s bar is 20 kg (about 45 lb) and a women’s bar is 15 kg (about 35 lb). This calculator uses 45 lb or 20 kg for the standard bar and 35 lb or 15 kg for the women’s bar, depending on your unit.' },
      { q: 'What if my target cannot be loaded exactly?', a: 'The result is flagged as not exactly loadable. For 227 lb on a 45 lb bar it loads 225 lb, the closest weight at or below your target, and tells you the next weight up is 230 lb.' },
      { q: 'What if my target is lighter than the bar?', a: 'No plates are shown and the result is the bar on its own. The calculator never goes below the bar weight.' },
      { q: 'Does it include collars?', a: 'No. Spring or competition collars add weight of their own, so add that to the bar weight with the custom option if you want it counted.' },
    ],
    sources: [
      { label: 'International Powerlifting Federation (IPF) technical rules: standard 20 kg men’s and 15 kg women’s barbells' },
      { label: 'International Weightlifting Federation (IWF) technical and competition rules: bar and plate specifications' },
    ],
  },
  related: ['one-rep-max'],
  examples: [
    // 225 lb, 45 lb bar: (225 − 45) ÷ 2 = 90 per side = 2 × 45.
    { values: { target: 225, unit: 'lb', bar: 'men' }, expect: { total: 225, perSide: 90, plates: '2 × 45', below: 225, above: 230 } },
    // 135 lb: (135 − 45) ÷ 2 = 45 per side = 1 × 45.
    { values: { target: 135, unit: 'lb', bar: 'men' }, expect: { total: 135, perSide: 45, plates: '1 × 45' } },
    // 100 kg, 20 kg bar: 40 per side = 25 + 15. Next up adds 1.25 per side: 102.5.
    { values: { target: 100, unit: 'kg', bar: 'men' }, expect: { total: 100, perSide: 40, plates: '1 × 25 + 1 × 15', above: 102.5 } },
    // 227 lb: 91 per side = 2 × 45 = 90, 1 left over; loaded 225, next up 225 + 2 × 2.5 = 230.
    { values: { target: 227, unit: 'lb', bar: 'men' }, expect: { total: 225, perSide: 90, below: 225, above: 230, badge: 'Not exactly loadable' } },
    // Women's 35 lb bar, 95 lb: 30 per side = 25 + 5.
    { values: { target: 95, unit: 'lb', bar: 'women' }, expect: { total: 95, plates: '1 × 25 + 1 × 5' } },
    // Custom 25 lb bar, 100 lb: 37.5 per side = 35 + 2.5.
    { values: { target: 100, unit: 'lb', bar: 'custom', customBar: 25 }, expect: { total: 100, perSide: 37.5, plates: '1 × 35 + 1 × 2.5' } },
    // Target below the 45 lb bar: just the bar.
    { values: { target: 30, unit: 'lb', bar: 'men' }, expect: { total: 45, plates: 'No plates', badge: 'Below the bar weight' } },
  ],
});
