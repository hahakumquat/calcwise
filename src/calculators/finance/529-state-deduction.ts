import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: '529-state-deduction',
  title: '529 State Deduction: Value of Giving by Dec 31',
  category: 'finance',
  description: 'See how much state tax a 529 contribution saves. Enter your gift, your state deduction cap and rate to find the saving and the room left before Dec 31.',
  keywords: ['529 state tax deduction calculator', '529 contribution deduction', '529 deadline december 31', 'how much state tax does a 529 save', '529 deduction cap room left'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'gift', label: 'Your 529 contribution this year', type: 'number', prefix: '$', default: 6000, min: 0, step: 250, info: 'What you have put in or plan to put in by Dec 31.' },
    { id: 'cap', label: 'State deduction cap', type: 'number', prefix: '$', default: 4000, min: 0, step: 250, info: 'The most your state lets you deduct. Check your state 529 plan or tax agency; it is not built in here.' },
    { id: 'rate', label: 'State income tax rate', type: 'number', default: 5, min: 0, max: 20, step: 0.25, suffix: '%', info: 'The rate on your last dollar of state taxable income.' },
  ],
  outputs: [
    { id: 'saved', label: 'State tax saved', format: 'currency', precision: 2, primary: true, info: 'Deductible amount × state rate.' },
    { id: 'deductible', label: 'Deductible amount', format: 'currency', precision: 2, info: 'The smaller of your contribution and the cap.' },
    { id: 'room', label: 'Room left under the cap', format: 'currency', precision: 2, info: 'Cap − contribution, never below zero.' },
  ],
  compute: (v) => {
    const gift = num(v.gift);
    const cap = num(v.cap);
    const rate = num(v.rate);
    if (gift === null || cap === null || rate === null) return { saved: null };
    if (gift < 0 || cap < 0 || rate < 0) return { saved: null };
    const deductible = Math.min(gift, cap);
    const saved = deductible * rate / 100;
    const room = Math.max(0, cap - gift);
    const extraSaved = room * rate / 100;
    return {
      saved,
      deductible,
      room,
      tone: room > 0 ? 'ok' : 'good',
      badge: room > 0 ? `${money(room)} of room left` : 'Cap reached',
      note: room > 0
        ? `Your ${money(gift)} contribution saves ${money(saved)}. Adding ${money(room)} more before Dec 31 would save another ${money(extraSaved)}. Rules, carryforwards and recapture vary by state; this is not tax advice.`
        : `${money(deductible)} is deductible, saving ${money(saved)}. Giving more than the cap does not add a deduction here, though some states allow carryforward. Rules vary by state; this is not tax advice.`,
      chart: {
        type: 'bar' as const,
        title: 'Your contribution against the cap',
        categories: ['Contribution', 'Deductible', 'Room left'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Amount', values: [gift, deductible, room] }],
      },
      steps: [
        `Deductible = smaller of ${money(gift)} and ${money(cap)} = ${money(deductible)}`,
        `Saved = ${money(deductible)} × ${fmt(rate)}% = ${money(saved)}`,
        `Room left = ${money(cap)} − ${money(gift)} = ${money(room)} (not below zero)`,
      ],
    };
  },
  content: {
    formula: [
      'Deductible amount = smaller of contribution and state cap',
      'State tax saved = deductible amount × state rate',
      'Room left = cap − contribution, never below zero',
    ],
    body: [
      'Some states let you deduct 529 contributions from state income, up to a yearly cap. Contributions usually have to be made by Dec 31 to count for that tax year, so late in the year it helps to know how much room is left and what filling it is worth.',
      'Example: a $6,000 contribution, a $4,000 cap and a 5% state rate. The deductible amount is $4,000, so the saving is 4,000 × 5% = $200 and no room is left. With only $2,500 given, the saving is $125 and $1,500 of room is left, worth another $75.',
      'The cap is an input because it differs by state and may change. Some states give a credit instead of a deduction, apply income limits, allow carryforward or recapture the benefit on non-qualified withdrawals. None of that is modelled. Check your state 529 plan or tax agency. This is not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much state tax does a 529 save?', a: 'The deductible amount times your state rate. A $4,000 deduction at 5% saves $200.' },
      { q: 'What is the deadline to contribute?', a: 'Many states require the contribution by Dec 31 for that tax year. Confirm the rule with your plan or state tax agency.' },
      { q: 'What cap should I enter?', a: 'Your state deduction cap per taxpayer or per return, from your state 529 plan. It is not built in so it never goes out of date.' },
      { q: 'Does every state offer a deduction?', a: 'No. Some offer none, and some give a credit instead. Enter a cap of 0 if your state does not offer a deduction.' },
      { q: 'What if I give more than the cap?', a: 'This calculator counts only up to the cap. Some states allow carryforward, which is not modelled.' },
    ],
    sources: [],
  },
  related: ['charitable-giving-tax-value', 'savings-goal', 'degree-payback'],
  examples: [
    // deductible min(6000,4000)=4000; saved 200; room 0
    { values: { gift: 6000, cap: 4000, rate: 5 }, expect: { deductible: 4000, saved: 200, room: 0 } },
    // gift 2500; saved 125; room 1500
    { values: { gift: 2500, cap: 4000, rate: 5 }, expect: { deductible: 2500, saved: 125, room: 1500 } },
  ],
});
