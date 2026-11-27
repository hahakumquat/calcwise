import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const trim = (n: number) => String(Math.round(n * 1e6) / 1e6);

export default defineCalculator({
  slug: 'sharpe-ratio',
  title: 'Sharpe Ratio Calculator',
  category: 'finance',
  description: 'Calculate the Sharpe ratio from a portfolio return, the risk-free rate and the standard deviation of returns, to compare return per unit of risk.',
  keywords: ['sharpe ratio calculator', 'risk adjusted return', 'sharpe ratio formula', 'excess return per risk', 'portfolio risk calculator'],
  updated: '2026-11-27',
  inputs: [
    { id: 'rp', label: 'Portfolio annual return', type: 'number', suffix: '%', default: 10, step: 0.1, info: 'The average annual return of the portfolio or fund.' },
    { id: 'rf', label: 'Risk-free rate', type: 'number', suffix: '%', default: 4, step: 0.1, info: 'The annual return on a risk-free asset, often a short-term government bill. Editable.' },
    { id: 'sd', label: 'Standard deviation of annual returns', type: 'number', suffix: '%', default: 15, min: 0, step: 0.1, info: 'How much annual returns vary around their average. It is the measure of risk used by the ratio.' },
  ],
  outputs: [
    { id: 'sharpe', label: 'Sharpe ratio', format: 'number', precision: 2, primary: true, info: '(Return − risk-free rate) ÷ standard deviation.' },
    { id: 'excess', label: 'Excess return', format: 'percent', precision: 2, info: 'Return above the risk-free rate.' },
  ],
  compute: (v) => {
    const rp = num(v.rp), rf = num(v.rf), sd = num(v.sd);
    if (rp === null || rf === null || sd === null) return { sharpe: null };
    if (sd <= 0) return { sharpe: null, error: 'Standard deviation must be above 0.' };
    const excess = rp - rf;
    const sharpe = excess / sd;
    const band = sharpe < 1 ? 'modest' : sharpe <= 2 ? 'good' : 'strong';
    return {
      sharpe,
      excess: excess / 100,
      tone: sharpe >= 1 ? 'good' : 'warn',
      badge: sharpe < 0 ? 'Below the risk-free rate' : `Rule-of-thumb band: ${band}`,
      chart: {
        type: 'bar',
        title: 'Return vs risk (%)',
        categories: ['Portfolio return', 'Risk-free rate', 'Standard deviation'],
        series: [{ name: 'Percent', values: [rp, rf, sd] }],
        format: { format: 'number', precision: 1 },
      },
      steps: [
        `Excess return: ${trim(rp)}% − ${trim(rf)}% = ${trim(excess)}%`,
        `Sharpe = ${trim(excess)} ÷ ${trim(sd)} = ${sharpe.toFixed(2)}`,
      ],
      note: 'The ratio uses past returns, treats returns as roughly normal and says nothing about future results. The bands are a common rule of thumb, not a standard. Arithmetic only, not investment advice.',
    };
  },
  content: {
    formula: ['Sharpe ratio = (Rp − Rf) ÷ σ', 'Rp = portfolio return, Rf = risk-free rate, σ = standard deviation of returns'],
    body: [
      'The Sharpe ratio measures how much return you earned above a risk-free investment for each unit of risk taken. Two funds can both return 10%, but if one swung twice as much to get there, it has the lower Sharpe ratio.',
      'Enter the average annual return, the risk-free rate and the standard deviation of annual returns. The result is the excess return divided by the standard deviation. A common rule of thumb reads below 1 as modest, 1 to 2 as good and above 2 as strong, though what counts as good depends on the asset and the period.',
      'The ratio looks backward and treats volatility in both directions as risk. It works best for comparing similar investments measured over the same period.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'A 10% return, 4% risk-free rate and 15% standard deviation give (10 − 4) ÷ 15 = 0.40.' },
      { q: 'What is a good Sharpe ratio?', a: 'As a rule of thumb, above 1 is considered good and above 2 strong. It is not an official standard and varies by asset class and period.' },
      { q: 'Can the Sharpe ratio be negative?', a: 'Yes. If the portfolio returned less than the risk-free rate, the excess return and the ratio are negative.' },
      { q: 'Which risk-free rate should I use?', a: 'Commonly a short-term government bill yield over the same period. The field is editable.' },
      { q: 'What are the limits of the Sharpe ratio?', a: 'It uses past returns, assumes they are roughly normal and counts upside swings as risk. It says nothing about future results.' },
    ],
    sources: [{ label: 'Sharpe, W. F. (1966). Mutual Fund Performance. Journal of Business 39(1)' }],
  },
  related: ['cagr-calculator', 'coefficient-of-variation'],
  examples: [
    { values: { rp: 10, rf: 4, sd: 15 }, expect: { sharpe: 0.4, excess: 0.06 }, tolerance: 0.0001 },
    { values: { rp: 8, rf: 4, sd: 8 }, expect: { sharpe: 0.5 }, tolerance: 0.0001 },
    { values: { rp: 2, rf: 4, sd: 10 }, expect: { sharpe: -0.2 }, tolerance: 0.0001 },
    { values: { rp: 10, rf: 4, sd: 0 }, expect: { error: 'Standard deviation must be above 0.' } },
  ],
});
