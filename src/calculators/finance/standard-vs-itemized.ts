import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'standard-vs-itemized',
  title: 'Standard vs Itemized Deduction Calculator',
  seoTitle: 'Standard vs Itemized Deduction Calculator',
  metaDescription: 'Add up your mortgage interest, state and local taxes and charity to see whether the standard or itemized deduction is bigger, and what it saves in tax.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Compare the standard deduction with your itemized total and see the tax difference at your marginal rate.',
  keywords: ['standard vs itemized deduction calculator', 'should i itemize', 'itemized deduction calculator', 'standard deduction or itemize', 'do i itemize my taxes'],
  popular: false,
  inputs: [
    { id: 'standard', label: 'Standard deduction for your filing status', type: 'number', prefix: '$', default: 15000, min: 0, step: 100, info: 'Example figure only. Enter the current amount for your filing status and tax year from irs.gov.' },
    { id: 'mortgage', label: 'Mortgage interest', type: 'number', prefix: '$', default: 8000, min: 0, step: 100, info: 'Home mortgage interest paid in the year.' },
    { id: 'salt', label: 'State and local taxes paid', type: 'number', prefix: '$', default: 6000, min: 0, step: 100, info: 'Enter the amount you can deduct after any IRS cap (check irs.gov for the current limit).' },
    { id: 'charity', label: 'Charitable gifts', type: 'number', prefix: '$', default: 2500, min: 0, step: 100, info: 'Gifts to qualifying charities.' },
    { id: 'other', label: 'Other itemized deductions', type: 'number', prefix: '$', default: 0, min: 0, step: 100, info: 'Anything else you can itemize, such as qualifying medical costs above the IRS threshold.' },
    { id: 'rate', label: 'Marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 60, step: 1, info: 'The rate on your last dollar of taxable income.' },
  ],
  outputs: [
    { id: 'taxSaved', label: 'Tax saved by the larger deduction', format: 'currency', precision: 0, primary: true, info: 'Difference between the two deductions × your marginal rate.' },
    { id: 'itemized', label: 'Your itemized total', format: 'currency', precision: 0, info: 'Mortgage interest + state and local taxes + charity + other.' },
    { id: 'standardOut', label: 'Standard deduction', format: 'currency', precision: 0, info: 'The figure you entered.' },
    { id: 'extra', label: 'Larger deduction beats the other by', format: 'currency', precision: 0, info: 'How much more deduction you get from the better choice.' },
  ],
  compute: (v) => {
    const standard = num(v.standard);
    const mortgage = num(v.mortgage);
    const salt = num(v.salt);
    const charity = num(v.charity);
    const other = num(v.other);
    const rate = num(v.rate);
    if (standard === null || mortgage === null || salt === null || charity === null || other === null || rate === null) return { taxSaved: null };
    if (standard < 0 || mortgage < 0 || salt < 0 || charity < 0 || other < 0) return { taxSaved: null, error: 'Amounts cannot be negative.' };
    if (rate < 0 || rate > 100) return { taxSaved: null, error: 'Enter a tax rate between 0% and 100%.' };

    const itemized = mortgage + salt + charity + other;
    const extra = Math.abs(itemized - standard);
    const taxSaved = extra * (rate / 100);
    const itemizeWins = itemized > standard;
    const tie = itemized === standard;
    const better = tie ? 'Tie' : itemizeWins ? 'Itemize' : 'Take the standard deduction';

    return {
      taxSaved,
      itemized,
      standardOut: standard,
      extra,
      tone: tie ? 'ok' : 'good',
      badge: tie ? 'It is a tie' : itemizeWins ? 'Itemizing wins' : 'The standard deduction wins',
      chart: {
        type: 'bar',
        title: 'Standard vs itemized deduction',
        categories: ['Standard', 'Itemized'],
        series: [{ name: 'Deduction', values: [standard, itemized] }],
        format: CURRENCY,
        highlight: itemizeWins ? 1 : 0,
      },
      steps: [
        `Itemized = ${money(mortgage, 0)} + ${money(salt, 0)} + ${money(charity, 0)} + ${money(other, 0)} = ${money(itemized, 0)}`,
        `Standard = ${money(standard, 0)}, so the difference is ${money(extra, 0)} (${better.toLowerCase()})`,
        `Tax saved = ${money(extra, 0)} × ${rate}% = ${money(taxSaved, 0)}`,
      ],
      note: tie
        ? `Both come to ${money(standard, 0)}, so the choice makes no difference to your tax. The standard deduction is simpler.`
        : `${itemizeWins ? 'Itemizing' : 'The standard deduction'} gives you ${money(extra, 0)} more deduction, which is worth about ${money(taxSaved, 0)} at ${rate}%. Check the current standard deduction on irs.gov; the default here is only an example.`,
    };
  },
  content: {
    formula: [
      'Itemized = mortgage interest + state and local taxes + charity + other',
      'Larger deduction = the bigger of itemized and standard',
      'Tax saved = |itemized − standard| × marginal rate',
    ],
    body: [
      'Each year you choose between the standard deduction, a flat amount set by the IRS, and itemizing, where you add up your own deductible costs. You take whichever is larger. This calculator adds up your itemized costs, compares them with the standard figure and shows what the difference is worth at your marginal rate.',
      'Example: with a $15,000 standard deduction and $8,000 mortgage interest, $6,000 state and local taxes and $2,500 charity, your itemized total is $16,500. Itemizing wins by $1,500, which saves $330 at 22%.',
      'The standard deduction changes every year and depends on filing status. The $15,000 default here is only a placeholder. Enter the current figure from irs.gov.',
    ],
    sections: [
      {
        heading: 'Bunching charity can tip the result',
        paragraphs: [
          'If your itemized total sits just under the standard deduction, giving two years of charity in one year can push you over it. You itemize in the big year and take the standard deduction in the other. Try it by adding the second year of gifts to the charity box and comparing.',
        ],
      },
      {
        heading: 'What this leaves out',
        paragraphs: [
          'The tax saved figure is the difference between the two deductions times one marginal rate. It does not include limits on deductions, phase-outs, the alternative minimum tax, state tax rules or credits. Enter state and local taxes after any IRS cap. This is general information, not tax advice.',
        ],
      },
    ],
    faq: [
      { q: 'How do I know whether to itemize?', a: 'Itemize if your itemized total is larger than the standard deduction. With a $15,000 standard deduction and $16,500 of itemized costs, itemizing wins by $1,500.' },
      { q: 'How much tax does the better choice save?', a: 'The difference between the two deductions times your marginal rate. At 22%, a $1,500 difference saves $330.' },
      { q: 'What if the standard deduction is larger?', a: 'Then take it. With $15,000 standard and $12,000 itemized, the standard deduction wins by $3,000, worth $660 at 22%.' },
      { q: 'What standard deduction should I enter?', a: 'The current figure for your filing status and tax year, from irs.gov. The $15,000 default is an example, not an official number.' },
      { q: 'What if the two are equal?', a: 'The difference is $0 and so is the tax saved. Most people then take the standard deduction because it needs no records.' },
    ],
    sources: [
      { label: 'IRS Topic No. 501, Should I itemize?', url: 'https://www.irs.gov/taxtopics/tc501' },
      { label: 'IRS Publication 501, Dependents, Standard Deduction, and Filing Information', url: 'https://www.irs.gov/publications/p501' },
    ],
  },
  related: ['income-tax', 'tax-refund-estimator'],
  examples: [
    // itemized 8000+6000+2500+0 = 16500; extra 1500; saved 1500*0.22 = 330
    { values: { standard: 15000, mortgage: 8000, salt: 6000, charity: 2500, other: 0, rate: 22 }, expect: { itemized: 16500, extra: 1500, taxSaved: 330 }, tolerance: 1e-6 },
    // itemized 6000+3000+2000+1000 = 12000; extra 3000; saved 3000*0.22 = 660
    { values: { standard: 15000, mortgage: 6000, salt: 3000, charity: 2000, other: 1000, rate: 22 }, expect: { itemized: 12000, extra: 3000, taxSaved: 660 }, tolerance: 1e-6 },
    // tie: 8000+4000+3000+0 = 15000; extra 0; saved 0
    { values: { standard: 15000, mortgage: 8000, salt: 4000, charity: 3000, other: 0, rate: 22 }, expect: { itemized: 15000, extra: 0, taxSaved: 0 }, tolerance: 1e-6 },
  ],
});
