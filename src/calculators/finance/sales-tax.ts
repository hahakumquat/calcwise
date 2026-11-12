import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'sales-tax',
  title: 'Sales Tax Calculator',
  category: 'finance',
  description: 'Add sales tax to a price, or back the tax out of a total that already includes it.',
  keywords: ['sales tax', 'tax on purchase', 'price with tax', 'reverse sales tax', 'before tax price', 'VAT', 'GST'],
  popular: true,
  inputs: [
    {
      id: 'mode',
      info: 'Add tax to a pre-tax price, or work out the pre-tax price from a total that already includes tax.',
      label: 'I want to',
      type: 'select',
      segmented: true,
      default: 'add',
      options: [
        { value: 'add', label: 'Add tax to a price' },
        { value: 'remove', label: 'Remove tax from a total' },
      ],
    },
    { id: 'price', label: 'Price before tax', type: 'number', prefix: '$', default: 100, min: 0, showWhen: { input: 'mode', is: 'add' }, info: 'The sticker or shelf price of the item, before any sales tax is added.' },
    { id: 'paid', label: 'Total including tax', type: 'number', prefix: '$', default: 108.25, min: 0, showWhen: { input: 'mode', is: 'remove' }, info: 'The amount you paid or the receipt total, which already includes sales tax.' },
    { id: 'rate', label: 'Sales tax rate', type: 'number', suffix: '%', default: 8.25, min: 0, max: 100, step: 0.025, info: 'Your combined state and local sales tax rate. Receipts and state revenue websites show it.' },
  ],
  outputs: [
    { id: 'total', label: 'Total with tax', format: 'currency', primary: true, showWhen: { input: 'mode', is: 'add' }, info: 'What you pay at the register: the price plus sales tax.' },
    { id: 'beforeTax', label: 'Price before tax', format: 'currency', primary: true, showWhen: { input: 'mode', is: 'remove' }, info: 'The item price before sales tax was added to your total.' },
    { id: 'tax', label: 'Sales tax', format: 'currency', info: 'The dollar amount of sales tax included in, or added to, the price.' },
  ],
  compute: (v) => {
    const remove = v.mode === 'remove';
    const amount = remove ? num(v.paid) : num(v.price);
    const rate = num(v.rate);
    if (amount === null || rate === null || amount < 0 || rate < 0) return remove ? { beforeTax: null } : { total: null };
    const r = rate / 100;
    const donut = (price: number, tax: number) => moneyDonut('Total paid', [{ label: 'Price', value: price }, { label: 'Sales tax', value: tax }], money(price + tax), 'total');
    if (remove) {
      const beforeTax = amount / (1 + r);
      const tax = amount - beforeTax;
      return {
        beforeTax,
        tax,
        chart: donut(beforeTax, tax),
        steps: [`Price before tax = ${money(amount)} ÷ (1 + ${rate}%) = ${money(beforeTax)}`, `Tax = ${money(amount)} − ${money(beforeTax)} = ${money(tax)}`],
        note: `${money(amount)} includes ${money(tax)} of tax; the item price is ${money(beforeTax)}.`,
      };
    }
    const tax = amount * r;
    return {
      total: amount + tax,
      tax,
      chart: donut(amount, tax),
      steps: [`Tax = ${money(amount)} × ${rate}% = ${money(tax)}`, `Total = ${money(amount)} + ${money(tax)} = ${money(amount + tax)}`],
      note: `You will pay ${money(amount + tax)} including ${money(tax)} of sales tax.`,
    };
  },
  content: {
    formula: ['Tax = price × rate', 'Total = price × (1 + rate)', 'Price before tax = total ÷ (1 + rate)'],
    body: [
      'Sales tax in the United States is set by states, counties and cities, and the combined rate where you shop is what applies. State rates range from 0% to 7.25%, and local add-ons push combined rates above 9% in some places. Five states — Alaska, Delaware, Montana, New Hampshire and Oregon — have no statewide sales tax, though Alaska allows local ones.',
      'To back the tax out of a receipt total, divide by one plus the rate rather than subtracting the rate from the total. Subtracting 8% from $108 gives $99.36, but the real pre-tax price is $108 ÷ 1.08 = $100.',
      'Many states exempt or reduce tax on groceries, prescription drugs and clothing, so the right rate depends on what you are buying. The same calculation works for VAT or GST in other countries.',
    ],
    faq: [
      { q: 'How do I find my local sales tax rate?', a: 'Your state revenue department publishes rates by address or ZIP code. Receipts from local stores also show the combined rate.' },
      { q: 'Is sales tax charged on online purchases?', a: 'Usually yes. Since 2018 states can require online sellers to collect sales tax based on where the item is shipped, and all states with a sales tax now do.' },
      { q: 'Is sales tax deductible?', a: 'If you itemize on your federal return you can deduct either state income tax or sales tax, within the overall cap on state and local tax deductions.' },
    ],
  },
  related: ['discount', 'percentage', 'auto-loan', 'markup'],
  examples: [
    { values: { mode: 'add', price: 100, paid: null, rate: 8.25 }, expect: { total: 108.25, tax: 8.25 } },
    { values: { mode: 'remove', price: null, paid: 108, rate: 8 }, expect: { beforeTax: 100, tax: 8 } },
  ],
});
