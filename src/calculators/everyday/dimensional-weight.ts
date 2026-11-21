import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'dimensional-weight',
  title: 'Dimensional Weight Calculator: Billable Weight',
  category: 'everyday',
  description: 'Work out the dimensional weight of a package from its size, compare it with the actual weight, and see the billable weight carriers charge for.',
  keywords: ['dimensional weight calculator', 'dim weight calculator', 'billable weight shipping', 'package dimensional weight', 'shipping box size cost', 'ups fedex dim weight'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'length', label: 'Length', type: 'number', suffix: 'in', default: 20, min: 0.1, step: 0.5, info: 'Longest side of the box in inches. Measure the outside, rounded up.' },
    { id: 'width', label: 'Width', type: 'number', suffix: 'in', default: 14, min: 0.1, step: 0.5, info: 'Second side in inches.' },
    { id: 'height', label: 'Height', type: 'number', suffix: 'in', default: 10, min: 0.1, step: 0.5, info: 'Third side in inches.' },
    { id: 'weight', label: 'Actual weight', type: 'number', suffix: 'lb', default: 12, min: 0, step: 0.5, info: 'What the packed box weighs on a scale.' },
    { id: 'divisor', label: 'Carrier divisor', type: 'number', default: 139, min: 1, step: 1, help: '139 is common for US carriers; check your carrier.', info: 'Cubic inches per pound that your carrier uses. Many US domestic services use 139, but it varies by carrier, service and year, so confirm it.' },
    { id: 'rate', label: 'Rate per billable lb', type: 'number', prefix: '$', default: 0, min: 0, step: 0.1, optional: true, info: 'Optional. A flat per-pound rate to estimate cost. Real rates come in zone tables, so treat this as a rough guide.' },
  ],
  outputs: [
    { id: 'billable', label: 'Billable weight', format: 'integer', suffix: 'lb', primary: true, info: 'The larger of actual and dimensional weight, rounded up to the next whole pound.' },
    { id: 'dim', label: 'Dimensional weight', format: 'number', suffix: 'lb', info: 'Length × width × height ÷ divisor.' },
    { id: 'cost', label: 'Estimated cost', format: 'currency', info: 'Billable weight × rate per lb.' },
  ],
  compute: (v) => {
    const l = num(v.length);
    const w = num(v.width);
    const h = num(v.height);
    const wt = num(v.weight);
    const div = num(v.divisor);
    const rate = num(v.rate) ?? 0;
    if (l === null || w === null || h === null || wt === null || div === null) return { billable: null };
    if (l <= 0 || w <= 0 || h <= 0 || wt < 0 || div <= 0 || rate < 0) return { billable: null };

    const volume = l * w * h;
    const dim = volume / div;
    const useDim = dim > wt;
    const billable = Math.ceil(Math.max(wt, dim) - 1e-9);
    const cost = billable * rate;

    return {
      billable,
      dim,
      cost,
      tone: useDim ? 'warn' : 'good',
      badge: useDim ? 'Billed by size' : 'Billed by weight',
      chart: {
        type: 'bar',
        title: 'Actual vs dimensional weight (lb)',
        categories: ['Actual', 'Dimensional'],
        series: [{ name: 'Pounds', values: [wt, +dim.toFixed(2)] }],
        format: { format: 'number' },
        highlight: useDim ? 1 : 0,
      },
      steps: [
        `Volume = ${l} × ${w} × ${h} = ${+volume.toFixed(2)} cubic inches`,
        `Dimensional weight = ${+volume.toFixed(2)} ÷ ${div} = ${+dim.toFixed(2)} lb`,
        `Larger of actual (${wt} lb) and dimensional (${+dim.toFixed(2)} lb) = ${+Math.max(wt, dim).toFixed(2)} lb, rounded up to ${billable} lb`,
        ...(rate > 0 ? [`Cost = ${billable} × ${money(rate, 2)} = ${money(cost, 2)}`] : []),
      ],
      note: useDim
        ? 'The box is billed by its size, not its weight. A smaller box, or less empty space around the item, can lower the bill.'
        : 'The package is heavy for its size, so it is billed by actual weight.',
    };
  },
  content: {
    formula: [
      'Dimensional weight = length × width × height (inches) ÷ divisor',
      'Billable weight = the larger of actual weight and dimensional weight, rounded up to a whole pound',
      'Cost = billable weight × rate per pound',
    ],
    body: [
      'Carriers charge for the space a package takes in the truck or plane as well as its weight. A big, light box can cost more to ship than a small, heavy one. The result is called dimensional (dim) weight, and you pay for whichever is greater, actual or dimensional.',
      'Enter the box size, its weight and your carrier\'s divisor. The divisor is the number of cubic inches counted as one pound. Many US domestic services use 139, but carriers, services and international shipments differ, so check the one you use.',
      'If dimensional weight wins, try a smaller box or less padding. Shaving an inch or two off one side can cut a pound or more, which is useful during the holiday shipping rush.',
    ],
    sections: [],
    faq: [
      { q: 'What is the dimensional weight of a 20 x 14 x 10 inch box?', a: '20 × 14 × 10 = 2,800 cubic inches. Divided by 139 that is 20.14 lb. At 12 lb actual, it is billed at 21 lb.' },
      { q: 'When is actual weight used instead?', a: 'When it is higher. A 12 x 10 x 8 box is 960 ÷ 139 = 6.91 lb, so a 9 lb package is billed at 9 lb.' },
      { q: 'Why round up?', a: 'Carriers generally bill in whole pounds, so any fraction goes up to the next pound.' },
      { q: 'Is 139 always the divisor?', a: 'No. It is common for US domestic shipping, but it varies by carrier and service. Enter the figure your carrier publishes.' },
      { q: 'How do I lower the cost?', a: 'Use the smallest box that protects the item, or pick a service with a larger divisor.' },
    ],
    sources: [
      { label: 'UPS: Dimensional weight pricing', url: 'https://www.ups.com/us/en/support/shipping-support/shipping-special-care-regulations/dimensional-weight.page' },
    ],
  },
  related: ['weight-converter', 'volume', 'unit-price', 'trip-budget'],
  examples: [
    {
      // 20 × 14 × 10 = 2,800; 2,800 / 139 = 20.1439 lb; actual 12 -> billable ceil(20.14) = 21.
      values: { length: 20, width: 14, height: 10, weight: 12, divisor: 139, rate: 0 },
      expect: { billable: 21, dim: 20.1439 },
      tolerance: 0.001,
    },
    {
      // 12 × 10 × 8 = 960; 960 / 139 = 6.9065; actual 9 -> billable 9; cost 9 × 1.5 = 13.5.
      values: { length: 12, width: 10, height: 8, weight: 9, divisor: 139, rate: 1.5 },
      expect: { billable: 9, dim: 6.9065, cost: 13.5 },
      tolerance: 0.001,
    },
  ],
});
