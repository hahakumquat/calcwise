import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 0) => n.toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });

export default defineCalculator({
  slug: 'daily-spending-allowance',
  title: 'Daily Spending Allowance Calculator',
  category: 'finance',
  description: 'Find how much you can safely spend each day or week after bills and savings, and see how fast the money runs out if you overspend.',
  keywords: ['daily spending allowance', 'safe to spend calculator', 'how much can i spend per day', 'daily budget calculator', 'weekly spending money', 'money left after bills'],
  updated: '2026-11-17',
  inputs: [
    { id: 'income', label: 'Income this month (after tax)', type: 'number', prefix: '$', default: 3200, min: 0, step: 50, info: 'Money that actually lands in your account this month.' },
    { id: 'bills', label: 'Fixed bills', type: 'number', prefix: '$', default: 1700, min: 0, step: 50, info: 'Rent, utilities, phone, insurance, loan payments and subscriptions.' },
    { id: 'savings', label: 'Savings you want to set aside', type: 'number', prefix: '$', default: 400, min: 0, step: 50, info: 'Money you move to savings or investing before you spend anything else.' },
    { id: 'spent', label: 'Already spent on everyday things', type: 'number', prefix: '$', default: 0, min: 0, step: 10, info: 'Groceries, going out, transport and so on so far this month. Leave at 0 at the start of the month.' },
    { id: 'days', label: 'Days left in the month', type: 'number', default: 30, min: 1, max: 31, step: 1, info: 'Count today if you have not spent anything yet today.' },
  ],
  outputs: [
    { id: 'perDay', label: 'Safe to spend per day', format: 'currency', primary: true, info: '(Income − bills − savings − already spent) ÷ days left.' },
    { id: 'perWeek', label: 'Safe to spend per week', format: 'currency', info: 'Daily allowance × 7.' },
    { id: 'left', label: 'Left to spend this month', format: 'currency', info: 'Income − bills − savings − already spent.' },
    { id: 'zeroDay', label: 'Money gone after (at 25% over)', format: 'number', precision: 1, suffix: 'days', info: 'How many days the remaining money lasts if you spend 25% more than your allowance each day.' },
  ],
  compute: (v) => {
    const income = num(v.income);
    const bills = num(v.bills) ?? 0;
    const savings = num(v.savings) ?? 0;
    const spent = num(v.spent) ?? 0;
    const days = num(v.days);
    if (income === null || days === null || income < 0 || bills < 0 || savings < 0 || spent < 0 || days < 1) return { perDay: null };
    const left = income - bills - savings - spent;
    if (left <= 0) {
      return {
        perDay: 0,
        perWeek: 0,
        left,
        zeroDay: 0,
        tone: 'bad' as const,
        badge: 'Nothing left',
        note: `Bills, savings and spending add up to $${fmt(bills + savings + spent, 2)}, which is $${fmt(-left, 2)} more than your $${fmt(income, 2)} income. Trim the savings target or the bills to get a daily allowance.`,
      };
    }
    const perDay = left / days;
    const perWeek = perDay * 7;
    const over = perDay * 1.25;
    const zeroDay = left / over;
    const xs: number[] = [];
    const onTrack: number[] = [];
    const overspend: number[] = [];
    for (let d = 0; d <= days; d++) {
      xs.push(d);
      onTrack.push(Math.max(0, left - perDay * d));
      overspend.push(Math.max(0, left - over * d));
    }
    return {
      perDay,
      perWeek,
      left,
      zeroDay,
      tone: perDay >= 20 ? ('good' as const) : perDay >= 10 ? ('ok' as const) : ('bad' as const),
      badge: perDay >= 20 ? 'Room to breathe' : perDay >= 10 ? 'Tight but fine' : 'Very tight',
      note: `After bills, savings and what you have spent, $${fmt(left, 2)} is left for ${fmt(days)} days: $${fmt(perDay, 2)} a day, or $${fmt(perWeek, 2)} a week. Spend 25% more each day and it runs out after ${fmt(zeroDay, 1)} days.`,
      chart: {
        type: 'line',
        title: 'Money left through the month',
        x: xs,
        xLabel: 'Days from now',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Spend your allowance', values: onTrack },
          { name: 'Spend 25% more', values: overspend },
        ],
      },
      steps: [
        `Left to spend = $${fmt(income, 2)} − $${fmt(bills, 2)} − $${fmt(savings, 2)} − $${fmt(spent, 2)} = $${fmt(left, 2)}`,
        `Per day = $${fmt(left, 2)} ÷ ${fmt(days)} = $${fmt(perDay, 2)}`,
        `Per week = $${fmt(perDay, 2)} × 7 = $${fmt(perWeek, 2)}`,
      ],
    };
  },
  content: {
    formula: [
      'Left to spend = income − fixed bills − savings − already spent',
      'Daily allowance = left to spend ÷ days left',
      'Weekly allowance = daily allowance × 7',
      'Days until broke at 25% over = left to spend ÷ (daily allowance × 1.25)',
    ],
    body: [
      'A monthly budget is hard to feel on a Tuesday afternoon. A daily number is easier: this is what I can spend today without wrecking the month. This calculator takes your income, takes off the bills you cannot avoid and the savings you want to set aside, and spreads what is left across the days remaining.',
      'Because it uses days left and what you have already spent, you can come back mid-month and get a fresh number. Overspent early? The daily figure drops. Spent less? It goes up.',
      'The chart shows the other side: how quickly the money disappears if you drift 25% above your allowance. Small daily overspends add up fast, and the money runs out several days before the month does. Everything runs in your browser and nothing is stored.',
    ],
    sections: [
      {
        heading: 'What counts as a fixed bill?',
        paragraphs: [
          'Count anything that leaves your account whether or not you change your behaviour: rent or mortgage, utilities, phone, insurance, minimum debt payments, and subscriptions you have not cancelled. Groceries, takeaway, transport top-ups and shopping are everyday spending, which is what this number covers.',
          'If your income is irregular, use a cautious figure, such as the lowest month in the last six, so the allowance does not rely on money that may not arrive.',
        ],
      },
    ],
    faq: [
      { q: 'How is the daily spending allowance calculated?', a: 'Subtract your fixed bills, savings target and what you have already spent from your income, then divide by the days left. With $3,200 income, $1,700 bills, $400 savings, nothing spent and 30 days left, you have $1,100 ÷ 30 = $36.67 a day.' },
      { q: 'What does the 25% over figure mean?', a: 'It shows how long your remaining money lasts if you spend 25% more than your daily allowance. With $1,100 left and a $36.67 allowance, spending $45.83 a day empties it after 24 days, not 30.' },
      { q: 'What if the result is zero?', a: 'Your bills, savings and spending already use up your income. Lower the savings target for the month or look for a bill to cut. The calculator shows how far over you are.' },
      { q: 'Should I count days in the month or days until payday?', a: 'Use days until your next income arrives. If you are paid on the 25th, count the days to the 25th, and use that pay period\'s income and bills.' },
    ],
  },
  related: ['budget-50-30-20', 'savings-goal', 'emergency-fund', 'latte-factor', 'take-home-pay'],
  examples: [
    // left = 3200 − 1700 − 400 − 0 = 1100; per day 1100/30 = 36.666…; week ×7 = 256.666…; zero day 1100/(36.666…×1.25) = 24.
    { values: { income: 3200, bills: 1700, savings: 400, spent: 0, days: 30 }, expect: { perDay: 1100 / 30, perWeek: (1100 / 30) * 7, left: 1100, zeroDay: 24 }, tolerance: 1e-9 },
    // left = 2000 − 1000 − 200 − 300 = 500; 10 days -> 50 a day; 350 a week; 500/62.5 = 8.
    { values: { income: 2000, bills: 1000, savings: 200, spent: 300, days: 10 }, expect: { perDay: 50, perWeek: 350, left: 500, zeroDay: 8 }, tolerance: 1e-9 },
  ],
});
