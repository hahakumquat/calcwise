import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number) => Math.round(n).toLocaleString('en-US');

export default defineCalculator({
  slug: 'generator-size',
  title: 'Generator Size Calculator from Appliance Watts',
  category: 'construction',
  description: 'Add up running watts and the biggest start-up surge to find the smallest generator that can run your appliances, plus a headroom margin.',
  keywords: ['generator size calculator', 'what size generator do i need', 'running watts vs starting watts', 'generator for power outage', 'home backup generator watts'],
  updated: '2026-11-27',
  inputs: [
    { id: 'r1', label: 'Appliance 1: Fridge: running watts', type: 'number', default: 700, min: 0, step: 50, suffix: 'W', info: 'Running (rated) watts from the nameplate. Leave blank if you have no appliance 1.' },
    { id: 's1', label: 'Appliance 1: starting watts', type: 'number', default: 2200, min: 0, step: 50, suffix: 'W', info: 'Starting (surge) watts from the nameplate. Leave blank if it does not surge, such as lights or a heater.' },
    { id: 'r2', label: 'Appliance 2: Furnace blower: running watts', type: 'number', default: 600, min: 0, step: 50, suffix: 'W', info: 'Running (rated) watts from the nameplate. Leave blank if you have no appliance 2.' },
    { id: 's2', label: 'Appliance 2: starting watts', type: 'number', default: 1500, min: 0, step: 50, suffix: 'W', info: 'Starting (surge) watts from the nameplate. Leave blank if it does not surge, such as lights or a heater.' },
    { id: 'r3', label: 'Appliance 3: Lights: running watts', type: 'number', default: 300, min: 0, step: 50, suffix: 'W', info: 'Running (rated) watts from the nameplate. Leave blank if you have no appliance 3.' },
    { id: 's3', label: 'Appliance 3: starting watts', type: 'number', default: 300, min: 0, step: 50, suffix: 'W', info: 'Starting (surge) watts from the nameplate. Leave blank if it does not surge, such as lights or a heater.' },
    { id: 'r4', label: 'Appliance 4: running watts', type: 'number', optional: true, placeholder: 'Blank to skip', min: 0, step: 50, suffix: 'W', info: 'Running (rated) watts from the nameplate. Leave blank if you have no appliance 4.' },
    { id: 's4', label: 'Appliance 4: starting watts', type: 'number', optional: true, placeholder: 'Same as running', min: 0, step: 50, suffix: 'W', info: 'Starting (surge) watts from the nameplate. Leave blank if it does not surge, such as lights or a heater.' },
    { id: 'r5', label: 'Appliance 5: running watts', type: 'number', optional: true, placeholder: 'Blank to skip', min: 0, step: 50, suffix: 'W', info: 'Running (rated) watts from the nameplate. Leave blank if you have no appliance 5.' },
    { id: 's5', label: 'Appliance 5: starting watts', type: 'number', optional: true, placeholder: 'Same as running', min: 0, step: 50, suffix: 'W', info: 'Starting (surge) watts from the nameplate. Leave blank if it does not surge, such as lights or a heater.' },
    { id: 'r6', label: 'Appliance 6: running watts', type: 'number', optional: true, placeholder: 'Blank to skip', min: 0, step: 50, suffix: 'W', info: 'Running (rated) watts from the nameplate. Leave blank if you have no appliance 6.' },
    { id: 's6', label: 'Appliance 6: starting watts', type: 'number', optional: true, placeholder: 'Same as running', min: 0, step: 50, suffix: 'W', info: 'Starting (surge) watts from the nameplate. Leave blank if it does not surge, such as lights or a heater.' },
    { id: 'headroom', label: 'Headroom', type: 'number', default: 20, min: 0, max: 100, step: 5, suffix: '%', info: 'Extra capacity so the generator is not run at its limit. 20% is a common margin; it is your choice.' },
  ],
  outputs: [
    { id: 'recommended', label: 'Recommended generator size', format: 'number', suffix: 'W', primary: true, info: 'Minimum watts plus your headroom.' },
    { id: 'running', label: 'Total running watts', format: 'number', suffix: 'W', info: 'The sum of the running watts of every appliance.' },
    { id: 'surge', label: 'Extra start-up surge', format: 'number', suffix: 'W', info: 'The largest (starting − running) gap. Only one appliance is assumed to start at a time.' },
    { id: 'minimum', label: 'Minimum generator size', format: 'number', suffix: 'W', info: 'Running watts plus the extra surge, before headroom.' },
  ],
  compute: (v) => {
    const head = num(v.headroom);
    if (head === null) return { recommended: null };
    if (head < 0) return { recommended: null, error: 'Headroom cannot be negative.' };
    let running = 0, surge = 0, count = 0;
    for (let i = 1; i <= 6; i++) {
      const r = num(v['r' + i]);
      if (r === null) continue;
      const sRaw = num(v['s' + i]);
      if (r < 0 || (sRaw !== null && sRaw < 0)) return { recommended: null, error: 'Watts cannot be negative.' };
      const s = sRaw === null ? r : sRaw;
      running += r; count++;
      surge = Math.max(surge, s - r);
    }
    if (count === 0 || running === 0) return { recommended: null, error: 'Enter running watts for at least one appliance.' };
    const minimum = running + surge;
    const recommended = minimum * (1 + head / 100);
    return {
      recommended, running, surge, minimum,
      chart: { type: 'bar', title: 'Generator watts needed', categories: ['Running', 'Minimum', 'Recommended'], series: [{ name: 'Watts', values: [running, minimum, recommended] }], highlight: 2 },
      steps: [
        `Running total: ${fmt(running)} W across ${count} appliance${count === 1 ? '' : 's'}`,
        `Extra surge: the largest starting − running gap = ${fmt(surge)} W`,
        `Minimum: ${fmt(running)} + ${fmt(surge)} = ${fmt(minimum)} W`,
        `With ${head}% headroom: ${fmt(minimum)} × ${(1 + head / 100).toFixed(2)} = ${fmt(recommended)} W`,
      ],
      note: 'Wattages come from each appliance nameplate. Never run a generator indoors or in a garage (carbon monoxide), and have an electrician fit a transfer switch.',
    };
  },
  content: {
    formula: [
      'Minimum watts = sum of running watts + largest (starting − running)',
      'Recommended watts = minimum × (1 + headroom %)',
    ],
    body: [
      'Motors in fridges, furnace blowers and pumps pull a short surge when they start, often two or three times their running watts. Heaters and lights do not surge.',
      'The calculator adds every running load, then adds the single biggest surge once, on the assumption that motors do not all start at the same instant. Then it adds your headroom.',
      'Use the watts printed on each appliance label. If you only see amps and volts, multiply them. For a whole-house hookup, ask a qualified electrician; this tool is for planning only.',
    ],
    faq: [
      { q: 'What size generator for a fridge, furnace blower and lights?', a: 'Fridge 700 W (2,200 W start), blower 600 W (1,500 W start) and lights 300 W give 1,600 W running plus a 1,500 W extra surge, so 3,100 W minimum and 3,720 W with 20% headroom.' },
      { q: 'What if nothing has a surge?', a: 'A 1,500 W space heater and 300 W of lights are 1,800 W running with no surge, so the minimum is 1,800 W and 2,160 W with 20% headroom.' },
      { q: 'Why is only one surge added?', a: 'Motors rarely start at exactly the same moment, so the largest surge is a common planning assumption. If several start together, raise the headroom.' },
      { q: 'Is it safe to run a generator in the garage?', a: 'No. Generators make carbon monoxide. Run them outdoors well away from windows and doors.' },
    ],
    sources: [],
  },
  related: ['fuel-tank-runtime', 'battery-runtime', 'electricity-cost'],
  examples: [
    { values: { r1: 700, s1: 2200, r2: 600, s2: 1500, r3: 300, s3: 300, headroom: 20 }, expect: { running: 1600, surge: 1500, minimum: 3100, recommended: 3720 }, tolerance: 0.01 },
    { values: { r1: 1500, s1: 1500, r2: 300, s2: 300, headroom: 20 }, expect: { running: 1800, surge: 0, minimum: 1800, recommended: 2160 }, tolerance: 0.01 },
  ],
});
