import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'qbi-deduction',
  title: 'QBI Deduction Calculator',
  category: 'finance',
  description: 'Estimate the 20% qualified business income (QBI) deduction for pass-through income and the tax it saves. The rates are your inputs.',
  keywords: ['qbi deduction calculator', 'section 199a calculator', 'qualified business income deduction', '20 percent pass-through deduction', 'freelancer tax deduction'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'qbi', label: 'Qualified business income', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, help: 'Net profit from your pass-through business, sole proprietorship or freelance work.', info: 'Business income that counts toward the deduction.' },
    { id: 'taxable', label: 'Taxable income before QBI deduction', type: 'number', prefix: '$', default: 70000, min: 0, step: 1000, help: 'After the standard or itemized deduction.', info: 'Used for the taxable income limit.' },
    { id: 'gains', label: 'Net capital gain', type: 'number', prefix: '$', default: 0, min: 0, step: 500, help: 'Net capital gain plus qualified dividends. Leave 0 if none.', info: 'Taxed separately, so it is taken out of the limit.' },
    { id: 'rate', label: 'Deduction rate', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 1, help: 'Illustrative default. Not a current-year claim: check the rate.', info: 'Share of income you may deduct.' },
    { id: 'marginal', label: 'Marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 0.5, help: 'Your top federal bracket.', info: 'Used to value the deduction.' },
  ],
  outputs: [
    { id: 'deduction', label: 'QBI deduction', format: 'currency', primary: true, info: 'Smaller of rate × QBI and rate × (taxable income − net capital gain).' },
    { id: 'saved', label: 'Estimated tax saved', format: 'currency', info: 'Deduction × marginal rate.' },
    { id: 'qbiLimit', label: 'Limit from business income', format: 'currency', info: 'Deduction rate × your qualified business income.' },
    { id: 'incomeLimit', label: 'Limit from taxable income', format: 'currency', info: 'Rate × (taxable income − net capital gain), never below 0.' },
  ],
  compute: (v) => {
    const qbi = num(v.qbi);
    const taxable = num(v.taxable);
    const gains = num(v.gains);
    const rate = num(v.rate);
    const marginal = num(v.marginal);
    if (qbi === null || taxable === null || gains === null || rate === null || marginal === null) return { deduction: null };
    if (qbi < 0 || taxable < 0 || gains < 0 || rate < 0 || marginal < 0) return { deduction: null };

    const r = rate / 100;
    const qbiLimit = r * qbi;
    const incomeLimit = r * Math.max(0, taxable - gains);
    const deduction = Math.min(qbiLimit, incomeLimit);
    const saved = deduction * (marginal / 100);
    const bound = incomeLimit < qbiLimit;

    const charts: ChartSpec[] = [
      {
        type: 'bar',
        title: 'Two limits, the smaller one wins',
        categories: ['From business income', 'From taxable income', 'Deduction'],
        series: [{ name: 'Amount', values: [qbiLimit, incomeLimit, deduction] }],
        format: { format: 'currency' },
      },
    ];

    return {
      deduction, saved, qbiLimit, incomeLimit,
      tone: deduction > 0 ? 'good' : 'warn',
      badge: deduction <= 0 ? 'No deduction from these inputs' : bound ? 'Limited by taxable income' : 'Limited by business income',
      chart: charts,
      steps: [
        `From business income = ${pct(r, 1)} × ${money(qbi, 0)} = ${money(qbiLimit)}`,
        `From taxable income = ${pct(r, 1)} × (${money(taxable, 0)} − ${money(gains, 0)}) = ${money(incomeLimit)}`,
        `Deduction = smaller of the two = ${money(deduction)}`,
        `Tax saved = ${money(deduction)} × ${pct(marginal / 100, 1)} = ${money(saved)}`,
      ],
      note: 'The deduction rate and marginal rate are your inputs and the defaults are illustrative, not current-year claims. Income thresholds, the W-2 wage and property limits, excluded service trades, and loss carryovers are not computed. Not tax advice.',
    };
  },
  content: {
    formula: [
      'Deduction = smaller of (rate × QBI) and (rate × (taxable income − net capital gain))',
      'Tax saved = deduction × marginal tax rate',
    ],
    body: [
      'The qualified business income (QBI) deduction lets many owners of pass-through businesses, including sole proprietors and freelancers, deduct a share of their business profit from taxable income. It is taken on top of the standard or itemized deduction, not instead of it.',
      'In its basic form there are two limits: a share of your business income, and the same share of your taxable income after removing net capital gain. The smaller one is the deduction. This calculator computes that basic form and values it at your marginal rate.',
      'The rate is an input and the defaults are illustrative, not claims about the current year. Higher earners face extra limits that are not computed here.',
    ],
    sections: [
      {
        heading: 'Things this does not model',
        paragraphs: ['Income thresholds and phase-outs, the W-2 wage and property limits, excluded service trades, multiple businesses, REIT and cooperative income, and loss carryovers are not computed. If your income is above the thresholds, use the IRS worksheets or a tax professional.'],
      },
    ],
    faq: [
      { q: 'What is the deduction on $60,000 of QBI with $70,000 taxable income?', a: 'It is the smaller of 20% × $60,000 = $12,000 and 20% × $70,000 = $14,000, so $12,000. At a 22% marginal rate that saves $2,640.00.' },
      { q: 'What if taxable income is low and there are capital gains?', a: 'With $60,000 of QBI, $40,000 taxable income and $5,000 of net capital gain, the limits are $12,000 and 20% × $35,000 = $7,000. The deduction is $7,000, which at 12% saves $840.00.' },
      { q: 'Why is net capital gain taken out?', a: 'Capital gain is taxed on its own schedule, so the taxable income limit is based on income other than net capital gain.' },
      { q: 'Is 20% the current rate?', a: 'The default is illustrative, not a current-year claim. Check the rate and limits for your tax year.' },
    ],
    sources: [
      { label: 'IRS: Qualified business income deduction', url: 'https://www.irs.gov/newsroom/qualified-business-income-deduction' },
      { label: 'IRS Form 8995 instructions', url: 'https://www.irs.gov/instructions/i8995' },
    ],
  },
  related: ['self-employment-tax', 'estimated-tax-safe-harbor', 'bracket-headroom'],
  examples: [
    {
      // min(0.2 × 60,000 = 12,000, 0.2 × 70,000 = 14,000) = 12,000; × 22% = 2,640.
      values: { qbi: 60000, taxable: 70000, gains: 0, rate: 20, marginal: 22 },
      expect: { deduction: 12000, saved: 2640, qbiLimit: 12000, incomeLimit: 14000 },
      tolerance: 1e-3,
    },
    {
      // min(12,000, 0.2 × (40,000 − 5,000) = 7,000) = 7,000; × 12% = 840.
      values: { qbi: 60000, taxable: 40000, gains: 5000, rate: 20, marginal: 12 },
      expect: { deduction: 7000, saved: 840 },
      tolerance: 1e-3,
    },
  ],
});
