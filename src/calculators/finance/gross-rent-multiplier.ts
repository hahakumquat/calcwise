import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'gross-rent-multiplier',
  title: 'Gross Rent Multiplier Calculator',
  category: 'finance',
  description: 'Work out the gross rent multiplier (GRM), gross rental yield and 1% rule check for a rental property from its price and monthly rent.',
  keywords: ['gross rent multiplier calculator', 'GRM calculator', 'gross rental yield calculator', '1% rule rental property', 'rent to price ratio'],
  updated: '2026-11-18',
  inputs: [
    { id: 'price', label: 'Purchase price', type: 'number', prefix: '$', default: 300000, min: 0, step: 5000, info: 'The price you would pay for the property.' },
    { id: 'rent', label: 'Monthly rent', type: 'number', prefix: '$', default: 2400, min: 0, step: 50, info: 'Total rent the property brings in per month, before any expenses or vacancy.' },
  ],
  outputs: [
    { id: 'grm', label: 'Gross rent multiplier', format: 'number', precision: 2, primary: true, info: 'Price ÷ annual rent. Lower means you pay fewer years of rent for the property.' },
    { id: 'annualRent', label: 'Annual rent', format: 'currency', precision: 0, info: 'Monthly rent × 12.' },
    { id: 'yield', label: 'Gross rental yield', format: 'percent', precision: 2, info: 'Annual rent ÷ price. It is 1 ÷ GRM and ignores all costs.' },
    { id: 'ratio', label: 'Monthly rent as % of price', format: 'percent', precision: 2, info: 'Monthly rent ÷ price. The 1% rule looks for at least 1%.' },
    { id: 'rentFor1', label: 'Rent needed to meet 1% rule', format: 'currency', precision: 0, info: 'Price × 1%, per month.' },
  ],
  compute: (v) => {
    const price = num(v.price) ?? 0, rent = num(v.rent) ?? 0;
    if (price <= 0) return { grm: null, error: 'Enter a purchase price above zero.' };
    if (rent <= 0) return { grm: null, error: 'Enter a monthly rent above zero.' };
    const annual = rent * 12;
    const grm = price / annual;
    const y = annual / price * 100;
    const ratio = rent / price * 100;
    const need = price * 0.01;
    const chart: ChartSpec = {
      type: 'bar',
      title: 'Monthly rent: yours vs 1% rule',
      categories: ['Actual rent', '1% rule rent'],
      series: [{ name: 'Per month', values: [rent, Math.round(need)] }],
      format: { format: 'currency' },
      highlight: 0,
    };
    return {
      chart,
      grm,
      annualRent: annual,
      yield: y,
      ratio,
      rentFor1: need,
      note: ratio >= 1
        ? 'This property meets the 1% rule of thumb on gross rent. Expenses, vacancy and financing still decide whether it makes money.'
        : 'This property is below the 1% rule of thumb on gross rent. That is common in expensive markets, so compare with similar local properties.',
      steps: [
        `Annual rent = ${money(rent, 0)} × 12 = ${money(annual, 0)}`,
        `GRM = ${money(price, 0)} ÷ ${money(annual, 0)} = ${Math.round(grm * 100) / 100}`,
        `Gross yield = ${money(annual, 0)} ÷ ${money(price, 0)} = ${Math.round(y * 100) / 100}%`,
      ],
    };
  },
  content: {
    formula: ['GRM = purchase price ÷ annual gross rent', 'Gross yield = annual rent ÷ price = 1 ÷ GRM', '1% rule: monthly rent ≥ 1% of price'],
    body: [
      'The gross rent multiplier is a quick way to compare rental properties. It tells you how many years of gross rent it would take to pay the purchase price. A GRM of 10 means the price equals ten years of rent.',
      'It uses only price and rent, so it ignores taxes, insurance, repairs, vacancy and financing. Use it to screen listings, then check the shortlist with a cap rate or cash flow calculation.',
      'The 1% rule is another screen: monthly rent should be at least 1% of the price. It is a rule of thumb, not a guarantee of profit.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: ['A $300,000 property rents for $2,400 a month. Annual rent is $28,800, so GRM = 300,000 ÷ 28,800 = 10.42 and the gross yield is 9.6%. Monthly rent is 0.8% of the price, below the 1% rule, which would need $3,000 a month.'],
      },
    ],
    faq: [
      { q: 'What is a good gross rent multiplier?', a: 'Lower is better for a buyer, but it depends on the market. Many investors look for single digits to the low teens. Compare against similar properties in the same area.' },
      { q: 'How do I calculate the gross rent multiplier?', a: 'Divide the purchase price by the annual rent. $300,000 ÷ ($2,400 × 12) = 10.42.' },
      { q: 'What is the difference between GRM and cap rate?', a: 'GRM uses gross rent and ignores expenses. Cap rate uses net operating income, which is rent minus operating costs, so it is a better measure of profit.' },
      { q: 'Does the 1% rule always apply?', a: 'No. It is a quick filter. In high-priced markets few properties meet it, and one that does can still lose money after costs.' },
    ],
    sources: [{ label: 'Investopedia: Gross Rent Multiplier (GRM)', url: 'https://www.investopedia.com/terms/g/gross-rent-multiplier.asp' }],
  },
  related: ['cap-rate-calculator', 'rent-vs-buy', 'ltv-ratio'],
  examples: [
    // annual 28800; 300000/28800=10.416667; yield 9.6; ratio 0.8; need 3000
    { values: { price: 300000, rent: 2400 }, expect: { grm: 10.416667, annualRent: 28800, yield: 9.6, ratio: 0.8, rentFor1: 3000 } },
    // annual 14400; 120000/14400=8.333333; yield 12; ratio 1; need 1200
    { values: { price: 120000, rent: 1200 }, expect: { grm: 8.333333, annualRent: 14400, yield: 12, ratio: 1, rentFor1: 1200 } },
  ],
});
