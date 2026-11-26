import { defineCalculator } from '../../lib/types';
import { sum, mean } from '../../lib/math';
import { fmt, nums, histogram } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'coefficient-of-variation',
  title: 'Coefficient of Variation Calculator',
  category: 'statistics',
  description: 'Paste a list of numbers to get the coefficient of variation (CV%), the standard deviation as a percentage of the mean, with steps.',
  keywords: ['coefficient of variation', 'cv', 'relative standard deviation', 'rsd', 'variability', 'standard deviation percent of mean'],
  inputs: [
    { id: 'data', info: 'Your list of numbers, separated by commas, spaces or new lines.', label: 'Data set', type: 'list', default: '2, 4, 4, 4, 5, 5, 7, 9', placeholder: 'Numbers separated by commas, spaces or new lines' },
    {
      id: 'kind', info: 'Population if your list is every member of the group; sample if it is drawn from a larger group (the usual case).',
      label: 'Standard deviation type',
      type: 'select',
      default: 'population',
      segmented: true,
      options: [
        { value: 'population', label: 'Population' },
        { value: 'sample', label: 'Sample' },
      ],
    },
  ],
  outputs: [
    { id: 'cv', info: 'Standard deviation divided by the absolute value of the mean. A unitless measure of relative spread.', label: 'Coefficient of variation (CV)', primary: true, format: 'percent', precision: 3 },
    { id: 'mean', info: 'The average of the data.', label: 'Mean', precision: 6 },
    { id: 'sd', info: 'The standard deviation of the data, using the type you chose.', label: 'Standard deviation', precision: 6 },
    { id: 'count', info: 'How many numbers are in the list.', label: 'Count (n)', format: 'integer' },
  ],
  compute: (v) => {
    const xs = nums(v.data);
    const n = xs.length;
    const isSample = v.kind === 'sample';
    if (n === 0) return { cv: null };
    if (isSample && n < 2) return { cv: null, mean: xs[0], count: n, note: 'Sample standard deviation needs at least two values.' };
    const m = mean(xs);
    const ss = sum(xs.map((x) => (x - m) ** 2));
    const div = isSample ? n - 1 : n;
    const sd = Math.sqrt(ss / div);
    const base = {
      mean: m,
      sd,
      count: n,
      chart: histogram(xs, `Distribution of the data (bar with the mean ${fmt(m, 5)} highlighted)`, m),
    };
    if (Math.abs(m) < 1e-12) {
      return { ...base, cv: null, note: 'The mean is 0, so the coefficient of variation is undefined (it divides by the mean).' };
    }
    const cv = sd / Math.abs(m);
    const pct = cv * 100;
    return {
      ...base,
      cv,
      tone: pct < 15 ? 'good' : pct < 30 ? 'ok' : 'warn',
      badge: pct < 15 ? 'Low variability' : pct < 30 ? 'Moderate variability' : 'High variability',
      note: m < 0 ? 'The mean is negative, so the absolute value of the mean is used.' : undefined,
      steps: [
        `n = ${n}, mean = ${fmt(sum(xs))} ÷ ${n} = ${fmt(m)}`,
        `Sum of squares SS = ${fmt(ss)}`,
        `${isSample ? 'Sample' : 'Population'} SD = √(SS ÷ ${isSample ? `(n − 1) = ${fmt(ss)} ÷ ${div}` : `n = ${fmt(ss)} ÷ ${div}`}) = ${fmt(sd)}`,
        `CV = SD ÷ |mean| × 100 = ${fmt(sd)} ÷ ${fmt(Math.abs(m))} × 100 = ${fmt(pct, 6)}%`,
      ],
    };
  },
  content: {
    formula: ['CV = (SD ÷ |mean|) × 100%', 'SD = √( Σ(x − x̄)² ÷ N )  (population)  or  ÷ (n − 1)  (sample)'],
    body: [
      'The coefficient of variation (CV), also called relative standard deviation, expresses the standard deviation as a percentage of the mean. Because it has no units, it lets you compare the spread of data sets measured on different scales, such as the weights of mice and the weights of elephants.',
      'A CV of 40% means the typical deviation from the mean is 40% of the mean’s size. As a loose rule of thumb, under 15% is low variability, 15–30% is moderate and above 30% is high, but acceptable values depend heavily on the field.',
      'CV only makes sense for ratio-scale data with a true zero (lengths, prices, concentrations). It is unreliable when the mean is close to zero and undefined when the mean is exactly zero, which this calculator reports instead of showing an error value.',
    ],
    faq: [
      { q: 'What is the coefficient of variation of 2, 4, 4, 4, 5, 5, 7, 9?', a: 'The mean is 5 and the population standard deviation is 2, so CV = 2 ÷ 5 = 40%. With the sample standard deviation (2.138) it is about 42.8%.' },
      { q: 'Should I use the population or sample standard deviation?', a: 'Use population if your list contains every member of the group, and sample if it is a subset drawn from a larger group. The sample version divides by n − 1, so it gives a slightly larger CV.' },
      { q: 'What happens if the mean is 0 or negative?', a: 'If the mean is exactly 0 the CV is undefined, and the calculator shows a message instead of a number. If the mean is negative, the absolute value of the mean is used so the CV is positive.' },
      { q: 'Is a high CV bad?', a: 'Not necessarily. It simply means the data is spread widely relative to its average. Whether that is a problem depends on context, such as measurement precision in a lab or volatility in an investment.' },
    ],
    sources: [{ label: 'Wikipedia: Coefficient of variation', url: 'https://en.wikipedia.org/wiki/Coefficient_of_variation' }],
  },
  related: ['standard-deviation', 'mean-median-mode', 'z-score', 'quartile-calculator'],
  examples: [
    // mean 40/8 = 5; SS = 9+1+1+1+0+0+4+16 = 32; popSD = sqrt(32/8) = 2; CV = 2/5 = 0.4
    { values: { data: [2, 4, 4, 4, 5, 5, 7, 9], kind: 'population' }, expect: { cv: 0.4, mean: 5, sd: 2, count: 8 }, tolerance: 1e-9 },
    // sample SD = sqrt(32/7) = 2.138089935; CV = 0.427617987
    { values: { data: [2, 4, 4, 4, 5, 5, 7, 9], kind: 'sample' }, expect: { cv: 0.427617987, sd: 2.138089935 }, tolerance: 1e-9 },
    // 8,10,12: mean 10; SS = 8; sample SD = sqrt(8/2) = 2; CV = 0.2
    { values: { data: [8, 10, 12], kind: 'sample' }, expect: { cv: 0.2, mean: 10, sd: 2 }, tolerance: 1e-9 },
  ],
});
