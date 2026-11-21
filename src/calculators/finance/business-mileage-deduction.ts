import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'business-mileage-deduction',
  title: 'Business Mileage Deduction Calculator',
  category: 'finance',
  description: 'Turn your yearly business miles into a tax deduction at the IRS standard mileage rate, and see roughly how much tax it could save you.',
  keywords: ['business mileage deduction calculator', 'standard mileage rate calculator', 'mileage deduction', 'self employed mileage tax deduction', 'gig driver mileage deduction', 'irs mileage rate'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'miles', label: 'Business miles driven this year', type: 'number', suffix: 'miles', default: 9000, min: 0, step: 100, info: 'From your mileage log. Commuting between home and a regular workplace does not count.' },
    { id: 'rate', label: 'Standard mileage rate', type: 'number', suffix: '¢ per mile', default: 70, min: 0, step: 0.5, info: 'The IRS sets this each year (70 cents for 2025). Check irs.gov for the year you are filing.' },
    { id: 'tax', label: 'Your combined tax rate', type: 'number', suffix: '%', default: 30, min: 0, max: 60, step: 1, info: 'Income tax bracket plus about 15.3% self-employment tax, if self-employed. Used only for the savings estimate.' },
  ],
  outputs: [
    { id: 'deduction', label: 'Mileage deduction', format: 'currency', primary: true, info: 'Business miles × the standard mileage rate.' },
    { id: 'saved', label: 'Estimated tax saved', format: 'currency', info: 'Deduction × your combined tax rate.' },
    { id: 'perMile', label: 'Tax saved per mile', format: 'currency', precision: 3, info: 'Rate per mile × your tax rate.' },
    { id: 'perMonth', label: 'Deduction per month', format: 'currency', info: 'The deduction spread over 12 months.' },
  ],
  compute: (v) => {
    const miles = num(v.miles);
    const rate = num(v.rate);
    const tax = num(v.tax);
    if (miles === null || rate === null || tax === null) return { deduction: null };
    if (miles < 0 || rate < 0 || tax < 0) return { deduction: null };
    const perMileRate = rate / 100;
    const deduction = miles * perMileRate;
    const saved = deduction * (tax / 100);
    const perMile = perMileRate * (tax / 100);
    return {
      deduction,
      saved,
      perMile,
      perMonth: deduction / 12,
      tone: 'ok',
      badge: `${money(saved, 0)} tax saved`,
      chart: {
        type: 'bar',
        title: 'Deduction vs tax saved',
        categories: ['Deduction', 'Tax saved'],
        format: { format: 'currency' },
        series: [{ name: 'Amount', values: [deduction, saved] }],
      },
      steps: [
        `Deduction = ${miles.toLocaleString('en-US')} miles × ${money(perMileRate, 3)} = ${money(deduction, 2)}`,
        `Tax saved = ${money(deduction, 2)} × ${tax}% = ${money(saved, 2)}`,
      ],
      note: 'This is a planning estimate, not tax advice. You need a contemporaneous log (date, miles, purpose). You choose between the standard mileage rate and actual car expenses, and the standard rate already covers gas, depreciation and upkeep, so do not deduct those again.',
    };
  },
  content: {
    formula: [
      'Mileage deduction = business miles × standard mileage rate',
      'Estimated tax saved = deduction × combined tax rate',
    ],
    body: [
      'If you drive for work as a freelancer, contractor or gig driver, you can usually deduct your business miles instead of tracking every car expense. The IRS publishes a standard mileage rate each year, and the deduction is simply miles times that rate.',
      'The rate is an input here because it changes from year to year. Enter the rate for the tax year you are filing, then add your combined tax rate to see roughly how much the deduction saves you.',
    ],
    sections: [
      {
        heading: 'What counts as business miles',
        paragraphs: [
          'Driving between job sites, to clients, to pick up supplies or to make deliveries counts. Commuting from home to a regular workplace does not. Keep a log with the date, miles and reason for each trip, since the IRS can ask for it.',
        ],
      },
    ],
    faq: [
      { q: 'How is the mileage deduction calculated?', a: 'Multiply your business miles by the standard mileage rate. For 9,000 miles at 70 cents per mile, the deduction is $6,300.' },
      { q: 'How much tax does it save?', a: 'The deduction times your combined tax rate. A $6,300 deduction at a 30% combined rate saves about $1,890.' },
      { q: 'What is the standard mileage rate?', a: 'A cents-per-mile figure the IRS announces each year for business driving. It was 70 cents per mile for 2025. Check irs.gov for the current year.' },
      { q: 'Can I deduct gas as well?', a: 'No. The standard rate already includes gas, wear and depreciation. The alternative is the actual-expense method, which uses real receipts instead.' },
      { q: 'Does commuting count?', a: 'No. Driving from home to a regular place of work is a personal commute and is not deductible.' },
    ],
    sources: [
      { label: 'IRS: Standard mileage rates', url: 'https://www.irs.gov/tax-professionals/standard-mileage-rates' },
    ],
  },
  related: ['gas-cost', 'commute-cost', 'freelance-rate', 'home-office-deduction'],
  examples: [
    {
      // 9000 × 0.70 = 6300; saved 6300 × 0.30 = 1890; per mile 0.70 × 0.30 = 0.21; per month 525.
      values: { miles: 9000, rate: 70, tax: 30 },
      expect: { deduction: 6300, saved: 1890, perMile: 0.21, perMonth: 525 },
      tolerance: 0.001,
    },
    {
      // 12000 × 0.67 = 8040; saved × 0.22 = 1768.8; per mile 0.1474; per month 670.
      values: { miles: 12000, rate: 67, tax: 22 },
      expect: { deduction: 8040, saved: 1768.8, perMile: 0.1474, perMonth: 670 },
      tolerance: 0.001,
    },
  ],
});
