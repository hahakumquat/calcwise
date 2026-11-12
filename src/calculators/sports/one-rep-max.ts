import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const LB = 0.45359237;
const MASS = { unit: 'mass' as const, units: ['kg', 'lb'], defaultUnit: 'lb', precision: 1 };

// Training percentages of 1RM shown in the table and chart.
const TABLE = [100, 95, 90, 85, 80, 75, 70, 65, 60];
const repsAt = (p: number) => (p === 100 ? 1 : Math.max(1, Math.round(30 * (100 / p - 1))));

export default defineCalculator({
  slug: 'one-rep-max',
  title: 'One-Rep Max Calculator',
  category: 'sports',
  description: 'Estimate your one-rep max (1RM) from a set of several reps with the Epley and Brzycki formulas, plus a training-load table.',
  keywords: ['1RM', '1 rep max', 'max lift', 'bench press max', 'squat max', 'Epley', 'Brzycki', 'strength training'],
  inputs: [
    { id: 'weight', label: 'Weight lifted', type: 'number', unit: 'mass', units: ['kg', 'lb'], defaultUnit: 'lb', default: 185, info: 'The total load you lifted for the set, including the bar (a standard Olympic bar is 45 lb / 20 kg).' },
    { id: 'reps', label: 'Reps completed', type: 'number', default: 5, min: 1, max: 20, step: 1, help: 'Most accurate with 2–10 reps taken close to failure.', info: 'Clean reps completed with good form. The estimate is most reliable when the set was close to failure and between 2 and 10 reps.' },
  ],
  outputs: [
    { id: 'epley', label: 'Estimated 1RM (Epley)', primary: true, ...MASS, info: 'Epley formula: weight × (1 + reps ÷ 30). The most widely used 1RM estimate.' },
    { id: 'brzycki', label: 'Brzycki', ...MASS, info: 'Brzycki formula: weight × 36 ÷ (37 − reps). Slightly more conservative for low-rep sets.' },
    { id: 'average', label: 'Average of both', ...MASS, info: 'The mean of the Epley and Brzycki estimates.' },
    { id: 'table', label: 'Training loads (based on Epley 1RM)', format: 'code', info: 'Weights at common percentages of your estimated max, with the approximate number of reps you could do at each.' },
  ],
  compute: (v) => {
    const w = num(v.weight);
    const r = num(v.reps);
    if (!w || w <= 0 || r === null || r < 1 || r > 30 || !Number.isInteger(r)) return { epley: null };
    const epley = r === 1 ? w : w * (1 + r / 30);
    const brzycki = r === 1 ? w : (w * 36) / (37 - r);
    const rows = TABLE.map((p) => {
      const load = (epley * p) / 100;
      const reps = repsAt(p);
      return `${String(p).padStart(3)}%  ${load.toFixed(1).padStart(6)} kg  ${(load / LB).toFixed(1).padStart(6)} lb  ≈ ${reps} rep${reps === 1 ? '' : 's'}`;
    });
    return {
      epley,
      brzycki,
      average: (epley + brzycki) / 2,
      table: rows.join('\n'),
      chart: {
        type: 'bar',
        title: 'Training loads by % of 1RM',
        categories: TABLE.map((p) => `${p}% (≈${repsAt(p)})`),
        series: [{ name: 'Load', values: TABLE.map((p) => (epley * p) / 100) }],
        format: { unit: 'mass' },
        highlight: 0,
      },
      steps: [`Epley: ${w.toFixed(1)} kg × (1 + ${r} ÷ 30) = ${epley.toFixed(1)} kg`, `Brzycki: ${w.toFixed(1)} kg × 36 ÷ (37 − ${r}) = ${brzycki.toFixed(1)} kg`],
      note: r > 10 ? 'Estimates get less reliable above 10 reps.' : undefined,
    };
  },
  content: {
    formula: ['Epley: 1RM = w × (1 + reps ÷ 30)', 'Brzycki: 1RM = w × 36 ÷ (37 − reps)'],
    body: [
      'Your one-rep max is the heaviest weight you can lift once with good form. Testing it directly is tiring and carries some injury risk, so most lifters estimate it from a heavier set of several reps instead. Many strength programs then prescribe training weights as a percentage of that number.',
      'The Epley and Brzycki equations are the two most widely used estimators. They agree closely at around 10 reps and differ slightly below that, with Brzycki giving a more conservative figure at low rep counts. Both are most accurate when the set is taken close to failure with 2–10 reps.',
      'The table shows roughly how many reps you could expect at each percentage of your estimated max — useful for picking working weights. Individuals vary: people with more slow-twitch muscle often manage more reps at a given percentage. Always lift with a spotter or safety bars when working near your limit.',
    ],
    faq: [
      { q: 'Which formula should I use?', a: 'Either is fine for programming. Epley is the default here; Brzycki is a little more conservative for low-rep sets. Track the same formula over time so changes reflect real progress.' },
      { q: 'Does this work for every lift?', a: 'It works best for compound barbell lifts like squat, bench press and deadlift. For small isolation exercises and machines the rep-to-max relationship is less consistent.' },
    ],
  },
  related: ['protein', 'calories-burned', 'heart-rate-zones', 'pace'],
  examples: [
    { values: { weight: 100, reps: 5 }, expect: { epley: 116.6667, brzycki: 112.5, average: 114.5833 }, tolerance: 1e-5 },
    { values: { weight: 100, reps: 10 }, expect: { epley: 133.3333, brzycki: 133.3333 }, tolerance: 1e-5 },
    { values: { weight: 80, reps: 1 }, expect: { epley: 80, brzycki: 80 } },
  ],
});
