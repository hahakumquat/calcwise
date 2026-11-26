import { defineCalculator } from '../../lib/types';
import { fmt, nums } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'moving-average',
  title: 'Moving Average Calculator',
  category: 'statistics',
  description: 'Paste a series of numbers, pick a window, and get the simple moving average. See the smoothed trend on a chart, with the working shown.',
  keywords: ['moving average calculator', 'simple moving average calculator', 'sma calculator', 'rolling average calculator', 'how to calculate moving average', '7 day moving average'],
  inputs: [
    { id: 'series', label: 'Data series', type: 'list', default: '10, 12, 14, 13, 15, 17, 16', placeholder: 'Numbers in order, separated by commas, spaces or new lines', help: 'Oldest first, newest last. One number per day, week or reading.', info: 'The numbers you want to smooth, such as daily weigh-ins, spending or step counts.' },
    { id: 'window', label: 'Window size', type: 'number', default: 3, min: 2, max: 365, step: 1, info: 'How many consecutive values go into each average. Use 7 to smooth daily data into a weekly trend.' },
  ],
  outputs: [
    { id: 'latest', label: 'Latest moving average', format: 'number', precision: 4, primary: true, info: 'The average of the last window-size values in your series.' },
    { id: 'change', label: 'Change since first average', format: 'number', precision: 4, info: 'Latest moving average minus the first one. Positive means the smoothed trend went up.' },
    { id: 'first', label: 'First moving average', format: 'number', precision: 4, info: 'The average of the first window-size values.' },
    { id: 'highest', label: 'Highest moving average', format: 'number', precision: 4, info: 'The largest of all the moving averages.' },
    { id: 'lowest', label: 'Lowest moving average', format: 'number', precision: 4, info: 'The smallest of all the moving averages.' },
    { id: 'count', label: 'Averages calculated', format: 'integer', info: 'The number of values in the series minus the window size plus 1.' },
  ],
  compute: (v) => {
    const xs = nums(v.series);
    const w = Math.round(Number(v.window));
    if (!xs.length || !Number.isFinite(w)) return { latest: null };
    if (w < 2) return { latest: null, error: 'The window size must be at least 2.' };
    if (w > xs.length) return { latest: null, error: `The window is ${w} but you entered only ${xs.length} values. Add more values or use a smaller window.` };
    const mas: number[] = [];
    for (let i = 0; i + w <= xs.length; i++) {
      let s = 0;
      for (let j = i; j < i + w; j++) s += xs[j];
      mas.push(s / w);
    }
    const latest = mas[mas.length - 1];
    const first = mas[0];
    const prev = mas.length > 1 ? mas[mas.length - 2] : null;
    const diff = prev === null ? 0 : latest - prev;
    const eps = 1e-9 * Math.max(1, Math.abs(latest));
    const dir = Math.abs(diff) <= eps ? 'flat' : diff > 0 ? 'rising' : 'falling';
    const last = xs.slice(-w);
    const idx = xs.map((_, i) => i + 1);
    return {
      latest,
      change: latest - first,
      first,
      highest: Math.max(...mas),
      lowest: Math.min(...mas),
      count: mas.length,
      tone: 'ok',
      badge: prev === null ? 'One average' : `Trend ${dir}`,
      note: prev === null ? 'Add more values to see how the average moves.' : dir === 'flat' ? 'The latest average is unchanged from the one before it.' : `The latest average is ${fmt(Math.abs(diff))} ${diff > 0 ? 'above' : 'below'} the one before it.`,
      chart: {
        type: 'line',
        title: `${w}-point moving average vs raw data`,
        x: idx,
        xLabel: 'Position in series',
        series: [
          { name: 'Raw values', values: xs },
          { name: `${w}-point average`, values: xs.map((_, i) => (i >= w - 1 ? mas[i - w + 1] : null)) },
        ],
      },
      steps: [
        `Window = ${w}, so each average uses ${w} consecutive values and there are ${xs.length} − ${w} + 1 = ${mas.length} of them.`,
        `Latest average = (${last.map((x) => fmt(x)).join(' + ')}) ÷ ${w} = ${fmt(latest)}`,
      ],
    };
  },
  content: {
    formula: ['Moving average at point t = (x(t) + x(t−1) + … + x(t−n+1)) ÷ n', 'n = window size'],
    body: [
      'A simple moving average replaces each value with the average of the last few values. It smooths out day-to-day noise so a trend is easier to see, which is why it is popular for body weight, spending, step counts and sales.',
      'Take the series 10, 12, 14, 13, 15, 17, 16 with a window of 3. The first average is (10 + 12 + 14) ÷ 3 = 12. Slide one place along: (12 + 14 + 13) ÷ 3 = 13, then 14, 15 and finally (15 + 17 + 16) ÷ 3 = 16. Seven values and a window of 3 give 7 − 3 + 1 = 5 averages, rising from 12 to 16.',
      'A bigger window gives a smoother line but reacts more slowly to real changes. The first average needs a full window of values, so the average line starts later than your raw data.',
    ],
    faq: [
      { q: 'How do you calculate a simple moving average?', a: 'Add up the last n values and divide by n, then slide forward one value and repeat. For 10, 12, 14 with a window of 3 the average is 36 ÷ 3 = 12.' },
      { q: 'How many moving averages will I get?', a: 'The number of values minus the window size plus 1. With 7 values and a window of 3 you get 5 averages.' },
      { q: 'What window size should I use?', a: 'Match the cycle in your data. Use 7 for daily data with a weekly pattern. A larger window is smoother but slower to show a real change.' },
      { q: 'Why does the average line start later than my data?', a: 'Each average needs a full window of values, so the first one appears at the position equal to the window size.' },
    ],
    sources: [{ label: 'NIST Engineering Statistics Handbook: Single Moving Average', url: 'https://www.itl.nist.gov/div898/handbook/pmc/section4/pmc42.htm' }],
  },
  related: ['mean-median-mode', 'weight-change-rate', 'standard-deviation'],
  examples: [
    // Windows of 3: 36/3=12, 39/3=13, 42/3=14, 45/3=15, 48/3=16. Count 7-3+1=5. Change 16-12=4.
    { values: { series: [10, 12, 14, 13, 15, 17, 16], window: 3 }, expect: { latest: 16, first: 12, change: 4, highest: 16, lowest: 12, count: 5 }, tolerance: 1e-9 },
    // Window 2: (4+8)/2=6, (8+6)/2=7
    { values: { series: [4, 8, 6], window: 2 }, expect: { latest: 7, first: 6, count: 2 }, tolerance: 1e-9 },
  ],
});
