import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'tax-prep-diy-vs-pro',
  title: 'Tax Prep: DIY Software vs Pro Calculator',
  category: 'finance',
  description: 'Compare filing yourself with tax software against paying a preparer. Counts the fee, your hours at a value per hour and the savings a pro might find.',
  keywords: ['diy taxes vs accountant calculator', 'is it worth paying someone to do my taxes', 'tax software vs cpa cost', 'should i hire a tax preparer', 'turbotax vs accountant cost'],
  updated: '2026-11-24',
  inputs: [
    { id: 'software', label: 'Tax software price', type: 'number', prefix: '$', default: 60, min: 0, step: 5, info: 'Software and any state filing fee.' },
    { id: 'diyHours', label: 'Hours it takes you to file yourself', type: 'number', suffix: 'hours', default: 4, min: 0, step: 0.5, info: 'Gathering documents, entering them and checking the result.' },
    { id: 'proFee', label: 'Preparer fee', type: 'number', prefix: '$', default: 250, min: 0, step: 25, info: 'The quote from a CPA or tax preparer.' },
    { id: 'proHours', label: 'Hours you still spend with a pro', type: 'number', suffix: 'hours', default: 1, min: 0, step: 0.5, info: 'Collecting paperwork and answering questions.' },
    { id: 'hourValue', label: 'Value of one hour of your time', type: 'number', prefix: '$', default: 30, min: 0, step: 5, info: 'What an hour is worth to you. Use 0 if you would not count it.' },
    { id: 'extra', label: 'Extra deductions or credits a pro might find', type: 'number', prefix: '$', default: 400, min: 0, step: 50, info: 'Your own guess of deductions or credits you might miss yourself. It is a guess, not a promise.' },
    { id: 'rate', label: 'Your marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 60, step: 1, info: 'Turns extra deductions into tax saved. Your federal bracket plus any state tax is a fair estimate.' },
  ],
  outputs: [
    { id: 'diff', label: 'DIY saves you', format: 'currency', primary: true, info: 'Pro cost − DIY cost. Negative means the pro is cheaper.' },
    { id: 'diyCost', label: 'DIY cost', format: 'currency', info: 'Software + DIY hours × hour value.' },
    { id: 'proCost', label: 'Pro cost after savings', format: 'currency', info: 'Fee + your hours × hour value − extra × rate.' },
    { id: 'saved', label: 'Tax saved by what the pro finds', format: 'currency', info: 'Extra deductions × marginal rate.' },
  ],
  compute: (v) => {
    const s = num(v.software), dh = num(v.diyHours), f = num(v.proFee), ph = num(v.proHours), hv = num(v.hourValue), e = num(v.extra), r = num(v.rate);
    if ([s, dh, f, ph, hv, e, r].some((x) => x === null)) return { diff: null };
    if ([s, dh, f, ph, hv, e, r].some((x) => (x as number) < 0)) return { diff: null, error: 'Values cannot be negative.' };
    if ((r as number) > 60) return { diff: null, error: 'Enter a tax rate of 60% or less.' };
    const diyCost = (s as number) + (dh as number) * (hv as number);
    const saved = (e as number) * (r as number) / 100;
    const proCost = (f as number) + (ph as number) * (hv as number) - saved;
    const diff = proCost - diyCost;
    const diyWins = diff >= 0;
    return {
      diff, diyCost, proCost, saved,
      tone: diyWins ? 'good' : 'warn',
      badge: diyWins ? `Filing yourself is ${usd(diff)} cheaper` : `A pro is ${usd(-diff)} cheaper`,
      chart: {
        type: 'bar',
        title: 'Total cost of each option',
        categories: ['DIY', 'Pro'],
        series: [{ name: 'Cost', values: [diyCost, proCost] }],
        format: { format: 'currency' },
      },
      steps: [
        `DIY: ${usd(s as number)} + ${dh} h × ${usd(hv as number)} = ${usd(diyCost)}`,
        `Tax saved by the pro: ${usd(e as number)} × ${r}% = ${usd(saved)}`,
        `Pro: ${usd(f as number)} + ${ph} h × ${usd(hv as number)} − ${usd(saved)} = ${usd(proCost)}`,
        `Difference: ${usd(proCost)} − ${usd(diyCost)} = ${usd(diff)}`,
      ],
      note: 'The extra-deduction figure is your own guess. Complex returns (business income, rentals, stock sales, several states) can change the answer. This is arithmetic, not tax advice.',
    };
  },
  content: {
    formula: [
      'DIY cost = software price + DIY hours × value of an hour',
      'Pro cost = fee + hours with the pro × value of an hour − extra deductions × marginal rate',
      'Difference = pro cost − DIY cost',
    ],
    body: [
      'Software looks cheap and a preparer looks expensive, but the fee is only part of the cost. Your own hours count, and so can deductions or credits you would have missed.',
      'Enter the software price and the hours you would spend, then the preparer quote and the hours you would still spend. Put a value on an hour of your time, and add your best guess of the extra deductions a pro might find. The result shows which option costs less overall.',
      'The extra-deduction figure is a guess, so try a few values. If the pro only wins when you guess high, DIY is probably the safer bet.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: 'DIY costs $60 + 4 × $30 = $180. The pro costs $250 + 1 × $30 − $400 × 22% ($88) = $192. Filing yourself is $12 cheaper.' },
      { q: 'How do I value my time?', a: 'Use your after-tax hourly pay, or what you would earn or enjoy doing something else. Enter 0 to compare only the money you pay out.' },
      { q: 'Are extra deductions the same as credits?', a: 'No. A deduction cuts taxable income, so it saves your marginal rate times the amount. A credit cuts the tax dollar for dollar, so convert it first: divide the credit by your rate to get the equivalent deduction.' },
      { q: 'When is a pro more likely to be worth it?', a: 'When your return is complicated: self-employment, rental income, stock or crypto sales, a move between states or a big life change. This calculator cannot judge that for you.' },
    ],
    sources: [
      { label: 'IRS: Choosing a tax professional', url: 'https://www.irs.gov/tax-professionals/choosing-a-tax-professional' },
    ],
  },
  related: ['tax-refund-estimator', 'write-off-value', 'hours-of-work-cost'],
  examples: [
    // DIY 60+120=180; saved 400*.22=88; pro 250+30-88=192; diff 12
    { values: { software: 60, diyHours: 4, proFee: 250, proHours: 1, hourValue: 30, extra: 400, rate: 22 }, expect: { diff: 12, diyCost: 180, proCost: 192, saved: 88 }, tolerance: 0.01 },
    // DIY 0+10*50=500; saved 1000*.24=240; pro 300+0-240=60; diff -440
    { values: { software: 0, diyHours: 10, proFee: 300, proHours: 0, hourValue: 50, extra: 1000, rate: 24 }, expect: { diff: -440, diyCost: 500, proCost: 60, saved: 240 }, tolerance: 0.01 },
  ],
});
