import { defineCalculator } from '../../lib/types';
import { sum } from '../../lib/math';
import { fmt, nums } from '../../lib/helpers/math-extra';

const pct = (x: number) => `${fmt(x * 100, 6)}%`;

export default defineCalculator({
  slug: 'geometric-harmonic-mean',
  title: 'Geometric & Harmonic Mean Calculator',
  category: 'math',
  description: 'Find the geometric, harmonic and arithmetic mean of a list of positive numbers, or the true average of investment returns that compound.',
  keywords: ['geometric mean calculator', 'harmonic mean calculator', 'geometric mean of returns', 'average growth rate', 'average investment return', 'arithmetic vs geometric mean', 'AM GM HM'],
  updated: '2026-11-26',
  inputs: [
    { id: 'mode', label: 'What are you averaging?', type: 'select', default: 'returns', segmented: true, options: [{ value: 'returns', label: 'Returns (%)' }, { value: 'values', label: 'Positive numbers' }], info: 'Choose returns for percentage changes per period (growth rates, yearly returns). Choose positive numbers for a plain list of values.' },
    { id: 'data', label: 'Values', type: 'list', default: '10, -20, 30', placeholder: 'Numbers separated by commas, spaces or new lines', info: 'Returns mode: one percentage per period, such as 10, -20, 30 for +10%, -20%, +30%. Numbers mode: positive values only, such as 2, 8.' },
  ],
  outputs: [
    { id: 'gReturn', label: 'Average return per period (geometric)', format: 'percent', precision: 4, primary: true, showWhen: { input: 'mode', is: 'returns' }, info: 'The single steady rate per period that would give the same final result as your actual returns.' },
    { id: 'aReturn', label: 'Simple average return (arithmetic)', format: 'percent', precision: 4, showWhen: { input: 'mode', is: 'returns' }, info: 'The returns added and divided by the count. It overstates growth when returns vary.' },
    { id: 'total', label: 'Total growth', format: 'percent', precision: 4, showWhen: { input: 'mode', is: 'returns' }, info: 'The combined effect of all periods: the product of the growth factors, minus 1.' },
    { id: 'factor', label: 'Growth factor per period', format: 'number', precision: 6, showWhen: { input: 'mode', is: 'returns' }, info: 'The geometric mean of the growth factors (1 + return). Multiply by this each period to get the same total.' },
    { id: 'gm', label: 'Geometric mean', format: 'number', precision: 6, primary: true, showWhen: { input: 'mode', is: 'values' }, info: 'The nth root of the product of the n values.' },
    { id: 'hm', label: 'Harmonic mean', format: 'number', precision: 6, showWhen: { input: 'mode', is: 'values' }, info: 'The count divided by the sum of the reciprocals. Right for averaging rates over equal distances.' },
    { id: 'am', label: 'Arithmetic mean', format: 'number', precision: 6, showWhen: { input: 'mode', is: 'values' }, info: 'The ordinary average: the sum divided by the count.' },
    { id: 'count', label: 'Count', format: 'integer', info: 'How many numbers were used.' },
  ],
  compute: (v) => {
    const xs = nums(v.data);
    const n = xs.length;
    if (n < 2) return { count: n, note: 'Enter at least two numbers, separated by commas, spaces or new lines.' };

    if (v.mode === 'values') {
      if (xs.some((x) => x <= 0)) return { error: 'Geometric and harmonic means need every value to be greater than 0. Remove zero and negative numbers, or switch to Returns mode for percentages.' };
      const gm = Math.exp(sum(xs.map(Math.log)) / n);
      const hm = n / sum(xs.map((x) => 1 / x));
      const am = sum(xs) / n;
      return {
        gm, hm, am, count: n,
        tone: 'ok',
        badge: `GM ${fmt(gm, 5)}`,
        chart: {
          type: 'bar',
          title: 'Harmonic ≤ geometric ≤ arithmetic mean',
          categories: ['Harmonic', 'Geometric', 'Arithmetic'],
          series: [{ name: 'Mean', values: [hm, gm, am] }],
          format: { format: 'number' },
          highlight: 1,
        },
        steps: [
          `Geometric mean = (product of the ${n} values)^(1/${n}) = ${fmt(gm)}`,
          `Harmonic mean = ${n} ÷ (${xs.slice(0, 8).map((x) => `1/${fmt(x, 5)}`).join(' + ')}${n > 8 ? ' + …' : ''}) = ${fmt(hm)}`,
          `Arithmetic mean = sum ÷ count = ${fmt(sum(xs))} ÷ ${n} = ${fmt(am)}`,
        ],
      };
    }

    // Returns mode: growth factor = 1 + r/100
    const bad = xs.findIndex((x) => x <= -100);
    if (bad >= 0) return { error: `A return of ${fmt(xs[bad])}% or lower means the whole investment is gone, so there is nothing left to compound. Every return must be above -100%.` };
    const factors = xs.map((x) => 1 + x / 100);
    const totalFactor = factors.reduce((a, b) => a * b, 1);
    const g = Math.exp(sum(factors.map(Math.log)) / n);
    const a = sum(xs) / n / 100;
    const gap = a - (g - 1);
    return {
      gReturn: g - 1,
      aReturn: a,
      total: totalFactor - 1,
      factor: g,
      count: n,
      tone: g - 1 >= 0 ? 'good' : 'warn',
      badge: `${pct(g - 1)} per period`,
      note: gap > 1e-9 ? `The simple average overstates growth by ${fmt(gap * 100, 4)} percentage points per period.` : 'Steady returns: the simple and geometric averages match.',
      chart: {
        type: 'bar',
        title: 'Average return per period (%)',
        categories: ['Simple average', 'Geometric (true)'],
        series: [{ name: 'Return', values: [a * 100, (g - 1) * 100] }],
        format: { format: 'number', suffix: '%' },
        highlight: 1,
      },
      steps: [
        `Growth factors (1 + return): ${factors.slice(0, 10).map((f) => fmt(f, 6)).join(' × ')}${n > 10 ? ' × …' : ''} = ${fmt(totalFactor)}`,
        `Geometric mean factor = ${fmt(totalFactor)}^(1/${n}) = ${fmt(g)}`,
        `Average return = ${fmt(g)} − 1 = ${pct(g - 1)} per period`,
        `Simple average = ${fmt(sum(xs))}% ÷ ${n} = ${pct(a)}`,
      ],
    };
  },
  content: {
    formula: ['Geometric mean = (x₁ × x₂ × … × xₙ)^(1/n)', 'Harmonic mean = n ÷ (1/x₁ + 1/x₂ + … + 1/xₙ)', 'Average return = ((1 + r₁)(1 + r₂)…(1 + rₙ))^(1/n) − 1'],
    body: [
      'Returns that compound should be averaged with the geometric mean. Take +10%, -20% and +30%. The simple average is 6.67%, which sounds fine. But $1,000 becomes $1,100, then $880, then $1,144, a total gain of 14.4%. The steady rate that gives 14.4% over three periods is (1.1 × 0.8 × 1.3)^(1/3) − 1, about 4.59% per period.',
      'The geometric mean multiplies the values and takes the nth root. It suits anything that grows by a factor: investment returns, population growth, inflation. The harmonic mean divides the count by the sum of reciprocals. It suits rates over equal distances or equal amounts, like speeds on a round trip, or price-to-earnings ratios.',
      'For positive numbers that are not all equal, the three always rank harmonic < geometric < arithmetic. The more the values vary, the wider the gaps. All three need positive values, because logarithms and reciprocals of zero or negative numbers are undefined.',
    ],
    sections: [
      {
        heading: 'Geometric mean vs arithmetic mean for returns',
        paragraphs: [
          'The arithmetic mean answers "what is the typical return in any one year", but not "what did I earn". Volatility drags the compounded result below it. A loss of 50% needs a gain of 100% to recover, so big swings cost more than the simple average shows.',
          'This calculator converts each percentage to a growth factor (1 + return), multiplies them, takes the root and converts back. Returns of -100% or worse are rejected, since the investment would be wiped out. The result ignores fees, taxes and cash flows in or out.',
        ],
      },
    ],
    faq: [
      { q: 'What is the average of +10%, -20% and +30%?', a: 'The geometric average is (1.1 × 0.8 × 1.3)^(1/3) − 1 = 1.144^(1/3) − 1, about 4.59% per period. The simple average is 6.67%. Starting from $1,000 you end at $1,144, a total gain of 14.4%.' },
      { q: 'What is the geometric mean of 2 and 8?', a: 'Multiply to get 16 and take the square root: 4. In Positive numbers mode, 2 and 8 also give a harmonic mean of 3.2 and an arithmetic mean of 5.' },
      { q: 'What is the harmonic mean of 1, 2 and 4?', a: 'The reciprocals add to 1 + 0.5 + 0.25 = 1.75, so the harmonic mean is 3 ÷ 1.75, about 1.7143. The geometric mean is 2 and the arithmetic mean is about 2.3333.' },
      { q: 'Why does the calculator reject zero or negative numbers?', a: 'The geometric mean needs the product to have a real root and the harmonic mean divides by each value. In Positive numbers mode every value must be above 0. For percentage changes use Returns mode, which accepts negative returns down to just above -100%.' },
      { q: 'When should I use the harmonic mean?', a: 'When averaging rates over equal distances or amounts. Driving a leg at 60 mph and the same distance at 30 mph averages 2 ÷ (1/60 + 1/30) = 40 mph, not 45.' },
      { q: 'Does this include fees, taxes or deposits?', a: 'No. It averages the returns you type in, one per period of equal length. Cash flowing in or out changes the answer and needs a money-weighted measure.' },
    ],
    sources: [
      { label: 'Geometric mean (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Geometric_mean' },
      { label: 'Harmonic mean (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Harmonic_mean' },
      { label: 'Inequality of arithmetic and geometric means (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Inequality_of_arithmetic_and_geometric_means' },
    ],
  },
  related: ['mean-median-mode', 'weighted-mean', 'average-speed-two-legs', 'cagr-calculator', 'loss-recovery'],
  examples: [
    // Factors 1.1 x 0.8 x 1.3 = 1.144; cube root = 1.045864 -> 4.5864%; simple (10-20+30)/3 = 6.6667%; total 14.4%
    { values: { mode: 'returns', data: [10, -20, 30] }, expect: { gReturn: 0.0458643, aReturn: 0.0666667, total: 0.144, factor: 1.0458643, count: 3 }, tolerance: 1e-5 },
    // 2 and 8: GM sqrt(16) = 4; HM 2 / (1/2 + 1/8) = 2 / 0.625 = 3.2; AM 5
    { values: { mode: 'values', data: [2, 8] }, expect: { gm: 4, hm: 3.2, am: 5, count: 2 } },
    // 1, 2, 4: GM (8)^(1/3) = 2; HM 3 / 1.75 = 1.7142857; AM 7/3 = 2.3333333
    { values: { mode: 'values', data: [1, 2, 4] }, expect: { gm: 2, hm: 1.7142857, am: 2.3333333 }, tolerance: 1e-6 },
    // Zero is rejected
    { values: { mode: 'values', data: [4, 0, 9] }, expect: { error: 'Geometric and harmonic means need every value to be greater than 0. Remove zero and negative numbers, or switch to Returns mode for percentages.' } },
  ],
});
