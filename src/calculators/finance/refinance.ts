import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, monthIdx, yr } from '../../lib/helpers/finance';
import { amortizedPayment, money, toMonths, YEAR_S } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'refinance',
  title: 'Refinance Calculator',
  category: 'finance',
  description: 'See how much a mortgage refinance saves each month, how long it takes to break even on closing costs, and the lifetime cost difference.',
  keywords: ['mortgage refinance', 'refi', 'break even', 'should I refinance', 'lower rate', 'closing costs'],
  inputs: [
    { id: 'balance', label: 'Current loan balance', type: 'number', prefix: '$', default: 250000, min: 0, step: 1000, info: 'What you still owe on your current mortgage. Your latest statement or online account shows the principal balance.' },
    { id: 'currentRate', label: 'Current interest rate', type: 'number', suffix: '%', default: 7, min: 0, step: 0.125, info: 'The interest rate on your existing loan, shown on your mortgage statement or note.' },
    { id: 'remaining', label: 'Time left on current loan', type: 'number', unit: 'time', units: ['yr', 'mo'], defaultUnit: 'yr', default: 25, min: 0, info: 'How many years or months are left until your current loan is paid off.' },
    { id: 'newRate', label: 'New interest rate', type: 'number', suffix: '%', default: 5.75, min: 0, step: 0.125, info: 'The rate offered on the new loan. Get quotes from two or three lenders to compare.' },
    { id: 'newTerm', label: 'New loan term', type: 'number', unit: 'time', units: ['yr', 'mo'], defaultUnit: 'yr', default: 30, min: 0, info: 'The length of the new loan. Matching your remaining term gives the cleanest comparison of interest saved.' },
    { id: 'costs', label: 'Closing costs', type: 'number', prefix: '$', default: 5000, min: 0, help: 'Lender fees, appraisal, title, points.', info: 'Total closing costs for the refinance, from the lender\'s Loan Estimate. Usually 2%–5% of the balance.' },
    {
      id: 'rollCosts',
      info: 'Pay the closing costs in cash, or add them to the new loan balance so you pay nothing up front.',
      label: 'Pay closing costs',
      type: 'select',
      segmented: true,
      default: 'cash',
      options: [
        { value: 'cash', label: 'Out of pocket' },
        { value: 'roll', label: 'Add to the loan' },
      ],
    },
  ],
  outputs: [
    { id: 'savings', label: 'Monthly savings', format: 'currency', primary: true, info: 'How much lower the new principal-and-interest payment is than your current one each month.' },
    { id: 'currentPayment', label: 'Current monthly payment (P&I)', format: 'currency', info: 'Your current monthly principal and interest, worked out from the balance, rate and time left.' },
    { id: 'newPayment', label: 'New monthly payment (P&I)', format: 'currency', info: 'The monthly principal and interest on the new loan.' },
    { id: 'breakEven', label: 'Break-even point', format: 'integer', suffix: 'months', info: 'How many months of savings it takes to earn back the closing costs. Refinancing pays off only if you keep the loan longer than this.' },
    { id: 'lifetime', label: 'Lifetime cost change', format: 'currency', help: 'Negative means the refinance costs less overall.', info: 'Total cost of the new loan (payments plus cash costs) minus the remaining payments on the old one. Negative means you save overall.' },
    { id: 'currentInterest', label: 'Interest left on current loan', format: 'currency', info: 'Interest you would still pay if you keep your current loan to the end.' },
    { id: 'newInterest', label: 'Interest on new loan', format: 'currency', info: 'Interest you would pay over the full term of the new loan.' },
  ],
  compute: (v) => {
    const balance = num(v.balance);
    const r1 = num(v.currentRate);
    const r2 = num(v.newRate);
    const remS = num(v.remaining);
    const newS = num(v.newTerm);
    const costs = num(v.costs) ?? 0;
    if (balance === null || r1 === null || r2 === null || remS === null || newS === null) return { savings: null };
    if (balance <= 0 || r1 < 0 || r2 < 0 || costs < 0) return { savings: null };
    const n1 = toMonths(remS);
    const n2 = toMonths(newS);
    if (n1 <= 0 || n2 <= 0) return { savings: null, error: 'Loan terms must be at least one month.' };
    const roll = v.rollCosts === 'roll';
    const newPrincipal = roll ? balance + costs : balance;
    const cashCosts = roll ? 0 : costs;
    const currentPayment = amortizedPayment(balance, r1, n1);
    const newPayment = amortizedPayment(newPrincipal, r2, n2);
    const savings = currentPayment - newPayment;
    const currentTotal = currentPayment * n1;
    const newTotal = newPayment * n2 + cashCosts;
    const lifetime = newTotal - currentTotal;
    // With rolled-in costs there is no upfront cash to recover; break-even compares the cost added to the loan.
    const breakEven = savings > 0 && costs > 0 ? Math.ceil(costs / savings) : savings > 0 ? 0 : null;
    const idx = monthIdx(Math.max(n1, n2));
    const cum = idx.map((m) => currentPayment * Math.min(m, n1) - newPayment * Math.min(m, n2) - cashCosts);
    return {
      savings,
      currentPayment,
      newPayment,
      breakEven,
      lifetime,
      currentInterest: currentTotal - balance,
      newInterest: newPayment * n2 - newPrincipal,
      chart: [{ type: 'line', title: 'Cumulative savings after costs', x: idx.map(yr), xLabel: 'Years', yFormat: CURRENCY, series: [{ name: 'Net savings', values: cum }], markers: breakEven ? [{ x: yr(breakEven), label: 'Break-even' }] : [] }, { type: 'bar', title: 'Monthly payment (P&I)', categories: ['Current loan', 'New loan'], series: [{ name: 'Payment', values: [currentPayment, newPayment] }], format: CURRENCY, highlight: 1 }],
      steps: [
        `Current: ${money(balance, 0)} at ${r1}% over ${n1} months → ${money(currentPayment)}/month`,
        `New: ${money(newPrincipal, 0)} at ${r2}% over ${n2} months → ${money(newPayment)}/month`,
        `Savings = ${money(currentPayment)} − ${money(newPayment)} = ${money(savings)}`,
        breakEven !== null ? `Break-even = ${money(costs)} ÷ ${money(savings)} ≈ ${breakEven} months` : 'No monthly savings, so the costs are never recovered.',
        `Lifetime: ${money(newTotal, 0)} (new) − ${money(currentTotal, 0)} (current) = ${money(lifetime, 0)}`,
      ],
      note:
        savings <= 0
          ? 'This refinance does not lower your monthly payment.'
          : lifetime > 0
            ? `You save monthly, but stretching the term means paying ${money(lifetime, 0)} more over the life of the loan.`
            : `You save monthly and ${money(-lifetime, 0)} over the life of the loan, if you keep it to the end.`,
    };
  },
  content: {
    formula: ['Monthly savings = current P&I − new P&I', 'Break-even (months) = closing costs ÷ monthly savings', 'Lifetime change = new P&I × new n + cash costs − current P&I × remaining n'],
    body: [
      'Refinancing replaces your mortgage with a new one, usually to get a lower rate, a different term, or to switch from an adjustable to a fixed rate. The new loan comes with closing costs — typically 2% to 5% of the balance — so a refinance only pays off if you keep the home long enough to recover them.',
      'The break-even point divides the closing costs by the monthly savings. If you expect to move or sell before then, the refinance loses money even though the payment is lower.',
      'Watch the lifetime cost. Resetting a loan with 25 years left into a new 30-year loan lowers the payment partly by spreading the balance over five extra years, which can raise the total interest you pay. Choosing a new term close to the time you have left gives a cleaner comparison.',
    ],
    faq: [
      { q: 'How much does the rate need to drop to make refinancing worthwhile?', a: 'There is no fixed rule. A drop of 0.75–1 percentage point is a common starting point, but what matters is whether the break-even point comes well before you expect to sell or pay off the loan.' },
      { q: 'Should I roll closing costs into the loan?', a: 'Rolling them in avoids paying cash now, but you pay interest on them for the life of the loan and the balance grows. If you can pay them upfront, the long-run cost is lower.' },
      { q: 'Does this include taxes and insurance?', a: 'No. Property tax and insurance usually stay the same after a refinance, so the comparison uses principal and interest only.' },
    ],
  },
  related: ['mortgage', 'home-affordability', 'apr', 'loan'],
  examples: [
    {
      values: { balance: 250000, currentRate: 7, remaining: 25 * YEAR_S, newRate: 5.75, newTerm: 30 * YEAR_S, costs: 5000, rollCosts: 'cash' },
      expect: { currentPayment: 1766.948, newPayment: 1458.932, savings: 308.016, breakEven: 17 },
      tolerance: 0.00001,
    },
  ],
});
