import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'holiday-shift-worth',
  title: 'Holiday Shift Pay: Is It Worth Working?',
  category: 'finance',
  description: 'Check whether a holiday shift is worth it: premium pay after tax and extra costs like childcare or travel, compared with your normal after-tax hourly pay.',
  keywords: ['holiday shift pay calculator', 'is working a holiday worth it', 'holiday pay time and a half', 'double time holiday calculator', 'holiday shift after tax'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'hours', label: 'Hours worked', type: 'number', default: 8, min: 0, step: 0.5, info: 'Length of the holiday shift.' },
    { id: 'rate', label: 'Base hourly rate', type: 'number', prefix: '$', default: 20, min: 0, step: 0.5, info: 'Your normal pay before any premium.' },
    { id: 'mult', label: 'Pay multiplier', type: 'number', suffix: '×', default: 1.5, min: 0, step: 0.25, info: 'For example 1.5 for time and a half, 2 for double time. Your employer sets this.' },
    { id: 'tax', label: 'Tax on the extra pay', type: 'number', suffix: '%', default: 15, min: 0, max: 100, step: 1, info: 'Your estimated tax rate on this pay.' },
    { id: 'costs', label: 'Extra costs for the day', type: 'number', prefix: '$', default: 40, min: 0, step: 5, info: 'Childcare, travel, meals out or anything you only pay because you work that day.' },
  ],
  outputs: [
    { id: 'net', label: 'Net pay after tax and costs', format: 'currency', precision: 2, primary: true, info: 'Gross × (1 − tax) − extra costs.' },
    { id: 'gross', label: 'Gross shift pay', format: 'currency', precision: 2, info: 'Hours × rate × multiplier.' },
    { id: 'afterTax', label: 'After tax, before costs', format: 'currency', precision: 2, info: 'Gross × (1 − tax).' },
    { id: 'netHour', label: 'Net per hour', format: 'currency', precision: 2, info: 'Net pay ÷ hours.' },
    { id: 'regHour', label: 'Regular after-tax hourly', format: 'currency', precision: 2, info: 'Rate × (1 − tax).' },
  ],
  compute: (v) => {
    const hours = num(v.hours);
    const rate = num(v.rate);
    const mult = num(v.mult);
    const tax = num(v.tax);
    const costs = num(v.costs);
    if (hours === null || rate === null || mult === null || tax === null || costs === null) return { net: null };
    if (hours <= 0 || rate < 0 || mult < 0 || tax < 0 || tax > 100 || costs < 0) return { net: null };
    const gross = hours * rate * mult;
    const afterTax = gross * (1 - tax / 100);
    const net = afterTax - costs;
    const netHour = net / hours;
    const regHour = rate * (1 - tax / 100);
    const delta = net - regHour * hours;
    const worth = netHour > regHour;
    return {
      net,
      gross,
      afterTax,
      netHour,
      regHour,
      tone: worth ? 'good' : 'warn',
      badge: `${money(netHour)} an hour net`,
      note: worth
        ? `After ${fmt(tax)}% tax and ${money(costs)} of costs, the shift pays ${money(netHour)} an hour against ${money(regHour)} on a regular day, which is ${money(delta)} more over the shift. Time with family is not priced.`
        : `After ${fmt(tax)}% tax and ${money(costs)} of costs, the shift pays ${money(netHour)} an hour against ${money(regHour)} on a regular day, which is ${money(-delta)} less over the shift. Time with family is not priced.`,
      chart: {
        type: 'bar' as const,
        title: 'Net pay per hour',
        categories: ['Holiday shift', 'Regular shift'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Per hour', values: [netHour, regHour] }],
      },
      steps: [
        `Gross = ${fmt(hours)} × ${money(rate)} × ${fmt(mult)} = ${money(gross)}`,
        `After tax = ${money(gross)} × (1 − ${fmt(tax)}%) = ${money(afterTax)}`,
        `Net = ${money(afterTax)} − ${money(costs)} = ${money(net)}; per hour = ${money(netHour)}`,
        `Regular after-tax hourly = ${money(rate)} × (1 − ${fmt(tax)}%) = ${money(regHour)}`,
      ],
    };
  },
  content: {
    formula: [
      'Gross = hours × base rate × multiplier',
      'Net = gross × (1 − tax share) − extra costs',
      'Net per hour = net ÷ hours',
      'Regular after-tax hourly = base rate × (1 − tax share)',
    ],
    body: [
      'Holiday premium pay looks generous, but childcare, travel and tax can eat into it. This calculator compares what you keep per hour on the holiday shift with what you keep on a regular day, so you can see whether the premium really pays.',
      'Example: 8 hours at $20 with a 1.5 multiplier is $240 gross. With 15% tax that is $204, and after $40 of extra costs you keep $164.00, or $20.50 an hour against $17.00 on a regular day. With 10 hours at $18, a 2.0 multiplier, 22% tax and $60 of costs, you keep $220.80, or $22.08 an hour against $14.04.',
      'Your employer sets the multiplier and whether a paid holiday is a separate benefit, so enter what your policy says. The tax rate is an estimate of what applies to this pay. Time with family is not priced. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Is working a holiday worth it?', a: 'It is when your net pay per hour beats a regular after-tax hour. With 8 hours at $20, 1.5x, 15% tax and $40 of costs you keep $20.50 an hour against $17.00.' },
      { q: 'How is holiday pay calculated?', a: 'Hours × base rate × multiplier, then tax comes off. 8 × $20 × 1.5 = $240, or $204 after 15% tax.' },
      { q: 'What counts as extra costs?', a: 'Anything you pay only because you work that day, such as childcare, travel or meals. Enter the total in dollars.' },
      { q: 'What multiplier should I use?', a: 'Use the one in your employer policy or contract, for example 1.5 or 2. It is not built in because it varies.' },
      { q: 'Does this include a separate paid holiday?', a: 'No. If you also get a paid holiday benefit, that is outside this calculation.' },
    ],
    sources: [],
  },
  related: ['overtime-pay', 'hours-of-work-cost', 'real-hourly-wage'],
  examples: [
    // gross 8*20*1.5 = 240; after tax 204; net 164; /8 = 20.5; regular 20*.85 = 17
    { values: { hours: 8, rate: 20, mult: 1.5, tax: 15, costs: 40 }, expect: { gross: 240, afterTax: 204, net: 164, netHour: 20.5, regHour: 17 }, tolerance: 1e-9 },
    // gross 10*18*2 = 360; *.78 = 280.8; net 220.8; /10 = 22.08; regular 18*.78 = 14.04
    { values: { hours: 10, rate: 18, mult: 2, tax: 22, costs: 60 }, expect: { gross: 360, afterTax: 280.8, net: 220.8, netHour: 22.08, regHour: 14.04 }, tolerance: 1e-9 },
  ],
});
