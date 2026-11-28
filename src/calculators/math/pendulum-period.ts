import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const WORLDS: Record<string, { label: string; g: number }> = {
  earth: { label: 'Earth', g: 9.80665 },
  moon: { label: 'Moon', g: 1.62 },
  mars: { label: 'Mars', g: 3.71 },
};

export default defineCalculator({
  slug: 'pendulum-period',
  title: 'Pendulum Period Calculator',
  category: 'math',
  description: 'Find the period and frequency of a simple pendulum from its length, or the length needed for a chosen period, on Earth, the Moon or Mars.',
  metaDescription: 'Pendulum period calculator: T = 2π√(L/g). Get period and frequency from length, or the length for a given period, on Earth, Moon, Mars or custom gravity.',
  updated: '2026-11-28',
  keywords: ['pendulum period calculator', 'pendulum length calculator', 'simple pendulum formula', 'T = 2 pi sqrt(L/g)', 'pendulum frequency', 'length for 1 second pendulum'],
  inputs: [
    {
      id: 'mode',
      label: 'What do you know?',
      type: 'select',
      segmented: true,
      default: 'length',
      options: [
        { value: 'length', label: 'Length' },
        { value: 'period', label: 'Period' },
      ],
      info: 'Pick Length to get the period and frequency. Pick Period to find the length that gives it.',
    },
    { id: 'L', label: 'Pendulum length', type: 'number', unit: 'length', units: ['m', 'cm', 'ft', 'in'], defaultUnit: 'm', default: 1, min: 0, step: 0.1, showWhen: { input: 'mode', is: 'length' }, info: 'From the pivot to the centre of the bob (the weight). For a string and small ball, measure to the ball’s centre.' },
    { id: 'T', label: 'Period (seconds)', type: 'number', suffix: 's', default: 2, min: 0, step: 0.1, showWhen: { input: 'mode', is: 'period' }, info: 'The time for one full swing out and back to where it started. A 2 s period means 1 s each way.' },
    {
      id: 'world',
      label: 'Gravity',
      type: 'select',
      default: 'earth',
      options: [
        { value: 'earth', label: 'Earth (9.80665 m/s²)' },
        { value: 'moon', label: 'Moon (1.62 m/s²)' },
        { value: 'mars', label: 'Mars (3.71 m/s²)' },
        { value: 'custom', label: 'Custom' },
      ],
      info: 'Gravitational acceleration g. Earth uses standard gravity; real values vary slightly with place and height.',
    },
    { id: 'g', label: 'Custom gravity (m/s²)', type: 'number', suffix: 'm/s²', default: 9.8, min: 0, step: 0.01, showWhen: { input: 'world', is: 'custom' }, info: 'Your own value of g in metres per second squared.' },
    { id: 'angle', label: 'Swing angle (degrees)', type: 'number', suffix: '°', default: 10, min: 0, max: 179, step: 1, optional: true, help: 'Only used for the small-angle check.', info: 'How far you pull the pendulum from vertical before letting go. The formula is accurate for small angles, below about 15°.' },
  ],
  outputs: [
    { id: 'period', label: 'Period', format: 'number', precision: 4, suffix: 's', primary: true, showWhen: { input: 'mode', is: 'length' }, info: 'T = 2π√(L ÷ g): the time for one full back-and-forth swing.' },
    { id: 'needed', label: 'Length needed', unit: 'length', units: ['m', 'cm', 'ft', 'in'], defaultUnit: 'm', precision: 4, primary: true, showWhen: { input: 'mode', is: 'period' }, info: 'L = g × T² ÷ (4π²): the pendulum length that gives your period.' },
    { id: 'freq', label: 'Frequency', format: 'number', precision: 4, suffix: 'Hz', info: 'Swings per second, 1 ÷ period.' },
    { id: 'gUsed', label: 'Gravity used', format: 'number', precision: 5, suffix: 'm/s²', info: 'The value of g behind the result.' },
  ],
  compute: (v) => {
    const mode = v.mode === 'period' ? 'period' : 'length';
    const world = String(v.world ?? 'earth');
    const g = world === 'custom' ? num(v.g) : (WORLDS[world] ?? WORLDS.earth).g;
    const angle = num(v.angle);
    if (g === null) return { period: null, needed: null };
    if (g <= 0) return { period: null, needed: null, error: 'Gravity must be above 0.' };
    if (angle !== null && (angle < 0 || angle >= 180)) return { period: null, needed: null, error: 'Enter a swing angle from 0 to under 180 degrees.' };

    let L: number;
    let T: number;
    if (mode === 'length') {
      const l = num(v.L);
      if (l === null) return { period: null };
      if (l <= 0) return { period: null, error: 'Enter a length above 0.' };
      L = l;
      T = 2 * Math.PI * Math.sqrt(L / g);
    } else {
      const t = num(v.T);
      if (t === null) return { needed: null };
      if (t <= 0) return { needed: null, error: 'Enter a period above 0 seconds.' };
      T = t;
      L = (g * T * T) / (4 * Math.PI * Math.PI);
    }

    const big = angle !== null && angle > 15;
    // First-order large-angle correction: T ≈ T0 × (1 + θ²/16), θ in radians.
    const th = ((angle ?? 0) * Math.PI) / 180;
    const corr = 1 + (th * th) / 16;
    const note = big
      ? `A ${fmt(angle ?? 0)}° swing is above the roughly 15° limit for the small-angle formula. The real period is about ${((corr - 1) * 100).toFixed(1)}% longer than shown. Mass does not change the period.`
      : 'Valid for small swings, below about 15°. Mass does not change the period.';

    const gName = world === 'custom' ? 'custom gravity' : (WORLDS[world] ?? WORLDS.earth).label;
    const cats = Object.values(WORLDS).map((w) => w.label);
    const vals = Object.values(WORLDS).map((w) => 2 * Math.PI * Math.sqrt(L / w.g));
    return {
      period: T,
      needed: L,
      freq: 1 / T,
      gUsed: g,
      tone: big ? 'warn' : 'ok',
      badge: big ? `Large swing (${fmt(angle ?? 0)}°): formula is approximate` : `${fmt(L, 4)} m pendulum on ${gName}`,
      note,
      chart: {
        type: 'bar',
        title: `Period (s) of a ${fmt(L, 4)} m pendulum`,
        categories: cats,
        series: [{ name: 'Seconds', values: vals }],
      },
      steps:
        mode === 'length'
          ? [`T = 2π × √(${fmt(L, 6)} ÷ ${fmt(g, 6)}) = ${fmt(T, 6)} s`, `f = 1 ÷ ${fmt(T, 6)} = ${fmt(1 / T, 6)} Hz`]
          : [`L = ${fmt(g, 6)} × ${fmt(T, 6)}² ÷ (4π²) = ${fmt(L, 6)} m`, `f = 1 ÷ ${fmt(T, 6)} = ${fmt(1 / T, 6)} Hz`],
    };
  },
  content: {
    formula: ['T = 2π × √(L ÷ g)', 'f = 1 ÷ T', 'L = g × T² ÷ (4π²)', 'Small-angle only: swing below about 15°'],
    body: [
      'A simple pendulum is a weight on a light string or rod swinging from a fixed pivot. Its period, the time for one full swing out and back, depends only on its length and on gravity. A longer pendulum swings more slowly, and weaker gravity slows it down too.',
      'For a 1 m pendulum on Earth, T = 2π√(1 ÷ 9.80665) = 2.0064 s, so the frequency is 0.4984 Hz. Run the same pendulum on the Moon, where g is 1.62 m/s², and it takes 4.937 s per swing.',
      'The formula assumes a small swing angle, below about 15 degrees, a string with no mass and no air drag. Bigger swings take slightly longer than the formula says. The mass of the bob does not appear in the formula at all.',
    ],
    sections: [
      {
        heading: 'Finding the length for a given period',
        paragraphs: ['Rearranged, L = g × T² ÷ (4π²). A pendulum with a 2 second period on Earth needs L = 9.80665 × 4 ÷ 39.478 = 0.9936 m, which is why a "seconds pendulum" is almost exactly one metre long.'],
      },
    ],
    faq: [
      { q: 'What is the period of a 1 m pendulum on Earth?', a: 'About 2.0064 seconds, with a frequency of 0.4984 Hz, using g = 9.80665 m/s².' },
      { q: 'How long must a pendulum be to have a 2 second period?', a: 'About 0.9936 m (99.4 cm) on Earth.' },
      { q: 'How fast does a 1 m pendulum swing on the Moon?', a: 'With g = 1.62 m/s² the period is about 4.937 seconds.' },
      { q: 'Does the mass of the bob matter?', a: 'No. Mass cancels out, so a heavy and a light bob on the same length swing at the same rate.' },
      { q: 'When is the formula not accurate?', a: 'For swings above roughly 15 degrees. The calculator flags this and estimates how much longer the real period is, using T ≈ T0 × (1 + θ²/16).' },
    ],
    sources: [
      { label: 'NIST: standard acceleration of gravity', url: 'https://physics.nist.gov/cgi-bin/cuu/Value?gn' },
      { label: 'NASA Planetary Fact Sheet', url: 'https://nssdc.gsfc.nasa.gov/planetary/factsheet/' },
    ],
  },
  related: ['kinetic-energy', 'projectile-motion', 'circle'],
  examples: [
    // T = 2π√(1/9.80665) = 2π × 0.319334 = 2.006409; f = 0.498403
    { values: { mode: 'length', L: 1, world: 'earth', angle: 10 }, expect: { period: 2.006409, freq: 0.498403, gUsed: 9.80665 }, tolerance: 1e-5 },
    // L = 9.80665 × 4 / (4π²) = 39.2266 / 39.47842 = 0.993621
    { values: { mode: 'period', T: 2, world: 'earth', angle: 10 }, expect: { needed: 0.993621, freq: 0.5 }, tolerance: 1e-5 },
    // Moon: T = 2π√(1/1.62) = 2π × 0.785674 = 4.936537
    { values: { mode: 'length', L: 1, world: 'moon', angle: 10 }, expect: { period: 4.936537, gUsed: 1.62 }, tolerance: 1e-5 },
  ],
});
