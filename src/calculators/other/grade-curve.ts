import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { nums } from '../../lib/helpers/math-extra';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'grade-curve',
  title: 'Grade Curve Calculator',
  category: 'other',
  description: 'Curve a set of test scores three ways: add flat points, scale the top score to the maximum, or use the square root curve. See before and after.',
  keywords: ['grade curve calculator', 'curve grades', 'test score curve', 'square root curve', 'add points to scores', 'scale top score to 100'],
  updated: '2026-11-20',
  inputs: [
    { id: 'scores', label: 'Scores', type: 'list', default: '62, 75, 88', placeholder: 'Scores separated by commas, spaces or new lines', info: 'Up to 30 raw scores, each from 0 to the maximum.' },
    { id: 'max', label: 'Maximum points', type: 'number', default: 100, min: 1, step: 1, info: 'The total points the test was marked out of.' },
    {
      id: 'method', label: 'Curve method', type: 'select', default: 'flat',
      options: [{ value: 'flat', label: 'Add flat points' }, { value: 'scale', label: 'Scale top score to max' }, { value: 'sqrt', label: 'Square root' }],
      info: 'Flat adds the same points to everyone. Scale multiplies every score so the best one reaches the maximum. Square root gives max × √(score ÷ max). Teachers choose methods differently, so this shows common ones, not a rule.',
    },
    { id: 'points', label: 'Points to add (flat method)', type: 'number', default: 5, min: 0, step: 1, info: 'Only used by the flat method. Curved scores are capped at the maximum.' },
  ],
  outputs: [
    { id: 'avgAfter', label: 'Average after the curve', format: 'number', precision: 2, primary: true, info: 'Mean of the curved scores.' },
    { id: 'avgBefore', label: 'Average before', format: 'number', precision: 2, info: 'Mean of the raw scores.' },
    { id: 'gain', label: 'Average gain', format: 'number', precision: 2, info: 'Average after minus average before, in points.' },
    { id: 'curved', label: 'Curved scores', format: 'text', info: 'Each score after the curve, in the order you entered them, rounded to 2 decimals.' },
  ],
  compute: (v) => {
    const max = num(v.max);
    const k = num(v.points) ?? 0;
    const raw = nums(v.scores);
    if (max === null || max <= 0 || raw.length === 0) return { avgAfter: null };
    if (raw.length > 30) return { avgAfter: null, error: 'Enter at most 30 scores.' };
    if (raw.some((s) => s < 0 || s > max)) return { avgAfter: null, error: `Every score must be between 0 and ${fmt(max)}.` };
    if (v.method === 'flat' && k < 0) return { avgAfter: null };
    const top = Math.max(...raw);
    if (v.method === 'scale' && top <= 0) return { avgAfter: null, error: 'The top score must be above 0 to scale it.' };
    const curve = (s: number) => {
      if (v.method === 'scale') return Math.min(max, (s * max) / top);
      if (v.method === 'sqrt') return max * Math.sqrt(s / max);
      return Math.min(max, s + k);
    };
    const after = raw.map(curve);
    const mean = (a: number[]) => a.reduce((x, y) => x + y, 0) / a.length;
    const before = mean(raw);
    const avg = mean(after);
    const method = v.method === 'scale' ? `scale (each score × ${fmt(max)} ÷ ${fmt(top, 2)})` : v.method === 'sqrt' ? `square root (${fmt(max)} × √(score ÷ ${fmt(max)}))` : `flat (+${fmt(k, 2)} points, capped at ${fmt(max)})`;
    return {
      avgAfter: avg,
      avgBefore: before,
      gain: avg - before,
      curved: after.map((x) => fmt(x, 2)).join(', '),
      chart: {
        type: 'bar',
        title: 'Before and after the curve',
        categories: raw.map((_, i) => `#${i + 1}`),
        format: { format: 'number', precision: 1 },
        series: [{ name: 'Before', values: raw }, { name: 'After', values: after }],
      },
      steps: [`Method: ${method}`, `Average before: ${fmt(before, 2)}`, `Average after: ${fmt(avg, 2)}`],
      tone: 'ok',
      note: 'This is one common way to curve. Your instructor may use a different one.',
    };
  },
  content: {
    formula: [
      'Flat: curved = min(max, score + points)',
      'Scale: curved = score × max ÷ top score',
      'Square root: curved = max × √(score ÷ max)',
    ],
    body: [
      'Curving a test changes the scores after the fact, usually because the test turned out harder than planned. There is no single official method, and many instructors never curve at all. This calculator shows three common approaches side by side so you can see what each one does to a set of scores.',
      'Paste your scores, enter the maximum points and pick a method. You get the curved scores in the order you entered them, the class average before and after, and a chart comparing each score.',
      'Everything runs in your browser. Nothing you enter is stored or sent anywhere.',
    ],
    sections: [
      {
        heading: 'How the three methods differ',
        paragraphs: [
          'A flat curve adds the same number of points to everyone, so it helps every score equally, capped at the maximum. Scaling multiplies every score by the same factor so the highest score becomes the maximum, which helps higher scores a little more in points. The square root curve lifts low scores the most: 64 out of 100 becomes 80, while 100 stays 100.',
        ],
      },
    ],
    faq: [
      { q: 'How do I curve grades by adding points?', a: 'Add the same number of points to every score and cap the result at the maximum. Adding 5 to scores of 62, 75 and 88 gives 67, 80 and 93.' },
      { q: 'How does scaling the top score to 100 work?', a: 'Multiply each score by 100 ÷ top score. With a top score of 88, a 75 becomes 75 × 100 ÷ 88 = 85.23 and the top score becomes 100.' },
      { q: 'What is the square root curve?', a: 'Curved = max × √(score ÷ max). On a 100-point test a 64 becomes 80 and a 36 becomes 60. It lifts low scores most.' },
      { q: 'Will my instructor use this method?', a: 'Maybe not. Instructors choose their own curves, or none. Treat this as an estimate, and ask for the actual method.' },
    ],
  },
  related: ['weighted-grade', 'test-grade', 'final-grade', 'gpa', 'percent-difference'],
  examples: [
    // +5: 67, 80, 93; before (62+75+88)/3 = 75; after 240/3 = 80; gain 5
    { values: { scores: [62, 75, 88], max: 100, method: 'flat', points: 5 }, expect: { avgBefore: 75, avgAfter: 80, gain: 5 }, tolerance: 1e-9 },
    // scale by 100/88: 62 -> 70.4545, 75 -> 85.2273, 88 -> 100; average after = 75 × 100/88 = 85.22727
    { values: { scores: [62, 75, 88], max: 100, method: 'scale', points: 0 }, expect: { avgBefore: 75, avgAfter: 85.227272727, gain: 10.227272727 }, tolerance: 1e-6 },
    // sqrt on 100: 64 -> 80, 81 -> 90, 100 -> 100; after 270/3 = 90; before 245/3 = 81.6667
    { values: { scores: [64, 81, 100], max: 100, method: 'sqrt', points: 0 }, expect: { avgAfter: 90, avgBefore: 245 / 3 }, tolerance: 1e-9 },
    // flat cap: 98 + 5 -> 100, 50 + 5 = 55; after 77.5
    { values: { scores: [98, 50], max: 100, method: 'flat', points: 5 }, expect: { avgAfter: 77.5 }, tolerance: 1e-9 },
  ],
});
