import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'hsa-prorated-limit',
  title: 'HSA Prorated Limit: Room Left Mid-Year',
  category: 'finance',
  description: 'Find your HSA contribution room when your coverage started mid-year. Compare the monthly prorated limit with the full-year last-month rule.',
  keywords: ['hsa prorated limit calculator', 'hsa contribution mid year', 'hsa last month rule', 'hsa testing period', 'how much can I put in my hsa this year'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'limit', label: 'Full-year HSA limit', type: 'number', prefix: '$', default: 4400, min: 0, step: 50, info: 'The IRS limit for your coverage type (self-only or family), plus any catch-up if you are 55 or older. Check the current IRS figure.' },
    { id: 'months', label: 'Months with HSA-eligible coverage', type: 'number', default: 5, min: 0, max: 12, step: 1, info: 'Count each month you were covered by a qualifying high-deductible plan on the first day of the month.' },
    { id: 'contributed', label: 'Already contributed this year', type: 'number', prefix: '$', default: 1200, min: 0, step: 100, info: 'Your contributions plus your employer’s, for this tax year.' },
    {
      id: 'dec1',
      label: 'Covered on December 1?',
      type: 'select',
      segmented: true,
      default: 'yes',
      options: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
      ],
      info: 'If you are eligible on Dec 1, the last-month rule lets you contribute the full-year limit, if you stay eligible through the testing period.',
    },
  ],
  outputs: [
    { id: 'room', label: 'Room left (prorated)', format: 'currency', precision: 2, primary: true, info: 'Prorated limit − contributed, never below zero.' },
    { id: 'prorated', label: 'Prorated limit', format: 'currency', precision: 2, info: 'Full-year limit × eligible months ÷ 12.' },
    { id: 'lastMonthRoom', label: 'Room left (last-month rule)', format: 'currency', precision: 2, info: 'Full-year limit − contributed. Only available if you were covered on Dec 1 and stay eligible for the testing period.' },
  ],
  compute: (v) => {
    const limit = num(v.limit);
    const months = num(v.months);
    const paid = num(v.contributed);
    if ([limit, months, paid].some((x) => x === null)) return { room: null };
    if (limit! < 0 || paid! < 0 || months! < 0 || months! > 12) return { room: null };
    const m = Math.floor(months!);
    const prorated = (limit! * m) / 12;
    const room = Math.max(0, prorated - paid!);
    const full = Math.max(0, limit! - paid!);
    const eligibleDec1 = v.dec1 !== 'no';
    const best = eligibleDec1 ? full : room;
    return {
      room: eligibleDec1 ? full : room,
      prorated,
      lastMonthRoom: full,
      tone: best > 0 ? 'good' : 'warn',
      badge: eligibleDec1 ? `Up to ${money(full)} with the last-month rule` : `${money(room)} of room left`,
      note: eligibleDec1
        ? `Prorated, your limit is ${money(prorated)} for ${m} month${m === 1 ? '' : 's'}, leaving ${money(room)}. Because you are covered on Dec 1, the last-month rule lets you contribute up to the full ${money(limit!)}, leaving ${money(full)}. You must stay eligible through the end of the next year’s testing period, or the extra becomes taxable income plus a 10% additional tax.`
        : `Prorated, your limit is ${money(prorated)} for ${m} month${m === 1 ? '' : 's'}. After ${money(paid!)} already contributed, ${money(room)} is left. The last-month rule does not apply unless you are covered on Dec 1.`,
      chart: {
        type: 'bar' as const,
        title: 'HSA limit and room',
        categories: [eligibleDec1 ? 'Last-month rule' : 'Prorated'],
        series: [
          { name: 'Contributed', values: [Math.min(paid!, eligibleDec1 ? limit! : prorated)] },
          { name: 'Room left', values: [best] },
        ],
        format: CURRENCY,
        stacked: true,
      },
      steps: [
        `Prorated limit = ${money(limit!)} × ${m} ÷ 12 = ${money(prorated)}`,
        `Prorated room = ${money(prorated)} − ${money(paid!)} = ${money(room)}`,
        `Last-month room = ${money(limit!)} − ${money(paid!)} = ${money(full)}`,
      ],
    };
  },
  content: {
    formula: [
      'Prorated limit = full-year limit × eligible months ÷ 12',
      'Prorated room = prorated limit − contributed (never below zero)',
      'Last-month room = full-year limit − contributed (only if covered on Dec 1)',
    ],
    body: [
      'If your high-deductible health plan started partway through the year, your HSA limit is normally one twelfth of the annual limit for each month you were eligible on the first day of that month.',
      'Example: with a $4,400 limit and 5 eligible months, the prorated limit is $1,833.33. After $1,200 contributed, $633.33 is left. If you are covered on Dec 1, the last-month rule lets you contribute the full $4,400, leaving $3,200.',
      'The last-month rule comes with a testing period: you must stay eligible through the end of the following year, or the extra amount is added to income and taxed with a 10% additional tax. This is general information, not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How is the HSA limit prorated?', a: 'Divide the annual limit by 12 and multiply by the months you were eligible on the first day of the month.' },
      { q: 'What is the last-month rule?', a: 'If you are eligible on Dec 1, you may contribute the full-year limit as if you had been eligible all year, provided you remain eligible through the testing period.' },
      { q: 'What is the testing period?', a: 'The period from Dec 1 through Dec 31 of the following year. Losing eligibility during it makes the extra contribution taxable, with a 10% additional tax.' },
      { q: 'Do employer contributions count?', a: 'Yes. Add them to what you contributed. They count toward the same limit.' },
      { q: 'Which limit should I enter?', a: 'The IRS limit for self-only or family coverage, plus the catch-up amount if you are 55 or older. Edit the default if the IRS figure has changed.' },
    ],
    sources: [
      { label: 'IRS Publication 969: Health savings accounts and other tax-favored health plans', url: 'https://www.irs.gov/publications/p969' },
    ],
  },
  related: ['hsa-fsa-savings', 'hsa-invest-vs-spend', 'gift-tax-annual-exclusion', '401k-max-out'],
  examples: [
    // prorated 4400*5/12=1833.3333; room 633.3333; full 3200; Dec 1 yes -> primary room 3200
    { values: { limit: 4400, months: 5, contributed: 1200, dec1: 'yes' }, expect: { room: 3200, prorated: 4400 * 5 / 12, lastMonthRoom: 3200 } },
    // no Dec 1: room 4400*5/12-1200 = 633.3333
    { values: { limit: 4400, months: 5, contributed: 1200, dec1: 'no' }, expect: { room: 4400 * 5 / 12 - 1200, prorated: 4400 * 5 / 12, lastMonthRoom: 3200 } },
    // over-contributed: 8750*3/12=2187.5; contributed 3000 -> room 0
    { values: { limit: 8750, months: 3, contributed: 3000, dec1: 'no' }, expect: { room: 0, prorated: 2187.5, lastMonthRoom: 5750 } },
  ],
});
