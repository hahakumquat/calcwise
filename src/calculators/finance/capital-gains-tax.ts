import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import {
  asStatus,
  federalIncomeTax,
  FILING_STATUS_OPTIONS,
  money,
  moneyDonut,
  pct,
  STANDARD_DEDUCTION,
  TAX_YEAR,
  type FilingStatus,
} from '../../lib/helpers/finance';

/** 2026 long-term capital gains rate thresholds on taxable income (IRS Rev. Proc. 2025-32). */
const LTCG_0_TOP: Record<FilingStatus, number> = { single: 49450, mfj: 98900, mfs: 49450, hoh: 66200 };
const LTCG_15_TOP: Record<FilingStatus, number> = { single: 545500, mfj: 613700, mfs: 306850, hoh: 579600 };
/** Net Investment Income Tax: 3.8% above these (not inflation-indexed). */
const NIIT_RATE = 0.038;
const NIIT_THRESHOLD: Record<FilingStatus, number> = { single: 200000, hoh: 200000, mfj: 250000, mfs: 125000 };

export default defineCalculator({
  slug: 'capital-gains-tax',
  title: 'Capital Gains Tax Calculator',
  category: 'finance',
  description: `Estimate ${TAX_YEAR} federal tax on selling stock, crypto or other assets: short-term vs long-term rates, the 0/15/20% brackets and the 3.8% NIIT.`,
  keywords: ['capital gains tax calculator', 'long term capital gains tax', 'short term vs long term capital gains', 'stock sale tax calculator', 'crypto tax calculator', 'net investment income tax'],
  updated: '2026-11-15',
  popular: false,
  inputs: [
    { id: 'proceeds', label: 'Sale price (proceeds)', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'What you sold the asset for, after selling fees.' },
    { id: 'basis', label: 'Cost basis', type: 'number', prefix: '$', default: 30000, min: 0, step: 1000, info: 'What you paid, including fees. For stock vested as RSUs it is the value on the vest date.' },
    { id: 'term', label: 'How long did you hold it?', type: 'select', default: 'long', options: [{ value: 'long', label: 'More than 1 year (long-term)' }, { value: 'short', label: '1 year or less (short-term)' }], info: 'Held for more than one year gets the lower long-term rates. One year or less is taxed like wages.' },
    { id: 'income', label: 'Other taxable income', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, optional: true, placeholder: '0', help: 'Your salary and other income for the year, before the standard deduction.', info: 'Wages and other ordinary income. The gain is stacked on top of it to find your rate.' },
    { id: 'status', label: 'Filing status', type: 'select', default: 'single', options: FILING_STATUS_OPTIONS, info: 'Sets your brackets, the 0% and 15% limits and the NIIT threshold.' },
    { id: 'stateRate', label: 'State tax rate on the gain', type: 'number', suffix: '%', default: 0, min: 0, max: 20, step: 0.1, optional: true, help: 'A flat estimate. Many states tax gains like income.', info: 'Approximate state income tax rate applied to the gain.' },
  ],
  outputs: [
    { id: 'totalTax', label: 'Total tax on the sale', format: 'currency', primary: true, info: 'Federal capital gains tax + NIIT + state tax.' },
    { id: 'gain', label: 'Gain (or loss)', format: 'currency', info: 'Sale price minus cost basis.' },
    { id: 'fedTax', label: 'Federal capital gains tax', format: 'currency', info: 'Extra federal income tax caused by the gain.' },
    { id: 'niit', label: 'Net Investment Income Tax', format: 'currency', info: '3.8% on the lesser of the gain or income above $200,000 single / $250,000 joint.' },
    { id: 'stateTax', label: 'State tax', format: 'currency', info: 'Your flat state rate applied to the gain.' },
    { id: 'afterTax', label: 'Gain you keep', format: 'currency', info: 'Gain minus total tax.' },
    { id: 'effectiveRate', label: 'Tax as a share of the gain', format: 'percent', precision: 1, info: 'Total tax divided by the gain.' },
  ],
  compute: (v) => {
    const proceeds = num(v.proceeds);
    const basis = num(v.basis);
    if (proceeds === null || basis === null || proceeds < 0 || basis < 0) return { totalTax: null };
    const income = Math.max(0, num(v.income) ?? 0);
    const stateRate = num(v.stateRate) ?? 0;
    if (stateRate < 0) return { totalTax: null };
    const status = asStatus(v.status);
    const long = v.term !== 'short';
    const gain = proceeds - basis;

    if (gain <= 0) {
      return {
        totalTax: 0, gain, fedTax: 0, niit: 0, stateTax: 0, afterTax: gain, effectiveRate: 0,
        tone: 'ok', badge: 'No tax: a loss',
        note: `A loss of ${money(-gain)} owes no tax. It offsets other capital gains, then up to $3,000 of ordinary income per year, and the rest carries forward. Not tax advice.`,
      };
    }

    const ordinary = Math.max(0, income - STANDARD_DEDUCTION[status]);
    let fedTax = 0;
    let at0 = 0, at15 = 0, at20 = 0;
    if (long) {
      const top0 = LTCG_0_TOP[status];
      const top15 = LTCG_15_TOP[status];
      const end = ordinary + gain;
      at0 = Math.max(0, Math.min(end, top0) - ordinary);
      at15 = Math.max(0, Math.min(end, top15) - Math.max(ordinary, top0));
      at20 = gain - at0 - at15;
      fedTax = at15 * 0.15 + at20 * 0.2;
    } else {
      fedTax = federalIncomeTax(ordinary + gain, status).tax - federalIncomeTax(ordinary, status).tax;
    }
    const magi = income + gain;
    const niit = Math.min(gain, Math.max(0, magi - NIIT_THRESHOLD[status])) * NIIT_RATE;
    const stateTax = (gain * stateRate) / 100;
    const totalTax = fedTax + niit + stateTax;
    const afterTax = gain - totalTax;
    const rate = totalTax / gain;

    let tone: 'good' | 'ok' | 'warn' | 'bad';
    if (rate < 0.05) tone = 'good';
    else if (rate < 0.2) tone = 'ok';
    else if (rate < 0.3) tone = 'warn';
    else tone = 'bad';

    const charts: ChartSpec[] = [
      moneyDonut('Where the gain goes', [{ label: 'You keep', value: afterTax }, { label: 'Federal tax', value: fedTax }, { label: 'NIIT', value: niit }, { label: 'State tax', value: stateTax }], pct(1 - rate, 0), 'kept'),
    ];

    return {
      totalTax, gain, fedTax, niit, stateTax, afterTax, effectiveRate: rate,
      tone,
      badge: long && at0 === gain ? '0% federal rate' : `Tax is ${pct(rate, 0)} of the gain`,
      chart: charts,
      steps: [
        `Gain = ${money(proceeds)} − ${money(basis)} = ${money(gain)}`,
        `Other taxable income = ${money(income, 0)} − ${money(STANDARD_DEDUCTION[status], 0)} standard deduction = ${money(ordinary, 0)}`,
        long
          ? `Long-term: ${money(at0, 0)} at 0%, ${money(at15, 0)} at 15%, ${money(at20, 0)} at 20% = ${money(fedTax)}`
          : `Short-term: taxed as ordinary income, tax with the gain minus tax without = ${money(fedTax)}`,
        `NIIT = ${pct(NIIT_RATE, 1)} × ${money(Math.min(gain, Math.max(0, magi - NIIT_THRESHOLD[status])))} = ${money(niit)}`,
        `Total = ${money(fedTax)} + ${money(niit)} + ${money(stateTax)} = ${money(totalTax)}`,
      ],
      note: `Estimate for ${TAX_YEAR}, standard deduction, no other gains, losses or credits. Not tax advice.`,
    };
  },
  content: {
    formula: [
      'Gain = sale price − cost basis',
      'Short-term (held 1 year or less): taxed at ordinary income rates, stacked on top of your other income',
      'Long-term (held more than 1 year): 0%, 15% or 20% depending on where your taxable income lands',
      'NIIT = 3.8% × the lesser of the gain or income above the threshold',
    ],
    body: [
      'A capital gain is the profit when you sell an asset such as stocks, crypto or a second property for more than your cost basis. How long you held it decides the rate. Gains on assets held one year or less are short-term and taxed like wages. Gains on assets held longer than a year are long-term and get lower rates.',
      `For ${TAX_YEAR}, long-term gains are taxed at 0% up to $49,450 of taxable income for a single filer ($98,900 joint), 15% up to $545,500 single ($613,700 joint), and 20% above that. Your gain is stacked on top of your other income, so part of one sale can fall into two different rates.`,
      'High earners may also owe the 3.8% Net Investment Income Tax once income passes $200,000 (single) or $250,000 (joint). Selling RSU shares right after they vest usually produces little or no gain, because the vest-day value is your basis.',
    ],
    sections: [
      {
        heading: 'How to lower capital gains tax',
        paragraphs: ['Hold for more than a year, sell in a year when your other income is lower, offset gains by selling losers (tax-loss harvesting), or give appreciated shares to charity. Gains inside a 401(k) or IRA are not taxed when sold.'],
      },
      {
        heading: 'What this estimate leaves out',
        paragraphs: ['It handles one sale. It ignores other gains and losses, the wash-sale rule, collectibles and real-estate depreciation rates, the home-sale exclusion and state quirks. Use it for planning, not filing.'],
      },
    ],
    faq: [
      { q: 'How much tax on a $20,000 long-term gain?', a: 'Single, $60,000 other income, no state tax: taxable ordinary income is $60,000 − $16,100 = $43,900. The first $5,550 of the gain fits under the $49,450 limit at 0%; the other $14,450 is taxed at 15% = $2,167.50, about 10.8% of the gain.' },
      { q: 'How much more is the same gain if it is short-term?', a: 'With the same income, the $20,000 is taxed at 12% on $6,500 and 22% on $13,500, which is $780 + $2,970 = $3,750, versus $2,167.50 long-term.' },
      { q: 'When does the 3.8% NIIT apply?', a: 'When your income is above $200,000 single or $250,000 joint. On a $100,000 long-term gain with $300,000 other income (single), the gain is taxed 15% = $15,000, plus NIIT 3.8% × $100,000 = $3,800, total $18,800.' },
      { q: 'What if I sold at a loss?', a: 'No tax is due. A loss offsets other capital gains first, then up to $3,000 of ordinary income each year, and any remainder carries forward.' },
    ],
    sources: [
      { label: 'IRS Topic 409: Capital gains and losses', url: 'https://www.irs.gov/taxtopics/tc409' },
      { label: 'IRS Rev. Proc. 2025-32 (2026 inflation adjustments)', url: 'https://www.irs.gov/irb/2025-45_IRB' },
      { label: 'IRS: Net Investment Income Tax', url: 'https://www.irs.gov/individuals/net-investment-income-tax' },
    ],
  },
  related: ['tax-loss-harvesting', 'rsu-tax', 'income-tax', 'investment', 'roi', 'take-home-pay', 'shares-to-sell'],
  examples: [
    {
      // ordinary 43,900; 0% zone 5,550; 15% on 14,450 = 2,167.50; no NIIT.
      values: { proceeds: 50000, basis: 30000, term: 'long', income: 60000, status: 'single', stateRate: 0 },
      expect: { gain: 20000, fedTax: 2167.5, niit: 0, stateTax: 0, totalTax: 2167.5, afterTax: 17832.5 },
      tolerance: 1e-6,
    },
    {
      // tax(63,900) = 1,240 + 4,560 + 2,970 = 8,770; tax(43,900) = 1,240 + 3,780 = 5,020; diff 3,750.
      values: { proceeds: 50000, basis: 30000, term: 'short', income: 60000, status: 'single', stateRate: 0 },
      expect: { fedTax: 3750, totalTax: 3750 },
      tolerance: 1e-6,
    },
    {
      // all 15%: 100,000 × 15% = 15,000; MAGI 400,000, excess 200,000 > gain, NIIT 3,800.
      values: { proceeds: 150000, basis: 50000, term: 'long', income: 300000, status: 'single', stateRate: 0 },
      expect: { fedTax: 15000, niit: 3800, totalTax: 18800 },
      tolerance: 1e-6,
    },
    {
      values: { proceeds: 10000, basis: 12000, term: 'long', income: 60000, status: 'single', stateRate: 0 },
      expect: { gain: -2000, totalTax: 0 },
      tolerance: 1e-6,
    },
  ],
});
