import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { pvAnnuity } from '../../lib/helpers/finance';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

// Monthly rate at which the payments are worth exactly the lump sum (bisection on 0..5% a month).
const breakevenMonthly = (lump: number, pmt: number, n: number): number | null => {
  if (pvAnnuity(pmt, 0, n) <= lump) return null; // payments total no more than the lump sum: never better
  let lo = 0;
  let hi = 0.05;
  if (pvAnnuity(pmt, hi, n) > lump) return null;
  for (let i = 0; i < 100; i++) {
    const mid = (lo + hi) / 2;
    if (pvAnnuity(pmt, mid, n) > lump) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
};

export default defineCalculator({
  slug: 'lump-sum-vs-payments',
  title: 'Lump Sum vs Monthly Payments Calculator',
  category: 'finance',
  description: 'Compare a lump sum with monthly payments for a pension, settlement or lottery prize. See today\'s value of the payments and the return that makes them equal.',
  keywords: ['lump sum vs monthly payments', 'lump sum or annuity calculator', 'pension lump sum calculator', 'settlement lump sum vs payments', 'present value of payments'],
  updated: '2026-11-17',
  inputs: [
    { id: 'lump', label: 'Lump sum offered today', type: 'number', prefix: '$', default: 100000, min: 0, step: 1000, info: 'The one-off amount you would receive now, after any tax you expect to pay.' },
    { id: 'pmt', label: 'Monthly payment', type: 'number', prefix: '$', default: 1000, min: 0, step: 50, info: 'What you would receive each month instead, after the same tax treatment.' },
    { id: 'years', label: 'Years of payments', type: 'number', default: 10, min: 1, max: 60, step: 1, info: 'For a pension this is how long you expect to live and collect. For a settlement it is the schedule.' },
    { id: 'rate', label: 'Return you could earn on the lump sum', type: 'number', suffix: '%', default: 5, min: 0, max: 30, step: 0.25, info: 'Your expected yearly return if you invested the lump sum. Be cautious: use a realistic long-run figure.' },
  ],
  outputs: [
    { id: 'pv', label: 'Payments are worth today', format: 'currency', primary: true, info: 'The monthly payments discounted at your return, treated as paid at the end of each month.' },
    { id: 'diff', label: 'Payments minus lump sum', format: 'currency', info: 'Today\'s value of the payments minus the lump sum. Positive favours the payments.' },
    { id: 'total', label: 'Total of all payments', format: 'currency', info: 'Monthly payment × number of months, with no discounting.' },
    { id: 'be', label: 'Break-even return', format: 'percent', precision: 2, info: 'The yearly return at which the lump sum and the payments are worth the same. Compounded monthly.' },
  ],
  compute: (v) => {
    const lump = num(v.lump);
    const pmt = num(v.pmt);
    const years = num(v.years);
    const rate = num(v.rate);
    if (lump === null || pmt === null || years === null || rate === null || lump < 0 || pmt < 0 || years < 1 || rate < 0) return { pv: null };
    const n = Math.round(years * 12);
    const r = rate / 100 / 12;
    const pv = pvAnnuity(pmt, r, n);
    const diff = pv - lump;
    const total = pmt * n;
    const bm = breakevenMonthly(lump, pmt, n);
    const be = bm === null ? null : bm * 12;
    const better = Math.abs(diff) < 0.005 ? 'even' : diff > 0 ? 'payments' : 'lump';
    const xs: number[] = [];
    const pvs: number[] = [];
    const lumps: number[] = [];
    for (let k = 0; k <= 12; k++) {
      const rr = (k * 2.5) / 100 / 12;
      xs.push(k * 2.5);
      pvs.push(pvAnnuity(pmt, rr, n));
      lumps.push(lump);
    }
    return {
      pv,
      diff,
      total,
      be,
      tone: better === 'even' ? ('ok' as const) : better === 'payments' ? ('good' as const) : ('bad' as const),
      badge: better === 'even' ? 'Dead even' : better === 'payments' ? 'Payments win' : 'Lump sum wins',
      note:
        better === 'payments'
          ? `At ${fmt(rate, 2)}% a year the payments are worth $${fmt(pv, 0)} today, $${fmt(diff, 0)} more than the lump sum.`
          : better === 'lump'
            ? `At ${fmt(rate, 2)}% a year the payments are worth $${fmt(pv, 0)} today, $${fmt(-diff, 0)} less than the lump sum.`
            : `At ${fmt(rate, 2)}% a year the payments and the lump sum are worth the same today.`,
      chart: {
        type: 'line',
        title: 'Value of the payments at different returns',
        x: xs,
        xLabel: 'Yearly return (%)',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Payments today', values: pvs },
          { name: 'Lump sum', values: lumps },
        ],
      },
      steps: [
        `Months = ${fmt(years, 0)} × 12 = ${fmt(n)}; monthly rate = ${fmt(rate, 2)}% ÷ 12 = ${fmt(r * 100, 4)}%`,
        `Value today = $${fmt(pmt, 2)} × (1 − (1 + r)^−${fmt(n)}) ÷ r = $${fmt(pv, 2)}`,
        `Difference = $${fmt(pv, 2)} − $${fmt(lump, 2)} = $${fmt(diff, 2)}`,
      ],
    };
  },
  content: {
    formula: [
      'Value today = payment × (1 − (1 + r)^−n) ÷ r, where r is the monthly return and n the number of months',
      'With a 0% return, value today = payment × n',
      'Break-even return: the r at which value today equals the lump sum',
    ],
    body: [
      'Pensions, injury settlements, lottery prizes and some buyouts give you a choice: take one lump sum now, or a stream of payments over time. The two are not directly comparable, because money today can be invested and money later cannot. This calculator discounts the payments back to today at the return you think you could earn, then compares the result with the lump sum.',
      'The break-even return is often the most useful number. If you are confident you can earn more than it after tax, the lump sum comes out ahead; if not, the payments do. A low break-even means the payments are generous, and a high one means the lump sum is doing most of the work.',
      'Payments are treated as arriving at the end of each month. Everything runs in your browser; nothing is sent anywhere.',
    ],
    sections: [
      {
        heading: 'What this does not include',
        paragraphs: [
          'Tax, inflation and risk can all change the answer. Fixed payments lose buying power if prices rise, while a lump sum carries market risk, and a pension may stop if the provider fails. Compare both options after tax, and treat a close result as a tie.',
          'For a pension, longevity matters most: the payments only win if you collect for long enough. For big decisions, ask a fee-only adviser or the plan administrator for the exact terms.',
        ],
      },
    ],
    faq: [
      { q: 'How do I compare a lump sum with monthly payments?', a: 'Discount the monthly payments back to today at the return you could earn, then compare. For $1,000 a month for 10 years at a 0% return the payments are worth $120,000 today, so they beat a $100,000 lump sum by $20,000.' },
      { q: 'What is the break-even return?', a: 'It is the yearly return at which the lump sum and the payments are worth the same. If you expect to earn more than that after tax, take the lump sum; if less, the payments are better value.' },
      { q: 'What return should I use?', a: 'Use a cautious long-run estimate after fees and tax. A higher return makes the lump sum look better, so being optimistic here tilts the answer.' },
      { q: 'Does this include tax or inflation?', a: 'No. Enter the lump sum and payments after the tax you expect on each. Inflation is not modelled, so fixed payments will buy less over time than the result suggests.' },
    ],
  },
  related: ['compound-interest', 'investment', 'retirement', 'inflation', 'simple-interest'],
  examples: [
    // 0% return: PV = 1000 × 120 = 120000; diff +20000; total 120000.
    { values: { lump: 100000, pmt: 1000, years: 10, rate: 0 }, expect: { pv: 120000, diff: 20000, total: 120000 }, tolerance: 1e-9 },
    // 0% return: PV = 500 × 24 = 12000; lump 15000 → diff −3000.
    { values: { lump: 15000, pmt: 500, years: 2, rate: 0 }, expect: { pv: 12000, diff: -3000, total: 12000 }, tolerance: 1e-9 },
  ],
});
