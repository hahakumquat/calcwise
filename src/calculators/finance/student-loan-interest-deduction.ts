import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'student-loan-interest-deduction',
  title: 'Student Loan Interest Deduction Calculator',
  category: 'finance',
  description: 'Estimate your student loan interest deduction after the income phase-out, and what it saves in tax. Enter the cap and phase-out range from IRS Publication 970.',
  keywords: ['student loan interest deduction calculator', 'student loan interest deduction phase out', '1098-E deduction calculator', 'how much student loan interest can I deduct', 'student loan interest tax savings'],
  updated: '2026-11-25',
  inputs: [
    { id: 'interest', label: 'Student loan interest paid in the year', type: 'number', prefix: '$', default: 1800, min: 0, step: 50, info: 'Box 1 of Form 1098-E, which arrives in January.' },
    { id: 'magi', label: 'Modified adjusted gross income (MAGI)', type: 'number', prefix: '$', default: 92500, min: 0, step: 500, info: 'Roughly your adjusted gross income for most filers; Publication 970 has the exact worksheet.' },
    { id: 'cap', label: 'Maximum deduction', type: 'number', prefix: '$', default: 2500, min: 0, step: 100, info: 'Check the current figure in IRS Publication 970.' },
    { id: 'start', label: 'Phase-out starts at MAGI of', type: 'number', prefix: '$', default: 85000, min: 0, step: 500, info: 'Depends on your filing status and tax year. Example value; confirm with the IRS.' },
    { id: 'end', label: 'Deduction ends at MAGI of', type: 'number', prefix: '$', default: 100000, min: 0, step: 500, info: 'Depends on your filing status and tax year. Example value; confirm with the IRS.' },
    { id: 'rate', label: 'Your marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 60, step: 1, info: 'Used to turn the deduction into dollars of tax saved.' },
  ],
  outputs: [
    { id: 'deduction', label: 'Estimated deduction', format: 'currency', primary: true, info: 'Smaller of interest paid and the cap, reduced by the phase-out share.' },
    { id: 'taxSaved', label: 'Estimated tax saved', format: 'currency', info: 'Deduction × marginal rate.' },
    { id: 'lost', label: 'Deduction lost to phase-out', format: 'currency', info: 'Eligible amount minus the deduction you keep.' },
  ],
  compute: (v) => {
    const interest = num(v.interest), magi = num(v.magi), cap = num(v.cap), start = num(v.start), end = num(v.end), rate = num(v.rate);
    if (interest === null || magi === null || cap === null || start === null || end === null || rate === null) return { deduction: null };
    if (interest < 0 || magi < 0 || cap < 0 || start < 0) return { deduction: null, error: 'Amounts cannot be negative.' };
    if (end <= start) return { deduction: null, error: 'The phase-out end must be above the phase-out start.' };
    if (rate < 0 || rate > 60) return { deduction: null, error: 'Enter a tax rate from 0% to 60%.' };
    const eligible = Math.min(interest, cap);
    const share = magi <= start ? 0 : magi >= end ? 1 : (magi - start) / (end - start);
    const deduction = eligible * (1 - share);
    const taxSaved = deduction * rate / 100;
    const lost = eligible - deduction;
    return {
      deduction, taxSaved, lost,
      tone: share >= 1 ? 'bad' : share > 0 ? 'warn' : 'good',
      badge: share >= 1 ? 'Phased out completely at this income' : share > 0 ? `${(share * 100).toFixed(0)}% of the deduction phased out` : 'No phase-out at this income',
      chart: {
        type: 'bar',
        title: 'Your student loan interest deduction',
        categories: ['Deduction kept', 'Lost to phase-out'],
        series: [{ name: 'Amount', values: [deduction, lost] }],
        format: { format: 'currency' },
      },
      steps: [
        `Eligible interest = smaller of ${usd(interest)} and ${usd(cap)} = ${usd(eligible)}`,
        `Phase-out share = (${usd(magi)} − ${usd(start)}) ÷ (${usd(end)} − ${usd(start)}) = ${(share * 100).toFixed(1)}%`,
        `Deduction = ${usd(eligible)} × (1 − ${(share * 100).toFixed(1)}%) = ${usd(deduction)}`,
        `Tax saved = ${usd(deduction)} × ${rate}% = ${usd(taxSaved)}`,
      ],
      note: 'Estimate only. Filing status, who is eligible to claim it and the exact MAGI worksheet are not checked. Use IRS Publication 970 for your tax year.',
    };
  },
  content: {
    formula: ['Eligible interest = smaller of interest paid and the cap', 'Phase-out share = (MAGI − start) ÷ (end − start), kept between 0% and 100%', 'Deduction = eligible interest × (1 − phase-out share)', 'Tax saved = deduction × marginal rate'],
    body: [
      'The student loan interest deduction lowers your taxable income by the interest you paid on qualified student loans, up to a yearly cap. Above a certain income the deduction shrinks in a straight line and then disappears. This calculator applies that straight-line rule to the numbers you enter.',
      'Example: $1,800 of interest, MAGI of $92,500, a $2,500 cap and a phase-out from $85,000 to $100,000. The phase-out share is $7,500 ÷ $15,000 = 50%, so the deduction is $900 and, at a 22% rate, saves $198. Second example: $3,100 of interest and MAGI of $70,000 gives the full $2,500 cap, worth $300 at 12%.',
      'The cap and the income range change by tax year and filing status, so they are inputs here. The values filled in are examples; confirm yours in IRS Publication 970. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much student loan interest can I deduct?', a: 'The smaller of the interest you paid and the yearly cap, then reduced if your income is in the phase-out range. With $1,800 paid and a $2,500 cap, the starting amount is $1,800.' },
      { q: 'How does the income phase-out work?', a: 'Between the start and end of the range the deduction falls in a straight line. At MAGI of $92,500 in an $85,000 to $100,000 range, half is lost, so $1,800 becomes $900.' },
      { q: 'How much tax does the deduction save?', a: 'The deduction times your marginal rate. A $900 deduction at 22% saves $198; a $2,500 deduction at 12% saves $300.' },
      { q: 'Where do I find the interest I paid?', a: 'Your servicer sends Form 1098-E in January if you paid $600 or more. Smaller amounts may still be deductible; check your servicer account.' },
      { q: 'Are the cap and income limits filled in correctly?', a: 'They are example values, not a promise for your tax year or filing status. Look them up in IRS Publication 970 and overwrite them.' },
    ],
    sources: [
      { label: 'IRS: Topic no. 456, Student loan interest deduction', url: 'https://www.irs.gov/taxtopics/tc456' },
      { label: 'IRS Publication 970: Tax Benefits for Education', url: 'https://www.irs.gov/publications/p970' },
    ],
  },
  related: ['student-loan-payoff', 'student-loan-accrual', 'standard-vs-itemized', 'bracket-headroom'],
  examples: [
    // eligible 1800; share 7500/15000=0.5; ded 900; saved 198; lost 900
    { values: { interest: 1800, magi: 92500, cap: 2500, start: 85000, end: 100000, rate: 22 }, expect: { deduction: 900, taxSaved: 198, lost: 900 }, tolerance: 0.01 },
    // eligible min(3100,2500)=2500; no phase-out; saved 300
    { values: { interest: 3100, magi: 70000, cap: 2500, start: 85000, end: 100000, rate: 12 }, expect: { deduction: 2500, taxSaved: 300, lost: 0 }, tolerance: 0.01 },
  ],
});
