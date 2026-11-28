import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'gifted-stock-basis',
  title: 'Gifted Stock Basis: Dual-Basis Gain or Loss',
  category: 'finance',
  description: 'Selling gifted stock? Enter the donor cost, value at the gift and your sale price to see the taxable gain, loss or neither under the dual-basis rule.',
  keywords: ['gifted stock basis calculator', 'dual basis rule', 'carryover basis gift', 'sell gifted stock tax', 'IRC 1015 gift basis'],
  updated: '2026-11-28',
  inputs: [
    { id: 'shares', label: 'Shares received', type: 'number', default: 100, min: 0, step: 1, info: 'Number of gifted shares you are selling.' },
    { id: 'cost', label: 'Donor cost per share', type: 'number', prefix: '$', default: 50, min: 0, step: 0.5, help: 'What the person who gave you the stock paid.', info: 'The donor\'s adjusted basis. Ask the donor or check their brokerage records.' },
    { id: 'fmv', label: 'Value per share at the gift', type: 'number', prefix: '$', default: 30, min: 0, step: 0.5, help: 'Fair market value on the date of the gift.', info: 'Usually the average of the day\'s high and low. Check the gift paperwork.' },
    { id: 'sale', label: 'Sale price per share', type: 'number', prefix: '$', default: 60, min: 0, step: 0.5, info: 'What you sell for, per share.' },
  ],
  outputs: [
    { id: 'result', label: 'Taxable gain (+) or loss (−)', format: 'currency', primary: true, info: 'Gain over the donor cost, or loss below the lower of donor cost and value at the gift. Zero in the gap between them.' },
    { id: 'outcome', label: 'Outcome', format: 'text', info: 'Whether the sale is a gain, a loss, or neither.' },
    { id: 'gainBasis', label: 'Basis for a gain', format: 'currency', info: 'Donor cost × shares. Used when you sell above the donor cost.' },
    { id: 'lossBasis', label: 'Basis for a loss', format: 'currency', info: 'The lower of donor cost and value at the gift, × shares. Used when you sell below it.' },
  ],
  compute: (v) => {
    const shares = num(v.shares), cost = num(v.cost), fmv = num(v.fmv), sale = num(v.sale);
    if (shares === null || cost === null || fmv === null || sale === null) return { result: null };
    if (shares < 0 || cost < 0 || fmv < 0 || sale < 0) return { result: null };

    const lossPer = Math.min(cost, fmv);
    const gainBasis = cost * shares;
    const lossBasis = lossPer * shares;
    let result = 0;
    let outcome = 'No gain or loss';
    if (sale > cost) { result = (sale - cost) * shares; outcome = 'Taxable gain'; }
    else if (sale < lossPer) { result = (sale - lossPer) * shares; outcome = 'Capital loss'; }

    const top = Math.max(cost, fmv, sale) * 2 || 1;
    const x: number[] = [], y: number[] = [];
    for (let i = 0; i <= 40; i++) {
      const p = (top * i) / 40;
      x.push(+p.toFixed(2));
      y.push(p > cost ? (p - cost) * shares : p < lossPer ? (p - lossPer) * shares : 0);
    }

    const dual = fmv < cost;
    return {
      result, outcome, gainBasis, lossBasis,
      tone: result > 0 ? 'warn' : result < 0 ? 'ok' : 'good',
      badge: outcome,
      chart: [{ type: 'line', title: 'Gain or loss by sale price', x, xLabel: 'Sale price per share ($)', yFormat: CURRENCY, series: [{ name: 'Gain or loss', values: y }], markers: dual ? [{ x: fmv, label: 'Value at gift' }, { x: cost, label: 'Donor cost' }] : [{ x: cost, label: 'Donor cost' }] }],
      steps: [
        dual
          ? `Value at gift ${money(fmv)} is below donor cost ${money(cost)}, so there are two bases: ${money(cost)} for a gain and ${money(fmv)} for a loss.`
          : `Value at gift ${money(fmv)} is not below donor cost ${money(cost)}, so one basis applies: ${money(cost)}.`,
        sale > cost
          ? `Sale ${money(sale)} is above ${money(cost)}: gain = (${money(sale)} − ${money(cost)}) × ${shares} = ${money(result)}`
          : sale < lossPer
            ? `Sale ${money(sale)} is below ${money(lossPer)}: loss = (${money(sale)} − ${money(lossPer)}) × ${shares} = ${money(result)}`
            : `Sale ${money(sale)} is between ${money(lossPer)} and ${money(cost)}: no gain and no loss.`,
      ],
      note: 'Federal rules only. This does not add back any gift tax the donor paid, which can raise the basis for a gain, and it does not work out the tax rate or holding period. Not tax advice.',
    };
  },
  content: {
    formula: [
      'Gain if sale price > donor cost: (sale − donor cost) × shares',
      'Loss if sale price < lower of donor cost and value at gift: (sale − that lower value) × shares',
      'Otherwise: no gain and no loss',
    ],
    body: [
      'When someone gives you stock, you usually take over their cost basis ("carryover basis") instead of getting a fresh one at the value on the day of the gift. That is the opposite of inherited stock, which gets a step-up.',
      'There is one twist. If the stock was worth less than the donor paid on the day of the gift, the rule splits in two: the donor\'s cost is used to figure a gain, and the lower value at the gift is used to figure a loss. Sell in between and you report neither.',
      'This calculator applies that rule to your numbers. It does not add back any gift tax the donor paid, and it does not pick a tax rate or holding period. See IRS Publication 551 or a tax professional.',
    ],
    sections: [
      {
        heading: 'What to ask the donor',
        paragraphs: ['You need the donor\'s original cost and the date they bought the shares, plus the value on the gift date. Ask for these now, since brokerage records can be hard to find later.'],
      },
    ],
    faq: [
      { q: 'What is the result for 100 shares, donor cost $50, value at gift $30, sold at $60?', a: 'The sale is above the donor cost, so the gain is ($60 − $50) × 100 = $1,000.00.' },
      { q: 'What if the same shares sell at $40?', a: '$40 sits between the value at the gift ($30) and the donor cost ($50), so there is no gain and no loss: $0.00.' },
      { q: 'And if they sell at $20?', a: 'The sale is below the value at the gift, so the loss is ($20 − $30) × 100 = −$1,000.00. The donor\'s higher cost does not help you.' },
      { q: 'What if the stock was worth more than the donor paid?', a: 'Then there is one basis, the donor cost. With cost $20, value at gift $80 and a sale at $85 on 100 shares, the gain is $6,500.00, not $500.00.' },
      { q: 'Does this include gift tax the donor paid?', a: 'No. Gift tax paid can increase the basis for a gain in some cases. That adjustment is not included here.' },
    ],
    sources: [
      { label: 'IRS Publication 551: Basis of Assets', url: 'https://www.irs.gov/publications/p551' },
    ],
  },
  related: ['inherited-stock-basis', 'average-cost-basis', 'capital-gains-tax', 'capital-loss-carryover', 'donate-stock-vs-cash'],
  examples: [
    { // Sale 60 > cost 50: (60-50)×100 = 1,000. Gain basis 5,000; loss basis min(50,30)×100 = 3,000.
      values: { shares: 100, cost: 50, fmv: 30, sale: 60 },
      expect: { result: 1000, gainBasis: 5000, lossBasis: 3000 },
      tolerance: 1e-6,
    },
    { // Sale 40 between 30 and 50: 0.
      values: { shares: 100, cost: 50, fmv: 30, sale: 40 },
      expect: { result: 0 },
      tolerance: 1e-6,
    },
    { // Sale 20 < 30: (20-30)×100 = -1,000.
      values: { shares: 100, cost: 50, fmv: 30, sale: 20 },
      expect: { result: -1000 },
      tolerance: 1e-6,
    },
    { // FMV 80 >= cost 20: single basis 20. (85-20)×100 = 6,500.
      values: { shares: 100, cost: 20, fmv: 80, sale: 85 },
      expect: { result: 6500, lossBasis: 2000 },
      tolerance: 1e-6,
    },
  ],
});
