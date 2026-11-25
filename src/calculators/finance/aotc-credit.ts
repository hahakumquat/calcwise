import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'aotc-credit',
  title: 'American Opportunity Credit Calculator',
  category: 'finance',
  description: 'Estimate your American Opportunity tax credit after the income phase-out. Enter tuition costs and income to see the credit and the refundable part.',
  keywords: ['american opportunity credit calculator', 'aotc calculator', 'american opportunity tax credit phase out', 'education credit calculator', 'tuition tax credit'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'expenses', label: 'Qualified education expenses', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, info: 'Tuition, fees and required course materials for the year, as shown on Form 1098-T and your receipts.' },
    { id: 'tier1', label: 'First tier (100% credit)', type: 'number', prefix: '$', default: 2000, min: 0, step: 100, info: 'Expenses up to this amount are credited in full. Check the current IRS figure.' },
    { id: 'tier2', label: 'Second tier (25% credit)', type: 'number', prefix: '$', default: 2000, min: 0, step: 100, info: 'The next slice of expenses, credited at 25%. Check the current IRS figure.' },
    { id: 'magi', label: 'Modified adjusted gross income', type: 'number', prefix: '$', default: 85000, min: 0, step: 1000, info: 'Your MAGI from your tax return or estimate.' },
    { id: 'start', label: 'Phase-out starts at', type: 'number', prefix: '$', default: 80000, min: 0, step: 1000, info: 'Income where the credit starts to shrink. Confirm for your filing status with the IRS.' },
    { id: 'end', label: 'Phase-out ends at', type: 'number', prefix: '$', default: 90000, min: 0, step: 1000, info: 'Income at which the credit reaches zero. Confirm for your filing status with the IRS.' },
    { id: 'refundable', label: 'Refundable share', type: 'number', suffix: '%', default: 40, min: 0, max: 100, step: 5, info: 'The share of the credit that can be refunded even if you owe no tax. The IRS sets it at 40%.' },
  ],
  outputs: [
    { id: 'credit', label: 'Credit after phase-out', format: 'currency', precision: 2, primary: true, info: 'Full credit × the phase-out factor.' },
    { id: 'full', label: 'Credit before phase-out', format: 'currency', precision: 2, info: 'First tier + 25% of the second tier slice you used.' },
    { id: 'factor', label: 'Share of credit kept', format: 'percent', precision: 0, info: '(End − income) ÷ (End − start), between 0% and 100%.' },
    { id: 'refund', label: 'Refundable part', format: 'currency', precision: 2, info: 'Credit × refundable share.' },
  ],
  compute: (v) => {
    const exp = num(v.expenses);
    const t1 = num(v.tier1);
    const t2 = num(v.tier2);
    const magi = num(v.magi);
    const s = num(v.start);
    const e = num(v.end);
    const r = num(v.refundable);
    const all = [exp, t1, t2, magi, s, e, r];
    if (all.some((x) => x === null || (x as number) < 0)) return { credit: null };
    if (e! <= s!) return { credit: null };
    const first = Math.min(exp!, t1!);
    const second = Math.min(t2!, Math.max(0, exp! - t1!));
    const full = first + 0.25 * second;
    const factor = Math.min(1, Math.max(0, (e! - magi!) / (e! - s!)));
    const credit = full * factor;
    const lost = full - credit;
    const refund = credit * (Math.min(r!, 100) / 100);
    return {
      credit,
      full,
      factor,
      refund,
      tone: credit === 0 && full > 0 ? 'warn' : factor < 1 ? 'ok' : 'good',
      badge: factor === 1 ? 'Full credit' : factor === 0 ? 'Phased out completely' : `${Math.round(factor * 100)}% of the credit`,
      note: factor === 1
        ? `Your income is at or under ${money(s!)}, so the full ${money(full)} applies. The four-year limit and eligibility rules are not checked.`
        : `Your income is ${money(magi!)}, so ${Math.round(factor * 100)}% of the ${money(full)} credit is kept. The four-year limit and eligibility rules are not checked.`,
      chart: {
        type: 'bar' as const,
        title: 'American Opportunity credit',
        categories: ['Credit'],
        series: [
          { name: 'Kept', values: [credit] },
          { name: 'Lost to phase-out', values: [lost] },
        ],
        format: CURRENCY,
        stacked: true,
      },
      steps: [
        `Full credit = ${money(first)} + 25% × ${money(second)} = ${money(full)}`,
        `Share kept = (${money(e!)} − ${money(magi!)}) ÷ (${money(e!)} − ${money(s!)}), limited to 0–100% = ${(factor * 100).toFixed(1)}%`,
        `Credit = ${money(full)} × ${(factor * 100).toFixed(1)}% = ${money(credit)}`,
        `Refundable part = ${money(credit)} × ${r}% = ${money(refund)}`,
      ],
    };
  },
  content: {
    formula: [
      'Full credit = first tier (up to its limit) + 25% × second tier (up to its limit)',
      'Share kept = (phase-out end − income) ÷ (phase-out end − phase-out start), limited to 0–100%',
      'Credit = full credit × share kept',
      'Refundable part = credit × refundable share',
    ],
    body: [
      'The American Opportunity credit helps pay for the first years of college. It credits the first slice of your expenses in full and the next slice at 25%, then shrinks as your income rises through a phase-out range.',
      'Example: $5,000 of expenses gives $2,000 + 25% × $2,000 = $2,500. At $85,000 of income, halfway through an $80,000 to $90,000 range, you keep 50%, so the credit is $1,250. With a 40% refundable share, $500 of it can be refunded.',
      'The four-year limit, eligibility rules and who can claim the student are not checked, and the tiers and phase-out range are inputs you should confirm with the IRS. This is general information, not tax advice. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How is the credit calculated?', a: 'The first tier of expenses ($2,000 by default) counts at 100% and the second tier ($2,000 by default) at 25%, so the most you can get before the phase-out is $2,500.' },
      { q: 'How does the income phase-out work?', a: 'Below the start you keep the full credit. Between start and end the credit shrinks in a straight line, and at the end it is zero.' },
      { q: 'Which phase-out range should I use?', a: 'It depends on your filing status. The default here is $80,000 to $90,000, which the IRS uses for most single filers. Confirm yours and edit it.' },
      { q: 'What does refundable mean?', a: 'Up to 40% of the credit can be paid to you even if you owe no tax. This calculator shows that part separately.' },
      { q: 'Does this check the four-year limit?', a: 'No. The credit is limited to four tax years per student; check the IRS rules before you claim it.' },
    ],
    sources: [
      { label: 'IRS: American Opportunity Tax Credit', url: 'https://www.irs.gov/credits-deductions/individuals/aotc' },
    ],
  },
  related: ['credits-to-graduate', 'degree-payback', 'income-tax', 'student-loan-payoff'],
  examples: [
    // full 2000 + .25*2000 = 2500; factor (90-85)/10 = .5; credit 1250; refund 500
    { values: { expenses: 5000, tier1: 2000, tier2: 2000, magi: 85000, start: 80000, end: 90000, refundable: 40 }, expect: { full: 2500, factor: 0.5, credit: 1250, refund: 500 } },
    // small expenses 1500 -> full 1500; under start -> kept 100%; refund 600
    { values: { expenses: 1500, tier1: 2000, tier2: 2000, magi: 60000, start: 80000, end: 90000, refundable: 40 }, expect: { full: 1500, factor: 1, credit: 1500, refund: 600 } },
    // expenses 3000 -> 2000 + .25*1000 = 2250; above end -> 0
    { values: { expenses: 3000, tier1: 2000, tier2: 2000, magi: 95000, start: 80000, end: 90000, refundable: 40 }, expect: { full: 2250, factor: 0, credit: 0, refund: 0 } },
  ],
});
