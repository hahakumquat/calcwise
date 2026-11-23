import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'prorated-salary',
  title: 'Prorated Salary Calculator',
  seoTitle: 'Prorated Salary Calculator',
  metaDescription: 'Starting a job mid-month? See your first partial paycheck before tax by calendar days and by working days, and how much the two methods differ.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Work out a prorated first paycheck for a mid-month start date, using both the calendar-day method and the working-day method, before tax.',
  keywords: ['prorated salary calculator', 'prorated first paycheck', 'partial month salary', 'mid month start date pay', 'how to prorate salary'],
  popular: false,
  inputs: [
    { id: 'salary', label: 'Annual salary', type: 'number', prefix: '$', default: 72000, min: 0, step: 1000, info: 'Gross yearly pay from your offer letter.' },
    { id: 'days', label: 'Calendar days in the month', type: 'number', default: 30, min: 1, max: 31, step: 1, info: 'For example 30 for November, 31 for December.' },
    { id: 'start', label: 'Start day of the month', type: 'number', default: 16, min: 1, max: 31, step: 1, info: 'Your first paid day. Day 16 means you are paid from the 16th to the end of the month.' },
    { id: 'wdMonth', label: 'Working days in the month', type: 'number', default: 22, min: 1, max: 31, step: 1, info: 'Weekdays in the month, minus any paid holidays your employer treats as non-working.' },
    { id: 'wdWorked', label: 'Working days you will work', type: 'number', default: 12, min: 0, max: 31, step: 1, info: 'Working days from your start date to the end of the month.' },
  ],
  outputs: [
    { id: 'byCalendar', label: 'First pay by calendar days', format: 'currency', precision: 2, primary: true, info: 'Monthly salary × paid calendar days ÷ days in the month.' },
    { id: 'byWorking', label: 'First pay by working days', format: 'currency', precision: 2, info: 'Monthly salary × working days worked ÷ working days in the month.' },
    { id: 'diff', label: 'Difference between methods', format: 'currency', precision: 2, info: 'Working-day pay minus calendar-day pay. Positive means the working-day method pays more.' },
    { id: 'monthly', label: 'Full monthly salary', format: 'currency', precision: 2, info: 'Annual salary ÷ 12.' },
    { id: 'paidDays', label: 'Paid calendar days', format: 'integer', info: 'Days in the month - start day + 1.' },
  ],
  compute: (v) => {
    const salary = num(v.salary), days = num(v.days), start = num(v.start), wdm = num(v.wdMonth), wdw = num(v.wdWorked);
    if ([salary, days, start, wdm, wdw].some((x) => x === null)) return { byCalendar: null };
    if (salary! < 0) return { byCalendar: null, error: 'Salary cannot be negative.' };
    if (days! < 1) return { byCalendar: null, error: 'The month needs at least 1 day.' };
    if (start! < 1 || start! > days!) return { byCalendar: null, error: 'The start day must fall inside the month.' };
    if (wdm! < 1) return { byCalendar: null, error: 'The month needs at least 1 working day.' };
    if (wdw! < 0 || wdw! > wdm!) return { byCalendar: null, error: 'Working days worked must be between 0 and the working days in the month.' };
    const monthly = salary! / 12;
    const paidDays = days! - start! + 1;
    const byCalendar = (monthly * paidDays) / days!;
    const byWorking = (monthly * wdw!) / wdm!;
    const diff = byWorking - byCalendar;
    return {
      byCalendar, byWorking, diff, monthly, paidDays,
      tone: 'ok',
      chart: {
        type: 'bar',
        title: 'First paycheck before tax',
        categories: ['Calendar days', 'Working days', 'Full month'],
        series: [{ name: 'Pay', values: [byCalendar, byWorking, monthly] }],
        format: { format: 'currency' },
      },
      badge: `${money(Math.abs(diff), 2)} ${diff >= 0 ? 'more' : 'less'} by working days`,
      steps: [
        `Monthly salary = ${money(salary!, 0)} ÷ 12 = ${money(monthly, 2)}`,
        `Calendar days: ${money(monthly, 2)} × ${paidDays} ÷ ${days} = ${money(byCalendar, 2)}`,
        `Working days: ${money(monthly, 2)} × ${wdw} ÷ ${wdm} = ${money(byWorking, 2)}`,
      ],
      note: 'Amounts are before tax and deductions. Employers differ, so check which method your payroll uses.',
    };
  },
  content: {
    formula: [
      'Monthly salary = annual salary ÷ 12',
      'Calendar method = monthly salary × paid days ÷ days in the month',
      'Working-day method = monthly salary × working days worked ÷ working days in the month',
    ],
    body: [
      'When a job starts part-way through a pay period, the first paycheck is prorated: you are paid for the part of the month you actually work. Employers use one of two common methods, and they rarely give the same number.',
      'The calendar method counts every day, weekends included, so it is the same fraction regardless of which days fall on the weekend. The working-day method counts only working days and can pay more or less depending on how the weekends fall.',
      'Both results here are gross, before tax. Your offer letter or HR team will say which method applies; some employers use a daily rate of annual salary ÷ 260 instead.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'On $72,000 a year the monthly salary is $6,000. Starting on the 16th of a 30-day month gives 15 paid days, so the calendar method pays $6,000 × 15 ÷ 30 = $3,000.',
          'If the month has 22 working days and you work 12 of them, the working-day method pays $6,000 × 12 ÷ 22 = $3,272.73, which is $272.73 more.',
        ],
      },
      {
        heading: 'Related planning',
        paragraphs: [
          'The paychecks per year calculator shows how often you are paid, and the net to gross calculator helps turn take-home pay back into salary.',
        ],
      },
    ],
    faq: [
      { q: 'How do I prorate a salary for a partial month?', a: 'Divide the annual salary by 12, then multiply by the share of the month you work. For 15 of 30 days on $72,000, that is $6,000 × 15 ÷ 30 = $3,000.' },
      { q: 'Calendar days or working days?', a: 'Both are used. The calendar method counts every day; the working-day method counts weekdays only. Ask your employer, as the two can differ by hundreds of dollars.' },
      { q: 'Is this before or after tax?', a: 'Before. Taxes and deductions come off afterward, so the amount in your account will be lower.' },
      { q: 'Does the start day count?', a: 'Yes. This calculator counts the start day as a paid day, so starting on the 16th of a 30-day month is 15 days.' },
    ],
    sources: [],
  },
  related: ['paychecks-per-year', 'net-to-gross', 'raise-calculator', 'salary-to-hourly'],
  examples: [
    // monthly 6000; paid 30-16+1=15; calendar 3000; working 6000*12/22=3272.7273; diff 272.7273
    { values: { salary: 72000, days: 30, start: 16, wdMonth: 22, wdWorked: 12 }, expect: { monthly: 6000, paidDays: 15, byCalendar: 3000, byWorking: 3272.7273, diff: 272.7273 }, tolerance: 1e-3 },
    // start on day 1 of a 31-day month, all 23 working days: full month
    { values: { salary: 60000, days: 31, start: 1, wdMonth: 23, wdWorked: 23 }, expect: { monthly: 5000, paidDays: 31, byCalendar: 5000, byWorking: 5000, diff: 0 }, tolerance: 1e-6 },
  ],
});
