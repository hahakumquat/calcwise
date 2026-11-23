import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import {
  asStatus,
  CURRENCY,
  federalIncomeTax,
  ficaTax,
  FILING_STATUS_OPTIONS,
  LIMIT_401K,
  money,
  moneyDonut,
  pct,
  STANDARD_DEDUCTION,
  SUPPLEMENTAL_HIGH_THRESHOLD,
  SUPPLEMENTAL_RATE,
  SUPPLEMENTAL_RATE_HIGH,
  TAX_YEAR,
} from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'bonus-tax',
  title: 'Bonus Tax Calculator',
  category: 'finance',
  description: `See how much of your bonus you keep in ${TAX_YEAR} after 22% federal withholding, FICA and state tax, and whether you will owe or get a refund.`,
  keywords: ['bonus tax calculator', 'bonus after tax', 'bonus withholding', 'supplemental wages 22%', 'aggregate method', 'how much is my bonus taxed'],
  updated: '2026-11-15',
  popular: false,
  inputs: [
    { id: 'salary', label: 'Annual salary (before the bonus)', type: 'number', prefix: '$', default: 120000, min: 0, step: 1000, info: 'Your yearly pay before taxes, not counting the bonus. It decides which tax bracket the bonus lands in.' },
    { id: 'bonus', label: 'Bonus amount (gross)', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The bonus before any taxes, as stated by your employer.' },
    { id: 'status', label: 'Filing status', type: 'select', default: 'single', options: FILING_STATUS_OPTIONS, info: 'The filing status you will use on your federal return. It sets your brackets and standard deduction.' },
    { id: 'stateRate', label: 'State income tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.1, optional: true, help: 'A flat estimate. Use 0 for states without income tax.', info: 'Your approximate state income tax rate. States like Texas and Florida have none.' },
    { id: 'k401', label: 'Share of bonus sent to 401(k)', type: 'number', suffix: '% of bonus', min: 0, max: 100, step: 5, optional: true, placeholder: '0', help: 'Only if your plan lets you defer part of a bonus.', info: 'Pre-tax 401(k) money skips income tax but not Social Security or Medicare. Counted up to the yearly limit.' },
  ],
  outputs: [
    { id: 'net', label: 'Bonus take-home (22% flat method)', format: 'currency', primary: true, info: 'What lands in your account if your employer withholds the flat supplemental rate, after FICA, state tax and any 401(k) deferral.' },
    { id: 'federal', label: 'Federal tax withheld', format: 'currency', info: '22% of the taxable bonus (37% on supplemental wages over $1 million).' },
    { id: 'fica', label: 'Social Security + Medicare', format: 'currency', info: 'Extra payroll tax caused by the bonus. Social Security stops once wages pass the yearly wage base.' },
    { id: 'state', label: 'State tax', format: 'currency', info: 'The flat state rate you entered, applied to the bonus after any 401(k) deferral.' },
    { id: 'retirement', label: '401(k) deferral', format: 'currency', info: 'The part of the bonus sent to your 401(k), if any.' },
    { id: 'effectiveRate', label: 'Share of bonus lost to tax', format: 'percent', precision: 1, info: 'Federal withholding, FICA and state tax divided by the gross bonus.' },
    { id: 'trueFederal', label: 'Actual federal tax on the bonus', format: 'currency', info: 'Your federal tax with the bonus minus your federal tax without it. It is also roughly what the aggregate method would withhold.' },
    { id: 'difference', label: 'Refund (+) or owed (-) at filing', format: 'currency', help: 'Withheld minus actual federal tax.', info: 'Positive means too much was withheld and you get it back at filing. Negative means you will owe more.' },
    { id: 'trueNet', label: 'Bonus take-home after true tax', format: 'currency', info: 'What you keep once the filing-time difference is settled.' },
  ],
  compute: (v) => {
    const salary = num(v.salary);
    const bonus = num(v.bonus);
    if (salary === null || salary < 0 || bonus === null || bonus <= 0) return { net: null };
    const status = asStatus(v.status);
    const k401Pct = num(v.k401) ?? 0;
    const stateRate = num(v.stateRate) ?? 0;
    if (k401Pct < 0 || stateRate < 0) return { net: null };
    if (k401Pct > 100) return { net: null, error: '401(k) share cannot be over 100%.' };

    const retirement = Math.min((bonus * k401Pct) / 100, LIMIT_401K, bonus);
    const taxableBonus = bonus - retirement;
    const over = Math.max(0, taxableBonus - SUPPLEMENTAL_HIGH_THRESHOLD);
    const federal = (taxableBonus - over) * SUPPLEMENTAL_RATE + over * SUPPLEMENTAL_RATE_HIGH;

    const ficaWith = ficaTax(salary + bonus, status);
    const ficaWithout = ficaTax(salary, status);
    const ss = ficaWith.socialSecurity - ficaWithout.socialSecurity;
    const med = ficaWith.medicare - ficaWithout.medicare;
    const fica = ss + med;
    const state = (taxableBonus * stateRate) / 100;

    const stdDed = STANDARD_DEDUCTION[status];
    const taxBefore = federalIncomeTax(Math.max(0, salary - stdDed), status);
    const taxAfter = federalIncomeTax(Math.max(0, salary + taxableBonus - stdDed), status);
    const trueFederal = taxAfter.tax - taxBefore.tax;
    const difference = federal - trueFederal;

    const net = bonus - retirement - federal - fica - state;
    const trueNet = bonus - retirement - trueFederal - fica - state;
    const lost = (federal + fica + state) / bonus;
    const kept = net / bonus;

    let tone: 'good' | 'ok' | 'warn' | 'bad';
    if (kept >= 0.7) tone = 'good';
    else if (kept >= 0.6) tone = 'ok';
    else if (kept >= 0.5) tone = 'warn';
    else tone = 'bad';
    const badge = `You keep ${pct(kept, 0)}`;

    const gap = Math.abs(difference);
    const settle =
      gap < 0.5
        ? 'Withholding is about right, so expect little or no change at filing.'
        : difference > 0
          ? `Too much federal tax is withheld, so expect about ${money(gap, 0)} back at filing.`
          : `Too little federal tax is withheld, so expect to owe about ${money(gap, 0)} at filing.`;

    const charts: ChartSpec[] = [
      moneyDonut('Where your bonus goes', [{ label: 'Take-home', value: net }, { label: 'Federal withholding', value: federal }, { label: 'Social Security', value: ss }, { label: 'Medicare', value: med }, { label: 'State tax', value: state }, { label: '401(k)', value: retirement }], pct(kept, 0), 'kept'),
      { type: 'bar', title: 'Federal tax: withheld vs actual', categories: ['Withheld (flat rate)', 'Actual (aggregate)'], series: [{ name: 'Federal tax', values: [federal, trueFederal] }], format: CURRENCY },
    ];

    return {
      net,
      federal,
      fica,
      state,
      retirement,
      effectiveRate: lost,
      trueFederal,
      difference,
      trueNet,
      tone,
      badge,
      chart: charts,
      steps: [
        ...(retirement > 0 ? [`Taxable bonus = ${money(bonus, 0)} - ${money(retirement, 0)} to 401(k) = ${money(taxableBonus, 0)}`] : []),
        over > 0
          ? `Federal withholding = ${pct(SUPPLEMENTAL_RATE, 0)} × ${money(taxableBonus - over, 0)} + ${pct(SUPPLEMENTAL_RATE_HIGH, 0)} × ${money(over, 0)} = ${money(federal)}`
          : `Federal withholding = ${pct(SUPPLEMENTAL_RATE, 0)} × ${money(taxableBonus, 0)} = ${money(federal)}`,
        `Social Security + Medicare on the bonus = ${money(ss)} + ${money(med)} = ${money(fica)}`,
        `State tax = ${money(taxableBonus, 0)} × ${stateRate}% = ${money(state)}`,
        `Actual federal tax = tax on ${money(salary + taxableBonus, 0)} income - tax on ${money(salary, 0)} income = ${money(trueFederal)}`,
        `Take-home = ${money(bonus, 0)} - ${money(retirement, 0)} - ${money(federal)} - ${money(fica)} - ${money(state)} = ${money(net)}`,
      ],
      note: `${settle} Estimate for ${TAX_YEAR}, standard deduction, no other income or credits. Not tax advice.`,
    };
  },
  content: {
    formula: [
      `Federal withholding = ${pct(SUPPLEMENTAL_RATE, 0)} × taxable bonus (${pct(SUPPLEMENTAL_RATE_HIGH, 0)} on supplemental wages above ${money(SUPPLEMENTAL_HIGH_THRESHOLD, 0)})`,
      'Bonus FICA = FICA on (salary + bonus) - FICA on salary',
      'Actual federal tax = tax(salary + bonus) - tax(salary)',
      'Take-home = bonus - 401(k) - federal withholding - FICA - state tax',
    ],
    body: [
      `A bonus is not taxed at a special higher rate. It is ordinary income, but your employer has to withhold on it differently from your regular pay. Most employers use the flat method: ${pct(SUPPLEMENTAL_RATE, 0)} federal withholding on the bonus, and ${pct(SUPPLEMENTAL_RATE_HIGH, 0)} on the part of supplemental wages above ${money(SUPPLEMENTAL_HIGH_THRESHOLD, 0)} in a year. Social Security (6.2% up to the wage base) and Medicare (1.45%, plus 0.9% above $200,000 single or $250,000 joint) apply on top, then your state's tax.`,
      'The other option is the aggregate method. The employer adds the bonus to a regular paycheck and withholds as if that whole total were a normal paycheck. Because it treats one big paycheck as if you earned that much every pay period, it can withhold more than the flat method. Either way, withholding is only a prepayment.',
      `The real bill is settled when you file. This calculator also works out the actual federal tax on the bonus, which is your ${TAX_YEAR} tax with the bonus minus your tax without it. If the 22% withheld is more than that, you get the difference back. If your bonus pushes you into the 24% bracket or higher, you may owe a little more. The comparison chart shows both.`,
    ],
    sections: [
      {
        heading: 'Why does my bonus feel taxed so heavily?',
        paragraphs: [
          'Part of it is timing. A bonus lands in one paycheck, so the withholding looks huge on that stub, even though it is the same tax you would pay on that income spread across the year. Payroll taxes also hit every dollar, and state tax adds to it. Together they commonly take a third or more of a bonus.',
        ],
      },
      {
        heading: 'Can I lower the tax on a bonus?',
        paragraphs: [
          'Sending part of the bonus to a traditional 401(k) lowers federal and most state income tax on that part, though not Social Security or Medicare. Check that your plan allows bonus deferrals and that you stay under the yearly limit. See the 401(k) max-out calculator to plan the rest of your contributions.',
        ],
      },
      {
        heading: 'What this estimate leaves out',
        paragraphs: [
          'It assumes the bonus is your only supplemental pay this year, the standard deduction, and no other income, credits or itemized deductions. Your salary is treated as taxable pay with no pre-tax deductions, and state tax is one flat rate. Use the take-home pay and income tax calculators for a fuller picture.',
        ],
      },
    ],
    faq: [
      { q: 'How much of a $10,000 bonus do I keep?', a: 'With a $120,000 salary, single filing and a 5% state rate, a $10,000 bonus gives $2,200 federal withholding (22%), $765 FICA ($620 Social Security and $145 Medicare) and $500 state tax. That leaves $6,535 take-home, so you keep 65% and lose 34.7% to tax.' },
      { q: 'Is a bonus taxed at 22%?', a: 'Federal income tax is withheld at a flat 22% on most bonuses, but that is withholding, not your final rate. Your real tax depends on your brackets. For the same $120,000 salary the actual federal tax on a $10,000 bonus is $2,364, so you would owe about $164 more when you file. That is because part of the bonus lands in the 24% bracket.' },
      { q: 'Could I get a refund on my bonus withholding?', a: 'Yes, if your income is in a lower bracket. At a $40,000 salary, single, a $10,000 bonus has $2,200 withheld but only $1,200 of actual federal tax (10% and 12% brackets), so about $1,000 comes back at filing.' },
      { q: 'What if my bonus is large and my salary is high?', a: 'You can owe a lot at filing. At a $250,000 salary, single, a $100,000 bonus has $22,000 withheld, but the actual federal tax is $34,330.25, so you would owe about $12,330 more. FICA on the bonus is $2,350, all of it Medicare, because Social Security has already hit its wage base.' },
      { q: 'What is the 37% rate on bonuses?', a: 'When supplemental wages from one employer pass $1,000,000 in a calendar year, withholding on the portion above that is mandatory at 37%. This calculator applies it to the part of the bonus above $1,000,000, assuming no other supplemental pay.' },
      { q: 'Does a 401(k) contribution from the bonus help?', a: 'Yes. With a $120,000 salary and a $10,000 bonus, sending 10% ($1,000) to a pre-tax 401(k) leaves $9,000 taxable. Withholding falls to $1,980 and state tax to $450. FICA stays $765. Take-home is $5,805, and the $1,000 is saved instead of spent.' },
    ],
    sources: [
      { label: 'IRS Publication 15 (Employer\'s Tax Guide): supplemental wages', url: 'https://www.irs.gov/publications/p15' },
      { label: 'IRS: Tax withholding for supplemental wages', url: 'https://www.irs.gov/taxtopics/tc411' },
      { label: 'IRS Rev. Proc. 2025-32: 2026 tax brackets and standard deductions', url: 'https://www.irs.gov/irb/2025-45_IRB' },
    ],
  },
  related: ['take-home-pay', '401k-max-out', 'income-tax', 'rsu-tax', 'salary-to-hourly', 'tax-refund-estimator', 'bonus-vs-raise'],
  examples: [
    {
      // 22% × 10,000 = 2,200; FICA 6.2% × 10,000 + 1.45% × 10,000 = 765; state 5% = 500; net 6,535.
      // Actual: taxable 103,900 -> 113,900 crosses 105,700: 1,800×22% + 8,200×24% = 396 + 1,968 = 2,364; true net 10,000-2,364-765-500 = 6,371.
      values: { salary: 120000, bonus: 10000, status: 'single', stateRate: 5, k401: null },
      expect: { federal: 2200, fica: 765, state: 500, net: 6535, trueFederal: 2364, difference: -164, trueNet: 6371, effectiveRate: 0.3465 },
      tolerance: 1e-9,
    },
    {
      // Salary 40,000: taxable 23,900 -> tax 2,620; with bonus 33,900 -> 3,820; actual 1,200; refund 2,200 - 1,200 = 1,000.
      values: { salary: 40000, bonus: 10000, status: 'single', stateRate: 5, k401: 0 },
      expect: { federal: 2200, trueFederal: 1200, difference: 1000, net: 6535 },
      tolerance: 1e-9,
    },
    {
      // Salary 250,000: tax(233,900) = 51,304; tax(333,900) = 85,634.25; actual 34,330.25.
      // Medicare 1.45% × 100,000 + 0.9% × 100,000 = 2,350; Social Security already capped.
      values: { salary: 250000, bonus: 100000, status: 'single', stateRate: 0, k401: 0 },
      expect: { federal: 22000, fica: 2350, trueFederal: 34330.25, difference: -12330.25, net: 75650 },
      tolerance: 1e-9,
    },
    {
      // 10% of bonus to 401(k): 1,000; taxable 9,000; withheld 1,980; state 450; FICA 765; net 5,805.
      // Actual: 1,800×22% + 7,200×24% = 2,124; difference -144.
      values: { salary: 120000, bonus: 10000, status: 'single', stateRate: 5, k401: 10 },
      expect: { federal: 1980, state: 450, fica: 765, retirement: 1000, net: 5805, trueFederal: 2124, difference: -144 },
      tolerance: 1e-9,
    },
  ],
});
