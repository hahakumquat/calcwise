import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'ebitda-calculator',
  title: 'EBITDA Calculator with EV/EBITDA Multiple',
  category: 'finance',
  description: 'Calculate EBITDA and EBITDA margin from net income, interest, taxes and D&A. Add market value, debt and cash to get enterprise value and the EV/EBITDA multiple.',
  keywords: ['ebitda calculator', 'ebitda margin calculator', 'ev to ebitda calculator', 'enterprise value calculator', 'ebitda formula'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'netIncome', label: 'Net income', type: 'number', prefix: '$', default: 120000, min: -1e12, max: 1e12, step: 1000, info: 'Profit after everything, from the income statement. Can be negative.' },
    { id: 'interest', label: 'Interest expense', type: 'number', prefix: '$', default: 30000, min: 0, max: 1e12, step: 1000, info: 'Interest paid on loans, from the income statement.' },
    { id: 'taxes', label: 'Income taxes', type: 'number', prefix: '$', default: 40000, min: 0, max: 1e12, step: 1000, info: 'Income tax expense for the period.' },
    { id: 'da', label: 'Depreciation and amortization', type: 'number', prefix: '$', default: 60000, min: 0, max: 1e12, step: 1000, info: 'Non-cash charges for wear on assets, from the cash flow statement.' },
    { id: 'revenue', label: 'Revenue', type: 'number', prefix: '$', default: 1000000, min: 0, max: 1e12, step: 1000, info: 'Used for the margin.' },
    { id: 'marketCap', label: 'Market value of equity (optional)', type: 'number', prefix: '$', default: 1500000, min: 0, max: 1e13, step: 10000, info: 'Share price × shares outstanding, or an estimate of what the business is worth.' },
    { id: 'debt', label: 'Total debt', type: 'number', prefix: '$', default: 400000, min: 0, max: 1e13, step: 10000, info: 'Short-term and long-term borrowings.' },
    { id: 'cash', label: 'Cash and equivalents', type: 'number', prefix: '$', default: 150000, min: 0, max: 1e13, step: 10000, info: 'Cash and near-cash holdings that could pay down debt.' },
  ],
  outputs: [
    { id: 'ebitda', label: 'EBITDA', format: 'currency', precision: 0, primary: true, info: 'Net income + interest + taxes + depreciation and amortization.' },
    { id: 'margin', label: 'EBITDA margin', format: 'percent', precision: 1, info: 'EBITDA ÷ revenue.' },
    { id: 'ev', label: 'Enterprise value', format: 'currency', precision: 0, info: 'Market value + debt − cash.' },
    { id: 'multiple', label: 'EV/EBITDA', format: 'number', precision: 2, info: 'Enterprise value ÷ EBITDA. Only meaningful when EBITDA is positive.' },
  ],
  compute: (v) => {
    const ni = num(v.netIncome), int = num(v.interest), tax = num(v.taxes), da = num(v.da);
    const rev = num(v.revenue), mc = num(v.marketCap), debt = num(v.debt), cash = num(v.cash);
    if (ni === null || int === null || tax === null || da === null || rev === null) return { ebitda: null };
    if (int < 0 || tax < 0 || da < 0 || rev <= 0) return { ebitda: null };
    const ebitda = ni + int + tax + da;
    const margin = ebitda / rev;
    const out: Record<string, number> = { ebitda, margin };
    const steps = [
      `EBITDA = $${fmt(ni, 0)} + $${fmt(int, 0)} + $${fmt(tax, 0)} + $${fmt(da, 0)} = $${fmt(ebitda, 0)}`,
      `Margin = $${fmt(ebitda, 0)} ÷ $${fmt(rev, 0)} = ${fmt(margin * 100, 1)}%`,
    ];
    let note = `Each $1 of revenue leaves ${fmt(margin * 100, 1)} cents of earnings before interest, tax and D&A.`;
    if (mc !== null && debt !== null && cash !== null && mc > 0) {
      const ev = mc + debt - cash;
      out.ev = ev;
      steps.push(`Enterprise value = $${fmt(mc, 0)} + $${fmt(debt, 0)} − $${fmt(cash, 0)} = $${fmt(ev, 0)}`);
      if (ebitda > 0 && ev > 0) {
        const multiple = ev / ebitda;
        out.multiple = multiple;
        steps.push(`EV/EBITDA = $${fmt(ev, 0)} ÷ $${fmt(ebitda, 0)} = ${fmt(multiple)}`);
        note = `Buying the whole business would cost about ${fmt(multiple, 1)} times a year of EBITDA. Typical multiples differ a lot by industry.`;
      }
    }
    return {
      ...out,
      chart: {
        type: 'bar',
        title: 'From net income to EBITDA ($)',
        categories: ['Net income', 'Interest', 'Taxes', 'D&A', 'EBITDA'],
        series: [{ name: 'Amount', values: [ni, int, tax, da, ebitda] }],
        format: { format: 'currency', precision: 0 },
      },
      steps,
      note,
    };
  },
  content: {
    formula: ['EBITDA = net income + interest + taxes + depreciation + amortization', 'EBITDA margin = EBITDA ÷ revenue', 'Enterprise value = market value of equity + debt − cash', 'EV/EBITDA = enterprise value ÷ EBITDA'],
    body: [
      'EBITDA stands for earnings before interest, taxes, depreciation and amortization. It strips out financing choices, tax rules and accounting for old purchases, so you can compare how well the core business earns.',
      'The quickest way to get it is to start at net income and add back the four items. If you start from operating income instead, add back only depreciation and amortization.',
      'Enterprise value is what it would cost to buy the whole business: the equity plus the debt you would take on, minus the cash you would get. Dividing it by EBITDA gives the EV/EBITDA multiple, a common yardstick for comparing companies of different sizes and debt levels.',
      'EBITDA is not a measure of cash flow. It ignores capital spending, working capital and interest, so a company can show strong EBITDA and still burn cash. Use it with free cash flow, not instead of it.',
    ],
    faq: [
      { q: 'How do you calculate EBITDA?', a: 'Add interest, taxes, depreciation and amortization to net income. $120,000 + $30,000 + $40,000 + $60,000 = $250,000.' },
      { q: 'What is the EBITDA margin?', a: 'EBITDA divided by revenue. $250,000 ÷ $1,000,000 = 25%.' },
      { q: 'How is enterprise value calculated?', a: 'Market value of equity plus debt minus cash. $1,500,000 + $400,000 − $150,000 = $1,750,000.' },
      { q: 'What is a good EV/EBITDA multiple?', a: 'There is no single answer. It depends on industry, growth and risk, so compare with similar companies. In the example, $1,750,000 ÷ $250,000 = 7.0.' },
    ],
    sources: [
      { label: 'Investor.gov: EBITDA (SEC glossary)', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary' },
      { label: 'Investopedia: EBITDA', url: 'https://www.investopedia.com/terms/e/ebitda.asp' },
    ],
  },
  related: ['eps-calculator', 'free-cash-flow-calculator', 'interest-coverage-ratio', 'pe-ratio-calculator', 'roa-calculator', 'wacc-calculator', 'profit-margin'],
  examples: [
    // 120+30+40+60 = 250k; 25%; EV 1500+400-150 = 1750k; 7.0
    { values: { netIncome: 120000, interest: 30000, taxes: 40000, da: 60000, revenue: 1000000, marketCap: 1500000, debt: 400000, cash: 150000 }, expect: { ebitda: 250000, margin: 0.25, ev: 1750000, multiple: 7 }, tolerance: 1e-9 },
    // loss: -50+10+0+20 = -20k; margin -4%
    { values: { netIncome: -50000, interest: 10000, taxes: 0, da: 20000, revenue: 500000, marketCap: 0, debt: 0, cash: 0 }, expect: { ebitda: -20000, margin: -0.04 }, tolerance: 1e-9 },
  ],
});
