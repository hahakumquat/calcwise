import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'capm-calculator',
  title: 'CAPM Calculator',
  category: 'finance',
  description: 'Estimate the expected return of a stock with the capital asset pricing model from the risk-free rate, beta and expected market return. See the risk premium.',
  keywords: ['capm calculator', 'capital asset pricing model', 'cost of equity', 'expected return formula', 'beta calculator'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'rf', label: 'Risk-free rate', type: 'number', suffix: '%', default: 4, min: 0, max: 100, step: 0.1, info: 'Often the yield on a government bond.' },
    { id: 'beta', label: 'Beta', type: 'number', default: 1.2, min: -5, max: 10, step: 0.05, info: 'How much the stock moves versus the market. 1 = same as the market.' },
    { id: 'rm', label: 'Expected market return', type: 'number', suffix: '%', default: 9, min: 0, max: 100, step: 0.1, info: 'Return you expect from the overall market each year.' },
  ],
  outputs: [
    { id: 'er', label: 'Expected return (cost of equity)', format: 'percent', precision: 2, primary: true, info: 'Rf + Beta × (Rm − Rf).' },
    { id: 'mrp', label: 'Market risk premium', format: 'percent', precision: 2, info: 'Expected market return minus the risk-free rate.' },
    { id: 'stockPremium', label: 'Premium for this stock', format: 'percent', precision: 2, info: 'Beta × market risk premium.' },
  ],
  compute: (v) => {
    const rf = num(v.rf);
    const beta = num(v.beta);
    const rm = num(v.rm);
    if (rf === null || beta === null || rm === null) return { er: null };
    if (rf < 0 || rm < 0) return { er: null };
    const mrp = (rm - rf) / 100;
    const stockPremium = beta * mrp;
    const er = rf / 100 + stockPremium;
    return {
      er,
      mrp,
      stockPremium,
      chart: {
        type: 'bar',
        title: 'Where the expected return comes from (percentage points)',
        categories: ['Risk-free rate', 'Stock premium'],
        series: [{ name: 'Points', values: [rf, stockPremium * 100] }],
        format: { format: 'number', precision: 2 },
      },
      steps: [
        `Market risk premium = ${fmt(rm)}% − ${fmt(rf)}% = ${fmt(mrp * 100)}%`,
        `Stock premium = ${fmt(beta)} × ${fmt(mrp * 100)}% = ${fmt(stockPremium * 100)}%`,
        `Expected return = ${fmt(rf)}% + ${fmt(stockPremium * 100)}% = ${fmt(er * 100)}%`,
      ],
      note: `With a beta of ${fmt(beta)}, investors would ask for about ${fmt(er * 100)}% a year. Beta and market return are estimates, so treat this as a guide, not a forecast.`,
    };
  },
  content: {
    formula: ['Expected return = Rf + β × (Rm − Rf)', 'Rf = risk-free rate, β = beta, Rm = expected market return'],
    body: [
      'The capital asset pricing model (CAPM) estimates the return an investor should expect from a stock, given how risky it is compared with the whole market.',
      'It starts from a risk-free rate, such as a government bond yield, and adds a premium. The premium is the stock\'s beta times the market risk premium, which is the market return minus the risk-free rate.',
      'A beta above 1 means the stock tends to swing more than the market, so the model asks for a higher return. A beta below 1 asks for less.',
      'Companies use the result as their cost of equity, for example as an input to WACC. CAPM is a simplified model, and its inputs are estimates.',
    ],
    faq: [
      { q: 'How do you calculate CAPM?', a: 'Expected return = risk-free rate + beta × (market return − risk-free rate). With a 4% risk-free rate, beta 1.2 and 9% market return: 4% + 1.2 × 5% = 10%.' },
      { q: 'What is a good beta?', a: 'There is no good or bad beta. A beta of 1 moves with the market, above 1 is more volatile, and below 1 is steadier. Choose by how much risk you accept.' },
      { q: 'What risk-free rate should I use?', a: 'A government bond yield that matches your time horizon, such as the 10-year Treasury yield for long-term estimates.' },
      { q: 'Is the CAPM result a prediction?', a: 'No. It is the return investors should require for the risk taken, based on estimates of beta and market return. Real returns can differ a lot.' },
    ],
    sources: [
      { label: 'Corporate Finance Institute: CAPM', url: 'https://corporatefinanceinstitute.com/resources/valuation/what-is-capm-formula/' },
      { label: 'Investopedia: Capital asset pricing model', url: 'https://www.investopedia.com/terms/c/capm.asp' },
    ],
  },
  related: ['wacc-calculator', 'roi', 'cagr-calculator', 'real-rate-of-return', 'investment'],
  examples: [
    // 4 + 1.2*5 = 10%; mrp 5%; stock premium 6%
    { values: { rf: 4, beta: 1.2, rm: 9 }, expect: { er: 0.1, mrp: 0.05, stockPremium: 0.06 }, tolerance: 1e-9 },
    // beta 1 -> market return; 3 + 1*(8-3) = 8%
    { values: { rf: 3, beta: 1, rm: 8 }, expect: { er: 0.08, mrp: 0.05, stockPremium: 0.05 }, tolerance: 1e-9 },
  ],
});
