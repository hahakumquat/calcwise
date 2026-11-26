import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'resistor-series-parallel',
  title: 'Resistors in Series and Parallel Calculator',
  category: 'construction',
  description: 'Enter up to three resistor values to get the total resistance when they are wired in series and in parallel.',
  metaDescription: 'Find total resistance for resistors in series and in parallel from up to three values in ohms. Free, instant, with the working shown.',
  updated: '2026-11-26',
  keywords: ['resistors in series and parallel', 'parallel resistor calculator', 'series resistor calculator', 'total resistance calculator', 'equivalent resistance'],
  inputs: [
    { id: 'r1', label: 'Resistor 1 (ohms)', type: 'number', default: 100, min: 0, step: 1, info: 'Resistance of the first resistor in ohms.' },
    { id: 'r2', label: 'Resistor 2 (ohms)', type: 'number', default: 220, min: 0, step: 1, info: 'Resistance of the second resistor in ohms.' },
    { id: 'r3', label: 'Resistor 3 (ohms, optional)', type: 'number', default: 330, min: 0, step: 1, info: 'Leave at 0 to use just two resistors.' },
  ],
  outputs: [
    { id: 'series', label: 'Series total (ohms)', format: 'number', precision: 3, primary: true, info: 'Resistors in a single chain: the values simply add.' },
    { id: 'parallel', label: 'Parallel total (ohms)', format: 'number', precision: 3, info: 'Resistors side by side: 1 ÷ (1/R1 + 1/R2 + 1/R3). Always smaller than the smallest resistor.' },
  ],
  compute: (v) => {
    const a = num(v.r1);
    const b = num(v.r2);
    const c = num(v.r3) ?? 0;
    if (a === null || b === null) return { series: null };
    if (a <= 0 || b <= 0 || c < 0) return { series: null, error: 'Enter resistor values above 0 ohms (the third may be 0 to skip it).' };
    const vals = c > 0 ? [a, b, c] : [a, b];
    const series = vals.reduce((s, x) => s + x, 0);
    const parallel = 1 / vals.reduce((s, x) => s + 1 / x, 0);
    return {
      series,
      parallel,
      tone: 'ok',
      badge: `${vals.length} resistors`,
      chart: {
        type: 'bar',
        title: 'Total resistance (ohms)',
        categories: ['Series', 'Parallel'],
        series: [{ name: 'Ohms', values: [series, parallel] }],
      },
      steps: [
        `Series = ${vals.map((x) => fmt(x)).join(' + ')} = ${fmt(series)} Ω`,
        `Parallel = 1 ÷ (${vals.map((x) => `1/${fmt(x)}`).join(' + ')}) = ${fmt(parallel)} Ω`,
      ],
    };
  },
  content: {
    formula: ['R(series) = R1 + R2 + R3', '1 ÷ R(parallel) = 1 ÷ R1 + 1 ÷ R2 + 1 ÷ R3'],
    body: [
      'Resistors wired in a chain, one after another, are in series and their resistances add. Resistors wired side by side, each across the same two points, are in parallel and their conductances (1 ÷ R) add.',
      'With 100, 220 and 330 ohms the series total is 650 ohms. In parallel it is 1 ÷ (0.01 + 0.004545 + 0.003030) = 56.897 ohms, which is lower than the smallest resistor.',
      'This is a quick maths helper for hobby electronics. Check power ratings and follow your circuit design before building anything.',
    ],
    faq: [
      { q: 'What is the total of 100, 220 and 330 ohm resistors in series?', a: '100 + 220 + 330 = 650 ohms.' },
      { q: 'What is the same set in parallel?', a: 'About 56.897 ohms, found as 1 ÷ (1/100 + 1/220 + 1/330).' },
      { q: 'Why is parallel resistance lower than any single resistor?', a: 'Each extra path gives current another route, so the combined resistance falls below the smallest branch.' },
      { q: 'How do I use only two resistors?', a: 'Set the third to 0. For two equal resistors in parallel the total is half of one.' },
    ],
    sources: [],
  },
  related: ['ohms-law', 'holiday-lights'],
  examples: [
    // 100+220+330=650; 1/(0.01+0.0045454545+0.0030303030)=56.89655
    { values: { r1: 100, r2: 220, r3: 330 }, expect: { series: 650, parallel: 56.89655 }, tolerance: 0.001 },
    // 100 and 100: series 200, parallel 50
    { values: { r1: 100, r2: 100, r3: 0 }, expect: { series: 200, parallel: 50 }, tolerance: 0.001 },
  ],
});
