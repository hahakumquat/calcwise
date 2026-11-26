import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'exponential-decay',
  title: 'Exponential Decay and Half-Life Calculator',
  category: 'math',
  description: 'Enter a starting amount, a half-life and an elapsed time to get the amount left, the fraction remaining and the decay constant.',
  metaDescription: 'Calculate how much remains after a time given a half-life: N = N0 × 0.5^(t ÷ h). Shows fraction left and decay constant. Free and instant.',
  updated: '2026-11-26',
  keywords: ['half life calculator', 'exponential decay calculator', 'radioactive decay calculator', 'decay constant', 'carbon dating math'],
  inputs: [
    { id: 'n0', label: 'Starting amount', type: 'number', default: 100, min: 0, step: 1, info: 'Any unit: grams, atoms, mg of a drug, percent.' },
    { id: 'half', label: 'Half-life', type: 'number', default: 5, min: 0, step: 0.1, info: 'Time for the amount to halve. Use the same time unit as the elapsed time.' },
    { id: 't', label: 'Elapsed time', type: 'number', default: 15, min: 0, step: 0.1, info: 'How long has passed, in the same unit as the half-life.' },
  ],
  outputs: [
    { id: 'left', label: 'Amount remaining', format: 'number', precision: 4, primary: true, info: 'N = N0 × 0.5^(t ÷ half-life).' },
    { id: 'pct', label: 'Fraction remaining (%)', format: 'number', precision: 3, info: 'Remaining amount as a percentage of the start.' },
    { id: 'k', label: 'Decay constant (per time unit)', format: 'number', precision: 5, info: 'k = ln 2 ÷ half-life.' },
  ],
  compute: (v) => {
    const n0 = num(v.n0);
    const h = num(v.half);
    const t = num(v.t);
    if (n0 === null || h === null || t === null) return { left: null };
    if (n0 < 0 || t < 0) return { left: null, error: 'Enter a starting amount and time of 0 or more.' };
    if (h <= 0) return { left: null, error: 'Enter a half-life above 0.' };
    const frac = Math.pow(0.5, t / h);
    const left = n0 * frac;
    const k = Math.LN2 / h;
    const pts = [0, 1, 2, 3, 4, 5];
    return {
      left,
      pct: frac * 100,
      k,
      tone: 'ok',
      badge: `${fmt(t / h)} half-lives`,
      chart: {
        type: 'bar',
        title: 'Amount after each half-life',
        categories: pts.map((p) => String(p)),
        series: [{ name: 'Amount', values: pts.map((p) => n0 * Math.pow(0.5, p)) }],
      },
      steps: [
        `Half-lives elapsed = ${fmt(t)} ÷ ${fmt(h)} = ${fmt(t / h)}`,
        `Fraction left = 0.5^${fmt(t / h)} = ${fmt(frac)}`,
        `Amount = ${fmt(n0)} × ${fmt(frac)} = ${fmt(left)}`,
      ],
    };
  },
  content: {
    formula: ['N = N0 × 0.5^(t ÷ h)', 'k = ln 2 ÷ h', 'N = N0 × e^(−k × t)'],
    body: [
      'Many things shrink by the same fraction in each equal stretch of time: radioactive atoms, caffeine in the blood, a drug dose. The half-life is the time it takes for the amount to fall to half.',
      'Start with 100 and a half-life of 5. After 15 units that is three half-lives, so 100 × 0.5³ = 12.5, or 12.5% of the start. The decay constant is ln 2 ÷ 5 = 0.13863 per unit.',
      'This models smooth exponential decay. For medicine, follow your clinician rather than a calculator.',
    ],
    faq: [
      { q: 'How much is left after 3 half-lives?', a: 'One eighth, 12.5% of the starting amount.' },
      { q: 'What is the decay constant?', a: 'k = ln 2 ÷ half-life. For a half-life of 5 it is 0.13863 per unit time.' },
      { q: 'Does the time unit matter?', a: 'Only that the half-life and elapsed time use the same unit.' },
      { q: 'Does it ever reach zero?', a: 'In theory no; the amount keeps halving.' },
    ],
    sources: [],
  },
  related: ['caffeine-half-life', 'percentage-change', 'exponent'],
  examples: [
    // 100*0.5^3=12.5; k=0.693147/5=0.1386294
    { values: { n0: 100, half: 5, t: 15 }, expect: { left: 12.5, pct: 12.5, k: 0.138629 }, tolerance: 0.0001 },
    // 80, half 2, t 1: 80*0.5^0.5=56.56854
    { values: { n0: 80, half: 2, t: 1 }, expect: { left: 56.56854, pct: 70.71068, k: 0.346574 }, tolerance: 0.0001 },
  ],
});
