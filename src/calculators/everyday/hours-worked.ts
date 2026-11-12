import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { parseClock, formatHM } from '../../lib/helpers/everyday';

export default defineCalculator({
  slug: 'hours-worked',
  title: 'Hours Worked Calculator',
  category: 'everyday',
  description: 'Time card calculator: work out hours worked from clock-in and clock-out times, minus breaks, and the pay earned.',
  keywords: ['time card', 'timesheet', 'work hours', 'shift calculator', 'clock in clock out', 'hourly pay'],
  inputs: [
    { id: 'start', label: 'Clock in', type: 'text', default: '08:30', placeholder: 'HH:MM or 8:30 am', info: 'The time the shift started, in 24-hour (08:30) or 12-hour (8:30 am) format.' },
    { id: 'end', label: 'Clock out', type: 'text', default: '17:00', placeholder: 'HH:MM or 5:00 pm', info: 'The time the shift ended. If it is earlier than clock-in, the shift is assumed to end the next day.' },
    { id: 'breakMin', label: 'Unpaid break', type: 'number', suffix: 'min', default: 30, min: 0, optional: true, info: 'Total unpaid break time in minutes, such as a lunch break. Short paid rest breaks should not be included.' },
    { id: 'rate', label: 'Hourly rate', type: 'number', prefix: '$', default: 20, min: 0, optional: true, info: 'Gross pay per hour before tax. The US federal minimum wage is $7.25, though many states set more.' },
    { id: 'days', label: 'Days worked per week', type: 'number', default: 5, min: 0, max: 7, step: 1, optional: true, info: 'How many times a week you work this same shift, used for the weekly totals.' },
  ],
  outputs: [
    { id: 'hours', label: 'Hours worked', precision: 2, suffix: 'h', primary: true, info: 'Paid time for one shift in decimal hours, after removing the unpaid break.' },
    { id: 'hm', label: 'Hours and minutes', format: 'text', info: 'The same paid time written as hours and minutes.' },
    { id: 'pay', label: 'Pay for the shift', format: 'currency', info: 'Hours worked × hourly rate, before tax and without overtime premiums.' },
    { id: 'weeklyHours', label: 'Hours per week', precision: 2, suffix: 'h', info: 'Hours per shift × days worked per week.' },
    { id: 'weeklyPay', label: 'Pay per week', format: 'currency', info: 'Gross weekly pay at the straight hourly rate.' },
  ],
  compute: (v) => {
    const s = parseClock(v.start);
    const e = parseClock(v.end);
    if (s === null || e === null) return { hours: null, error: 'Enter clock times as HH:MM (24-hour) or with am/pm.' };
    const br = num(v.breakMin) ?? 0;
    const rate = num(v.rate);
    const days = num(v.days);
    const overnight = e < s;
    const span = overnight ? e + 1440 - s : e - s;
    const worked = span - br;
    if (br < 0 || worked < 0) return { hours: null, error: 'The break is longer than the shift.' };
    const hours = worked / 60;
    const weeklyHours = days !== null && days >= 0 ? hours * days : null;
    const notes: string[] = [];
    if (overnight) notes.push('Shift crosses midnight.');
    if (weeklyHours !== null && weeklyHours > 40)
      notes.push('Over 40 h a week: US non-exempt employees are usually owed 1.5× pay for the extra hours (not included here).');
    const steps = [`Shift length = ${formatHM(span)}`, `Minus ${br} min break = ${formatHM(worked)} = ${hours.toFixed(2)} h`];
    if (rate !== null) steps.push(`Pay = ${hours.toFixed(2)} h × $${rate} = $${(hours * rate).toFixed(2)}`);
    const chart: ChartSpec[] = [];
    if (span > 0)
      chart.push({
        type: 'donut',
        title: 'Time at work',
        format: { format: 'integer', suffix: 'min' },
        slices: [
          { label: 'Paid work', value: worked },
          { label: 'Unpaid break', value: br },
        ],
        centerValue: hours.toFixed(2),
        centerLabel: 'hours paid',
      });
    if (rate !== null && weeklyHours !== null)
      chart.push({
        type: 'bar',
        title: 'Gross pay',
        categories: ['Per shift', 'Per week', 'Per month (≈4.33 wk)'],
        series: [{ name: 'Pay', values: [hours * rate, weeklyHours * rate, (weeklyHours * rate * 52) / 12] }],
        format: { format: 'currency' },
      });
    if (!chart.length) chart.push({ type: 'bar', title: 'Hours', categories: ['Shift'], series: [{ name: 'Hours', values: [hours] }], format: { suffix: 'h' } });
    return {
      hours,
      hm: formatHM(worked),
      pay: rate !== null ? hours * rate : null,
      weeklyHours,
      weeklyPay: rate !== null && weeklyHours !== null ? weeklyHours * rate : null,
      chart,
      note: notes.length ? notes.join(' ') : undefined,
      steps,
    };
  },
  content: {
    formula: ['Hours = (clock out − clock in − break minutes) ÷ 60', 'Pay = hours × hourly rate'],
    body: [
      'Enter when the shift started and ended and how long the unpaid break was. The calculator turns both times into minutes, subtracts the break and converts the result to decimal hours, which is the figure payroll multiplies by your hourly rate.',
      'Night shifts are handled automatically: if the clock-out time is earlier than the clock-in time, the shift is assumed to end the next day.',
      'The weekly figures repeat the same shift for the number of days you enter. Overtime premiums, tips, taxes and deductions are not included, so treat the pay as gross pay before withholding.',
    ],
    faq: [
      { q: 'Should paid breaks be subtracted?', a: 'No. Only subtract unpaid breaks such as a lunch break. In the US, short rest breaks of up to 20 minutes are normally paid and count as hours worked.' },
      { q: 'How do I write 8 hours 20 minutes as a decimal?', a: '20 ÷ 60 = 0.333, so it is 8.33 hours. Writing 8.20 would underpay by about 8 minutes.' },
    ],
  },
  related: ['time-duration', 'date-difference', 'tip'],
  examples: [
    { values: { start: '08:30', end: '17:00', breakMin: 30, rate: 20, days: 5 }, expect: { hours: 8, hm: '8 h 0 min', pay: 160, weeklyHours: 40, weeklyPay: 800 } },
    { values: { start: '10:00 pm', end: '6:45 am', breakMin: 45, rate: 18, days: null }, expect: { hours: 8, pay: 144 } },
  ],
});
