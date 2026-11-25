import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmtDuration } from '../../lib/helpers/health';

const fmt = (n: number, d = 1) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });
const PACES = [90, 105, 120, 135, 150];

export default defineCalculator({
  slug: 'swim-pace-per-100',
  title: 'Swim Pace per 100 m or Yard Calculator',
  category: 'sports',
  description: 'Find your swim pace per 100 metres or yards and your time per pool length from the distance you swam and your total time. Works for 25 m, 25 yd and 50 m pools.',
  keywords: ['swim pace calculator', 'swim pace per 100m', 'swim pace per 100 yards', 'time per length swimming', 'lap swim pace', 'swim split calculator'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'unit', label: 'Distance unit', type: 'select', default: 'm', options: [{ value: 'm', label: 'Metres' }, { value: 'yd', label: 'Yards' }], info: 'Pick metres for 25 m and 50 m pools, yards for 25-yard pools.' },
    { id: 'distance', label: 'Distance swum', type: 'number', default: 1500, min: 1, step: 25, info: 'Total distance you swam, in the unit chosen above.' },
    { id: 'pool', label: 'Pool length', type: 'number', default: 50, min: 1, step: 1, info: 'Length of one pool length, in the same unit. Common sizes are 25 and 50.' },
    { id: 'minutes', label: 'Time — minutes', type: 'number', suffix: 'min', default: 28, min: 0, step: 1, info: 'Minutes of your total swim time, not counting long rests you want left out.' },
    { id: 'seconds', label: 'Time — seconds', type: 'number', suffix: 's', default: 30, min: 0, step: 1, info: 'Seconds of your total swim time.' },
  ],
  outputs: [
    { id: 'pace', label: 'Pace per 100', format: 'text', primary: true, info: 'Average time to swim 100 of your chosen unit.' },
    { id: 'perLength', label: 'Time per length', format: 'text', info: 'Average time for one pool length.' },
    { id: 'lengths', label: 'Pool lengths', format: 'number', precision: 1, info: 'Distance divided by pool length.' },
  ],
  compute: (v) => {
    const d = num(v.distance);
    const pool = num(v.pool);
    const m = num(v.minutes) ?? 0;
    const s = num(v.seconds) ?? 0;
    const t = m * 60 + s;
    const unit = v.unit === 'yd' ? 'yd' : 'm';
    if (d === null || d <= 0) return { pace: null, error: 'Enter the distance you swam.' };
    if (pool === null || pool <= 0) return { pace: null, error: 'Enter the pool length.' };
    if (m < 0 || s < 0 || t <= 0) return { pace: null, error: 'Enter your swim time.' };
    const per100 = t / (d / 100);
    const lengths = d / pool;
    const perLength = t / lengths;
    return {
      pace: `${fmtDuration(per100)} /100${unit}`,
      perLength: `${fmtDuration(perLength)} /length`,
      lengths,
      tone: 'ok',
      badge: `${fmtDuration(per100)} /100${unit}`,
      note: `${fmt(d, 0)} ${unit} in ${fmtDuration(t)} is ${fmtDuration(per100)} per 100 ${unit}. Rest time is included if you left it in the total.`,
      chart: {
        type: 'bar' as const,
        title: `Time for ${fmt(d, 0)} ${unit} at other paces`,
        categories: PACES.map((p) => `${fmtDuration(p)}/100`),
        series: [{ name: 'Total time', values: PACES.map((p) => (p * (d / 100)) / 60) }],
        format: { suffix: 'min', precision: 1 },
      },
      steps: [
        `Time = ${m} min × 60 + ${s} s = ${fmt(t, 0)} s`,
        `Pace per 100 = ${fmt(t, 0)} ÷ (${fmt(d, 0)} ÷ 100) = ${fmt(per100, 1)} s = ${fmtDuration(per100)}`,
        `Lengths = ${fmt(d, 0)} ÷ ${fmt(pool, 0)} = ${fmt(lengths, 1)}; time per length = ${fmt(t, 0)} ÷ ${fmt(lengths, 1)} = ${fmt(perLength, 1)} s`,
      ],
    };
  },
  content: {
    formula: ['Pace per 100 = total time ÷ (distance ÷ 100)', 'Time per length = total time ÷ (distance ÷ pool length)'],
    body: [
      'Swim pace is quoted per 100 metres or per 100 yards, not per kilometre like running. Divide your total time by the number of hundreds you swam and you have your pace. Dividing by the number of pool lengths gives the time per length, which is handy for pacing lap by lap.',
      'Example: 1,500 m in 28:30 is 1,710 seconds. That is 15 hundreds, so 1,710 ÷ 15 = 114 seconds, or 1:54 per 100 m. In a 50 m pool that is 30 lengths at 57 seconds each. In a 25-yard pool, 1,000 yd in 20:00 is 1,200 ÷ 10 = 120 seconds, or 2:00 per 100 yd, at 30 seconds per length.',
      'Metres and yards are not the same: 100 yd is about 91.4 m, so a pace per 100 yd looks faster than the same effort per 100 m. Compare like with like. If you include rests in your total time, the pace reflects them too. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How do I calculate swim pace per 100 m?', a: 'Divide your total time in seconds by the distance in hundreds of metres. 1,710 seconds for 1,500 m is 1,710 ÷ 15 = 114 s, or 1:54 per 100 m.' },
      { q: 'How do I find my time per length?', a: 'Divide total time by the number of lengths, which is distance ÷ pool length. 1,710 s over 30 lengths of a 50 m pool is 57 s each.' },
      { q: 'Is a pace per 100 yards comparable to per 100 metres?', a: 'Not directly. 100 yards is about 91.44 m, so the same effort gives a lower number per 100 yd. Use the same unit when comparing swims.' },
      { q: 'Should I include rest time?', a: 'It is your choice. Include rests for an overall pace, or enter only your swimming time for a moving pace. The calculator uses the time you type.' },
      { q: 'What if my distance is not a whole number of lengths?', a: 'The lengths figure shows a decimal, such as 33.3, and the time per length still works as an average.' },
    ],
    sources: [
      { label: 'Wikipedia: Swimming (sport)', url: 'https://en.wikipedia.org/wiki/Swimming_(sport)' },
    ],
  },
  related: ['pace', 'race-time-predictor', 'heart-rate-zones'],
  examples: [
    // 1710 s / 15 = 114 s = 1:54; 1500/50 = 30 lengths; 1710/30 = 57 s
    { values: { unit: 'm', distance: 1500, pool: 50, minutes: 28, seconds: 30 }, expect: { pace: '1:54 /100m', perLength: '0:57 /length', lengths: 30 }, tolerance: 1e-5 },
    // 1200 s / 10 = 120 s = 2:00; 1000/25 = 40 lengths; 1200/40 = 30 s
    { values: { unit: 'yd', distance: 1000, pool: 25, minutes: 20, seconds: 0 }, expect: { pace: '2:00 /100yd', perLength: '0:30 /length', lengths: 40 }, tolerance: 1e-5 },
  ],
});
