import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const C_KM_S = 299792.458; // speed of light in vacuum, exact by definition of the metre
const SOUND_KM_S = 0.343; // speed of sound in air at about 20 C

const nf = (x: number, max = 1) => x.toLocaleString('en-US', { maximumFractionDigits: max });

export default defineCalculator({
  slug: 'santa-sleigh-speed',
  title: 'Santa Sleigh Speed Calculator',
  category: 'other',
  description: 'Just for fun: how fast would Santa need to fly to visit every home in one night? Enter the stops, the gap between them and the hours, and compare it with light.',
  keywords: ['santa sleigh speed', 'how fast does santa travel', 'santa speed calculator', 'santa mach number', 'santa speed of light', 'christmas eve physics'],
  updated: '2026-11-26',
  inputs: [
    { id: 'households', label: 'Households visited (assumption)', type: 'number', default: 2000000000, min: 1, step: 1000000, info: 'An assumption, not a fact. Two billion is a round figure for homes with children celebrating. Change it to test other guesses.' },
    { id: 'hop', label: 'Average distance between stops', type: 'number', default: 0.5, min: 0, step: 0.1, suffix: 'km', info: 'The average hop from one house to the next, in kilometres. Also an assumption: dense cities are much closer, remote areas much further.' },
    { id: 'hours', label: 'Time available', type: 'number', default: 32, min: 0, step: 1, suffix: 'h', info: 'Hours to finish the whole route. Time zones stretch one night to roughly 32 hours of Christmas Eve and morning around the world.' },
  ],
  outputs: [
    { id: 'speed', label: 'Required speed', format: 'number', precision: 1, suffix: 'km/s', primary: true, info: 'Total distance divided by the time available, in kilometres per second.' },
    { id: 'light', label: 'Share of the speed of light', format: 'percent', precision: 2, info: 'Speed divided by 299,792.458 km/s. At 100% you would be travelling at light speed.' },
    { id: 'mach', label: 'Mach number', format: 'number', precision: 0, info: 'Speed divided by the speed of sound in air, taken as 0.343 km/s.' },
    { id: 'distance', label: 'Total distance', format: 'number', precision: 0, suffix: 'km', info: 'Households multiplied by the average distance between stops.' },
    { id: 'perHome', label: 'Time per home', format: 'text', info: 'The time budget for each stop, including everything Santa does there.' },
  ],
  compute: (v) => {
    const n = num(v.households), hop = num(v.hop), h = num(v.hours);
    if (n === null || hop === null || h === null) return { speed: null, note: 'Enter the households, the distance between stops and the hours.' };
    if (n <= 0) return { speed: null, error: 'Households must be greater than 0.' };
    if (hop < 0) return { speed: null, error: 'Distance between stops cannot be negative.' };
    if (h <= 0) return { speed: null, error: 'Time must be greater than 0 hours.' };

    const distance = n * hop;
    const seconds = h * 3600;
    const speed = distance / seconds;
    const light = speed / C_KM_S;
    const mach = speed / SOUND_KM_S;
    const perHome = seconds / n;
    const perHomeText = perHome >= 0.001 ? `${nf(perHome * 1000, 2)} ms` : `${nf(perHome * 1e6, 2)} µs`;

    const tone = light >= 1 ? 'bad' : light >= 0.01 ? 'warn' : 'ok';
    const badge = light >= 1 ? 'Faster than light' : `${nf(light * 100, 1)}% of light speed`;

    return {
      speed,
      light,
      mach,
      distance,
      perHome: perHomeText,
      tone,
      badge,
      note: light >= 1 ? 'That is faster than light, which nothing can do. Santa would need more hours or fewer stops.' : `About Mach ${nf(mach, 0)}. Plainly impossible for a sleigh, and a lot of fun to work out.`,
      chart: {
        type: 'bar',
        title: 'Speed in km/s (station and Earth orbit are approximate)',
        categories: ['Station', 'Earth orbit', 'Santa'],
        series: [{ name: 'km/s', values: [7.66, 29.8, speed] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Distance = ${nf(n, 0)} households × ${nf(hop, 3)} km = ${nf(distance, 0)} km`,
        `Time = ${nf(h, 2)} h × 3,600 = ${nf(seconds, 0)} s`,
        `Speed = ${nf(distance, 0)} ÷ ${nf(seconds, 0)} = ${nf(speed, 1)} km/s`,
        `Share of light = ${nf(speed, 1)} ÷ 299,792.458 = ${nf(light * 100, 2)}%`,
        `Mach = ${nf(speed, 1)} ÷ 0.343 = ${nf(mach, 0)}`,
      ],
    };
  },
  content: {
    formula: [
      'Distance = households × average distance between stops',
      'Speed (km/s) = distance ÷ (hours × 3,600)',
      'Share of light = speed ÷ 299,792.458 km/s',
      'Mach = speed ÷ 0.343 km/s',
    ],
    body: [
      'This one is for fun. It asks a simple question: if Santa had to visit every home in a single night, how fast would the sleigh have to go? The answer comes from plain distance, rate and time, with a couple of comparisons added on top.',
      'The numbers you start with are assumptions, not facts. Two billion households and half a kilometre between stops are round guesses. Change them and the answer moves in proportion, so doubling the stops doubles the speed.',
      'With the defaults the route is 1,000,000,000 km, covered in 32 hours (115,200 seconds). That is about 8,681 km/s, or roughly 2.9% of the speed of light and around Mach 25,300. That is far beyond anything a real vehicle can do, which is the joke.',
    ],
    faq: [
      { q: 'How fast does Santa need to travel?', a: 'With the default assumptions, about 8,681 km/s. That is 2 billion households × 0.5 km = 1 billion km, divided by 32 hours (115,200 s).' },
      { q: 'Is that faster than light?', a: 'No. At the defaults it is about 2.9% of the speed of light (299,792.458 km/s). It is still enormously fast, around Mach 25,300.' },
      { q: 'Is this calculator serious?', a: 'No, it is playful. The inputs are assumptions and the sums are real, but no sleigh flies at these speeds.' },
      { q: 'Why 32 hours?', a: 'Time zones spread Christmas Eve night over roughly 32 hours across the world. You can change the hours to anything you like.' },
      { q: 'What does Mach mean here?', a: 'Mach is the speed divided by the speed of sound. We use 0.343 km/s, the speed of sound in air at about 20 °C.' },
    ],
    sources: [],
  },
  related: ['distance-rate-time'],
  examples: [
    // 2e9 x 0.5 = 1e9 km; 32 h = 115,200 s; 1e9 / 115,200 = 8,680.5556 km/s
    // light = 8,680.5556 / 299,792.458 = 0.028955; mach = 8,680.5556 / 0.343 = 25,307.7
    { values: { households: 2000000000, hop: 0.5, hours: 32 }, expect: { speed: 1e9 / 115200, light: 1e9 / 115200 / 299792.458, mach: 1e9 / 115200 / 0.343, distance: 1000000000, perHome: '57.6 µs' } },
    // 1,000 x 1 km = 1,000 km in 1 h = 3,600 s -> 0.2778 km/s; mach 0.2778/0.343 = 0.81
    { values: { households: 1000, hop: 1, hours: 1 }, expect: { speed: 1000 / 3600, distance: 1000, perHome: '3,600 ms' } },
  ],
});
