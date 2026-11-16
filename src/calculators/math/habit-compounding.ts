import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'habit-compounding',
  title: '1% Better Every Day Calculator',
  category: 'math',
  description: 'See what 1% better (or 1% worse) every day adds up to. Compare daily compounding with plain linear gains, from 30 days to a full year.',
  keywords: ['1% better every day calculator', '1.01^365', '37.78 calculator', 'habit compounding', 'compound effect calculator', '1 percent better every day'],
  updated: '2026-11-16',
  inputs: [
    { id: 'rate', label: 'Daily change', type: 'number', suffix: '%', default: 1, min: 0, max: 20, step: 0.1, info: 'How much better (or worse) you get each day, as a percentage of where you were the day before.' },
    { id: 'days', label: 'Days', type: 'number', default: 365, min: 1, max: 1000, step: 1, info: 'How many days in a row you keep it up. 365 is one year.' },
    {
      id: 'direction',
      label: 'Direction',
      type: 'select',
      default: 'better',
      options: [
        { value: 'better', label: 'Better every day' },
        { value: 'worse', label: 'Worse every day' },
      ],
      info: 'Better multiplies by (1 + rate) each day. Worse multiplies by (1 − rate).',
    },
  ],
  outputs: [
    { id: 'factor', label: 'Where you end up', format: 'number', precision: 2, suffix: '× your start', primary: true, info: '(1 ± rate) raised to the number of days. 1.00 means no change.' },
    { id: 'pct', label: 'Change from the start', format: 'number', precision: 1, suffix: '%', info: 'The final multiple minus 1, as a percentage.' },
    { id: 'linear', label: 'If it only added up linearly', format: 'number', precision: 2, suffix: '× your start', info: 'Rate × days added to 1, with no compounding. Shown for contrast.' },
  ],
  compute: (v) => {
    const rate = num(v.rate);
    const days = num(v.days);
    if (rate === null || days === null || rate < 0 || rate > 20 || days < 1 || days > 1000) return { factor: null };
    const n = Math.round(days);
    const r = rate / 100;
    const sign = v.direction === 'worse' ? -1 : 1;
    const f = (d: number) => Math.pow(1 + sign * r, d);
    const factor = f(n);
    const linear = Math.max(0, 1 + sign * r * n);
    const step = Math.max(1, Math.ceil(n / 60));
    const xs: number[] = [];
    const comp: number[] = [];
    const lin: number[] = [];
    for (let d = 0; d <= n; d += step) {
      xs.push(d);
      comp.push(f(d));
      lin.push(Math.max(0, 1 + sign * r * d));
    }
    if (xs[xs.length - 1] !== n) {
      xs.push(n);
      comp.push(factor);
      lin.push(linear);
    }
    const better = sign > 0;
    return {
      factor,
      pct: (factor - 1) * 100,
      linear,
      tone: better ? 'good' : 'bad',
      badge: better ? 'Small steps, big curve' : 'Tiny slips add up too',
      chart: {
        type: 'line',
        title: 'Compounding vs linear',
        x: xs,
        xLabel: 'Days',
        yFormat: { format: 'number', suffix: '×' },
        series: [
          { name: 'Compounding', values: comp },
          { name: 'Linear', values: lin },
        ],
      },
      steps: [
        `Multiplier each day = 1 ${better ? '+' : '−'} ${fmt(rate, 2)}% = ${fmt(1 + sign * r, 4)}`,
        `After ${n} days = ${fmt(1 + sign * r, 4)}^${n} = ${fmt(factor, 4)}×`,
        `Linear version = 1 ${better ? '+' : '−'} ${fmt(r, 4)} × ${n} = ${fmt(linear, 2)}×`,
      ],
      note: `${fmt(rate, 2)}% ${better ? 'better' : 'worse'} every day for ${n} days is ${fmt(factor, 2)}× where you started. Adding the same amount without compounding would give ${fmt(linear, 2)}×. This is a metaphor for effort, not a model of how real skills grow.`,
    };
  },
  content: {
    formula: ['Result = (1 + daily rate)^days', 'Worse every day: (1 − daily rate)^days', 'Linear comparison = 1 + daily rate × days'],
    body: [
      'The idea behind "1% better every day" is compounding. Each day you improve on top of yesterday, so the gains stack. 1.01 multiplied by itself 365 times is about 37.78, which is the number people quote when they say you can get 37 times better in a year.',
      'The flip side is just as real. If you slip 1% every day, 0.99 multiplied by itself 365 times is about 0.0255. You keep roughly 2.6% of where you started. Small daily losses compound as hard as small daily gains.',
      'Compounding starts slowly. After 30 days, 1% a day is only about 1.35×, which is 35% better, not 30 times. The curve takes off late. Plain linear growth (1% of the start each day) reaches only 4.65× after a year, so the gap is all compounding.',
      'Treat this as a metaphor. Skills, fitness and savings do not improve by a fixed percentage forever, and nobody gets 1% better at everything daily. The math is exact, the real-life claim is not. The useful lesson is that consistency beats intensity.',
    ],
    faq: [
      { q: 'What is 1.01 to the power of 365?', a: '1.01^365 is about 37.78. That means 1% better every day for a year ends at roughly 37.8 times where you started.' },
      { q: 'What is 0.99 to the power of 365?', a: '0.99^365 is about 0.0255, so 1% worse every day for a year leaves you with about 2.6% of where you started.' },
      { q: 'How much is 1% better every day after 30 days?', a: '1.01^30 is about 1.348, so you are roughly 35% better after a month. Most of the big gain comes later in the year.' },
      { q: 'Is 1% better every day realistic?', a: 'No. Real progress slows down and levels off. The calculator shows the arithmetic of compounding, not a prediction of how fast you can improve at anything.' },
      { q: 'How is this different from linear growth?', a: 'Linear growth adds the same amount each day: 1% of the start × 365 gives 4.65×. Compounding grows on the new total, which is why it reaches 37.78×.' },
    ],
    sources: [
      { label: 'Compound interest (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Compound_interest' },
      { label: 'Exponential growth (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Exponential_growth' },
    ],
  },
  related: ['exponent', 'percentage-change', 'compound-interest', 'rule-of-72'],
  examples: [
    // 1.01^365 = exp(365 × 0.00995033) = exp(3.63187) = 37.7834; linear 1 + 3.65 = 4.65.
    { values: { rate: 1, days: 365, direction: 'better' }, expect: { factor: 37.7834, linear: 4.65 }, tolerance: 1e-3 },
    // 0.99^365 = exp(365 × −0.01005034) = exp(−3.66837) = 0.025518.
    { values: { rate: 1, days: 365, direction: 'worse' }, expect: { factor: 0.025518 }, tolerance: 1e-4 },
    // 1.01^30 = exp(0.298510) = 1.34785.
    { values: { rate: 1, days: 30, direction: 'better' }, expect: { factor: 1.34785, pct: 34.785 }, tolerance: 1e-3 },
  ],
});
