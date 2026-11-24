import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'antifreeze-mix',
  title: 'Antifreeze Mix: How Much to Drain and Replace',
  category: 'everyday',
  description: 'Work out how much coolant to drain and what to top up with (pure antifreeze or water) to move your cooling system from its current mix to the mix you want.',
  keywords: ['antifreeze mix calculator', 'how much coolant to drain', 'coolant 50/50 mix', 'antifreeze concentration calculator', 'adjust coolant ratio', 'antifreeze to water ratio'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'capacity', label: 'Cooling system capacity', type: 'number', default: 10, min: 0.1, step: 0.5, suffix: 'L', info: 'Total coolant volume from your owner\'s manual. Any unit works if you use it for the result too.' },
    { id: 'current', label: 'Current antifreeze share', type: 'number', default: 30, min: 0, max: 100, step: 1, suffix: '%', info: 'The share of antifreeze in the mix now, from a tester or what you last poured in.' },
    { id: 'target', label: 'Target antifreeze share', type: 'number', default: 50, min: 0, max: 100, step: 1, suffix: '%', info: 'The mix you want, for example 50 for a 50/50 mix. Follow your manufacturer.' },
  ],
  outputs: [
    { id: 'drain', label: 'Drain and replace', format: 'number', precision: 2, suffix: 'L', primary: true, info: 'Volume of old mix to drain, then replace with the liquid named below.' },
    { id: 'drainPct', label: 'Share of system drained', format: 'percent', precision: 1, info: 'Drain ÷ capacity.' },
    { id: 'kept', label: 'Old mix kept in the system', format: 'number', precision: 2, suffix: 'L', info: 'Capacity − drain.' },
  ],
  compute: (v) => {
    const cap = num(v.capacity);
    const cur = num(v.current);
    const tgt = num(v.target);
    if (cap === null || cur === null || tgt === null) return { drain: null };
    if (cap <= 0 || cur < 0 || cur > 100 || tgt < 0 || tgt > 100) return { drain: null };
    const p = cur / 100;
    const t = tgt / 100;
    if (Math.abs(p - t) < 1e-9) {
      return { drain: 0, drainPct: 0, kept: cap, tone: 'good', badge: 'Already at target', note: 'The current mix already matches the target, so nothing needs draining.', chart: { type: 'bar' as const, title: 'Antifreeze share before and after', categories: ['Now', 'Target', 'After refill'], series: [{ name: 'Antifreeze %', values: [cur, tgt, cur] }], format: { format: 'number' as const, precision: 1 } } };
    }
    const up = t > p;
    if (up && p >= 1) return { drain: null };
    // Raise: drain x, add pure antifreeze: (p(C-x)+x)/C = t -> x = C(t-p)/(1-p)
    // Lower: drain x, add water: p(C-x)/C = t -> x = C(p-t)/p
    const x = up ? (cap * (t - p)) / (1 - p) : (cap * (p - t)) / p;
    const liquid = up ? 'pure antifreeze' : 'plain water';
    const result = up ? (p * (cap - x) + x) / cap : (p * (cap - x)) / cap;
    return {
      drain: x,
      drainPct: x / cap,
      kept: cap - x,
      tone: 'good',
      badge: `Drain ${fmt(x)} L, add ${liquid}`,
      note: `Drain ${fmt(x)} L of the old mix and replace it with ${fmt(x)} L of ${liquid}. Check: the new mix is ${fmt(result * 100, 1)}% antifreeze. Follow your manufacturer for the right mix and coolant type.`,
      chart: {
        type: 'bar' as const,
        title: 'Antifreeze share before and after',
        categories: ['Now', 'Target', 'After refill'],
        series: [{ name: 'Antifreeze %', values: [cur, tgt, result * 100] }],
        format: { format: 'number' as const, precision: 1 },
      },
      steps: [
        up
          ? `Drain = ${fmt(cap)} × (${fmt(tgt, 1)}% − ${fmt(cur, 1)}%) ÷ (100% − ${fmt(cur, 1)}%) = ${fmt(x)} L`
          : `Drain = ${fmt(cap)} × (${fmt(cur, 1)}% − ${fmt(tgt, 1)}%) ÷ ${fmt(cur, 1)}% = ${fmt(x)} L`,
        `Replace with ${fmt(x)} L of ${liquid}`,
      ],
    };
  },
  content: {
    formula: [
      'Raising the share: drain = capacity × (target − current) ÷ (1 − current)',
      'Lowering the share: drain = capacity × (current − target) ÷ current',
      'Replace what you drain with pure antifreeze (raising) or plain water (lowering)',
    ],
    body: [
      'Coolant is a mix of antifreeze and water. If the mix is too weak, you lose freeze protection; too strong, and it cools less well. You cannot just top up, because the old mix is still in the system. Instead you drain some, then refill with a stronger or weaker liquid. This calculator tells you how much.',
      'Example: a 10 L system at 30% antifreeze, aiming for 50%. Drain 10 × (0.50 − 0.30) ÷ (1 − 0.30) = 2.857 L and refill with pure antifreeze. Check: the 7.143 L left holds 2.143 L of antifreeze, plus 2.857 L added, makes 5 L in 10 L, which is 50%.',
      'This assumes you refill with pure (undiluted) antifreeze to go up, or plain water to go down, and that the whole system mixes evenly. Some coolant stays in the engine block, hoses and heater core when you drain, so a small second adjustment is common. The calculator does not say what mix your car needs and does not give freeze temperatures. Use your manufacturer\'s coolant type and ratio. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much coolant do I drain to get a 50/50 mix?', a: 'Drain capacity × (0.50 − current share) ÷ (1 − current share) and refill with pure antifreeze. For a 10 L system at 30%, that is 2.857 L.' },
      { q: 'What if my mix is too strong?', a: 'Drain capacity × (current − target) ÷ current and refill with plain water. For a 10 L system at 80% going to 50%, that is 3.75 L.' },
      { q: 'Does this give my freeze point?', a: 'No. The freeze point depends on the antifreeze type, so check the product label or your manufacturer. This tool only works out the volumes.' },
      { q: 'Why might I still be off after draining?', a: 'Coolant left in the engine block, hoses and heater core does not drain fully, and the system must run to mix. Test the mix afterwards and adjust a little if needed.' },
      { q: 'Can I use gallons instead of litres?', a: 'Yes. Enter the capacity in gallons and the answer is in gallons. The label on the result says L, but the number is in whatever unit you used.' },
    ],
    sources: [],
  },
  related: ['fuel-tank-runtime', 'gas-cost', 'heating-cost', 'ice-melt-coverage'],
  examples: [
    // 10*(0.5-0.3)/(0.7) = 2.857142857; kept 7.142857
    { values: { capacity: 10, current: 30, target: 50 }, expect: { drain: 2.857142857142857, drainPct: 0.2857142857142857, kept: 7.142857142857143 } },
    // lower: 10*(0.8-0.5)/0.8 = 3.75; kept 6.25
    { values: { capacity: 10, current: 80, target: 50 }, expect: { drain: 3.75, kept: 6.25 } },
  ],
});
