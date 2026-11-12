import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { growthCharts, monthIdx, yr } from '../../lib/helpers/finance';
import { money, toMonths, YEAR_S } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'savings-goal',
  title: 'Savings Goal Calculator',
  category: 'finance',
  description: 'Find how much you need to save each month to reach a savings goal by a target date.',
  keywords: ['savings goal', 'monthly savings', 'how much to save', 'save for a house', 'emergency fund', 'sinking fund'],
  inputs: [
    { id: 'goal', label: 'Savings goal', type: 'number', prefix: '$', default: 50000, min: 0, step: 500, info: 'The amount you want to have saved by the deadline, e.g. a down payment or emergency fund target.' },
    { id: 'current', label: 'Already saved', type: 'number', prefix: '$', default: 5000, min: 0, optional: true, info: 'Money you have already set aside for this goal. It keeps earning interest too.' },
    { id: 'rate', label: 'Annual interest rate', type: 'number', suffix: '%', default: 4, min: 0, step: 0.1, help: 'High-yield savings, CDs or expected investment return.', info: 'Expected yearly interest or return. Use about 4% for a high-yield savings account today, 0 to be cautious.' },
    { id: 'time', label: 'Time to reach goal', type: 'number', unit: 'time', units: ['yr', 'mo'], defaultUnit: 'yr', default: 5, min: 0, info: 'How long until you need the money.' },
  ],
  outputs: [
    { id: 'monthly', label: 'Monthly deposit needed', format: 'currency', primary: true, info: 'The amount to deposit at the end of every month to hit the goal on time.' },
    { id: 'totalDeposits', label: 'Total you deposit', format: 'currency', info: 'Your current savings plus all the monthly deposits.' },
    { id: 'interest', label: 'Interest earned', format: 'currency', info: 'The part of the goal covered by interest rather than your own deposits.' },
    { id: 'months', label: 'Number of deposits', format: 'integer', suffix: 'months', info: 'The number of monthly deposits until the deadline.' },
  ],
  compute: (v) => {
    const goal = num(v.goal);
    const current = num(v.current) ?? 0;
    const rate = num(v.rate);
    const timeS = num(v.time);
    if (goal === null || rate === null || timeS === null || goal < 0 || current < 0 || rate < 0) return { monthly: null };
    const n = toMonths(timeS);
    if (n <= 0) return { monthly: null, error: 'Enter a time of at least one month.' };
    const g = 1 + rate / 100 / 12; // monthly compounding
    const growth = g ** n;
    const fromCurrent = current * growth;
    const shortfall = goal - fromCurrent;
    if (shortfall <= 0)
      return { chart: growthCharts(monthIdx(n).map(yr), monthIdx(n).map(() => current), monthIdx(n).map((m) => current * g ** m), 'Deposits', 'Interest'), monthly: 0, totalDeposits: current, interest: fromCurrent - current, months: n, note: `Your current savings alone grow to ${money(fromCurrent)} — no more deposits needed.` };
    const monthly = g === 1 ? shortfall / n : (shortfall * (g - 1)) / (growth - 1);
    const totalDeposits = current + monthly * n;
    const idx = monthIdx(n);
    return {
      monthly,
      totalDeposits,
      interest: goal - totalDeposits,
      months: n,
      chart: growthCharts(idx.map(yr), idx.map((m) => current + monthly * m), idx.map((m) => current * g ** m + (g === 1 ? monthly * m : (monthly * (g ** m - 1)) / (g - 1))), 'Deposits', 'Interest'),
      steps: [
        `Current savings grow to ${money(current)} × (1 + ${rate}%/12)^${n} = ${money(fromCurrent)}`,
        `Still needed from deposits: ${money(goal)} − ${money(fromCurrent)} = ${money(shortfall)}`,
        `Deposit = shortfall × i ÷ ((1 + i)^n − 1) = ${money(monthly)} per month`,
      ],
      note: `Saving ${money(monthly)} a month for ${n} months reaches ${money(goal, 0)}; interest covers ${money(goal - totalDeposits)} of it.`,
    };
  },
  content: {
    formula: ['Deposit = (Goal − S·(1 + i)^n) × i ÷ ((1 + i)^n − 1)', 'i = annual rate ÷ 12, n = months, S = current savings'],
    body: [
      'Working backwards from a goal turns a vague plan — "save for a down payment" — into a concrete monthly number. The calculator first grows what you already have to the target date, then works out the level monthly deposit that covers the rest, assuming deposits at the end of each month and monthly compounding.',
      'For goals under about three years, the interest rate barely matters, so treat the result as roughly goal ÷ months. For longer goals, a higher-yield account or investing can noticeably cut the monthly amount, though investments can also lose value right when you need the money.',
      'Automating the deposit on payday is the most reliable way to stick to the plan. If the monthly figure is too high, extend the deadline or lower the goal and see how the numbers change.',
    ],
    faq: [
      { q: 'Where should I keep money for a short-term goal?', a: 'For goals within a few years, high-yield savings accounts, money market accounts, CDs or Treasury bills keep the money safe and earn interest. Stocks are better suited to goals at least five years away.' },
      { q: 'What if I can only save weekly or every two weeks?', a: 'Multiply the monthly figure by 12 and divide by 52 for weekly or by 26 for every two weeks. The result is close enough for planning.' },
    ],
  },
  related: ['compound-interest', 'cd', 'investment', 'net-worth', 'home-affordability'],
  examples: [
    { values: { goal: 12000, current: null, rate: 0, time: 2 * YEAR_S }, expect: { monthly: 500, interest: 0 } },
    { values: { goal: 50000, current: 5000, rate: 4, time: 5 * YEAR_S }, expect: { monthly: 662.0768 }, tolerance: 0.00001 },
  ],
});
