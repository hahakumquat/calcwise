import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'wacc-calculator',
  title: 'WACC Calculator',
  category: 'finance',
  description: 'Work out a company\'s weighted average cost of capital from its equity, debt, cost of equity, cost of debt and tax rate. See each source\'s share of the total.',
  keywords: ['wacc calculator', 'weighted average cost of capital', 'wacc formula', 'cost of capital', 'after-tax cost of debt'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'equity', label: 'Equity (market value)', type: 'number', prefix: '$', default: 600000, min: 0, step: 10000, info: 'Market value of the company\'s shares.' },
    { id: 'debt', label: 'Debt (market value)', type: 'number', prefix: '$', default: 400000, min: 0, step: 10000, info: 'Loans and bonds the company owes.' },
    { id: 're', label: 'Cost of equity', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 0.1, info: 'Return shareholders expect, often estimated with CAPM.' },
    { id: 'rd', label: 'Cost of debt (pre-tax)', type: 'number', suffix: '%', default: 6, min: 0, max: 100, step: 0.1, info: 'Average interest rate on the debt.' },
    { id: 'tax', label: 'Tax rate', type: 'number', suffix: '%', default: 25, min: 0, max: 100, step: 0.5, info: 'Rate at which interest saves tax.' },
  ],
  outputs: [
    { id: 'wacc', label: 'WACC', format: 'percent', precision: 2, primary: true, info: 'Blended yearly cost of funding the company.' },
    { id: 'afterTax', label: 'After-tax cost of debt', format: 'percent', precision: 2, info: 'Cost of debt × (1 − tax rate).' },
    { id: 'debtShare', label: 'Debt share of capital', format: 'percent', precision: 1, info: 'Debt ÷ (equity + debt).' },
  ],
  compute: (v) => {
    const e = num(v.equity);
    const d = num(v.debt);
    const re = num(v.re);
    const rd = num(v.rd);
    const t = num(v.tax);
    if (e === null || d === null || re === null || rd === null || t === null) return { wacc: null };
    if (e < 0 || d < 0 || e + d <= 0 || re < 0 || rd < 0 || t < 0 || t > 100) return { wacc: null };
    const total = e + d;
    const we = e / total;
    const wd = d / total;
    const rdAfter = (rd / 100) * (1 - t / 100);
    const eqPart = we * (re / 100);
    const debtPart = wd * rdAfter;
    const wacc = eqPart + debtPart;
    return {
      wacc,
      afterTax: rdAfter,
      debtShare: wd,
      chart: {
        type: 'bar',
        title: 'What each source adds to WACC (percentage points)',
        categories: ['Equity', 'Debt (after tax)'],
        series: [{ name: 'Points', values: [eqPart * 100, debtPart * 100] }],
        format: { format: 'number', precision: 2 },
      },
      steps: [
        `Weights: equity ${fmt(we * 100, 1)}%, debt ${fmt(wd * 100, 1)}%`,
        `After-tax cost of debt = ${fmt(rd)}% × (1 − ${fmt(t)}%) = ${fmt(rdAfter * 100)}%`,
        `WACC = ${fmt(we, 3)} × ${fmt(re)}% + ${fmt(wd, 3)} × ${fmt(rdAfter * 100)}% = ${fmt(wacc * 100)}%`,
      ],
      note: `A project should earn more than ${fmt(wacc * 100)}% a year to cover what the company pays for its funding. Inputs are estimates, so treat the result as a guide.`,
    };
  },
  content: {
    formula: ['WACC = E/(E+D) × Re + D/(E+D) × Rd × (1 − T)', 'E = equity value, D = debt value, Re = cost of equity, Rd = cost of debt, T = tax rate'],
    body: [
      'The weighted average cost of capital (WACC) is the blended rate a company pays to fund itself with shares and debt. Each source is weighted by its share of the total.',
      'Interest on debt is usually tax deductible, so the calculator lowers the cost of debt by the tax rate. Dividends and share returns get no such break, which is one reason debt is often the cheaper source.',
      'Finance teams use WACC as the discount rate in discounted cash flow and net present value work. A project that returns less than the WACC destroys value.',
      'Cost of equity cannot be read from a statement. It is estimated, commonly with the capital asset pricing model, so the result is only as good as that estimate.',
    ],
    faq: [
      { q: 'How do you calculate WACC?', a: 'Weight the cost of equity and the after-tax cost of debt by each one\'s share of total capital, then add them. With $600,000 equity at 10%, $400,000 debt at 6% and a 25% tax rate: 0.6 × 10% + 0.4 × 6% × 0.75 = 6% + 1.8% = 7.8%.' },
      { q: 'Why is debt cost reduced by tax?', a: 'Interest is deductible, so each dollar of interest saves the company tax at its rate. The real cost is the interest rate times (1 − tax rate).' },
      { q: 'Should I use book or market values?', a: 'Market values are preferred because they show what investors would pay today. Book value of debt is a common stand-in when debt is not traded.' },
      { q: 'What is a good WACC?', a: 'There is no single good number. Lower is cheaper funding, and it varies by industry and risk. Compare it with the return a project is expected to earn.' },
    ],
    sources: [
      { label: 'Corporate Finance Institute: WACC', url: 'https://corporatefinanceinstitute.com/resources/valuation/what-is-wacc-formula/' },
      { label: 'Investopedia: Weighted average cost of capital', url: 'https://www.investopedia.com/terms/w/wacc.asp' },
    ],
  },
  related: ['npv-irr-calculator', 'present-value', 'payback-period', 'roi', 'cagr-calculator'],
  examples: [
    // 0.6*10% + 0.4*6%*0.75 = 7.8%; after-tax 4.5%; debt share 40%
    { values: { equity: 600000, debt: 400000, re: 10, rd: 6, tax: 25 }, expect: { wacc: 0.078, afterTax: 0.045, debtShare: 0.4 }, tolerance: 1e-9 },
    // all equity: WACC = Re = 12%
    { values: { equity: 100000, debt: 0, re: 12, rd: 5, tax: 21 }, expect: { wacc: 0.12, afterTax: 0.0395, debtShare: 0 }, tolerance: 1e-9 },
  ],
});
