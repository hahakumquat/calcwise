import { defineCalculator } from '../../lib/types';
import { num, parseDate, DAY_MS } from '../../lib/math';

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
const fmt = (t: number) => {
  const d = new Date(t);
  return `${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${d.getUTCFullYear()}`;
};
/** Statement close for a given year/month; a closing day past month end uses the last day. */
const closeIn = (y: number, m: number, day: number) => Date.UTC(y, m, Math.min(day, new Date(Date.UTC(y, m + 1, 0)).getUTCDate()));

export default defineCalculator({
  slug: 'interest-free-days',
  title: 'Credit Card Interest-Free Days Calculator',
  category: 'finance',
  description: 'Find how many interest-free days a credit card purchase gets: days until your statement closes, plus the grace period, and the date payment is due.',
  keywords: ['credit card interest free days', 'credit card grace period calculator', 'when is my credit card payment due', 'statement closing date purchase', 'best day to make a credit card purchase', 'days until credit card due date'],
  updated: '2026-11-26',
  inputs: [
    { id: 'purchase', label: 'Purchase date', type: 'date', default: 'today', info: 'The day the purchase posts to your card.' },
    { id: 'closeDay', label: 'Statement closing day of month', type: 'number', default: 20, min: 1, max: 31, step: 1, info: 'Day of the month your statement closes, from 1 to 31. Months shorter than this use their last day.' },
    { id: 'grace', label: 'Grace days from close to due date', type: 'number', suffix: 'days', default: 25, min: 0, max: 60, step: 1, info: 'Check your card agreement. 25 is an example, so use the number on your statement.' },
  ],
  outputs: [
    { id: 'total', label: 'Interest-free days', format: 'integer', primary: true, info: 'Days to statement close plus grace days.' },
    { id: 'toClose', label: 'Days until statement closes', format: 'integer', info: 'Statement close date minus purchase date. 0 if you buy on the closing day.' },
    { id: 'closeDate', label: 'Statement closes', format: 'text', info: 'The first closing date on or after the purchase date.' },
    { id: 'dueDate', label: 'Payment due', format: 'text', info: 'Statement close date plus grace days.' },
  ],
  compute: (v) => {
    const p = parseDate(v.purchase);
    const day = num(v.closeDay), grace = num(v.grace);
    if (!p || day === null || grace === null) return { total: null };
    if (!Number.isInteger(day) || day < 1 || day > 31) return { total: null, error: 'Enter a closing day from 1 to 31.' };
    if (!Number.isInteger(grace) || grace < 0 || grace > 60) return { total: null, error: 'Enter whole grace days from 0 to 60.' };
    const y = p.getUTCFullYear(), m = p.getUTCMonth();
    let close = closeIn(y, m, day);
    if (close < p.getTime()) close = closeIn(y, m + 1, day);
    const toClose = Math.round((close - p.getTime()) / DAY_MS);
    const total = toClose + grace;
    const due = close + grace * DAY_MS;
    return {
      total, toClose, closeDate: fmt(close), dueDate: fmt(due),
      tone: 'ok',
      badge: `${total} interest-free days`,
      chart: {
        type: 'bar',
        title: 'Where the interest-free days come from',
        categories: ['To statement close', 'Grace period', 'Total'],
        series: [{ name: 'Days', values: [toClose, grace, total] }],
        format: { format: 'integer' },
      },
      steps: [
        `Statement closes ${fmt(close)}, the first closing date on or after ${fmt(p.getTime())}`,
        `Days to close: ${toClose}`,
        `Interest-free days: ${toClose} + ${grace} = ${total}`,
        `Due date: ${fmt(close)} + ${grace} days = ${fmt(due)}`,
      ],
      note: 'This holds only if you paid the previous statement balance in full by its due date. Otherwise interest may start on the purchase date. Date arithmetic only, not financial advice.',
    };
  },
  content: {
    formula: [
      'Statement close = first closing date on or after the purchase date',
      'Days to close = close date − purchase date',
      'Interest-free days = days to close + grace days',
      'Due date = close date + grace days',
    ],
    body: [
      'Most credit cards charge no interest on new purchases if you pay the full statement balance by the due date. A purchase made just after a statement closes waits almost a full cycle to be billed, so it gets the most time. One made on the closing day gets the least.',
      'Enter the purchase date, the day of the month your statement closes, and the number of days between close and due date. The calculator finds the next close, counts the days to it, adds the grace period, and shows the due date. If your closing day is later than the month has, such as the 31st in February, the last day of that month is used.',
      'This only applies if you paid the previous statement balance in full. If you carry a balance, many cards charge interest from the purchase date, with no grace period. Your card agreement sets the real closing day and grace days. The 25-day default is just an example.',
      'This is plain date arithmetic using UTC dates, so time zones do not shift the result. It is for planning only and is not financial advice.',
    ],
    faq: [
      { q: 'How many interest-free days is a Dec 5 purchase with a close on the 20th?', a: 'The statement closes Dec 20, 15 days later. With 25 grace days that is 40 interest-free days, and payment is due Jan 14.' },
      { q: 'What if I buy the day after the statement closes?', a: 'A Dec 21 purchase with a close on the 20th waits for the Jan 20 close, 30 days away. Adding 25 grace days gives 55 interest-free days, with payment due Feb 14.' },
      { q: 'What if my closing day is the 31st?', a: 'Shorter months use their last day. A Feb 10, 2027 purchase closes Feb 28, 18 days later. With 25 grace days that is 43 days, due Mar 25.' },
      { q: 'Do I always get these interest-free days?', a: 'No. Typically only if you paid the previous full statement balance by its due date. If you carry a balance, interest may accrue from the purchase date. Check your card agreement.' },
      { q: 'Where do I find my closing day and grace days?', a: 'On your monthly statement (closing date and payment due date) or in your card agreement. The 25-day default is only an example.' },
    ],
    sources: [
      { label: 'CFPB: What is a grace period for a credit card?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-grace-period-for-a-credit-card-en-51/' },
    ],
  },
  related: ['credit-card-payoff', 'average-daily-balance-interest'],
  examples: [
    // Dec 5 -> close Dec 20 (15 days) + 25 = 40; due Dec 20 + 25 = Jan 14
    { values: { purchase: '2026-12-05', closeDay: 20, grace: 25 }, expect: { total: 40, toClose: 15 }, tolerance: 1e-9 },
    // Dec 21 -> close Jan 20: 10 days left in Dec + 20 = 30; + 25 = 55; due Feb 14
    { values: { purchase: '2026-12-21', closeDay: 20, grace: 25 }, expect: { total: 55, toClose: 30 }, tolerance: 1e-9 },
    // Close day 31, Feb 10 2027 -> Feb 28 (18 days) + 25 = 43; due Mar 25
    { values: { purchase: '2027-02-10', closeDay: 31, grace: 25 }, expect: { total: 43, toClose: 18 }, tolerance: 1e-9 },
    // Buying on the closing day: 0 days to close, so only the grace period
    { values: { purchase: '2026-12-20', closeDay: 20, grace: 25 }, expect: { total: 25, toClose: 0 }, tolerance: 1e-9 },
  ],
});
