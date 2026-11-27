import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';

export default defineCalculator({
  slug: 'rental-rules-screen',
  title: 'Rental 1% and 50% Rule Calculator',
  seoTitle: 'Rental 1% and 50% Rule Calculator',
  metaDescription: 'Screen a rental property with the 1 percent, 2 percent and 50 percent rules: rent to price ratio, rent needed to pass, and rough monthly cash flow.',
  updated: '2026-11-27',
  category: 'finance',
  description: 'Quick rental screen: does the rent pass the 1% and 2% rules, and what is left after the 50% rule and the mortgage payment.',
  keywords: ['1 percent rule rental calculator', '2 percent rule real estate', '50 percent rule rental', 'rental property rules of thumb', 'rent to price ratio'],
  popular: false,
  inputs: [
    { id: 'price', label: 'Purchase price', type: 'number', prefix: '$', default: 190000, min: 1, step: 1000, info: 'The price you would pay for the property.' },
    { id: 'rent', label: 'Monthly rent', type: 'number', prefix: '$', default: 1900, min: 0, step: 50, info: 'Expected monthly rent.' },
    { id: 'mortgage', label: 'Monthly mortgage payment (optional)', type: 'number', prefix: '$', default: 900, min: 0, step: 25, info: 'Principal and interest only. Use 0 to skip.' },
    { id: 'expPct', label: 'Expenses as a share of rent', type: 'number', suffix: '%', default: 50, min: 0, max: 100, step: 1, info: 'The 50% rule assumes half of rent goes to taxes, insurance, repairs, vacancy and management.' },
  ],
  outputs: [
    { id: 'ratio', label: 'Monthly rent as % of price', format: 'number', precision: 2, suffix: '%', primary: true, info: 'Rent ÷ price × 100.' },
    { id: 'need1', label: 'Rent needed for the 1% rule', format: 'currency', precision: 0, info: 'The monthly rent that would be 1% of the purchase price.' },
    { id: 'need2', label: 'Rent needed for the 2% rule', format: 'currency', precision: 0, info: 'The monthly rent that would be 2% of the purchase price.' },
    { id: 'avail', label: 'Rent left after expenses', format: 'currency', precision: 0, info: 'Rent × (1 − expense share).' },
    { id: 'flow', label: 'Rough monthly cash flow', format: 'currency', precision: 0, info: 'Rent left after expenses minus the mortgage payment.' },
  ],
  compute: (v) => {
    const p = num(v.price), r = num(v.rent), m = num(v.mortgage), e = num(v.expPct);
    if (p === null || r === null || m === null || e === null) return { ratio: null };
    if (p <= 0) return { ratio: null, error: 'Enter a purchase price above zero.' };
    if (r < 0 || m < 0 || e < 0 || e > 100) return { ratio: null, error: 'Rent and payment cannot be negative, and the expense share must be 0 to 100%.' };
    const ratio = r / p * 100;
    const avail = r * (1 - e / 100);
    const flow = avail - m;
    const pass = ratio >= 2 ? 'Passes the 1% and 2% rules' : ratio >= 1 ? 'Passes 1%, fails 2%' : 'Fails the 1% rule';
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Monthly rent split ($)',
      categories: ['Expenses', 'Mortgage', 'Cash flow'],
      series: [{ name: 'Per month', values: [r - avail, m, flow] }],
      format: { format: 'currency' },
    };
    return {
      ratio, need1: p * 0.01, need2: p * 0.02, avail, flow,
      tone: ratio >= 1 && flow >= 0 ? 'ok' : 'warn',
      badge: pass,
      chart,
      steps: [
        `Rent ÷ price = $${r} ÷ $${p} = ${+ratio.toFixed(2)}%`,
        `Expenses at ${e}% = $${+(r - avail).toFixed(2)}, left = $${+avail.toFixed(2)}`,
        `Cash flow = $${+avail.toFixed(2)} − $${m} = $${+flow.toFixed(2)}`,
      ],
      note: 'These are rough screens. They ignore taxes, vacancy, repairs, financing terms and local costs. Arithmetic, not investment advice.',
    };
  },
  content: {
    formula: [
      'Rent to price = monthly rent ÷ purchase price',
      '1% rule passes if rent to price is at least 1%; 2% rule if at least 2%',
      'Rent left after expenses = rent × (1 − expense share), 50% by default',
      'Cash flow = rent left after expenses − mortgage payment',
    ],
    body: [
      'Investors use quick rules of thumb to decide which listings deserve a closer look. The 1% rule says monthly rent should be at least 1% of the purchase price; the 2% rule asks for 2%. The 50% rule assumes about half of the rent goes to operating costs, so only the other half is available for the mortgage.',
      'Enter the price, the rent and, if you have it, the principal and interest payment. The calculator shows the rent-to-price ratio, the rent each rule needs and a rough monthly cash flow.',
      'These screens are crude on purpose. Taxes, insurance and vacancy vary widely by place, so treat a pass as a reason to run the numbers properly, not a verdict.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A $190,000 property renting for $1,900 has a rent-to-price ratio of 1.00%, so it passes the 1% rule and fails the 2% rule, which would need $3,800. At 50% expenses, $950 is left; with a $900 mortgage payment that is $50 a month of cash flow.',
        ],
      },
      {
        heading: 'Related tools',
        paragraphs: [
          'The gross rent multiplier, cap rate and cash-on-cash return calculators go deeper once a listing passes the screen.',
        ],
      },
    ],
    faq: [
      { q: 'What is the 1% rule in real estate?', a: 'Monthly rent should be at least 1% of the purchase price. For a $190,000 property that is $1,900 a month.' },
      { q: 'What is the 2% rule?', a: 'A stricter version asking for monthly rent of at least 2% of the price, $3,800 on a $190,000 property. It is rare in expensive markets.' },
      { q: 'What is the 50% rule?', a: 'It assumes about half of gross rent goes to operating expenses (not the mortgage), so $1,900 of rent leaves about $950 to cover the mortgage.' },
      { q: 'Do these rules guarantee a good investment?', a: 'No. They ignore local taxes, vacancy, repairs and financing. Use them only to filter listings.' },
    ],
    sources: [],
  },
  related: ['gross-rent-multiplier', 'cap-rate-calculator', 'cash-on-cash-return'],
  examples: [
    // 1900/190000=1%; need1 1900; need2 3800; avail 950; flow 50
    { values: { price: 190000, rent: 1900, mortgage: 900, expPct: 50 }, expect: { ratio: 1, need1: 1900, need2: 3800, avail: 950, flow: 50 }, tolerance: 1e-6 },
    // 150000, rent 3000 => 2%; avail 3000*.6=1800; flow 1800-1000=800
    { values: { price: 150000, rent: 3000, mortgage: 1000, expPct: 40 }, expect: { ratio: 2, need1: 1500, need2: 3000, avail: 1800, flow: 800 }, tolerance: 1e-6 },
  ],
});
