import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'social-security-earnings-test',
  title: 'Social Security Earnings Test Calculator',
  category: 'finance',
  description: 'Estimate how much Social Security is withheld if you work before full retirement age. Enter your earnings, yearly benefit, the earnings limit and the ratio.',
  keywords: ['social security earnings test calculator', 'social security earnings limit', 'working while collecting social security', 'social security benefits withheld', 'retirement earnings test'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'earn', label: 'Expected earnings this year', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'Wages and net self-employment income for the year.' },
    { id: 'benefit', label: 'Yearly Social Security benefit', type: 'number', prefix: '$', default: 24000, min: 0, step: 500, info: 'Your monthly benefit × 12.' },
    { id: 'limit', label: 'Earnings limit', type: 'number', prefix: '$', default: 23400, min: 0, step: 100, info: 'The SSA yearly limit that applies to you. It is higher in the year you reach full retirement age. Check the current figure.' },
    { id: 'ratio', label: '$1 withheld for every $ over', type: 'number', prefix: '$', default: 2, min: 1, step: 1, info: 'The SSA withholds $1 for every $2 over the limit before the year you reach full retirement age, and $1 for every $3 in that year.' },
  ],
  outputs: [
    { id: 'withheld', label: 'Benefits withheld', format: 'currency', precision: 2, primary: true, info: 'Earnings over the limit ÷ ratio, never more than your yearly benefit.' },
    { id: 'kept', label: 'Benefits you still receive', format: 'currency', precision: 2, info: 'Yearly benefit − withheld.' },
    { id: 'over', label: 'Earnings over the limit', format: 'currency', precision: 2, info: 'Earnings − limit, never below zero.' },
  ],
  compute: (v) => {
    const earn = num(v.earn);
    const ben = num(v.benefit);
    const lim = num(v.limit);
    const ratio = num(v.ratio);
    if ([earn, ben, lim, ratio].some((x) => x === null)) return { withheld: null };
    if ([earn, ben, lim].some((x) => (x as number) < 0)) return { withheld: null, error: 'Values cannot be negative.' };
    if (ratio! < 1) return { withheld: null, error: 'The ratio must be at least 1.' };
    const over = Math.max(0, earn! - lim!);
    const withheld = Math.min(ben!, over / ratio!);
    const kept = ben! - withheld;
    return {
      withheld,
      kept,
      over,
      tone: withheld === 0 ? 'good' : kept === 0 ? 'warn' : 'ok',
      badge: withheld === 0 ? 'Nothing withheld' : `${money(withheld)} withheld`,
      note: withheld === 0
        ? `Your earnings are at or under the ${money(lim!)} limit, so no benefits are withheld.`
        : `You are ${money(over)} over the limit, so $1 is withheld for every $${ratio} over: ${money(withheld)}. Withheld benefits are not lost for good: the SSA recalculates your benefit at full retirement age to credit them back over time, which this does not model.`,
      chart: {
        type: 'bar' as const,
        title: 'Yearly benefit',
        categories: ['Benefit'],
        series: [
          { name: 'Received', values: [kept] },
          { name: 'Withheld', values: [withheld] },
        ],
        format: CURRENCY,
        stacked: true,
      },
      steps: [
        `Over the limit = ${money(earn!)} − ${money(lim!)} = ${money(over)}`,
        `Withheld = ${money(over)} ÷ ${ratio} = ${money(over / ratio!)}, capped at ${money(ben!)} = ${money(withheld)}`,
        `Received = ${money(ben!)} − ${money(withheld)} = ${money(kept)}`,
      ],
    };
  },
  content: {
    formula: [
      'Over the limit = earnings − earnings limit (never below zero)',
      'Withheld = over the limit ÷ ratio (never more than the yearly benefit)',
      'Received = yearly benefit − withheld',
    ],
    body: [
      'If you claim Social Security before full retirement age and keep working, the SSA withholds part of your benefit once your earnings pass a yearly limit. The usual rule is $1 withheld for every $2 over the limit.',
      'Example: you earn $50,000 with a $23,400 limit, so you are $26,600 over. At $1 per $2, $13,300 is withheld and you receive $10,700 of a $24,000 yearly benefit.',
      'The rule is different in the year you reach full retirement age (a higher limit and $1 for every $3), and it stops entirely after that. Only your earnings count, not investment income or pensions. This is general information, not tax or benefits advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Do I lose the withheld money for good?', a: 'No. The SSA adjusts your benefit upward at full retirement age to account for the months withheld. This calculator shows only the withholding for the year.' },
      { q: 'What limit should I use?', a: 'The SSA publishes a limit each year, and a higher one for the year you reach full retirement age. Check the SSA page below and edit the field.' },
      { q: 'What ratio should I use?', a: '2 if you are under full retirement age all year. 3 in the year you reach it.' },
      { q: 'Does investment income count?', a: 'No. The earnings test counts wages and net self-employment income only.' },
      { q: 'Does this apply after full retirement age?', a: 'No. After you reach full retirement age, the earnings test no longer reduces your benefit.' },
    ],
    sources: [
      { label: 'SSA: How work affects your benefits', url: 'https://www.ssa.gov/benefits/retirement/planner/whileworking.html' },
    ],
  },
  related: ['social-security-breakeven', 'social-security-cola', 'income-tax', 'take-home-pay'],
  examples: [
    // over 26600; /2 = 13300; kept 10700
    { values: { earn: 50000, benefit: 24000, limit: 23400, ratio: 2 }, expect: { over: 26600, withheld: 13300, kept: 10700 } },
    // under limit
    { values: { earn: 20000, benefit: 18000, limit: 23400, ratio: 2 }, expect: { over: 0, withheld: 0, kept: 18000 } },
    // cap at benefit: over 60000 / 3 = 20000, capped 12000
    { values: { earn: 80000, benefit: 12000, limit: 20000, ratio: 3 }, expect: { over: 60000, withheld: 12000, kept: 0 } },
  ],
});
