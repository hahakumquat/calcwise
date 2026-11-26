import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

function band(map: number): { label: string; tone: 'good' | 'ok' | 'warn' | 'bad' } {
  if (map < 60) return { label: 'Low', tone: 'bad' };
  if (map < 70) return { label: 'Low-normal', tone: 'warn' };
  if (map <= 100) return { label: 'Normal', tone: 'good' };
  if (map <= 110) return { label: 'Elevated', tone: 'warn' };
  return { label: 'High', tone: 'bad' };
}

export default defineCalculator({
  slug: 'mean-arterial-pressure',
  title: 'Mean Arterial Pressure (MAP) Calculator',
  category: 'health',
  description: 'Turn a blood pressure reading into mean arterial pressure (MAP) and pulse pressure, with the normal 70 to 100 mmHg range.',
  keywords: ['MAP', 'mean arterial pressure', 'pulse pressure', 'blood pressure', 'systolic diastolic'],
  inputs: [
    { id: 'sbp', label: 'Systolic pressure', type: 'number', suffix: 'mmHg', default: 120, min: 40, max: 300, info: 'The top number of a blood pressure reading, taken as the heart beats. 120 in 120/80.' },
    { id: 'dbp', label: 'Diastolic pressure', type: 'number', suffix: 'mmHg', default: 80, min: 20, max: 200, info: 'The bottom number, taken between beats. 80 in 120/80. It must be lower than the systolic number.' },
  ],
  outputs: [
    { id: 'map', label: 'Mean arterial pressure', primary: true, suffix: 'mmHg', precision: 1, info: 'The average pressure in your arteries over one heartbeat, weighted toward diastole because the heart spends about two thirds of each cycle there. 70 to 100 mmHg is the usual normal range.' },
    { id: 'pulse', label: 'Pulse pressure', suffix: 'mmHg', precision: 0, info: 'Systolic minus diastolic. Around 40 mmHg is typical at rest.' },
    { id: 'category', label: 'MAP range', format: 'text', info: 'Where your MAP falls: under 60 low, 60 to 69 low-normal, 70 to 100 normal, 101 to 110 elevated, above 110 high.' },
  ],
  compute: (v) => {
    const s = num(v.sbp);
    const d = num(v.dbp);
    if (!s || !d || s <= 0 || d <= 0 || s <= d) return { map: null };
    const pp = s - d;
    const map = d + pp / 3;
    const b = band(map);
    return {
      map,
      pulse: pp,
      category: b.label,
      tone: b.tone,
      badge: `${map.toFixed(1)} mmHg`,
      chart: {
        type: 'scale',
        title: 'Mean arterial pressure (mmHg)',
        min: 40,
        max: 140,
        value: Math.min(140, Math.max(40, map)),
        valueLabel: map.toFixed(1),
        bands: [
          { from: 40, to: 60, label: 'Low', tone: 'bad' },
          { from: 60, to: 70, label: 'Low-normal', tone: 'warn' },
          { from: 70, to: 100, label: 'Normal', tone: 'good' },
          { from: 100, to: 110, label: 'Elevated', tone: 'warn' },
          { from: 110, to: 140, label: 'High', tone: 'bad' },
        ],
      },
      steps: [
        `Pulse pressure = ${s} − ${d} = ${pp}`,
        `MAP = ${d} + ${pp} ÷ 3 = ${map.toFixed(1)} mmHg`,
      ],
      note: 'For information only. This is not medical advice; talk to a clinician about your readings.',
    };
  },
  content: {
    formula: ['MAP = diastolic + (systolic − diastolic) ÷ 3', 'Pulse pressure = systolic − diastolic'],
    body: [
      'Mean arterial pressure, or MAP, is the average pressure pushing blood through your arteries during one heartbeat. It matters because it reflects how well blood reaches organs such as the brain and kidneys. Clinicians often look at it alongside the usual two-number blood pressure reading.',
      'The standard estimate treats the heart as spending about one third of each cycle in systole and two thirds in diastole, so MAP = diastolic + one third of the pulse pressure. For 120/80 mmHg that gives 80 + 40 ÷ 3 = 93.3 mmHg. A MAP of roughly 70 to 100 mmHg is usually considered normal, and many guidelines treat 65 mmHg or more as the minimum needed to perfuse organs.',
      'Pulse pressure is the gap between the two numbers. This is an estimate from a single reading, and a resting home cuff reading can differ from a clinic one. The result is for general information and is not medical advice or a diagnosis.',
    ],
    faq: [
      { q: 'What is the MAP for 120/80?', a: 'Pulse pressure is 40 mmHg, so MAP = 80 + 40 ÷ 3 = 93.3 mmHg, inside the usual 70 to 100 range.' },
      { q: 'What is a normal MAP?', a: 'About 70 to 100 mmHg. This calculator labels under 60 as low, 60 to 69 as low-normal, 101 to 110 as elevated and above 110 as high.' },
      { q: 'Why divide the pulse pressure by 3?', a: 'The heart spends roughly two thirds of the cycle in diastole, so the average pressure sits closer to the diastolic number than the systolic one. Adding one third of the pulse pressure to diastolic approximates that weighting.' },
      { q: 'Is this medical advice?', a: 'No. It is a standard textbook estimate from one reading. Ask a doctor or nurse what your numbers mean for you.' },
    ],
  },
  related: ['bmi', 'bmr', 'sweat-rate', 'water-intake'],
  examples: [
    // 120/80: PP = 40, MAP = 80 + 40/3 = 93.3333
    { values: { sbp: 120, dbp: 80 }, expect: { map: 93.333333, pulse: 40, category: 'Normal' }, tolerance: 1e-5 },
    // 140/90: PP = 50, MAP = 90 + 50/3 = 106.6667
    { values: { sbp: 140, dbp: 90 }, expect: { map: 106.666667, pulse: 50, category: 'Elevated' }, tolerance: 1e-5 },
    // 90/60: PP = 30, MAP = 60 + 10 = 70
    { values: { sbp: 90, dbp: 60 }, expect: { map: 70, pulse: 30, category: 'Normal' }, tolerance: 1e-9 },
    // 85/50: PP = 35, MAP = 50 + 35/3 = 61.6667
    { values: { sbp: 85, dbp: 50 }, expect: { map: 61.666667, pulse: 35, category: 'Low-normal' }, tolerance: 1e-5 },
  ],
});
