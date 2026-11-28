import { defineCalculator } from '../../lib/types';
import { parseDate, formatDate, num, DAY_MS } from '../../lib/math';
import { isoDate } from '../../lib/helpers/everyday';

const plural = (n: number) => (Math.abs(n) === 1 ? 'day' : 'days');

export default defineCalculator({
  slug: 'gift-return-deadline',
  title: 'Gift Return Deadline Calculator',
  category: 'everyday',
  description: 'Find the last day to return a gift or holiday purchase from the purchase date, the return window and any holiday extension, with days left from today.',
  keywords: ['return deadline calculator', 'gift return deadline', 'holiday return policy calculator', 'last day to return', 'return window calculator', 'days left to return'],
  updated: '2026-11-28',
  inputs: [
    { id: 'start', label: 'Purchase or delivery date', type: 'date', default: 'today', info: 'The date your return window starts from. Many stores count from delivery, not purchase, so check the policy. It counts as day 0.' },
    { id: 'window', label: 'Return window', type: 'number', default: 30, min: 0, max: 3650, step: 1, suffix: 'days', info: 'The number of days the store gives you to return an item, for example 30.' },
    { id: 'extra', label: 'Holiday extension', type: 'number', default: 0, min: 0, max: 3650, step: 1, suffix: 'days', optional: true, info: 'Extra days some stores add for holiday purchases. Leave blank or 0 if there is none.' },
    { id: 'today', label: 'Today\'s date', type: 'date', default: 'today', info: 'Used to count the days left. Change it to check a different day.' },
  ],
  outputs: [
    { id: 'last', label: 'Last day to return', format: 'text', primary: true, info: 'Start date + return window + holiday extension, as a calendar date with its weekday.' },
    { id: 'weekday', label: 'Weekday', format: 'text', info: 'The day of the week of the last return day. If it is a Sunday or a holiday, the store may be closed.' },
    { id: 'daysLeft', label: 'Days left from today', format: 'integer', suffix: 'days', info: 'Last return day minus today. Zero means today is the last day; a negative number means it has passed.' },
    { id: 'total', label: 'Total days allowed', format: 'integer', suffix: 'days', info: 'Return window + holiday extension.' },
  ],
  compute: (v) => {
    const start = parseDate(v.start);
    const today = parseDate(v.today);
    const win = num(v.window);
    const extra = num(v.extra) ?? 0;
    if (!start || !today || win === null) return { last: null };
    if (!Number.isInteger(win) || !Number.isInteger(extra) || win < 0 || extra < 0) return { last: null, error: 'Use whole numbers of days, zero or more.' };
    const total = win + extra;
    const last = new Date(start.getTime() + total * DAY_MS);
    if (Number.isNaN(last.getTime()) || last.getUTCFullYear() > 9999) return { last: null, error: 'That date is out of range.' };
    const left = Math.round((last.getTime() - today.getTime()) / DAY_MS);
    const weekday = last.toLocaleDateString('en-US', { weekday: 'long', timeZone: 'UTC' });
    const tone = left < 0 ? ('bad' as const) : left <= 3 ? ('warn' as const) : ('good' as const);
    const badge = left < 0 ? 'Window has closed' : left === 0 ? 'Last day is today' : `${left} ${plural(left)} left`;
    const note =
      left < 0
        ? `The window closed ${-left} ${plural(left)} ago on ${formatDate(last)}. Ask the store anyway; some will make an exception.`
        : `Return by ${formatDate(last)}. Always read the store's own policy: it decides the start date, the cut-off time and any exceptions.`;
    const elapsed = Math.min(Math.max(Math.round((today.getTime() - start.getTime()) / DAY_MS), 0), total);
    return {
      last: formatDate(last),
      weekday,
      daysLeft: left,
      total,
      tone,
      badge,
      note,
      chart: {
        type: 'bar' as const,
        title: 'Days in your return period',
        categories: ['Return window', 'Holiday extension', 'Used so far', 'Left from today'],
        series: [{ name: 'Days', values: [win, extra, elapsed, Math.max(left, 0)] }],
        format: { format: 'integer' as const, suffix: 'days' },
      },
      steps: [
        `Last day = ${isoDate(start)} + ${win} + ${extra} days = ${isoDate(last)}`,
        `Days left = ${isoDate(last)} − ${isoDate(today)} = ${left} ${plural(left)}`,
      ],
    };
  },
  content: {
    formula: ['Last return day = start date + return window + holiday extension (calendar days)', 'Days left = last return day − today'],
    body: [
      'Gift and holiday returns come with a window: 30 days, 90 days, sometimes more. This calculator adds your window and any holiday extension to the start date, then shows the last day, its weekday and how many days you have left from today.',
      'Example: you buy on November 27, 2026 with a 30 day window and a 31 day holiday extension. That is 61 days, so the last day is Wednesday, January 27, 2027. If today is November 28, you have 60 days left.',
      'The start date counts as day 0, so a 30 day window starting on the 1st ends on the 31st (in a 30 day month, the 1st of the next month). Days are calendar days, weekends included. Some stores count from delivery, some from the receipt date, and some stop at a set time, so the store\'s own policy always wins. Many stores will not take returns on certain items such as opened electronics or final-sale goods.',
      'Dates are worked out as plain calendar dates, so your time zone and daylight saving changes cannot move the answer by a day. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Is the purchase day counted?', a: 'No. The start date is day 0, so the first day of the window is the next day. A 30 day window from the 1st ends 30 days later. If a store counts the purchase day as day 1, subtract 1 from the window.' },
      { q: 'How does the holiday extension work?', a: 'It is added to the return window. A 30 day window with a 31 day extension gives 61 days from the start date.' },
      { q: 'Does it count weekends?', a: 'Yes. Days are calendar days. If the last day falls on a Sunday or a holiday, check whether the store is open; this tool does not know store hours.' },
      { q: 'What do I do if the window has passed?', a: 'The result shows a negative number of days left. Ask the store anyway, as some will help with a receipt or a gift receipt, but they do not have to.' },
      { q: 'Can I count from the delivery date?', a: 'Yes. Enter the delivery date as the start date. Check whether the store counts from delivery or from purchase.' },
    ],
    sources: [],
  },
  related: ['date-add', 'date-difference', 'days-until-holiday', 'return-restocking-cost', 'ship-vs-store-gift'],
  examples: [
    // 2026-11-27 + 30 + 31 = +61 days: Nov 27 -> Nov 30 (3), Dec 31 (34), Jan 27 (61). Wed. Left from Nov 28 = 60.
    { values: { start: '2026-11-27', window: 30, extra: 31, today: '2026-11-28' }, expect: { last: 'Wed, January 27, 2027', weekday: 'Wednesday', daysLeft: 60, total: 61 } },
    // 2026-10-01 + 30 = Oct 31; Nov 28 is 28 days later -> -28
    { values: { start: '2026-10-01', window: 30, extra: null, today: '2026-11-28' }, expect: { last: 'Sat, October 31, 2026', daysLeft: -28, total: 30 } },
  ],
});
