import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'cagr-calculator',
  title: 'CAGR Calculator',
  category: 'finance',
  description: 'Work out the compound annual growth rate (CAGR) from a starting value, an ending value and the number of years, and see it next to simple average growth.',
  keywords: ['cagr calculator', 'compound annual growth rate', 'cagr formula', 'annualized return calculator', 'investment growth rate', 'average annual growth rate'],
  updated: '2026-11-17',
  popular: false,
  inputs: [
    { id: 'start', label: 'Starting value', type: 'number', prefix: '$', default: 10000, min: 0.01, step: 100, info: 'What the investment, revenue or balance was worth at the beginning. Must be above zero.' },
    { id: 'end', label: 'Ending value', type: 'number', prefix: '$', default: 25000, min: 0, step: 100, info: 'What it is worth at the end of the period. Can be lower than the start for a loss.' },
    { id: 'years', label: 'Number of years', type: 'number', default: 8, min: 0.1, max: 200, step: 0.5, suffix: 'years', info: 'The length of the period. Decimals are fine, for example 2.5 for two and a half years.' },
  ],
  outputs: [
    { id: 'cagr', label: 'CAGR', format: 'percent', precision: 2, primary: true, info: '(ending ÷ starting) raised to 1 ÷ years, minus 1. The steady yearly rate that gets you from start to end.' },
    { id: 'total', label: 'Total growth', format: 'percent', precision: 2, info: '(ending − starting) ÷ starting over the whole period.' },
    { id: 'simple', label: 'Simple average per year', format: 'percent', precision: 2, info: 'Total growth divided by years. It ignores compounding, so it overstates steady growth when the total is positive.' },
    { id: 'gain', label: 'Gain or loss', format: 'currency', precision: 0, info: 'Ending value minus starting value.' },
  ],
  compute: (v) => {
    const s = num(v.start);
    const e = num(v.end);
    const y = num(v.years);
    if (s === null || e === null || y === null || s <= 0 || e < 0 || y < 0.1 || y > 200) return { cagr: null };
    const ratio = e / s;
    const cagr = Math.pow(ratio, 1 / y) - 1;
    const total = ratio - 1;
    const simple = total / y;
    const points = Math.min(Math.ceil(y), 60);
    const x: number[] = [];
    const steady: number[] = [];
    for (let i = 0; i <= points; i++) {
      const t = (y * i) / points;
      x.push(+t.toFixed(2));
      steady.push(s * Math.pow(1 + cagr, t));
    }
    const up = e >= s;
    return {
      cagr,
      total,
      simple,
      gain: e - s,
      tone: up ? 'good' : 'bad',
      badge: up ? 'Growing' : 'Shrinking',
      chart: {
        type: 'line',
        title: 'Steady growth at the CAGR',
        x,
        xLabel: 'Years',
        yFormat: { format: 'currency' },
        series: [{ name: 'Value at CAGR', values: steady }],
      },
      steps: [
        `Ratio = ${fmt(e)} ÷ ${fmt(s)} = ${fmt(ratio, 4)}`,
        `CAGR = ${fmt(ratio, 4)}^(1 ÷ ${fmt(y)}) − 1 = ${fmt(cagr * 100, 3)}%`,
        `Total growth = ${fmt(total * 100, 2)}%, simple average = ${fmt(total * 100, 2)}% ÷ ${fmt(y)} = ${fmt(simple * 100, 2)}% a year`,
      ],
      note: `Going from $${fmt(s)} to $${fmt(e)} in ${fmt(y)} years is a CAGR of ${fmt(cagr * 100)}% a year.`,
    };
  },
  content: {
    formula: [
      'CAGR = (ending value ÷ starting value)^(1 ÷ years) − 1',
      'Total growth = (ending − starting) ÷ starting',
      'Simple average per year = total growth ÷ years',
    ],
    body: [
      'CAGR stands for compound annual growth rate. It is the single steady yearly rate that would take a starting value to an ending value over a set number of years, as if growth happened at the same pace every year. It smooths out the bumps, so you can compare two investments, two businesses or two time periods on equal terms.',
      'To calculate it, divide the ending value by the starting value, raise the result to the power of one over the number of years, and subtract 1. If $10,000 grows to $25,000 over 8 years, the ratio is 2.5 and the CAGR is about 12.13% a year.',
      'CAGR is not the same as the simple average. If a value doubles in 10 years, the simple average is 100% ÷ 10 = 10% a year, but the CAGR is 2^(1/10) − 1, about 7.18%. Simple averages ignore compounding, which is why they flatter positive growth.',
      'CAGR says nothing about what happened in between. An investment that fell 40% in year one and then recovered can have the same CAGR as one that rose smoothly. It also ignores deposits and withdrawals, fees and tax, so for accounts with regular contributions use a money-weighted measure instead. Past growth does not predict future returns.',
    ],
    faq: [
      { q: 'How do you calculate CAGR?', a: 'Divide the ending value by the starting value, raise it to 1 ÷ years, then subtract 1. For $1,000 growing to $2,000 in 10 years that is 2^(0.1) − 1, which is about 7.18% a year.' },
      { q: 'What is a good CAGR?', a: 'It depends on the asset and the risk. Compare against a benchmark over the same years and remember to adjust for inflation. This calculator does not judge the number, it only computes it.' },
      { q: 'Can CAGR be negative?', a: 'Yes. If the ending value is below the starting value the CAGR is negative. For $100 falling to $50 over 5 years it is 0.5^(0.2) − 1, about −12.94% a year.' },
      { q: 'Why is CAGR lower than the simple average growth?', a: 'Because growth compounds. Each year grows from a bigger base, so a smaller steady rate reaches the same total. The two only match when growth is zero.' },
      { q: 'Does CAGR include dividends or deposits?', a: 'Only if you include them in the starting and ending values yourself. It does not model contributions during the period, fees or taxes.' },
    ],
    sources: [
      { label: 'Compound annual growth rate (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Compound_annual_growth_rate' },
      { label: 'Investor.gov: Compound interest calculator (SEC)', url: 'https://www.investor.gov/financial-tools-calculators/calculators/compound-interest-calculator' },
    ],
  },
  related: ['roi', 'compound-interest', 'rule-of-72', 'investment', 'inflation'],
  examples: [
    {
      // 2.5^(1/8): ln 2.5 = 0.916291, /8 = 0.114536, exp = 1.121349 → 12.1349%; total 150%, simple 18.75%.
      values: { start: 10000, end: 25000, years: 8 },
      expect: { cagr: 0.121349, total: 1.5, simple: 0.1875, gain: 15000 },
      tolerance: 1e-4,
    },
    {
      // 2^(0.1) = 1.071773 → 7.1773%; total 100%, simple 10%.
      values: { start: 1000, end: 2000, years: 10 },
      expect: { cagr: 0.071773, total: 1, simple: 0.1 },
      tolerance: 1e-4,
    },
    {
      // 0.5^(0.2) = 0.870551 → −12.9449%; total −50%.
      values: { start: 100, end: 50, years: 5 },
      expect: { cagr: -0.129449, total: -0.5 },
      tolerance: 1e-4,
    },
  ],
});
