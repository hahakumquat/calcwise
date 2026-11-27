import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'shift-differential',
  title: 'Shift Differential Pay Calculator',
  category: 'finance',
  description: 'Work out what a night, weekend or holiday shift differential is worth: extra pay per hour, per week and per year, plus your blended hourly rate.',
  keywords: ['shift differential calculator', 'night shift differential pay', 'weekend differential pay', 'blended hourly rate', 'shift premium per year'],
  updated: '2026-11-27',
  popular: false,
  inputs: [
    { id: 'base', label: 'Base hourly rate', type: 'number', prefix: '$', default: 25, min: 0, step: 0.25, info: 'Your normal hourly pay before any differential.' },
    {
      id: 'kind',
      label: 'Differential is',
      type: 'select',
      segmented: true,
      default: 'dollars',
      info: 'Employers quote differentials either as extra dollars per hour or as a percent of base pay.',
      options: [
        { value: 'dollars', label: '$ per hour' },
        { value: 'percent', label: '% of base' },
      ],
    },
    { id: 'amount', label: 'Differential amount', type: 'number', default: 3, min: 0, step: 0.25, info: 'Dollars per hour or percent, matching your choice above. Your employer sets this.' },
    { id: 'diffHours', label: 'Hours a week on the differential', type: 'number', suffix: 'hours', default: 24, min: 0, max: 168, step: 0.5, info: 'Night, weekend or holiday hours that earn the extra pay.' },
    { id: 'regHours', label: 'Total hours a week', type: 'number', suffix: 'hours', default: 40, min: 0, max: 168, step: 0.5, info: 'All paid hours in a typical week. Must be at least the differential hours.' },
    { id: 'weeks', label: 'Weeks a year', type: 'number', suffix: 'weeks', default: 52, min: 0, max: 53, step: 1, info: 'Paid weeks per year.' },
  ],
  outputs: [
    { id: 'yearly', label: 'Extra pay per year', format: 'currency', precision: 2, primary: true, info: 'Extra per hour × differential hours × weeks.' },
    { id: 'perHour', label: 'Extra per differential hour', format: 'currency', precision: 2, info: 'The dollar amount, or base × percent.' },
    { id: 'weekly', label: 'Extra pay per week', format: 'currency', precision: 2, info: 'Extra per hour × differential hours.' },
    { id: 'blended', label: 'Blended hourly rate', format: 'currency', precision: 2, info: '(Base × total hours + weekly extra) ÷ total hours.' },
  ],
  compute: (v) => {
    const base = num(v.base);
    const amount = num(v.amount);
    const dh = num(v.diffHours);
    const rh = num(v.regHours);
    const weeks = num(v.weeks);
    const kind = String(v.kind);
    if (base === null || amount === null || dh === null || rh === null || weeks === null) return { yearly: null };
    if (base < 0 || amount < 0 || dh < 0 || rh <= 0 || weeks < 0 || dh > rh) return { yearly: null };
    const perHour = kind === 'percent' ? (base * amount) / 100 : amount;
    const weekly = perHour * dh;
    const yearly = weekly * weeks;
    const blended = (base * rh + weekly) / rh;
    return {
      yearly,
      perHour,
      weekly,
      blended,
      tone: 'good',
      badge: `${money(blended)} an hour blended`,
      note: `The differential adds ${money(perHour)} an hour on ${fmt(dh)} of your ${fmt(rh)} weekly hours, which is ${money(weekly)} a week and ${money(yearly)} a year before tax. Your blended rate is ${money(blended)} an hour against a base of ${money(base)}.`,
      chart: {
        type: 'bar' as const,
        title: 'Hourly rate',
        categories: ['Base rate', 'Blended rate'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Per hour', values: [base, blended] }],
      },
      steps: [
        kind === 'percent'
          ? `Extra per hour = ${money(base)} × ${fmt(amount)}% = ${money(perHour)}`
          : `Extra per hour = ${money(perHour)}`,
        `Weekly extra = ${money(perHour)} × ${fmt(dh)} = ${money(weekly)}`,
        `Yearly extra = ${money(weekly)} × ${fmt(weeks)} = ${money(yearly)}`,
        `Blended = (${money(base)} × ${fmt(rh)} + ${money(weekly)}) ÷ ${fmt(rh)} = ${money(blended)}`,
      ],
    };
  },
  content: {
    formula: [
      'Extra per hour = dollar amount, or base rate × percent ÷ 100',
      'Weekly extra = extra per hour × differential hours',
      'Yearly extra = weekly extra × weeks',
      'Blended rate = (base × total hours + weekly extra) ÷ total hours',
    ],
    body: [
      'A shift differential is extra pay for hours that are less popular, such as nights, weekends or holidays. It is quoted either as dollars per hour or as a percent of base pay. This calculator turns it into a weekly and yearly figure and a blended hourly rate across all your hours.',
      'Example: a $25 base with +$3 an hour on 24 of 40 weekly hours adds $72 a week and $3,744 a year, for a blended $26.80 an hour. With a $20 base and a 10% differential on all 40 hours, the extra is $2.00 an hour, $80 a week and $4,160 a year, a blended $22.00.',
      'Figures are gross pay before tax. Differentials do not usually raise overtime pay unless your policy says so, so enter what your employer states. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is a shift differential?', a: 'Extra pay on top of base pay for less desirable hours such as nights, weekends or holidays, either as dollars per hour or a percent.' },
      { q: 'How do I calculate a percent differential?', a: 'Multiply your base rate by the percent. A 10% differential on $20 is $2.00 an hour.' },
      { q: 'What is a blended hourly rate?', a: 'Your total weekly pay divided by total hours. With $25 base, +$3 on 24 of 40 hours, it is ($1,000 + $72) ÷ 40 = $26.80.' },
      { q: 'Is the result before or after tax?', a: 'Before tax. It is gross pay.' },
      { q: 'Why is there an error when differential hours exceed total hours?', a: 'You cannot work more differential hours than total hours, so the calculator asks for a consistent entry.' },
    ],
    sources: [],
  },
  related: ['overtime-pay', 'salary-to-hourly', 'holiday-shift-worth'],
  examples: [
    // extra 3; weekly 72; yearly 3744; blended (1000+72)/40 = 26.8
    { values: { base: 25, kind: 'dollars', amount: 3, diffHours: 24, regHours: 40, weeks: 52 }, expect: { perHour: 3, weekly: 72, yearly: 3744, blended: 26.8 }, tolerance: 1e-9 },
    // extra 2; weekly 80; yearly 4160; blended 22
    { values: { base: 20, kind: 'percent', amount: 10, diffHours: 40, regHours: 40, weeks: 52 }, expect: { perHour: 2, weekly: 80, yearly: 4160, blended: 22 }, tolerance: 1e-9 },
  ],
});
