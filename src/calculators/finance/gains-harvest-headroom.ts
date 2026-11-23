import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'gains-harvest-headroom',
  title: '0% Capital Gains Headroom Calculator',
  category: 'finance',
  description: 'Find how much more long-term gain you can realise before your taxable income passes the top of the 0% capital gains bracket, and how much to sell.',
  keywords: ['0% capital gains bracket', 'tax gain harvesting calculator', 'capital gains headroom', 'how much can I sell tax free', 'gain harvesting'],
  updated: '2026-11-23',
  inputs: [
    { id: 'income', label: 'Taxable income so far', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, info: 'Taxable income for the year after deductions, before the gains you plan to sell. Include long-term gains you have already realised only in the field below.' },
    { id: 'top', label: 'Top of the 0% bracket', type: 'number', prefix: '$', default: 96700, min: 0, step: 100, info: 'The taxable income where the 0% long-term rate ends for your filing status and year. The default is only an example: check irs.gov for the current figure.' },
    { id: 'realised', label: 'Gains already realised this year', type: 'number', prefix: '$', default: 0, min: 0, step: 500, info: 'Long-term gains already sold this year that count toward the bracket.' },
    { id: 'basisPct', label: 'Cost basis as % of value', type: 'number', suffix: '%', default: 40, min: 0, max: 99, step: 5, optional: true, info: 'Optional. What you paid as a share of today\'s value for the shares you would sell. Used to turn the gain into a sale amount.' },
  ],
  outputs: [
    { id: 'headroom', label: 'Gain you can still realise at 0%', format: 'currency', primary: true, info: 'Bracket top − taxable income − gains already realised (never below 0).' },
    { id: 'saleAmount', label: 'Sale amount that produces it', format: 'currency', info: 'Headroom ÷ (1 − basis share). Needs a cost basis percentage.' },
    { id: 'used', label: 'Share of the 0% bracket used', format: 'percent', precision: 1, info: '(Taxable income + realised gains) ÷ bracket top, capped at 100%.' },
  ],
  compute: (v) => {
    const income = num(v.income), top = num(v.top), real = num(v.realised) ?? 0;
    const basis = num(v.basisPct);
    if (income === null || top === null) return { headroom: null, note: 'Enter your taxable income and the top of the 0% bracket.' };
    if (income < 0 || top < 0 || real < 0) return { headroom: null, error: 'Values cannot be negative.' };
    if (basis !== null && (basis < 0 || basis >= 100)) return { headroom: null, error: 'Cost basis must be from 0% to under 100% of value.' };
    const raw = top - income - real;
    const headroom = Math.max(0, raw);
    const used = top > 0 ? Math.min(1, (income + real) / top) : 1;
    const sale = basis === null ? null : headroom / (1 - basis / 100);
    const steps = [
      `Headroom = ${usd(top)} − ${usd(income)} − ${usd(real)} = ${usd(raw)}${raw < 0 ? ', so $0.00' : ''}`,
    ];
    if (sale !== null && basis !== null) steps.push(`Sale amount = ${usd(headroom)} ÷ (1 − ${basis}%) = ${usd(sale)}`);
    return {
      headroom,
      saleAmount: sale,
      used: used * 100,
      tone: headroom > 0 ? 'good' : 'warn',
      badge: headroom > 0 ? 'Room left' : 'No room left',
      chart: {
        type: 'bar',
        title: 'Taxable income against the 0% bracket top',
        format: { format: 'currency' },
        categories: ['Income', 'Realised gains', 'Headroom'],
        series: [{ name: 'Amount', values: [income, real, headroom] }],
      },
      steps,
      note: 'Gains above the bracket top are taxed at the next rate, and state tax, the net investment income tax and the effect of gains on credits are not included. Confirm the bracket figure on irs.gov.',
    };
  },
  content: {
    formula: [
      'Headroom = top of the 0% bracket − taxable income − gains already realised (never below 0)',
      'Sale amount = headroom ÷ (1 − cost basis share of value)',
      'Bracket used = (taxable income + realised gains) ÷ bracket top',
    ],
    body: [
      'Long-term capital gains are taxed in steps that depend on your taxable income. Up to a limit, which depends on your filing status and the year, the rate is 0%. Gain harvesting means selling appreciated shares up to that limit and, if you wish, buying them back, so the higher cost basis lowers future gains.',
      'This calculator works out how much room is left. Enter your taxable income before the sale, the top of the 0% bracket for your filing status, and any gains you have already realised. The result is the gain you can still add before the 0% rate stops applying.',
      'If you know the shares are worth, say, 40% cost and 60% gain, add the cost basis share. The calculator then shows how much to sell to realise exactly that gain.',
      'The bracket top changes every year and the default here is only an example. Check irs.gov for the current figure for your filing status. Gains also add to income used for other tests, such as credits and some healthcare subsidies, and state tax may apply, so treat this as a first estimate and talk to a tax professional if unsure.',
    ],
    faq: [
      { q: 'How much gain can I realise at 0% with $60,000 income and a $96,700 limit?', a: 'With no gains realised yet, headroom is $96,700 − $60,000 = $36,700.' },
      { q: 'How much do I sell if my basis is 40% of value?', a: 'Each dollar sold holds 60 cents of gain. To realise $36,700 you would sell $36,700 ÷ 0.6 = $61,166.67 of shares.' },
      { q: 'What if my income is already above the bracket top?', a: 'Headroom shows $0. Selling more would be taxed at the next long-term rate.' },
      { q: 'Where do I find the 0% bracket top?', a: 'The IRS publishes it each year for each filing status. Check irs.gov and type the figure into the second field.' },
    ],
    sources: [
      { label: 'Topic no. 409, Capital gains and losses (IRS)', url: 'https://www.irs.gov/taxtopics/tc409' },
    ],
  },
  related: ['capital-gains-tax', 'tax-loss-harvesting', 'shares-to-sell', 'income-tax'],
  examples: [
    // headroom 96700 - 60000 - 0 = 36700; sale 36700 / 0.6 = 61166.666...; used 60000/96700 = 62.0476%
    { values: { income: 60000, top: 96700, realised: 0, basisPct: 40 }, expect: { headroom: 36700, saleAmount: 61166.666666667, used: 62.0475698035 }, tolerance: 1e-4 },
    // headroom 90000 - 50000 - 10000 = 30000; basis 0 so sale = 30000; used 60000/90000 = 66.6667%
    { values: { income: 50000, top: 90000, realised: 10000, basisPct: 0 }, expect: { headroom: 30000, saleAmount: 30000, used: 66.6666666667 }, tolerance: 1e-4 },
    // already above: 100000 + 5000 > 96700 -> headroom 0, sale 0, used capped 100
    { values: { income: 100000, top: 96700, realised: 5000, basisPct: 50 }, expect: { headroom: 0, saleAmount: 0, used: 100 }, tolerance: 1e-6 },
  ],
});
