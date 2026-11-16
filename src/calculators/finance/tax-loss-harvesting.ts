import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { asStatus, CURRENCY, FILING_STATUS_OPTIONS, money } from '../../lib/helpers/finance';

/** IRC §1211(b): net capital loss deductible against ordinary income per year. */
const CAP: Record<string, number> = { single: 3000, mfj: 3000, hoh: 3000, mfs: 1500 };

export default defineCalculator({
  slug: 'tax-loss-harvesting',
  title: 'Tax-Loss Harvesting Calculator',
  category: 'finance',
  description: 'Estimate how much federal tax you save by selling investments at a loss: gains offset, the $3,000 ordinary income deduction and the carryforward.',
  keywords: ['tax loss harvesting calculator', 'capital loss calculator', 'capital loss carryforward', '$3,000 capital loss deduction', 'offset capital gains with losses', 'wash sale rule'],
  updated: '2026-11-16',
  popular: false,
  inputs: [
    { id: 'gains', label: 'Realized long-term gains this year', type: 'number', prefix: '$', default: 4000, min: 0, step: 500, optional: true, placeholder: '0', info: 'Profit from assets held more than a year that you have already sold this year.' },
    { id: 'loss', label: 'Loss you plan to harvest', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The loss from selling an investment for less than your cost basis.' },
    { id: 'status', label: 'Filing status', type: 'select', default: 'single', options: FILING_STATUS_OPTIONS, info: 'Married filing separately can deduct only $1,500 of loss against ordinary income. Everyone else can deduct $3,000.' },
    { id: 'ordinary', label: 'Ordinary income tax rate', type: 'number', suffix: '%', default: 24, min: 0, max: 50, step: 1, info: 'Your federal bracket. It values the part of the loss that reduces ordinary income.' },
    { id: 'ltcg', label: 'Long-term capital gains rate', type: 'select', default: '15', options: [{ value: '0', label: '0%' }, { value: '15', label: '15%' }, { value: '20', label: '20%' }], info: 'The rate your long-term gains would have been taxed at.' },
  ],
  outputs: [
    { id: 'totalSaved', label: 'Total tax saved', format: 'currency', primary: true, info: 'Tax saved on gains plus tax saved on the ordinary income deduction.' },
    { id: 'gainsOffset', label: 'Gains offset', format: 'currency', info: 'The smaller of your gains and your loss.' },
    { id: 'gainsSaved', label: 'Tax saved on gains', format: 'currency', info: 'Gains offset times your long-term capital gains rate.' },
    { id: 'deduction', label: 'Deducted from ordinary income', format: 'currency', info: 'Loss left after offsetting gains, up to $3,000 ($1,500 if married filing separately).' },
    { id: 'deductionSaved', label: 'Tax saved on the deduction', format: 'currency', info: 'The deduction times your ordinary income tax rate.' },
    { id: 'carryforward', label: 'Carried forward to next year', format: 'currency', info: 'Loss still unused. It carries forward with no expiry.' },
  ],
  compute: (v) => {
    const gains = num(v.gains) ?? 0;
    const loss = num(v.loss);
    const ord = num(v.ordinary);
    const lt = Number(v.ltcg);
    if (loss === null || ord === null || gains < 0 || loss < 0 || ord < 0 || !(lt >= 0)) return { totalSaved: null };
    const status = asStatus(v.status);
    const cap = CAP[status];

    const gainsOffset = Math.min(gains, loss);
    const excess = loss - gainsOffset;
    const deduction = Math.min(excess, cap);
    const carryforward = excess - deduction;
    const gainsSaved = (gainsOffset * lt) / 100;
    const deductionSaved = (deduction * ord) / 100;
    const totalSaved = gainsSaved + deductionSaved;

    const tone: 'good' | 'ok' = totalSaved > 0 ? 'good' : 'ok';
    const badge = totalSaved > 0 ? `Saves about ${money(totalSaved, 0)}` : 'No tax saved this year';
    const note = carryforward > 0
      ? `${money(carryforward)} of loss carries forward to next year. Estimate only, no NIIT or state tax. Not tax advice.`
      : 'All of the loss is used this year, so nothing carries forward. Estimate only, no NIIT or state tax. Not tax advice.';

    return {
      totalSaved, gainsOffset, gainsSaved, deduction, deductionSaved, carryforward,
      tone, badge,
      chart: {
        type: 'bar',
        title: 'Where your loss goes',
        categories: ['Offsets gains', 'Reduces ordinary income', 'Carries forward'],
        series: [{ name: 'Loss used', values: [gainsOffset, deduction, carryforward] }],
        format: CURRENCY,
      },
      steps: [
        `Gains offset = smaller of ${money(gains)} gains and ${money(loss)} loss = ${money(gainsOffset)}`,
        `Tax saved on gains = ${money(gainsOffset)} × ${lt}% = ${money(gainsSaved)}`,
        `Ordinary income deduction = smaller of ${money(excess)} leftover loss and ${money(cap, 0)} limit = ${money(deduction)}`,
        `Tax saved on the deduction = ${money(deduction)} × ${ord}% = ${money(deductionSaved)}`,
        `Total saved = ${money(gainsSaved)} + ${money(deductionSaved)} = ${money(totalSaved)}; carryforward = ${money(excess)} − ${money(deduction)} = ${money(carryforward)}`,
      ],
      note,
    };
  },
  content: {
    formula: [
      'Gains offset = smaller of (realized gains, loss)',
      'Ordinary income deduction = smaller of (loss − gains offset, $3,000), or $1,500 if married filing separately',
      'Carryforward = loss − gains offset − deduction',
      'Total tax saved = gains offset × capital gains rate + deduction × ordinary income rate',
    ],
    body: [
      'Tax-loss harvesting means selling an investment that has dropped below what you paid, so the loss can cancel out taxable gains. Losses are used against capital gains first. If the loss is bigger than your gains, up to $3,000 of the rest ($1,500 if you are married filing separately) reduces your ordinary income, such as wages. Anything left carries forward to future years with no expiry.',
      'If your gains are bigger than the loss, the whole loss offsets gains and nothing carries forward. The tax you save is the offset amount times the rate those gains would have been taxed at: 0%, 15% or 20% for long-term gains. A loss that reduces ordinary income is worth your bracket rate instead.',
      'Timing matters. A sale only counts for this tax year if it settles by December 31, so place the trade a few trading days before the year ends.',
    ],
    sections: [
      {
        heading: 'Watch out for the wash-sale rule',
        paragraphs: ['If you buy the same or a substantially identical investment within 30 days before or after the sale, the loss is disallowed for now (IRC §1091). It is added to the cost basis of the new shares instead. That window covers 61 days in total, and it includes purchases in an IRA or by a spouse. Waiting 31 days or buying a different, not identical, investment avoids it.'],
      },
      {
        heading: 'What this estimate leaves out',
        paragraphs: ['It treats your gains as long-term and your loss as one amount. It does not split short-term and long-term, and it ignores the 3.8% Net Investment Income Tax and state tax. Harvesting also lowers your cost basis in what you buy next, so it often defers tax rather than removing it. Use it for planning, not filing.'],
      },
    ],
    faq: [
      { q: 'How much tax do I save with a $10,000 loss and $4,000 of gains?', a: 'Single, 24% ordinary rate, 15% long-term rate: the loss wipes out the $4,000 of gains and saves $600. Of the remaining $6,000, $3,000 reduces ordinary income and saves $720. The total saved is $1,320, and $3,000 carries forward.' },
      { q: 'What if my gains are bigger than my loss?', a: 'All of the loss offsets gains and nothing is left over. With $5,000 of gains and a $2,000 loss at 15%, you save $300 and carry nothing forward.' },
      { q: 'Why is the limit $1,500 for married filing separately?', a: 'The yearly limit against ordinary income is $3,000, or $1,500 if you are married filing separately. With $10,000 of loss, no gains and 24% ordinary rate, $1,500 is deducted (saving $360) and $8,500 carries forward.' },
      { q: 'Does the carryforward expire?', a: 'No. Unused capital losses carry forward indefinitely. Each year they offset gains first, then up to $3,000 of ordinary income.' },
      { q: 'What is the wash-sale rule?', a: 'If you buy the same or a substantially identical investment within 30 days before or after the sale, the loss is not allowed that year. This calculator assumes you avoid it.' },
    ],
    sources: [
      { label: 'IRS Topic 409: Capital gains and losses', url: 'https://www.irs.gov/taxtopics/tc409' },
      { label: 'IRS Publication 550: Investment Income and Expenses', url: 'https://www.irs.gov/publications/p550' },
      { label: 'IRC §1211(b) and §1212(b): loss limit and carryover', url: 'https://www.law.cornell.edu/uscode/text/26/1211' },
      { label: 'IRC §1091: wash sales', url: 'https://www.law.cornell.edu/uscode/text/26/1091' },
    ],
  },
  related: ['capital-gains-tax', 'income-tax', 'investment', 'rsu-tax', 'take-home-pay'],
  examples: [
    {
      // offset 4,000 × 15% = 600; leftover 6,000, deduct 3,000 × 24% = 720; total 1,320; carry 3,000.
      values: { gains: 4000, loss: 10000, status: 'single', ordinary: 24, ltcg: '15' },
      expect: { gainsOffset: 4000, gainsSaved: 600, deduction: 3000, deductionSaved: 720, totalSaved: 1320, carryforward: 3000 },
      tolerance: 1e-6,
    },
    {
      // loss < gains: offset 2,000 × 15% = 300; nothing left.
      values: { gains: 5000, loss: 2000, status: 'single', ordinary: 24, ltcg: '15' },
      expect: { gainsOffset: 2000, gainsSaved: 300, deduction: 0, deductionSaved: 0, totalSaved: 300, carryforward: 0 },
      tolerance: 1e-6,
    },
    {
      // MFS: offset 1,000 × 15% = 150; leftover 4,000, cap 1,500 × 24% = 360; total 510; carry 2,500.
      values: { gains: 1000, loss: 5000, status: 'mfs', ordinary: 24, ltcg: '15' },
      expect: { gainsOffset: 1000, gainsSaved: 150, deduction: 1500, deductionSaved: 360, totalSaved: 510, carryforward: 2500 },
      tolerance: 1e-6,
    },
  ],
});
