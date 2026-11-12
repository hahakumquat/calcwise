import { defineCalculator } from '../../lib/types';
import { sum, mean } from '../../lib/math';
import { fmt, nums, histogram } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'standard-deviation',
  title: 'Standard Deviation Calculator',
  category: 'statistics',
  description: 'Paste a list of numbers to get the sample and population standard deviation, variance and mean, with steps.',
  keywords: ['std dev', 'sample standard deviation', 'population standard deviation', 'variance', 'sigma', 'spread'],
  popular: true,
  inputs: [{ id: 'data', info: 'Your list of numbers, separated by commas, spaces or new lines.', label: 'Data set', type: 'list', default: '2, 4, 4, 4, 5, 5, 7, 9', placeholder: 'Numbers separated by commas, spaces or new lines' }],
  outputs: [
    { id: 'sampleSd', info: 'Spread of the data when your list is a sample from a bigger group (divides by n − 1). This is the usual choice.', label: 'Sample standard deviation (s)', primary: true, precision: 6 },
    { id: 'popSd', info: 'Spread of the data when your list is the entire population (divides by n).', label: 'Population standard deviation (σ)', precision: 6 },
    { id: 'sampleVar', info: 'The sample standard deviation squared.', label: 'Sample variance (s²)', precision: 6 },
    { id: 'popVar', info: 'The population standard deviation squared.', label: 'Population variance (σ²)', precision: 6 },
    { id: 'mean', info: 'The average of the data — the centre the spread is measured from.', label: 'Mean', precision: 6 },
    { id: 'count', info: 'How many numbers are in the list.', label: 'Count (n)', format: 'integer' },
    { id: 'sem', info: 'Standard error of the mean: how precisely the sample mean estimates the population mean.', label: 'Standard error of the mean', precision: 6 },
  ],
  compute: (v) => {
    const xs = nums(v.data);
    const n = xs.length;
    if (n === 0) return { sampleSd: null };
    const m = mean(xs);
    const devs = xs.map((x) => (x - m) ** 2);
    const ss = sum(devs);
    const popVar = ss / n;
    const sampleVar = n > 1 ? ss / (n - 1) : null;
    const sampleSd = sampleVar === null ? null : Math.sqrt(sampleVar);
    const shown = xs.slice(0, 8);
    const more = n > 8 ? ' + …' : '';
    const steps = [
      `n = ${n}, mean x̄ = ${fmt(sum(xs))} ÷ ${n} = ${fmt(m)}`,
      `Squared deviations (x − x̄)²: ${shown.map((x) => `(${fmt(x)} − ${fmt(m)})²`).join(' + ')}${more}`,
      `Sum of squares SS = ${fmt(ss)}`,
      `Population variance σ² = SS ÷ n = ${fmt(ss)} ÷ ${n} = ${fmt(popVar)} → σ = ${fmt(Math.sqrt(popVar))}`,
    ];
    if (sampleVar !== null) steps.push(`Sample variance s² = SS ÷ (n − 1) = ${fmt(ss)} ÷ ${n - 1} = ${fmt(sampleVar)} → s = ${fmt(sampleSd!)}`);
    return {
      sampleSd,
      popSd: Math.sqrt(popVar),
      sampleVar,
      popVar,
      mean: m,
      count: n,
      chart: histogram(xs, `Distribution of the data (bar with the mean ${fmt(m, 5)} highlighted)`, m),
      sem: sampleSd === null ? null : sampleSd / Math.sqrt(n),
      steps,
      note: n === 1 ? 'Sample standard deviation needs at least two values.' : undefined,
    };
  },
  content: {
    formula: ['s = √( Σ(x − x̄)² ÷ (n − 1) )   (sample)', 'σ = √( Σ(x − μ)² ÷ N )   (population)', 'SE = s ÷ √n'],
    body: [
      'Standard deviation measures how spread out numbers are around their mean. A small standard deviation means the values cluster tightly; a large one means they are scattered. It is in the same units as the data, which makes it easier to interpret than the variance (its square).',
      'To compute it, find the mean, subtract it from every value, square those deviations so negatives don’t cancel positives, add them up, divide, and take the square root. The only difference between the two versions is the divisor.',
      'Use the population formula (divide by N) when your list contains every member of the group you care about. Use the sample formula (divide by n − 1) when your data is a sample drawn from a larger population — which is the usual case in science and surveys. Dividing by n − 1, known as Bessel’s correction, makes up for the fact that a sample tends to sit closer to its own mean than to the true population mean.',
    ],
    faq: [
      { q: 'Which one does my calculator or spreadsheet give?', a: 'In Excel and Google Sheets, STDEV.S (or STDEV) is the sample version and STDEV.P is the population version. On TI calculators, Sx is sample and σx is population.' },
      { q: 'What is the 68-95-99.7 rule?', a: 'For roughly normal data, about 68% of values fall within one standard deviation of the mean, 95% within two, and 99.7% within three.' },
      { q: 'What is the standard error?', a: 'The standard error of the mean, s ÷ √n, estimates how much the sample mean itself varies between samples. It shrinks as the sample grows, while the standard deviation of the data does not.' },
    ],
  },
  related: ['mean-median-mode', 'z-score', 'confidence-interval', 'normal-distribution'],
  examples: [
    { values: { data: [2, 4, 4, 4, 5, 5, 7, 9] }, expect: { popSd: 2, sampleSd: 2.138089935, mean: 5, popVar: 4, sampleVar: 4.571428571, count: 8 }, tolerance: 1e-9 },
    { values: { data: [10, 12, 23, 23, 16, 23, 21, 16] }, expect: { sampleSd: 5.237229366, popSd: 4.898979486 }, tolerance: 1e-9 },
  ],
});
