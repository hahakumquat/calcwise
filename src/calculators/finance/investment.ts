import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { growthCharts, sampleIdx } from '../../lib/helpers/finance';
import { fvAnnuity, money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'investment',
  title: 'Investment Calculator',
  category: 'finance',
  description: 'Project the future value of an investment with regular contributions and an expected annual return, in nominal and inflation-adjusted dollars.',
  keywords: ['investment return', 'future value', 'stock market', 'index fund', 'portfolio growth', 'dollar cost averaging'],
  inputs: [
    { id: 'initial', label: 'Starting amount', type: 'number', prefix: '$', default: 10000, min: 0, info: 'The lump sum you invest today.' },
    { id: 'contribution', label: 'Contribution', type: 'number', prefix: '$', default: 500, min: 0, optional: true, info: 'How much you add each period. Leave blank if you will not add more.' },
    {
      id: 'frequency',
      info: 'Whether you contribute every month or once a year.',
      label: 'Contribution frequency',
      type: 'select',
      segmented: true,
      default: '12',
      options: [
        { value: '12', label: 'Monthly' },
        { value: '1', label: 'Yearly' },
      ],
    },
    {
      id: 'timing',
      info: 'Money added at the start of each period has one extra period to grow than money added at the end.',
      label: 'Contributions made at',
      type: 'select',
      segmented: true,
      default: 'end',
      options: [
        { value: 'end', label: 'End of period' },
        { value: 'begin', label: 'Start of period' },
      ],
    },
    { id: 'returnRate', label: 'Expected annual return', type: 'number', suffix: '%', default: 7, step: 0.1, info: 'Average yearly return you expect after fees. Many planners use 5–7% for a stock-heavy portfolio.' },
    { id: 'years', label: 'Years invested', type: 'number', suffix: 'years', default: 20, min: 0, step: 1, info: 'How long you plan to stay invested.' },
    { id: 'inflation', label: 'Inflation rate', type: 'number', suffix: '%', default: 2.5, min: 0, step: 0.1, optional: true, help: 'Used for the value in today\'s dollars.', info: 'Expected yearly inflation, used to show the result in today\'s purchasing power. 2–3% is a common assumption.' },
  ],
  outputs: [
    { id: 'futureValue', label: 'Future value', format: 'currency', primary: true, info: 'Projected portfolio value at the end, in future dollars.' },
    { id: 'contributed', label: 'Total contributed', format: 'currency', info: 'Your starting amount plus all contributions — the money that came out of your pocket.' },
    { id: 'growth', label: 'Investment growth', format: 'currency', info: 'Investment earnings: the future value minus what you contributed.' },
    { id: 'realValue', label: 'Value in today\'s dollars', format: 'currency', info: 'The future value adjusted for inflation, i.e. what it would buy in today\'s prices.' },
  ],
  compute: (v) => {
    const P = num(v.initial) ?? 0;
    const C = num(v.contribution) ?? 0;
    const R = num(v.returnRate);
    const years = num(v.years);
    if (R === null || years === null || years < 0 || P < 0 || C < 0 || R <= -100) return { futureValue: null };
    const m = v.frequency === '1' ? 1 : 12;
    const N = Math.round(years * m);
    const r = (1 + R / 100) ** (1 / m) - 1; // periodic rate equivalent to the annual return
    const fvLump = P * (1 + R / 100) ** (N / m);
    const fvContrib = fvAnnuity(C, r, N) * (v.timing === 'begin' ? 1 + r : 1);
    const futureValue = fvLump + fvContrib;
    const contributed = P + C * N;
    const inf = (num(v.inflation) ?? 0) / 100;
    const realValue = futureValue / (1 + inf) ** (N / m);
    const idx = sampleIdx(N, 100);
    const balAt = (j: number) => P * (1 + r) ** j + fvAnnuity(C, r, j) * (v.timing === 'begin' ? 1 + r : 1);
    return {
      futureValue,
      contributed,
      growth: futureValue - contributed,
      realValue,
      chart: growthCharts(idx.map((j) => +(j / m).toFixed(2)), idx.map((j) => P + C * j), idx.map(balAt)),
      steps: [
        `Periodic return = (1 + ${R}%)^(1/${m}) − 1 = ${pct(r, 4)}`,
        `Starting amount: ${money(P)} × (1 + ${R}%)^${+(N / m).toFixed(4)} = ${money(fvLump)}`,
        `${N} contributions of ${money(C)} grow to ${money(fvContrib)}`,
        `In today's dollars: ${money(futureValue)} ÷ (1 + ${inf * 100}%)^${+(N / m).toFixed(4)} = ${money(realValue)}`,
      ],
      note: `${money(contributed, 0)} invested becomes about ${money(futureValue, 0)} (${money(realValue, 0)} in today's money).`,
    };
  },
  content: {
    formula: [
      'FV = P(1 + R)^t + C × ((1 + r)^N − 1) ÷ r  [× (1 + r) if paid at the start]',
      'r = (1 + R)^(1/m) − 1, N = m × t, m = contributions per year',
      'Real value = FV ÷ (1 + inflation)^t',
    ],
    body: [
      'This calculator projects what a portfolio could be worth if it earns a steady annual return. The expected return is treated as an effective yearly rate, and each contribution period gets the equivalent smaller rate, so monthly and yearly contributions are compared fairly.',
      'Real markets do not deliver a smooth return. U.S. stocks have historically averaged roughly 9–10% a year before inflation, with large swings; a balanced stock-and-bond portfolio has averaged less. Many planners use 5–7% for long-term projections to stay on the conservative side.',
      'The inflation-adjusted figure shows what the future balance would buy in today\'s prices. Over 20 or 30 years, even 2–3% inflation cuts purchasing power by a third or more, which is why real returns matter when planning for long-term goals.',
    ],
    faq: [
      { q: 'Does contributing at the start of the period make a big difference?', a: 'It adds one period of growth to every contribution. With monthly contributions the difference is small (about half a percent of the contributions\' growth at 7%); with yearly contributions it is more noticeable.' },
      { q: 'Are fees and taxes included?', a: 'No. Subtract your fund\'s expense ratio from the expected return to account for fees — a 1% fee on a 7% return leaves 6%. Taxes depend on the account type; 401(k)s and IRAs defer or avoid them.' },
      { q: 'What return should I assume?', a: 'There is no right answer. Running the numbers at a low, middle and high rate (say 4%, 6% and 8%) shows a realistic range rather than a single precise-looking figure.' },
    ],
  },
  related: ['compound-interest', 'retirement', 'roi', 'inflation', 'savings-goal'],
  examples: [
    { values: { initial: 0, contribution: 1000, frequency: '1', timing: 'end', returnRate: 10, years: 3, inflation: null }, expect: { futureValue: 3310, contributed: 3000 } },
    { values: { initial: 0, contribution: 1000, frequency: '1', timing: 'begin', returnRate: 10, years: 3, inflation: 0 }, expect: { futureValue: 3641 } },
    { values: { initial: 10000, contribution: 0, frequency: '12', timing: 'end', returnRate: 7, years: 10, inflation: 2 }, expect: { futureValue: 19671.51357, realValue: 16137.43 }, tolerance: 0.00001 },
  ],
});
