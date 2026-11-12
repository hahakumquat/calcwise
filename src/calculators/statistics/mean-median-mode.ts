import { defineCalculator } from '../../lib/types';
import { sum, mean, median } from '../../lib/math';
import { fmt, nums, histogram } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'mean-median-mode',
  title: 'Mean, Median, Mode Calculator',
  category: 'statistics',
  description: 'Find the mean, median, mode and range of a list of numbers, plus the min, max, sum and count.',
  keywords: ['average', 'mean', 'median', 'mode', 'range', 'central tendency', 'average calculator'],
  inputs: [{ id: 'data', info: 'Your list of numbers, separated by commas, spaces or new lines.', label: 'Data set', type: 'list', default: '3, 7, 8, 5, 12, 14, 21, 13, 18, 7', placeholder: 'Numbers separated by commas, spaces or new lines' }],
  outputs: [
    { id: 'mean', info: 'The ordinary average: add all the values and divide by how many there are.', label: 'Mean (average)', primary: true, precision: 6 },
    { id: 'median', info: 'The middle value once the numbers are sorted. Half the data are below it and half above.', label: 'Median', precision: 6 },
    { id: 'mode', info: 'The value (or values) that appear most often.', label: 'Mode', format: 'text' },
    { id: 'range', info: 'The largest value minus the smallest — a quick measure of spread.', label: 'Range', precision: 6 },
    { id: 'min', info: 'The smallest value in the list.', label: 'Minimum', precision: 6 },
    { id: 'max', info: 'The largest value in the list.', label: 'Maximum', precision: 6 },
    { id: 'sum', info: 'All the values added together.', label: 'Sum', precision: 6 },
    { id: 'count', info: 'How many numbers are in the list.', label: 'Count', format: 'integer' },
  ],
  compute: (v) => {
    const xs = nums(v.data);
    const n = xs.length;
    if (!n) return { mean: null };
    const sorted = [...xs].sort((a, b) => a - b);
    const total = sum(xs);
    const m = mean(xs);
    const med = median(xs);
    const freq = new Map<number, number>();
    for (const x of xs) freq.set(x, (freq.get(x) ?? 0) + 1);
    const top = Math.max(...freq.values());
    const modes = [...freq.entries()].filter(([, f]) => f === top).map(([x]) => x).sort((a, b) => a - b);
    const mode = top === 1 || modes.length === freq.size ? 'No mode' : modes.map((x) => fmt(x)).join(', ');
    const min = sorted[0];
    const max = sorted[n - 1];
    const listed = sorted.length > 20 ? `${sorted.slice(0, 20).map((x) => fmt(x)).join(', ')}, …` : sorted.map((x) => fmt(x)).join(', ');
    const mid = n % 2 ? `the middle (position ${(n + 1) / 2}) value is ${fmt(med)}` : `the two middle values (positions ${n / 2} and ${n / 2 + 1}) are ${fmt(sorted[n / 2 - 1])} and ${fmt(sorted[n / 2])}, so the median is their average ${fmt(med)}`;
    return {
      mean: m,
      median: med,
      mode,
      range: max - min,
      min,
      max,
      sum: total,
      count: n,
      chart: histogram(xs, `Frequency of each value (median ${fmt(med, 5)} highlighted)`, med),
      steps: [
        `Sorted: ${listed}`,
        `Mean = sum ÷ count = ${fmt(total)} ÷ ${n} = ${fmt(m)}`,
        `Median: with n = ${n}, ${mid}`,
        mode === 'No mode' ? 'Mode: no value appears more often than the others' : `Mode: ${mode} appear${modes.length > 1 ? '' : 's'} ${top} times — more than any other value`,
        `Range = max − min = ${fmt(max)} − ${fmt(min)} = ${fmt(max - min)}`,
      ],
    };
  },
  content: {
    formula: ['Mean = (x₁ + x₂ + … + xₙ) ÷ n', 'Median = middle value of the sorted list (average of the two middle values if n is even)', 'Mode = most frequent value', 'Range = maximum − minimum'],
    body: [
      'The mean, median and mode are three ways to describe the “centre” of a data set. The mean is the ordinary average: add everything up and divide by how many values there are. The median is the middle value once the data are sorted. The mode is the value that appears most often.',
      'They can tell different stories. In the list 2, 3, 3, 4, 100, the mean is 22.4 but the median is just 3, because the single large value drags the mean upward. That is why median household income is usually reported instead of mean income — a few very high earners would distort the average.',
      'A data set can have one mode, several modes (bimodal or multimodal), or no mode at all if every value occurs the same number of times. The range — largest minus smallest — is the simplest measure of spread; the standard deviation gives a more complete picture.',
    ],
    faq: [
      { q: 'When should I use the median instead of the mean?', a: 'Use the median when the data are skewed or contain outliers, such as house prices, incomes or reaction times. Use the mean for roughly symmetric data, or when you need the total to matter.' },
      { q: 'How do I find the median of an even number of values?', a: 'Sort the values and take the average of the two in the middle. For 4, 7, 9, 12 the median is (7 + 9) ÷ 2 = 8.' },
    ],
  },
  related: ['standard-deviation', 'z-score', 'correlation'],
  examples: [
    { values: { data: [1, 2, 2, 3, 4, 7, 9] }, expect: { mean: 4, median: 3, mode: '2', range: 8, min: 1, max: 9, sum: 28, count: 7 } },
    { values: { data: [4, 7, 9, 12] }, expect: { median: 8, mode: 'No mode', mean: 8 } },
    { values: { data: [1, 1, 2, 2, 3] }, expect: { mode: '1, 2' } },
  ],
});
