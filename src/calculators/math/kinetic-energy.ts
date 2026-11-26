import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'kinetic-energy',
  title: 'Kinetic Energy Calculator',
  category: 'math',
  description: 'Enter a mass and a speed to get kinetic energy in joules, plus what the energy becomes if the speed doubles.',
  metaDescription: 'Calculate kinetic energy from mass in kg and speed in km/h with KE = ½mv². See joules, kilojoules and the jump when speed doubles.',
  updated: '2026-11-26',
  keywords: ['kinetic energy calculator', 'kinetic energy formula', 'ke = 1/2 mv^2', 'joules from mass and speed', 'energy of a moving car'],
  inputs: [
    { id: 'm', label: 'Mass (kg)', type: 'number', default: 1500, min: 0, step: 1, info: 'A typical family car is about 1,500 kg.' },
    { id: 'kmh', label: 'Speed (km/h)', type: 'number', default: 100, min: 0, step: 1, info: 'Converted to metres per second by dividing by 3.6.' },
  ],
  outputs: [
    { id: 'joules', label: 'Kinetic energy (J)', format: 'number', precision: 1, primary: true, info: 'KE = ½ × mass × speed², with speed in metres per second.' },
    { id: 'kj', label: 'Kilojoules (kJ)', format: 'number', precision: 2, info: 'Joules divided by 1,000.' },
    { id: 'double', label: 'Energy at double the speed (J)', format: 'number', precision: 1, info: 'Speed is squared, so doubling it gives four times the energy.' },
  ],
  compute: (v) => {
    const m = num(v.m);
    const kmh = num(v.kmh);
    if (m === null || kmh === null) return { joules: null };
    if (m <= 0) return { joules: null, error: 'Enter a mass above 0 kg.' };
    if (kmh < 0) return { joules: null, error: 'Enter a speed of 0 or more.' };
    const ms = kmh / 3.6;
    const joules = 0.5 * m * ms * ms;
    return {
      joules,
      kj: joules / 1000,
      double: joules * 4,
      tone: 'ok',
      badge: `${fmt(m)} kg at ${fmt(kmh)} km/h`,
      chart: {
        type: 'bar',
        title: 'Kinetic energy (kJ) by speed',
        categories: ['Half speed', 'Your speed', 'Double speed'],
        series: [{ name: 'kJ', values: [joules / 4000, joules / 1000, (joules * 4) / 1000] }],
      },
      steps: [
        `Speed = ${fmt(kmh)} ÷ 3.6 = ${fmt(ms)} m/s`,
        `KE = ½ × ${fmt(m)} × ${fmt(ms)}² = ${fmt(joules)} J`,
      ],
    };
  },
  content: {
    formula: ['KE = ½ × m × v²', 'v (m/s) = km/h ÷ 3.6'],
    body: [
      'Kinetic energy is the energy an object has because it is moving. It grows with mass but with the square of speed, which is why fast things are so much harder to stop.',
      'A 1,500 kg car at 100 km/h is moving at 27.78 m/s. Its kinetic energy is ½ × 1,500 × 27.78² ≈ 578,704 joules, about 579 kJ. At 200 km/h it carries four times as much.',
      'This is a physics-class calculation that ignores rotation and air drag.',
    ],
    faq: [
      { q: 'What is the kinetic energy of a 1,500 kg car at 100 km/h?', a: 'About 578,704 J, or 578.7 kJ.' },
      { q: 'Why does doubling speed quadruple the energy?', a: 'Speed is squared in the formula, so 2² = 4.' },
      { q: 'What units does the answer use?', a: 'Joules, where 1 J = 1 kg·m²/s². Speed is converted from km/h to m/s first.' },
      { q: 'Does this include rotation?', a: 'No. It covers straight-line motion only.' },
    ],
    sources: [],
  },
  related: ['stopping-distance', 'density'],
  examples: [
    // v=100/3.6=27.77778; v^2=771.60494; *750 = 578703.70
    { values: { m: 1500, kmh: 100 }, expect: { joules: 578703.7, kj: 578.70, double: 2314814.8 }, tolerance: 0.5 },
    // 10 kg at 36 km/h = 10 m/s: 0.5*10*100 = 500
    { values: { m: 10, kmh: 36 }, expect: { joules: 500, kj: 0.5, double: 2000 }, tolerance: 0.001 },
  ],
});
