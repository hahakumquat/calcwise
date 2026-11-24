import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'dependent-care-fsa',
  title: 'Dependent Care FSA: Tax Saved on Childcare',
  category: 'finance',
  description: 'See how much tax a dependent care FSA saves on your childcare costs. Enter your election, the limit and your tax rates to get the yearly saving.',
  keywords: ['dependent care fsa calculator', 'dependent care fsa savings', 'childcare fsa tax savings', 'dcfsa calculator', 'how much does a dependent care fsa save'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'expenses', label: 'Childcare expenses for the year', type: 'number', prefix: '$', default: 12000, min: 0, step: 500, info: 'Daycare, after-school care or similar costs you expect to pay this year.' },
    { id: 'election', label: 'FSA election', type: 'number', prefix: '$', default: 5000, min: 0, step: 250, info: 'The amount you plan to set aside from your pay for the year.' },
    { id: 'limit', label: 'FSA yearly limit', type: 'number', prefix: '$', default: 5000, min: 0, step: 250, info: 'The household limit for your tax year and filing status. Check irs.gov; it is not built in here.' },
    { id: 'federal', label: 'Federal marginal tax rate', type: 'number', default: 22, min: 0, max: 50, step: 1, suffix: '%', info: 'The rate on your last dollar of income.' },
    { id: 'fica', label: 'Social Security and Medicare (FICA)', type: 'number', default: 7.65, min: 0, max: 15.3, step: 0.05, suffix: '%', info: 'Usually 7.65% for employees. FSA dollars are generally not subject to it.' },
    { id: 'state', label: 'State income tax rate', type: 'number', default: 5, min: 0, max: 20, step: 0.5, suffix: '%', info: 'Use 0 if your state has no income tax or does not follow the federal treatment.' },
  ],
  outputs: [
    { id: 'saved', label: 'Tax saved per year', format: 'currency', precision: 2, primary: true, info: 'Contribution × (federal + FICA + state).' },
    { id: 'contribution', label: 'Counted FSA contribution', format: 'currency', precision: 2, info: 'The smallest of your election, your expenses and the limit.' },
    { id: 'rate', label: 'Combined tax rate', format: 'percent', precision: 2, info: 'Federal + FICA + state.' },
  ],
  compute: (v) => {
    const expenses = num(v.expenses);
    const election = num(v.election);
    const limit = num(v.limit);
    const fed = num(v.federal);
    const fica = num(v.fica);
    const state = num(v.state);
    if (expenses === null || election === null || limit === null || fed === null || fica === null || state === null) return { saved: null };
    if (expenses < 0 || election < 0 || limit < 0 || fed < 0 || fica < 0 || state < 0) return { saved: null };
    const contribution = Math.min(election, expenses, limit);
    const rate = (fed + fica + state) / 100;
    const saved = contribution * rate;
    const outside = Math.max(0, expenses - contribution);
    if (contribution === 0) {
      return { saved: 0, contribution: 0, rate, tone: 'warn', badge: 'Nothing counted', note: 'Your election, expenses or limit is zero, so no pre-tax dollars are counted.' };
    }
    const capped = contribution < election;
    return {
      saved,
      contribution,
      rate,
      tone: 'good',
      badge: `${money(saved)} saved on ${money(contribution)}`,
      note: `${money(contribution)} paid with pre-tax dollars at a ${fmt(rate * 100, 2)}% combined rate saves ${money(saved)}.${capped ? ' Your election is higher than the amount that counts, so the extra would be wasted.' : ''} ${money(outside)} of childcare is paid with after-tax money. The child and dependent care credit is reduced by FSA dollars and is not computed here.`,
      chart: {
        type: 'bar' as const,
        title: 'Where the childcare money comes from',
        categories: ['Pre-tax (FSA)', 'After-tax'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Childcare paid', values: [contribution, outside] }],
      },
      steps: [
        `Counted contribution = smallest of ${money(election)}, ${money(expenses)} and ${money(limit)} = ${money(contribution)}`,
        `Combined rate = ${fmt(fed)}% + ${fmt(fica)}% + ${fmt(state)}% = ${fmt(rate * 100, 2)}%`,
        `Tax saved = ${money(contribution)} × ${fmt(rate * 100, 2)}% = ${money(saved)}`,
      ],
    };
  },
  content: {
    formula: [
      'Counted contribution = smallest of election, childcare expenses and limit',
      'Combined rate = federal + FICA + state',
      'Tax saved = counted contribution × combined rate',
    ],
    body: [
      'A dependent care FSA lets you pay for childcare with money taken from your pay before tax. Because that money skips income tax and usually payroll tax, every dollar you run through the account costs you less. Open enrollment and the January payroll reset are when most people choose an amount.',
      'Example: $12,000 of childcare, a $5,000 election and a $5,000 limit. The counted contribution is $5,000. The combined rate is 22% + 7.65% + 5% = 34.65%, so the tax saved is 5,000 × 34.65% = $1,732.50.',
      'The limit and your rates are inputs, because they change by year and by person. Look up the limit on irs.gov. This is use-it-or-lose-it money in most plans, so only elect what you expect to spend on eligible care. The child and dependent care tax credit is reduced by dollars paid from an FSA, so the true gain can be smaller than shown, and that interaction is not modelled. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much does a dependent care FSA save?', a: 'The counted contribution times your combined tax rate. With $5,000 counted at 34.65%, that is $1,732.50 a year.' },
      { q: 'What is counted as the contribution?', a: 'The smallest of your election, your childcare expenses and the yearly limit. Money above the smallest of those would not help you.' },
      { q: 'What limit should I enter?', a: 'The household limit for your tax year and filing status, from irs.gov. This calculator does not include one, so it never goes out of date.' },
      { q: 'Does this include the child and dependent care credit?', a: 'No. That credit is reduced by FSA dollars, so the real benefit can differ. This calculator shows the FSA tax saving only.' },
      { q: 'What happens to unused FSA money?', a: 'Most plans make you forfeit it. Elect only what you expect to spend on eligible care and check your plan rules.' },
    ],
    sources: [],
  },
  related: ['childcare-vs-work', 'hsa-fsa-savings', 'fsa-spend-down', 'take-home-pay'],
  examples: [
    // contribution 5000; rate .3465; saved 1732.5
    { values: { expenses: 12000, election: 5000, limit: 5000, federal: 22, fica: 7.65, state: 5 }, expect: { contribution: 5000, rate: 0.3465, saved: 1732.5 } },
    // contribution min(6000, 3000, 5000)=3000; rate .12+.0765=.1965; saved 589.5
    { values: { expenses: 3000, election: 6000, limit: 5000, federal: 12, fica: 7.65, state: 0 }, expect: { contribution: 3000, rate: 0.1965, saved: 589.5 } },
  ],
});
