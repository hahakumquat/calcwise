import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmtDuration } from '../../lib/helpers/health';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
// m:ss.t, rounded to the nearest tenth of a second (rowing splits are quoted in tenths)
const fmtSplit = (sec: number) => {
  const tenths = Math.round(sec * 10);
  const m = Math.floor(tenths / 600);
  const s = (tenths % 600) / 10;
  return `${m}:${s.toFixed(1).padStart(4, '0')}`;
};
const OFFSETS = [-10, -5, 0, 5, 10];

export default defineCalculator({
  slug: 'rowing-split',
  title: 'Rowing Split per 500 m Calculator',
  category: 'sports',
  description: 'Find your rowing split per 500 m from distance and finish time, plus speed in m/s and the finish time you need to hit a target split on the erg.',
  keywords: ['rowing split calculator', 'split per 500m', 'erg split calculator', 'rowing pace calculator', 'concept2 split', '2000m erg time', 'rowing target time'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'distance', label: 'Distance', type: 'number', suffix: 'm', default: 2000, min: 1, step: 100, info: 'Distance rowed in metres. A standard erg test is 2,000 m.' },
    { id: 'minutes', label: 'Finish time — minutes', type: 'number', suffix: 'min', default: 8, min: 0, step: 1, info: 'Minutes of your finish time.' },
    { id: 'seconds', label: 'Finish time — seconds', type: 'number', suffix: 's', default: 0, min: 0, step: 0.1, info: 'Seconds of your finish time.' },
    { id: 'target', label: 'Target split', type: 'number', suffix: 's/500 m', default: 120, min: 1, step: 1, info: 'The split per 500 m you want to hold, in seconds. 120 s is 2:00.' },
  ],
  outputs: [
    { id: 'split', label: 'Split per 500 m', format: 'text', primary: true, info: 'Average time to row 500 m.' },
    { id: 'pace', label: 'Pace', format: 'number', precision: 1, suffix: 's / 500 m', info: 'Split per 500 m in seconds.' },
    { id: 'speed', label: 'Speed', format: 'number', precision: 2, suffix: 'm/s', info: 'Distance divided by time.' },
    { id: 'targetTime', label: 'Finish time at target split', format: 'text', info: 'Time to cover your distance at the target split.' },
  ],
  compute: (v) => {
    const d = num(v.distance);
    const m = num(v.minutes) ?? 0;
    const s = num(v.seconds) ?? 0;
    const tg = num(v.target);
    const t = m * 60 + s;
    if (d === null || d <= 0) return { split: null, error: 'Enter the distance you rowed.' };
    if (m < 0 || s < 0 || t <= 0) return { split: null, error: 'Enter your finish time.' };
    if (tg === null || tg <= 0) return { split: null, error: 'Enter a target split in seconds per 500 m.' };
    const blocks = d / 500;
    const pace = t / blocks;
    const speed = d / t;
    const targetT = tg * blocks;
    const diff = targetT - t;
    const vs = Math.abs(diff) < 0.05 ? 'the same as your time' : `${fmt(Math.abs(diff), 1)} s ${diff < 0 ? 'faster' : 'slower'} than your time`;
    return {
      split: `${fmtSplit(pace)} /500m`,
      pace,
      speed,
      targetTime: fmtDuration(targetT),
      tone: 'ok',
      badge: `${fmtSplit(pace)} /500m`,
      note: `${fmt(d, 0)} m in ${fmtDuration(t)} is a split of ${fmtSplit(pace)} per 500 m. Holding ${fmtSplit(tg)} gives ${fmtDuration(targetT)}, which is ${vs}.`,
      chart: {
        type: 'bar' as const,
        title: `Finish time for ${fmt(d, 0)} m at splits around your target`,
        categories: OFFSETS.map((o) => fmtSplit(Math.max(1, tg + o))),
        series: [{ name: 'Finish time', values: OFFSETS.map((o) => (Math.max(1, tg + o) * blocks) / 60) }],
        format: { suffix: 'min', precision: 2 },
      },
      steps: [
        `Finish time = ${m} min × 60 + ${s} s = ${fmt(t, 1)} s`,
        `Split per 500 m = ${fmt(t, 1)} ÷ (${fmt(d, 0)} ÷ 500) = ${fmt(pace, 1)} s = ${fmtSplit(pace)}`,
        `Speed = ${fmt(d, 0)} ÷ ${fmt(t, 1)} = ${fmt(speed, 2)} m/s`,
        `Time at target = ${fmt(tg, 1)} × (${fmt(d, 0)} ÷ 500) = ${fmt(targetT, 1)} s = ${fmtDuration(targetT)}`,
      ],
    };
  },
  content: {
    formula: ['Split per 500 m = finish time (s) ÷ (distance ÷ 500)', 'Finish time = target split × (distance ÷ 500)', 'Speed = distance ÷ finish time'],
    body: [
      'Rowing machines and boat monitors show your pace as a split: the time it would take to cover 500 metres at your current speed. A lower split is faster. To find the split for a whole piece, divide your finish time in seconds by the number of 500 m blocks you covered.',
      'Example: 2,000 m in 8:00 is 480 seconds across 4 blocks, so 480 ÷ 4 = 120 seconds, or 2:00 per 500 m. That is 2,000 ÷ 480, about 4.17 m/s. Another: 5,000 m in 21:40 is 1,300 s over 10 blocks, a 2:10 split.',
      'To plan a target, go the other way. A 2:05 split (125 s) over 6,000 m means 12 blocks, so 125 × 12 = 1,500 s, or 25:00. The chart shows how a few seconds either side of your target split changes the finish time. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I calculate my split per 500 m?', a: 'Divide your finish time in seconds by distance ÷ 500. For 2,000 m in 8:00, that is 480 ÷ 4 = 120 s, a 2:00.0 split.' },
      { q: 'What split do I need for a 2,000 m in 8:00?', a: 'A 2:00 split per 500 m. Four blocks of 120 seconds is 480 seconds, or 8:00.' },
      { q: 'What is my speed in m/s at a 2:00 split?', a: 'Distance over time: 2,000 ÷ 480 is about 4.17 m/s. Speed in m/s is 500 divided by your split in seconds.' },
      { q: 'How much time does one second off my split save?', a: 'It saves one second per 500 m. Over 2,000 m that is 4 seconds, and over 6,000 m it is 12 seconds.' },
      { q: 'Can I use this for distances that are not multiples of 500?', a: 'Yes. The distance is divided by 500, so 1,750 m counts as 3.5 blocks and the split is still an average per 500 m.' },
    ],
    sources: [
      { label: 'Wikipedia: Rowing machine', url: 'https://en.wikipedia.org/wiki/Rowing_machine' },
    ],
  },
  related: ['pace', 'swim-pace-per-100', 'race-time-predictor'],
  examples: [
    // 480 s / (2000/500 = 4) = 120 s = 2:00.0; 2000/480 = 4.16667 m/s; target 120 x 4 = 480 s = 8:00
    { values: { distance: 2000, minutes: 8, seconds: 0, target: 120 }, expect: { split: '2:00.0 /500m', pace: 120, speed: 2000 / 480, targetTime: '8:00' }, tolerance: 1e-5 },
    // 1300 s / 10 = 130 s = 2:10.0; 5000/1300 = 3.84615 m/s; target 125 x 10 = 1250 s = 20:50
    { values: { distance: 5000, minutes: 21, seconds: 40, target: 125 }, expect: { split: '2:10.0 /500m', pace: 130, speed: 5000 / 1300, targetTime: '20:50' }, tolerance: 1e-5 },
    // 1500 s / 12 = 125 s = 2:05.0; target 125 x 12 = 1500 s = 25:00
    { values: { distance: 6000, minutes: 25, seconds: 0, target: 125 }, expect: { split: '2:05.0 /500m', pace: 125, speed: 4, targetTime: '25:00' }, tolerance: 1e-5 },
  ],
});
