import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const WORK_DAYS = 260;

export default defineCalculator({
  slug: 'job-offer-comparison',
  title: 'Job Offer Comparison: Total Compensation',
  category: 'finance',
  description: 'Compare two job offers by total yearly value: salary, bonus, 401(k) match, equity and extras, minus commuting cost, and the value of each working day.',
  keywords: ['job offer comparison calculator', 'compare job offers', 'total compensation calculator', 'which job offer is better', 'salary vs benefits calculator', 'offer comparison'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'baseA', label: 'Offer A: base salary', type: 'number', prefix: '$', default: 100000, min: 0, step: 1000, info: 'Yearly base pay for offer A, before tax.' },
    { id: 'bonusA', label: 'Offer A: bonus', type: 'number', suffix: '% of base', default: 10, min: 0, max: 200, step: 1, optional: true, info: 'Expected yearly bonus as a percentage of base. Use what you realistically expect, not the maximum.' },
    { id: 'matchA', label: 'Offer A: 401(k) match', type: 'number', suffix: '% of base', default: 4, min: 0, max: 30, step: 0.5, optional: true, info: 'Employer match you would collect, as a percentage of base. Only counts if you contribute enough to get it.' },
    { id: 'equityA', label: 'Offer A: equity per year', type: 'number', prefix: '$', default: 0, min: 0, step: 1000, optional: true, info: 'Your own estimate of yearly stock or option value. Treat it cautiously: it can be worth far less than the grant.' },
    { id: 'otherA', label: 'Offer A: other benefits per year', type: 'number', prefix: '$', default: 0, min: 0, step: 500, optional: true, info: 'Anything else worth money to you, such as a stipend or extra health coverage.' },
    { id: 'commuteA', label: 'Offer A: commute cost per year', type: 'number', prefix: '$', default: 0, min: 0, step: 100, optional: true, info: 'Gas, transit and parking for a year. Subtracted from the total.' },
    { id: 'ptoA', label: 'Offer A: paid days off', type: 'number', suffix: 'days', default: 15, min: 0, max: 100, step: 1, optional: true, info: 'Vacation plus holidays. Used for the value per working day, assuming 260 weekdays a year.' },
    { id: 'baseB', label: 'Offer B: base salary', type: 'number', prefix: '$', default: 108000, min: 0, step: 1000, info: 'Yearly base pay for offer B, before tax.' },
    { id: 'bonusB', label: 'Offer B: bonus', type: 'number', suffix: '% of base', default: 0, min: 0, max: 200, step: 1, optional: true, info: 'Expected yearly bonus as a percentage of base.' },
    { id: 'matchB', label: 'Offer B: 401(k) match', type: 'number', suffix: '% of base', default: 3, min: 0, max: 30, step: 0.5, optional: true, info: 'Employer match as a percentage of base.' },
    { id: 'equityB', label: 'Offer B: equity per year', type: 'number', prefix: '$', default: 0, min: 0, step: 1000, optional: true, info: 'Your own estimate of yearly stock or option value.' },
    { id: 'otherB', label: 'Offer B: other benefits per year', type: 'number', prefix: '$', default: 0, min: 0, step: 500, optional: true, info: 'Anything else worth money to you.' },
    { id: 'commuteB', label: 'Offer B: commute cost per year', type: 'number', prefix: '$', default: 0, min: 0, step: 100, optional: true, info: 'Gas, transit and parking for a year.' },
    { id: 'ptoB', label: 'Offer B: paid days off', type: 'number', suffix: 'days', default: 20, min: 0, max: 100, step: 1, optional: true, info: 'Vacation plus holidays.' },
  ],
  outputs: [
    { id: 'diff', label: 'Offer A minus Offer B (per year)', format: 'currency', primary: true, info: 'Total value of A − total value of B. Negative means B is worth more.' },
    { id: 'totalA', label: 'Offer A total value', format: 'currency', info: 'Base + bonus + match + equity + other − commute.' },
    { id: 'totalB', label: 'Offer B total value', format: 'currency', info: 'Base + bonus + match + equity + other − commute.' },
    { id: 'dayA', label: 'Offer A value per working day', format: 'currency', info: 'Total value ÷ (260 − paid days off).' },
    { id: 'dayB', label: 'Offer B value per working day', format: 'currency', info: 'Total value ÷ (260 − paid days off).' },
  ],
  compute: (v) => {
    const side = (s: 'A' | 'B') => {
      const base = num(v['base' + s]);
      if (base === null || base < 0) return null;
      const bonus = (num(v['bonus' + s]) ?? 0) / 100 * base;
      const match = (num(v['match' + s]) ?? 0) / 100 * base;
      const equity = num(v['equity' + s]) ?? 0;
      const other = num(v['other' + s]) ?? 0;
      const commute = num(v['commute' + s]) ?? 0;
      const pto = num(v['pto' + s]) ?? 0;
      if (bonus < 0 || match < 0 || equity < 0 || other < 0 || commute < 0 || pto < 0 || pto >= WORK_DAYS) return null;
      const total = base + bonus + match + equity + other - commute;
      return { base, bonus, match, equity, other, commute, pto, total, day: total / (WORK_DAYS - pto) };
    };
    const a = side('A');
    const b = side('B');
    if (!a || !b) return { diff: null };

    const diff = a.total - b.total;
    const winner = diff > 0 ? 'A' : diff < 0 ? 'B' : null;
    const line = (n: string, s: NonNullable<typeof a>) =>
      `Offer ${n} = ${money(s.base, 0)} + ${money(s.bonus, 0)} bonus + ${money(s.match, 0)} match + ${money(s.equity, 0)} equity + ${money(s.other, 0)} other − ${money(s.commute, 0)} commute = ${money(s.total, 2)}`;

    return {
      diff,
      totalA: a.total,
      totalB: b.total,
      dayA: a.day,
      dayB: b.day,
      tone: winner ? 'good' : 'ok',
      badge: winner ? `Offer ${winner} by ${money(Math.abs(diff), 0)}` : 'Even',
      chart: {
        type: 'bar',
        title: 'Total yearly value',
        categories: ['Offer A', 'Offer B'],
        series: [{ name: 'Total value', values: [a.total, b.total] }],
        format: { format: 'currency' },
        highlight: winner === 'A' ? 0 : winner === 'B' ? 1 : undefined,
      },
      steps: [
        line('A', a),
        line('B', b),
        `Difference = ${money(a.total, 2)} − ${money(b.total, 2)} = ${money(diff, 2)}`,
        `Per working day: A = ${money(a.total, 2)} ÷ ${WORK_DAYS - a.pto} = ${money(a.day, 2)}; B = ${money(b.total, 2)} ÷ ${WORK_DAYS - b.pto} = ${money(b.day, 2)}`,
      ],
      note: `${winner ? `On these numbers Offer ${winner} is worth about ${money(Math.abs(diff), 0)} more a year before tax.` : 'On these numbers the offers are worth the same.'} Every figure is your own estimate, taxes are not applied, and things like growth, work-life balance and job security are not captured.`,
    };
  },
  content: {
    formula: [
      'Bonus = base × bonus %; match = base × match %',
      'Total value = base + bonus + match + equity + other benefits − commute cost',
      'Value per working day = total value ÷ (260 weekdays − paid days off)',
      'Difference = total of offer A − total of offer B',
    ],
    body: [
      'The higher salary is not always the better job. Bonuses, a 401(k) match, equity and extra paid days off all change what an offer is worth, and a long commute quietly takes money back. This calculator puts two offers side by side as a single yearly number.',
      'For each offer, enter the base salary and your realistic estimates for bonus, match, equity and other benefits, plus the yearly cost of getting to work and how many paid days off you get. The total is before tax, and every value except the salary is your own estimate, so be honest rather than optimistic.',
      'The per-working-day figure helps when one offer has more time off: it divides the total by the days you would actually work. Use it with the cost-of-living salary calculator if the offers are in different cities.',
    ],
    sections: [
      {
        heading: 'What this does not capture',
        paragraphs: [
          'Taxes differ by state, and equity can be worth much less than its headline number, so consider setting it to 0 and treating it as upside. Health insurance premiums, growth, flexibility and how much you would enjoy the work are real parts of a decision that no number covers.',
        ],
      },
    ],
    faq: [
      { q: 'How do the default offers compare?', a: 'Offer A is $100,000 + 10% bonus ($10,000) + 4% match ($4,000) = $114,000. Offer B is $108,000 + 3% match ($3,240) = $111,240. A is worth $2,760 more a year.' },
      { q: 'How is value per working day worked out?', a: 'It divides the total by 260 weekdays minus your paid days off. With 15 days off, A is $114,000 ÷ 245 = $465.31 per working day; with 20 days off, B is $111,240 ÷ 240 = $463.50.' },
      { q: 'Should I count equity?', a: 'Only as much as you believe it is worth. Many people enter 0 and treat it as a bonus if it pays off.' },
      { q: 'Is the result before or after tax?', a: 'Before tax. Taxes and benefit costs differ by state and plan, so compare take-home with the take-home pay calculator if it matters.' },
      { q: 'Does the 401(k) match always count?', a: 'Only if you contribute enough to receive it, and some employers make you wait for it to vest.' },
    ],
    sources: [
      { label: 'BLS: Employer costs for employee compensation', url: 'https://www.bls.gov/news.release/ecec.toc.htm' },
    ],
  },
  related: ['cost-of-living-salary', 'raise-calculator', 'take-home-pay', 'salary-to-hourly', '401k-max-out', 'degree-payback'],
  examples: [
    {
      // A: 100,000 + 10,000 + 4,000 = 114,000; B: 108,000 + 0 + 3,240 = 111,240; diff 2,760; A/day 114,000/245 = 465.3061; B/day 111,240/240 = 463.5.
      values: { baseA: 100000, bonusA: 10, matchA: 4, equityA: 0, otherA: 0, commuteA: 0, ptoA: 15, baseB: 108000, bonusB: 0, matchB: 3, equityB: 0, otherB: 0, commuteB: 0, ptoB: 20 },
      expect: { diff: 2760, totalA: 114000, totalB: 111240, dayA: 465.3061, dayB: 463.5 },
      tolerance: 0.001,
    },
    {
      // A: 90,000 + 9,000 bonus + 0 + 5,000 equity − 2,600 commute = 101,400; B: 95,000 + 0 + 2,850 match + 0 + 1,200 other − 0 = 99,050; diff 2,350.
      values: { baseA: 90000, bonusA: 10, matchA: 0, equityA: 5000, otherA: 0, commuteA: 2600, ptoA: 10, baseB: 95000, bonusB: 0, matchB: 3, equityB: 0, otherB: 1200, commuteB: 0, ptoB: 10 },
      expect: { diff: 2350, totalA: 101400, totalB: 99050 },
      tolerance: 0.001,
    },
  ],
});
