import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

// Rough, age- and sex-agnostic bands (ml/kg/min). Real norms depend on age and sex.
function band(v: number): { label: string; tone: 'good' | 'ok' | 'warn' | 'bad' } {
  if (v < 30) return { label: 'Low', tone: 'warn' };
  if (v < 40) return { label: 'Fair', tone: 'ok' };
  if (v < 50) return { label: 'Good', tone: 'good' };
  return { label: 'High', tone: 'good' };
}

const UTH = { input: 'method', is: 'uth' };
const COOPER = { input: 'method', is: 'cooper' };

export default defineCalculator({
  slug: 'vo2max-estimate',
  title: 'VO2 Max Estimate Calculator',
  category: 'health',
  description: 'Estimate your VO2 max from your resting and max heart rate (Uth-Sørensen) or from how far you run in 12 minutes (Cooper test).',
  keywords: ['VO2 max', 'VO2max estimate', 'Cooper test', '12 minute run', 'Uth Sorensen', 'cardio fitness', 'aerobic capacity'],
  inputs: [
    {
      id: 'method',
      label: 'Method',
      type: 'select',
      default: 'uth',
      segmented: true,
      options: [
        { value: 'uth', label: 'Heart rate' },
        { value: 'cooper', label: '12-minute run' },
      ],
      info: 'Heart rate uses your resting and maximum pulse (Uth-Sørensen). The 12-minute run uses the distance you cover in an all-out 12-minute effort (Cooper).',
    },
    { id: 'hrMax', label: 'Max heart rate', type: 'number', suffix: 'bpm', default: 190, min: 120, max: 230, showWhen: UTH, help: 'Use a measured maximum, not an age formula, if you can.', info: 'The highest pulse you have seen at the end of an all-out effort, for example from a chest strap. This calculator takes it as an input rather than guessing it from your age.' },
    { id: 'hrRest', label: 'Resting heart rate', type: 'number', suffix: 'bpm', default: 60, min: 30, max: 120, showWhen: UTH, info: 'Your pulse right after waking, before getting up. Take it for a full minute on a few mornings and average them.' },
    { id: 'distance', label: 'Distance covered in 12 minutes', type: 'number', unit: 'length', units: ['km', 'mi', 'm'], defaultUnit: 'km', default: 2.4, showWhen: COOPER, help: 'Run as far as you can in exactly 12 minutes, ideally on a track.', info: 'Total distance after an all-out 12-minute run. Pick km, miles or metres; it is converted to metres (1 mile = 1609.344 m) for the formula.' },
  ],
  outputs: [
    { id: 'vo2', label: 'Estimated VO2 max', primary: true, precision: 1, suffix: 'ml/kg/min', info: 'Millilitres of oxygen your body can use per kilogram of body weight per minute, at hard effort. An estimate, not a lab measurement.' },
    { id: 'fitness', label: 'Rough fitness band', format: 'text', info: 'A broad band only: under 30 low, 30-39 fair, 40-49 good, 50+ high. Real norms depend on age and sex.' },
    { id: 'method_used', label: 'Formula used', format: 'text', info: 'The published formula behind the number.' },
  ],
  compute: (v) => {
    let vo2: number;
    let steps: string[];
    let methodUsed: string;
    if (v.method === 'cooper') {
      const d = num(v.distance); // metres
      if (!d || d <= 0) return { vo2: null };
      vo2 = (d - 504.9) / 44.73;
      steps = [`VO2 max = (distance in m - 504.9) / 44.73 = (${d.toFixed(1)} - 504.9) / 44.73 = ${vo2.toFixed(2)}`];
      methodUsed = 'Cooper 12-minute run';
    } else {
      const hi = num(v.hrMax);
      const lo = num(v.hrRest);
      if (!hi || !lo || hi <= 0 || lo <= 0) return { vo2: null };
      if (hi <= lo) return { vo2: null, error: 'Max heart rate must be higher than resting heart rate.' };
      vo2 = 15.3 * (hi / lo);
      steps = [`VO2 max = 15.3 x (max HR / resting HR) = 15.3 x (${hi} / ${lo}) = ${vo2.toFixed(2)}`];
      methodUsed = 'Uth-Sørensen (15.3 x HRmax / HRrest)';
    }
    if (vo2 <= 0) return { vo2: null, error: 'That distance is too short for the Cooper formula (it needs more than 504.9 m).' };
    const b = band(vo2);
    return {
      vo2,
      fitness: b.label,
      method_used: methodUsed,
      tone: b.tone,
      badge: b.label,
      steps,
      note: 'An estimate, not a lab test and not medical advice. Bands are rough and ignore age and sex.',
      chart: {
        type: 'scale',
        title: 'Where your estimate falls (ml/kg/min)',
        min: 10,
        max: 80,
        value: Math.min(80, Math.max(10, vo2)),
        valueLabel: vo2.toFixed(1),
        bands: [
          { from: 10, to: 30, label: 'Low', tone: 'warn' },
          { from: 30, to: 40, label: 'Fair', tone: 'ok' },
          { from: 40, to: 50, label: 'Good', tone: 'good' },
          { from: 50, to: 80, label: 'High', tone: 'good' },
        ],
      },
    };
  },
  content: {
    formula: [
      'Uth-Sørensen: VO2 max = 15.3 x (max heart rate / resting heart rate)',
      'Cooper 12-minute run: VO2 max = (distance in metres - 504.9) / 44.73',
    ],
    body: [
      'VO2 max is the most oxygen your body can use during hard exercise, in millilitres per kilogram of body weight per minute. It is a common yardstick for aerobic fitness. A lab measures it with a mask on a treadmill; this calculator estimates it from two simple field methods instead.',
      'The heart rate method (Uth and colleagues, 2004) multiplies 15.3 by the ratio of your maximum to your resting heart rate. A lower resting pulse relative to your max gives a higher estimate. The 12-minute run (Cooper, 1968) converts the distance you cover in an all-out 12 minutes into VO2 max.',
      'Both are population-level formulas, so individual results can be off by several points. Use the number to track your own trend, measured the same way each time, rather than as a verdict. Anything that worries you about your health is a question for a doctor.',
    ],
    sections: [
      {
        heading: 'How to do the 12-minute run test',
        paragraphs: [
          'Warm up, then run or run-walk as far as you can in exactly 12 minutes on a flat track or a measured route. Enter the total distance. Only do this if you are healthy enough for hard exercise; skip it if you have any heart or medical concern.',
          'For example, 2400 m (about 1.49 miles) gives (2400 - 504.9) / 44.73 = 42.4 ml/kg/min. The formula needs more than 504.9 m to give a positive result.',
        ],
      },
    ],
    faq: [
      { q: 'Is this the same as a lab VO2 max test?', a: 'No. It is an estimate from a published formula. Lab tests measure oxygen use directly and are more accurate; field estimates can be off by several ml/kg/min.' },
      { q: 'What does 190 max and 60 resting heart rate give?', a: '15.3 x (190 / 60) = 48.45, shown as 48.5 ml/kg/min, which falls in the "Good" band.' },
      { q: 'What does running 2400 m in 12 minutes mean?', a: '(2400 - 504.9) / 44.73 = 42.4 ml/kg/min, which falls in the "Good" band.' },
      { q: 'Why does the heart rate method ask for max heart rate?', a: 'The formula uses the ratio of max to resting pulse. Enter a measured max if you have one; age formulas such as 208 - 0.7 x age can be off by 10 bpm or more, which shifts the result noticeably.' },
      { q: 'Why are the fitness bands so broad?', a: 'True VO2 max norms depend on age and sex, and the same number means different things at 25 and 65. The bands here (under 30, 30-39, 40-49, 50+) are only a rough guide.' },
    ],
    sources: [
      { label: 'Uth N, Sørensen H, Overgaard K, Pedersen PK. Estimation of VO2max from the ratio between HRmax and HRrest. Eur J Appl Physiol 2004', url: 'https://pubmed.ncbi.nlm.nih.gov/14624296/' },
      { label: 'Cooper KH. A means of assessing maximal oxygen intake. JAMA 1968;203(3):201-204', url: 'https://pubmed.ncbi.nlm.nih.gov/5694044/' },
    ],
  },
  related: ['heart-rate-zones', 'pace', 'race-time-predictor', 'bmr'],
  examples: [
    // Uth: 190 / 60 = 3.166667; x 15.3 = 48.45 (recomputed: 15.3 x 190 = 2907; 2907 / 60 = 48.45)
    { values: { method: 'uth', hrMax: 190, hrRest: 60 }, expect: { vo2: 48.45, fitness: 'Good' }, tolerance: 0.001 },
    // Uth: 180 / 50 = 3.6; x 15.3 = 55.08
    { values: { method: 'uth', hrMax: 180, hrRest: 50 }, expect: { vo2: 55.08, fitness: 'High' }, tolerance: 0.001 },
    // Cooper: 2400 - 504.9 = 1895.1; / 44.73 = 42.3675 (44.73 x 42.3675 = 1895.1)
    { values: { method: 'cooper', distance: 2400 }, expect: { vo2: 42.3675, fitness: 'Good' }, tolerance: 0.001 },
    // Cooper: 1600 - 504.9 = 1095.1; / 44.73 = 24.4824 (44.73 x 24.4824 = 1095.1)
    { values: { method: 'cooper', distance: 1600 }, expect: { vo2: 24.4824, fitness: 'Low' }, tolerance: 0.001 },
  ],
});
