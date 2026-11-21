import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'home-office-deduction',
  title: 'Home Office Deduction: Simplified vs Actual',
  category: 'finance',
  description: 'Compare the IRS simplified home office method ($5 per sq ft, up to 300 sq ft) with the actual-expense method to see which deduction is larger.',
  keywords: ['home office deduction calculator', 'simplified method home office', 'home office deduction simplified vs actual', 'form 8829 estimate', 'self employed home office deduction', 'home office square footage deduction'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'office', label: 'Office space used for business', type: 'number', suffix: 'sq ft', default: 150, min: 1, step: 10, info: 'Space used regularly and exclusively for business.' },
    { id: 'home', label: 'Total size of your home', type: 'number', suffix: 'sq ft', default: 1500, min: 1, step: 50, info: 'All of the living area, including the office.' },
    { id: 'expenses', label: 'Total yearly home expenses', type: 'number', prefix: '$', default: 24000, min: 0, step: 500, info: 'Rent or mortgage interest, utilities, insurance, repairs and similar costs for the whole year.' },
  ],
  outputs: [
    { id: 'better', label: 'Larger deduction', format: 'currency', primary: true, info: 'The bigger of the two methods.' },
    { id: 'simplified', label: 'Simplified method', format: 'currency', info: '$5 × office square feet, capped at 300 sq ft ($1,500).' },
    { id: 'actual', label: 'Actual-expense method', format: 'currency', info: 'Yearly home expenses × office share of the home.' },
    { id: 'share', label: 'Office share of your home', format: 'percent', precision: 1, info: 'Office sq ft ÷ home sq ft.' },
    { id: 'diff', label: 'Difference between methods', format: 'currency', info: 'Larger deduction minus the smaller one.' },
  ],
  compute: (v) => {
    const office = num(v.office);
    const home = num(v.home);
    const expenses = num(v.expenses);
    if (office === null || home === null || expenses === null) return { better: null };
    if (office <= 0 || home <= 0 || expenses < 0 || office > home) return { better: null };
    const simplified = 5 * Math.min(office, 300);
    const share = office / home;
    const actual = expenses * share;
    const better = Math.max(simplified, actual);
    const diff = Math.abs(actual - simplified);
    const useActual = actual > simplified;
    return {
      better,
      simplified,
      actual,
      share,
      diff,
      tone: 'ok',
      badge: actual === simplified ? 'Both methods match' : useActual ? 'Actual expenses win' : 'Simplified method wins',
      chart: {
        type: 'bar',
        title: 'Deduction by method',
        categories: ['Simplified', 'Actual'],
        format: { format: 'currency' },
        series: [{ name: 'Deduction', values: [simplified, actual] }],
      },
      steps: [
        `Simplified = $5 × ${Math.min(office, 300)} sq ft (capped at 300) = ${money(simplified, 2)}`,
        `Office share = ${office} ÷ ${home} = ${+(share * 100).toFixed(2)}%`,
        `Actual = ${money(expenses, 0)} × ${+(share * 100).toFixed(2)}% = ${money(actual, 2)}`,
      ],
      note: `${useActual ? 'Actual expenses' : 'The simplified method'} gives the larger deduction, by ${money(diff, 2)}. This only applies if you are self-employed and the space is used regularly and exclusively for business. Employees cannot claim it. The actual method also involves depreciation and record keeping not modelled here, so treat this as a planning estimate, not tax advice.`,
    };
  },
  content: {
    formula: [
      'Simplified method = $5 × office square feet, up to 300 sq ft (maximum $1,500)',
      'Office share = office square feet ÷ total home square feet',
      'Actual method = total yearly home expenses × office share',
    ],
    body: [
      'If you work for yourself and use part of your home regularly and exclusively for business, you may be able to deduct part of the cost of the home. The IRS offers two ways to work it out, and the larger one is usually the better choice.',
      'The simplified method needs no expense records: $5 per square foot of office, up to 300 square feet. The actual method deducts your office’s share of real home expenses, so it wins when your costs are high or your office is a big part of the home.',
    ],
    sections: [
      {
        heading: 'Who can use it',
        paragraphs: [
          'The deduction is for self-employed people, freelancers and gig workers whose space is used regularly and exclusively for business. W-2 employees cannot claim it. Check IRS Publication 587 for the full rules, including the income limit and depreciation under the actual method.',
        ],
      },
    ],
    faq: [
      { q: 'How much is the simplified home office deduction?', a: '$5 per square foot of office space, up to 300 square feet, so the maximum is $1,500. A 150 sq ft office gives $750.' },
      { q: 'Which method is better?', a: 'Whichever deduction is larger. With $24,000 of yearly home expenses and a 150 sq ft office in a 1,500 sq ft home, the office share is 10%, so actual is $2,400 against $750 simplified.' },
      { q: 'Can employees deduct a home office?', a: 'No. The deduction is for self-employed people. Employees working from home generally cannot claim it.' },
      { q: 'Does the actual method include depreciation?', a: 'Owners also claim depreciation on the office share under the actual method. This calculator does not model it, so owners may see a somewhat higher real figure.' },
      { q: 'Does the office have to be a separate room?', a: 'Not necessarily, but the space must be used regularly and exclusively for business.' },
    ],
    sources: [
      { label: 'IRS Publication 587: Business Use of Your Home', url: 'https://www.irs.gov/publications/p587' },
    ],
  },
  related: ['freelance-rate', 'income-tax', 'bonus-tax', 'break-even'],
  examples: [
    {
      // simplified 5 × 150 = 750; share 150/1500 = 10%; actual 24000 × 0.10 = 2400; diff 1650.
      values: { office: 150, home: 1500, expenses: 24000 },
      expect: { simplified: 750, share: 0.1, actual: 2400, better: 2400, diff: 1650 },
      tolerance: 0.01,
    },
    {
      // office 400 capped at 300 → 1500; share 400/2000 = 20%; actual 6000 × 0.2 = 1200; simplified wins by 300.
      values: { office: 400, home: 2000, expenses: 6000 },
      expect: { simplified: 1500, share: 0.2, actual: 1200, better: 1500, diff: 300 },
      tolerance: 0.01,
    },
  ],
});
