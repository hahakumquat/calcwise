import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'niit-estimate',
  title: 'Net Investment Income Tax (NIIT) Calculator',
  category: 'finance',
  description: 'Estimate the 3.8% Net Investment Income Tax on gains, dividends and interest from your MAGI and investment income. Rate and threshold are editable.',
  keywords: ['niit calculator', 'net investment income tax calculator', '3.8% investment tax', 'niit threshold', 'investment income surtax'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'other', label: 'Income other than investment income', type: 'number', prefix: '$', default: 180000, min: 0, step: 1000, help: 'Wages, business income and other income in your MAGI.', info: 'Everything in modified AGI except the net investment income below.' },
    { id: 'nii', label: 'Net investment income', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, help: 'Gains, dividends, interest, rents and similar income, net of related deductions.', info: 'Net gains, dividends, interest, passive rental income and similar, after allowed expenses.' },
    { id: 'threshold', label: 'MAGI threshold', type: 'number', prefix: '$', default: 200000, min: 0, step: 5000, help: 'Illustrative default for a single filer. Not a current-year claim: check the IRS for your filing status.', info: 'The threshold depends on filing status. Enter the one that applies to you.' },
    { id: 'rate', label: 'NIIT rate', type: 'number', suffix: '%', default: 3.8, min: 0, max: 20, step: 0.1, help: 'Illustrative default. Not a current-year claim.', info: 'Rate applied to the taxable amount.' },
  ],
  outputs: [
    { id: 'tax', label: 'Estimated NIIT', format: 'currency', primary: true, info: 'Rate × the lesser of net investment income or MAGI above the threshold.' },
    { id: 'magi', label: 'Modified AGI (MAGI)', format: 'currency', info: 'Other income plus net investment income.' },
    { id: 'excess', label: 'MAGI above threshold', format: 'currency', info: 'MAGI minus threshold, never below zero.' },
    { id: 'taxable', label: 'Amount subject to NIIT', format: 'currency', info: 'The lesser of net investment income or the excess.' },
    { id: 'headroom', label: 'Room left under the threshold', format: 'currency', info: 'How much more MAGI you could add before the tax starts.' },
  ],
  compute: (v) => {
    const other = num(v.other);
    const nii = num(v.nii);
    const threshold = num(v.threshold);
    const rate = num(v.rate);
    if (other === null || nii === null || threshold === null || rate === null) return { tax: null };
    if (other < 0 || nii < 0 || threshold < 0 || rate < 0) return { tax: null };

    const magi = other + nii;
    const excess = Math.max(0, magi - threshold);
    const taxable = Math.min(nii, excess);
    const tax = taxable * (rate / 100);
    const headroom = Math.max(0, threshold - magi);

    const charts: ChartSpec[] = [
      moneyDonut('Net investment income', [
        { label: 'Not subject to NIIT', value: nii - taxable },
        { label: 'Subject to NIIT', value: taxable },
      ], money(tax, 0), 'NIIT'),
    ];

    return {
      tax, magi, excess, taxable, headroom,
      tone: tax === 0 ? 'good' : taxable < nii ? 'warn' : 'bad',
      badge: tax === 0 ? 'No NIIT' : taxable < nii ? 'Part of your investment income taxed' : 'All investment income taxed',
      chart: charts,
      steps: [
        `MAGI = ${money(other, 0)} + ${money(nii, 0)} = ${money(magi, 0)}`,
        `Above threshold = ${money(magi, 0)} − ${money(threshold, 0)} = ${money(excess, 0)} (not below $0)`,
        `Subject to NIIT = lesser of ${money(nii, 0)} and ${money(excess, 0)} = ${money(taxable, 0)}`,
        `NIIT = ${pct(rate / 100, 2)} × ${money(taxable, 0)} = ${money(tax)}`,
      ],
      note: 'The rate and threshold are your inputs and the defaults are illustrative, not current-year claims. Real MAGI has adjustments this ignores, and some income is excluded. Not tax advice.',
    };
  },
  content: {
    formula: [
      'MAGI = other income + net investment income',
      'Amount subject to NIIT = lesser of (net investment income, MAGI − threshold), never below zero',
      'NIIT = rate × amount subject to NIIT',
    ],
    body: [
      'The Net Investment Income Tax is an extra tax on investment income for higher earners. It applies to the lesser of two numbers: your net investment income, or the amount your modified AGI is over a threshold that depends on filing status.',
      'That "lesser of" rule means a big gain can be taxed in full, while a small gain on top of income just over the threshold is only partly taxed. Selling in a year when your MAGI sits under the threshold can avoid it entirely.',
      'The rate and threshold are inputs here and the defaults are illustrative, not claims about the current year. This estimate ignores MAGI adjustments, excluded income types and state rules.',
    ],
    sections: [
      {
        heading: 'Ways people reduce exposure',
        paragraphs: ['Spread gains over several years, harvest losses against gains, or use tax-advantaged accounts, where growth is generally not counted as net investment income while it stays inside. Check the IRS rules for your situation.'],
      },
    ],
    faq: [
      { q: 'What is the NIIT on $50,000 of investment income with $180,000 other income?', a: 'MAGI is $230,000, which is $30,000 over the $200,000 default threshold. The lesser of $50,000 and $30,000 is $30,000, so the tax is 3.8% × $30,000 = $1,140.' },
      { q: 'When is all of the investment income taxed?', a: 'When the excess over the threshold is at least the investment income. With $300,000 other income and $40,000 of investment income, the excess is $140,000, so 3.8% × $40,000 = $1,520.' },
      { q: 'When is the NIIT zero?', a: 'When MAGI is at or below the threshold. With $100,000 other income and $20,000 investment income, MAGI is $120,000 and the tax is $0, with $80,000 of room left.' },
      { q: 'Are the default rate and threshold current?', a: 'No. They are illustrative. Enter the rate and the threshold for your filing status and tax year.' },
    ],
    sources: [
      { label: 'IRS: Net Investment Income Tax', url: 'https://www.irs.gov/individuals/net-investment-income-tax' },
      { label: 'IRS Topic 559: Net investment income tax', url: 'https://www.irs.gov/taxtopics/tc559' },
    ],
  },
  related: ['capital-gains-tax', 'tax-loss-harvesting', 'gains-harvest-headroom', 'capital-loss-carryover', 'income-tax'],
  examples: [
    {
      // MAGI 230,000; excess 30,000; lesser of 50,000 / 30,000 = 30,000; × 3.8% = 1,140.
      values: { other: 180000, nii: 50000, threshold: 200000, rate: 3.8 },
      expect: { magi: 230000, excess: 30000, taxable: 30000, tax: 1140, headroom: 0 },
      tolerance: 1e-6,
    },
    {
      // MAGI 340,000; excess 140,000 > 40,000; 40,000 × 3.8% = 1,520.
      values: { other: 300000, nii: 40000, threshold: 200000, rate: 3.8 },
      expect: { excess: 140000, taxable: 40000, tax: 1520 },
      tolerance: 1e-6,
    },
    {
      // MAGI 120,000 < 200,000: tax 0, headroom 80,000.
      values: { other: 100000, nii: 20000, threshold: 200000, rate: 3.8 },
      expect: { tax: 0, taxable: 0, headroom: 80000 },
      tolerance: 1e-6,
    },
  ],
});
