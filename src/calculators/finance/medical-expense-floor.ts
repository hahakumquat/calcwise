import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => '$' + n.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'medical-expense-floor',
  title: 'Medical Expense Deduction Floor Calculator',
  category: 'finance',
  description: 'See whether your medical bills clear the income floor for the itemized deduction, what is deductible and what it saves. Floor and standard deduction are inputs.',
  keywords: ['medical expense deduction calculator', 'medical expense deduction floor', '7.5% of AGI medical deduction', 'can I deduct medical expenses', 'medical expenses itemize or standard deduction'],
  updated: '2026-11-25',
  inputs: [
    { id: 'agi', label: 'Adjusted gross income (AGI)', type: 'number', prefix: '$', default: 80000, min: 0, step: 500, info: 'Line 11 of Form 1040.' },
    { id: 'floorPct', label: 'Floor as a share of AGI', type: 'number', suffix: '%', default: 7.5, min: 0, max: 100, step: 0.5, info: 'Example value. Confirm the current percentage on irs.gov.' },
    { id: 'medical', label: 'Medical expenses you paid', type: 'number', prefix: '$', default: 9500, min: 0, step: 100, info: 'Only expenses that qualify and that insurance did not repay.' },
    { id: 'other', label: 'Other itemized deductions', type: 'number', prefix: '$', default: 12000, min: 0, step: 100, info: 'Mortgage interest, state and local taxes, charity and so on.' },
    { id: 'standard', label: 'Standard deduction', type: 'number', prefix: '$', default: 14600, min: 0, step: 100, info: 'Depends on filing status and tax year. Example value; confirm with the IRS.' },
    { id: 'rate', label: 'Your marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 60, step: 1, info: 'Turns the extra deduction into dollars of tax saved.' },
  ],
  outputs: [
    { id: 'deductible', label: 'Deductible medical expenses', format: 'currency', primary: true, info: 'Medical expenses above the floor, never below zero.' },
    { id: 'taxSaved', label: 'Estimated tax saved', format: 'currency', info: 'Extra deduction over the better of standard or other itemized, times your rate.' },
    { id: 'floor', label: 'Floor (share of AGI)', format: 'currency', info: 'AGI × floor percentage.' },
    { id: 'gap', label: 'Short of the floor', format: 'currency', info: 'How much more medical spending it would take to reach the floor.' },
  ],
  compute: (v) => {
    const agi = num(v.agi), pct = num(v.floorPct), medical = num(v.medical), other = num(v.other), standard = num(v.standard), rate = num(v.rate);
    if (agi === null || pct === null || medical === null || other === null || standard === null || rate === null) return { deductible: null };
    if (agi < 0 || medical < 0 || other < 0 || standard < 0) return { deductible: null, error: 'Amounts cannot be negative.' };
    if (pct < 0 || pct > 100) return { deductible: null, error: 'Enter a floor from 0% to 100%.' };
    if (rate < 0 || rate > 60) return { deductible: null, error: 'Enter a tax rate from 0% to 60%.' };
    const floor = agi * pct / 100;
    const deductible = Math.max(0, medical - floor);
    const gap = Math.max(0, floor - medical);
    const benefit = Math.max(other + deductible, standard) - Math.max(other, standard);
    const taxSaved = benefit * rate / 100;
    return {
      deductible, taxSaved, floor, gap,
      tone: benefit > 0 ? 'good' : deductible > 0 ? 'warn' : 'bad',
      badge: benefit > 0 ? 'Medical expenses add to your deduction' : deductible > 0 ? 'Above the floor, but the standard deduction still wins' : 'Below the floor: no medical deduction',
      chart: {
        type: 'bar',
        title: 'Medical expenses against the floor',
        categories: ['Floor', 'Your expenses', 'Deductible'],
        series: [{ name: 'Amount', values: [floor, medical, deductible] }],
        format: { format: 'currency' },
      },
      steps: [
        `Floor = ${usd(agi)} × ${pct}% = ${usd(floor)}`,
        `Deductible = larger of 0 and (${usd(medical)} − ${usd(floor)}) = ${usd(deductible)}`,
        `Extra deduction = larger of (${usd(other)} + ${usd(deductible)}) and ${usd(standard)}, minus larger of ${usd(other)} and ${usd(standard)} = ${usd(benefit)}`,
        `Tax saved = ${usd(benefit)} × ${rate}% = ${usd(taxSaved)}`,
      ],
      note: 'Estimate only. Which expenses qualify, the current floor percentage and your standard deduction are yours to check on irs.gov. Not tax advice.',
    };
  },
  content: {
    formula: ['Floor = AGI × floor percentage', 'Deductible medical = larger of 0 and (medical expenses − floor)', 'Extra deduction = larger of (other itemized + deductible medical) and standard deduction, minus larger of other itemized and standard deduction', 'Tax saved = extra deduction × marginal rate'],
    body: [
      'Only the part of your medical bills above a share of your income can be deducted, and only if you itemize. So the real question is twice over: do the bills clear the floor, and does itemizing then beat the standard deduction? This calculator answers both with the numbers you enter.',
      'Example: AGI of $80,000 and a 7.5% floor gives a floor of $6,000. With $9,500 of medical bills, $3,500 is deductible. Other itemized deductions of $12,000 plus $3,500 is $15,500, which beats a $14,600 standard deduction by $900, saving $198 at 22%. Second example: AGI of $60,000 has a $4,500 floor, so $4,000 of bills is $500 short and deducts nothing.',
      'The floor percentage and the standard deduction change by year and filing status, so they are inputs. The values filled in are examples; confirm yours on irs.gov. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much of my medical expenses can I deduct?', a: 'Only the amount above the floor. With an $80,000 AGI and a 7.5% floor, the first $6,000 does not count, so $9,500 of bills deducts $3,500.' },
      { q: 'Why is my tax saved $0 when I am over the floor?', a: 'The deduction only helps if itemizing beats the standard deduction. If other itemized deductions plus the medical amount stay under the standard deduction, nothing changes.' },
      { q: 'How much more would I need to spend to reach the floor?', a: 'The "short of the floor" figure shows it. At a $4,500 floor and $4,000 of bills, you are $500 short.' },
      { q: 'Which expenses count?', a: 'This calculator does not check that. Qualifying expenses and what insurance repaid are covered in IRS Publication 502; enter only what qualifies.' },
      { q: 'Are the floor and standard deduction filled in correctly?', a: 'They are example values, not a promise for your tax year or filing status. Look them up on irs.gov and overwrite them.' },
    ],
    sources: [
      { label: 'IRS: Topic no. 502, Medical and dental expenses', url: 'https://www.irs.gov/taxtopics/tc502' },
      { label: 'IRS Publication 502: Medical and Dental Expenses', url: 'https://www.irs.gov/publications/p502' },
    ],
  },
  related: ['standard-vs-itemized', 'hsa-invest-vs-spend', 'write-off-value', 'bracket-headroom'],
  examples: [
    // floor 6000; ded 3500; 15500-14600=900; saved 198; gap 0
    { values: { agi: 80000, floorPct: 7.5, medical: 9500, other: 12000, standard: 14600, rate: 22 }, expect: { deductible: 3500, taxSaved: 198, floor: 6000, gap: 0 }, tolerance: 0.01 },
    // floor 4500; ded 0; saved 0; gap 500
    { values: { agi: 60000, floorPct: 7.5, medical: 4000, other: 12000, standard: 14600, rate: 22 }, expect: { deductible: 0, taxSaved: 0, floor: 4500, gap: 500 }, tolerance: 0.01 },
  ],
});
