import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'bonus-gross-up',
  title: 'Bonus Gross-Up: Gross for a Target Net',
  category: 'finance',
  description: 'Find the gross bonus needed to put a target amount in your hand after federal withholding, Social Security and Medicare, and state tax.',
  keywords: ['bonus gross up calculator', 'gross up bonus', 'gross needed for net bonus', 'tax gross up', 'how much gross for target net'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'net', label: 'Take-home amount you want', type: 'number', prefix: '$', default: 5000, min: 0, step: 250, info: 'The amount you want to receive after all withholding.' },
    { id: 'fed', label: 'Federal withholding rate', type: 'number', suffix: '%', default: 22, min: 0, max: 60, step: 0.5, info: 'Flat supplemental rate your employer withholds. Many employers use 22%; check your payroll.' },
    { id: 'fica', label: 'Social Security + Medicare', type: 'number', suffix: '%', default: 7.65, min: 0, max: 20, step: 0.05, info: '7.65% for most employees (6.2% + 1.45%). Use 1.45% if you are above the Social Security wage base.' },
    { id: 'state', label: 'State income tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 20, step: 0.1, info: 'A flat estimate. Use 0 for states without income tax.' },
  ],
  outputs: [
    { id: 'gross', label: 'Gross bonus needed', format: 'currency', precision: 2, primary: true, info: 'Net ÷ (1 − total withholding rate).' },
    { id: 'withheld', label: 'Total withheld', format: 'currency', precision: 2, info: 'Gross minus the take-home amount.' },
    { id: 'rate', label: 'Combined withholding rate', format: 'percent', precision: 2, info: 'Federal + payroll + state rates added together.' },
    { id: 'extra', label: 'Extra over a plain bonus', format: 'currency', precision: 2, info: 'How much more than the target the gross must be.' },
  ],
  compute: (v) => {
    const net = num(v.net);
    const fed = num(v.fed);
    const fica = num(v.fica);
    const state = num(v.state);
    if (net === null || fed === null || fica === null || state === null) return { gross: null };
    if (net <= 0 || fed < 0 || fica < 0 || state < 0) return { gross: null };
    const total = (fed + fica + state) / 100;
    if (total >= 1) return { gross: null };
    const gross = net / (1 - total);
    const withheld = gross - net;
    const f = gross * fed / 100;
    const p = gross * fica / 100;
    const s = gross * state / 100;
    return {
      gross,
      withheld,
      rate: total,
      extra: withheld,
      tone: 'ok',
      badge: `${money(gross)} gross`,
      note: `To take home ${money(net)} with ${fmt(total * 100, 2)}% withheld, the gross bonus must be ${money(gross)}. Grossing up is not the same as adding the rate to the net: tax is taken from the larger amount. Rates are flat estimates; the final tax depends on your return.`,
      chart: {
        type: 'bar' as const,
        title: 'Where the gross bonus goes',
        categories: ['Take-home', 'Federal', 'Social Security + Medicare', 'State'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Amount', values: [net, f, p, s] }],
      },
      steps: [
        `Combined rate = ${fmt(fed)}% + ${fmt(fica)}% + ${fmt(state)}% = ${fmt(total * 100, 2)}%`,
        `Gross = ${money(net)} ÷ (1 − ${fmt(total, 4)}) = ${money(gross)}`,
        `Federal ${money(f)} + payroll ${money(p)} + state ${money(s)} = ${money(withheld)}`,
        `Check: ${money(gross)} − ${money(withheld)} = ${money(net)}`,
      ],
    };
  },
  content: {
    formula: [
      'Combined rate = federal + payroll + state rates',
      'Gross = target net ÷ (1 − combined rate)',
      'Withheld = gross − target net',
    ],
    body: [
      'Employers sometimes promise a bonus "after tax". Because tax is taken from the gross, you cannot just add a percentage to the net. You divide by what is left after withholding. This calculator does that from three flat rates you can edit.',
      'Example: you want $5,000 in hand with 22% federal, 7.65% Social Security and Medicare, and 5% state. The combined rate is 34.65%, so gross = 5,000 ÷ 0.6535 = $7,651.11. Withholding is $2,651.11: $1,683.24 federal, $585.31 payroll and $382.56 state.',
      'These are withholding rates, not your final tax. A large bonus can push part of your income into a higher bracket, and the Social Security portion stops above the yearly wage base. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is a bonus gross-up?', a: 'It is a gross bonus set high enough that the amount you receive after withholding equals a target. For $5,000 net at 34.65% withheld, the gross is $7,651.11.' },
      { q: 'Why not just add 34.65% to $5,000?', a: 'That gives $6,732.50, and 34.65% of it leaves only $4,399.69. Tax is charged on the gross, so you divide by 1 minus the rate.' },
      { q: 'Which federal rate should I use?', a: 'Use the flat rate your payroll withholds on bonuses. 22% is common for supplemental pay up to $1 million.' },
      { q: 'Does this include 401(k) deferrals?', a: 'No. It assumes the whole bonus is taxed and paid out in cash.' },
      { q: 'Is this my final tax?', a: 'No. Withholding is an estimate. Your actual tax is set when you file your return.' },
    ],
    sources: [],
  },
  related: ['bonus-tax', 'net-to-gross', 'bonus-vs-raise', 'take-home-pay'],
  examples: [
    // total .3465; gross 5000/.6535 = 7651.1095; withheld 2651.11
    { values: { net: 5000, fed: 22, fica: 7.65, state: 5 }, expect: { gross: 7651.11, withheld: 2651.11, rate: 0.3465, extra: 2651.11 }, tolerance: 0.001 },
    // total .25; gross 3000/.75 = 4000
    { values: { net: 3000, fed: 22, fica: 3, state: 0 }, expect: { gross: 4000, withheld: 1000, rate: 0.25, extra: 1000 } },
  ],
});
