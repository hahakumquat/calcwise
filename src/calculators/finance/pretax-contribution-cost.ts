import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'pretax-contribution-cost',
  title: 'Pre-Tax 401(k) Take-Home Cost Calculator',
  category: 'finance',
  description: 'See what a pre-tax 401(k) contribution really costs your paycheck after income tax savings. Enter the amount and your tax rates.',
  keywords: ['pre-tax 401k take home cost', 'how much does 401k contribution reduce paycheck', 'raise 401k contribution paycheck impact', '401k contribution take home pay', 'traditional 401k tax savings per paycheck'],
  updated: '2026-11-24',
  inputs: [
    { id: 'contribution', label: 'Pre-tax contribution per paycheck', type: 'number', prefix: '$', default: 200, min: 0, step: 10, info: 'The amount that goes into your traditional (pre-tax) 401(k) each paycheck.' },
    { id: 'paychecks', label: 'Paychecks per year', type: 'number', default: 26, min: 1, max: 60, step: 1, info: '26 for every two weeks, 24 for twice a month, 12 for monthly.' },
    { id: 'federal', label: 'Federal marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 60, step: 0.5, info: 'The bracket your next dollar of pay falls in. The default is an example, so use your own.' },
    { id: 'state', label: 'State marginal tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.1, info: 'Use 0 if your state has no income tax or does not tax this income.' },
  ],
  outputs: [
    { id: 'cost', label: 'Take-home cost per paycheck', format: 'currency', primary: true, info: 'Contribution × (1 − federal rate − state rate).' },
    { id: 'taxSaved', label: 'Income tax saved per paycheck', format: 'currency', info: 'Contribution × (federal rate + state rate).' },
    { id: 'annualContribution', label: 'Saved into the 401(k) per year', format: 'currency', info: 'Contribution × paychecks per year.' },
    { id: 'annualCost', label: 'Take-home cost per year', format: 'currency', info: 'Take-home cost per paycheck × paychecks per year.' },
  ],
  compute: (v) => {
    const c = num(v.contribution), n = num(v.paychecks), f = num(v.federal), s = num(v.state);
    if ([c, n, f, s].some((x) => x === null)) return { cost: null };
    if ([c, f, s].some((x) => (x as number) < 0)) return { cost: null, error: 'Values cannot be negative.' };
    if ((n as number) < 1) return { cost: null, error: 'Enter at least 1 paycheck per year.' };
    if ((f as number) + (s as number) > 100) return { cost: null, error: 'Federal and state rates together cannot exceed 100%.' };
    const combined = ((f as number) + (s as number)) / 100;
    const taxSaved = (c as number) * combined;
    const cost = (c as number) - taxSaved;
    const annualContribution = (c as number) * (n as number);
    const annualCost = cost * (n as number);
    return {
      cost, taxSaved, annualContribution, annualCost,
      tone: 'ok',
      badge: `${usd(c as number)} saved costs ${usd(cost)} of take-home`,
      chart: {
        type: 'bar',
        title: 'Per paycheck: what goes in vs what it costs you',
        categories: ['Into 401(k)', 'Take-home cost', 'Tax saved'],
        series: [{ name: 'Amount', values: [c as number, cost, taxSaved] }],
        format: { format: 'currency' },
      },
      steps: [
        `Combined income tax rate: ${f}% + ${s}% = ${(combined * 100).toFixed(1).replace(/\.0$/, '')}%`,
        `Tax saved: ${usd(c as number)} × ${(combined * 100).toFixed(1).replace(/\.0$/, '')}% = ${usd(taxSaved)}`,
        `Take-home cost: ${usd(c as number)} − ${usd(taxSaved)} = ${usd(cost)}`,
        `Per year: ${usd(cost)} × ${n} = ${usd(annualCost)} for ${usd(annualContribution)} saved`,
      ],
      note: 'Social Security and Medicare tax are not reduced by 401(k) deferrals, so only income tax is counted here. Roth 401(k) contributions save no tax now, so they cost the full amount. Annual limits and employer match are not computed.',
    };
  },
  content: {
    formula: [
      'Tax saved = contribution × (federal rate + state rate)',
      'Take-home cost = contribution − tax saved',
      'Per year = per paycheck × paychecks per year',
    ],
    body: [
      'A pre-tax 401(k) contribution comes out of your pay before income tax is calculated, so your take-home pay falls by less than the amount you save. This calculator shows the gap.',
      'Enter what you plan to contribute each paycheck, how often you are paid, and your federal and state marginal rates. The marginal rate is the rate on your next dollar of pay, not your average rate.',
      'Only income tax is reduced. Social Security and Medicare tax are still withheld on the full pay, and a Roth 401(k) gives no tax saving now. If your employer matches, that is extra money not counted here.',
      'The rates are numbers you enter, and the calculator does not check contribution limits or whether a bracket changes.',
    ],
    faq: [
      { q: 'What does $200 a paycheck cost in take-home pay in the example?', a: 'At 22% federal and 5% state, the combined rate is 27%. Tax saved is $54.00, so $200 into the 401(k) costs $146.00 of take-home pay. Over 26 paychecks that is $3,796.00 of take-home for $5,200.00 saved.' },
      { q: 'Why does my paycheck drop by less than I contribute?', a: 'Pre-tax contributions lower the pay that income tax is figured on, so you pay less tax. The saving equals the contribution times your marginal income tax rate.' },
      { q: 'Does this include Social Security and Medicare tax?', a: 'No. Those taxes are still taken on the full pay, so they do not change with a traditional 401(k) deferral.' },
      { q: 'What about a Roth 401(k)?', a: 'Roth contributions are made after tax, so they save no tax now and cost the full amount. Enter 0% for both rates to see that case.' },
    ],
    sources: [
      { label: 'IRS: 401(k) plans', url: 'https://www.irs.gov/retirement-plans/401k-plans' },
    ],
  },
  related: ['401k-max-out', 'employer-match-calculator', 'take-home-pay'],
  examples: [
    // 200*.27 = 54; cost 146; annual 146*26 = 3796; contributed 5200
    { values: { contribution: 200, paychecks: 26, federal: 22, state: 5 }, expect: { cost: 146, taxSaved: 54, annualContribution: 5200, annualCost: 3796 }, tolerance: 0.01 },
    // 500*.12 = 60; cost 440; *12 = 5280; contributed 6000
    { values: { contribution: 500, paychecks: 12, federal: 12, state: 0 }, expect: { cost: 440, taxSaved: 60, annualContribution: 6000, annualCost: 5280 }, tolerance: 0.01 },
    { values: { contribution: 100, paychecks: 24, federal: 0, state: 0 }, expect: { cost: 100, taxSaved: 0 }, tolerance: 0.01 },
  ],
});
