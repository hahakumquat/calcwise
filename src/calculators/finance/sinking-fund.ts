import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut } from '../../lib/helpers/finance';

const SLOTS = [1, 2, 3, 4, 5, 6];
const DEFAULTS: { amount: number; months: number }[] = [
  { amount: 1200, months: 12 },
  { amount: 600, months: 6 },
  { amount: 2400, months: 12 },
];

/** Level end-of-month deposit that grows to `amount` in `months` months at monthly rate i (fraction). */
const deposit = (amount: number, months: number, i: number) => (i === 0 ? amount / months : (amount * i) / (Math.pow(1 + i, months) - 1));

const rows = SLOTS.flatMap((n) => {
  const optional = n > 1;
  const tail = optional ? ' Leave blank if you have fewer expenses.' : '';
  const d = DEFAULTS[n - 1];
  return [
    { id: `a${n}`, label: `Expense ${n} amount`, type: 'number' as const, prefix: '$', min: 0, step: 50, optional, ...(d ? { default: d.amount } : {}), info: `The total cost of expense ${n} when it comes due, such as a holiday budget, insurance premium or vacation.${tail}` },
    { id: `m${n}`, label: `Expense ${n} due in`, type: 'number' as const, suffix: 'months', min: 1, max: 120, step: 1, optional, ...(d ? { default: d.months } : {}), info: `Whole months until expense ${n} is due. You save until then.${tail}` },
  ];
});

export default defineCalculator({
  slug: 'sinking-fund',
  title: 'Sinking Fund Calculator',
  category: 'finance',
  description: 'Work out how much to set aside each month for irregular costs like holidays, insurance, car repairs and vacations, with optional interest on the savings.',
  keywords: ['sinking fund calculator', 'sinking fund budget', 'how much to save each month for expenses', 'christmas savings plan', 'irregular expenses budget', 'savings per month'],
  updated: '2026-11-20',
  inputs: [
    ...rows,
    { id: 'rate', label: 'Savings interest rate', type: 'number', suffix: '% / yr', default: 0, min: 0, max: 20, step: 0.1, optional: true, info: 'An assumption: the yearly interest your savings account pays, compounded monthly. Leave at 0 to ignore interest and simply divide each amount by its months.' },
  ],
  outputs: [
    { id: 'total', label: 'Set aside each month', format: 'currency', primary: true, info: 'The sum of the monthly deposits for all your expenses, assuming each deposit is made at the end of the month.' },
    { id: 'count', label: 'Expenses planned', format: 'integer', info: 'How many expense rows you filled in.' },
    { id: 'goalTotal', label: 'Total to be saved', format: 'currency', info: 'The sum of all expense amounts.' },
    { id: 'interest', label: 'Interest earned', format: 'currency', info: 'Goal amounts minus the deposits you make. Zero when the interest rate is 0.' },
  ],
  compute: (v) => {
    const apr = num(v.rate) ?? 0;
    if (apr < 0) return { total: null, error: 'Interest rate cannot be negative.' };
    const i = apr / 100 / 12;
    const items: { n: number; amount: number; months: number; monthly: number }[] = [];
    for (const n of SLOTS) {
      const amount = num(v[`a${n}`]);
      const months = num(v[`m${n}`]);
      if (amount == null && months == null) continue;
      if (amount == null || months == null) return { total: null, error: `Expense ${n} needs both an amount and a number of months.` };
      if (amount < 0) return { total: null, error: `Expense ${n}: the amount cannot be negative.` };
      if (!Number.isInteger(months) || months < 1) return { total: null, error: `Expense ${n}: use a whole number of months, 1 or more.` };
      if (amount === 0) continue;
      items.push({ n, amount, months, monthly: deposit(amount, months, i) });
    }
    if (!items.length) return { total: null };
    const total = items.reduce((a, x) => a + x.monthly, 0);
    const goalTotal = items.reduce((a, x) => a + x.amount, 0);
    const interest = goalTotal - items.reduce((a, x) => a + x.monthly * x.months, 0);
    return {
      total,
      count: items.length,
      goalTotal,
      interest,
      tone: 'ok',
      badge: `${money(total)} a month for ${items.length} ${items.length === 1 ? 'expense' : 'expenses'}`,
      chart: moneyDonut('Where each month goes', items.map((x) => ({ label: `Expense ${x.n}`, value: x.monthly })), money(total, 0), 'per month'),
      note: apr > 0 ? 'Interest is an assumption, not a promise. Rates change, and deposits are assumed to be made at the end of each month.' : 'With 0% interest, each monthly amount is the expense divided by its months.',
      steps: items.map((x) => `Expense ${x.n}: ${money(x.amount)} over ${x.months} months = ${money(x.monthly)} a month`),
    };
  },
  content: {
    formula: [
      'Monthly deposit = amount ÷ months (no interest)',
      'Monthly deposit = amount × i ÷ ((1 + i)^months − 1), where i = annual rate ÷ 12 (with interest, deposits at month end)',
      'Total per month = sum of the deposits for every expense',
    ],
    body: [
      'A sinking fund is money you set aside a little at a time for a cost you know is coming, such as holiday gifts, car insurance, a vacation or annual fees. Saving monthly turns a lumpy bill into a steady line in your budget.',
      'List each expense with its amount and the number of months until it is due. The calculator works out the monthly deposit for each one and adds them into one number to move to savings every month.',
      'Interest is optional. Leave it at 0 for the simple division, or enter your savings account rate to see how much less you need to deposit. The effect is small for short goals.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          'A $1,200 holiday budget due in 12 months needs $100 a month. Car insurance of $600 due in 6 months needs $100 a month, and a $2,400 vacation in 12 months needs $200. Together that is $400 a month.',
          'At 4.8% a year, the monthly rate is 0.4%, so the $1,200 holiday fund needs 1,200 × 0.004 ÷ (1.004^12 − 1) = $97.82 a month instead of $100.',
        ],
      },
    ],
    faq: [
      { q: 'What is a sinking fund?', a: 'A pot of savings built up over time for a specific expected cost. You deposit regularly so the money is ready when the bill arrives.' },
      { q: 'How much should I save per month for a $1,200 expense due in 12 months?', a: 'With no interest it is $100 a month. At 4.8% a year it is about $97.82 a month.' },
      { q: 'How is a sinking fund different from an emergency fund?', a: 'A sinking fund is for known, planned costs with a date. An emergency fund covers surprises and has no fixed target date.' },
      { q: 'Should I include interest?', a: 'It is optional. Interest lowers the monthly amount slightly, but rates can change, so leaving it at 0 is the cautious choice.' },
      { q: 'What if an expense is already partly saved?', a: 'Enter only the amount you still need. This calculator does not subtract existing balances for you.' },
    ],
    sources: [{ label: 'Consumer Financial Protection Bureau: Budgeting and saving', url: 'https://www.consumerfinance.gov/consumer-tools/budgeting-saving/' }],
  },
  related: ['savings-goal', 'emergency-fund', 'savings-challenge'],
  examples: [
    // 1200/12 + 600/6 + 2400/12 = 100 + 100 + 200 = 400; goals 4200; interest 0.
    { values: { a1: 1200, m1: 12, a2: 600, m2: 6, a3: 2400, m3: 12, rate: 0 }, expect: { total: 400, count: 3, goalTotal: 4200, interest: 0 } },
    // 4.8% APR: i = 0.004; 1200*0.004/(1.004^12-1) = 4.8/0.049073 = 97.82.
    { values: { a1: 1200, m1: 12, rate: 4.8 }, expect: { total: 97.82 }, tolerance: 0.01 },
  ],
});
