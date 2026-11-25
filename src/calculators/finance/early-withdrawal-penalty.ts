import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'early-withdrawal-penalty',
  title: 'Early Withdrawal Penalty Calculator',
  category: 'finance',
  description: 'See what an early retirement-account withdrawal really costs. Enter the amount, penalty and tax rates to get the penalty, tax, total cost and cash you keep.',
  keywords: ['early withdrawal penalty calculator', '401k early withdrawal calculator', 'ira early withdrawal penalty', '10% penalty before 59 1/2', 'cash out 401k tax'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'amount', label: 'Amount you withdraw', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The gross amount taken out of the account, before any tax or penalty.' },
    { id: 'penalty', label: 'Early withdrawal penalty rate', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, info: 'The additional tax on most withdrawals before age 59½ is 10% (IRC 72(t)). Change it if yours differs, for example 25% on some SIMPLE IRA withdrawals in the first two years.' },
    { id: 'fed', label: 'Federal income tax rate on it', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 1, info: 'Your marginal bracket. The withdrawal is added on top of your other income, so the top slice may be taxed at a higher rate.' },
    { id: 'state', label: 'State income tax rate (optional)', type: 'number', suffix: '%', default: 0, min: 0, max: 100, step: 0.5, info: 'Leave at 0 if your state has no income tax or you want to ignore it.' },
    { id: 'pretax', label: 'Pre-tax account (traditional 401(k) or IRA)', type: 'toggle', default: true, info: 'On: the whole withdrawal is taxable. Off: only the share you enter below is taxable, such as earnings in a Roth account.' },
    { id: 'share', label: 'Taxable share if not pre-tax', type: 'number', suffix: '%', default: 0, min: 0, max: 100, step: 5, info: 'Only used when the pre-tax switch is off. After-tax contributions you made to a Roth IRA can usually come out without tax or penalty; earnings generally cannot.' },
  ],
  outputs: [
    { id: 'net', label: 'Cash you keep', format: 'currency', precision: 2, primary: true, info: 'Withdrawal minus penalty, federal tax and state tax.' },
    { id: 'penaltyAmt', label: 'Early withdrawal penalty', format: 'currency', precision: 2, info: 'Taxable amount × penalty rate.' },
    { id: 'fedTax', label: 'Federal income tax', format: 'currency', precision: 2, info: 'Taxable amount × federal rate.' },
    { id: 'stateTax', label: 'State income tax', format: 'currency', precision: 2, info: 'Taxable amount × state rate.' },
    { id: 'total', label: 'Total cost', format: 'currency', precision: 2, info: 'Penalty plus federal and state tax.' },
    { id: 'effective', label: 'Effective cost', format: 'percent', precision: 1, info: 'Total cost as a share of the amount withdrawn.' },
  ],
  compute: (v) => {
    const amount = num(v.amount);
    const pen = num(v.penalty);
    const fed = num(v.fed);
    const st = num(v.state ?? 0) ?? 0;
    const pretax = v.pretax !== 'off';
    const share = pretax ? 100 : (num(v.share ?? 0) ?? 0);
    if ([amount, pen, fed].some((x) => x === null)) return { net: null };
    if ([amount, pen, fed, st, share].some((x) => (x as number) < 0)) return { net: null, error: 'Values cannot be negative.' };
    if ([pen, fed, st, share].some((x) => (x as number) > 100)) return { net: null, error: 'Rates and shares cannot be over 100%.' };
    if (pen! + fed! + st > 100) return { net: null, error: 'The penalty and tax rates add up to more than 100%.' };
    const taxable = amount! * (share / 100);
    const penaltyAmt = taxable * (pen! / 100);
    const fedTax = taxable * (fed! / 100);
    const stateTax = taxable * (st / 100);
    const total = penaltyAmt + fedTax + stateTax;
    const net = amount! - total;
    const effective = amount! > 0 ? (total / amount!) * 100 : 0;
    return {
      net,
      penaltyAmt,
      fedTax,
      stateTax,
      total,
      effective,
      tone: effective >= 30 ? 'bad' : effective > 0 ? 'warn' : 'good',
      badge: amount! > 0 ? `${pct(total / amount!, 1)} lost` : 'Nothing withdrawn',
      note: total === 0
        ? 'With these inputs no penalty or tax applies, so you keep the full amount. Check the exceptions and the taxable share before relying on that.'
        : `Of ${money(amount!)}, ${money(total)} goes to the penalty and tax, so you keep ${money(net)}. Exceptions under IRC 72(t) can remove the penalty, but they are not modelled here.`,
      chart: {
        type: 'donut' as const,
        title: 'Where the withdrawal goes',
        slices: [
          { label: 'You keep', value: net },
          { label: 'Penalty', value: penaltyAmt },
          { label: 'Federal tax', value: fedTax },
          { label: 'State tax', value: stateTax },
        ].filter((s) => s.value > 0),
        format: CURRENCY,
        centerLabel: 'You keep',
        centerValue: money(net, 0),
      },
      steps: [
        `Taxable amount = ${money(amount!)} × ${share}% = ${money(taxable)}`,
        `Penalty = ${money(taxable)} × ${pen}% = ${money(penaltyAmt)}`,
        `Federal tax = ${money(taxable)} × ${fed}% = ${money(fedTax)}`,
        `State tax = ${money(taxable)} × ${st}% = ${money(stateTax)}`,
        `Cash you keep = ${money(amount!)} − ${money(total)} = ${money(net)}`,
      ],
    };
  },
  content: {
    formula: [
      'Taxable amount = withdrawal × taxable share (100% for a pre-tax account)',
      'Penalty = taxable amount × penalty rate',
      'Income tax = taxable amount × (federal rate + state rate)',
      'Cash you keep = withdrawal − penalty − income tax',
    ],
    body: [
      'Taking money out of a traditional 401(k) or IRA before age 59½ usually triggers two bills. The withdrawal is added to your taxable income, and the IRS adds a 10% additional tax on top (IRC section 72(t)).',
      'Example: you withdraw $10,000 from a pre-tax account with a 10% penalty, a 22% federal rate and a 5% state rate. The penalty is $1,000, federal tax is $2,200 and state tax is $500. That is $3,700 of cost, so you keep $6,300, an effective cost of 37%.',
      'Exceptions exist and are not modelled. Some withdrawals avoid the 10% penalty, for example certain medical costs, disability, first-home purchases from an IRA, or a series of equal payments. Many 401(k) cash-outs also have 20% mandatory federal withholding, which is a prepayment of tax rather than an extra cost. Rates here come from you, and a large withdrawal can push you into a higher bracket. This is general information, not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much do I lose by withdrawing $10,000 early?', a: 'With a 10% penalty, 22% federal and 5% state rate on a pre-tax account, you lose $3,700 and keep $6,300. That is an effective cost of 37%.' },
      { q: 'Is the 10% penalty on top of income tax?', a: 'Yes. For most early withdrawals the 10% additional tax is in addition to ordinary income tax on the taxable amount.' },
      { q: 'Does the penalty apply to a Roth IRA?', a: 'Generally only to the earnings. Contributions you made can usually come out without tax or penalty. Turn off the pre-tax switch and enter the taxable share to model that.' },
      { q: 'Are there exceptions to the penalty?', a: 'Yes, under IRC section 72(t), for example certain medical costs, disability and some other cases. They are not modelled here, so check the IRS page below.' },
      { q: 'Why is my effective cost more than the penalty rate?', a: 'Because income tax is added to the penalty. At 10%, 22% and 5% the combined cost is 37% of the amount, not 10%.' },
    ],
    sources: [
      { label: 'IRS: Topic no. 557, Additional tax on early distributions from traditional and Roth IRAs', url: 'https://www.irs.gov/taxtopics/tc557' },
    ],
  },
  related: ['roth-vs-traditional', '401k-loan', 'retirement', 'bonus-tax'],
  examples: [
    // pen 1000; fed 2200; state 500; total 3700; net 6300; effective 37%
    { values: { amount: 10000, penalty: 10, fed: 22, state: 5, pretax: 'on', share: 0 }, expect: { penaltyAmt: 1000, fedTax: 2200, stateTax: 500, total: 3700, net: 6300, effective: 37 } },
    // 25000 pre-tax: pen 2500; fed 6000; state 0; total 8500; net 16500; 34%
    { values: { amount: 25000, penalty: 10, fed: 24, state: 0, pretax: 'on', share: 0 }, expect: { penaltyAmt: 2500, fedTax: 6000, stateTax: 0, total: 8500, net: 16500, effective: 34 } },
    // Roth, 40% taxable = 4000: pen 400; fed 880; state 200; total 1480; net 8520; 14.8%
    { values: { amount: 10000, penalty: 10, fed: 22, state: 5, pretax: 'off', share: 40 }, expect: { penaltyAmt: 400, fedTax: 880, stateTax: 200, total: 1480, net: 8520, effective: 14.8 } },
  ],
});
