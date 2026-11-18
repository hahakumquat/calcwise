import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'real-rate-of-return',
  title: 'Real Rate of Return Calculator',
  category: 'finance',
  description: 'Adjust an investment return for inflation. Enter the nominal return and the inflation rate to see your real rate of return and what your money buys in future.',
  keywords: ['real rate of return calculator', 'inflation adjusted return', 'fisher equation', 'real return after inflation', 'nominal vs real return'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'nominal', label: 'Nominal return', type: 'number', default: 7, min: -50, max: 100, step: 0.1, suffix: '% a year', info: 'The yearly return you earn before adjusting for inflation.' },
    { id: 'inflation', label: 'Inflation rate', type: 'number', default: 3, min: -10, max: 100, step: 0.1, suffix: '% a year', info: 'The yearly rise in prices over the same period.' },
    { id: 'amount', label: 'Starting amount', type: 'number', prefix: '$', default: 10000, min: 0, step: 100, info: 'Used to show what the money grows to.' },
    { id: 'years', label: 'Years', type: 'number', default: 20, min: 1, max: 100, step: 1, suffix: 'years', info: 'How long the money stays invested.' },
  ],
  outputs: [
    { id: 'real', label: 'Real rate of return', format: 'percent', precision: 2, primary: true, info: '(1 + nominal) ÷ (1 + inflation) − 1. Your yearly growth in buying power.' },
    { id: 'simple', label: 'Nominal minus inflation', format: 'percent', precision: 2, info: 'The quick shortcut. It is close to the real rate when both rates are small.' },
    { id: 'nominalValue', label: 'Value in future dollars', format: 'currency', precision: 0, info: 'Starting amount grown at the nominal rate.' },
    { id: 'realValue', label: 'Value in today’s dollars', format: 'currency', precision: 0, info: 'Starting amount grown at the real rate: what the final balance would buy at today’s prices.' },
  ],
  compute: (v) => {
    const n = num(v.nominal);
    const i = num(v.inflation);
    const p = num(v.amount);
    const y = num(v.years);
    if (n === null || i === null || p === null || y === null || n < -50 || n > 100 || i < -10 || i > 100 || p < 0 || y < 1 || y > 100) return { real: null };
    const real = (1 + n / 100) / (1 + i / 100) - 1;
    const years = Math.round(y);
    const nom: number[] = [];
    const rea: number[] = [];
    const x: number[] = [];
    for (let t = 0; t <= years; t++) {
      x.push(t);
      nom.push(p * Math.pow(1 + n / 100, t));
      rea.push(p * Math.pow(1 + real, t));
    }
    return {
      real: real * 100,
      simple: n - i,
      nominalValue: nom[years],
      realValue: rea[years],
      chart: {
        type: 'line',
        title: 'Nominal balance vs buying power',
        x,
        xLabel: 'Years',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Future dollars', values: nom },
          { name: 'Today’s dollars', values: rea },
        ],
      },
      steps: [
        `Real return = (1 + ${fmt(n / 100, 4)}) ÷ (1 + ${fmt(i / 100, 4)}) − 1 = ${fmt(real * 100, 4)}%`,
        `After ${years} years: $${fmt(p, 0)} becomes $${fmt(nom[years], 0)} nominal, worth $${fmt(rea[years], 0)} in today’s dollars`,
      ],
      note: `A ${fmt(n)}% return with ${fmt(i)}% inflation grows your buying power by ${fmt(real * 100)}% a year.`,
    };
  },
  content: {
    formula: ['Real return = (1 + nominal) ÷ (1 + inflation) − 1', 'Also known as the Fisher equation. Rates are decimals.'],
    body: [
      'A nominal return is the number on your statement. A real return is what is left after prices have risen. If your investments earn 7% and prices rise 3%, you did not gain 7% of buying power.',
      'The exact answer divides rather than subtracts: 1.07 ÷ 1.03 = 1.0388, so the real return is about 3.88%. The shortcut of 7% minus 3% gives 4%. It is close at low rates but drifts as rates climb.',
      'The balance chart shows both lines. The nominal line is the figure you will see in your account. The real line shows the same balance priced in today’s dollars, which is the one that tells you what you can actually buy.',
      'Inflation is an assumption, and so is the return. Taxes and fees are not included, and both lower the real result further. Use the output to compare scenarios, not as a forecast.',
    ],
    faq: [
      { q: 'How do you calculate the real rate of return?', a: 'Divide 1 plus the nominal return by 1 plus the inflation rate, then subtract 1. For 7% and 3%, that is 1.07 ÷ 1.03 − 1 = 3.88%.' },
      { q: 'Why not just subtract inflation from the return?', a: 'Subtraction is a fair approximation at low rates, but it overstates the real return slightly. Dividing is exact.' },
      { q: 'Can a real return be negative?', a: 'Yes. If inflation is higher than your nominal return, your balance may grow but buys less each year.' },
      { q: 'What does "today’s dollars" mean?', a: 'It is the final balance shrunk by the cumulative inflation, so you can compare it with prices you know now.' },
    ],
    sources: [
      { label: 'Fisher equation (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Fisher_equation' },
      { label: 'Inflation (Investor.gov)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/inflation' },
    ],
  },
  related: ['inflation', 'cagr-calculator', 'compound-interest', 'present-value', 'rule-of-72'],
  examples: [
    {
      // 1.07/1.03 = 1.038835 -> 3.8835%; 10000*1.07^20 = 38696.84; 10000*1.038835^20 = 21425.50.
      values: { nominal: 7, inflation: 3, amount: 10000, years: 20 },
      expect: { real: 3.8835, simple: 4, nominalValue: 38697, realValue: 21426 },
      tolerance: 1e-2,
    },
    {
      // 1.08/1.025 = 1.053659; 1000*1.08^10 = 2158.92; 1000*1.053659^10 = 1686.55.
      values: { nominal: 8, inflation: 2.5, amount: 1000, years: 10 },
      expect: { real: 5.3659, nominalValue: 2159, realValue: 1687 },
      tolerance: 1e-2,
    },
    { values: { nominal: 5, inflation: 5, amount: 100, years: 5 }, expect: { real: 0, realValue: 100 }, tolerance: 1e-6 },
  ],
});
