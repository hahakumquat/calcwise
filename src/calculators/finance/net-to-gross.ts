import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'net-to-gross',
  title: 'Net to Gross: Raise Needed for More Take-Home',
  seoTitle: 'Net to Gross Raise Calculator',
  metaDescription: 'Find the gross raise you need to take home an extra amount after tax. Enter the extra take-home you want and your marginal tax rate to see the raise.',
  updated: '2026-11-23',
  category: 'finance',
  description: 'Work backwards from the extra take-home pay you want to the gross raise you must ask for, given your marginal tax rate.',
  keywords: ['net to gross calculator', 'raise needed to take home more', 'gross raise for net increase', 'how much raise to net extra per month', 'after tax raise calculator'],
  popular: false,
  inputs: [
    { id: 'extra', label: 'Extra take-home you want per month', type: 'number', prefix: '$', default: 250, min: 0, step: 25, info: 'The extra amount you want to land in your bank account each month, after tax.' },
    { id: 'rate', label: 'Tax rate on extra pay', type: 'number', suffix: '%', default: 30, min: 0, max: 90, step: 0.5, info: 'Your marginal rate: income tax on your top dollars plus payroll taxes and any state tax. You enter it; this tool does not look up brackets.' },
    { id: 'salary', label: 'Current yearly salary (optional)', type: 'number', prefix: '$', default: 60000, min: 0, step: 500, info: 'Only used to show the raise as a percentage. Enter 0 to skip.' },
  ],
  outputs: [
    { id: 'gross', label: 'Gross raise needed per month', format: 'currency', precision: 2, primary: true, info: 'Extra take-home ÷ (1 − tax rate).' },
    { id: 'year', label: 'Gross raise needed per year', format: 'currency', precision: 0, info: 'Monthly gross raise × 12.' },
    { id: 'tax', label: 'Extra tax per month', format: 'currency', precision: 2, info: 'Gross raise − extra take-home.' },
    { id: 'pct', label: 'Raise as % of salary', format: 'percent', info: 'Yearly gross raise ÷ current salary. Blank if no salary is entered.' },
  ],
  compute: (v) => {
    const extra = num(v.extra), rate = num(v.rate), salary = num(v.salary);
    if ([extra, rate, salary].some((x) => x === null)) return { gross: null };
    if ([extra!, rate!, salary!].some((x) => x < 0)) return { gross: null, error: 'Amounts cannot be negative.' };
    if (rate! >= 100) return { gross: null, error: 'Tax rate must be under 100%.' };
    const keep = 1 - rate! / 100;
    const gross = extra! / keep;
    const year = gross * 12;
    const tax = gross - extra!;
    const pct = salary! > 0 ? year / salary! : null;
    return {
      gross,
      year,
      tax,
      pct,
      tone: 'good',
      badge: `Keep ${(keep * 100).toFixed(1)}c of each extra $1`,
      chart: {
        type: 'bar',
        title: 'Where the gross raise goes (per month)',
        categories: ['Extra take-home', 'Extra tax'],
        series: [{ name: 'Per month', values: [+extra!.toFixed(2), +tax.toFixed(2)] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Share you keep = 1 − ${rate}% = ${(keep * 100).toFixed(2)}%`,
        `Gross raise = ${money(extra!, 2)} ÷ ${keep.toFixed(4)} = ${money(gross, 2)} a month`,
        `Per year = ${money(gross, 2)} × 12 = ${money(year, 2)}`,
        `Extra tax = ${money(gross, 2)} − ${money(extra!, 2)} = ${money(tax, 2)} a month`,
      ],
      note: 'Not tax advice. Uses one flat rate for the whole raise. A big raise can push part of it into a higher bracket, and some payroll taxes stop above a wage cap, so the true rate can differ. Check a payslip or ask a tax professional.',
    };
  },
  content: {
    formula: [
      'Gross raise = extra take-home ÷ (1 − marginal tax rate)',
      'Extra tax = gross raise − extra take-home',
      'Raise % = (gross raise × 12) ÷ current yearly salary',
    ],
    body: [
      'A $250 raise does not put $250 in your account. Tax takes a share of every extra dollar, so to take home a set amount more you must ask for a larger gross raise. This calculator works backwards from the take-home you want.',
      'To take home an extra $3,000 a month at a 30% marginal rate, you keep 70 cents of each extra dollar. The gross raise is 3,000 ÷ 0.70 = $4,285.71 a month, or $51,428.57 a year, with $1,285.71 a month going to tax.',
      'Use your marginal rate, not your average rate. The marginal rate is what applies to the next dollar you earn: income tax at your top bracket, plus payroll taxes and any state tax.',
    ],
    sections: [
      {
        heading: 'Choosing the tax rate',
        paragraphs: [
          'For many US employees the combined marginal rate on a raise falls somewhere between 20% and 40%, but it depends on income, filing status and state. Look at your latest payslip or a tax-bracket table, then add payroll tax and state tax. To go the other way, from a raise to new pay, use the raise calculator. To see take-home from a full salary, use the take-home pay calculator.',
        ],
      },
    ],
    faq: [
      { q: 'How much of a raise do I need to take home $3,000 more a month?', a: 'At a 30% marginal tax rate you keep 70% of each extra dollar, so the gross raise is 3,000 ÷ 0.70 = $4,285.71 a month, which is $51,428.57 a year.' },
      { q: 'Why is the gross raise bigger than the take-home I want?', a: 'Tax is taken from the raise before it reaches you. The gross figure is the take-home divided by the share you keep, so a higher tax rate means a bigger gross raise.' },
      { q: 'What happens at a 0% tax rate?', a: 'You keep every dollar, so the gross raise equals the take-home you want. For example, $250 a month needs a $250 a month raise.' },
      { q: 'Should I use my average or marginal tax rate?', a: 'Use the marginal rate. It is the rate on the next dollar you earn, which is what applies to a raise. Your average rate is usually lower and would understate the raise you need.' },
    ],
    sources: [
      { label: 'IRS: Tax rates and brackets, Publication 15 (employer tax guide)', url: 'https://www.irs.gov/publications/p15' },
      { label: 'IRS: Federal income tax rates and brackets', url: 'https://www.irs.gov/filing/federal-income-tax-rates-and-brackets' },
    ],
  },
  related: ['raise-calculator', 'take-home-pay', 'bonus-vs-raise', 'income-tax'],
  examples: [
    // keep 0.70; 3000/0.70 = 4285.714286; year 51428.571429; tax 1285.714286; pct 51428.571429/60000 = 0.857143
    { values: { extra: 3000, rate: 30, salary: 60000 }, expect: { gross: 3000 / 0.7, year: 36000 / 0.7, tax: 3000 / 0.7 - 3000, pct: 36000 / 0.7 / 60000 }, tolerance: 1e-6 },
    // keep 0.75; 300/0.75 = 400; year 4800; tax 100; pct 4800/48000 = 0.1
    { values: { extra: 300, rate: 25, salary: 48000 }, expect: { gross: 400, year: 4800, tax: 100, pct: 0.1 }, tolerance: 1e-6 },
  ],
});
