import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { amortizedPayment, money, CURRENCY } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'balloon-loan',
  title: 'Balloon Loan Payment Calculator',
  category: 'finance',
  description: 'Find your monthly payment and the lump-sum balloon due on a balloon loan, plus total paid before the balloon and the interest you pay.',
  keywords: ['balloon loan calculator', 'balloon payment calculator', 'balloon mortgage calculator', 'balloon payment amount', 'seller financing balloon'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'amount', label: 'Loan amount', type: 'number', prefix: '$', default: 10000, min: 0, step: 500, info: 'The amount you borrow.' },
    { id: 'rate', label: 'Interest rate', type: 'number', suffix: '%', default: 12, min: 0, max: 30, step: 0.125, info: 'Yearly rate, fixed for the whole loan.' },
    { id: 'amort', label: 'Amortization term', type: 'number', suffix: 'months', default: 24, min: 1, max: 480, step: 1, info: 'The schedule used to set the monthly payment, as if the loan ran this long.' },
    { id: 'balloon', label: 'Balloon due after', type: 'number', suffix: 'months', default: 12, min: 1, max: 479, step: 1, info: 'Month when the remaining balance is due in one payment. Must be shorter than the amortization term.' },
  ],
  outputs: [
    { id: 'payment', label: 'Monthly payment', format: 'currency', primary: true, info: 'Level payment as if the loan were paid off over the amortization term.' },
    { id: 'balloonAmt', label: 'Balloon payment due', format: 'currency', info: 'Balance still owed at the balloon month, due in one lump sum.' },
    { id: 'paidBefore', label: 'Paid in monthly payments before balloon', format: 'currency', info: 'Monthly payment × balloon month.' },
    { id: 'totalInterest', label: 'Total interest paid', format: 'currency', info: 'Monthly payments plus balloon, minus the amount borrowed.' },
  ],
  compute: (v) => {
    const amount = num(v.amount), rate = num(v.rate), amort = num(v.amort), balloon = num(v.balloon);
    if (amount === null || rate === null || amort === null || balloon === null) return { payment: null };
    if (amount <= 0 || rate < 0 || amort < 1 || balloon < 1) return { payment: null };
    const n = Math.round(amort);
    const m = Math.round(balloon);
    if (m >= n) return { payment: null };
    const r = rate / 100 / 12;
    const payment = amortizedPayment(amount, rate, n);
    let bal = amount;
    const balances: number[] = [amount];
    for (let i = 1; i <= m; i++) {
      bal = bal * (1 + r) - payment;
      balances.push(Math.max(bal, 0));
    }
    const balloonAmt = r === 0 ? amount - payment * m : amount * (1 + r) ** m - (payment * ((1 + r) ** m - 1)) / r;
    const paidBefore = payment * m;
    const totalInterest = paidBefore + balloonAmt - amount;
    const share = (balloonAmt / amount) * 100;
    return {
      payment,
      balloonAmt,
      paidBefore,
      totalInterest,
      tone: share > 50 ? 'warn' : 'ok',
      badge: `${share.toFixed(0)}% still owed at month ${m}`,
      chart: {
        type: 'line',
        title: 'Balance owed until the balloon',
        x: balances.map((_, i) => i),
        xLabel: 'Months',
        yFormat: CURRENCY,
        series: [{ name: 'Balance', values: balances }],
      },
      steps: [
        `Payment on a ${n}-month schedule = ${money(payment)} a month`,
        `After ${m} payments (${money(paidBefore)} paid) the balance left is ${money(balloonAmt)}`,
        `That balance is due in one lump sum, ${share.toFixed(0)}% of the original ${money(amount, 0)}`,
      ],
      note: `You pay ${money(payment)} a month for ${m} months, then owe ${money(balloonAmt)} at once. Have a plan to pay or refinance it.`,
    };
  },
  content: {
    formula: [
      'Payment = P × r ÷ (1 − (1 + r)^−n), with r the monthly rate and n the amortization months',
      'Balloon = P × (1 + r)^m − Payment × ((1 + r)^m − 1) ÷ r, where m is the balloon month',
    ],
    body: [
      'A balloon loan has small regular payments and one big payment at the end. The payment is worked out as if the loan ran for a long term, but the loan is due early, so the unpaid balance comes due all at once.',
      'For $10,000 at 12% on a 24-month schedule with the balloon due at month 12, the payment is $470.73 and the balloon is $5,298.16. You pay $5,648.82 in monthly payments first, then the lump sum.',
      'The longer the amortization term compared with the balloon month, the smaller the payment and the bigger the balloon. If you cannot pay it, you need to refinance or sell, and neither is guaranteed.',
      'This calculator assumes a fixed rate and payments at the end of each month. It does not include fees, taxes or insurance, so check your loan paperwork for the exact balloon figure.',
    ],
    faq: [
      { q: 'How do you calculate a balloon payment?', a: 'Work out the level payment for the full amortization term, then find the balance left after the balloon month. For $10,000 at 12% over 24 months, the payment is $470.73 and the balance after 12 payments is $5,298.16.' },
      { q: 'Why is the balloon so large?', a: 'Early payments are mostly interest, so the balance falls slowly. In the default example you pay $5,648.82 over 12 months but still owe about 53% of the loan.' },
      { q: 'What if the balloon month equals the term?', a: 'Then it is a regular loan with no balloon. This calculator needs the balloon month to be earlier than the amortization term.' },
      { q: 'Does this include fees, taxes or insurance?', a: 'No. It shows principal and interest only, with a fixed rate.' },
    ],
    sources: [
      { label: 'What is a balloon payment? (Consumer Financial Protection Bureau)', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-balloon-payment-why-would-i-want-one-en-100/' },
      { label: 'Balloon payment mortgage (Wikipedia)', url: 'https://en.wikipedia.org/wiki/Balloon_payment_mortgage' },
    ],
  },
  related: ['mortgage', 'interest-only-loan', 'loan', 'refinance', 'loan-comparison'],
  examples: [
    // r = 1%; pmt = 10000 × 0.01 ÷ (1 − 1.01^−24) = 470.7347; balloon = 10000 × 1.01^12 − 470.7347 × (1.01^12 − 1) ÷ 0.01 = 5298.16
    { values: { amount: 10000, rate: 12, amort: 24, balloon: 12 }, expect: { payment: 470.73, balloonAmt: 5298.16, paidBefore: 5648.82, totalInterest: 946.97 }, tolerance: 0.02 },
    // 0%: pmt = 12000 ÷ 24 = 500; balloon = 12000 − 500 × 12 = 6000
    { values: { amount: 12000, rate: 0, amort: 24, balloon: 12 }, expect: { payment: 500, balloonAmt: 6000, totalInterest: 0 }, tolerance: 1e-6 },
  ],
});
