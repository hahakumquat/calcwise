import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, moneyDonut } from '../../lib/helpers/finance';
import { amortizedPayment, money, toMonths, YEAR_S } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'home-affordability',
  title: 'Home Affordability Calculator',
  category: 'finance',
  description: 'Find the highest home price that fits your income and debts using the 28/36 debt-to-income rule.',
  keywords: ['how much house can I afford', 'affordability', 'debt to income', 'DTI', '28/36 rule', 'house budget'],
  inputs: [
    { id: 'income', label: 'Gross annual income', type: 'number', prefix: '$', default: 100000, min: 0, step: 1000, help: 'Before taxes, for everyone on the loan.', info: 'Total yearly pay before taxes for everyone who will be on the loan, including steady bonuses or self-employment income lenders can verify.' },
    { id: 'debts', label: 'Other monthly debt payments', type: 'number', prefix: '$', default: 500, min: 0, help: 'Car, student, credit-card minimums, etc. Not rent.', info: 'Required monthly minimums on debts that appear on your credit report: car, student and personal loans, card minimums, support payments.' },
    { id: 'down', label: 'Down payment', type: 'number', prefix: '$', default: 60000, min: 0, step: 1000, info: 'Cash you can put toward the purchase, after setting aside closing costs and an emergency fund.' },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 6.5, min: 0, step: 0.125, info: 'The annual mortgage rate you expect to get. Use a lender pre-approval or current average 30-year fixed rates.' },
    { id: 'term', label: 'Loan term', type: 'number', unit: 'time', units: ['yr', 'mo'], defaultUnit: 'yr', default: 30, min: 0, info: 'How long the mortgage runs. Longer terms lower the payment and so raise the price you can afford, at the cost of more interest.' },
    { id: 'taxRate', label: 'Property tax (per year)', type: 'number', suffix: '% of price', default: 1.1, min: 0, step: 0.05, optional: true, info: 'Yearly property tax as a share of the home value in the area you are looking. U.S. averages are about 0.3%–2.2%.' },
    { id: 'insurance', label: 'Homeowners insurance (per year)', type: 'number', prefix: '$', default: 1800, min: 0, optional: true, info: 'Expected yearly homeowners insurance premium. $1,200–$3,000 is typical; coastal and wildfire areas cost more.' },
    { id: 'hoa', label: 'HOA dues (per month)', type: 'number', prefix: '$', min: 0, optional: true, placeholder: '0', info: 'Monthly homeowners-association dues, common for condos and townhomes. Leave blank if you are shopping for homes without an HOA.' },
    { id: 'front', label: 'Max housing ratio (front-end)', type: 'number', suffix: '%', default: 28, min: 1, max: 100, info: 'The most of your gross monthly income you are willing to spend on housing. 28% is the traditional lender guideline.' },
    { id: 'back', label: 'Max total debt ratio (back-end)', type: 'number', suffix: '%', default: 36, min: 1, max: 100, info: 'The most of your gross monthly income that housing plus all other debts may take. 36% is traditional; some loans allow 43–50%.' },
  ],
  outputs: [
    { id: 'price', label: 'Home price you can afford', format: 'currency', precision: 0, primary: true, info: 'The highest home price whose full monthly cost fits both of your debt-to-income limits.' },
    { id: 'loan', label: 'Loan amount', format: 'currency', precision: 0, info: 'The mortgage you would need for that price: the price minus your down payment.' },
    { id: 'payment', label: 'Max monthly housing payment', format: 'currency', info: 'Your monthly housing budget — principal, interest, tax, insurance and HOA — under the stricter of the two ratios.' },
    { id: 'pi', label: 'Principal & interest part', format: 'currency', info: 'The part of the budget left for the loan payment itself after tax, insurance and HOA.' },
    { id: 'limit', label: 'Limiting rule', format: 'text', info: 'Which rule caps your budget. If it is the total debt ratio, paying down other debts raises what you can afford.' },
  ],
  compute: (v) => {
    const income = num(v.income);
    const debts = num(v.debts) ?? 0;
    const down = num(v.down) ?? 0;
    const rate = num(v.rate);
    const termS = num(v.term);
    const front = num(v.front);
    const back = num(v.back);
    if (income === null || rate === null || termS === null || front === null || back === null) return { price: null };
    if (income <= 0 || rate < 0 || down < 0 || debts < 0) return { price: null };
    const n = toMonths(termS);
    if (n <= 0) return { price: null, error: 'Enter a loan term of at least one month.' };
    const monthlyIncome = income / 12;
    const frontCap = (monthlyIncome * front) / 100;
    const backCap = (monthlyIncome * back) / 100 - debts;
    const payment = Math.min(frontCap, backCap);
    const limit = frontCap <= backCap ? `Housing ratio (${front}%)` : `Total debt ratio (${back}%)`;
    const t = (num(v.taxRate) ?? 0) / 100 / 12; // tax per $ of price per month
    const fixed = (num(v.insurance) ?? 0) / 12 + (num(v.hoa) ?? 0);
    if (payment <= fixed) return { price: null, error: 'Your income and debts leave no room for a housing payment at these settings.' };
    const f = amortizedPayment(1, rate, n); // P&I per $ borrowed
    // payment = (price − down)·f + price·t + fixed  →  solve for price
    let price = (payment - fixed + down * f) / (f + t);
    if (price < down) price = t > 0 ? (payment - fixed) / t : down; // cash purchase: no loan needed
    const loan = Math.max(0, price - down);
    const pi = loan * f;
    return {
      price,
      loan,
      payment,
      pi,
      limit,
      chart: [moneyDonut('Monthly housing budget', [{ label: 'Principal & interest', value: pi }, { label: 'Property tax', value: price * t }, { label: 'Insurance & HOA', value: fixed }], money(payment, 0), 'per month'), { type: 'bar', title: 'Your gross monthly income', categories: ['Housing', 'Other debts', 'Everything else'], series: [{ name: 'Per month', values: [payment, debts, Math.max(0, monthlyIncome - payment - debts)] }], format: CURRENCY, highlight: 0 }],
      steps: [
        `Monthly income = ${money(income)} ÷ 12 = ${money(monthlyIncome)}`,
        `Front-end cap = ${front}% × income = ${money(frontCap)}; back-end cap = ${back}% × income − ${money(debts)} debts = ${money(backCap)}`,
        `Housing budget = the lower one = ${money(payment)}`,
        `Price solves (price − down)·f + price·tax + insurance/HOA = budget, with f = ${f.toFixed(6)} per $ borrowed`,
      ],
      note: `About ${money(price, 0)} with ${money(down, 0)} down — keep closing costs (often 2–5% of the price) and an emergency fund on top of that.`,
    };
  },
  content: {
    formula: [
      'Budget = min(front% × monthly income, back% × monthly income − other debts)',
      'Price = (Budget − insurance − HOA + down × f) ÷ (f + tax rate ÷ 12)',
      'f = r ÷ (1 − (1 + r)^−n), the monthly P&I per dollar borrowed',
    ],
    body: [
      'Lenders judge affordability mainly by your debt-to-income ratio. The traditional "28/36" rule says your total housing payment — principal, interest, property tax, insurance and HOA — should stay under 28% of gross monthly income, and all debt payments together under 36%. This calculator applies both limits and uses whichever is stricter.',
      'Once the monthly budget is known, the calculator works backwards to a price. Part of the budget goes to costs that grow with the price (property tax), part to fixed costs (insurance, HOA), and the rest pays principal and interest on whatever the down payment does not cover.',
      'Many loan programs allow higher ratios — FHA loans often go to 43% or more on the back end — so you may be approved for more than this shows. Treat the result as a comfortable ceiling rather than a target, and adjust the ratios if you want a more aggressive or conservative estimate.',
    ],
    faq: [
      { q: 'Should I use gross or take-home income?', a: 'Use gross (pre-tax) income, because the 28/36 ratios are defined on gross income. If you want a budget based on take-home pay, lower the ratios — many people aim for housing under 25% of net pay.' },
      { q: 'How does the interest rate change what I can afford?', a: 'A lot. At the same monthly budget, each one-point rise in the rate cuts the affordable price by roughly 10%, because more of every payment goes to interest.' },
      { q: 'What counts as "other monthly debts"?', a: 'Minimum payments that show up on your credit report: car loans, student loans, credit cards, personal loans, child support. Utilities, phone bills and groceries are not included.' },
    ],
  },
  related: ['mortgage', 'take-home-pay', 'refinance', 'net-worth'],
  examples: [
    {
      values: { income: 100000, debts: 500, down: 60000, rate: 6.5, term: 30 * YEAR_S, taxRate: 1.1, insurance: 1800, hoa: null, front: 28, back: 36 },
      expect: { payment: 2333.333333, price: 354076.4568, limit: 'Housing ratio (28%)' },
      tolerance: 0.00001,
    },
  ],
});
