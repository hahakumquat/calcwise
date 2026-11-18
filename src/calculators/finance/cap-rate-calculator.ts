import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'cap-rate-calculator',
  title: 'Cap Rate Calculator for Rental Property',
  category: 'finance',
  description: 'Work out the cap rate, net operating income and cash-on-cash return of a rental property from rent, vacancy, expenses, price and loan payments.',
  keywords: ['cap rate calculator', 'capitalization rate', 'rental property calculator', 'net operating income', 'cash on cash return', 'rental cash flow'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'price', label: 'Purchase price', type: 'number', prefix: '$', default: 300000, min: 0, step: 5000, info: 'What you pay for the property.' },
    { id: 'rent', label: 'Monthly rent', type: 'number', prefix: '$', default: 2400, min: 0, step: 50, info: 'Total rent for all units at full occupancy.' },
    { id: 'vacancy', label: 'Vacancy allowance', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 1, info: 'Share of the year the property sits empty or rent goes unpaid.' },
    { id: 'expenses', label: 'Operating expenses per year', type: 'number', prefix: '$', default: 8000, min: 0, step: 100, info: 'Property tax, insurance, repairs, management, utilities you pay. Do not include loan payments.' },
    { id: 'debt', label: 'Loan payments per year', type: 'number', prefix: '$', default: 14400, min: 0, step: 100, optional: true, info: 'Mortgage principal and interest for the year. Leave empty for an all-cash purchase.' },
    { id: 'cash', label: 'Cash invested', type: 'number', prefix: '$', default: 75000, min: 0, step: 1000, optional: true, info: 'Down payment plus closing costs and repairs. Used for cash-on-cash return. Leave empty to treat the whole price as cash.' },
  ],
  outputs: [
    { id: 'cap', label: 'Cap rate', format: 'number', precision: 2, suffix: '%', primary: true, info: 'Net operating income ÷ purchase price.' },
    { id: 'noi', label: 'Net operating income (year)', format: 'currency', precision: 0, info: 'Rent after vacancy, minus operating expenses. Before loan payments.' },
    { id: 'cashflow', label: 'Cash flow after loan (year)', format: 'currency', precision: 0, info: 'Net operating income minus loan payments.' },
    { id: 'coc', label: 'Cash-on-cash return', format: 'number', precision: 2, suffix: '%', info: 'Yearly cash flow ÷ cash invested.' },
  ],
  compute: (v) => {
    const price = num(v.price);
    const rent = num(v.rent);
    const vacancy = num(v.vacancy) ?? 0;
    const expenses = num(v.expenses);
    const debt = num(v.debt) ?? 0;
    if (price === null || rent === null || expenses === null || price <= 0 || rent < 0 || expenses < 0 || vacancy < 0 || vacancy > 100 || debt < 0) return { cap: null };
    const cashIn = num(v.cash);
    const cash = cashIn === null || cashIn <= 0 ? price : cashIn;
    const gross = rent * 12;
    const effective = gross * (1 - vacancy / 100);
    const noi = effective - expenses;
    const cap = (noi / price) * 100;
    const cashflow = noi - debt;
    const coc = (cashflow / cash) * 100;
    return {
      cap,
      noi,
      cashflow,
      coc,
      chart: {
        type: 'bar',
        title: 'Where a year of rent goes ($)',
        categories: ['Rent at 100%', 'After vacancy', 'NOI', 'Cash flow'],
        series: [{ name: 'Dollars per year', values: [gross, effective, noi, cashflow] }],
        format: { format: 'currency', precision: 0 },
      },
      steps: [
        `Effective rent = $${fmt(rent, 0)} × 12 × (1 − ${fmt(vacancy)}%) = $${fmt(effective, 0)}`,
        `NOI = $${fmt(effective, 0)} − $${fmt(expenses, 0)} = $${fmt(noi, 0)}`,
        `Cap rate = $${fmt(noi, 0)} ÷ $${fmt(price, 0)} = ${fmt(cap)}%`,
        `Cash flow = $${fmt(noi, 0)} − $${fmt(debt, 0)} = $${fmt(cashflow, 0)}; ÷ $${fmt(cash, 0)} invested = ${fmt(coc)}%`,
      ],
      note: noi <= 0
        ? 'Expenses are at or above the rent you would collect, so the property has no operating income.'
        : `The property earns ${fmt(cap)}% of its price each year before financing. Cap rates vary by market, so compare with similar properties nearby.`,
    };
  },
  content: {
    formula: ['NOI = monthly rent × 12 × (1 − vacancy) − operating expenses', 'Cap rate = NOI ÷ purchase price × 100', 'Cash-on-cash = (NOI − loan payments) ÷ cash invested × 100'],
    body: [
      'The capitalization rate, or cap rate, shows how much a rental property earns each year compared with its price, ignoring how it is financed. That makes it a quick way to compare properties.',
      'Net operating income (NOI) is rent actually collected minus the costs of running the property: tax, insurance, repairs, management and utilities. Mortgage payments, depreciation and income tax are not operating expenses.',
      'Cash-on-cash return adds financing. It divides the cash left after loan payments by the cash you put in, so a loan can push it above or below the cap rate.',
      'A higher cap rate means more income per dollar of price, usually with more risk. What counts as good depends on the market, so treat this as an estimate and check your own numbers.',
    ],
    faq: [
      { q: 'How do you calculate cap rate?', a: 'Divide net operating income by the purchase price. A $300,000 property with $12,400 of NOI has a cap rate of 12,400 ÷ 300,000 = 4.13%.' },
      { q: 'Do loan payments count in the cap rate?', a: 'No. Cap rate ignores financing, so mortgage payments are left out. They are used for cash flow and cash-on-cash return.' },
      { q: 'What is a good cap rate?', a: 'It depends on the market and property type. Higher means more income relative to price but often more risk, so compare with similar local properties.' },
      { q: 'What is the difference between cap rate and cash-on-cash return?', a: 'Cap rate uses the full price and ignores the loan. Cash-on-cash uses the cash you invested and the cash flow after loan payments.' },
    ],
    sources: [
      { label: 'Capitalization rate (Investopedia)', url: 'https://www.investopedia.com/terms/c/capitalizationrate.asp' },
      { label: 'Net operating income (Investopedia)', url: 'https://www.investopedia.com/terms/n/noi.asp' },
    ],
  },
  related: ['mortgage', 'roi', 'ltv-ratio', 'rent-vs-buy', 'payback-period', 'break-even'],
  examples: [
    // gross 28,800; effective 27,360; NOI 19,360; cap 6.4533; cash flow 4,960; cash-on-cash 6.6133
    { values: { price: 300000, rent: 2400, vacancy: 5, expenses: 8000, debt: 14400, cash: 75000 }, expect: { cap: 6.453333333, noi: 19360, cashflow: 4960, coc: 6.613333333 }, tolerance: 1e-6 },
    // all cash: 2000*12 = 24000, no vacancy, 6000 expenses -> NOI 18000 / 200000 = 9%
    { values: { price: 200000, rent: 2000, vacancy: 0, expenses: 6000, debt: null, cash: null }, expect: { cap: 9, noi: 18000, cashflow: 18000, coc: 9 }, tolerance: 1e-6 },
  ],
});
