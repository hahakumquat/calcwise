import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'bonus-vs-raise',
  title: 'Bonus vs Raise Calculator',
  seoTitle: 'Bonus vs Raise Calculator',
  metaDescription: 'One-time bonus or a permanent raise? Compare the two over any number of years and see the break-even point, before tax, with optional future raises.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Compare a one-time bonus with a permanent raise and find the year the raise pulls ahead.',
  keywords: ['bonus vs raise calculator', 'bonus or raise which is better', 'raise vs one time bonus', 'sign on bonus vs higher salary', 'break even raise bonus'],
  popular: false,
  inputs: [
    { id: 'salary', label: 'Current yearly pay', type: 'number', prefix: '$', default: 80000, min: 0, step: 1000, info: 'Gross base pay before tax.' },
    { id: 'raise', label: 'Raise offered', type: 'number', suffix: '%', default: 3, min: 0, max: 100, step: 0.5, info: 'The permanent increase to your base pay.' },
    { id: 'bonus', label: 'One-time bonus offered instead', type: 'number', prefix: '$', default: 5000, min: 0, step: 500, info: 'Paid once, before tax.' },
    { id: 'years', label: 'Years to compare', type: 'number', suffix: 'years', default: 5, min: 1, max: 40, step: 1, info: 'How long you expect to stay.' },
    { id: 'growth', label: 'Future yearly raises (optional)', type: 'number', suffix: '%', default: 0, min: 0, max: 20, step: 0.5, info: 'Later raises are a percentage of a higher base, so the extra pay grows by this much each year. Enter 0 to ignore.' },
  ],
  outputs: [
    { id: 'breakEven', label: 'Break-even', format: 'number', precision: 2, suffix: ' years', primary: true, info: 'The point where the extra pay from the raise has added up to the bonus.' },
    { id: 'raiseTotal', label: 'Extra pay from the raise', format: 'currency', precision: 0, info: 'Total extra pay over the years you compare, before tax.' },
    { id: 'bonusAmt', label: 'Bonus', format: 'currency', precision: 0, info: 'The one-time amount.' },
    { id: 'difference', label: 'Raise minus bonus', format: 'currency', precision: 0, info: 'Positive means the raise pays more over this period.' },
    { id: 'extraYear', label: 'Extra pay in year one', format: 'currency', precision: 0, info: 'Salary × raise.' },
  ],
  compute: (v) => {
    const salary = num(v.salary);
    const raise = num(v.raise);
    const bonus = num(v.bonus);
    const years = num(v.years);
    const growth = num(v.growth);
    if (salary === null || raise === null || bonus === null || years === null || growth === null) return { breakEven: null };
    if (salary <= 0) return { breakEven: null, error: 'Enter a yearly pay above $0.' };
    if (raise <= 0) return { breakEven: null, error: 'Enter a raise above 0%.' };
    if (bonus < 0 || growth < 0) return { breakEven: null, error: 'Bonus and future raises cannot be negative.' };
    if (years < 1) return { breakEven: null, error: 'Compare at least 1 year.' };

    const n = Math.floor(years);
    const g = growth / 100;
    const extraYear = salary * (raise / 100);
    const extra = (t: number) => extraYear * Math.pow(1 + g, t - 1);

    const cum: number[] = [0];
    for (let t = 1; t <= n; t++) cum.push(cum[t - 1] + extra(t));
    const raiseTotal = cum[n];

    let breakEven = 0;
    if (bonus > 0) {
      let acc = 0;
      for (let t = 1; t <= 200; t++) {
        const e = extra(t);
        if (acc + e >= bonus) { breakEven = t - 1 + (bonus - acc) / e; break; }
        acc += e;
      }
    }

    const difference = raiseTotal - bonus;
    const x = cum.map((_, i) => i);
    return {
      breakEven,
      raiseTotal,
      bonusAmt: bonus,
      difference,
      extraYear,
      tone: difference >= 0 ? 'good' : 'ok',
      badge: difference >= 0 ? `The raise wins after ${n} years` : `The bonus wins after ${n} years`,
      chart: {
        type: 'line',
        title: 'Cumulative extra pay: raise vs bonus',
        x,
        xLabel: 'Years from now',
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: 'Raise', values: cum.map((c) => +c.toFixed(2)) },
          { name: 'Bonus', values: cum.map((_, i) => (i === 0 ? 0 : bonus)) },
        ],
      },
      steps: [
        `Extra pay in year one = ${money(salary, 0)} × ${raise}% = ${money(extraYear, 0)}`,
        `Over ${n} years the raise adds ${money(raiseTotal, 0)} (growing ${growth}% a year); the bonus is ${money(bonus, 0)} once`,
        `Break-even = ${breakEven.toFixed(2)} years`,
      ],
      note: `A ${raise}% raise is worth ${money(extraYear, 0)} a year. It overtakes a ${money(bonus, 0)} bonus after ${breakEven.toFixed(2)} years. Figures are gross; bonuses are often withheld at a higher rate, and a raise can also lift later raises, bonuses and retirement matching.`,
    };
  },
  content: {
    formula: [
      'Extra pay in year t = salary × raise × (1 + future raise)^(t − 1)',
      'Raise total = sum of the extra pay over the years',
      'Break-even (no future raises) = bonus ÷ (salary × raise)',
    ],
    body: [
      'A raise keeps paying every year; a bonus pays once. This calculator adds up the extra pay from the raise year by year and shows when it catches up with the bonus.',
      'For $80,000 with a 3% raise ($2,400 a year) against a $5,000 bonus, the raise catches up after 2.08 years. Over 5 years the raise adds $12,000 against $5,000.',
    ],
    sections: [
      {
        heading: 'What this leaves out',
        paragraphs: [
          'Everything here is before tax. Bonuses are often withheld at a flat higher rate, though that is a withholding rule rather than a different final tax. A raise also tends to raise later percentage raises, bonuses and retirement match, which pushes the break-even earlier. If you may leave in a year or two, the bonus can be the better deal.',
        ],
      },
    ],
    faq: [
      { q: 'Is a bonus or a raise better?', a: 'If you stay longer than the break-even, the raise pays more. With $80,000, a 3% raise and a $5,000 bonus the break-even is 2.08 years.' },
      { q: 'How do future raises change the answer?', a: 'Later percentage raises build on the higher base, so the raise is worth more each year. At 3% yearly growth the 5-year total in the default example rises from $12,000 to $12,741.93.' },
      { q: 'Does this include tax?', a: 'No. All amounts are gross. See the bonus tax calculator for withholding on a bonus.' },
      { q: 'What if I leave early?', a: 'Then the raise stops and only the pay you actually received counts. Set the years to how long you expect to stay.' },
    ],
    sources: [{ label: 'Simple arithmetic on your own figures; no external data' }],
  },
  related: ['raise-calculator', 'bonus-tax', 'take-home-pay', 'salary-to-hourly'],
  examples: [
    // extra 2400/yr; 5 years 12000; break-even 5000/2400 = 2.083333; diff 7000
    { values: { salary: 80000, raise: 3, bonus: 5000, years: 5, growth: 0 }, expect: { extraYear: 2400, raiseTotal: 12000, breakEven: 2.083333, difference: 7000 }, tolerance: 1e-4 },
    // growth 3%: 2400 * (1.03^5 - 1)/0.03 = 2400 * 5.309136 = 12741.93; break-even: 2400+2472=4872, need 128 of 2546.16 => 2.050272
    { values: { salary: 80000, raise: 3, bonus: 5000, years: 5, growth: 3 }, expect: { raiseTotal: 12741.926, breakEven: 2.050272 }, tolerance: 1e-3 },
  ],
});
