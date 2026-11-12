import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmtDuration, hmsToSeconds } from '../../lib/helpers/health';

const MILE = 1609.344;
const RACES: [string, number][] = [
  ['1 mile', MILE],
  ['5K', 5000],
  ['10K', 10000],
  ['Half marathon', 21097.5],
  ['Marathon', 42195],
];

export default defineCalculator({
  slug: 'pace',
  title: 'Running Pace Calculator',
  category: 'sports',
  description: 'Work out your running pace per mile and per kilometre, and your average speed, from distance and time.',
  keywords: ['pace calculator', 'min per mile', 'min per km', 'running speed', 'marathon pace', '5k pace'],
  popular: true,
  inputs: [
    { id: 'distance', label: 'Distance', type: 'number', unit: 'length', units: ['km', 'mi', 'm'], defaultUnit: 'km', default: 5, help: '5K = 5 km, 10K = 10 km, half marathon = 21.0975 km, marathon = 42.195 km.', info: 'How far you ran (or plan to run). Switch the unit to miles or metres if you prefer.' },
    { id: 'hours', label: 'Time — hours', type: 'number', suffix: 'h', default: 0, min: 0, step: 1, info: 'Whole hours of your finish time. Leave at 0 for runs under an hour.' },
    { id: 'minutes', label: 'Time — minutes', type: 'number', suffix: 'min', default: 28, min: 0, step: 1, info: 'Minutes of your finish time, e.g. 28 for a 28:30 5K.' },
    { id: 'seconds', label: 'Time — seconds', type: 'number', suffix: 's', default: 30, min: 0, step: 1, info: 'Seconds of your finish time, e.g. 30 for a 28:30 5K.' },
  ],
  outputs: [
    { id: 'pacePerMile', label: 'Pace per mile', primary: true, format: 'text', info: 'Average minutes and seconds taken to cover each mile.' },
    { id: 'pacePerKm', label: 'Pace per kilometre', format: 'text', info: 'Average minutes and seconds taken to cover each kilometre.' },
    { id: 'speed', label: 'Average speed', unit: 'speed', units: ['mph', 'kph', 'mps'], defaultUnit: 'mph', precision: 2, info: 'Distance divided by time — the treadmill setting that matches your pace.' },
    { id: 'totalTime', label: 'Total time', format: 'text', info: 'Your entered time as h:mm:ss, for checking.' },
  ],
  compute: (v) => {
    const d = num(v.distance);
    const t = hmsToSeconds(v.hours, v.minutes, v.seconds);
    if (!d || d <= 0 || !t || t <= 0) return { pacePerMile: null };
    const perKm = t / (d / 1000);
    const perMile = t / (d / MILE);
    return {
      pacePerMile: `${fmtDuration(perMile)} /mi`,
      pacePerKm: `${fmtDuration(perKm)} /km`,
      speed: d / t,
      totalTime: fmtDuration(t),
      chart: {
        type: 'bar',
        title: 'Finish times at this pace',
        categories: RACES.map(([n]) => n),
        series: [{ name: 'Finish time', values: RACES.map(([, m]) => (t * (m / d)) / 60) }],
        format: { suffix: 'min' },
      },
      steps: [
        `Time = ${t} s; distance = ${(d / 1000).toFixed(3)} km = ${(d / MILE).toFixed(3)} mi`,
        `Pace = ${t} s ÷ ${(d / 1000).toFixed(3)} km = ${perKm.toFixed(1)} s/km = ${fmtDuration(perKm)} /km`,
        `Speed = ${(d / 1000).toFixed(3)} km ÷ ${(t / 3600).toFixed(4)} h = ${((d / t) * 3.6).toFixed(2)} km/h`,
      ],
    };
  },
  content: {
    formula: ['Pace = time ÷ distance', 'Speed = distance ÷ time', '1 mile = 1.609344 km'],
    body: [
      'Pace is the time it takes to cover one unit of distance, usually written as minutes and seconds per mile or per kilometre. Runners prefer pace to speed because it maps directly onto a watch: if your target is 9:00 per mile, you know exactly where you should be at each mile marker.',
      'Enter a distance and your finish time (or a goal time) to get the average pace and speed. Average pace hides variation — hills, wind and slowing down late in a race — so for racing, many runners aim for even or slightly faster second-half splits.',
      'To convert between the two pace units, multiply a per-kilometre pace by 1.609 to get the per-mile pace, or divide a per-mile pace by 1.609 for per kilometre. A 5:00 /km pace is about 8:03 /mi.',
    ],
    faq: [
      { q: 'What is a good running pace?', a: 'It depends on age, experience and distance. Many recreational runners run easy miles at 9:00–12:00 per mile; competitive club runners may race 5Ks under 6:00 per mile.' },
      { q: 'How do I find the time needed for a target pace?', a: 'Multiply pace by distance. At 8:00 per mile, a 10K (6.21 miles) takes about 49:43.' },
    ],
  },
  related: ['race-time-predictor', 'heart-rate-zones', 'calories-burned', 'one-rep-max'],
  examples: [
    { values: { distance: 5000, hours: 0, minutes: 25, seconds: 0 }, expect: { pacePerKm: '5:00 /km', pacePerMile: '8:03 /mi', speed: 3.333333 }, tolerance: 1e-5 },
    { values: { distance: 42195, hours: 3, minutes: 30, seconds: 0 }, expect: { pacePerKm: '4:59 /km', pacePerMile: '8:01 /mi', totalTime: '3:30:00' } },
  ],
});
