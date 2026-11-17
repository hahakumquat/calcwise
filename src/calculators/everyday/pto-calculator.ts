import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'pto-calculator',
  title: 'PTO Calculator',
  category: 'everyday',
  description: 'Work out how much paid time off you earn each paycheck, how many days you have left this year, and what unused leave is worth in dollars before it expires.',
  keywords: ['pto calculator', 'pto accrual calculator', 'paid time off calculator', 'vacation days left', 'use it or lose it pto', 'value of unused pto'],
  updated: '2026-11-17',
  inputs: [
    { id: 'days', label: 'PTO days per year', type: 'number', default: 15, min: 0, step: 0.5, suffix: 'days', info: 'Days of paid time off you earn in a full year.' },
    { id: 'hoursDay', label: 'Hours in a work day', type: 'number', default: 8, min: 1, max: 24, step: 0.5, suffix: 'h', info: 'Used to turn days into hours.' },
    {
      id: 'periods', label: 'Pay periods per year', type: 'select', default: '26',
      options: [{ value: '52', label: 'Weekly (52)' }, { value: '26', label: 'Every 2 weeks (26)' }, { value: '24', label: 'Twice a month (24)' }, { value: '12', label: 'Monthly (12)' }],
      info: 'How often you are paid. PTO usually accrues a little each paycheck.',
    },
    { id: 'used', label: 'Days already used or booked', type: 'number', default: 10, min: 0, step: 0.5, suffix: 'days', info: 'PTO you have taken or scheduled this year, including any carried-in balance you want to ignore.' },
    { id: 'cap', label: 'Days you can carry over', type: 'number', optional: true, min: 0, step: 0.5, suffix: 'days', info: 'Optional. Your employer\'s carryover limit. Anything above it may be lost on the year-end date. Leave blank if unsure.' },
    { id: 'salary', label: 'Annual salary', type: 'number', prefix: '$', optional: true, min: 0, step: 500, info: 'Optional. Used to value unused days at salary ÷ 2,080 hours (40 hours × 52 weeks).' },
  ],
  outputs: [
    { id: 'left', label: 'Days left this year', format: 'number', precision: 1, primary: true, info: 'PTO days per year minus days used or booked.' },
    { id: 'hoursLeft', label: 'Hours left', format: 'number', precision: 1, suffix: 'h', info: 'Days left × hours in a work day.' },
    { id: 'perPeriod', label: 'Accrued per paycheck', format: 'number', precision: 2, suffix: 'h', info: 'Annual PTO hours ÷ pay periods.' },
    { id: 'atRisk', label: 'Days over the carryover cap', format: 'number', precision: 1, info: 'Days left above your carryover limit. Blank cap means none.' },
    { id: 'value', label: 'Value of unused days', format: 'currency', info: 'Hours left × hourly rate (salary ÷ 2,080). Needs a salary.' },
    { id: 'riskValue', label: 'Value at risk', format: 'currency', info: 'Hourly rate × hours above the carryover cap. Needs a salary and a cap.' },
  ],
  compute: (v) => {
    const days = num(v.days);
    const hd = num(v.hoursDay);
    const periods = Number(v.periods);
    const used = num(v.used) ?? 0;
    const cap = num(v.cap);
    const salary = num(v.salary);
    if (days === null || hd === null || !(periods > 0)) return { left: null };
    if (days < 0 || used < 0 || hd <= 0 || (cap !== null && cap < 0) || (salary !== null && salary < 0)) return { left: null, error: 'Values cannot be negative.' };
    const annualHours = days * hd;
    const left = days - used;
    const leftPos = Math.max(left, 0);
    const hoursLeft = leftPos * hd;
    const atRisk = cap === null ? 0 : Math.max(leftPos - cap, 0);
    const rate = salary === null ? null : salary / 2080;
    const overdrawn = left < 0;
    const chart: ChartSpec = {
      type: 'donut',
      title: 'Your PTO this year',
      format: { format: 'number' },
      slices: [
        { label: 'Used or booked', value: Math.min(used, days) },
        { label: 'Left', value: leftPos },
      ].filter((s) => s.value > 0),
      centerValue: `${+leftPos.toFixed(1)}`,
      centerLabel: 'days left',
    };
    return {
      left,
      hoursLeft,
      perPeriod: annualHours / periods,
      atRisk,
      value: rate === null ? null : hoursLeft * rate,
      riskValue: rate === null || cap === null ? null : atRisk * hd * rate,
      chart: days > 0 ? chart : undefined,
      tone: atRisk > 0 || overdrawn ? 'warn' : 'ok',
      badge: overdrawn ? 'Booked more than you earn' : atRisk > 0 ? `${+atRisk.toFixed(1)} days could expire` : 'Nothing at risk',
      note: 'Payout and carryover rules vary by employer and state. Check your handbook or HR before relying on this.',
      steps: [
        `Annual PTO = ${days} days × ${hd} h = ${+annualHours.toFixed(2)} hours.`,
        `Per paycheck = ${+annualHours.toFixed(2)} ÷ ${periods} = ${+(annualHours / periods).toFixed(3)} hours.`,
        `Left = ${days} − ${used} = ${+left.toFixed(2)} days (${+(left * hd).toFixed(2)} hours).`,
        ...(rate !== null ? [`Hourly rate = ${money(salary as number)} ÷ 2,080 = ${money(rate, 2)}; unused value = ${money(hoursLeft * rate)}.`] : []),
      ],
    };
  },
  content: {
    formula: [
      'Annual PTO hours = days per year × hours per day',
      'Accrual per paycheck = annual hours ÷ pay periods',
      'Days left = days per year − days used',
      'Hourly rate = salary ÷ 2,080; value = hours left × hourly rate',
    ],
    body: [
      'Most employers accrue paid time off a little each paycheck. Enter your yearly days, how often you are paid and what you have used to see how much is left and how fast it builds.',
      'If your employer limits carryover, add the cap to see how many days could vanish at year end. Add a salary to turn those days into dollars.',
      'This is an estimate. Policies differ on accrual timing, caps and whether unused PTO is paid out when you leave.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          '15 days at 8 hours is 120 hours a year. Paid every two weeks (26 periods), that is 120 ÷ 26 = 4.62 hours per paycheck.',
          'With 10 days used you have 5 days (40 hours) left. On a $52,000 salary the hourly rate is 52,000 ÷ 2,080 = $25, so the unused days are worth $1,000. With a carryover cap of 3 days, 2 days (16 hours, $400) are at risk.',
        ],
      },
    ],
    faq: [
      { q: 'How much PTO do I earn per paycheck?', a: 'Annual PTO hours divided by pay periods. 15 days at 8 hours paid every two weeks is 120 ÷ 26 = about 4.62 hours.' },
      { q: 'How is unused PTO valued?', a: 'This calculator multiplies hours left by salary ÷ 2,080 hours. A $52,000 salary is $25 an hour, so 40 hours is $1,000.' },
      { q: 'Does unused PTO get paid out?', a: 'It depends on your employer and state law. Some states treat accrued PTO as earned wages; others leave it to company policy. Check your handbook.' },
      { q: 'What is a carryover cap?', a: 'The most PTO you may carry into next year. Days above it can be forfeited, so use them before the reset date.' },
    ],
    sources: [{ label: 'US Department of Labor: vacation leave', url: 'https://www.dol.gov/general/topic/workhours/vacation_leave' }],
  },
  related: ['salary-to-hourly', 'hours-worked', 'overtime-pay'],
  examples: [
    // annual 120 h; per period 120/26 = 4.6154; left 5 d = 40 h; rate 25 -> $1000; cap 3 -> 2 d at risk, 16 h x 25 = 400
    { values: { days: 15, hoursDay: 8, periods: '26', used: 10, cap: 3, salary: 52000 }, expect: { left: 5, hoursLeft: 40, perPeriod: 120 / 26, atRisk: 2, value: 1000, riskValue: 400 } },
    // monthly: 120/12 = 10 h; used 15 -> 0 left
    { values: { days: 15, hoursDay: 8, periods: '12', used: 15 }, expect: { left: 0, perPeriod: 10 } },
  ],
});
