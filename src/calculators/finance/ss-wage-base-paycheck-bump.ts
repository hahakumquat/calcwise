import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'ss-wage-base-paycheck-bump',
  title: 'SS Wage Base: When Your Paycheck Jumps',
  category: 'finance',
  description: 'Find the paycheck where Social Security tax stops for the year and how much bigger your take-home gets after the wage base is hit.',
  keywords: ['social security wage base paycheck', 'when does social security tax stop', 'why is my paycheck bigger at end of year', 'fica cap paycheck calculator', 'social security tax cap'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'salary', label: 'Annual gross pay', type: 'number', prefix: '$', default: 250000, min: 0, step: 1000, info: 'Your yearly pay subject to Social Security tax, assuming equal paychecks.' },
    { id: 'periods', label: 'Paychecks per year', type: 'number', default: 26, min: 1, max: 365, step: 1, info: 'For example 26 for every two weeks, 24 for twice a month, 12 for monthly.' },
    { id: 'base', label: 'Social Security wage base', type: 'number', prefix: '$', default: 184500, min: 0, step: 100, info: 'The yearly cap on pay that Social Security tax applies to. Check the current figure on the SSA website.' },
    { id: 'rate', label: 'Employee Social Security rate', type: 'number', default: 6.2, min: 0, max: 20, step: 0.1, suffix: '%', info: 'The employee share of Social Security tax. Medicare is separate and has no cap.' },
  ],
  outputs: [
    { id: 'bump', label: 'Extra take-home per paycheck', format: 'currency', precision: 2, primary: true, info: 'Gross pay per paycheck × the Social Security rate, once the cap is reached.' },
    { id: 'capCheck', label: 'Cap is hit on', format: 'text', info: 'The paycheck number in which Social Security tax first stops (that check is partly taxed).' },
    { id: 'free', label: 'Paychecks with no Social Security tax', format: 'number', precision: 0, info: 'Full paychecks after the cap check.' },
    { id: 'total', label: 'Social Security tax for the year', format: 'currency', precision: 2, info: 'The smaller of pay and wage base, times the rate.' },
  ],
  compute: (v) => {
    const salary = num(v.salary);
    const n = num(v.periods);
    const base = num(v.base);
    const rate = num(v.rate);
    if ([salary, n, base, rate].some((x) => x === null)) return { bump: null };
    if (salary! <= 0 || n! < 1 || base! < 0 || rate! < 0) return { bump: null };
    const periods = Math.floor(n!);
    const gross = salary! / periods;
    const r = rate! / 100;
    const total = Math.min(salary!, base!) * r;
    const bump = gross * r;
    const hits = salary! > base!;
    const capIdx = hits ? Math.max(1, Math.ceil(base! / gross - 1e-9)) : 0;
    const free = hits ? periods - capIdx : 0;
    const partial = hits ? (base! - (capIdx - 1) * gross) * r : 0;
    return {
      bump: hits ? bump : 0,
      capCheck: hits ? `Paycheck ${capIdx} of ${periods}` : 'Not reached',
      free,
      total,
      tone: hits ? 'good' : 'ok',
      badge: hits ? `Paycheck ${capIdx}: Social Security tax stops` : 'Your pay stays under the cap',
      note: hits
        ? `With ${money(gross)} per paycheck, you pass the ${money(base!)} wage base in paycheck ${capIdx}, which is taxed only on the part below the cap (${money(partial)} of Social Security tax). The ${free} paycheck${free === 1 ? '' : 's'} after that are ${money(bump)} bigger. Income tax and Medicare are unchanged. This assumes equal paychecks and no bonuses.`
        : `${money(salary!)} is under the ${money(base!)} wage base, so Social Security tax applies to every paycheck (${money(total)} for the year) and your paycheck does not jump.`,
      chart: {
        type: 'bar' as const,
        title: 'Social Security tax for the year',
        categories: ['Taxed up to the cap', 'Pay above the cap'],
        series: [{ name: 'Pay', values: [Math.min(salary!, base!), Math.max(0, salary! - base!)] }],
        format: CURRENCY,
      },
      steps: [
        `Pay per paycheck = ${money(salary!)} ÷ ${periods} = ${money(gross)}`,
        `Cap paycheck = ceil(${money(base!)} ÷ ${money(gross)}) = ${hits ? capIdx : 'not reached'}`,
        `Extra per paycheck = ${money(gross)} × ${rate}% = ${money(bump)}`,
        `Year total = ${money(Math.min(salary!, base!))} × ${rate}% = ${money(total)}`,
      ],
    };
  },
  content: {
    formula: [
      'Pay per paycheck = annual pay ÷ paychecks per year',
      'Cap paycheck = ceil(wage base ÷ pay per paycheck)',
      'Extra take-home = pay per paycheck × Social Security rate',
      'Year total = min(pay, wage base) × rate',
    ],
    body: [
      'Social Security tax applies only to pay up to a yearly cap called the wage base. Once your pay for the year passes it, the tax stops and each remaining paycheck is bigger by the tax that would have been withheld.',
      'Example: $250,000 paid over 26 checks is $9,615.38 each. With a $184,500 wage base and a 6.2% rate, the cap is crossed in paycheck 20. The 6 remaining checks are $596.15 bigger, and the year total is $11,439.00.',
      'Medicare tax has no cap and is not counted here. Bonuses and uneven pay move the date earlier or later. This is general information, not payroll or tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is the Social Security wage base?', a: 'The most pay in a year that is subject to Social Security tax. The default here is $184,500; confirm the current figure on the SSA site and edit it if it has changed.' },
      { q: 'Why is my paycheck bigger at the end of the year?', a: 'If you earn above the wage base, Social Security tax stops once you pass it, so more of each remaining check reaches you.' },
      { q: 'Does Medicare stop too?', a: 'No. Medicare tax has no wage cap, so it continues, and extra Medicare tax can apply at higher incomes.' },
      { q: 'What about bonuses?', a: 'A large bonus can push you over the cap sooner. This calculator assumes equal paychecks, so treat the paycheck number as an estimate.' },
      { q: 'Does my employer stop too?', a: 'Employers pay a matching share on the same wage base, so their tax stops at the same point.' },
    ],
    sources: [
      { label: 'SSA: Contribution and benefit base', url: 'https://www.ssa.gov/oact/cola/cbb.html' },
    ],
  },
  related: ['take-home-pay', 'paychecks-per-year', 'income-tax', 'solo-401k-sep-room'],
  examples: [
    // gross 250000/26=9615.3846; base/gross=19.188 -> ceil 20; free 6; bump 596.1538; total 184500*.062=11439
    { values: { salary: 250000, periods: 26, base: 184500, rate: 6.2 }, expect: { bump: 250000 / 26 * 0.062, capCheck: 'Paycheck 20 of 26', free: 6, total: 11439 }, tolerance: 1e-6 },
    // under cap: 150000*.062 = 9300
    { values: { salary: 150000, periods: 12, base: 184500, rate: 6.2 }, expect: { bump: 0, capCheck: 'Not reached', free: 0, total: 9300 }, tolerance: 1e-6 },
  ],
});
