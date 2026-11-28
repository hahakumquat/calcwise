import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'momentum-impulse',
  title: 'Momentum and Impulse Calculator',
  category: 'math',
  description: 'Work out momentum from mass and speed, then the average force needed to stop it in a given time, or the time a given force takes.',
  metaDescription: 'Momentum and impulse calculator: p = mv, J = Ft. Find momentum, impulse and the average stopping force from mass, speed and stop time (or the time).',
  updated: '2026-11-28',
  keywords: ['momentum calculator', 'impulse calculator', 'p = mv', 'impulse equals change in momentum', 'average force to stop', 'impulse momentum theorem'],
  inputs: [
    { id: 'm', label: 'Mass', type: 'number', unit: 'mass', units: ['kg', 'g', 'lb'], defaultUnit: 'kg', default: 0.145, min: 0, step: 0.1, info: 'The mass of the moving object. A baseball is about 0.145 kg, a car around 1,500 kg.' },
    { id: 'v', label: 'Speed', type: 'number', unit: 'speed', units: ['mps', 'kph', 'mph'], defaultUnit: 'mps', default: 40, min: 0, step: 1, info: 'The speed just before it is stopped. Converted to metres per second.' },
    {
      id: 'mode',
      label: 'What do you know?',
      type: 'select',
      segmented: true,
      default: 'time',
      options: [
        { value: 'time', label: 'Stop time' },
        { value: 'force', label: 'Force' },
      ],
      info: 'Pick Stop time to get the average force. Pick Force to get how long it takes to stop.',
    },
    { id: 't', label: 'Stop time (seconds)', type: 'number', suffix: 's', default: 0.01, min: 0, step: 0.01, showWhen: { input: 'mode', is: 'time' }, info: 'How long the object takes to come to rest. A longer stop means a smaller force.' },
    { id: 'F', label: 'Stopping force (N)', type: 'number', suffix: 'N', default: 580, min: 0, step: 10, showWhen: { input: 'mode', is: 'force' }, info: 'A constant force acting against the motion, in newtons.' },
  ],
  outputs: [
    { id: 'force', label: 'Average stopping force', format: 'number', precision: 2, suffix: 'N', primary: true, showWhen: { input: 'mode', is: 'time' }, info: 'F = p ÷ t. This is the average over the stop, not the peak force.' },
    { id: 'time', label: 'Time to stop', format: 'number', precision: 4, suffix: 's', primary: true, showWhen: { input: 'mode', is: 'force' }, info: 't = p ÷ F, assuming the force stays constant.' },
    { id: 'p', label: 'Momentum', format: 'number', precision: 4, suffix: 'kg·m/s', info: 'p = mass × speed.' },
    { id: 'J', label: 'Impulse needed', format: 'number', precision: 4, suffix: 'N·s', info: 'Impulse equals the change in momentum, here the full momentum since the object stops.' },
  ],
  compute: (v) => {
    const m = num(v.m);
    const s = num(v.v);
    const mode = v.mode === 'force' ? 'force' : 'time';
    if (m === null || s === null) return { p: null };
    if (m <= 0) return { p: null, error: 'Enter a mass above 0.' };
    if (s < 0) return { p: null, error: 'Enter a speed of 0 or more.' };
    const p = m * s;
    let force: number | null = null;
    let time: number | null = null;
    if (mode === 'time') {
      const t = num(v.t);
      if (t === null) return { p, J: p };
      if (t <= 0) return { p: null, error: 'Enter a stop time above 0 seconds.' };
      time = t;
      force = p / t;
    } else {
      const F = num(v.F);
      if (F === null) return { p, J: p };
      if (F <= 0) return { p: null, error: 'Enter a force above 0 newtons.' };
      force = F;
      time = p / F;
    }
    const f0 = force;
    const t0 = time;
    return {
      p,
      J: p,
      force: f0,
      time: t0,
      tone: 'ok',
      badge: `${fmt(m, 4)} kg at ${fmt(s, 4)} m/s`,
      note: 'This is the average force over the stop. The peak force during a real impact is higher.',
      chart: {
        type: 'bar',
        title: 'Average force (N) by stop time',
        categories: ['Half your time', 'Your time', 'Double', '10 × longer'],
        series: [{ name: 'Newtons', values: [p / (t0 / 2), p / t0, p / (t0 * 2), p / (t0 * 10)] }],
      },
      steps: [
        `p = ${fmt(m, 6)} × ${fmt(s, 6)} = ${fmt(p, 6)} kg·m/s`,
        mode === 'time' ? `F = ${fmt(p, 6)} ÷ ${fmt(t0, 6)} = ${fmt(f0, 6)} N` : `t = ${fmt(p, 6)} ÷ ${fmt(f0, 6)} = ${fmt(t0, 6)} s`,
      ],
    };
  },
  content: {
    formula: ['p = m × v', 'J = F × t = change in p', 'F = p ÷ t (stopping to rest)'],
    body: [
      'Momentum is mass times velocity. Impulse is a force applied over time, and the impulse-momentum theorem says it equals the change in momentum: F × t = Δp. To stop an object, you must remove all of its momentum, so a longer stopping time means a smaller force.',
      'A 0.145 kg baseball at 40 m/s has p = 5.8 kg·m/s. Stopped in 0.01 s the average force is 580 N, and in 0.1 s only 58 N, which is why a catcher’s mitt gives way. A 1,500 kg car at 20 m/s has p = 30,000 kg·m/s, and stopping it in 3 s takes an average of 10,000 N.',
      'The answer is the average force across the stop. Real impacts have a peak that is higher than the average.',
    ],
    faq: [
      { q: 'What is the momentum of a 0.145 kg ball at 40 m/s?', a: '5.8 kg·m/s. Stopped in 0.01 s the average force is 580 N, and in 0.1 s it is 58 N.' },
      { q: 'What force stops a 1,500 kg car at 20 m/s in 3 seconds?', a: 'Momentum is 30,000 kg·m/s, so the average force is 30,000 ÷ 3 = 10,000 N.' },
      { q: 'What is impulse?', a: 'Force multiplied by the time it acts. It equals the change in momentum, measured in newton-seconds (the same as kg·m/s).' },
      { q: 'Why does a longer stop reduce the force?', a: 'The same momentum must be removed, so F = p ÷ t falls as t grows. Ten times the time means a tenth of the force.' },
      { q: 'Is this the peak force?', a: 'No. It is the average force over the stopping time. The peak can be much higher.' },
    ],
    sources: [{ label: 'NASA Glenn: Momentum', url: 'https://www.grc.nasa.gov/www/k-12/airplane/Animation/ballistic/momentum.html' }],
  },
  related: ['kinetic-energy', 'stopping-distance', 'projectile-motion'],
  examples: [
    // p = 0.145 × 40 = 5.8; F = 5.8 / 0.01 = 580
    { values: { m: 0.145, v: 40, mode: 'time', t: 0.01 }, expect: { p: 5.8, J: 5.8, force: 580 }, tolerance: 1e-6 },
    // F = 5.8 / 0.1 = 58
    { values: { m: 0.145, v: 40, mode: 'time', t: 0.1 }, expect: { p: 5.8, force: 58 }, tolerance: 1e-6 },
    // p = 1500 × 20 = 30,000; F = 30,000 / 3 = 10,000
    { values: { m: 1500, v: 20, mode: 'time', t: 3 }, expect: { p: 30000, force: 10000 }, tolerance: 1e-6 },
    // t = 30,000 / 5,000 = 6
    { values: { m: 1500, v: 20, mode: 'force', F: 5000 }, expect: { p: 30000, time: 6 }, tolerance: 1e-6 },
  ],
});
