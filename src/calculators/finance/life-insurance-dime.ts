import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, moneyDonut } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'life-insurance-dime',
  title: 'Life Insurance Calculator (DIME)',
  category: 'finance',
  description: 'Estimate how much life insurance you might need with the DIME rule of thumb: debt, income, mortgage and education, minus cover and savings you already have.',
  metaDescription: 'Life insurance calculator using the DIME rule of thumb: add debt, income to replace, mortgage and education, then subtract existing cover. Not advice.',
  updated: '2026-11-28',
  keywords: ['life insurance calculator', 'dime method life insurance', 'how much life insurance do i need', 'dime formula', '10 times income rule', 'life insurance coverage gap'],
  inputs: [
    { id: 'debt', label: 'Debt (not mortgage)', type: 'number', prefix: '$', default: 15000, min: 0, step: 1000, info: 'Car loans, credit cards, student loans and other debts your family would have to pay off. Leave out the mortgage, which has its own field.' },
    { id: 'income', label: 'Annual income to replace', type: 'number', prefix: '$', default: 80000, min: 0, step: 1000, info: 'The yearly income your family would lose, before tax. Use the amount they would actually need, which may be less than your full pay.' },
    { id: 'years', label: 'Years to replace income', type: 'number', suffix: 'years', default: 10, min: 1, step: 1, info: 'How many years of income the payout should cover. 10 is a common starting point; use more if children are young.' },
    { id: 'mortgage', label: 'Mortgage balance', type: 'number', prefix: '$', default: 250000, min: 0, step: 5000, info: 'What you still owe on your home loan, from your latest statement.' },
    { id: 'education', label: 'Education cost for children', type: 'number', prefix: '$', default: 100000, min: 0, step: 5000, info: 'Your estimate of college or school costs for all your children.' },
    { id: 'final', label: 'Final expenses', type: 'number', prefix: '$', default: 0, min: 0, step: 1000, optional: true, info: 'Funeral and related costs. Leave blank or 0 to skip.' },
    { id: 'coverage', label: 'Existing life insurance', type: 'number', prefix: '$', default: 300000, min: 0, step: 10000, optional: true, info: 'Total death benefit from policies you already have, including cover through work.' },
    { id: 'savings', label: 'Liquid savings', type: 'number', prefix: '$', default: 50000, min: 0, step: 5000, optional: true, info: 'Cash and easy-to-sell savings your family could use. Leave out retirement accounts you would not tap.' },
  ],
  outputs: [
    { id: 'gap', label: 'Estimated coverage gap', format: 'currency', precision: 0, primary: true, info: 'DIME need minus existing cover and savings, never below zero. A rough estimate, not advice.' },
    { id: 'need', label: 'Total DIME need', format: 'currency', precision: 0, info: 'Debt + income × years + mortgage + education + final expenses.' },
    { id: 'rule10', label: 'Rule of thumb: 10 × income', format: 'currency', precision: 0, info: 'A separate, even rougher rule of thumb shown for contrast. It ignores your debts and goals.' },
  ],
  compute: (v) => {
    const debt = num(v.debt);
    const income = num(v.income);
    const years = num(v.years);
    const mortgage = num(v.mortgage);
    const edu = num(v.education);
    const fin = num(v.final) ?? 0;
    const cov = num(v.coverage) ?? 0;
    const sav = num(v.savings) ?? 0;
    if (debt === null || income === null || years === null || mortgage === null || edu === null) return { gap: null };
    if ([debt, income, mortgage, edu, fin, cov, sav].some((x) => x < 0)) return { gap: null, error: 'Amounts cannot be negative.' };
    if (years <= 0) return { gap: null, error: 'Years to replace income must be above 0.' };

    const incomePart = income * years;
    const need = debt + incomePart + mortgage + edu + fin;
    const gap = Math.max(0, need - cov - sav);
    const rule10 = income * 10;

    return {
      gap,
      need,
      rule10,
      tone: gap === 0 ? 'good' : 'warn',
      badge: gap === 0 ? 'No gap on this estimate' : `About ${money(gap, 0)} short on this rough estimate`,
      note: 'DIME is a rule of thumb for education, not financial advice. Policy type, term and cost are best discussed with a licensed agent.',
      chart: moneyDonut(
        'What the DIME total is made of',
        [
          { label: 'Debt', value: debt },
          { label: `Income × ${years} yrs`, value: incomePart },
          { label: 'Mortgage', value: mortgage },
          { label: 'Education', value: edu },
          { label: 'Final expenses', value: fin },
        ],
        money(need, 0),
        'total need',
      ),
      steps: [
        `Need = ${money(debt, 0)} + ${money(income, 0)} × ${years} + ${money(mortgage, 0)} + ${money(edu, 0)} + ${money(fin, 0)} = ${money(need, 0)}`,
        `Gap = ${money(need, 0)} − ${money(cov, 0)} − ${money(sav, 0)} = ${money(gap, 0)}${need - cov - sav < 0 ? ' (below zero, shown as $0)' : ''}`,
        `10 × income rule of thumb = ${money(rule10, 0)}`,
      ],
    };
  },
  content: {
    formula: ['Need = Debt + (Income × Years) + Mortgage + Education + Final expenses', 'Gap = max(0, Need − Existing coverage − Savings)'],
    body: [
      'DIME stands for Debt, Income, Mortgage and Education. It is a quick rule of thumb for how much life insurance a household might want so that debts are paid, the mortgage is cleared, children can still go to school and the family has years of income to adjust.',
      'Example: $15,000 of other debt, $80,000 × 10 years of income ($800,000), a $250,000 mortgage and $100,000 for education give a need of $1,165,000. With $300,000 of existing cover and $50,000 of savings the gap is $815,000.',
      'The 10 × income rule shown alongside would give $800,000 here. Both are rough guides that ignore many things, such as a partner’s income, Social Security survivor benefits, inflation and how your family would really live. This is education, not advice. A licensed agent can help with policy type and cost.',
    ],
    faq: [
      { q: 'What is the DIME method?', a: 'A rule of thumb that adds Debt, Income (times a number of years), Mortgage and Education costs, then subtracts cover and savings you already have.' },
      { q: 'What is the DIME result for the default example?', a: 'Need is $15,000 + $800,000 + $250,000 + $100,000 = $1,165,000. After $300,000 of existing cover and $50,000 of savings, the gap is $815,000.' },
      { q: 'How does that compare with 10 × income?', a: 'For $80,000 of income, 10 × income is $800,000. It is a rougher guide because it ignores your debts, mortgage and children.' },
      { q: 'What if my cover and savings exceed the need?', a: 'The gap shows $0. It never goes negative.' },
      { q: 'Is this financial advice?', a: 'No. It is an educational rule of thumb. A licensed agent can advise on the policy type and cost for your situation.' },
    ],
    sources: [{ label: 'CFPB: Consumer tools', url: 'https://www.consumerfinance.gov/consumer-tools/' }],
  },
  related: ['emergency-fund', 'mortgage', 'debt-to-income'],
  examples: [
    // income part 80,000 × 10 = 800,000; need = 15,000 + 800,000 + 250,000 + 100,000 + 0 = 1,165,000
    // gap = 1,165,000 − 300,000 − 50,000 = 815,000; 10 × income = 800,000
    { values: { debt: 15000, income: 80000, years: 10, mortgage: 250000, education: 100000, final: 0, coverage: 300000, savings: 50000 }, expect: { need: 1165000, gap: 815000, rule10: 800000 } },
    // 5,000 + 60,000 × 15 (900,000) + 0 + 40,000 + final 15,000 = 960,000; coverage 1,000,000 > need so gap 0
    { values: { debt: 5000, income: 60000, years: 15, mortgage: 0, education: 40000, final: 15000, coverage: 1000000, savings: 0 }, expect: { need: 960000, gap: 0, rule10: 600000 } },
  ],
});
