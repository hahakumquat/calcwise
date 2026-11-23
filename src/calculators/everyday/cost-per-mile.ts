import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'cost-per-mile',
  title: 'Cost Per Mile of Owning a Car',
  seoTitle: 'Cost Per Mile of Owning a Car',
  metaDescription: 'Add fuel, insurance, maintenance, fees, depreciation and loan interest to see what your car really costs per mile, per month and per day.',
  updated: '2026-11-23',
  category: 'everyday',
  description: 'Work out the true cost per mile of owning a car from fuel, insurance, maintenance, fees, depreciation and loan interest, and what it costs each month and day.',
  keywords: ['cost per mile calculator', 'true cost of owning a car', 'car cost per mile', 'cost of car ownership calculator', 'how much does my car cost per month'],
  popular: false,
  inputs: [
    { id: 'miles', label: 'Miles per year', type: 'number', default: 12000, min: 1, step: 500, info: 'How far you drive in a year. Your odometer at two dates gives a real figure.' },
    { id: 'mpg', label: 'Fuel economy', type: 'number', suffix: 'mpg', default: 30, min: 1, step: 1, info: 'Miles per US gallon in your real driving.' },
    { id: 'price', label: 'Fuel price', type: 'number', prefix: '$', suffix: 'per gal', default: 3.5, min: 0, step: 0.01, info: 'Price of a US gallon of fuel.' },
    { id: 'insurance', label: 'Insurance per year', type: 'number', prefix: '$', default: 1800, min: 0, step: 50, info: 'Your total premium for the year.' },
    { id: 'maintenance', label: 'Maintenance and tires per year', type: 'number', prefix: '$', default: 900, min: 0, step: 50, info: 'Servicing, repairs and tires, averaged over a year.' },
    { id: 'fees', label: 'Registration and fees per year', type: 'number', prefix: '$', default: 250, min: 0, step: 10, info: 'Registration, inspection, parking permits and similar yearly costs.' },
    { id: 'purchase', label: 'Purchase price', type: 'number', prefix: '$', default: 28000, min: 0, step: 500, info: 'What you paid, or the car\'s value today if you want to cost from now.' },
    { id: 'resale', label: 'Expected resale value', type: 'number', prefix: '$', default: 16000, min: 0, step: 500, info: 'What you expect to sell it for at the end of the years below.' },
    { id: 'years', label: 'Years you will own it', type: 'number', default: 4, min: 0.5, step: 0.5, info: 'Depreciation per year is (purchase - resale) ÷ years.' },
    { id: 'loan', label: 'Loan interest per year', type: 'number', prefix: '$', optional: true, min: 0, step: 50, info: 'Interest paid on a car loan in a year. Leave blank if none.' },
    { id: 'compare', label: 'Compare with a rate per mile', type: 'number', prefix: '$', optional: true, min: 0, step: 0.01, info: 'Optional. A rate you want to compare with, such as a mileage reimbursement. Leave blank to skip.' },
  ],
  outputs: [
    { id: 'perMile', label: 'Cost per mile', format: 'currency', precision: 2, primary: true, info: 'Total yearly cost ÷ miles per year.' },
    { id: 'total', label: 'Total cost per year', format: 'currency', info: 'Fuel + insurance + maintenance + fees + depreciation + loan interest.' },
    { id: 'perMonth', label: 'Cost per month', format: 'currency', precision: 2, info: 'Total yearly cost ÷ 12.' },
    { id: 'perDay', label: 'Cost per day', format: 'currency', precision: 2, info: 'Total yearly cost ÷ 365.' },
    { id: 'fuel', label: 'Fuel per year', format: 'currency', info: 'Miles ÷ mpg × fuel price.' },
    { id: 'depreciation', label: 'Depreciation per year', format: 'currency', info: '(Purchase price - resale value) ÷ years.' },
  ],
  compute: (v) => {
    const miles = num(v.miles), mpg = num(v.mpg), price = num(v.price);
    const insurance = num(v.insurance), maint = num(v.maintenance), fees = num(v.fees);
    const purchase = num(v.purchase), resale = num(v.resale), years = num(v.years);
    const loan = num(v.loan) ?? 0;
    const compare = num(v.compare);
    if ([miles, mpg, price, insurance, maint, fees, purchase, resale, years].some((x) => x === null)) return { perMile: null };
    if ([miles!, price!, insurance!, maint!, fees!, purchase!, resale!, loan].some((x) => x < 0)) return { perMile: null, error: 'Amounts cannot be negative.' };
    if (miles! <= 0) return { perMile: null, error: 'Miles per year must be above 0.' };
    if (mpg! <= 0) return { perMile: null, error: 'Fuel economy must be above 0.' };
    if (years! <= 0) return { perMile: null, error: 'Years of ownership must be above 0.' };
    const fuel = (miles! / mpg!) * price!;
    const dep = (purchase! - resale!) / years!;
    const total = fuel + insurance! + maint! + fees! + dep + loan;
    const perMile = total / miles!;
    const perMonth = total / 12;
    const perDay = total / 365;
    let badge = `${money(perMonth, 0)} a month to keep it on the road`;
    if (compare !== null) {
      const diff = (perMile - compare) * miles!;
      badge = diff > 0
        ? `${money(perMile, 2)} per mile is ${money(diff, 0)} a year above ${money(compare, 2)}`
        : `${money(perMile, 2)} per mile is ${money(-diff, 0)} a year at or below ${money(compare, 2)}`;
    }
    const chart: ChartSpec = {
      type: 'donut',
      title: 'Where the money goes',
      format: { format: 'currency' },
      slices: [
        { label: 'Fuel', value: fuel },
        { label: 'Insurance', value: insurance! },
        { label: 'Maintenance and tires', value: maint! },
        { label: 'Registration and fees', value: fees! },
        { label: 'Depreciation', value: Math.max(dep, 0) },
        { label: 'Loan interest', value: loan },
      ].filter((s) => s.value > 0),
      centerValue: money(perMile, 2),
      centerLabel: 'per mile',
    };
    return {
      perMile, total, perMonth, perDay, fuel, depreciation: dep,
      tone: 'ok',
      badge,
      chart: total > 0 ? chart : undefined,
      steps: [
        `Fuel = ${miles} ÷ ${mpg} mpg × ${money(price!, 2)} = ${money(fuel, 2)}`,
        `Depreciation = (${money(purchase!, 0)} - ${money(resale!, 0)}) ÷ ${years} = ${money(dep, 2)}`,
        `Total = fuel + ${money(insurance!, 0)} + ${money(maint!, 0)} + ${money(fees!, 0)} + depreciation + ${money(loan, 0)} = ${money(total, 2)}`,
        `Per mile = ${money(total, 2)} ÷ ${miles} = ${money(perMile, 4)}`,
      ],
      note: 'Every cost is your own estimate. A resale value higher than the purchase price gives negative depreciation, which lowers the total.',
    };
  },
  content: {
    formula: [
      'Fuel = miles ÷ mpg × price per gallon',
      'Depreciation per year = (purchase price - resale value) ÷ years owned',
      'Total per year = fuel + insurance + maintenance + fees + depreciation + loan interest',
      'Cost per mile = total ÷ miles; per month = total ÷ 12; per day = total ÷ 365',
    ],
    body: [
      'Most people think of a car in terms of the fuel bill, but fuel is often well under half of what it costs. Insurance, maintenance, fees and the value the car loses each year all count, and they are paid whether you drive or not.',
      'Enter your own figures for each line. The calculator does not assume any of them, and it works for any car, including an electric one if you enter the equivalent fuel cost as miles ÷ mpg × price.',
      'Because the fixed costs are spread over your miles, driving fewer miles raises the cost of each one. Try changing miles per year to see how much of the cost does not move.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'Drive 12,000 miles a year at 30 mpg with fuel at $3.50: 12,000 ÷ 30 × 3.50 = $1,400. Add $1,800 insurance, $900 maintenance and $250 fees. A $28,000 car resold for $16,000 after 4 years loses ($28,000 - $16,000) ÷ 4 = $3,000 a year.',
          'The total is $7,350 a year. That is $7,350 ÷ 12,000 = $0.6125 per mile (about $0.61), $612.50 a month and $20.14 a day.',
        ],
      },
      {
        heading: 'Using the result',
        paragraphs: [
          'Compare the figure with the gas cost calculator for fuel alone, the keep or replace car calculator to weigh repairs against a new payment, or the business mileage deduction calculator if you drive for work.',
        ],
      },
    ],
    faq: [
      { q: 'What is the cost per mile of owning a car?', a: 'It is all yearly costs divided by the miles you drive. With $7,350 of costs and 12,000 miles, it is $0.6125 per mile, about $0.61.' },
      { q: 'How is depreciation counted?', a: 'As the purchase price minus the expected resale value, divided by the years you own the car. $28,000 down to $16,000 over 4 years is $3,000 a year.' },
      { q: 'Should I include loan interest?', a: 'Include only the interest, not the principal, because the principal buys the car and is already counted in depreciation. Leave it blank if you have no loan.' },
      { q: 'Why does driving less cost more per mile?', a: 'Insurance, fees and depreciation barely change with miles, so fewer miles share the same fixed costs. Only fuel and some maintenance scale with distance.' },
    ],
    sources: [
      { label: 'US DOE fuel economy: fuel cost and mpg basics', url: 'https://www.fueleconomy.gov/' },
    ],
  },
  related: ['gas-cost', 'keep-vs-replace-car', 'business-mileage-deduction', 'commute-cost'],
  examples: [
    // fuel 12000/30*3.5=1400; dep (28000-16000)/4=3000; total 1400+1800+900+250+3000=7350; /12000=.6125; /12=612.5; /365=20.136986
    { values: { miles: 12000, mpg: 30, price: 3.5, insurance: 1800, maintenance: 900, fees: 250, purchase: 28000, resale: 16000, years: 4 }, expect: { total: 7350, perMile: 0.6125, perMonth: 612.5, perDay: 20.136986, fuel: 1400, depreciation: 3000 }, tolerance: 1e-4 },
    // + loan 600 -> 7950; /12000 = 0.6625
    { values: { miles: 12000, mpg: 30, price: 3.5, insurance: 1800, maintenance: 900, fees: 250, purchase: 28000, resale: 16000, years: 4, loan: 600 }, expect: { total: 7950, perMile: 0.6625 }, tolerance: 1e-6 },
  ],
});
