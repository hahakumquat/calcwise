import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default defineCalculator({
  slug: 'charitable-giving-tax-value',
  title: 'Charitable Giving Bunching Calculator',
  category: 'finance',
  description: 'See whether giving two years of donations in one year (bunching) beats giving evenly, by comparing standard and itemized deductions and the tax you save.',
  keywords: ['charitable bunching calculator', 'donation bunching standard deduction', 'donor advised fund bunching', 'charitable deduction itemize vs standard', 'is my charity donation tax deductible', 'how much tax do i save donating'],
  updated: '2026-11-23',
  inputs: [
    { id: 'std', label: 'Standard deduction', type: 'number', prefix: '$', default: 32200, min: 0, step: 100, info: 'The standard deduction for your filing status and year. Check the IRS figure; it changes each year.' },
    { id: 'other', label: 'Other itemized deductions per year', type: 'number', prefix: '$', default: 24000, min: 0, step: 500, info: 'Mortgage interest, state and local taxes (up to the cap), medical costs above the floor, and so on. Not counting charity.' },
    { id: 'gift', label: 'Charitable giving per year', type: 'number', prefix: '$', default: 6000, min: 0, step: 250, info: 'What you give each year to qualifying charities.' },
    { id: 'rate', label: 'Marginal tax rate', type: 'number', suffix: '%', default: 22, min: 0, max: 60, step: 1, info: 'Your federal rate on the last dollar of income. The deduction saves this share of each deducted dollar.' },
  ],
  outputs: [
    { id: 'saved', label: 'Extra tax saved by bunching over 2 years', format: 'currency', primary: true, info: 'Marginal rate × the extra deductions from bunching. Zero if bunching does not help.' },
    { id: 'extra', label: 'Extra deductions from bunching', format: 'currency', info: 'Two-year deductions when bunching minus two-year deductions when giving evenly.' },
    { id: 'evenDed', label: 'Deductions over 2 years, giving evenly', format: 'currency', info: 'Twice the larger of the standard deduction and other deductions plus one year of giving.' },
    { id: 'bunchDed', label: 'Deductions over 2 years, bunching', format: 'currency', info: 'Year 1 uses two years of giving; year 2 gives nothing and takes the larger of the standard deduction and other deductions.' },
  ],
  compute: (v) => {
    const std = num(v.std);
    const other = num(v.other);
    const gift = num(v.gift);
    const rate = num(v.rate);
    if (std === null || other === null || gift === null || rate === null) return { saved: null };
    if (std < 0 || other < 0 || gift < 0 || rate < 0) return { saved: null, error: 'Values cannot be negative.' };
    if (rate > 60) return { saved: null, error: 'Use a marginal rate of 60% or less.' };
    const evenYear = Math.max(std, other + gift);
    const evenDed = 2 * evenYear;
    const bunchYear1 = Math.max(std, other + 2 * gift);
    const bunchYear2 = Math.max(std, other);
    const bunchDed = bunchYear1 + bunchYear2;
    const extra = bunchDed - evenDed;
    const saved = extra * (rate / 100);
    return {
      saved,
      extra,
      evenDed,
      bunchDed,
      tone: extra > 0.005 ? 'good' : 'ok',
      badge: extra > 0.005 ? 'Bunching your gifts saves tax' : 'Bunching does not help here',
      chart: {
        type: 'bar',
        title: 'Total deductions over 2 years',
        categories: ['Give evenly', 'Bunch into one year'],
        series: [{ name: 'Deductions', values: [evenDed, bunchDed] }],
        format: { format: 'currency' },
      },
      steps: [
        `Giving evenly: 2 × the larger of ${usd(std)} and ${usd(other)} + ${usd(gift)} = 2 × ${usd(evenYear)} = ${usd(evenDed)}`,
        `Bunching, year 1: the larger of ${usd(std)} and ${usd(other)} + ${usd(2 * gift)} = ${usd(bunchYear1)}`,
        `Bunching, year 2: the larger of ${usd(std)} and ${usd(other)} = ${usd(bunchYear2)}`,
        `Extra deductions: ${usd(bunchDed)} − ${usd(evenDed)} = ${usd(extra)}`,
        `Tax saved: ${rate}% × ${usd(extra)} = ${usd(saved)}`,
      ],
      note: 'A simplified two-year comparison at one flat marginal rate. It does not include limits on charitable deductions as a share of income, a minimum floor on itemized charity, or any deduction available to people who take the standard deduction; check current IRS rules for those. The same total goes to charity either way, only the timing changes. Giving through a donor-advised fund lets you deduct in year 1 and still pay charities over time.',
    };
  },
  content: {
    formula: [
      'Giving evenly (2 years) = 2 × the larger of standard deduction and (other itemized + one year of giving)',
      'Bunching (2 years) = the larger of standard and (other + two years of giving), plus the larger of standard and other',
      'Extra deductions = bunching − giving evenly',
      'Tax saved = marginal rate × extra deductions',
    ],
    body: [
      'Charitable gifts only reduce your tax if your itemized deductions add up to more than the standard deduction. If you are a little below that line, giving a typical amount each year can leave you with no extra tax benefit at all.',
      'Bunching fixes this by timing. Instead of giving $6,000 each year, you give $12,000 in one year, enough to push you over the standard deduction and itemize, and then take the standard deduction in the next year. The same money reaches charities, but you deduct more over the two years.',
      'The calculator compares the two plans using your own standard deduction, other itemized deductions, giving and marginal tax rate. In the default example, bunching adds $3,800 of deductions over two years and saves $836.',
      'Treat the result as a planning estimate. Deduction limits, the rules for who can take a deduction without itemizing, and changes in tax law from year to year are not computed here, so check the current IRS guidance before you give.',
    ],
    faq: [
      { q: 'What is bunching charitable donations?', a: 'It means giving two or more years of donations in a single year so your itemized deductions pass the standard deduction, then taking the standard deduction in the other years.' },
      { q: 'How much tax can bunching save?', a: 'With a $32,200 standard deduction, $24,000 of other itemized deductions, $6,000 a year of giving and a 22% rate, bunching adds $3,800 of deductions over two years and saves $836.' },
      { q: 'Does bunching work if I already itemize every year?', a: 'No. If your other deductions plus one year of giving already exceed the standard deduction, every gift is already deductible, so bunching changes nothing and the calculator shows $0.' },
      { q: 'What is a donor-advised fund?', a: 'It is an account at a sponsoring charity where you make a large gift in one year, take the deduction then, and recommend grants to charities over later years. It is a common way to bunch.' },
      { q: 'Are these tax rules current?', a: 'The standard deduction and rules for charitable gifts change. Enter the current figures from the IRS, and check Publication 526 for what counts.' },
    ],
    sources: [
      { label: 'IRS Publication 526: Charitable Contributions', url: 'https://www.irs.gov/publications/p526' },
      { label: 'IRS Topic 506: Charitable contributions', url: 'https://www.irs.gov/taxtopics/tc506' },
    ],
  },
  related: ['standard-vs-itemized', 'donate-stock-vs-cash', 'capital-gains-tax'],
  examples: [
    // even year max(32200, 30000)=32200 → 64400; bunch 24000+12000=36000 + max(32200,24000)=32200 → 68200; extra 3800; saved 836
    { values: { std: 32200, other: 24000, gift: 6000, rate: 22 }, expect: { evenDed: 64400, bunchDed: 68200, extra: 3800, saved: 836 }, tolerance: 1e-6 },
    // already itemizing: other 40000 + gift 5000 = 45000 each year; bunching 50000 + 40000 = 90000 vs 90000 → 0
    { values: { std: 30000, other: 40000, gift: 5000, rate: 24 }, expect: { evenDed: 90000, bunchDed: 90000, extra: 0, saved: 0 }, tolerance: 1e-6 },
  ],
});
