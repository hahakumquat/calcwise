import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const annualDebt = (p: number, apr: number, years: number) => {
  const n = years * 12;
  const i = apr / 100 / 12;
  return 12 * (i === 0 ? p / n : (p * i) / (1 - (1 + i) ** -n));
};

export default defineCalculator({
  slug: 'cash-on-cash-return',
  title: 'Cash on Cash Return Calculator',
  category: 'finance',
  description: 'Work out the cash-on-cash return on a rental property from price, down payment, closing costs, rehab, rent, vacancy, operating costs and loan terms.',
  keywords: ['cash on cash return calculator', 'cash on cash return', 'rental property cash flow', 'real estate investment return', 'rental property roi', 'net operating income'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'price', label: 'Purchase price', type: 'number', prefix: '$', default: 250000, min: 0, step: 5000, info: 'What you pay for the property.' },
    { id: 'down', label: 'Down payment', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 1, info: 'Share of the price paid in cash up front.' },
    { id: 'closing', label: 'Closing costs', type: 'number', prefix: '$', default: 7500, min: 0, step: 500, info: 'Lender, title and other fees paid at closing.' },
    { id: 'rehab', label: 'Rehab / repairs', type: 'number', prefix: '$', default: 5000, min: 0, step: 500, info: 'Upfront repair or renovation spend.' },
    { id: 'rent', label: 'Monthly rent', type: 'number', prefix: '$', default: 2200, min: 0, step: 50, info: 'Rent at full occupancy.' },
    { id: 'vacancy', label: 'Vacancy allowance', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 1, info: 'Share of rent lost to empty months.' },
    { id: 'opex', label: 'Operating costs per month', type: 'number', prefix: '$', default: 700, min: 0, step: 25, info: 'Taxes, insurance, repairs, management. Not loan payments.' },
    { id: 'rate', label: 'Loan interest rate', type: 'number', suffix: '%', default: 6.5, min: 0, step: 0.05, info: 'Annual rate on the mortgage.' },
    { id: 'term', label: 'Loan term', type: 'number', suffix: 'years', default: 30, min: 1, step: 1, info: 'Length of the mortgage in years.' },
  ],
  outputs: [
    { id: 'coc', label: 'Cash-on-cash return', format: 'number', precision: 2, suffix: '%', primary: true, info: 'Yearly cash flow ÷ cash invested.' },
    { id: 'cashIn', label: 'Cash invested', format: 'currency', precision: 0, info: 'Down payment + closing costs + rehab.' },
    { id: 'noi', label: 'Net operating income (year)', format: 'currency', precision: 0, info: 'Rent after vacancy minus operating costs, before the loan.' },
    { id: 'debt', label: 'Loan payments (year)', format: 'currency', precision: 2, info: 'Twelve monthly principal and interest payments.' },
    { id: 'cashflow', label: 'Cash flow after loan (year)', format: 'currency', precision: 2, info: 'NOI minus loan payments.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const dp = num(v.down);
    const closing = num(v.closing);
    const rehab = num(v.rehab);
    const rent = num(v.rent);
    const vac = num(v.vacancy);
    const opex = num(v.opex);
    const rate = num(v.rate);
    const term = num(v.term);
    if ([price, dp, closing, rehab, rent, vac, opex, rate, term].some((x) => x === null)) return { coc: null };
    if (price! < 0 || dp! < 0 || dp! > 100 || closing! < 0 || rehab! < 0 || rent! < 0 || vac! < 0 || vac! > 100 || opex! < 0 || rate! < 0 || term! < 1) return { coc: null };
    const down = (price! * dp!) / 100;
    const cashIn = down + closing! + rehab!;
    if (cashIn <= 0) return { coc: null, error: 'Cash invested is zero, so the return is not defined. Add a down payment, closing costs or rehab.' };
    const noi = rent! * 12 * (1 - vac! / 100) - opex! * 12;
    const loan = price! - down;
    const debt = loan > 0 ? annualDebt(loan, rate!, term!) : 0;
    const cashflow = noi - debt;
    const coc = (cashflow / cashIn) * 100;
    return {
      coc,
      cashIn,
      noi,
      debt,
      cashflow,
      tone: cashflow > 0 ? 'good' : cashflow < 0 ? 'bad' : 'warn',
      badge: cashflow >= 0 ? `${money(cashflow)} a year after the loan` : `${money(-cashflow)} a year short`,
      note: `You put in ${money(cashIn)} and the property earns ${money(noi)} before the loan. After ${money(debt)} of loan payments, cash flow is ${money(cashflow)} a year, a ${coc.toFixed(2)}% cash-on-cash return. It ignores appreciation, tax and loan paydown.`,
      chart: {
        type: 'bar',
        title: 'Yearly cash flow',
        categories: ['Net operating income', 'Loan payments', 'Cash flow'],
        series: [{ name: 'Per year', values: [noi, debt, cashflow] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Cash invested = ${money(down)} + ${money(closing!)} + ${money(rehab!)} = ${money(cashIn)}`,
        `NOI = ${money(rent!)} × 12 × (1 − ${vac}%) − ${money(opex!)} × 12 = ${money(noi)}`,
        `Loan payments = ${money(debt)} a year on ${money(loan)} at ${rate}% over ${term} years`,
        `Return = ${money(cashflow)} ÷ ${money(cashIn)} = ${coc.toFixed(2)}%`,
      ],
    };
  },
  content: {
    formula: [
      'Cash invested = down payment + closing costs + rehab',
      'NOI = monthly rent × 12 × (1 − vacancy) − monthly operating costs × 12',
      'Loan payments = 12 × P × i ÷ (1 − (1 + i)^−n), P = price − down payment, i = rate ÷ 12, n = years × 12',
      'Cash-on-cash return = (NOI − loan payments) ÷ cash invested',
    ],
    body: [
      'Cash-on-cash return measures the yearly cash a rental pays you, after the mortgage, as a share of the cash you put in. It is simpler than a full IRR and is popular for comparing rentals.',
      'Example: a $250,000 property with 20% down, $7,500 closing costs and $5,000 rehab needs $62,500 in cash. Rent of $2,200 with 5% vacancy and $700 a month in costs gives NOI of $16,680. Loan payments on $200,000 at 6.5% over 30 years are $15,169.63 a year, leaving $1,510.37 of cash flow, a 2.42% return.',
      'The figure ignores appreciation, loan paydown, tax and capital expenses, so treat it as one lens. At a 0% rate the payment is just the loan divided by the number of months. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is cash-on-cash return?', a: 'Yearly cash flow after loan payments divided by the cash you invested. In the example, $1,510.37 ÷ $62,500 is 2.42%.' },
      { q: 'What counts as cash invested?', a: 'Down payment, closing costs and rehab. In the example, $50,000 + $7,500 + $5,000 = $62,500.' },
      { q: 'Is cash-on-cash the same as cap rate?', a: 'No. Cap rate uses NOI over price and ignores the loan. Cash-on-cash uses cash flow after the loan over cash invested.' },
      { q: 'What if I have no loan or a 0% rate?', a: 'A 100% down payment means no loan payments. At 0% interest the payment is the loan divided by the months, so $200,000 over 360 months is $555.56 a month.' },
    ],
    sources: [],
  },
  related: ['cap-rate-calculator', 'gross-rent-multiplier', 'dscr-calculator', 'mortgage-recast', 'rent-vs-buy', 'roi'],
  examples: [
    // cash in 50000+7500+5000 = 62500; NOI 2200*12*.95 - 8400 = 25080 - 8400 = 16680
    // payment on 200000 at 6.5%/30y = 1264.14/mo -> 15169.63/yr; cash flow 1510.37; 1510.37/62500 = 2.42%
    { values: { price: 250000, down: 20, closing: 7500, rehab: 5000, rent: 2200, vacancy: 5, opex: 700, rate: 6.5, term: 30 }, expect: { cashIn: 62500, noi: 16680, debt: 15169.63, cashflow: 1510.37, coc: 2.42 }, tolerance: 0.01 },
    // 0% rate: loan 100000 over 120 months = 833.33/mo -> 10000/yr; NOI 1500*12 - 0 = 18000; flow 8000; cash in 100000 -> 8%
    { values: { price: 200000, down: 50, closing: 0, rehab: 0, rent: 1500, vacancy: 0, opex: 0, rate: 0, term: 10 }, expect: { cashIn: 100000, noi: 18000, debt: 10000, cashflow: 8000, coc: 8 }, tolerance: 1e-6 },
  ],
});
