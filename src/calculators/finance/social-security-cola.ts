import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'social-security-cola',
  title: 'Social Security COLA Calculator',
  category: 'finance',
  description: 'See your new monthly Social Security check after the COLA, the raise per month and per year, and what is left after a Medicare Part B increase.',
  keywords: ['social security cola calculator', '2027 cola', 'social security raise', 'cost of living adjustment calculator', 'new social security payment', 'cola 3.6'],
  updated: '2026-11-17',
  inputs: [
    { id: 'benefit', label: 'Current monthly benefit', type: 'number', prefix: '$', default: 2000, min: 0, step: 10, info: 'The monthly amount you receive now, before any Medicare premium is taken out. Your benefit notice from the Social Security Administration (SSA) shows it.' },
    { id: 'cola', label: 'COLA', type: 'number', suffix: '%', default: 3.6, min: 0, step: 0.1, help: 'The SSA announced 3.6% for January 2027.', info: 'The cost-of-living adjustment as a percentage. The SSA announces it each October and it applies from January. You can edit it for other years or scenarios.' },
    { id: 'partB', label: 'Medicare Part B premium increase', type: 'number', prefix: '$', optional: true, min: 0, step: 1, default: 0, info: 'Optional. If your Part B premium rises, enter the monthly increase to see how much of the raise it absorbs. Part B is normally deducted from your check.' },
  ],
  outputs: [
    { id: 'newBenefit', label: 'New monthly benefit', format: 'currency', primary: true, info: 'Current benefit × (1 + COLA). The SSA rounds to the nearest dollar when it sets your actual amount, so your notice may differ by a few cents.' },
    { id: 'raise', label: 'Raise per month', format: 'currency', info: 'New monthly benefit minus current monthly benefit.' },
    { id: 'raiseYear', label: 'Raise per year', format: 'currency', info: 'The monthly raise × 12.' },
    { id: 'netRaise', label: 'Raise after Part B increase', format: 'currency', info: 'The monthly raise minus the Part B increase you entered. Negative means the premium increase is larger than the raise.' },
  ],
  compute: (v) => {
    const b = num(v.benefit);
    const c = num(v.cola);
    const p = num(v.partB) ?? 0;
    if (b === null || c === null || b <= 0) return { newBenefit: null };
    if (c < 0 || p < 0) return { newBenefit: null, error: 'COLA and premium increase cannot be negative.' };
    const nb = b * (1 + c / 100);
    const raise = nb - b;
    const net = raise - p;
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Monthly benefit',
      categories: ['Now', 'After COLA'],
      series: [{ name: 'Benefit', values: [b, nb] }],
      format: { format: 'currency' },
    };
    return {
      newBenefit: nb,
      raise,
      raiseYear: raise * 12,
      netRaise: net,
      tone: net < 0 ? 'warn' : 'good',
      badge: `+${money(raise, 2)} a month, +${money(raise * 12, 2)} a year`,
      chart,
      note: 'The COLA applies to your benefit before deductions such as the Medicare Part B premium. The SSA sets your actual amount, so check your notice.',
      steps: [
        `New benefit = ${money(b, 2)} × (1 + ${c}%) = ${money(nb, 2)}`,
        `Raise = ${money(nb, 2)} − ${money(b, 2)} = ${money(raise, 2)} a month, ${money(raise * 12, 2)} a year`,
        ...(p > 0 ? [`After a ${money(p, 2)} Part B increase you keep ${money(net, 2)} of the raise each month.`] : []),
      ],
    };
  },
  content: {
    formula: ['New benefit = current benefit × (1 + COLA %)', 'Raise = new benefit − current benefit', 'Raise after Part B = raise − Part B increase'],
    body: [
      'Social Security benefits get a cost-of-living adjustment (COLA) each January so they keep up with rising prices. The Social Security Administration announced a 3.6% COLA for 2027 on October 14, 2026. Enter your current monthly benefit to see what your check becomes.',
      'The COLA is applied to your benefit before deductions. If your Medicare Part B premium also rises, it is usually taken out of your check, so part of the raise goes to the premium. Enter the increase in the optional field to see what is left.',
      'The percentage is editable, so you can use the calculator for other years or test a different rate.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: ['A monthly benefit of $2,000 with a 3.6% COLA becomes $2,000 × 1.036 = $2,072. That is $72 more a month and $864 more a year. If the Part B premium rises by $10 a month, the raise after the premium is $62.'],
      },
    ],
    faq: [
      { q: 'What is the 2027 Social Security COLA?', a: 'The SSA announced 3.6%, applied from January 2027. At 3.6%, a $2,000 check becomes $2,072.' },
      { q: 'How much more will I get per year?', a: 'Multiply the monthly raise by 12. A $72 monthly raise is $864 a year.' },
      { q: 'Does Medicare Part B reduce my raise?', a: 'Part B is usually deducted from your check, so an increase in the premium takes part of the raise. Enter the increase to see the net, for example $72 − $10 = $62.' },
      { q: 'Will my check match this exactly?', a: 'It should be close. The SSA calculates your exact amount, so use your official notice as the final figure.' },
    ],
    sources: [{ label: 'Social Security Administration: 2027 COLA announcement', url: 'https://www.ssa.gov/news/en/press/releases/2026-10-14.html' }],
  },
  related: ['social-security-breakeven', 'inflation', 'compound-interest', 'rule-of-72'],
  examples: [
    // 2000 × 1.036 = 2072; raise 72; year 864.
    { values: { benefit: 2000, cola: 3.6, partB: 0 }, expect: { newBenefit: 2072, raise: 72, raiseYear: 864, netRaise: 72 } },
    // Part B +10: net raise 62.
    { values: { benefit: 2000, cola: 3.6, partB: 10 }, expect: { newBenefit: 2072, netRaise: 62 } },
    // 2095 × 1.036 = 2170.42.
    { values: { benefit: 2095, cola: 3.6 }, expect: { newBenefit: 2170.42 } },
  ],
});
