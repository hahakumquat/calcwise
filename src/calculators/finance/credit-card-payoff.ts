import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, CURRENCY, money, moneyDonut, sampleIdx } from '../../lib/helpers/finance';

const MAX_MONTHS = 1200;

/** Month-by-month payoff: interest accrues monthly, then the payment is applied. */
function simulate(balance: number, monthlyRate: number, payment: number) {
  let b = balance;
  let months = 0;
  let interest = 0;
  let paid = 0;
  const balances = [balance];
  while (b > 1e-9 && months < MAX_MONTHS) {
    const i = b * monthlyRate;
    interest += i;
    b += i;
    const p = Math.min(payment, b);
    b -= p;
    paid += p;
    months++;
    balances.push(b);
  }
  return { months, interest, paid, balances, lastPayment: months ? paid - payment * (months - 1) : 0 };
}

const duration = (m: number) => {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  return [y ? `${y} yr` : '', mo ? `${mo} mo` : ''].filter(Boolean).join(' ') || '0 mo';
};

export default defineCalculator({
  slug: 'credit-card-payoff',
  title: 'Credit Card Payoff Calculator',
  category: 'finance',
  description: 'Find how long it takes to pay off a credit card and how much interest you will pay — or the monthly payment needed to be debt-free by a target date.',
  keywords: ['credit card debt', 'pay off credit card', 'debt payoff', 'credit card interest', 'months to pay off'],
  inputs: [
    {
      id: 'mode',
      info: 'Find how long a fixed payment takes, or find the payment needed to be debt-free by a set time.',
      label: 'I want to find',
      type: 'select',
      segmented: true,
      default: 'months',
      options: [
        { value: 'months', label: 'Time to pay off' },
        { value: 'payment', label: 'Payment needed' },
      ],
    },
    { id: 'balance', label: 'Card balance', type: 'number', prefix: '$', default: 6000, min: 0, info: 'What you currently owe on the card, from your latest statement or app.' },
    { id: 'apr', label: 'Interest rate (APR)', type: 'number', suffix: '%', default: 22.9, min: 0, step: 0.1, info: 'The card\'s purchase APR, shown on your statement. Typical card APRs are about 20–29%.' },
    { id: 'payment', label: 'Monthly payment', type: 'number', prefix: '$', default: 250, min: 0, showWhen: { input: 'mode', is: 'months' }, info: 'The fixed amount you will pay every month. It must be more than the monthly interest.' },
    { id: 'target', label: 'Pay off within', type: 'number', suffix: 'months', default: 24, min: 1, step: 1, showWhen: { input: 'mode', is: 'payment' }, info: 'How many months you want to take to clear the balance.' },
  ],
  outputs: [
    { id: 'months', label: 'Time to pay off', format: 'integer', suffix: 'months', primary: true, showWhen: { input: 'mode', is: 'months' }, info: 'How many monthly payments it takes to reach a zero balance at your payment, assuming no new charges.' },
    { id: 'monthlyPayment', label: 'Monthly payment needed', format: 'currency', primary: true, showWhen: { input: 'mode', is: 'payment' }, info: 'The fixed monthly payment that clears the card in your target time.' },
    { id: 'duration', label: 'In years and months', format: 'text', showWhen: { input: 'mode', is: 'months' }, info: 'The payoff time written out in years and months.' },
    { id: 'totalInterest', label: 'Total interest', format: 'currency', info: 'All interest charged until the card is paid off, assuming no new purchases.' },
    { id: 'totalPaid', label: 'Total paid', format: 'currency', info: 'The balance plus all interest — the total of every payment.' },
  ],
  compute: (v) => {
    const balance = num(v.balance);
    const apr = num(v.apr);
    const findPayment = v.mode === 'payment';
    const none = findPayment ? { monthlyPayment: null } : { months: null };
    if (balance === null || apr === null || balance < 0 || apr < 0) return none;
    const r = apr / 100 / 12;
    if (balance === 0) return { months: 0, monthlyPayment: 0, duration: '0 mo', totalInterest: 0, totalPaid: 0, note: 'Nothing to pay off.' };

    let payment: number;
    if (findPayment) {
      const target = num(v.target);
      if (target === null || target < 1) return { ...none, error: 'Enter how many months you want to pay off the card in.' };
      payment = amortizedPayment(balance, apr, Math.round(target));
    } else {
      const p = num(v.payment);
      if (p === null || p <= 0) return { ...none, error: 'Enter your monthly payment.' };
      if (p <= balance * r)
        return { ...none, error: `A payment of ${money(p)} doesn't cover the ${money(balance * r)} of monthly interest, so the balance would never go down.` };
      payment = p;
    }
    const s = simulate(balance, r, payment);
    if (s.months >= MAX_MONTHS) return { ...none, error: 'This would take more than 100 years to pay off.' };
    const idx = sampleIdx(s.months, 100);
    const chart: ChartSpec[] = [
      { type: 'line', title: 'Balance over time', x: idx, xLabel: 'Months', yFormat: CURRENCY, series: [{ name: 'Balance', values: idx.map((m) => s.balances[m]) }] },
      moneyDonut('Total of all payments', [{ label: 'Balance', value: balance }, { label: 'Interest', value: s.interest }], `${Math.round((s.interest / s.paid) * 100)}%`, 'is interest'),
    ];
    if (findPayment) {
      const n = Math.round(num(v.target) as number);
      const totalPaid = payment * n;
      return {
        monthlyPayment: payment,
        months: n,
        totalInterest: totalPaid - balance,
        totalPaid,
        chart,
        steps: [`Monthly rate r = ${apr}% ÷ 12 = ${(r * 100).toFixed(4)}%`, `Payment = B·r ÷ (1 − (1 + r)^−n) with n = ${n} → ${money(payment)}`],
        note: `Paying ${money(payment)} a month clears the card in ${duration(n)} with ${money(totalPaid - balance)} of interest — as long as you stop adding new charges.`,
      };
    }
    return {
      months: s.months,
      duration: duration(s.months),
      monthlyPayment: payment,
      totalInterest: s.interest,
      totalPaid: s.paid,
      chart,
      steps: [
        `Monthly rate r = ${apr}% ÷ 12 = ${(r * 100).toFixed(4)}%; first month's interest = ${money(balance * r)}`,
        `n = −ln(1 − B·r ÷ P) ÷ ln(1 + r) = ${(-Math.log(1 - (balance * r) / payment) / Math.log(1 + r)).toFixed(2)} → ${s.months} payments`,
        `Final payment is ${money(s.lastPayment)}`,
      ],
      note: `Interest adds ${money(s.interest)} (${Math.round((s.interest / balance) * 100)}% of the balance). Paying ${money(payment + 50)} instead would save time and interest.`,
    };
  },
  content: {
    formula: [
      'Months n = −ln(1 − B·r ÷ P) ÷ ln(1 + r)',
      'Payment for n months P = B·r ÷ (1 − (1 + r)^−n)',
      'B = balance, r = APR ÷ 12, P = monthly payment',
    ],
    body: [
      'Credit card interest is charged every month on the balance you carry, so a high APR makes slow repayment expensive. Paying only a little above the interest means most of each payment never touches the actual debt.',
      'Choose "Time to pay off" to see how long a fixed monthly payment takes and what it costs in interest, or "Payment needed" to work out what to pay each month to be debt-free by a deadline. Both assume you make no new purchases and the APR stays the same.',
      'Card issuers calculate interest on the average daily balance, so real statements will differ by a few dollars from this month-by-month estimate. The big picture — how much faster a larger payment gets you out of debt — is what matters.',
      'If you carry balances on several cards, putting extra money toward the highest-APR card first (the avalanche method) minimizes total interest. A 0% balance-transfer offer can also help if you can repay within the promotional period and the transfer fee is lower than the interest saved.',
    ],
    faq: [
      { q: 'Why does paying the minimum take so long?', a: 'Minimum payments are usually set around 1–3% of the balance plus interest, so they shrink as the balance shrinks. That keeps payments low but can stretch repayment out over decades with interest exceeding the original balance.' },
      { q: 'Is it better to pay a fixed amount or the minimum?', a: 'A fixed amount. Keeping the payment the same as the balance falls sends more and more to principal each month, which shortens the payoff dramatically.' },
      { q: 'Does paying twice a month help?', a: 'Slightly. Because interest is based on the average daily balance, paying earlier in the cycle lowers the interest charged. The bigger effect still comes from the total amount you pay.' },
    ],
  },
  related: ['loan', 'apr', 'compound-interest', 'net-worth'],
  examples: [
    { values: { mode: 'payment', balance: 1200, apr: 0, payment: null, target: 12 }, expect: { monthlyPayment: 100, totalInterest: 0 } },
    { values: { mode: 'months', balance: 1000, apr: 0, payment: 300, target: null }, expect: { months: 4, totalPaid: 1000, duration: '4 mo' } },
    { values: { mode: 'months', balance: 1000, apr: 12, payment: 600, target: null }, expect: { months: 2, totalInterest: 14.1 }, tolerance: 1e-9 },
  ],
});
