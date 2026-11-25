import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

const pct = (x: number) => String(Math.round(x * 1000) / 1000);

export default defineCalculator({
  slug: 'use-tax-online-purchases',
  title: 'Use Tax Calculator for Online Purchases',
  category: 'finance',
  description: 'Estimate the use tax you may owe on out-of-state or online purchases where no sales tax was charged. Enter your state and local rates and any tax already paid.',
  keywords: ['use tax calculator', 'use tax online purchases', 'out of state purchase tax', 'state use tax', 'sales tax not charged'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'total', label: 'Purchases with no sales tax charged', type: 'number', prefix: '$', default: 1200, min: 0, step: 50, info: 'Total price of items where the seller did not collect your state sales tax.' },
    { id: 'stateRate', label: 'State rate', type: 'number', suffix: '%', default: 6, min: 0, max: 100, step: 0.1, info: 'Your state sales and use tax rate. Look it up on your state revenue site.' },
    { id: 'localRate', label: 'Local rate', type: 'number', suffix: '%', default: 1.5, min: 0, max: 100, step: 0.1, info: 'City or county rate, if your state adds one. Use 0 if none.' },
    { id: 'paid', label: 'Tax already paid on these items', type: 'number', prefix: '$', default: 0, min: 0, step: 5, info: 'Dollars of sales tax another state or the seller already charged. Usually credited against use tax.' },
  ],
  outputs: [
    { id: 'owed', label: 'Use tax owed', format: 'currency', precision: 2, primary: true, info: 'Full use tax minus tax already paid, never below zero.' },
    { id: 'full', label: 'Full use tax before credit', format: 'currency', precision: 2, info: 'Purchases × (state + local rate).' },
    { id: 'rate', label: 'Combined rate', format: 'number', suffix: '%', precision: 2, info: 'State rate plus local rate.' },
  ],
  compute: (v) => {
    const t = num(v.total);
    const s = num(v.stateRate);
    const l = num(v.localRate);
    const p = num(v.paid);
    if ([t, s, l, p].some((x) => x === null)) return { owed: null };
    if ([t, s, l, p].some((x) => (x as number) < 0)) return { owed: null, error: 'Values cannot be negative.' };
    const rate = s! + l!;
    const full = t! * rate / 100;
    const owed = Math.max(0, full - p!);
    const credited = Math.min(full, p!);
    return {
      owed,
      full,
      rate,
      tone: owed > 0 ? 'warn' : 'good',
      badge: owed > 0 ? `${money(owed)} use tax` : 'No use tax owed',
      note: `${money(t!)} at ${pct(rate)}% is ${money(full)}${p! > 0 ? `, less ${money(credited)} already paid` : ''}. Rules, thresholds and credits vary by state, and the rates are the ones you entered.`,
      chart: {
        type: 'bar' as const,
        title: 'Use tax before and after credit',
        categories: ['Full use tax', 'Already paid', 'Owed'],
        series: [{ name: 'Amount', values: [full, credited, owed] }],
        format: CURRENCY,
      },
      steps: [
        `Combined rate = ${pct(s!)}% + ${pct(l!)}% = ${pct(rate)}%`,
        `Full use tax = ${money(t!)} × ${pct(rate)}% = ${money(full)}`,
        `Owed = ${money(full)} − ${money(credited)} = ${money(owed)}`,
      ],
    };
  },
  content: {
    formula: [
      'Combined rate = state rate + local rate',
      'Full use tax = purchases × combined rate',
      'Use tax owed = full use tax − tax already paid (not below 0)',
    ],
    body: [
      'Use tax is the counterpart of sales tax. If you buy something and the seller does not charge your state sales tax, many states expect you to report and pay the same tax yourself, often on your state income tax return.',
      'Example: $1,200 of purchases at 6% state plus 1.5% local is 7.5%, or $90. If $30 of tax was already paid on those items, you owe $60.',
      'Many sellers now collect tax automatically, so you may owe little. Rules, filing methods and small-purchase shortcuts differ by state, so check your state revenue department. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is use tax?', a: 'It is a tax on items you use in your state when no sales tax was collected at purchase, such as some online or out-of-state buys. It usually matches your state and local sales tax rate.' },
      { q: 'How do I calculate use tax?', a: 'Multiply untaxed purchases by your combined state and local rate, then subtract any sales tax already paid on those items.' },
      { q: 'What is the use tax on $1,200 at 7.5%?', a: 'It is $90. If $30 of tax was already paid, you owe $60.' },
      { q: 'Where do I pay use tax?', a: 'Most states let you report it on the state income tax return or on a separate form. Check your state revenue department for the method.' },
      { q: 'Does it work if tax was charged by another state?', a: 'Enter the dollars already paid and the calculator subtracts them. Whether your state gives full credit varies, so confirm locally.' },
    ],
    sources: [
      { label: 'Streamlined Sales Tax Governing Board: State information', url: 'https://www.streamlinedsalestax.org/' },
      { label: 'Federation of Tax Administrators: State sales tax rates', url: 'https://taxadmin.org/' },
    ],
  },
  related: ['sales-tax', 'tax-refund-estimator', 'income-tax'],
  examples: [
    // 7.5% of 1200 = 90; owed 90
    { values: { total: 1200, stateRate: 6, localRate: 1.5, paid: 0 }, expect: { full: 90, rate: 7.5, owed: 90 } },
    // with 30 paid -> 60
    { values: { total: 1200, stateRate: 6, localRate: 1.5, paid: 30 }, expect: { full: 90, owed: 60 } },
    // credit exceeds full: 500 * 5% = 25, paid 40 -> 0
    { values: { total: 500, stateRate: 5, localRate: 0, paid: 40 }, expect: { full: 25, owed: 0 } },
  ],
});
