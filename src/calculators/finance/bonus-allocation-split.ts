import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, moneyDonut, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'bonus-allocation-split',
  title: 'Bonus Allocation Split Calculator',
  category: 'finance',
  description: 'Turn a gross bonus into take-home pay, then split it between debt payoff, savings, investing and spending. See the dollar amount for every bucket.',
  keywords: ['bonus allocation', 'what to do with a bonus', 'bonus split calculator', 'bonus after tax split', 'pay off debt or invest bonus', 'how to spend a bonus'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'bonus', label: 'Bonus amount (gross)', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The bonus before any taxes, as stated by your employer.' },
    { id: 'fed', label: 'Federal withholding rate', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 0.5, info: 'The share of the bonus withheld for federal income tax. Employers often use a flat 22% on bonuses. Check your pay stub for the real figure.' },
    { id: 'fica', label: 'Social Security + Medicare rate', type: 'number', suffix: '%', default: 7.65, min: 0, max: 100, step: 0.05, info: 'Payroll tax: 6.2% Social Security plus 1.45% Medicare is 7.65%. It can be lower if you are above the Social Security wage base.' },
    { id: 'state', label: 'State and local tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 0.1, optional: true, help: 'Use 0 for states without income tax.', info: 'A flat estimate of state and local income tax withheld from the bonus.' },
    { id: 'debt', label: 'Share to pay down debt', type: 'number', suffix: '% of net', default: 40, min: 0, max: 100, step: 5, optional: true, info: 'Percent of the take-home bonus you send to debt.' },
    { id: 'savings', label: 'Share to savings', type: 'number', suffix: '% of net', default: 30, min: 0, max: 100, step: 5, optional: true, info: 'Percent of the take-home bonus you put in savings.' },
    { id: 'invest', label: 'Share to investing', type: 'number', suffix: '% of net', default: 20, min: 0, max: 100, step: 5, optional: true, help: 'Whatever is left after these three is counted as spending.', info: 'Percent of the take-home bonus you invest. The remainder after debt, savings and investing becomes your spending money.' },
  ],
  outputs: [
    { id: 'net', label: 'Net bonus (take-home)', format: 'currency', primary: true, info: 'The bonus after the federal, payroll and state rates you entered.' },
    { id: 'taxes', label: 'Withheld in total', format: 'currency', info: 'Gross bonus minus net bonus.' },
    { id: 'toDebt', label: 'To debt', format: 'currency', info: 'Net bonus times the debt share.' },
    { id: 'toSavings', label: 'To savings', format: 'currency', info: 'Net bonus times the savings share.' },
    { id: 'toInvest', label: 'To investing', format: 'currency', info: 'Net bonus times the investing share.' },
    { id: 'toSpend', label: 'To spend', format: 'currency', info: 'The remainder of the net bonus after the other three buckets.' },
    { id: 'spendShare', label: 'Spend share', format: 'percent', precision: 1, info: '100% minus the debt, savings and investing shares.' },
  ],
  compute: (v) => {
    const bonus = num(v.bonus);
    const fed = num(v.fed);
    const fica = num(v.fica);
    if (bonus === null || fed === null || fica === null || bonus < 0) return { net: null };
    const state = num(v.state) ?? 0;
    const d = num(v.debt) ?? 0;
    const s = num(v.savings) ?? 0;
    const i = num(v.invest) ?? 0;
    if ([fed, fica, state, d, s, i].some((x) => x < 0)) return { net: null, error: 'Values cannot be negative.' };
    const rate = fed + fica + state;
    if (rate > 100) return { net: null, error: 'Withholding rates add up to more than 100%.' };
    if (d + s + i > 100) return { net: null, error: `Debt, savings and investing add up to ${+(d + s + i).toFixed(2)}%. Keep the total at 100% or less.` };

    const net = bonus * (1 - rate / 100);
    const taxes = bonus - net;
    const spendPct = 100 - d - s - i;
    const toDebt = (net * d) / 100;
    const toSavings = (net * s) / 100;
    const toInvest = (net * i) / 100;
    const toSpend = (net * spendPct) / 100;
    const kept = 1 - rate / 100;

    return {
      net,
      taxes,
      toDebt,
      toSavings,
      toInvest,
      toSpend,
      spendShare: spendPct / 100,
      tone: spendPct <= 25 ? 'good' : spendPct <= 50 ? 'ok' : 'warn',
      badge: `${money(net, 0)} to split`,
      chart: [
        moneyDonut('Where the net bonus goes', [{ label: 'Debt', value: toDebt }, { label: 'Savings', value: toSavings }, { label: 'Investing', value: toInvest }, { label: 'Spend', value: toSpend }], money(net, 0), 'net bonus'),
        { type: 'bar', title: 'Gross bonus to take-home', categories: ['Gross', 'Withheld', 'Net'], series: [{ name: 'Amount', values: [bonus, taxes, net] }], format: CURRENCY },
      ],
      steps: [
        `Total withholding rate = ${fed}% + ${fica}% + ${state}% = ${+rate.toFixed(4)}%`,
        `Net bonus = ${money(bonus, 0)} × (1 - ${pct(rate / 100, 2)}) = ${money(net)}`,
        `Debt ${d}%, savings ${s}%, investing ${i}%, spend ${+spendPct.toFixed(2)}% (the remainder)`,
        `Buckets = ${money(toDebt)} + ${money(toSavings)} + ${money(toInvest)} + ${money(toSpend)} = ${money(net)}`,
      ],
      note: `You keep ${pct(kept, 1)} of the gross bonus. The rates are your own estimates, not a tax calculation, and not tax advice. Check your pay stub for what was really withheld.`,
    };
  },
  content: {
    formula: [
      'Net bonus = gross bonus × (1 - federal % - payroll % - state %)',
      'Spend share = 100% - debt % - savings % - investing %',
      'Each bucket = net bonus × its share',
    ],
    body: [
      'A bonus feels like a big number until the paycheck arrives. Federal withholding, Social Security, Medicare and state tax all come out first, so the money you can actually plan with is the net bonus. This calculator starts there, then splits it between the four things most people want to do with a bonus: pay down debt, build savings, invest, and enjoy some of it.',
      'The withholding rates are inputs, not something the calculator looks up. The defaults are 22% federal (the flat supplemental rate many employers use), 7.65% for Social Security and Medicare, and a 5% state estimate. They are estimates and not tax advice. Your real tax is settled when you file, and your pay stub shows what was actually withheld. For a bracket-based view of the same bonus, use the bonus tax calculator.',
      'You set the debt, savings and investing shares. Whatever is left over counts as spending, so the four buckets always add up to the full net bonus. If your three shares add up to more than 100%, the calculator asks you to lower them.',
    ],
    sections: [
      {
        heading: 'A simple way to choose the split',
        paragraphs: [
          'High-interest debt is a guaranteed return: paying off a card at 22% APR saves 22% a year. A starter emergency fund comes next for most people, then retirement contributions, especially if there is an employer match you are not fully using. A planned slice for fun makes it easier to stick with the rest. The debt vs invest calculator can help compare the first two.',
        ],
      },
      {
        heading: 'What this leaves out',
        paragraphs: [
          'It does not apply tax brackets, 401(k) deferrals or deductions, and it treats the three rates as flat percentages of the bonus. It also does not model returns on the savings or investing buckets.',
        ],
      },
    ],
    faq: [
      { q: 'How much of a $10,000 bonus do I keep?', a: 'With 22% federal, 7.65% Social Security and Medicare and 5% state, the total withholding is 34.65%, or $3,465. The net bonus is $6,535.' },
      { q: 'How does a 40/30/20/10 split work on that bonus?', a: 'On a $6,535 net bonus, 40% to debt is $2,614, 30% to savings is $1,960.50, 20% to investing is $1,307 and the remaining 10% is $653.50 to spend. Together they add up to $6,535.' },
      { q: 'What if my percentages add up to less than 100%?', a: 'The remainder is counted as spending. For example, 40% debt, 30% savings and 20% investing leaves 10% to spend.' },
      { q: 'What if they add up to more than 100%?', a: 'The calculator shows an error and no result until the debt, savings and investing shares total 100% or less.' },
      { q: 'Are the withholding rates exact?', a: 'No. They are estimates you can change, and this is not tax advice. Your employer may use a different method, and the final tax is decided when you file your return.' },
    ],
    sources: [
      { label: 'IRS: Tax withholding for supplemental wages', url: 'https://www.irs.gov/taxtopics/tc411' },
      { label: 'IRS Publication 15 (Employer\'s Tax Guide)', url: 'https://www.irs.gov/publications/p15' },
    ],
  },
  related: ['bonus-tax', 'bonus-vs-raise', 'tax-refund-splitter', 'debt-vs-invest'],
  examples: [
    {
      // net = 10,000 × (1 - 0.22 - 0.0765 - 0.05) = 10,000 × 0.6535 = 6,535; 40/30/20/10 -> 2,614 / 1,960.5 / 1,307 / 653.5.
      values: { bonus: 10000, fed: 22, fica: 7.65, state: 5, debt: 40, savings: 30, invest: 20 },
      expect: { net: 6535, taxes: 3465, toDebt: 2614, toSavings: 1960.5, toInvest: 1307, toSpend: 653.5, spendShare: 0.1 },
      tolerance: 1e-9,
    },
    {
      // net = 5,000 × (1 - 0.24) = 3,800; all in debt/savings 50/50 -> 1,900 each, nothing to spend.
      values: { bonus: 5000, fed: 24, fica: 0, state: null, debt: 50, savings: 50, invest: null },
      expect: { net: 3800, toDebt: 1900, toSavings: 1900, toInvest: 0, toSpend: 0 },
      tolerance: 1e-9,
    },
  ],
});
