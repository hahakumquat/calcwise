import { defineCalculator, type ChartSpec } from '../../lib/types';
import type { NumberInput } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY } from '../../lib/helpers/finance';
import { money, pct } from '../../lib/helpers/finance';

const field = (id: string, label: string, info: string, def?: number, help?: string): NumberInput => ({
  id,
  label,
  info,
  type: 'number',
  prefix: '$',
  min: 0,
  optional: true,
  placeholder: '0',
  ...(def !== undefined ? { default: def } : {}),
  ...(help ? { help } : {}),
});

const ASSETS = [
  field('cash', 'Cash & savings', 'Balances in checking, savings, money market accounts and CDs.', 15000, 'Checking, savings, money market, CDs.'),
  field('investments', 'Investments', 'Current market value of taxable brokerage accounts, stocks, bonds, funds and crypto.', 20000, 'Brokerage accounts, stocks, bonds, crypto.'),
  field('retirement', 'Retirement accounts', 'Balances in 401(k), 403(b), IRA and similar accounts, from your latest statements.', 60000, '401(k), IRA, pension cash value.'),
  field('home', 'Home value', 'What your home would likely sell for today. Recent nearby sales or online estimates are a good guide.', 350000, 'Estimated market value.'),
  field('vehicles', 'Vehicles', 'Current resale value of your cars, motorcycles or boats, not what you paid.', 18000),
  field('otherAssets', 'Other assets', 'Anything else of value you could sell: business equity, collectibles, jewelry, money owed to you.', undefined, 'Business equity, valuables, money owed to you.'),
];

const LIABILITIES = [
  field('mortgage', 'Mortgage balance', 'The remaining principal on your mortgage, from your latest statement.', 260000),
  field('autoLoans', 'Auto loans', 'Payoff balances on vehicle loans.', 12000),
  field('studentLoans', 'Student loans', 'Total outstanding federal and private student loan balances.', 15000),
  field('creditCards', 'Credit card balances', 'Current balances on all credit cards, even ones you pay in full each month.', 3000),
  field('otherDebts', 'Other debts', 'Personal loans, medical bills, home-equity lines and any other money you owe.', undefined, 'Personal loans, medical bills, HELOC.'),
];

export default defineCalculator({
  slug: 'net-worth',
  title: 'Net Worth Calculator',
  category: 'finance',
  description: 'Add up what you own and what you owe to find your net worth and debt-to-asset ratio.',
  keywords: ['net worth', 'personal balance sheet', 'assets and liabilities', 'wealth', 'financial health'],
  inputs: [...ASSETS, ...LIABILITIES],
  outputs: [
    { id: 'netWorth', label: 'Net worth', format: 'currency', primary: true, info: 'Everything you own minus everything you owe.' },
    { id: 'totalAssets', label: 'Total assets', format: 'currency', info: 'The sum of all asset values you entered.' },
    { id: 'totalLiabilities', label: 'Total liabilities', format: 'currency', info: 'The sum of all debts you entered.' },
    { id: 'debtRatio', label: 'Debt-to-asset ratio', format: 'percent', precision: 1, info: 'Total debts as a share of total assets. Lower is stronger; under 50% is generally healthy.' },
    { id: 'liquid', label: 'Liquid net worth', format: 'currency', help: 'Cash + investments − non-mortgage debts.', info: 'Cash and investments minus non-mortgage debts — roughly what you could access quickly.' },
  ],
  compute: (v) => {
    const total = (ids: string[]) => ids.reduce((s, id) => s + Math.max(0, num(v[id]) ?? 0), 0);
    const totalAssets = total(ASSETS.map((f) => f.id));
    const totalLiabilities = total(LIABILITIES.map((f) => f.id));
    const netWorth = totalAssets - totalLiabilities;
    const debtRatio = totalAssets > 0 ? totalLiabilities / totalAssets : null;
    const liquid = total(['cash', 'investments']) - total(['autoLoans', 'studentLoans', 'creditCards', 'otherDebts']);
    const items = [...ASSETS, ...LIABILITIES].map((f) => ({ label: f.label, value: Math.max(0, num(v[f.id]) ?? 0) })).filter((x) => x.value > 0);
    return {
      netWorth,
      totalAssets,
      totalLiabilities,
      debtRatio,
      liquid,
      chart: [{ type: 'bar', title: 'Assets vs liabilities', categories: ['Assets', 'Liabilities', 'Net worth'], series: [{ name: 'Amount', values: [totalAssets, totalLiabilities, netWorth] }], format: CURRENCY, highlight: 2 }, ...(items.length ? [{ type: 'bar', title: 'Breakdown', horizontal: true, categories: items.map((x) => x.label), series: [{ name: 'Amount', values: items.map((x) => x.value) }], format: CURRENCY } as ChartSpec] : [])],
      steps: [`Net worth = ${money(totalAssets)} assets − ${money(totalLiabilities)} liabilities = ${money(netWorth)}`],
      note:
        debtRatio === null
          ? 'Enter your assets to see your debt-to-asset ratio.'
          : netWorth < 0
            ? 'You currently owe more than you own — common early in a career or after taking on student loans. Track it over time; the trend matters most.'
            : `You owe ${pct(debtRatio, 1)} of what you own.`,
    };
  },
  content: {
    formula: ['Net worth = total assets − total liabilities', 'Debt-to-asset ratio = total liabilities ÷ total assets'],
    body: [
      'Net worth is a snapshot of your finances: everything you own minus everything you owe. Income shows how much money flows in, but net worth shows how much you have actually built up, which is why it is the clearest single measure of financial progress.',
      'Value assets at what you could realistically sell them for today, not what you paid. Homes and cars are best estimated from recent sales or online valuations; retirement accounts can be counted at their full balance, though taxes will be due on traditional 401(k) and IRA withdrawals.',
      'The liquid net worth line strips out your home, vehicles and retirement accounts to show what you could access relatively quickly. Recalculating every six or twelve months is more useful than any single number — a rising net worth means you are saving, paying down debt, or your investments are growing.',
    ],
    faq: [
      { q: 'What is a good net worth for my age?', a: 'A rough benchmark is age × gross income ÷ 10. A 40-year-old earning $80,000 would aim for about $320,000. Treat it as a loose guide — starting income, student debt and housing costs vary hugely.' },
      { q: 'Should I include my home?', a: 'Yes, as an asset at market value with the mortgage as a liability — the difference is your home equity. Just remember you need somewhere to live, so home equity is not easy to spend.' },
    ],
  },
  related: ['retirement', 'investment', 'savings-goal', 'credit-card-payoff', 'home-affordability'],
  examples: [
    {
      values: { cash: 15000, investments: 20000, retirement: 60000, home: 350000, vehicles: 18000, otherAssets: null, mortgage: 260000, autoLoans: 12000, studentLoans: 15000, creditCards: 3000, otherDebts: null },
      expect: { totalAssets: 463000, totalLiabilities: 290000, netWorth: 173000, liquid: 5000 },
    },
  ],
});
