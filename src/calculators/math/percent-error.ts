import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { fmt } from '../../lib/helpers/math-extra';

export default defineCalculator({
  slug: 'percent-error',
  title: 'Percent Error Calculator',
  category: 'math',
  description: 'Compare a measured or estimated value with the true value and get the percent error.',
  keywords: ['percentage error', 'relative error', 'experimental error', 'accuracy', 'lab error'],
  inputs: [
    { id: 'measured', info: 'The value you got from your experiment, measurement or estimate.', label: 'Measured (experimental) value', type: 'number', default: 9.6 },
    { id: 'actual', info: 'The accepted, theoretical or true value you are comparing against.', label: 'True (accepted) value', type: 'number', default: 9.81 },
  ],
  outputs: [
    { id: 'percentError', info: 'How far your measurement is from the true value, as a percentage of the true value. Smaller is better.', label: 'Percent error', format: 'percent', primary: true, precision: 4 },
    { id: 'absError', info: 'The plain size of the miss, in the same units as your values: |measured − true|.', label: 'Absolute error', precision: 6 },
    { id: 'signed', info: 'Like percent error but keeps the sign: negative means your measurement was too low, positive means too high.', label: 'Signed relative error', format: 'percent', precision: 4, help: 'Negative means the measurement was too low' },
  ],
  compute: (v) => {
    const m = num(v.measured);
    const a = num(v.actual);
    if (m === null || a === null) return { percentError: null };
    if (a === 0) return { percentError: null, note: 'Percent error is undefined when the true value is zero.' };
    const absError = Math.abs(m - a);
    const pe = absError / Math.abs(a);
    const signed = (m - a) / Math.abs(a);
    return {
      percentError: pe,
      absError,
      signed,
      chart: { type: 'bar', title: 'Measured vs true value', categories: ['True value', 'Measured'], series: [{ name: 'Value', values: [a, m] }], highlight: 1 },
      steps: [
        `Absolute error = |measured − true| = |${fmt(m)} − ${fmt(a)}| = ${fmt(absError)}`,
        `Relative error = ${fmt(absError)} ÷ |${fmt(a)}| = ${fmt(pe)}`,
        `Percent error = ${fmt(pe)} × 100 = ${fmt(pe * 100, 6)}%`,
      ],
      note: m === a ? 'Perfect match.' : `The measurement is ${m > a ? 'above' : 'below'} the true value.`,
    };
  },
  content: {
    formula: ['Percent error = |measured − true| ÷ |true| × 100'],
    body: [
      'Percent error is how science classes grade an experiment: it shows how far your result landed from the accepted value, as a share of that accepted value. If you measured gravity as 9.6 m/s² and the accepted value is 9.81 m/s², you were off by 0.21, which is about 2.14% of 9.81.',
      'The standard formula uses absolute values, so percent error is never negative. If you need to know whether you overshot or undershot, look at the signed relative error, which keeps the minus sign when the measurement is too low.',
      'A small percent error means your result is accurate, but it doesn’t say whether it is precise. Repeating a measurement and checking the spread (for example with a standard deviation) tells you about precision.',
    ],
    faq: [
      { q: 'What is a good percent error?', a: 'It depends on the experiment. In many school labs, under 5% is considered good and under 1% excellent, but precise physics or chemistry measurements may expect far less.' },
      { q: 'Is percent error the same as percentage change?', a: 'The arithmetic is similar, but percent error always compares against a known true value and is usually reported as a positive number. Percentage change compares an old value to a new one and keeps its sign.' },
    ],
  },
  related: ['percentage-change', 'percentage', 'significant-figures', 'standard-deviation'],
  examples: [
    { values: { measured: 9.5, actual: 10 }, expect: { percentError: 0.05, absError: 0.5, signed: -0.05 } },
    { values: { measured: 9.6, actual: 9.81 }, expect: { percentError: 0.0214067 }, tolerance: 1e-5 },
  ],
});
