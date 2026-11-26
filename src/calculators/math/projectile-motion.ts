import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const G = 9.80665;

export default defineCalculator({
  slug: 'projectile-motion',
  title: 'Projectile Motion Calculator',
  category: 'math',
  description: 'Enter a launch speed and angle to get the range, peak height and flight time of a projectile on level ground.',
  metaDescription: 'Find range, maximum height and time of flight for a projectile from launch speed and angle, ignoring air drag. Free, instant, with working.',
  updated: '2026-11-26',
  keywords: ['projectile motion calculator', 'projectile range calculator', 'maximum height of a projectile', 'time of flight calculator', 'launch angle'],
  inputs: [
    { id: 'v', label: 'Launch speed (m/s)', type: 'number', default: 20, min: 0, step: 0.5, info: 'Speed at the moment of launch, in metres per second.' },
    { id: 'deg', label: 'Launch angle (degrees)', type: 'number', default: 45, min: 0, max: 90, step: 1, info: 'Angle above the horizontal, from 0 to 90 degrees.' },
  ],
  outputs: [
    { id: 'range', label: 'Range (m)', format: 'number', precision: 3, primary: true, info: 'Horizontal distance until it lands at the launch height: v² × sin(2θ) ÷ g.' },
    { id: 'height', label: 'Peak height (m)', format: 'number', precision: 3, info: 'Highest point: (v × sin θ)² ÷ (2g).' },
    { id: 'time', label: 'Flight time (s)', format: 'number', precision: 3, info: 'Time in the air: 2 × v × sin θ ÷ g.' },
  ],
  compute: (x) => {
    const v = num(x.v);
    const deg = num(x.deg);
    if (v === null || deg === null) return { range: null };
    if (v <= 0) return { range: null, error: 'Enter a launch speed above 0.' };
    if (deg < 0 || deg > 90) return { range: null, error: 'Enter an angle from 0 to 90 degrees.' };
    const t = (deg * Math.PI) / 180;
    const vy = v * Math.sin(t);
    const range = (v * v * Math.sin(2 * t)) / G;
    const height = (vy * vy) / (2 * G);
    const time = (2 * vy) / G;
    const angles = [15, 30, 45, 60, 75];
    return {
      range,
      height,
      time,
      tone: 'ok',
      badge: `${fmt(v)} m/s at ${fmt(deg)}°`,
      chart: {
        type: 'bar',
        title: 'Range at other angles (m)',
        categories: angles.map((a) => `${a}°`),
        series: [{ name: 'Range', values: angles.map((a) => (v * v * Math.sin((2 * a * Math.PI) / 180)) / G) }],
      },
      steps: [
        `Vertical speed = ${fmt(v)} × sin ${fmt(deg)}° = ${fmt(vy)} m/s`,
        `Flight time = 2 × ${fmt(vy)} ÷ ${G} = ${fmt(time)} s`,
        `Range = ${fmt(v)}² × sin(${fmt(2 * deg)}°) ÷ ${G} = ${fmt(range)} m`,
        `Peak height = ${fmt(vy)}² ÷ (2 × ${G}) = ${fmt(height)} m`,
      ],
    };
  },
  content: {
    formula: ['range = v² × sin(2θ) ÷ g', 'height = (v × sin θ)² ÷ (2g)', 'time = 2 × v × sin θ ÷ g', 'g = 9.80665 m/s²'],
    body: [
      'A projectile launched at speed v and angle θ keeps a constant horizontal speed while gravity slows and then reverses its vertical speed. On level ground this gives a neat set of formulas for how far, how high and how long.',
      'At 20 m/s and 45 degrees the range is 400 × 1 ÷ 9.80665 = 40.789 m, the peak is 200 ÷ 19.6133 = 10.197 m and the flight lasts 2.884 s. Range is greatest at 45 degrees.',
      'The model ignores air drag and assumes launch and landing at the same height, as in a typical physics class.',
    ],
    faq: [
      { q: 'What angle gives the longest range?', a: '45 degrees, because sin(2θ) is largest (1) there. Complementary angles such as 30 and 60 give equal ranges.' },
      { q: 'How far does a 20 m/s launch at 45 degrees travel?', a: 'About 40.79 m, peaking at 10.20 m after 1.44 s, landing at 2.88 s.' },
      { q: 'Is air resistance included?', a: 'No. Real projectiles travel shorter distances.' },
      { q: 'Which value of g is used?', a: 'Standard gravity, 9.80665 m/s².' },
    ],
    sources: [],
  },
  related: ['kinetic-energy', 'stopping-distance', 'distance-rate-time'],
  examples: [
    // 400/9.80665=40.78862; vy=14.142136, vy^2=200 -> 200/19.6133=10.19716; time=28.284271/9.80665=2.884148
    { values: { v: 20, deg: 45 }, expect: { range: 40.78862, height: 10.19716, time: 2.884148 }, tolerance: 0.001 },
    // 10 m/s at 90: range sin180=0, height 100/19.6133=5.098581, time 20/9.80665=2.039432
    { values: { v: 10, deg: 90 }, expect: { range: 0, height: 5.098581, time: 2.039432 }, tolerance: 0.001 },
  ],
});
