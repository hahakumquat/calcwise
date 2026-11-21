import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, moneyDonut, MONTH_S, pvAnnuity, toMonths } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'car-affordability',
  title: 'Car Affordability Calculator',
  category: 'finance',
  description: 'Find the most car you can afford from your income using the 20/4/10 guideline: 20% down, a 4-year loan and car costs under 10% of income.',
  keywords: ['car affordability calculator', 'how much car can i afford', '20/4/10 rule', 'car budget by income', 'how much car can i afford on my salary'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'income', label: 'Gross income per year', type: 'number', prefix: '$', default: 90000, min: 0, step: 1000, info: 'Your income before tax. The guideline is written in terms of gross income.' },
    { id: 'share', label: 'Share of income for car costs', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 0.5, info: 'The "10" in 20/4/10. This covers the loan payment plus insurance, fuel and upkeep.' },
    { id: 'running', label: 'Insurance, fuel & upkeep per month', type: 'number', prefix: '$', default: 250, min: 0, optional: true, step: 10, info: 'Monthly running costs. They come out of the same budget before the loan payment does.' },
    { id: 'downPct', label: 'Down payment', type: 'number', suffix: '%', default: 20, min: 0, max: 99, step: 1, info: 'The "20" in 20/4/10: the share of the price you pay in cash.' },
    { id: 'rate', label: 'Interest rate (APR)', type: 'number', suffix: '%', default: 7.2, min: 0, step: 0.05, info: 'The APR on the car loan. A pre-approval from a bank or credit union gives you a real figure.' },
    { id: 'term', label: 'Loan term', type: 'number', unit: 'time', units: ['mo', 'yr'], defaultUnit: 'mo', default: 48, min: 0, info: 'The "4" in 20/4/10 is four years (48 months).' },
  ],
  outputs: [
    { id: 'maxPrice', label: 'Car price you can afford', format: 'currency', primary: true, info: 'Loan amount plus down payment, all-in. Treat tax and fees as part of this price.' },
    { id: 'payment', label: 'Monthly loan payment', format: 'currency', info: 'Your monthly car budget minus running costs.' },
    { id: 'loan', label: 'Loan amount', format: 'currency', info: 'The most that payment can repay over the term at your rate.' },
    { id: 'down', label: 'Down payment needed', format: 'currency', info: 'The down payment share of the price.' },
    { id: 'budget', label: 'Total monthly car budget', format: 'currency', info: 'Gross monthly income times the share you set.' },
  ],
  compute: (v) => {
    const income = num(v.income);
    const share = num(v.share);
    const downPct = num(v.downPct);
    const rate = num(v.rate);
    const termS = num(v.term);
    if (income === null || share === null || downPct === null || rate === null || termS === null) return { maxPrice: null };
    if (income <= 0 || share < 0 || downPct < 0 || downPct >= 100 || rate < 0) return { maxPrice: null };
    const n = toMonths(termS);
    if (n <= 0) return { maxPrice: null, error: 'Enter a loan term of at least one month.' };
    const running = num(v.running) ?? 0;
    const budget = (income / 12) * (share / 100);
    const payment = budget - running;
    if (payment <= 0) {
      return { maxPrice: null, error: `Your ${money(budget)} monthly budget is already used up by ${money(running)} of running costs. Raise the share of income or lower those costs.` };
    }
    const r = rate / 100 / 12;
    const loan = pvAnnuity(payment, r, n);
    const maxPrice = loan / (1 - downPct / 100);
    const down = maxPrice - loan;
    const interest = payment * n - loan;
    return {
      maxPrice,
      payment,
      loan,
      down,
      budget,
      tone: 'ok',
      badge: `${money(budget, 0)}/mo budget`,
      chart: [
        moneyDonut('Monthly car budget', [{ label: 'Loan payment', value: payment }, { label: 'Insurance, fuel & upkeep', value: running }]),
        moneyDonut('Price and interest', [{ label: 'Down payment', value: down }, { label: 'Loan', value: loan }, { label: 'Interest', value: interest }]),
      ],
      steps: [
        `Monthly budget = ${money(income)} ÷ 12 × ${+share.toFixed(4)}% = ${money(budget)}`,
        `Loan payment = ${money(budget)} − ${money(running)} running costs = ${money(payment)}`,
        `Loan = payment × (1 − (1 + r)^−n) ÷ r with r = ${rate}% ÷ 12 and n = ${n} → ${money(loan)}`,
        `Price = ${money(loan)} ÷ (1 − ${+downPct.toFixed(4)}%) = ${money(maxPrice)}`,
      ],
      note: `The 20/4/10 guideline is a rule of thumb from personal-finance media, not a lending rule. Treat the price as all-in, including sales tax and fees.`,
    };
  },
  content: {
    formula: [
      'Monthly budget = gross income ÷ 12 × share of income',
      'Loan payment = monthly budget − insurance, fuel and upkeep',
      'Loan = payment × (1 − (1 + r)^−n) ÷ r, r = APR ÷ 12',
      'Price = loan ÷ (1 − down payment %)',
    ],
    body: [
      'The 20/4/10 guideline is a popular rule of thumb for car buying: put 20% down, finance for no more than 4 years, and keep total car costs under 10% of your gross income. It is not an official standard, and plenty of people reasonably use different numbers.',
      'This calculator works backwards from your income. It takes your monthly car budget, subtracts running costs such as insurance and fuel, and treats what is left as the loan payment. From that payment it works out the loan you can repay, then adds the down payment to give a price.',
      'Because the result is an all-in price, sales tax, title and dealer fees should come out of it. If the car you like costs more than the figure shown, a bigger down payment, a longer term or a higher share of income would close the gap, each with a trade-off.',
    ],
    faq: [
      { q: 'What is the 20/4/10 rule?', a: 'A rule of thumb: 20% down, a loan of 4 years or less, and total car costs (payment plus insurance and fuel) under 10% of gross income. It comes from personal-finance advice, not a lender or regulator.' },
      { q: 'How much car can I afford on $90,000 a year?', a: 'With the defaults (10% of income, $250 a month for running costs, 7.2% APR, 48 months and 20% down), the budget is $750 a month, the loan payment is $500 and the price comes to about $25,999.' },
      { q: 'Why subtract insurance and fuel?', a: 'Because the 10% covers the whole cost of having the car, not only the payment. Skipping running costs would overstate what you can afford.' },
      { q: 'Does the price include sales tax?', a: 'Treat it as all-in. The calculator does not add tax or fees separately, so subtract them from the price to find the sticker price you can negotiate.' },
      { q: 'Is 48 months too short?', a: 'It gives a higher payment but far less interest, and you are less likely to owe more than the car is worth. Change the term to see how the price shifts.' },
    ],
  },
  related: ['auto-loan', 'car-lease-vs-buy', 'debt-to-income', 'budget-50-30-20'],
  examples: [
    {
      // 60000 / 12 = 5000; 10% = 500; minus 200 running = 300 a month.
      // 0% rate: loan = 300 * 48 = 14400; price = 14400 / 0.8 = 18000; down = 3600.
      values: { income: 60000, share: 10, running: 200, downPct: 20, rate: 0, term: 48 * MONTH_S },
      expect: { budget: 500, payment: 300, loan: 14400, maxPrice: 18000, down: 3600 },
      tolerance: 0.00001,
    },
    {
      // 90000 / 12 = 7500; 10% = 750; minus 250 = 500 a month. r = 0.072 / 12 = 0.006, n = 48.
      // 1.006^48 = 1.33261, so loan = 500 * (1 - 1/1.33261) / 0.006 = 20799.41 (checked in code to full precision).
      // price = 20799.41 / 0.8 = 25999.26; down = 5199.85.
      values: { income: 90000, share: 10, running: 250, downPct: 20, rate: 7.2, term: 48 * MONTH_S },
      expect: { budget: 750, payment: 500, loan: 20799.4096, maxPrice: 25999.2620, down: 5199.8524 },
      tolerance: 0.00001,
    },
  ],
});
