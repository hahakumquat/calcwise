import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmtDuration, hmsToSeconds } from '../../lib/helpers/health';

const MILE = 1609.344;
const LEN = ['km', 'mi', 'm'];
const RACES: [string, number][] = [
  ['5K', 5000],
  ['10K', 10000],
  ['Half', 21097.5],
  ['Marathon', 42195],
];

export default defineCalculator({
  slug: 'race-time-predictor',
  title: 'Race Time Predictor',
  category: 'sports',
  description: 'Predict your finish time for another race distance from a recent result, using Riegel’s formula.',
  keywords: ['Riegel formula', 'marathon time predictor', 'race predictor', 'half marathon prediction', 'equivalent race times'],
  inputs: [
    { id: 'knownDistance', label: 'Recent race distance', type: 'number', unit: 'length', units: LEN, defaultUnit: 'km', default: 10, info: 'The distance of a recent race or time trial you ran at full effort.' },
    { id: 'hours', label: 'Recent time — hours', type: 'number', suffix: 'h', default: 0, min: 0, step: 1, info: 'Whole hours of that result. Leave at 0 if it was under an hour.' },
    { id: 'minutes', label: 'Recent time — minutes', type: 'number', suffix: 'min', default: 55, min: 0, step: 1, info: 'Minutes of your recent finish time.' },
    { id: 'seconds', label: 'Recent time — seconds', type: 'number', suffix: 's', default: 0, min: 0, step: 1, info: 'Seconds of your recent finish time.' },
    { id: 'targetDistance', label: 'Target race distance', type: 'number', unit: 'length', units: LEN, defaultUnit: 'km', default: 21.0975, help: 'Half marathon = 21.0975 km, marathon = 42.195 km.', info: 'The race you want a prediction for. A half marathon is 13.1 mi; a marathon is 26.2 mi.' },
    { id: 'exponent', label: 'Fatigue exponent', type: 'number', default: 1.06, min: 1, max: 1.2, step: 0.01, help: '1.06 is Riegel’s standard value; use 1.07–1.08 if you fade over long distances.', info: 'How much you slow down as distance grows. 1.06 is the standard; higher values give more conservative predictions for longer races.' },
  ],
  outputs: [
    { id: 'predicted', label: 'Predicted finish time', primary: true, format: 'text', info: 'Your equivalent time at the target distance, assuming similar training and conditions.' },
    { id: 'pacePerMile', label: 'Pace per mile', format: 'text', info: 'Average pace per mile needed to hit the predicted time.' },
    { id: 'pacePerKm', label: 'Pace per kilometre', format: 'text', info: 'Average pace per kilometre needed to hit the predicted time.' },
    { id: 'predictedSeconds', label: 'Predicted time in seconds', format: 'integer', suffix: 's', info: 'The predicted time as a total number of seconds, handy for spreadsheets.' },
  ],
  compute: (v) => {
    const d1 = num(v.knownDistance);
    const d2 = num(v.targetDistance);
    const t1 = hmsToSeconds(v.hours, v.minutes, v.seconds);
    const k = num(v.exponent) ?? 1.06;
    if (!d1 || !d2 || !t1 || d1 <= 0 || d2 <= 0 || t1 <= 0 || k <= 0) return { predicted: null };
    const predict = (d: number) => t1 * (d / d1) ** k;
    const t2 = predict(d2);
    const ratio = d2 / d1;
    const isStd = RACES.some(([, m]) => Math.abs(m - d2) < 1);
    const rows = isStd ? RACES : [...RACES, ['Your target', d2] as [string, number]].sort((a, b) => a[1] - b[1]);
    return {
      predicted: fmtDuration(t2),
      pacePerMile: `${fmtDuration(t2 / (d2 / MILE))} /mi`,
      pacePerKm: `${fmtDuration(t2 / (d2 / 1000))} /km`,
      predictedSeconds: Math.round(t2),
      chart: {
        type: 'bar',
        title: 'Predicted times across distances',
        categories: rows.map(([n]) => n),
        series: [{ name: 'Predicted time', values: rows.map(([, m]) => predict(m) / 60) }],
        format: { suffix: 'min' },
        highlight: rows.findIndex(([, m]) => Math.abs(m - d2) < 1),
      },
      steps: [`T₂ = ${fmtDuration(t1)} × (${(d2 / 1000).toFixed(3)} ÷ ${(d1 / 1000).toFixed(3)})^${k}`, `= ${Math.round(t1)} s × ${(ratio ** k).toFixed(4)} = ${Math.round(t2)} s = ${fmtDuration(t2)}`],
      note:
        ratio > 4
          ? 'Predicting much longer races assumes you have done the endurance training for them; many runners finish slower than this in their first marathon.'
          : undefined,
    };
  },
  content: {
    formula: ['T₂ = T₁ × (D₂ ÷ D₁)^1.06', 'T₁ = known time, D₁ = known distance, D₂ = target distance'],
    body: [
      'In 1977 engineer and marathoner Pete Riegel noticed that, for distances from about 1.5 km to the marathon, finish time grows a little faster than distance. Doubling the distance more than doubles the time, because you have to run slower to last longer. He captured that relationship with a single exponent of about 1.06.',
      'Enter a recent, all-out race result and a target distance to see an equivalent performance. Predictions are most reliable between similar distances — say 10K to half marathon — and when you have trained specifically for the target race. Going from a 5K to a marathon is a big extrapolation.',
      'If you know you tend to slow down more than average over long distances, raise the exponent to 1.07 or 1.08 for a more conservative prediction. Heat, hills and race-day conditions can move real results by several minutes either way.',
    ],
    faq: [
      { q: 'Why is my marathon slower than predicted?', a: 'Riegel’s formula assumes equal endurance preparation for both races. Without enough long runs and marathon-specific training, most people slow down in the last 10 km and finish well behind the prediction.' },
      { q: 'Can I predict a shorter race from a longer one?', a: 'Yes. The formula works both ways, so a half-marathon result can estimate your 5K or 10K potential.' },
    ],
  },
  related: ['pace', 'heart-rate-zones', 'calories-burned', 'one-rep-max'],
  examples: [
    { values: { knownDistance: 10000, hours: 0, minutes: 50, seconds: 0, targetDistance: 20000, exponent: 1.06 }, expect: { predictedSeconds: 6255, predicted: '1:44:15' } },
    { values: { knownDistance: 5000, hours: 0, minutes: 25, seconds: 0, targetDistance: 10000, exponent: 1 }, expect: { predicted: '50:00', pacePerKm: '5:00 /km' } },
  ],
});
