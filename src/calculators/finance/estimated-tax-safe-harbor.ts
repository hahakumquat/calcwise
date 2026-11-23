import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'estimated-tax-safe-harbor',
  title: 'Estimated Tax Safe Harbor Calculator',
  category: 'finance',
  description: 'Find the least you must pay in federal estimated tax to avoid an underpayment penalty, using the 90% and prior-year rules, and what is left for the Q4 payment.',
  keywords: ['estimated tax safe harbor calculator', 'q4 estimated tax payment', 'underpayment penalty safe harbor', '110 percent prior year tax rule', 'how much estimated tax to pay january 15', '90 percent of current year tax'],
  updated: '2026-11-23',
  inputs: [
    { id: 'current', label: 'Expected tax for this year', type: 'number', prefix: '$', default: 20000, min: 0, step: 500, info: 'Your best estimate of this year\'s total federal tax, from your return so far.' },
    { id: 'prior', label: 'Total tax on last year\'s return', type: 'number', prefix: '$', default: 16000, min: 0, step: 500, info: 'The total tax line from last year\'s full 12-month return.' },
    {
      id: 'agi', label: 'Last year\'s adjusted gross income', type: 'select', default: 'low',
      options: [{ value: 'low', label: '$150,000 or less' }, { value: 'high', label: 'Over $150,000' }],
      info: 'Above $150,000 ($75,000 if married filing separately) the prior-year rule is 110% instead of 100%. Pick "Over" for either case.',
    },
    { id: 'paid', label: 'Paid so far this year', type: 'number', prefix: '$', default: 12000, min: 0, step: 500, info: 'Estimated payments already made plus tax withheld from pay this year.' },
  ],
  outputs: [
    { id: 'remaining', label: 'Still to pay to be safe', format: 'currency', primary: true, info: 'Required annual payment minus what you have paid so far, never below zero.' },
    { id: 'required', label: 'Required annual payment', format: 'currency', info: 'The smaller of 90% of this year\'s tax and the prior-year rule.' },
    { id: 'ninety', label: '90% of this year\'s tax', format: 'currency', info: 'The current-year rule.' },
    { id: 'priorRule', label: 'Prior-year rule amount', format: 'currency', info: '100% of last year\'s tax, or 110% if your income was over the limit.' },
    { id: 'quarter', label: 'Even quarterly amount', format: 'currency', info: 'Required annual payment ÷ 4, for planning next year.' },
  ],
  compute: (v) => {
    const current = num(v.current);
    const prior = num(v.prior);
    const paid = num(v.paid);
    const high = v.agi === 'high';
    if (current === null || prior === null || paid === null) return { remaining: null };
    if (current < 0 || prior < 0 || paid < 0) return { remaining: null, error: 'Values cannot be negative.' };
    const ninety = current * 0.9;
    const pct = high ? 1.1 : 1;
    const priorRule = prior * pct;
    const required = Math.min(ninety, priorRule);
    const remaining = Math.max(0, required - paid);
    const quarter = required / 4;
    const rule = priorRule <= ninety ? 'the prior-year rule' : '90% of this year';
    return {
      remaining,
      required,
      ninety,
      priorRule,
      quarter,
      tone: remaining > 0 ? 'ok' : 'good',
      badge: remaining > 0 ? 'Pay ' + usd(remaining) + ' more to reach the safe harbor' : 'You have already met the safe harbor',
      chart: {
        type: 'bar',
        title: 'Safe harbor amounts and what you have paid',
        categories: ['90% of this year', high ? '110% of last year' : '100% of last year', 'Paid so far'],
        series: [{ name: 'Amount', values: [ninety, priorRule, paid] }],
        format: { format: 'currency' },
      },
      steps: [
        `90% of this year: 0.9 × ${usd(current)} = ${usd(ninety)}`,
        `Prior-year rule: ${high ? '110' : '100'}% × ${usd(prior)} = ${usd(priorRule)}`,
        `Required: the smaller of the two = ${usd(required)} (${rule})`,
        `Still to pay: ${usd(required)} − ${usd(paid)} = ${usd(remaining)}`,
      ],
      note: 'Simplified: the IRS also checks each quarterly due date separately, so a late catch-up payment can still draw a small penalty for the earlier quarters. Withholding counts as paid evenly through the year. The prior-year rule needs a full 12-month prior year. No penalty applies if you owe less than $1,000 after withholding and credits. Farmers, fishers and some other filers have different rules, and state tax is separate.',
    };
  },
  content: {
    formula: [
      'Current-year rule = 90% × this year\'s expected tax',
      'Prior-year rule = 100% × last year\'s tax (110% if last year\'s AGI was over $150,000)',
      'Required payment = the smaller of the two rules',
      'Still to pay = required payment − payments and withholding so far (minimum 0)',
    ],
    body: [
      'If you earn money that has no tax withheld, such as self-employment or investment income, the IRS expects you to pay during the year. To avoid an underpayment penalty you generally need to pay at least the smaller of two amounts: 90% of this year\'s tax, or 100% of last year\'s tax. If last year\'s adjusted gross income was over $150,000, the second figure is 110%.',
      'The prior-year rule is useful because you can know it for certain. If this year\'s income jumped and you cannot predict the final bill, paying based on last year\'s total tax keeps you penalty-free even if you owe more in April.',
      'Enter what you have paid so far, including tax withheld from a paycheck, and the result is the amount still needed. The Q4 payment is normally due on January 15 of the next year, so this is a late-year calculator.',
      'It is a simplified check. The IRS tests each quarter on its own schedule, so catching up late can still leave a small penalty. Use the IRS Form 2210 instructions for the exact figure.',
    ],
    faq: [
      { q: 'How much estimated tax do I need to pay to avoid a penalty?', a: 'Generally the smaller of 90% of this year\'s tax and 100% of last year\'s tax (110% if last year\'s AGI was over $150,000). With $20,000 expected and $16,000 last year, that is $16,000.' },
      { q: 'What is the 110% rule?', a: 'If your adjusted gross income last year was over $150,000 ($75,000 if married filing separately), the prior-year safe harbor is 110% of last year\'s tax rather than 100%. With $16,000 of prior-year tax that is $17,600.' },
      { q: 'When is the Q4 estimated payment due?', a: 'Usually January 15 of the following year. Weekends and holidays can move the date, so check the IRS page for the exact day.' },
      { q: 'Does withholding count?', a: 'Yes. Tax withheld from wages counts toward the total. The IRS treats withholding as paid evenly through the year unless you choose otherwise, which can help if you raise it late in the year.' },
      { q: 'Is there a penalty if I owe less than $1,000?', a: 'No. Generally no underpayment penalty applies if you expect to owe less than $1,000 after withholding and credits.' },
    ],
    sources: [
      { label: 'IRS Publication 505: Tax Withholding and Estimated Tax', url: 'https://www.irs.gov/publications/p505' },
      { label: 'IRS: Estimated taxes', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/estimated-taxes' },
    ],
  },
  related: ['self-employment-tax', 'take-home-pay', 'standard-vs-itemized'],
  examples: [
    // 90% = 18000; prior 100% = 16000; required 16000; paid 12000 -> 4000; quarter 4000
    { values: { current: 20000, prior: 16000, agi: 'low', paid: 12000 }, expect: { ninety: 18000, priorRule: 16000, required: 16000, remaining: 4000, quarter: 4000 }, tolerance: 1e-6 },
    // high AGI: 1.1 × 16000 = 17600; required min(18000, 17600) = 17600; remaining 5600
    { values: { current: 20000, prior: 16000, agi: 'high', paid: 12000 }, expect: { priorRule: 17600, required: 17600, remaining: 5600 }, tolerance: 1e-6 },
    // prior-year tax larger than 90% of current: 90% of 10000 = 9000 < 15000; paid 9500 -> 0
    { values: { current: 10000, prior: 15000, agi: 'low', paid: 9500 }, expect: { required: 9000, remaining: 0 }, tolerance: 1e-6 },
  ],
});
