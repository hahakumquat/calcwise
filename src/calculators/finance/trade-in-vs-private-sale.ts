import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'trade-in-vs-private-sale',
  title: 'Trade-In vs Private Sale: Net Difference',
  category: 'finance',
  description: 'Compare a dealer trade-in offer with selling your car privately. Includes selling costs, a sales tax credit option and the value of your time.',
  keywords: ['trade in vs private sale calculator', 'should i trade in or sell my car', 'trade-in vs sell privately', 'private sale vs trade in value', 'sell car privately or trade in'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'offer', label: 'Dealer trade-in offer', type: 'number', prefix: '$', default: 14000, min: 0, step: 250, info: 'The written offer from the dealer for your car.' },
    { id: 'price', label: 'Private sale price', type: 'number', prefix: '$', default: 15500, min: 0, step: 250, info: 'The price you expect a private buyer to pay.' },
    { id: 'costs', label: 'Selling costs', type: 'number', prefix: '$', default: 200, min: 0, step: 50, info: 'Detailing, small repairs, listing fees and anything else you pay to sell it yourself.' },
    { id: 'tax', label: 'Sales tax rate', type: 'number', default: 6, min: 0, max: 15, step: 0.25, suffix: '%', info: 'The sales tax rate on the car you are buying.' },
    {
      id: 'credit',
      label: 'Does your state tax only the difference on a trade-in?',
      type: 'select',
      default: 'yes',
      options: [
        { value: 'yes', label: 'Yes, trade-in lowers my sales tax' },
        { value: 'no', label: 'No tax credit on trade-ins' },
      ],
      info: 'Many states, not all, give a sales tax credit on the trade-in value. Check your state revenue or DMV site.',
    },
    { id: 'hours', label: 'Hours you would spend selling', type: 'number', default: 8, min: 0, step: 1, info: 'Photos, messages, test drives and paperwork.' },
    { id: 'rate', label: 'Value of an hour', type: 'number', prefix: '$', default: 20, min: 0, step: 5, info: 'What your time is worth to you. Use 0 to ignore time.' },
  ],
  outputs: [
    { id: 'after', label: 'Private sale ahead, after your time', format: 'currency', precision: 2, primary: true, info: 'Difference minus hours × value of an hour. Negative means the trade-in wins.' },
    { id: 'diff', label: 'Private sale ahead, before time', format: 'currency', precision: 2, info: 'Private net − trade-in value.' },
    { id: 'tradeValue', label: 'Trade-in value with tax credit', format: 'currency', precision: 2, info: 'Offer plus the sales tax saved, if your state gives a credit.' },
    { id: 'privateNet', label: 'Private sale net', format: 'currency', precision: 2, info: 'Price − selling costs.' },
  ],
  compute: (v) => {
    const offer = num(v.offer);
    const price = num(v.price);
    const costs = num(v.costs);
    const tax = num(v.tax);
    const hours = num(v.hours);
    const rate = num(v.rate);
    if (offer === null || price === null || costs === null || tax === null || hours === null || rate === null) return { after: null };
    if (offer < 0 || price < 0 || costs < 0 || tax < 0 || hours < 0 || rate < 0) return { after: null };
    const credit = v.credit !== 'no';
    const taxSaved = credit ? offer * (tax / 100) : 0;
    const tradeValue = offer + taxSaved;
    const privateNet = price - costs;
    const diff = privateNet - tradeValue;
    const timeCost = hours * rate;
    const after = diff - timeCost;
    const privateWins = after > 0;
    const even = Math.abs(after) < 0.005;
    return {
      after,
      diff,
      tradeValue,
      privateNet,
      tone: even ? 'ok' : privateWins ? 'good' : 'warn',
      badge: even ? 'About even' : privateWins ? `Private sale wins by ${money(after)}` : `Trade-in wins by ${money(-after)}`,
      note: `Trade-in is worth ${money(tradeValue)}${credit ? ` (${money(offer)} plus ${money(taxSaved)} of sales tax saved)` : ''}. Selling privately nets ${money(privateNet)}. That is ${money(diff)} ${diff >= 0 ? 'ahead' : 'behind'} before your time, and ${money(after)} after ${fmt(hours, 1)} hours at ${money(rate)}. Sales tax rules vary by state.`,
      chart: {
        type: 'bar' as const,
        title: 'What you end up with',
        categories: ['Trade-in', 'Private sale', 'Private, after time'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Value', values: [tradeValue, privateNet, privateNet - timeCost] }],
      },
      steps: [
        `Trade-in value = ${money(offer)}${credit ? ` + ${money(offer)} × ${fmt(tax)}%` : ''} = ${money(tradeValue)}`,
        `Private net = ${money(price)} − ${money(costs)} = ${money(privateNet)}`,
        `Difference = ${money(privateNet)} − ${money(tradeValue)} = ${money(diff)}`,
        `After time = ${money(diff)} − ${fmt(hours, 1)} × ${money(rate)} = ${money(after)}`,
      ],
    };
  },
  content: {
    formula: [
      'Trade-in value = offer + (offer × sales tax rate, if your state gives a credit)',
      'Private net = private price − selling costs',
      'Difference = private net − trade-in value',
      'After time = difference − hours × value of an hour',
    ],
    body: [
      'A dealer usually offers less than a private buyer will pay, but a trade-in is quick and in many states lowers the sales tax on your next car. This calculator puts both on one scale so you can see whether the extra work of a private sale pays.',
      'Example: a $14,000 offer, a $15,500 private price and $200 of selling costs. With a 6% sales tax credit the trade-in is worth 14,000 + 840 = $14,840. The private sale nets 15,500 − 200 = $15,300, which is $460 ahead. Eight hours at $20 an hour is $160, so the private sale is $300 ahead after your time.',
      'Sales tax rules differ by state, so the credit is a choice you make. Check your state revenue or DMV site. The tool does not model price haggling, a buyer who backs out, or risks of a private sale such as payment fraud. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'Is it better to trade in or sell privately?', a: 'Selling privately usually nets more money, but costs time and effort. Compare the difference after selling costs, sales tax credit and your time.' },
      { q: 'What is the sales tax credit on a trade-in?', a: 'In many states you pay sales tax only on the price difference, so a trade-in saves offer × tax rate. Some states do not do this. Use the toggle that matches yours.' },
      { q: 'What counts as selling costs?', a: 'Detailing, small repairs, listing fees and anything else you pay to prepare and advertise the car.' },
      { q: 'Should I count my time?', a: 'It is your call. Set the value of an hour to 0 to ignore time, or to what you would earn or value that time at.' },
      { q: 'What if I still owe money on the car?', a: 'This tool compares sale values only. Any loan payoff is the same either way, but check with your lender how a private sale pays it off.' },
    ],
    sources: [],
  },
  related: ['auto-loan', 'keep-vs-replace-car', 'car-affordability', 'sales-tax'],
  examples: [
    // tradeValue 14000+840=14840; privateNet 15300; diff 460; after 460-160=300
    { values: { offer: 14000, price: 15500, costs: 200, tax: 6, credit: 'yes', hours: 8, rate: 20 }, expect: { tradeValue: 14840, privateNet: 15300, diff: 460, after: 300 } },
    // no credit: tradeValue 14000; privateNet 15300; diff 1300; after 1300-0=1300
    { values: { offer: 14000, price: 15500, costs: 200, tax: 6, credit: 'no', hours: 8, rate: 0 }, expect: { tradeValue: 14000, privateNet: 15300, diff: 1300, after: 1300 } },
  ],
});
