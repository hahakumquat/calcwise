import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'dscr-calculator',
  title: 'DSCR Calculator (Debt Service Coverage Ratio)',
  category: 'finance',
  description: 'Calculate the debt service coverage ratio (DSCR) from net operating income and annual debt payments. See if income covers the loan and by how much.',
  keywords: ['dscr calculator', 'debt service coverage ratio calculator', 'dscr formula', 'how to calculate dscr', 'dscr loan'],
  updated: '2026-11-19',
  popular: false,
  inputs: [
    { id: 'noi', label: 'Net operating income (per year)', type: 'number', prefix: '$', default: 120000, min: 0, max: 1e13, step: 1000, info: 'Income left after operating costs, before debt payments and income tax.' },
    { id: 'debt', label: 'Total debt service (per year)', type: 'number', prefix: '$', default: 80000, min: 0, max: 1e13, step: 1000, info: 'All loan principal and interest payments due in the year.' },
  ],
  outputs: [
    { id: 'dscr', label: 'DSCR', format: 'number', precision: 2, primary: true, info: 'Net operating income ÷ total debt service.' },
    { id: 'surplus', label: 'Cash left after debt payments', format: 'currency', precision: 0, info: 'Net operating income − total debt service.' },
    { id: 'needed', label: 'Income needed for a 1.25 DSCR', format: 'currency', precision: 0, info: 'Debt service × 1.25, a common lender minimum.' },
  ],
  compute: (v) => {
    const n = num(v.noi), d = num(v.debt);
    if (n === null || d === null) return { dscr: null };
    if (n < 0 || d <= 0) return { dscr: null };
    const dscr = n / d;
    const surplus = n - d;
    const needed = d * 1.25;
    return {
      dscr,
      surplus,
      needed,
      chart: {
        type: 'bar',
        title: 'Income vs debt payments ($)',
        categories: ['Net operating income', 'Debt service', 'Needed for 1.25'],
        series: [{ name: 'Amount', values: [n, d, needed] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `DSCR = $${fmt(n, 0)} ÷ $${fmt(d, 0)} = ${fmt(dscr, 2)}`,
        `Cash left = $${fmt(n, 0)} − $${fmt(d, 0)} = $${fmt(surplus, 0)}`,
        `Income for 1.25 = $${fmt(d, 0)} × 1.25 = $${fmt(needed, 0)}`,
      ],
      note: dscr < 1
        ? 'A DSCR below 1 means income does not cover the debt payments.'
        : dscr < 1.25
          ? 'Income covers the payments, but the cushion is thin. Many lenders ask for 1.25 or more.'
          : 'Income covers the debt payments with a cushion that meets a common 1.25 lender minimum.',
    };
  },
  content: {
    formula: ['DSCR = net operating income ÷ total debt service'],
    body: [
      'The debt service coverage ratio shows whether a property or business earns enough to pay its loans. A DSCR of 1.0 means income exactly equals the debt payments. Above 1.0, there is cash left over.',
      'Commercial and investment-property lenders often look for a DSCR of about 1.25 or higher. The exact minimum varies by lender and loan type, so treat 1.25 as a rule of thumb, not a rule.',
      'Total debt service means principal and interest on every loan for the year. Use net operating income, which is income after operating costs but before debt payments and income tax.',
      'To test a different loan, change the debt service and watch the ratio move. For a rental, you can also compare with the cap rate.',
    ],
    faq: [
      { q: 'How do you calculate DSCR?', a: 'Divide net operating income by total annual debt service. With $120,000 of income and $80,000 of debt payments, the DSCR is 1.5.' },
      { q: 'What is a good DSCR?', a: 'Many lenders want at least 1.25, meaning income is 25% above the debt payments. Requirements differ, so check with your lender.' },
      { q: 'What does a DSCR below 1 mean?', a: 'Income is lower than the debt payments, so the shortfall has to come from savings or other income. At 0.75, income covers three quarters of the payments.' },
      { q: 'Is DSCR the same as interest coverage?', a: 'No. Interest coverage compares earnings with interest only. DSCR compares income with interest and principal together.' },
    ],
    sources: [
      { label: 'Investopedia: Debt-service coverage ratio', url: 'https://www.investopedia.com/terms/d/dscr.asp' },
      { label: 'Corporate Finance Institute: DSCR', url: 'https://corporatefinanceinstitute.com/resources/commercial-lending/debt-service-coverage-ratio/' },
    ],
  },
  related: ['interest-coverage-ratio', 'cap-rate-calculator', 'debt-to-income', 'debt-to-equity-ratio', 'mortgage'],
  examples: [
    // 120000/80000 = 1.5; surplus 40000; needed 100000
    { values: { noi: 120000, debt: 80000 }, expect: { dscr: 1.5, surplus: 40000, needed: 100000 }, tolerance: 1e-9 },
    // 60000/80000 = 0.75; surplus -20000; needed 100000
    { values: { noi: 60000, debt: 80000 }, expect: { dscr: 0.75, surplus: -20000, needed: 100000 }, tolerance: 1e-9 },
  ],
});
