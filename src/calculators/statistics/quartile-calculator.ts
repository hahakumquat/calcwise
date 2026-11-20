import { defineCalculator } from '../../lib/types';
import { median } from '../../lib/math';
import { fmt, nums, histogram } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'quartile-calculator',
  title: 'Quartile Calculator (Q1, Q3, IQR, Outliers)',
  category: 'statistics',
  description: 'Find Q1, the median, Q3, the interquartile range (IQR) and outliers for any list of numbers, with the working shown.',
  metaDescription: 'Free quartile calculator: enter a list of numbers to get Q1, median, Q3, the IQR, outlier fences and any outliers, with every step shown.',
  keywords: ['quartile calculator', 'iqr calculator', 'interquartile range', 'q1 q3', 'outlier calculator', 'five number summary', 'box plot'],
  inputs: [{ id: 'data', info: 'Your list of numbers (at least 4), separated by commas, spaces or new lines.', label: 'Data set', type: 'list', default: '2, 4, 4, 5, 6, 7, 8, 30', placeholder: 'Numbers separated by commas, spaces or new lines' }],
  outputs: [
    { id: 'q1', info: 'First quartile: the median of the lower half. About 25% of the values sit at or below it.', label: 'Q1 (lower quartile)', precision: 6 },
    { id: 'q2', info: 'The median of the whole list (second quartile).', label: 'Q2 (median)', precision: 6 },
    { id: 'q3', info: 'Third quartile: the median of the upper half. About 75% of the values sit at or below it.', label: 'Q3 (upper quartile)', precision: 6 },
    { id: 'iqr', info: 'Interquartile range, Q3 minus Q1: the spread of the middle half of the data.', label: 'IQR', primary: true, precision: 6 },
    { id: 'lower', info: 'Q1 minus 1.5 × IQR. Values below this are flagged as outliers.', label: 'Lower fence', precision: 6 },
    { id: 'upper', info: 'Q3 plus 1.5 × IQR. Values above this are flagged as outliers.', label: 'Upper fence', precision: 6 },
    { id: 'outliers', info: 'Values outside the two fences, using the 1.5 × IQR rule.', label: 'Outliers', format: 'text' },
    { id: 'min', info: 'The smallest value in the list.', label: 'Minimum', precision: 6 },
    { id: 'max', info: 'The largest value in the list.', label: 'Maximum', precision: 6 },
    { id: 'count', info: 'How many numbers are in the list.', label: 'Count', format: 'integer' },
  ],
  compute: (v) => {
    const xs = nums(v.data);
    const n = xs.length;
    if (n < 4) return { iqr: null, error: 'Enter at least 4 numbers to find quartiles.' };
    const s = [...xs].sort((a, b) => a - b);
    const half = Math.floor(n / 2);
    const lowerHalf = s.slice(0, half);
    const upperHalf = s.slice(n - half);
    const q1 = median(lowerHalf);
    const q2 = median(s);
    const q3 = median(upperHalf);
    const iqr = q3 - q1;
    const lo = q1 - 1.5 * iqr;
    const hi = q3 + 1.5 * iqr;
    const out = s.filter((x) => x < lo || x > hi);
    const list = (a: number[]) => a.map((x) => fmt(x)).join(', ');
    const sortedText = n > 20 ? `${list(s.slice(0, 20))}, …` : list(s);
    return {
      q1,
      q2,
      q3,
      iqr,
      lower: lo,
      upper: hi,
      outliers: out.length ? list(out) : 'None',
      min: s[0],
      max: s[n - 1],
      count: n,
      tone: out.length ? 'warn' : 'good',
      badge: out.length ? `${out.length} outlier${out.length > 1 ? 's' : ''}` : 'No outliers',
      note: out.length ? `Outside the fences: ${list(out)}` : 'No values fall outside the 1.5 × IQR fences',
      chart: histogram(xs, `Frequency of each value (median ${fmt(q2, 5)} highlighted)`, q2),
      steps: [
        `Sorted: ${sortedText}`,
        `Median (Q2) of all ${n} values = ${fmt(q2)}${n % 2 ? ` (the middle value, which is left out of both halves)` : ''}`,
        `Lower half: ${list(lowerHalf.slice(0, 20))}${half > 20 ? ', …' : ''}, so Q1 = ${fmt(q1)}`,
        `Upper half: ${list(upperHalf.slice(0, 20))}${half > 20 ? ', …' : ''}, so Q3 = ${fmt(q3)}`,
        `IQR = Q3 − Q1 = ${fmt(q3)} − ${fmt(q1)} = ${fmt(iqr)}`,
        `Fences: ${fmt(q1)} − 1.5 × ${fmt(iqr)} = ${fmt(lo)} and ${fmt(q3)} + 1.5 × ${fmt(iqr)} = ${fmt(hi)}`,
      ],
    };
  },
  content: {
    formula: ['Q2 = median of the sorted list', 'Q1 = median of the lower half; Q3 = median of the upper half (the middle value is left out of both halves when n is odd)', 'IQR = Q3 − Q1', 'Outlier fences: Q1 − 1.5 × IQR and Q3 + 1.5 × IQR'],
    body: [
      'Quartiles split a sorted data set into four parts with roughly equal counts. Q1 is the value a quarter of the way up, Q2 is the median, and Q3 is three quarters of the way up. The interquartile range (IQR) is Q3 minus Q1, so it measures how spread out the middle half of the data is, and a few extreme values barely change it.',
      'Method used here: sort the list, take the median as Q2, then take Q1 as the median of the lower half and Q3 as the median of the upper half. When the number of values is odd, the middle value is excluded from both halves. This is the common textbook method (sometimes called the Tukey or “median of halves” method).',
      'Other methods exist. Excel’s QUARTILE.INC, QUARTILE.EXC, R’s default and many calculators interpolate between values, so they can give slightly different quartiles for small data sets. If your course or software specifies a method, check that it matches before comparing answers.',
    ],
    sections: [
      {
        heading: 'Finding outliers with the 1.5 × IQR rule',
        paragraphs: ['A common rule flags any value below Q1 − 1.5 × IQR or above Q3 + 1.5 × IQR as an outlier. For 2, 4, 4, 5, 6, 7, 8, 30 the quartiles are Q1 = 4 and Q3 = 7.5, so IQR = 3.5 and the fences are −1.25 and 12.75. The value 30 is above the upper fence, so it is an outlier. An outlier is a prompt to look closer, not proof the value is wrong.'],
      },
    ],
    faq: [
      { q: 'How do I calculate Q1 and Q3?', a: 'Sort the data, find the median, then take the median of the lower half for Q1 and the median of the upper half for Q3. For 2, 4, 4, 5, 6, 7, 8, 30 the lower half is 2, 4, 4, 5 (Q1 = 4) and the upper half is 6, 7, 8, 30 (Q3 = 7.5).' },
      { q: 'What is the IQR?', a: 'The interquartile range is Q3 minus Q1. For 2, 4, 4, 5, 6, 7, 8, 30 it is 7.5 − 4 = 3.5. It describes the spread of the middle 50% of the data.' },
      { q: 'What happens when I have an odd number of values?', a: 'The median is the middle value and it is left out of both halves. For 1 to 7 the median is 4, the lower half is 1, 2, 3 (Q1 = 2) and the upper half is 5, 6, 7 (Q3 = 6), so the IQR is 4.' },
      { q: 'Why does Excel give a different answer?', a: 'Excel and other software use interpolation methods (QUARTILE.INC, QUARTILE.EXC) that can differ from the median-of-halves method used here, especially for small data sets.' },
    ],
    sources: [
      { label: 'NIST/SEMATECH e-Handbook of Statistical Methods: Quartiles and box plots', url: 'https://www.itl.nist.gov/div898/handbook/prc/section1/prc16.htm' },
    ],
  },
  related: ['mean-median-mode', 'standard-deviation', 'z-score'],
  examples: [
    // Lower half 2,4,4,5 -> Q1 = (4+4)/2 = 4; upper half 6,7,8,30 -> Q3 = (7+8)/2 = 7.5; Q2 = (5+6)/2 = 5.5; IQR 3.5; fences 4-5.25 = -1.25, 7.5+5.25 = 12.75
    { values: { data: [2, 4, 4, 5, 6, 7, 8, 30] }, expect: { q1: 4, q2: 5.5, q3: 7.5, iqr: 3.5, lower: -1.25, upper: 12.75, outliers: '30', count: 8 } },
    // Odd n: median 4 excluded; lower 1,2,3 -> 2; upper 5,6,7 -> 6; IQR 4; fences -4 and 12
    { values: { data: [1, 2, 3, 4, 5, 6, 7] }, expect: { q1: 2, q2: 4, q3: 6, iqr: 4, lower: -4, upper: 12, outliers: 'None' } },
    // n=6: lower 7,15,36 -> 15; upper 39,40,41 -> 40; Q2 = (36+39)/2 = 37.5; IQR 25; fences -22.5 and 77.5
    { values: { data: [7, 15, 36, 39, 40, 41] }, expect: { q1: 15, q2: 37.5, q3: 40, iqr: 25, lower: -22.5, upper: 77.5 } },
  ],
});
