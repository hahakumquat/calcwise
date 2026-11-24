import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'ira-contribution-pace',
  title: 'IRA Contribution Pace: Per Paycheck to the Limit',
  category: 'finance',
  description: 'Spread the room left under your IRA limit over the paychecks you have left before the deadline. See the amount per paycheck and its share of your pay.',
  keywords: ['ira contribution per paycheck', 'max out roth ira by april', 'ira contribution calculator', 'how much to contribute to ira each paycheck', 'ira deadline calculator', 'roth ira pace'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'limit', label: 'IRA contribution limit', type: 'number', prefix: '$', default: 7500, min: 0, step: 100, info: 'Your yearly limit for the tax year you are funding. Check irs.gov; it is not built in here.' },
    { id: 'done', label: 'Already contributed', type: 'number', prefix: '$', default: 1200, min: 0, step: 100, info: 'What you have put in for that tax year so far.' },
    { id: 'paychecks', label: 'Paychecks left before the deadline', type: 'number', default: 10, min: 1, step: 1, info: 'Count the paydays between now and the day you want the money in.' },
    { id: 'gross', label: 'Gross pay per paycheck', type: 'number', prefix: '$', default: 2500, min: 0, step: 100, info: 'Pay before tax. Used only to show the share of pay. Optional.' },
  ],
  outputs: [
    { id: 'per', label: 'Contribute per paycheck', format: 'currency', precision: 2, primary: true, info: 'Room left ÷ paychecks left.' },
    { id: 'room', label: 'Room left under the limit', format: 'currency', precision: 2, info: 'Limit − already contributed.' },
    { id: 'share', label: 'Share of gross pay', format: 'percent', precision: 1, info: 'Per paycheck ÷ gross pay. Blank if gross pay is zero.' },
  ],
  compute: (v) => {
    const limit = num(v.limit);
    const done = num(v.done);
    const n = num(v.paychecks);
    const gross = num(v.gross) ?? 0;
    if (limit === null || done === null || n === null) return { per: null };
    if (limit < 0 || done < 0 || n < 1 || gross < 0) return { per: null };
    const count = Math.round(n);
    const room = Math.max(0, limit - done);
    if (room === 0) {
      return { per: 0, room: 0, share: 0, tone: 'good', badge: 'Limit already reached', note: 'You have already contributed the limit you entered. Do not add more for that tax year.' };
    }
    const per = room / count;
    const share = gross > 0 ? per / gross : null;
    const xs = Array.from({ length: count + 1 }, (_, i) => i);
    return {
      per,
      room,
      share,
      tone: 'good',
      badge: `${money(per)} a paycheck for ${count} paychecks`,
      note: `You have ${money(room)} of room left. Over ${count} paychecks that is ${money(per)} each${share !== null ? `, ${fmt(share * 100, 1)}% of a ${money(gross)} paycheck` : ''}. Income limits and eligibility are not checked.`,
      chart: {
        type: 'line' as const,
        title: 'Total contributed by paycheck',
        x: xs,
        xLabel: 'Paychecks from now',
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Contributed', values: xs.map((i) => done + per * i) }],
      },
      steps: [
        `Room = ${money(limit)} − ${money(done)} = ${money(room)}`,
        `Per paycheck = ${money(room)} ÷ ${count} = ${money(per)}`,
        ...(share !== null ? [`Share of pay = ${money(per)} ÷ ${money(gross)} = ${fmt(share * 100, 1)}%`] : []),
      ],
    };
  },
  content: {
    formula: [
      'Room left = limit − already contributed',
      'Per paycheck = room left ÷ paychecks left',
      'Share of pay = per paycheck ÷ gross pay per paycheck',
    ],
    body: [
      'You can usually fund an IRA for the previous tax year until the tax filing deadline in April. That makes January to April a common time to ask how much to put in from each paycheck to reach the limit without a lump sum. This calculator spreads the remaining room evenly over the paychecks you have left.',
      'Example: a $7,500 limit with $1,200 already contributed leaves $6,300. Over 10 paychecks that is 6,300 ÷ 10 = $630 each, which is 25.2% of a $2,500 paycheck.',
      'The limit is an input, because it changes by year and by age. Look up the figure for your tax year on irs.gov. This tool does not check whether you are eligible for a Roth IRA, whether income limits apply, or whether the contribution is deductible. It assumes you contribute the same amount each paycheck and ignores investment growth. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much should I put in an IRA each paycheck?', a: 'Divide the room left under your limit by the paychecks left. With $6,300 of room and 10 paychecks, that is $630 each.' },
      { q: 'Can I contribute to an IRA after December?', a: 'Contributions for the previous tax year are generally allowed until the tax filing deadline, usually in mid April. Tell your provider which tax year each contribution is for.' },
      { q: 'What limit should I enter?', a: 'The IRA limit for your tax year and age, from irs.gov. This calculator does not include it, so it never goes out of date.' },
      { q: 'Does this check if I can contribute to a Roth IRA?', a: 'No. Income limits, filing status and earned income rules are not checked. Confirm eligibility before you contribute.' },
      { q: 'What if I already hit the limit?', a: 'The calculator shows the limit as reached and a contribution of $0. Extra contributions can trigger a penalty tax, so do not add more.' },
    ],
    sources: [],
  },
  related: ['roth-ira', '401k-max-out', 'roth-vs-traditional', 'backdoor-roth-pro-rata'],
  examples: [
    // room 7500-1200 = 6300; per 6300/10 = 630; share 630/2500 = 0.252
    { values: { limit: 7500, done: 1200, paychecks: 10, gross: 2500 }, expect: { room: 6300, per: 630, share: 0.252 } },
    // room 7000-2000 = 5000; per 5000/4 = 1250
    { values: { limit: 7000, done: 2000, paychecks: 4, gross: 0 }, expect: { room: 5000, per: 1250 } },
  ],
});
