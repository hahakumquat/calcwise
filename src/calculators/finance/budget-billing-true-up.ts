import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY } from '../../lib/helpers/finance';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

export default defineCalculator({
  slug: 'budget-billing-true-up',
  title: 'Budget Billing vs Actual Bills: Winter Shortfall',
  category: 'finance',
  description: 'Enter 12 months of utility bills to see your level budget-billing payment and the month you fall furthest behind, and how far ahead you get.',
  keywords: ['budget billing calculator', 'level billing vs actual bills', 'utility budget plan true up', 'equal payment plan calculator', 'is budget billing worth it'],
  updated: '2026-11-24',
  inputs: [
    { id: 'm0', label: 'Jan bill', type: 'number', prefix: '$', default: 220, min: 0, step: 5, info: 'Your Jan utility bill, or your best guess.' },
    { id: 'm1', label: 'Feb bill', type: 'number', prefix: '$', default: 200, min: 0, step: 5, info: 'Your Feb utility bill, or your best guess.' },
    { id: 'm2', label: 'Mar bill', type: 'number', prefix: '$', default: 150, min: 0, step: 5, info: 'Your Mar utility bill, or your best guess.' },
    { id: 'm3', label: 'Apr bill', type: 'number', prefix: '$', default: 100, min: 0, step: 5, info: 'Your Apr utility bill, or your best guess.' },
    { id: 'm4', label: 'May bill', type: 'number', prefix: '$', default: 70, min: 0, step: 5, info: 'Your May utility bill, or your best guess.' },
    { id: 'm5', label: 'Jun bill', type: 'number', prefix: '$', default: 60, min: 0, step: 5, info: 'Your Jun utility bill, or your best guess.' },
    { id: 'm6', label: 'Jul bill', type: 'number', prefix: '$', default: 80, min: 0, step: 5, info: 'Your Jul utility bill, or your best guess.' },
    { id: 'm7', label: 'Aug bill', type: 'number', prefix: '$', default: 90, min: 0, step: 5, info: 'Your Aug utility bill, or your best guess.' },
    { id: 'm8', label: 'Sep bill', type: 'number', prefix: '$', default: 70, min: 0, step: 5, info: 'Your Sep utility bill, or your best guess.' },
    { id: 'm9', label: 'Oct bill', type: 'number', prefix: '$', default: 90, min: 0, step: 5, info: 'Your Oct utility bill, or your best guess.' },
    { id: 'm10', label: 'Nov bill', type: 'number', prefix: '$', default: 130, min: 0, step: 5, info: 'Your Nov utility bill, or your best guess.' },
    { id: 'm11', label: 'Dec bill', type: 'number', prefix: '$', default: 190, min: 0, step: 5, info: 'Your Dec utility bill, or your best guess.' },
  ],
  outputs: [
    { id: 'level', label: 'Level monthly payment', format: 'currency', primary: true, info: 'Total of the 12 bills ÷ 12.' },
    { id: 'total', label: 'Total of 12 bills', format: 'currency', info: 'What you would pay without budget billing.' },
    { id: 'worst', label: 'Largest shortfall', format: 'currency', info: 'The lowest running balance: how far behind the level payments fall. 0 if you never fall behind.' },
    { id: 'best', label: 'Largest buffer', format: 'currency', info: 'The highest running balance: how far ahead the level payments get. 0 if you are never ahead.' },
  ],
  compute: (v) => {
    const bills: number[] = [];
    for (let i = 0; i < 12; i++) {
      const b = num(v['m' + i]);
      if (b === null) return { level: null };
      if (b < 0) return { level: null, error: 'Bills cannot be negative.' };
      bills.push(b);
    }
    const total = bills.reduce((a, b) => a + b, 0);
    const level = total / 12;
    let run = 0;
    const bal: number[] = [];
    bills.forEach((b) => { run += level - b; bal.push(run); });
    const lo = Math.min(...bal), hi = Math.max(...bal);
    const worst = Math.min(0, lo), best = Math.max(0, hi);
    const worstMonth = MONTHS[bal.indexOf(lo)];
    return {
      level, total, worst, best,
      tone: worst < 0 ? 'warn' : 'good',
      badge: worst < 0 ? `Behind by ${usd(-worst)} in ${worstMonth}` : 'Never behind the bills',
      chart: {
        type: 'line',
        title: 'Running balance: level payments minus actual bills',
        x: MONTHS,
        yFormat: CURRENCY,
        series: [{ name: 'Balance', values: bal }],
      },
      steps: [
        `Total of bills: ${usd(total)}`,
        `Level payment: ${usd(total)} ÷ 12 = ${usd(level)}`,
        worst < 0 ? `Lowest balance: ${usd(lo)} after ${worstMonth}` : 'The running balance never drops below 0.',
        `Highest balance: ${usd(hi)} after ${MONTHS[bal.indexOf(hi)]}`,
      ],
      note: 'Utilities re-estimate the level payment during the year and settle any difference in their own way. Check your utility\'s rules; this uses one fixed payment and last year\'s bills as the guess.',
    };
  },
  content: {
    formula: [
      'Level payment = total of 12 bills ÷ 12',
      'Balance after month k = k × level payment − bills for months 1 to k',
      'Largest shortfall = lowest balance; largest buffer = highest balance',
    ],
    body: [
      'Budget billing smooths a heating bill into twelve equal payments. The total is the same, but the bills are not: in winter you pay less than you use, and in summer you pay more.',
      'Enter last year\'s bill for each month, or your best guess. The running balance shows how far behind the level payment falls and in which month, which is the gap you owe or the plan re-estimates away.',
      'Treat the result as a guide. Real plans adjust the payment during the year and settle any balance on their own schedule.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'The 12 bills total $1,450, so the level payment is $120.83. The balance is lowest after March at -$207.50 and highest after October at $78.33.' },
      { q: 'Does budget billing save money?', a: 'No. Over the year you pay the same total. It only spreads the cost so winter bills are smaller and summer bills are larger.' },
      { q: 'Why is there a true-up?', a: 'Because use and prices change, the level payment is an estimate. Utilities review it and either adjust the payment or settle the difference. How they do it varies, so ask yours.' },
      { q: 'Which bills should I enter?', a: 'Last 12 months of bills for the same home, in calendar order from January. If prices rose, raise the bills to match.' },
    ],
    sources: [],
  },
  related: ['heating-cost', 'thermostat-setback', 'sinking-fund'],
  examples: [
    { values: { m0: 220, m1: 200, m2: 150, m3: 100, m4: 70, m5: 60, m6: 80, m7: 90, m8: 70, m9: 90, m10: 130, m11: 190 }, expect: { level: 120.83, total: 1450, worst: -207.5, best: 78.33 }, tolerance: 0.01 },
    // flat bills: level 100, no shortfall
    { values: { m0: 100, m1: 100, m2: 100, m3: 100, m4: 100, m5: 100, m6: 100, m7: 100, m8: 100, m9: 100, m10: 100, m11: 100 }, expect: { level: 100, total: 1200, worst: 0, best: 0 }, tolerance: 0.01 },
  ],
});
