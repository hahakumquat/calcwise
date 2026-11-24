import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'mega-backdoor-roth',
  title: 'Mega Backdoor Roth Calculator',
  category: 'finance',
  description: 'Find how much after-tax 401(k) room you have left for a mega backdoor Roth: your plan limit minus your deferrals and employer money, per paycheck.',
  keywords: ['mega backdoor roth calculator', 'after-tax 401k contribution room', 'mega backdoor roth limit', '415(c) limit calculator', 'after-tax 401k to roth conversion', 'how much can i mega backdoor roth'],
  updated: '2026-11-24',
  inputs: [
    { id: 'limit', label: 'Total annual plan limit', type: 'number', prefix: '$', default: 70000, min: 0, step: 500, info: 'The IRS overall limit on employee plus employer contributions for the plan year, before catch-up. The default is an example, not a current figure: look up this year’s number.' },
    { id: 'deferrals', label: 'Your pre-tax and Roth deferrals', type: 'number', prefix: '$', default: 23500, min: 0, step: 500, info: 'What you contribute from your own pay to the regular 401(k), pre-tax plus Roth, for the year. Catch-up contributions are outside the limit, so leave them out.' },
    { id: 'employer', label: 'Employer match and other employer money', type: 'number', prefix: '$', default: 6000, min: 0, step: 500, info: 'Match, profit sharing and any other employer contributions for the year.' },
    { id: 'left', label: 'Paychecks left this year', type: 'number', default: 26, min: 1, max: 60, step: 1, info: 'Count the paychecks that will arrive on or before Dec 31.' },
  ],
  outputs: [
    { id: 'room', label: 'After-tax room left', format: 'currency', primary: true, info: 'Limit − your deferrals − employer money, never below $0.' },
    { id: 'perCheck', label: 'Per paycheck to fill it', format: 'currency', info: 'Room ÷ paychecks left.' },
    { id: 'used', label: 'Already used', format: 'currency', info: 'Your deferrals plus employer money.' },
  ],
  compute: (v) => {
    const limit = num(v.limit), deferrals = num(v.deferrals), employer = num(v.employer), left = num(v.left);
    if ([limit, deferrals, employer, left].some((x) => x === null)) return { room: null };
    if ([limit, deferrals, employer].some((x) => (x as number) < 0)) return { room: null, error: 'Values cannot be negative.' };
    if ((left as number) < 1) return { room: null, error: 'Enter at least 1 paycheck.' };
    const used = (deferrals as number) + (employer as number);
    const raw = (limit as number) - used;
    const room = Math.max(0, raw);
    const perCheck = room / (left as number);
    const over = raw < 0;
    return {
      room, perCheck, used,
      tone: over ? 'bad' : room === 0 ? 'warn' : 'good',
      badge: over ? 'Already over the plan limit' : room === 0 ? 'No room left' : `${usd(room)} of room left`,
      chart: {
        type: 'bar',
        title: 'Where the plan limit goes',
        categories: ['Your deferrals', 'Employer money', 'After-tax room'],
        series: [{ name: 'Amount', values: [deferrals as number, employer as number, room] }],
        format: { format: 'currency' },
      },
      steps: [
        `Used: ${usd(deferrals as number)} + ${usd(employer as number)} = ${usd(used)}`,
        `Room: ${usd(limit as number)} − ${usd(used)} = ${usd(room)}`,
        `Per paycheck: ${usd(room)} ÷ ${left} = ${usd(perCheck)}`,
      ],
      note: over
        ? 'Your deferrals plus employer money already exceed the limit you entered. Check the limit and your numbers.'
        : 'Only works if your plan allows after-tax contributions and an in-plan Roth conversion or in-service rollover. Many plans do not, so ask your plan administrator. Plan-specific testing can also cap what you may contribute.',
    };
  },
  content: {
    formula: [
      'Used = your pre-tax and Roth deferrals + employer money',
      'After-tax room = plan limit − used (not below $0)',
      'Per paycheck = room ÷ paychecks left',
    ],
    body: [
      'A mega backdoor Roth is a way to put more into Roth money through your employer plan. The IRS caps total contributions to a 401(k) at one overall limit, covering what you defer, what your employer adds and any after-tax money you add. The after-tax room is whatever is left under that cap. You then convert those after-tax dollars to Roth, either inside the plan or by rolling them out to a Roth IRA.',
      'This calculator does the subtraction. Enter the overall limit for your plan year, your own deferrals, and employer money, and it shows the room left and what that is per paycheck. The default limit is an example, so look up the current IRS figure.',
      'Catch-up contributions for older savers sit outside the overall limit, so leave them out. Not every plan offers this: it needs after-tax contributions and either in-plan conversion or in-service rollover. Many plans offer neither, and some plans limit the after-tax percentage of pay.',
    ],
    faq: [
      { q: 'How much room is in the example?', a: 'With a $70,000 limit, $23,500 of your own deferrals and $6,000 of employer money, $29,500 is used and $40,500 is left. Over 26 paychecks that is $1,557.69 each.' },
      { q: 'Does my plan allow this?', a: 'Only if it accepts after-tax contributions and lets you convert them to Roth, in the plan or by rollover. Ask your plan administrator.' },
      { q: 'Do catch-up contributions count against the limit?', a: 'No. Catch-up contributions are outside the overall limit, so do not add them here.' },
      { q: 'Does this tell me the tax on the conversion?', a: 'No. Converting after-tax dollars right away usually leaves little taxable gain, but any earnings before conversion are taxed. This only finds the room.' },
    ],
    sources: [
      { label: 'IRS: 401(k) limits', url: 'https://www.irs.gov/retirement-plans/plan-participant-employee/retirement-topics-401k-and-profit-sharing-plan-contribution-limits' },
    ],
  },
  related: ['401k-max-out', 'roth-ira', 'backdoor-roth-pro-rata'],
  examples: [
    // used 29500; room 40500; per check 40500/26 = 1557.6923
    { values: { limit: 70000, deferrals: 23500, employer: 6000, left: 26 }, expect: { room: 40500, perCheck: 1557.69, used: 29500 }, tolerance: 0.01 },
    // 60000 - (20000 + 10000) = 30000; /10 = 3000
    { values: { limit: 60000, deferrals: 20000, employer: 10000, left: 10 }, expect: { room: 30000, perCheck: 3000 }, tolerance: 0.01 },
    // over the limit: room 0
    { values: { limit: 50000, deferrals: 40000, employer: 15000, left: 5 }, expect: { room: 0, perCheck: 0, used: 55000 }, tolerance: 0.01 },
  ],
});
