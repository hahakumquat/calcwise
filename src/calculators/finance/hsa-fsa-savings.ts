import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import {
  asStatus,
  federalIncomeTax,
  ficaTax,
  FILING_STATUS_OPTIONS,
  money,
  moneyDonut,
  pct,
  STANDARD_DEDUCTION,
} from '../../lib/helpers/finance';

/** HSA limits (IRS Rev. Proc. 2025-19 for 2026; 2027 per the IRS 2027 HSA Rev. Proc.) and the age 55+ catch-up. */
const HSA_LIMITS: Record<string, { self: number; family: number }> = {
  '2026': { self: 4400, family: 8750 },
  '2027': { self: 4500, family: 9000 },
};
const HSA_CATCHUP = 1000;
/** Health FSA salary-reduction limits. The 2027 figure is from secondary reports of the IRS Rev. Proc. */
const FSA_LIMITS: Record<string, number> = { '2026': 3400, '2027': 3500 };

export default defineCalculator({
  slug: 'hsa-fsa-savings',
  title: 'HSA and FSA Tax Savings Calculator',
  category: 'finance',
  description: 'See how much federal, FICA and state tax an HSA and health FSA save you for 2026 or 2027, with contribution limits applied automatically.',
  keywords: ['hsa tax savings calculator', 'fsa tax savings calculator', 'hsa contribution limit 2027', 'hsa limit 2026', 'health fsa limit 2027', 'how much does an hsa save in taxes'],
  updated: '2026-11-15',
  popular: false,
  inputs: [
    { id: 'year', label: 'Plan year', type: 'select', default: '2027', options: [{ value: '2026', label: '2026' }, { value: '2027', label: '2027 (open enrollment)' }], info: 'The year you are contributing for. It sets the HSA and health FSA limits. Tax brackets use the 2026 tables for both years.' },
    { id: 'coverage', label: 'HSA coverage', type: 'select', default: 'self', options: [{ value: 'self', label: 'Self-only' }, { value: 'family', label: 'Family' }], info: 'Your high-deductible health plan coverage level. Family means the plan covers you and at least one other person.' },
    { id: 'age55', label: 'Age 55 or older', type: 'toggle', default: false, info: 'Turn on if you will be 55 or older by the end of the year. It adds the $1,000 HSA catch-up.' },
    { id: 'hsa', label: 'HSA contribution', type: 'number', prefix: '$', default: 4400, min: 0, step: 100, optional: true, help: 'Your own contributions. Amounts over the limit are capped.', info: 'What you plan to put into your HSA this year. Employer contributions count toward the same limit, so subtract them first.' },
    { id: 'payroll', label: 'HSA contributed through payroll', type: 'toggle', default: true, info: 'On: the money comes out of your paycheck pre-tax, which also skips Social Security and Medicare. Off: you deposit it yourself and deduct it on your tax return, which saves income tax but not FICA.' },
    { id: 'fsa', label: 'Health FSA contribution', type: 'number', prefix: '$', default: 0, min: 0, step: 100, optional: true, help: 'Capped at the yearly limit. Skip it if you contribute to an HSA and have no limited-purpose FSA.', info: 'What you elect to have taken from your pay for a health care FSA. It always comes out pre-tax through payroll.' },
    { id: 'salary', label: 'Annual salary', type: 'number', prefix: '$', default: 85000, min: 0, step: 1000, info: 'Your yearly pay before taxes and before these contributions.' },
    { id: 'status', label: 'Filing status', type: 'select', default: 'single', options: FILING_STATUS_OPTIONS, info: 'The filing status you will use on your federal return. It sets your brackets and standard deduction.' },
    { id: 'stateRate', label: 'State income tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.1, optional: true, help: 'A flat estimate. Use 0 for states without income tax.', info: 'Your approximate state income tax rate. A few states, such as California and New Jersey, tax HSA money, so set 0 if that applies.' },
  ],
  outputs: [
    { id: 'total', label: 'Total tax saved', format: 'currency', primary: true, info: 'Federal income tax + Social Security and Medicare + state tax you avoid by making these contributions.' },
    { id: 'federal', label: 'Federal income tax saved', format: 'currency', info: 'Your federal tax without the contributions minus your federal tax with them.' },
    { id: 'fica', label: 'Social Security + Medicare saved', format: 'currency', info: 'Only payroll contributions (FSA, and HSA through payroll) reduce FICA wages.' },
    { id: 'state', label: 'State tax saved', format: 'currency', info: 'Your flat state rate times the contributions.' },
    { id: 'contrib', label: 'Contributions counted', format: 'currency', info: 'HSA plus health FSA after applying the yearly limits.' },
    { id: 'netCost', label: 'Real cost of each $1 contributed', format: 'currency', precision: 2, info: 'One dollar minus the tax you save on it. A lower number means a bigger discount.' },
  ],
  compute: (v) => {
    const salary = num(v.salary);
    const hsaIn = num(v.hsa) ?? 0;
    const fsaIn = num(v.fsa) ?? 0;
    const stateRate = num(v.stateRate) ?? 0;
    if (salary === null || salary <= 0 || hsaIn < 0 || fsaIn < 0 || stateRate < 0) return { total: null };
    const year = v.year === '2026' ? '2026' : '2027';
    const family = v.coverage === 'family';
    const age55 = v.age55 === 'on';
    const payroll = v.payroll !== 'off';
    const status = asStatus(v.status);

    const base = HSA_LIMITS[year];
    const hsaLimit = (family ? base.family : base.self) + (age55 ? HSA_CATCHUP : 0);
    const fsaLimit = FSA_LIMITS[year];
    const hsa = Math.min(hsaIn, hsaLimit);
    const fsa = Math.min(fsaIn, fsaLimit);
    const contrib = hsa + fsa;
    if (contrib <= 0) return { total: null };

    const std = STANDARD_DEDUCTION[status];
    const taxWithout = federalIncomeTax(Math.max(0, salary - std), status).tax;
    const taxWith = federalIncomeTax(Math.max(0, salary - contrib - std), status).tax;
    const federal = taxWithout - taxWith;

    const payrollPart = fsa + (payroll ? hsa : 0);
    const ficaWithout = ficaTax(salary, status);
    const ficaWith = ficaTax(Math.max(0, salary - payrollPart), status);
    const ss = ficaWithout.socialSecurity - ficaWith.socialSecurity;
    const med = ficaWithout.medicare - ficaWith.medicare;
    const fica = ss + med;
    const state = (contrib * stateRate) / 100;

    const total = federal + fica + state;
    const share = total / contrib;
    const netCost = 1 - share;

    const tone: 'good' | 'ok' | 'warn' = share >= 0.3 ? 'good' : share >= 0.2 ? 'ok' : 'warn';
    const badge = `Saves ${pct(share, 0)} of what you put in`;

    const capNotes: string[] = [];
    if (hsaIn > hsaLimit) capNotes.push(`HSA capped at the ${year} limit of ${money(hsaLimit, 0)}.`);
    if (fsaIn > fsaLimit) capNotes.push(`Health FSA capped at ${money(fsaLimit, 0)}${year === '2027' ? ' (reported limit)' : ''}.`);
    const fsaWarn = fsa > 0 ? ' A health FSA is mostly use-it-or-lose-it: check whether your plan allows a carryover or grace period.' : '';
    const ficaWarn = hsa > 0 && !payroll ? ' HSA money deposited outside payroll does not reduce Social Security or Medicare tax.' : '';

    const charts: ChartSpec[] = [
      moneyDonut('Where each contribution dollar comes from', [{ label: 'Federal tax saved', value: federal }, { label: 'Social Security + Medicare saved', value: fica }, { label: 'State tax saved', value: state }, { label: 'Your real cost', value: contrib - total }], money(total, 0), 'saved'),
    ];

    return {
      total,
      federal,
      fica,
      state,
      contrib,
      netCost,
      tone,
      badge,
      chart: charts,
      steps: [
        `Contributions = ${money(hsa, 0)} HSA + ${money(fsa, 0)} health FSA = ${money(contrib, 0)}`,
        `Federal saved = tax on ${money(Math.max(0, salary - std), 0)} - tax on ${money(Math.max(0, salary - contrib - std), 0)} = ${money(taxWithout)} - ${money(taxWith)} = ${money(federal)}`,
        `Social Security + Medicare saved on ${money(payrollPart, 0)} of payroll contributions = ${money(ss)} + ${money(med)} = ${money(fica)}`,
        `State saved = ${money(contrib, 0)} × ${stateRate}% = ${money(state)}`,
        `Total saved = ${money(federal)} + ${money(fica)} + ${money(state)} = ${money(total)}`,
      ],
      note: `${capNotes.join(' ')}${ficaWarn}${fsaWarn} Estimate with the 2026 tax tables, standard deduction, no other income or credits. HSA contributions require a qualifying high-deductible health plan. Not tax advice.`.trim(),
    };
  },
  content: {
    formula: [
      'Tax saved = tax without contributions - tax with contributions (federal) + FICA saved + state rate × contributions',
      'FICA saved = FICA on salary - FICA on (salary - payroll contributions)',
      'HSA limit = base limit (self-only or family) + $1,000 if 55 or older',
    ],
    body: [
      'A health savings account (HSA) and a health care flexible spending account (FSA) both let you pay for medical costs with money that has skipped income tax. The money you contribute lowers your taxable income, so the real cost of each dollar is less than a dollar. How much less depends on your tax bracket, your state, and whether the contribution comes out of your paycheck.',
      'An HSA is the stronger of the two for most people. Contributions through payroll avoid federal income tax, Social Security and Medicare, the money rolls over every year, and it can be invested. You need a qualifying high-deductible health plan to contribute. A health FSA works with any employer plan that offers it, but you generally must use the money within the plan year, apart from any carryover your employer allows.',
      'The limits are set each year by the IRS. For 2026 the HSA limit is $4,400 self-only or $8,750 family, and the health FSA limit is $3,400. For 2027 the HSA limit is $4,500 or $9,000, and the health FSA limit is reported to be $3,500 (confirm with your plan before you elect). If you are 55 or older, you can add $1,000 to the HSA. This calculator caps what you enter at the limit and uses the 2026 tax tables for both years, because the 2027 tables were not final when this was written.',
    ],
    sections: [
      {
        heading: 'Payroll or direct HSA contributions?',
        paragraphs: [
          'If your employer takes HSA money from your paycheck under a cafeteria plan, it is exempt from federal income tax, Social Security and Medicare. If you deposit money yourself, you still get the income tax deduction on your return, but you pay FICA on that pay, so the saving is smaller by 7.65% of the contribution for most workers. Use the toggle to compare.',
        ],
      },
      {
        heading: 'What this estimate leaves out',
        paragraphs: [
          'Employer HSA contributions count toward the same yearly limit, so enter only your own part and keep the total under the cap. Dependent care FSAs are not included. State tax is a single flat rate, and a few states (such as California and New Jersey) do not give HSAs the federal tax break. Social Security and Medicare use 2026 rates and the 2026 wage base.',
        ],
      },
    ],
    faq: [
      { q: 'How much tax does a $4,400 HSA save?', a: 'With an $85,000 salary, single filing, a 5% state rate and $4,400 contributed through payroll in 2026, you save $968 federal (22% bracket), $336.60 Social Security and Medicare, and $220 state tax. That is $1,524.60 in total, so each $1 costs you about $0.65.' },
      { q: 'What if I deposit the HSA money myself instead of through payroll?', a: 'You lose the FICA saving. With the same $85,000 salary, $4,400 and 5% state rate, the total saved falls from $1,524.60 to $1,188: $968 federal plus $220 state and no Social Security or Medicare saving.' },
      { q: 'What are the HSA and FSA limits?', a: 'HSA: $4,400 self-only and $8,750 family for 2026, $4,500 and $9,000 for 2027, plus $1,000 at age 55 or older. Health FSA: $3,400 for 2026 and a reported $3,500 for 2027. Anything you enter above the limit is capped.' },
      { q: 'How much can a family aged 55+ save with both accounts?', a: 'For 2027, a $120,000 earner filing single with family coverage and age 55+ can contribute $10,000 to an HSA ($9,000 + $1,000) and $3,500 to a health FSA, $13,500 in all. With a 0% state rate, federal tax falls by $2,970 (all in the 22% bracket) and FICA by $1,032.75, so $4,002.75 is saved.' },
      { q: 'Do high earners get the Social Security saving?', a: 'Not always. At a $190,000 salary the Social Security wage base ($184,500) is already passed even after a $4,400 payroll deduction, so only Medicare (1.45%, $63.80) is saved. Federal tax saved is $1,056 in the 24% bracket, so the total with no state tax is $1,119.80.' },
      { q: 'Can I lose FSA money?', a: 'Yes. Health FSA funds are generally use-it-or-lose-it by the end of the plan year, unless your employer offers a limited carryover or a grace period. HSA money never expires and stays yours if you change jobs.' },
    ],
    sources: [
      { label: 'IRS Publication 969: HSAs and other tax-favored health plans', url: 'https://www.irs.gov/publications/p969' },
      { label: 'IRS Rev. Proc. 2025-19: 2026 HSA limits', url: 'https://www.irs.gov/pub/irs-drop/rp-25-19.pdf' },
      { label: 'IRS Rev. Proc. 2025-32: 2026 tax brackets and standard deductions', url: 'https://www.irs.gov/irb/2025-45_IRB' },
      { label: 'IRS: Health FSA limits (2027 figure reported, confirm with your plan)', url: 'https://www.irs.gov/newsroom' },
    ],
  },
  related: ['take-home-pay', '401k-max-out', 'bonus-tax', 'income-tax', 'health-plan-comparison'],
  examples: [
    {
      // Taxable 85,000-16,100 = 68,900: 1,240 + 4,560 + 22%×18,500 = 9,870. After 4,400: 64,500 -> 1,240 + 4,560 + 22%×14,100 = 8,902. Federal 968.
      // FICA 4,400 × 7.65% = 336.60; state 5% × 4,400 = 220; total 1,524.60; cost 1 - 1,524.6/4,400 = 0.65350
      values: { year: '2026', coverage: 'self', age55: 'off', hsa: 4400, payroll: 'on', fsa: 0, salary: 85000, status: 'single', stateRate: 5 },
      expect: { federal: 968, fica: 336.6, state: 220, total: 1524.6, contrib: 4400, netCost: 0.6535 },
      tolerance: 1e-9,
    },
    {
      // Not through payroll: no FICA saving. 968 + 220 = 1,188.
      values: { year: '2026', coverage: 'self', age55: 'off', hsa: 4400, payroll: 'off', fsa: 0, salary: 85000, status: 'single', stateRate: 5 },
      expect: { federal: 968, fica: 0, state: 220, total: 1188 },
      tolerance: 1e-9,
    },
    {
      // 2027 family 55+: HSA capped 99,999 -> 10,000; FSA capped -> 3,500; total 13,500.
      // Taxable 103,900 -> 1,240+4,560+22%×53,500 = 17,570; 90,400 -> 1,240+4,560+22%×40,000 = 14,600; federal 2,970 (13,500 × 22%).
      // FICA 13,500 × 7.65% = 1,032.75; state 0.
      values: { year: '2027', coverage: 'family', age55: 'on', hsa: 99999, payroll: 'on', fsa: 99999, salary: 120000, status: 'single', stateRate: 0 },
      expect: { contrib: 13500, federal: 2970, fica: 1032.75, state: 0, total: 4002.75 },
      tolerance: 1e-9,
    },
    {
      // Salary 190,000 single: wages stay above SS base 184,500, so SS saving 0; Medicare 4,400 × 1.45% = 63.80.
      // Taxable 173,900 and 169,500 both in the 24% bracket: 4,400 × 24% = 1,056. Total 1,119.80.
      values: { year: '2026', coverage: 'self', age55: 'off', hsa: 4400, payroll: 'on', fsa: 0, salary: 190000, status: 'single', stateRate: 0 },
      expect: { federal: 1056, fica: 63.8, total: 1119.8 },
      tolerance: 1e-9,
    },
  ],
});
