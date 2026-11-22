import { defineCalculator } from '../../lib/types';
import { num, parseDate, DAY_MS } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'fsa-spend-down',
  title: 'FSA Spend-Down: Use It Before the Deadline',
  category: 'finance',
  description: 'See how much FSA money you need to spend each week or day before your plan deadline, so you keep the funds you set aside instead of losing them.',
  keywords: ['fsa spend down', 'fsa deadline calculator', 'use it or lose it fsa', 'how much fsa to spend per week', 'fsa balance deadline', 'fsa carryover'],
  updated: '2026-11-21',
  inputs: [
    { id: 'balance', label: 'Remaining FSA balance', type: 'number', default: 600, min: 0, step: 10, prefix: '$', info: 'The unspent money left in your FSA right now, from your plan portal.' },
    { id: 'today', label: 'Today', type: 'date', default: 'today', info: 'Leave as today, or pick another day to plan from.' },
    { id: 'deadline', label: 'Plan deadline', type: 'date', default: '2026-12-31', info: 'The last day you can incur eligible expenses. Your employer sets this; check your plan documents.' },
    { id: 'carryover', label: 'Carryover your plan allows', type: 'number', default: 0, min: 0, step: 10, prefix: '$', optional: true, info: 'Money your plan lets you roll into next year. Enter 0 if none. Your employer decides whether and how much.' },
  ],
  outputs: [
    { id: 'perWeek', label: 'To spend per week', format: 'currency', primary: true, info: 'Money to use each week: (balance minus carryover) divided by weeks left.' },
    { id: 'perDay', label: 'To spend per day', format: 'currency', info: 'The same amount spread over every calendar day left.' },
    { id: 'toSpend', label: 'Total to spend', format: 'currency', info: 'Balance minus the carryover your plan allows.' },
    { id: 'days', label: 'Days left', format: 'integer', suffix: 'days', info: 'Calendar days from today to the deadline.' },
    { id: 'weeks', label: 'Weeks left', format: 'number', precision: 2, suffix: 'weeks', info: 'Days divided by seven.' },
  ],
  compute: (v) => {
    const balance = num(v.balance);
    const carry = num(v.carryover) ?? 0;
    const t = parseDate(v.today);
    const d = parseDate(v.deadline);
    if (balance === null || !t || !d) return { perWeek: null };
    if (balance < 0 || carry < 0) return { perWeek: null, error: 'Amounts cannot be negative.' };
    const days = Math.round((d.getTime() - t.getTime()) / DAY_MS);
    if (days <= 0) return { perWeek: null, error: 'The deadline must be after today.' };
    const toSpend = Math.max(0, balance - carry);
    const weeks = days / 7;
    const perWeek = toSpend / weeks;
    const perDay = toSpend / days;
    const wks = Math.ceil(weeks);
    const x: number[] = [];
    const left: number[] = [];
    for (let w = 0; w <= wks; w++) {
      x.push(w);
      left.push(Math.max(carry > balance ? balance : carry, balance - perWeek * w));
    }
    return {
      perWeek, perDay, toSpend, days, weeks,
      tone: toSpend === 0 ? 'good' : 'ok',
      badge: toSpend === 0 ? 'Nothing to spend down' : `${money(perWeek, 2)} a week`,
      chart: {
        type: 'line',
        title: 'FSA balance left if you spend evenly',
        x,
        xLabel: 'Weeks from today',
        yFormat: { format: 'currency' },
        series: [{ name: 'Balance left', values: left }],
      },
      steps: [
        `Days left = ${v.deadline} − ${v.today} = ${days}, so weeks = ${days} ÷ 7 = ${weeks.toFixed(2)}`,
        `To spend = ${money(balance, 2)} − ${money(carry, 2)} carryover = ${money(toSpend, 2)}`,
        `Per week = ${money(toSpend, 2)} ÷ ${weeks.toFixed(2)} = ${money(perWeek, 2)}; per day = ${money(perDay, 2)}`,
      ],
      note: 'Deadlines, grace periods and carryover are set by your employer, so check your plan documents. Only eligible expenses count; this is not tax advice.',
    };
  },
  content: {
    formula: [
      'Days left = deadline − today',
      'Weeks left = days left ÷ 7',
      'Amount to spend = balance − carryover allowed (not below 0)',
      'Per week = amount to spend ÷ weeks left; per day = amount to spend ÷ days left',
    ],
    body: [
      'Many flexible spending accounts have a use-it-or-lose-it rule: money left after the plan deadline can be forfeited. Enter your remaining balance and your deadline to see an even weekly and daily pace for using it.',
      'Some plans allow a limited carryover or a grace period. Enter the carryover amount your plan allows and it is subtracted from what you need to spend. The calculator does not know your plan, so confirm the rules with your employer or plan administrator.',
      'The pace is an average. In practice you may use it in a few larger purchases, such as glasses, dental work or prescriptions, as long as they are eligible expenses incurred before the deadline.',
      'To plan next year\'s contribution, try the HSA and FSA savings calculator.',
    ],
    faq: [
      { q: 'How much FSA money should I spend per week with $600 left and 30 days to go?', a: 'Thirty days is 4.29 weeks, so $600 ÷ 4.29 = $140.00 a week, or $20.00 a day.' },
      { q: 'What if my plan lets me carry over $200?', a: 'Then you need to spend $400 instead of $600. $400 ÷ 4.29 weeks = $93.33 a week.' },
      { q: 'Is the deadline always December 31?', a: 'No. Employers choose the plan year, and some add a grace period or carryover. Use the date in your plan documents.' },
      { q: 'What counts as eligible?', a: 'Only expenses your plan lists as eligible, incurred within the plan year. Check with your plan administrator before buying.' },
    ],
    sources: [{ label: 'IRS Publication 969: Health savings accounts and other tax-favored health plans', url: 'https://www.irs.gov/publications/p969' }],
  },
  related: ['hsa-fsa-savings', 'health-plan-comparison', 'savings-goal', 'sinking-fund'],
  examples: [
    // 2026-12-01 to 2026-12-31 = 30 days; 30/7 = 4.2857 weeks; 600/4.2857 = 140/wk; 600/30 = 20/day.
    { values: { balance: 600, today: '2026-12-01', deadline: '2026-12-31', carryover: 0 }, expect: { days: 30, perWeek: 140, perDay: 20, toSpend: 600 } },
    // carryover 200 -> 400; 400 / (30/7) = 93.3333.
    { values: { balance: 600, today: '2026-12-01', deadline: '2026-12-31', carryover: 200 }, expect: { toSpend: 400, perWeek: 93.3333 } },
    // 14 days = 2 weeks; 280/2 = 140/wk; 20/day.
    { values: { balance: 280, today: '2026-12-17', deadline: '2026-12-31', carryover: 0 }, expect: { weeks: 2, perWeek: 140, perDay: 20 } },
  ],
});
