import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
// Self-employment tax applies to 92.35% of net earnings (IRS Schedule SE).
const SE_BASE = 0.9235;

export default defineCalculator({
  slug: 'write-off-value',
  title: 'Write-Off Value Calculator',
  category: 'finance',
  description: 'A $1,000 business write-off does not save $1,000. See what a deduction really saves in federal, state and self-employment tax, and what it costs you.',
  keywords: ['write off calculator', 'what is a tax write off worth', 'business deduction savings', 'how much does a write off save', 'tax deduction value calculator', 'self employed write off'],
  updated: '2026-11-23',
  inputs: [
    { id: 'deduction', label: 'Business expense (the write-off)', type: 'number', prefix: '$', default: 1000, min: 0, step: 100, info: 'The amount you can deduct from business income.' },
    { id: 'fed', label: 'Federal marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 100, step: 1, info: 'The bracket your last dollar of income falls in. Check the current brackets on irs.gov.' },
    { id: 'state', label: 'State income tax rate', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 0.5, info: 'Your state marginal rate, or 0 if there is none.' },
    { id: 'se', label: 'Self-employment tax rate', type: 'number', suffix: '%', default: 15.3, min: 0, max: 100, step: 0.1, info: '15.3% for most self-employed people. Use 0 if the expense is not against self-employment income, or 2.9 if you are above the Social Security wage base.' },
  ],
  outputs: [
    { id: 'saved', label: 'Tax saved by the write-off', format: 'currency', primary: true, info: 'Federal + state + self-employment tax saved.' },
    { id: 'cost', label: 'Real cost after tax', format: 'currency', info: 'Expense minus tax saved.' },
    { id: 'fedSaved', label: 'Federal income tax saved', format: 'currency', info: 'Expense × federal rate.' },
    { id: 'stateSaved', label: 'State income tax saved', format: 'currency', info: 'Expense × state rate.' },
    { id: 'seSaved', label: 'Self-employment tax saved', format: 'currency', info: 'Expense × 92.35% × self-employment rate.' },
    { id: 'perDollar', label: 'Saved per $1 spent', format: 'percent', info: 'Tax saved ÷ expense.' },
  ],
  compute: (v) => {
    const d = num(v.deduction);
    const fed = num(v.fed);
    const state = num(v.state);
    const se = num(v.se);
    if (d === null || fed === null || state === null || se === null) return { saved: null };
    if (d < 0 || fed < 0 || state < 0 || se < 0) return { saved: null, error: 'Values cannot be negative.' };
    if (fed > 100 || state > 100 || se > 100) return { saved: null, error: 'Rates cannot be above 100%.' };
    if (d === 0) return { saved: null, note: 'Enter an expense to see the result.' };
    const fedSaved = d * (fed / 100);
    const stateSaved = d * (state / 100);
    const seSaved = d * SE_BASE * (se / 100);
    const saved = fedSaved + stateSaved + seSaved;
    const cost = d - saved;
    const perDollar = saved / d;
    return {
      saved, cost, fedSaved, stateSaved, seSaved, perDollar,
      tone: 'good',
      badge: `Every $1 spent saves about ${Math.round(perDollar * 100)}¢ in tax`,
      chart: {
        type: 'bar',
        title: 'Where a ' + usd(d) + ' expense goes',
        categories: ['Federal tax saved', 'State tax saved', 'Self-employment tax saved', 'Real cost to you'],
        series: [{ name: 'Amount', values: [fedSaved, stateSaved, seSaved, cost] }],
        format: { format: 'currency' },
      },
      steps: [
        `Federal: ${usd(d)} × ${fed}% = ${usd(fedSaved)}`,
        `State: ${usd(d)} × ${state}% = ${usd(stateSaved)}`,
        `Self-employment: ${usd(d)} × 92.35% × ${se}% = ${usd(seSaved)}`,
        `Total saved: ${usd(saved)}, so the expense really costs ${usd(d)} − ${usd(saved)} = ${usd(cost)}`,
      ],
      note: 'A write-off lowers your tax, it does not refund the expense, so you still spend money to save money. This is an estimate: it ignores the small extra saving from the deduction for half of self-employment tax, the qualified business income deduction, phase-outs and bracket changes. Rates are your own inputs.',
    };
  },
  content: {
    formula: [
      'Federal saved = expense × federal rate',
      'State saved = expense × state rate',
      'Self-employment saved = expense × 92.35% × self-employment rate',
      'Real cost = expense − (federal + state + self-employment saved)',
    ],
    body: [
      '"It\'s a write-off" sounds like the expense is free. It is not. A deduction reduces the income you are taxed on, so you save tax only at your own rates, and you still pay the other part of the bill yourself.',
      'For a self-employed person the saving has three layers: federal income tax, state income tax, and self-employment tax, which a business expense also lowers. That is why the saving is often 35 to 40 cents per dollar rather than 20.',
      'Spending $1,000 you did not need to "save on taxes" is a loss. The write-off is worth having only for money you would have spent on the business anyway.',
      'Tax rules differ by expense type and some items are only partly deductible. Check IRS Publication 535 and talk to a tax professional for your own case.',
    ],
    faq: [
      { q: 'How much does a $1,000 write-off save?', a: 'With a 22% federal rate, 5% state rate and 15.3% self-employment tax, it saves $220 + $50 + $141.30 = $411.30, so the expense really costs $588.70.' },
      { q: 'Is a write-off the same as a refund?', a: 'No. You still pay the full expense. The write-off only lowers the tax on your income by your tax rate.' },
      { q: 'Why does self-employment tax count?', a: 'Self-employed people pay it on net earnings, and a business expense lowers net earnings. The tax applies to 92.35% of them, so $1,000 of expense saves $141.30 at 15.3%.' },
      { q: 'What if I am an employee?', a: 'Set the self-employment rate to 0. Most unreimbursed employee expenses are not deductible on the federal return, so check before assuming any saving.' },
      { q: 'What does this leave out?', a: 'The deduction for half of self-employment tax, the qualified business income deduction, phase-outs and bracket changes. Those can move the answer by a few percentage points.' },
    ],
    sources: [
      { label: 'IRS Publication 535: Business Expenses', url: 'https://www.irs.gov/publications/p535' },
      { label: 'IRS: Self-employment tax', url: 'https://www.irs.gov/businesses/small-businesses-self-employed/self-employment-tax-social-security-and-medicare-taxes' },
    ],
  },
  related: ['self-employment-tax', 'home-office-deduction', 'business-mileage-deduction'],
  examples: [
    // fed 220; state 50; se 1000×0.9235×0.153 = 141.2955; saved 411.2955; cost 588.7045
    { values: { deduction: 1000, fed: 22, state: 5, se: 15.3 }, expect: { fedSaved: 220, stateSaved: 50, seSaved: 141.2955, saved: 411.2955, cost: 588.7045 }, tolerance: 0.01 },
    // 2500 × 24% = 600; state 6% = 150; se 2500×0.9235×0.153 = 353.23875; total 1103.23875
    { values: { deduction: 2500, fed: 24, state: 6, se: 15.3 }, expect: { fedSaved: 600, stateSaved: 150, saved: 1103.23875 }, tolerance: 0.01 },
    // employee: se 0, state 0 -> 12% of 200 = 24
    { values: { deduction: 200, fed: 12, state: 0, se: 0 }, expect: { saved: 24, cost: 176, seSaved: 0 }, tolerance: 1e-6 },
  ],
});
