import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmtX = (n: number) => `${+n.toFixed(3)}×`;

export default defineCalculator({
  slug: 'amdahls-law',
  title: "Amdahl's Law Calculator (Speedup)",
  category: 'developer',
  description: "Work out the overall speedup from parallelising or optimising part of a program with Amdahl's law, plus the maximum speedup you can ever reach.",
  metaDescription: "Amdahl's law calculator: enter the parallel share of your workload and the speedup or core count of that part to get the overall speedup and its upper limit.",
  updated: '2026-11-26',
  keywords: ["amdahl's law calculator", 'amdahl law speedup', 'parallel speedup calculator', 'maximum speedup parallel fraction', 'multicore speedup limit', 'parallel efficiency'],
  inputs: [
    { id: 'p', label: 'Part that can be sped up', type: 'number', default: 80, min: 0, max: 100, step: 0.1, suffix: '%', info: 'The share of the original run time that benefits from the improvement, such as the parallelisable part of a program. 80 means 80% of the time.' },
    { id: 's', label: 'Speedup of that part', type: 'number', default: 4, min: 1, step: 0.1, suffix: '×', info: 'How many times faster the improved part runs. With perfect parallel scaling this equals the number of processors, for example 4 for 4 cores.' },
  ],
  outputs: [
    { id: 'speedup', label: 'Overall speedup', format: 'text', primary: true, info: 'Overall speedup = 1 ÷ ((1 - p) + p ÷ s), where p is the improved share as a fraction and s its speedup.' },
    { id: 'limit', label: 'Maximum possible speedup', format: 'text', info: 'The limit as s grows without bound: 1 ÷ (1 - p). The part you cannot improve sets this ceiling.' },
    { id: 'newTime', label: 'New run time (old = 100%)', format: 'percent', precision: 1, info: 'Run time after the change as a share of the original: (1 - p) + p ÷ s.' },
    { id: 'efficiency', label: 'Efficiency (speedup ÷ s)', format: 'percent', precision: 1, info: 'Overall speedup divided by the speedup of the improved part. When s is a processor count this is the parallel efficiency.' },
  ],
  compute: (v) => {
    const pp = num(v.p);
    const s = num(v.s);
    if (pp === null || s === null || pp < 0 || pp > 100 || s < 1) {
      return { speedup: null, error: 'Enter a percentage between 0 and 100 and a speedup of 1 or more.' };
    }
    const p = pp / 100;
    const t = 1 - p + p / s;
    const sp = 1 / t;
    const lim = p >= 1 ? Infinity : 1 / (1 - p);
    const xs = Array.from({ length: 32 }, (_, i) => i + 1);
    const curve = xs.map((x) => 1 / (1 - p + p / x));
    return {
      speedup: fmtX(sp),
      limit: p >= 1 ? 'No limit (fully improvable)' : fmtX(lim),
      newTime: t,
      efficiency: sp / s,
      tone: sp >= 0.8 * s ? 'good' : sp >= 0.5 * s ? 'ok' : 'warn',
      badge: p >= 1 ? 'Scales fully' : `Capped at ${fmtX(lim)}`,
      steps: [
        `New time = (1 - ${+p.toFixed(4)}) + ${+p.toFixed(4)} ÷ ${s} = ${+t.toFixed(4)} of the original`,
        `Speedup = 1 ÷ ${+t.toFixed(4)} = ${fmtX(sp)}`,
        p >= 1 ? 'Limit: with nothing left unimproved, speedup grows without bound.' : `Limit = 1 ÷ (1 - ${+p.toFixed(4)}) = ${fmtX(lim)}`,
      ],
      chart: {
        type: 'line',
        title: 'Overall speedup as the improved part gets faster',
        x: xs,
        xLabel: 'Speedup of the improved part (or processors)',
        yLabel: 'Overall speedup',
        yFormat: { format: 'number', suffix: '×' },
        series: [{ name: 'Overall speedup', values: curve }],
        markers: s <= 32 ? [{ x: Math.round(s), label: 'Your setting' }] : undefined,
      },
    };
  },
  content: {
    formula: ['overall speedup = 1 ÷ ((1 - p) + p ÷ s)', 'maximum speedup = 1 ÷ (1 - p)'],
    body: [
      "Amdahl's law says that speeding up one part of a job only helps as much as that part matters. If a share p of the run time gets s times faster and the rest stays the same, the new run time is (1 - p) + p ÷ s of the old one, and the overall speedup is its inverse.",
      'Example: if 80% of a program can run in parallel on 4 cores, the new time is 0.2 + 0.8 ÷ 4 = 0.4, so the speedup is 1 ÷ 0.4 = 2.5×, not 4×. The 20% that stays serial caps the speedup at 1 ÷ 0.2 = 5× no matter how many cores you add.',
      'With p = 50% and s = 10, the time is 0.5 + 0.05 = 0.55 and the speedup is 1.818×. At p = 95% the ceiling is 20×. Small serial fractions matter a lot at scale.',
      'The law assumes a fixed problem size and perfect scaling of the improved part. Real programs also pay for communication, synchronisation and memory limits, so measured speedups are usually lower. Gustafson\'s law covers the case where the problem grows with the machine.',
      'This calculator runs entirely in your browser; nothing is uploaded.',
    ],
    faq: [
      { q: "What is Amdahl's law?", a: 'A formula for the overall speedup when only part of a workload is improved: speedup = 1 ÷ ((1 - p) + p ÷ s). The part that is not improved limits the total gain.' },
      { q: 'What is the speedup if 80% of a program is parallel on 4 cores?', a: 'The new time is 0.2 + 0.8 ÷ 4 = 0.4 of the original, so the speedup is 2.5×. The maximum with unlimited cores is 5×.' },
      { q: 'What is the maximum speedup for a given parallel fraction?', a: 'It is 1 ÷ (1 - p). For 50% that is 2×, for 80% it is 5×, for 90% it is 10× and for 95% it is 20×.' },
      { q: 'What does 50% parallel and a 10× faster part give?', a: 'The time is 0.5 + 0.5 ÷ 10 = 0.55, so the overall speedup is 1 ÷ 0.55 = 1.818×, with a ceiling of 2×.' },
    ],
    sources: [
      { label: "Wikipedia: Amdahl's law", url: 'https://en.wikipedia.org/wiki/Amdahl%27s_law' },
      { label: 'Amdahl (1967), Validity of the single processor approach to achieving large scale computing capabilities', url: 'https://doi.org/10.1145/1465482.1465560' },
    ],
  },
  related: ['uptime-downtime', 'download-time', 'cron-explainer'],
  examples: [
    // p=.8, s=4: t = .2 + .2 = .4 -> 2.5x; limit 1/.2 = 5x; efficiency 2.5/4 = .625
    { values: { p: 80, s: 4 }, expect: { speedup: '2.5×', limit: '5×', newTime: 0.4, efficiency: 0.625 } },
    // p=.5, s=10: t = .5 + .05 = .55 -> 1.818x; limit 2x
    { values: { p: 50, s: 10 }, expect: { speedup: '1.818×', limit: '2×', newTime: 0.55 } },
    // p=.95: limit 1/.05 = 20x
    { values: { p: 95, s: 100 }, expect: { limit: '20×' } },
  ],
});
