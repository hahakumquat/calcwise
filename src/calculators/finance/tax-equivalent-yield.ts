import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'tax-equivalent-yield',
  title: 'Tax-Equivalent Yield Calculator',
  seoTitle: 'Tax-Equivalent Yield Calculator',
  metaDescription: 'Compare a tax-free bond yield with a taxable one. See the taxable yield you need to match it, and which option keeps more after tax at your rate.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Convert a tax-free yield into the taxable yield that would match it after tax, and compare it with a taxable yield you are considering.',
  keywords: ['tax equivalent yield calculator', 'taxable equivalent yield', 'municipal bond vs taxable bond', 'tax free yield comparison', 'after tax yield calculator'],
  popular: false,
  inputs: [
    { id: 'taxfree', label: 'Tax-free yield', type: 'number', suffix: '%', default: 3.5, min: 0, max: 100, step: 0.05, info: 'The yield on the tax-free option, such as a municipal bond fund.' },
    { id: 'taxable', label: 'Taxable yield', type: 'number', suffix: '%', default: 4.2, min: 0, max: 100, step: 0.05, info: 'The yield on the taxable option you are comparing it with.' },
    { id: 'rate', label: 'Your tax rate on the taxable yield', type: 'number', suffix: '%', default: 24, min: 0, max: 99, step: 1, info: 'Your own estimate of the combined rate you would pay on this interest. Include state tax only if it applies; the calculator does not look anything up.' },
  ],
  outputs: [
    { id: 'equiv', label: 'Taxable yield needed to match', format: 'number', precision: 3, suffix: '%', primary: true, info: 'Tax-free yield ÷ (1 - tax rate).' },
    { id: 'aftertax', label: 'Taxable yield after tax', format: 'number', precision: 3, suffix: '%', info: 'Taxable yield × (1 - tax rate).' },
    { id: 'gap', label: 'Tax-free minus taxable after tax', format: 'number', precision: 3, suffix: ' pts', info: 'Positive means the tax-free option keeps more.' },
    { id: 'breakeven', label: 'Break-even tax rate', format: 'number', precision: 2, suffix: '%', info: 'The tax rate at which both options keep the same: 1 - tax-free ÷ taxable.' },
  ],
  compute: (v) => {
    const tf = num(v.taxfree), tx = num(v.taxable), r = num(v.rate);
    if (tf === null || tx === null || r === null) return { equiv: null };
    if (tf < 0 || tx < 0 || r < 0) return { equiv: null, error: 'Yields and tax rate cannot be negative.' };
    if (r >= 100) return { equiv: null, error: 'The tax rate must be below 100%.' };
    const k = 1 - r / 100;
    const equiv = tf / k;
    const after = tx * k;
    const gap = tf - after;
    const be = tx > 0 ? (1 - tf / tx) * 100 : null;
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Yield you keep after tax (%)',
      categories: ['Tax-free', 'Taxable'],
      series: [{ name: 'After tax', values: [tf, after] }],
      format: { format: 'number', suffix: '%' },
    };
    const win = Math.abs(gap) < 1e-9 ? 'Both keep the same' : gap > 0 ? 'Tax-free keeps more' : 'Taxable keeps more';
    return {
      equiv, aftertax: after, gap, breakeven: be,
      tone: 'ok',
      badge: win,
      chart,
      steps: [
        `Keep factor = 1 - ${r}% = ${+k.toFixed(4)}`,
        `Taxable equivalent = ${tf}% ÷ ${+k.toFixed(4)} = ${+equiv.toFixed(3)}%`,
        `Taxable after tax = ${tx}% × ${+k.toFixed(4)} = ${+after.toFixed(3)}%`,
      ],
      note: 'This compares yields only. It ignores credit risk, fees, duration, the alternative minimum tax and changes in your bracket. It is arithmetic, not advice.',
    };
  },
  content: {
    formula: [
      'Taxable-equivalent yield = tax-free yield ÷ (1 - tax rate)',
      'After-tax yield = taxable yield × (1 - tax rate)',
      'Break-even tax rate = 1 - tax-free yield ÷ taxable yield',
    ],
    body: [
      'Interest from some bonds, such as many municipal bonds, is free of federal income tax, while interest from a regular bond or savings account is taxed. A lower tax-free yield can still leave you with more money than a higher taxable one, and the higher your tax rate, the more that is true.',
      'Enter the tax-free yield, a taxable yield to compare, and your own estimate of the tax rate on the taxable interest. The calculator shows the taxable yield you would need to match the tax-free one, what the taxable option leaves after tax, and the break-even rate where the two tie.',
      'The rate is an input, so use whatever fits your situation, including state tax if it applies. This page compares yields only and gives no investment or tax advice.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A tax-free yield of 3.5% at a 24% tax rate is worth 3.5 ÷ 0.76 = 4.605% taxable. A taxable yield of 4.2% leaves 4.2 × 0.76 = 3.192% after tax, so the tax-free 3.5% wins by about 0.31 points. The break-even rate is 1 - 3.5 ÷ 4.2 = 16.67%: below that rate, the taxable option keeps more.',
        ],
      },
      {
        heading: 'Related tools',
        paragraphs: [
          'The bond yield calculator works out the yield on a bond, and the investment calculator projects growth over time.',
        ],
      },
    ],
    faq: [
      { q: 'How do I calculate tax-equivalent yield?', a: 'Divide the tax-free yield by one minus your tax rate. For 3.5% at 24%, that is 3.5 ÷ 0.76 = 4.605%.' },
      { q: 'Which tax rate should I use?', a: 'Use your own estimate of the rate you would pay on the taxable interest. The calculator does not look up brackets. Add state tax to the rate only if it applies to you.' },
      { q: 'What is the break-even tax rate?', a: 'It is the rate at which both options leave you with the same yield. In the example it is 16.67%; above it the tax-free bond keeps more, below it the taxable one does.' },
      { q: 'Does a higher yield always mean a better bond?', a: 'No. Yield ignores credit risk, fees and how long the money is tied up. This calculator compares after-tax yield only.' },
    ],
    sources: [],
  },
  related: ['bond-yield-calculator', 'investment', 'portfolio-rebalance'],
  examples: [
    // k=0.76; 3.5/0.76=4.6052631; 4.2*0.76=3.192; gap 0.308; be 1-3.5/4.2=0.1666667
    { values: { taxfree: 3.5, taxable: 4.2, rate: 24 }, expect: { equiv: 4.6052632, aftertax: 3.192, gap: 0.308, breakeven: 16.6666667 }, tolerance: 1e-4 },
    // k=0.5: 3/0.5=6; 5*0.5=2.5; gap 0.5; be 1-3/5=40%
    { values: { taxfree: 3, taxable: 5, rate: 50 }, expect: { equiv: 6, aftertax: 2.5, gap: 0.5, breakeven: 40 }, tolerance: 1e-6 },
  ],
});
