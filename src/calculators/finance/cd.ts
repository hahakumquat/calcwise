import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { growthCharts, monthIdx, yr } from '../../lib/helpers/finance';
import { money, MONTH_S, pct, toYears } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'cd',
  title: 'CD Calculator',
  category: 'finance',
  description: 'Calculate a certificate of deposit\'s maturity value, interest earned and APY.',
  keywords: ['certificate of deposit', 'CD rates', 'CD interest', 'APY', 'maturity value', 'CD ladder'],
  inputs: [
    { id: 'deposit', label: 'Deposit', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The amount you put into the CD at opening.' },
    { id: 'rate', label: 'Rate', type: 'number', suffix: '%', default: 4.25, min: 0, step: 0.05, info: 'The rate the bank quotes. Most CDs are advertised by APY.' },
    {
      id: 'rateType',
      info: 'APY already includes compounding. Pick \'Interest rate\' if the bank quotes a nominal rate plus a compounding schedule.',
      label: 'Rate is quoted as',
      type: 'select',
      segmented: true,
      default: 'apy',
      options: [
        { value: 'apy', label: 'APY' },
        { value: 'apr', label: 'Interest rate' },
      ],
    },
    {
      id: 'compounding',
      info: 'How often the bank adds interest. Daily is most common for CDs.',
      label: 'Compounding',
      type: 'select',
      default: '365',
      showWhen: { input: 'rateType', is: 'apr' },
      options: [
        { value: '365', label: 'Daily' },
        { value: '12', label: 'Monthly' },
        { value: '4', label: 'Quarterly' },
        { value: '2', label: 'Semiannually' },
        { value: '1', label: 'Annually' },
      ],
    },
    { id: 'term', label: 'Term', type: 'number', unit: 'time', units: ['mo', 'yr'], defaultUnit: 'mo', default: 12, min: 0, info: 'How long the money is locked in, e.g. 6, 12 or 60 months.' },
  ],
  outputs: [
    { id: 'maturity', label: 'Value at maturity', format: 'currency', primary: true, info: 'What the CD will be worth when the term ends, with all interest added.' },
    { id: 'interest', label: 'Interest earned', format: 'currency', info: 'Total interest earned over the term.' },
    { id: 'apy', label: 'APY', format: 'percent', precision: 3, info: 'The yearly yield including compounding — the figure to compare across banks.' },
  ],
  compute: (v) => {
    const P = num(v.deposit);
    const rate = num(v.rate);
    const termS = num(v.term);
    if (P === null || rate === null || termS === null || P < 0 || rate < 0 || termS <= 0) return { maturity: null };
    const t = toYears(termS);
    const k = Number(v.compounding) || 365;
    const apy = v.rateType === 'apr' ? (1 + rate / 100 / k) ** k - 1 : rate / 100;
    const maturity = P * (1 + apy) ** t;
    const idx = monthIdx(Math.max(1, Math.round(t * 12)));
    return {
      maturity,
      interest: maturity - P,
      apy,
      chart: growthCharts(idx.map(yr), idx.map(() => P), idx.map((m) => P * (1 + apy) ** (m / 12)), 'Deposit', 'Interest'),
      steps: [
        v.rateType === 'apr' ? `APY = (1 + ${rate}% ÷ ${k})^${k} − 1 = ${pct(apy, 4)}` : `APY = ${rate}%`,
        `Maturity = ${money(P)} × (1 + ${pct(apy, 4)})^${+t.toFixed(4)} years = ${money(maturity)}`,
      ],
      note: `Interest of ${money(maturity - P)} is taxable as ordinary income in the year it is credited, unless the CD is in an IRA.`,
    };
  },
  content: {
    formula: ['Maturity = deposit × (1 + APY)^years', 'APY = (1 + r/k)^k − 1 when the bank quotes a rate r compounded k times a year'],
    body: [
      'A certificate of deposit pays a fixed rate for a fixed term in exchange for leaving your money untouched. Most banks advertise CDs by their annual percentage yield (APY), which already includes compounding, so the maturity value is simply the deposit grown at the APY for the length of the term.',
      'If your bank instead quotes an interest rate and a compounding schedule, choose "Interest rate" and the calculator converts it to APY. Daily compounding is the most common, and gives a slightly higher APY than the quoted rate — 4.00% compounded daily is a 4.081% APY.',
      'Withdrawing before maturity usually triggers an early-withdrawal penalty, often several months of interest. A CD ladder — splitting money across CDs that mature at different times — keeps some cash available every few months while still earning CD rates.',
    ],
    faq: [
      { q: 'Are CDs safe?', a: 'CDs at FDIC-insured banks (or NCUA-insured credit unions) are protected up to $250,000 per depositor, per institution, per ownership category.' },
      { q: 'Is a CD better than a high-yield savings account?', a: 'A CD locks in the rate, which helps when rates may fall, but ties up the money. A savings account lets you withdraw any time but its rate can change. Compare the APYs and how soon you might need the cash.' },
    ],
  },
  related: ['compound-interest', 'savings-goal', 'simple-interest', 'inflation'],
  examples: [
    { values: { deposit: 10000, rate: 4.5, rateType: 'apy', compounding: '365', term: 12 * MONTH_S }, expect: { maturity: 10450, interest: 450, apy: 0.045 } },
    { values: { deposit: 1000, rate: 12, rateType: 'apr', compounding: '12', term: 24 * MONTH_S }, expect: { apy: 0.12682503, maturity: 1269.73464853 } },
  ],
});
