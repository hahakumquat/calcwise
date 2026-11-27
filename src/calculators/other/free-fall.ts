import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

const G = 9.80665;

export default defineCalculator({
  slug: 'free-fall',
  title: 'Free Fall Calculator: Time and Impact Speed',
  category: 'other',
  description: 'Enter a drop height to get the fall time and the speed on impact, ignoring air resistance. Shows km/h and mph too, with the working.',
  keywords: ['free fall calculator', 'free fall time calculator', 'falling object speed', 'how fast does a dropped object hit the ground', 'impact speed from height'],
  updated: '2026-11-27',
  inputs: [
    { id: 'h', label: 'Drop height (m)', type: 'number', default: 100, min: 0, step: 1, info: 'Height the object falls from, in metres, starting at rest.' },
  ],
  outputs: [
    { id: 'time', label: 'Fall time (s)', format: 'number', precision: 3, primary: true, info: 't = √(2h ÷ g).' },
    { id: 'speed', label: 'Impact speed (m/s)', format: 'number', precision: 3, info: 'v = g × t = √(2gh).' },
    { id: 'kmh', label: 'Impact speed (km/h)', format: 'number', precision: 2, info: 'The same speed in kilometres per hour, which is m/s times 3.6.' },
    { id: 'mph', label: 'Impact speed (mph)', format: 'number', precision: 2, info: 'The same speed in miles per hour, which is m/s times 2.23694.' },
  ],
  compute: (x) => {
    const h = num(x.h);
    if (h === null) return { time: null };
    if (h <= 0) return { time: null, error: 'Enter a drop height above 0.' };
    const time = Math.sqrt((2 * h) / G);
    const speed = G * time;
    const heights = [0.25, 0.5, 1, 1.5, 2].map((k) => h * k);
    return {
      time,
      speed,
      kmh: speed * 3.6,
      mph: speed * 2.2369362920544,
      tone: 'ok',
      badge: `${fmt(h)} m drop`,
      chart: {
        type: 'bar',
        title: 'Fall time at other heights (s)',
        categories: heights.map((v) => `${fmt(v)} m`),
        series: [{ name: 'Fall time', values: heights.map((v) => Math.sqrt((2 * v) / G)) }],
      },
      steps: [
        `Fall time = √(2 × ${fmt(h)} ÷ ${G}) = ${fmt(time)} s`,
        `Impact speed = ${G} × ${fmt(time)} = ${fmt(speed)} m/s`,
      ],
      note: 'Ignores air resistance, so real objects, especially light or flat ones, land later and slower.',
    };
  },
  content: {
    formula: ['t = √(2h ÷ g)', 'v = g × t = √(2gh)', 'g = 9.80665 m/s²'],
    body: [
      'An object dropped from rest gains speed at a steady rate of g, about 9.8 metres per second every second, when air resistance is ignored. The distance fallen is h = ½ g t², so the fall time is t = √(2h ÷ g), and the speed at the bottom is v = g × t.',
      'Dropped from 100 m, the fall takes √(200 ÷ 9.80665) = 4.516 s and the object hits at 44.287 m/s, which is 159.43 km/h or 99.07 mph. Doubling the height does not double the time: it multiplies it by about 1.41.',
      'In real air, drag caps the speed (terminal velocity), so this is an upper bound for anything that falls a long way or is light for its size.',
    ],
    faq: [
      { q: 'How long does it take to fall 100 metres?', a: 'About 4.52 seconds with no air resistance, landing at 44.29 m/s (159.4 km/h).' },
      { q: 'How fast is an object going after falling 20 metres?', a: 'About 19.81 m/s, which is 71.3 km/h or 44.3 mph, after 2.02 seconds.' },
      { q: 'Does mass change the fall time?', a: 'Not in a vacuum: all objects fall at the same rate. In air, drag makes light, flat objects fall slower.' },
      { q: 'Which value of g is used?', a: 'Standard gravity, 9.80665 m/s².' },
      { q: 'Is air resistance included?', a: 'No. For long falls the real speed is lower because drag limits it to a terminal velocity.' },
    ],
    sources: [],
  },
  related: ['projectile-motion', 'kinetic-energy', 'stopping-distance'],
  examples: [
    // t = sqrt(200/9.80665)=4.516008, v = 9.80665*t = 44.286906
    { values: { h: 100 }, expect: { time: 4.516008, speed: 44.286906, kmh: 159.432860, mph: 99.066986 }, tolerance: 0.001 },
    // t = sqrt(40/9.80665)=2.019620, v=19.805706
    { values: { h: 20 }, expect: { time: 2.01962, speed: 19.805706, kmh: 71.30054 }, tolerance: 0.001 },
  ],
});
