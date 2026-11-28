import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

const N = 5;
const slots = Array.from({ length: N }, (_, i) => i + 1);

export default defineCalculator({
  slug: 'circuit-breaker-load',
  title: 'Circuit Breaker Load Calculator',
  category: 'construction',
  description: 'Check whether your loads fit a 15 to 50 amp breaker using the 125% continuous-load rule, and see the most continuous watts the breaker can carry.',
  keywords: ['circuit breaker load calculator', 'continuous load calculator', '80 percent rule breaker', 'breaker load check', 'how many watts on a 20 amp circuit', 'nec 210.19 continuous load'],
  updated: '2026-11-28',
  inputs: [
    {
      id: 'breaker', label: 'Breaker size', type: 'select', default: '20',
      options: [15, 20, 30, 40, 50].map((a) => ({ value: String(a), label: `${a} A` })),
      info: 'The amp rating printed on the breaker handle.',
    },
    { id: 'volts', label: 'Voltage', type: 'number', default: 120, min: 0, step: 1, suffix: 'V', info: 'Typically 120 V for standard outlets and 240 V for large appliances. Use the voltage on the appliance label.' },
    ...slots.flatMap((i) => [
      { id: `w${i}`, label: `Load ${i} watts`, type: 'number' as const, default: i === 1 ? 1200 : i === 2 ? 400 : undefined, min: 0, step: 10, suffix: 'W', optional: true, info: i === 1 ? 'Watts from the appliance label. If only amps are listed, multiply amps by volts. Leave unused loads blank.' : 'Leave blank if you have no more loads on this circuit.' },
      { id: `c${i}`, label: `Load ${i} runs 3 hours or more`, type: 'toggle' as const, default: i === 1, info: 'A continuous load runs for 3 hours or more at a time, such as a space heater, lighting or an EV charger.' },
    ]),
  ],
  outputs: [
    { id: 'sizingAmps', label: 'Sizing load', format: 'number', precision: 2, suffix: 'A', primary: true, info: '125% of the continuous amps plus the non-continuous amps. It must not exceed the breaker rating.' },
    { id: 'sizingWatts', label: 'Sizing load (watts)', format: 'number', precision: 0, suffix: 'W', info: '125% of continuous watts plus non-continuous watts.' },
    { id: 'actualAmps', label: 'Actual running current', format: 'number', precision: 2, suffix: 'A', info: 'Total watts ÷ volts, with no 125% factor.' },
    { id: 'spareAmps', label: 'Spare capacity', format: 'number', precision: 2, suffix: 'A', info: 'Breaker amps minus the sizing load. Negative means overloaded.' },
    { id: 'maxContAmps', label: 'Max continuous current', format: 'number', precision: 2, suffix: 'A', info: 'Breaker amps × 0.8, the same as the sizing rule for a single continuous load.' },
    { id: 'maxContWatts', label: 'Max continuous watts', format: 'number', precision: 0, suffix: 'W', info: 'Max continuous amps × volts.' },
  ],
  compute: (v) => {
    const breaker = Number(v.breaker);
    const volts = num(v.volts);
    if (volts === null || !Number.isFinite(breaker) || breaker <= 0) return { sizingAmps: null };
    if (volts <= 0) return { sizingAmps: null, error: 'Voltage must be greater than zero.' };
    let cont = 0, other = 0, count = 0;
    for (const i of slots) {
      const w = num(v[`w${i}`]);
      if (w === null) continue;
      if (w < 0) return { sizingAmps: null, error: 'Watts cannot be negative.' };
      count++;
      if (v[`c${i}`] === 'on') cont += w; else other += w;
    }
    if (count === 0) return { sizingAmps: null };
    const sizingWatts = 1.25 * cont + other;
    const sizingAmps = sizingWatts / volts;
    const actualAmps = (cont + other) / volts;
    const spareAmps = breaker - sizingAmps;
    const maxContAmps = breaker * 0.8;
    const maxContWatts = maxContAmps * volts;
    const pass = sizingAmps <= breaker + 1e-9;
    const close = pass && sizingAmps > breaker * 0.9;
    return {
      sizingAmps, sizingWatts, actualAmps, spareAmps, maxContAmps, maxContWatts,
      tone: !pass ? 'bad' : close ? 'warn' : 'good',
      badge: pass ? (close ? `Tight fit on ${breaker} A` : `Fits a ${breaker} A breaker`) : `Overloaded on ${breaker} A`,
      chart: {
        type: 'bar',
        title: 'Sizing load vs breaker (amps)',
        categories: ['Running current', 'Sizing load', 'Breaker rating'],
        series: [{ name: 'Amps', values: [actualAmps, sizingAmps, breaker] }],
        format: { format: 'number', precision: 2, suffix: ' A' },
        highlight: 1,
      },
      steps: [
        `Continuous ${fmt(cont, 0)} W × 1.25 = ${fmt(1.25 * cont, 1)} W; non-continuous ${fmt(other, 0)} W`,
        `Sizing load = ${fmt(sizingWatts, 1)} W ÷ ${fmt(volts)} V = ${fmt(sizingAmps)} A`,
        `Breaker ${breaker} A: ${pass ? `${fmt(sizingAmps)} ≤ ${breaker}, passes` : `${fmt(sizingAmps)} > ${breaker}, fails`}`,
        `Max continuous = ${breaker} × 0.8 = ${fmt(maxContAmps)} A = ${fmt(maxContWatts, 0)} W`,
      ],
      note: 'This is an estimate based on NEC 210.19 and 210.20. Motors, heating cables, EV chargers and wire size have their own rules. A licensed electrician should confirm any real circuit.',
    };
  },
  content: {
    formula: [
      'Amps = watts ÷ volts',
      'Sizing load = 1.25 × continuous load + non-continuous load',
      'Pass when sizing load ≤ breaker amps (the same as continuous load ≤ 80% of the breaker)',
      'Max continuous watts = breaker amps × 0.8 × volts',
    ],
    body: [
      'A breaker is meant to carry a continuous load, one that runs for 3 hours or more, at no more than 80% of its rating. The same rule is written the other way round as sizing the circuit for 125% of the continuous load, plus the other loads at 100%. This calculator applies that rule to up to five loads on one circuit.',
      'Enter the watts for each load, mark the ones that run for 3 hours or more, and pick the breaker. The result shows the sizing load in amps and watts, the spare capacity, and the most continuous watts that breaker can carry at your voltage.',
      'This is a planning estimate based on NEC 210.19 and 210.20. Motors, EV chargers, wire gauge, terminals and local code amendments can change what is allowed, so a licensed electrician decides.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'At 120 V, a 1,200 W heater running continuously plus 400 W of other loads gives a sizing load of 1.25 × 1,200 + 400 = 1,900 W, or 15.83 A. That passes a 20 A breaker but fails a 15 A one.' },
      { q: 'How many watts can a 20 amp circuit carry continuously?', a: 'At 120 V, 20 A × 0.8 = 16 A, which is 1,920 W. Short-term loads can use more, up to the full 2,400 W, but not for 3 hours or more.' },
      { q: 'What counts as a continuous load?', a: 'Any load expected to run for 3 hours or more at a time, such as a space heater, lighting, or an EV charger. A hair dryer or toaster is usually not continuous.' },
      { q: 'Does this replace an electrician?', a: 'No. It is an estimate. Motor loads, wire size, shared neutrals and local code are not covered, and a licensed electrician should confirm any circuit.' },
    ],
    sources: [],
  },
  related: ['holiday-lights', 'electricity-cost', 'generator-size'],
  examples: [
    // 120 V: 1.25*1200 + 400 = 1900 W; /120 = 15.8333 A; actual 1600/120 = 13.3333; 20 A spare 4.1667; max cont 16 A = 1920 W
    { values: { breaker: '20', volts: 120, w1: 1200, c1: 'on', w2: 400, c2: 'off' }, expect: { sizingWatts: 1900, sizingAmps: 15.8333333, actualAmps: 13.3333333, spareAmps: 4.1666667, maxContAmps: 16, maxContWatts: 1920 }, tolerance: 1e-4 },
    // same loads on 15 A: spare 15 - 15.8333 = -0.8333 (fails)
    { values: { breaker: '15', volts: 120, w1: 1200, c1: 'on', w2: 400, c2: 'off' }, expect: { sizingAmps: 15.8333333, spareAmps: -0.8333333, maxContAmps: 12, maxContWatts: 1440 }, tolerance: 1e-4 },
    // 240 V, 30 A: 3000 W continuous -> 3750 W / 240 = 15.625 A; max cont 24 A = 5760 W
    { values: { breaker: '30', volts: 240, w1: 3000, c1: 'on', w2: null, c2: 'off' }, expect: { sizingAmps: 15.625, maxContAmps: 24, maxContWatts: 5760 }, tolerance: 1e-6 },
  ],
});

