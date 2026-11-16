import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const hrs = (n: number) => `${Math.round(n * 100) / 100}`;

export default defineCalculator({
  slug: 'overtime-pay',
  title: 'Overtime Pay Calculator',
  category: 'everyday',
  description: 'Work out gross weekly pay with overtime and holiday hours: regular pay, overtime at 1.5x (or your multiplier), holiday pay and your effective hourly rate.',
  keywords: ['overtime pay calculator', 'overtime calculator', 'time and a half', 'holiday pay calculator', 'double time pay', 'weekly gross pay with overtime'],
  updated: '2026-11-16',
  inputs: [
    { id: 'rate', label: 'Hourly rate', type: 'number', prefix: '$', default: 20, min: 0, step: 0.01, info: 'Your regular gross pay per hour, before tax.' },
    { id: 'hours', label: 'Hours worked this week', type: 'number', suffix: 'h', default: 48, min: 0, max: 168, step: 0.25, info: 'Regular and overtime hours for the week, not counting holiday hours entered below.' },
    { id: 'threshold', label: 'Overtime starts after', type: 'number', suffix: 'h / week', default: 40, min: 0, max: 168, step: 0.5, optional: true, info: 'Weekly hours after which overtime applies. The US federal rule for most non-exempt employees is 40.' },
    { id: 'mult', label: 'Overtime multiplier', type: 'number', suffix: '×', default: 1.5, min: 1, max: 5, step: 0.25, optional: true, info: '1.5 is "time and a half", 2 is "double time". Must be at least 1.' },
    { id: 'holidayHours', label: 'Holiday hours', type: 'number', suffix: 'h', default: 0, min: 0, max: 168, step: 0.25, optional: true, info: 'Hours worked on a holiday. They are counted separately from the hours above and are not added to the overtime threshold.' },
    { id: 'holidayMult', label: 'Holiday multiplier', type: 'number', suffix: '×', default: 2, min: 1, max: 5, step: 0.25, optional: true, info: 'Pay multiplier for holiday hours, such as 2 for double time. Set by your employer or contract; US federal law does not require holiday premiums.' },
  ],
  outputs: [
    { id: 'total', label: 'Total gross pay', format: 'currency', primary: true, info: 'Regular pay + overtime pay + holiday pay, before tax and deductions.' },
    { id: 'regular', label: 'Regular pay', format: 'currency', info: 'Hours up to the threshold × hourly rate.' },
    { id: 'overtime', label: 'Overtime pay', format: 'currency', info: 'Hours above the threshold × hourly rate × overtime multiplier.' },
    { id: 'holiday', label: 'Holiday pay', format: 'currency', info: 'Holiday hours × hourly rate × holiday multiplier.' },
    { id: 'effective', label: 'Effective hourly rate', format: 'currency', info: 'Total gross pay ÷ all hours worked, including holiday hours.' },
  ],
  compute: (v) => {
    const rate = num(v.rate);
    const h = num(v.hours);
    const threshold = num(v.threshold) ?? 40;
    const mult = num(v.mult) ?? 1.5;
    const hh = num(v.holidayHours) ?? 0;
    const hm = num(v.holidayMult) ?? 2;
    if (rate === null || h === null) return { total: null };
    if (rate < 0 || h < 0 || threshold < 0 || hh < 0) return { total: null, error: 'Rates and hours cannot be negative.' };
    if (mult < 1 || hm < 1) return { total: null, error: 'Multipliers must be at least 1.' };

    const regHours = Math.min(h, threshold);
    const otHours = Math.max(h - threshold, 0);
    const regular = regHours * rate;
    const overtime = otHours * rate * mult;
    const holiday = hh * rate * hm;
    const total = regular + overtime + holiday;
    const allHours = h + hh;
    const effective = allHours > 0 ? total / allHours : null;

    const premium = total - allHours * rate;
    const tone: 'good' | 'ok' = premium > 0 ? 'good' : 'ok';
    const badge = otHours > 0 || hh > 0 ? `${money(premium)} above straight time` : 'No overtime this week';

    const steps = [`Regular = ${hrs(regHours)} h × ${money(rate)} = ${money(regular)}`];
    steps.push(`Overtime = ${hrs(otHours)} h × ${money(rate)} × ${mult} = ${money(overtime)}`);
    if (hh > 0) steps.push(`Holiday = ${hrs(hh)} h × ${money(rate)} × ${hm} = ${money(holiday)}`);
    steps.push(`Total = ${money(total)} (gross, before tax)`);
    if (effective !== null) steps.push(`Effective rate = ${money(total)} ÷ ${hrs(allHours)} h = ${money(effective)} an hour`);

    const slices = [
      { label: 'Regular', value: regular },
      { label: 'Overtime', value: overtime },
      { label: 'Holiday', value: holiday },
    ].filter((s) => s.value > 0);
    const chart: ChartSpec | undefined = slices.length
      ? { type: 'donut', title: 'Where your gross pay comes from', format: { format: 'currency' }, slices, centerValue: money(total, 0), centerLabel: 'gross pay' }
      : undefined;

    return {
      total, regular, overtime, holiday, effective,
      tone, badge,
      chart,
      note: 'Gross pay only: income tax, Social Security, Medicare and other deductions are not taken out. Overtime can push a paycheck into a higher withholding rate, but it does not raise your actual tax bracket for the whole year.',
      steps,
    };
  },
  content: {
    formula: [
      'Regular pay = min(hours, threshold) × hourly rate',
      'Overtime pay = max(hours − threshold, 0) × hourly rate × overtime multiplier',
      'Holiday pay = holiday hours × hourly rate × holiday multiplier',
      'Total gross pay = regular + overtime + holiday',
      'Effective hourly rate = total ÷ (hours + holiday hours)',
    ],
    body: [
      'Enter your hourly rate and the hours you worked in the week. Anything above the overtime threshold (40 hours by default) is paid at the overtime multiplier, usually 1.5, known as time and a half. Hours up to the threshold are paid at the normal rate.',
      'Holiday hours are entered separately. They are paid at their own multiplier (2 by default) and are not added to the regular or overtime hours, so they never push your other hours into overtime in this calculator. Leave them at 0 if you did not work a holiday.',
      'The effective hourly rate is your total pay divided by every hour worked. It shows what an hour was really worth that week once the premiums are included. At $20 an hour and 48 hours, it is about $21.67.',
      'This is gross pay only. Tax and other deductions are not taken out, so your take-home pay will be lower.',
    ],
    sections: [
      {
        heading: 'Rules that differ from this calculator',
        paragraphs: [
          'Under the US Fair Labor Standards Act (FLSA), non-exempt employees must generally be paid at least 1.5 times their regular rate for hours over 40 in a workweek. Some states add their own rules. California, for example, also requires overtime for hours over 8 in a day and double time in some cases, which a weekly calculator cannot capture.',
          'Some workers are exempt from overtime, including many salaried executive, administrative and professional roles, depending on duties and salary level. Federal law does not require extra pay for holidays; any holiday premium comes from your employer, contract or union agreement. Check your state labor department and employer policy for the exact rules that apply to you.',
        ],
      },
    ],
    faq: [
      { q: 'How much is $20 an hour for 48 hours with time and a half?', a: 'Regular pay is 40 × $20 = $800. Overtime is 8 × $20 × 1.5 = $240. Total gross pay is $1,040, an effective rate of about $21.67 an hour.' },
      { q: 'What if I work exactly 40 hours?', a: 'There is no overtime. At $20 an hour you earn 40 × $20 = $800 gross.' },
      { q: 'How are holiday hours calculated?', a: 'Holiday hours are paid separately at your holiday multiplier. For example, 8 holiday hours at $20 and 2× pay 8 × $20 × 2 = $320. With 45 regular hours that week, total gross pay is $800 + $150 + $320 = $1,270.' },
      { q: 'Is this before or after tax?', a: 'Before. The result is gross pay with no tax or deductions taken out.' },
      { q: 'Does everyone get overtime?', a: 'No. Exempt employees, such as many salaried managers and professionals, are not covered by FLSA overtime rules, and state laws vary.' },
    ],
    sources: [{ label: 'US Department of Labor: Overtime pay (FLSA)', url: 'https://www.dol.gov/agencies/whd/overtime' }],
  },
  related: ['hours-worked', 'take-home-pay', 'salary-to-hourly'],
  examples: [
    // 40 × 20 = 800; 8 × 20 × 1.5 = 240; total 1,040; 1,040 ÷ 48 = 21.6667.
    { values: { rate: 20, hours: 48, threshold: 40, mult: 1.5, holidayHours: 0, holidayMult: 2 }, expect: { total: 1040, regular: 800, overtime: 240, holiday: 0, effective: 21.6667 }, tolerance: 1e-3 },
    // Exactly 40 h: no overtime, 800.
    { values: { rate: 20, hours: 40 }, expect: { total: 800, regular: 800, overtime: 0, effective: 20 } },
    // 40 × 20 = 800; 5 × 20 × 1.5 = 150; 8 × 20 × 2 = 320; total 1,270; 1,270 ÷ 53 = 23.9623.
    { values: { rate: 20, hours: 45, holidayHours: 8, holidayMult: 2 }, expect: { total: 1270, regular: 800, overtime: 150, holiday: 320, effective: 23.9623 }, tolerance: 1e-3 },
  ],
});
