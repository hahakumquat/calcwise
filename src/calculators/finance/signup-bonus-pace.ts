import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'signup-bonus-pace',
  title: 'Credit Card Sign-Up Bonus Spend Pace',
  category: 'finance',
  description: 'See how much you must spend each month to hit a credit card sign-up bonus minimum, what the bonus is worth in dollars, and what is left after the annual fee.',
  keywords: ['credit card sign up bonus calculator', 'minimum spend per month', 'sign-up bonus spend requirement', 'card bonus worth it', 'credit card minimum spend tracker'],
  updated: '2026-11-23',
  inputs: [
    { id: 'minSpend', label: 'Minimum spend required', type: 'number', prefix: '$', default: 4000, min: 0, step: 100, info: 'The spend the card asks for to earn the bonus, from your card offer.' },
    { id: 'spent', label: 'Spent toward it so far', type: 'number', prefix: '$', default: 600, min: 0, step: 50, info: 'Eligible purchases already counted.' },
    { id: 'monthsLeft', label: 'Months left in the window', type: 'number', default: 2, min: 0.5, step: 0.5, info: 'Time remaining before the deadline. Half months are fine.' },
    { id: 'bonus', label: 'Bonus (points or cash)', type: 'number', default: 60000, min: 0, step: 1000, info: 'Points, miles or cash dollars the bonus pays.' },
    { id: 'cpp', label: 'Value per point (cents)', type: 'number', default: 1.5, min: 0, step: 0.1, info: 'Cents each point is worth to you. Use 100 if the bonus is in dollars. Your own estimate.' },
    { id: 'fee', label: 'Annual fee', type: 'number', prefix: '$', default: 95, min: 0, step: 5, optional: true, info: 'Optional. Taken off the bonus value.' },
  ],
  outputs: [
    { id: 'perMonth', label: 'Spend needed per month', format: 'currency', primary: true, info: 'Still needed ÷ months left.' },
    { id: 'stillNeeded', label: 'Still to spend', format: 'currency', info: 'Minimum spend − spent so far.' },
    { id: 'value', label: 'Bonus value', format: 'currency', info: 'Bonus × cents per point ÷ 100.' },
    { id: 'net', label: 'Bonus value after the fee', format: 'currency', info: 'Bonus value − annual fee.' },
  ],
  compute: (v) => {
    const min = num(v.minSpend), spent = num(v.spent), months = num(v.monthsLeft), bonus = num(v.bonus), cpp = num(v.cpp);
    const fee = num(v.fee) ?? 0;
    if (min === null || spent === null || months === null || bonus === null || cpp === null) return { perMonth: null, note: 'Enter the minimum spend, what you have spent, months left, the bonus and its value.' };
    if (min < 0 || spent < 0 || bonus < 0 || cpp < 0 || fee < 0) return { perMonth: null, error: 'Values cannot be negative.' };
    if (months <= 0) return { perMonth: null, error: 'Months left must be more than zero.' };
    const still = Math.max(0, min - spent);
    const per = still / months;
    const value = (bonus * cpp) / 100;
    const net = value - fee;
    const steps = Math.max(1, Math.ceil(months));
    const x = Array.from({ length: steps + 1 }, (_, i) => Math.min(i, months));
    return {
      perMonth: per,
      stillNeeded: still,
      value,
      net,
      tone: still === 0 ? 'good' : 'ok',
      badge: still === 0 ? 'Minimum reached' : 'Keep going',
      chart: {
        type: 'line',
        title: 'Total spent if you keep the pace',
        x: x.map((m) => Math.round(m * 10) / 10),
        xLabel: 'Months from now',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Spent', values: x.map((m) => Math.min(min, spent + per * m)) },
          { name: 'Minimum', values: x.map(() => min) },
        ],
      },
      steps: [
        `Still needed = ${usd(min)} − ${usd(spent)} = ${usd(still)}`,
        `Per month = ${usd(still)} ÷ ${months} = ${usd(per)}`,
        `Bonus value = ${bonus.toLocaleString('en-US')} × ${cpp}¢ ÷ 100 = ${usd(value)}`,
        `After fee = ${usd(value)} − ${usd(fee)} = ${usd(net)}`,
      ],
      note: 'Only chase a bonus if this is spending you would do anyway, and pay the balance in full each month. Interest or late fees can erase the bonus.',
    };
  },
  content: {
    formula: [
      'Still needed = minimum spend − spent so far (never below 0)',
      'Spend per month = still needed ÷ months left',
      'Bonus value = bonus × cents per point ÷ 100',
      'After the fee = bonus value − annual fee',
    ],
    body: [
      'Many cards pay a sign-up bonus once you spend a set amount in the first few months. This calculator turns that deadline into a monthly number, so you can tell whether the target fits your normal spending.',
      'Enter the minimum from your offer, what has already counted and how many months remain. It also converts the bonus into dollars using your own value per point, then subtracts the annual fee so you see what the bonus is really worth.',
      'Only count spending you would do anyway, such as groceries, bills and planned gifts. Buying things you do not need to hit a target usually costs more than the bonus pays.',
      'Always pay the statement balance in full. Interest at typical card rates can wipe out a bonus quickly. This tool does not check eligibility, which purchases count or tax treatment, so read your card terms.',
    ],
    faq: [
      { q: 'How much do I need to spend each month for a $4,000 minimum?', a: 'With $600 already spent and 2 months left, you still need $3,400, which is $1,700 a month.' },
      { q: 'What is a 60,000 point bonus worth?', a: 'At 1.5 cents a point it is 60,000 × 1.5 ÷ 100 = $900. Less a $95 annual fee, that is $805.' },
      { q: 'What if I have already hit the minimum?', a: 'The still-to-spend figure shows $0 and the monthly pace is $0.' },
      { q: 'Is it worth spending extra to get the bonus?', a: 'Rarely. The bonus is worth most when the spend is something you would pay for anyway. Never carry a balance to chase it.' },
    ],
    sources: [
      { label: 'Credit card rewards (Consumer Financial Protection Bureau)', url: 'https://www.consumerfinance.gov/consumer-tools/credit-cards/' },
    ],
  },
  related: ['credit-card-annual-fee', 'cash-back-rewards', 'credit-card-payoff', 'cost-per-use'],
  examples: [
    // still 3400; per 1700; value 60000 x 1.5 / 100 = 900; net 805
    { values: { minSpend: 4000, spent: 600, monthsLeft: 2, bonus: 60000, cpp: 1.5, fee: 95 }, expect: { perMonth: 1700, stillNeeded: 3400, value: 900, net: 805 }, tolerance: 1e-6 },
    // still 3000; per 1000; value 200 x 100 / 100 = 200; net 200
    { values: { minSpend: 3000, spent: 0, monthsLeft: 3, bonus: 200, cpp: 100, fee: 0 }, expect: { perMonth: 1000, stillNeeded: 3000, value: 200, net: 200 }, tolerance: 1e-6 },
    // already met: still 0
    { values: { minSpend: 2000, spent: 2500, monthsLeft: 1, bonus: 50000, cpp: 1, fee: 0 }, expect: { perMonth: 0, stillNeeded: 0, value: 500, net: 500 }, tolerance: 1e-6 },
  ],
});
