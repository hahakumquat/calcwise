import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'pe-ratio-calculator',
  title: 'P/E Ratio Calculator',
  category: 'finance',
  description: 'Work out a stock\'s price-to-earnings ratio, earnings yield and PEG ratio from the share price, earnings per share and expected growth. Plain-English results.',
  keywords: ['p/e ratio calculator', 'price to earnings ratio', 'earnings yield', 'peg ratio calculator', 'pe ratio formula'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'price', label: 'Share price', type: 'number', prefix: '$', default: 150, min: 0, max: 1000000, step: 0.01, info: 'Current price of one share.' },
    { id: 'eps', label: 'Earnings per share (EPS)', type: 'number', prefix: '$', default: 6, min: 0, max: 1000000, step: 0.01, info: 'Profit per share over the last 12 months, or your forecast.' },
    { id: 'growth', label: 'Expected earnings growth (optional)', type: 'number', suffix: '%', default: 10, min: 0, max: 1000, step: 0.1, info: 'Yearly growth in earnings. Leave at 0 to skip the PEG ratio.' },
  ],
  outputs: [
    { id: 'pe', label: 'P/E ratio', format: 'number', precision: 2, primary: true, info: 'Share price ÷ earnings per share.' },
    { id: 'ey', label: 'Earnings yield', format: 'percent', precision: 2, info: 'EPS ÷ price, the inverse of the P/E.' },
    { id: 'peg', label: 'PEG ratio', format: 'number', precision: 2, info: 'P/E ÷ growth rate in percent. Needs growth above 0.' },
    { id: 'years', label: 'Years of earnings in the price', format: 'number', precision: 1, info: 'At flat earnings, the years of profit it takes to equal the price.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const eps = num(v.eps);
    const growth = num(v.growth) ?? 0;
    if (price === null || eps === null) return { pe: null };
    if (price < 0 || eps <= 0 || growth < 0) return { pe: null };
    const pe = price / eps;
    const ey = eps / price;
    const peg = growth > 0 ? pe / growth : null;
    return {
      pe,
      ey,
      peg,
      years: pe,
      chart: {
        type: 'bar',
        title: 'P/E ratio and earnings yield (%)',
        categories: ['Earnings yield (%)', 'P/E ratio'],
        series: [{ name: 'Value', values: [ey * 100, pe] }],
        format: { format: 'number', precision: 2 },
      },
      steps: [
        `P/E = $${fmt(price)} ÷ $${fmt(eps)} = ${fmt(pe)}`,
        `Earnings yield = $${fmt(eps)} ÷ $${fmt(price)} = ${fmt(ey * 100)}%`,
        peg !== null ? `PEG = ${fmt(pe)} ÷ ${fmt(growth)} = ${fmt(peg)}` : 'PEG needs a growth rate above 0%.',
      ],
      note: `You pay $${fmt(pe)} for every $1 of yearly profit. A lower P/E is not automatically a bargain: it can reflect slower growth or more risk.`,
    };
  },
  content: {
    formula: ['P/E = share price ÷ earnings per share', 'Earnings yield = EPS ÷ share price', 'PEG = P/E ÷ expected annual earnings growth (in %)'],
    body: [
      'The price-to-earnings ratio (P/E) tells you how many dollars investors pay for each dollar of a company\'s yearly profit. A P/E of 25 means the price is 25 times earnings.',
      'Earnings yield flips the same numbers around. It is the profit per share as a percentage of the price, which makes it easy to compare with a savings or bond rate.',
      'The PEG ratio divides the P/E by expected growth. A fast grower can deserve a higher P/E, so a PEG near 1 is often read as fairly priced and well above 1 as expensive. This is a rule of thumb, not a rule.',
      'Use the same kind of EPS each time. Trailing EPS uses past profit, forward EPS uses a forecast, and the P/E will differ between them.',
    ],
    faq: [
      { q: 'How do you calculate the P/E ratio?', a: 'Divide the share price by earnings per share. A $150 share with $6 of EPS has a P/E of 150 ÷ 6 = 25.' },
      { q: 'What is a good P/E ratio?', a: 'It depends on the industry and growth. Compare a stock with similar companies and its own history rather than a single number.' },
      { q: 'What is earnings yield?', a: 'EPS divided by price. For $6 of EPS on a $150 share it is 4%, the inverse of the P/E of 25.' },
      { q: 'How is the PEG ratio calculated?', a: 'P/E divided by the expected yearly earnings growth in percent. A P/E of 25 with 10% growth gives a PEG of 2.5.' },
      { q: 'What if earnings are negative?', a: 'The P/E has no useful meaning when a company loses money, so this calculator asks for EPS above zero.' },
    ],
    sources: [
      { label: 'Investor.gov: Price-earnings ratio', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/price-earnings-ratio' },
      { label: 'Investopedia: PEG ratio', url: 'https://www.investopedia.com/terms/p/pegratio.asp' },
    ],
  },
  related: ['dividend-calculator', 'capm-calculator', 'roi', 'stock-profit-calculator', 'rule-of-72'],
  examples: [
    // 150/6 = 25; 6/150 = 4%; PEG 25/10 = 2.5
    { values: { price: 150, eps: 6, growth: 10 }, expect: { pe: 25, ey: 0.04, peg: 2.5, years: 25 }, tolerance: 1e-9 },
    // 40/5 = 8; 12.5%; PEG 8/4 = 2
    { values: { price: 40, eps: 5, growth: 4 }, expect: { pe: 8, ey: 0.125, peg: 2 }, tolerance: 1e-9 },
  ],
});
