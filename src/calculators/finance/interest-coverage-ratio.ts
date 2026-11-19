import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'interest-coverage-ratio',
  title: 'Interest Coverage Ratio Calculator',
  category: 'finance',
  description: 'Calculate the interest coverage ratio (EBIT ÷ interest expense) and see in plain English how comfortably a company can pay the interest on its debt.',
  keywords: ['interest coverage ratio calculator', 'times interest earned', 'TIE ratio', 'EBIT interest coverage', 'debt service ability'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'ebit', label: 'Operating profit (EBIT)', type: 'number', prefix: '$', default: 500000, min: -1e12, max: 1e12, step: 10000, info: 'Earnings before interest and taxes, for the same period as the interest.' },
    { id: 'interest', label: 'Interest expense', type: 'number', prefix: '$', default: 100000, min: 0, max: 1e12, step: 5000, info: 'Interest paid on debt over the period.' },
  ],
  outputs: [
    { id: 'coverage', label: 'Interest coverage', format: 'number', precision: 2, primary: true, info: 'EBIT ÷ interest expense, in times (x).' },
    { id: 'afterInterest', label: 'Profit left after interest', format: 'currency', precision: 0, info: 'EBIT − interest expense.' },
    { id: 'interestShare', label: 'Share of EBIT going to interest', format: 'percent', precision: 1, info: 'Interest expense ÷ EBIT. Shown as 0 if EBIT is zero or negative.' },
  ],
  compute: (v) => {
    const ebit = num(v.ebit);
    const interest = num(v.interest);
    if (ebit === null || interest === null || interest <= 0) return { coverage: null };
    const coverage = ebit / interest;
    const left = ebit - interest;
    const share = ebit > 0 ? interest / ebit : 0;
    return {
      coverage,
      afterInterest: left,
      interestShare: share,
      chart: {
        type: 'bar',
        title: 'Operating profit vs. interest bill ($)',
        categories: ['EBIT', 'Interest expense', 'Left after interest'],
        series: [{ name: 'Amount', values: [ebit, interest, left] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Coverage = $${fmt(ebit, 0)} ÷ $${fmt(interest, 0)} = ${fmt(coverage)}x`,
        `Profit left after interest = $${fmt(ebit, 0)} − $${fmt(interest, 0)} = $${fmt(left, 0)}`,
      ],
      note: coverage >= 3
        ? `Operating profit covers the interest ${fmt(coverage)} times over. Many lenders like to see at least 2 to 3, though norms vary by industry.`
        : coverage >= 1
          ? `Operating profit covers the interest ${fmt(coverage)} times, which leaves little cushion if earnings dip.`
          : `Operating profit does not cover the interest bill. The company would need cash reserves or new funding to keep paying it.`,
    };
  },
  content: {
    formula: ['Interest coverage = EBIT ÷ interest expense', 'Profit left after interest = EBIT − interest expense'],
    body: [
      'The interest coverage ratio, also called times interest earned, asks how many times a company could pay its interest bill out of its operating profit. A ratio of 5 means EBIT is five times the interest owed.',
      'Lenders watch it closely. A ratio near 1 means almost all operating profit goes to interest, so one weak quarter could mean missed payments.',
      'There is no single good number. Stable businesses such as utilities can run lower ratios, while cyclical ones are usually expected to keep a bigger buffer. Many analysts treat below 1.5 as a warning sign.',
      'Use EBIT and interest from the same period (a full year, or a quarter against a quarter). Some analysts use EBITDA instead, which gives a higher number.',
    ],
    faq: [
      { q: 'How do you calculate interest coverage?', a: 'Divide EBIT by interest expense. $500,000 of EBIT and $100,000 of interest gives 500,000 ÷ 100,000 = 5.' },
      { q: 'What is a good interest coverage ratio?', a: 'Many lenders look for at least 2 to 3. Below 1.5 is often seen as risky, and below 1 means operating profit does not cover the interest.' },
      { q: 'Is interest coverage the same as times interest earned?', a: 'Yes. Both divide earnings before interest and taxes by interest expense.' },
      { q: 'What if EBIT is negative?', a: 'The ratio turns negative, which means the company is losing money before interest even starts. The calculator shows the negative ratio and reports 0% of EBIT going to interest.' },
    ],
    sources: [
      { label: 'Investopedia: Interest coverage ratio', url: 'https://www.investopedia.com/terms/i/interestcoverageratio.asp' },
      { label: 'Investor.gov: Financial ratios glossary', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
    ],
  },
  related: ['debt-to-equity-ratio', 'current-ratio-calculator', 'wacc-calculator', 'profit-margin', 'break-even'],
  examples: [
    // 500/100 = 5; left 400,000; share 20%
    { values: { ebit: 500000, interest: 100000 }, expect: { coverage: 5, afterInterest: 400000, interestShare: 0.2 }, tolerance: 1e-9 },
    // 60/80 = 0.75; left -20,000; share 133.3%
    { values: { ebit: 60000, interest: 80000 }, expect: { coverage: 0.75, afterInterest: -20000, interestShare: 1.3333333333 }, tolerance: 1e-6 },
  ],
});
