import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'child-tax-credit',
  title: 'Child Tax Credit Calculator with Phase-Out',
  category: 'finance',
  description: 'Estimate your child tax credit after the income phase-out. Enter children, credit per child, income and your filing threshold to see the reduction.',
  keywords: ['child tax credit calculator', 'child tax credit phase out', 'ctc income limit', 'how much is the child tax credit', 'child tax credit reduction'],
  updated: '2026-11-24',
  popular: false,
  inputs: [
    { id: 'kids', label: 'Qualifying children', type: 'number', default: 2, min: 0, max: 30, step: 1, info: 'Children who meet the IRS rules for the credit, such as age and Social Security number requirements.' },
    { id: 'amount', label: 'Credit per child', type: 'number', prefix: '$', default: 2200, min: 0, step: 50, info: 'The IRS credit per qualifying child. Check the current figure for your tax year.' },
    { id: 'magi', label: 'Modified adjusted gross income', type: 'number', prefix: '$', default: 420000, min: 0, step: 1000, info: 'Your MAGI from your tax return or estimate.' },
    { id: 'threshold', label: 'Phase-out starts at', type: 'number', prefix: '$', default: 400000, min: 0, step: 5000, info: 'The income where the credit starts to shrink: $200,000 for most filers and $400,000 for married filing jointly. Confirm with the IRS.' },
    { id: 'step', label: 'Reduction per $1,000 over', type: 'number', prefix: '$', default: 50, min: 0, step: 5, info: 'The credit falls by this much for each $1,000, or part of $1,000, of income over the threshold.' },
  ],
  outputs: [
    { id: 'credit', label: 'Credit after phase-out', format: 'currency', precision: 2, primary: true, info: 'Children × credit per child − reduction, never below zero.' },
    { id: 'full', label: 'Credit before phase-out', format: 'currency', precision: 2, info: 'Children × credit per child.' },
    { id: 'reduction', label: 'Phase-out reduction', format: 'currency', precision: 2, info: 'Reduction per $1,000 × each $1,000 (rounded up) over the threshold, capped at the full credit.' },
  ],
  compute: (v) => {
    const kids = num(v.kids);
    const amt = num(v.amount);
    const magi = num(v.magi);
    const th = num(v.threshold);
    const step = num(v.step);
    if ([kids, amt, magi, th, step].some((x) => x === null)) return { credit: null };
    if ([kids, amt, magi, th, step].some((x) => (x as number) < 0)) return { credit: null };
    const k = Math.floor(kids!);
    const full = k * amt!;
    const over = Math.max(0, magi! - th!);
    const units = Math.ceil(over / 1000 - 1e-9);
    const rawRed = units * step!;
    const reduction = Math.min(full, rawRed);
    const credit = full - reduction;
    return {
      credit,
      full,
      reduction,
      tone: credit === 0 && full > 0 ? 'warn' : reduction > 0 ? 'ok' : 'good',
      badge: reduction === 0 ? 'No phase-out' : credit === 0 ? 'Phased out completely' : `Reduced by ${money(reduction)}`,
      note: reduction === 0
        ? `Your income is at or under ${money(th!)}, so the full ${money(full)} applies. The refundable part, Social Security number rules and the credit for other dependents are not computed.`
        : `You are ${money(over)} over the threshold, which is ${units} step${units === 1 ? '' : 's'} of $1,000 (part counts as a full one) × ${money(step!)} = ${money(rawRed)} of reduction. ${money(credit)} is left. The refundable part and the credit for other dependents are not computed.`,
      chart: {
        type: 'bar' as const,
        title: 'Child tax credit',
        categories: ['Credit'],
        series: [
          { name: 'After phase-out', values: [credit] },
          { name: 'Lost to phase-out', values: [reduction] },
        ],
        format: CURRENCY,
        stacked: true,
      },
      steps: [
        `Full credit = ${k} × ${money(amt!)} = ${money(full)}`,
        `Over threshold = ${money(magi!)} − ${money(th!)} = ${money(over)} → ${units} × $1,000 steps`,
        `Reduction = ${units} × ${money(step!)} = ${money(reduction)}`,
        `Credit = ${money(full)} − ${money(reduction)} = ${money(credit)}`,
      ],
    };
  },
  content: {
    formula: [
      'Full credit = children × credit per child',
      'Steps = ceil((income − threshold) ÷ $1,000), never below zero',
      'Reduction = steps × reduction per step (capped at the full credit)',
      'Credit = full credit − reduction',
    ],
    body: [
      'The child tax credit shrinks for higher earners. The credit falls by a set amount for every $1,000, or part of $1,000, that your income is over a threshold.',
      'Example: 2 children at $2,200 give $4,400. At $420,000 of income with a $400,000 threshold, you are $20,000 over, which is 20 steps × $50 = $1,000 of reduction, so the credit is $3,400.',
      'This estimates the non-refundable credit only. The refundable portion, Social Security number rules and the credit for other dependents are not computed. This is general information, not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How does the phase-out work?', a: 'For each $1,000, or part of it, of income over your threshold, the credit drops by the reduction amount, $50 by default.' },
      { q: 'What threshold should I use?', a: 'The IRS sets it by filing status. The default here is $400,000 for married filing jointly; for most other filers it is $200,000. Confirm with the IRS and edit it.' },
      { q: 'What credit per child should I use?', a: 'The IRS amount for your tax year. The default is $2,200; check the IRS page linked below.' },
      { q: 'Is part of the credit refundable?', a: 'Part can be, depending on earned income. This calculator does not model that.' },
      { q: 'Why can the credit hit zero?', a: 'Once the reduction is as large as the full credit, nothing is left. The calculator never goes below zero.' },
    ],
    sources: [
      { label: 'IRS: Child Tax Credit', url: 'https://www.irs.gov/credits-deductions/individuals/child-tax-credit' },
    ],
  },
  related: ['income-tax', 'take-home-pay', 'dependent-care-fsa', 'childcare-vs-work'],
  examples: [
    // full 4400; over 20000 -> 20 steps x50 = 1000; credit 3400
    { values: { kids: 2, amount: 2200, magi: 420000, threshold: 400000, step: 50 }, expect: { full: 4400, reduction: 1000, credit: 3400 } },
    // part of $1,000 counts: over 500 -> 1 step 50; credit 2000*1 - 50 = 1950
    { values: { kids: 1, amount: 2000, magi: 200500, threshold: 200000, step: 50 }, expect: { full: 2000, reduction: 50, credit: 1950 } },
    // fully phased out: 2 kids 4000; over 100000 -> 5000 capped 4000 -> 0
    { values: { kids: 2, amount: 2000, magi: 500000, threshold: 400000, step: 50 }, expect: { full: 4000, reduction: 4000, credit: 0 } },
  ],
});
