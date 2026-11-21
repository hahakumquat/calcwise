import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

interface Sim { interest: number; end: number; balances: number[]; cum: number[] }

/** Month-by-month payoff; payment is capped at what is owed (balance plus that month's interest). */
function simulate(start: number, aprPct: number, payment: number, months: number): Sim {
  const r = aprPct / 100 / 12;
  let bal = start;
  let interest = 0;
  const balances = [start];
  const cum = [0];
  for (let m = 1; m <= months; m++) {
    const i = bal * r;
    interest += i;
    const owed = bal + i;
    bal = owed - Math.min(payment, owed);
    balances.push(bal);
    cum.push(interest);
  }
  return { interest, end: bal, balances, cum };
}

export default defineCalculator({
  slug: 'balance-transfer',
  title: 'Balance Transfer Calculator: Fee Worth It?',
  category: 'finance',
  description: 'Compare keeping a credit card balance at its current APR with moving it to a 0% promo card. See interest avoided, the transfer fee and your break-even month.',
  keywords: ['balance transfer calculator', 'balance transfer break even', 'is a balance transfer worth it', '0% apr balance transfer', 'balance transfer fee calculator', 'credit card transfer savings'],
  updated: '2026-11-21',
  popular: false,
  inputs: [
    { id: 'balance', label: 'Balance to transfer', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, info: 'The card debt you would move to the new card.' },
    { id: 'apr', label: 'Current card APR', type: 'number', suffix: '%', default: 24, min: 0, max: 100, step: 0.1, info: 'Yearly interest rate on the card you have now. Interest is charged monthly at APR ÷ 12.' },
    { id: 'fee', label: 'Transfer fee', type: 'number', suffix: '%', default: 3, min: 0, max: 20, step: 0.5, info: 'Fee charged on the amount transferred, often 3% to 5%. It is added to the new balance.' },
    { id: 'promo', label: '0% promo length', type: 'number', suffix: 'months', default: 18, min: 1, max: 60, step: 1, info: 'How many months the new card charges no interest on the transferred balance.' },
    { id: 'payment', label: 'Monthly payment', type: 'number', prefix: '$', default: 300, min: 0, step: 10, info: 'What you pay each month on either card. Same payment in both cases, so the comparison is fair.' },
    { id: 'after', label: 'APR after the promo ends', type: 'number', suffix: '%', default: 24, min: 0, max: 100, step: 0.1, optional: true, help: 'Only used if some balance is left when the promo ends.', info: 'The regular rate on the new card. Used for the note about any balance left after the promo.' },
  ],
  outputs: [
    { id: 'saving', label: 'Net saving from transferring', format: 'currency', primary: true, info: 'Interest you avoid during the promo − the transfer fee.' },
    { id: 'interestStay', label: 'Interest if you keep the old card', format: 'currency', info: 'Interest the current card would charge over the promo months at the same payment.' },
    { id: 'feeAmt', label: 'Transfer fee', format: 'currency', info: 'Balance × fee %.' },
    { id: 'endStay', label: 'Left owing on the old card at promo end', format: 'currency', info: 'Balance after the promo months if you keep the old card.' },
    { id: 'endTransfer', label: 'Left owing on the new card at promo end', format: 'currency', info: '(Balance + fee) minus payments over the promo months, never below 0.' },
  ],
  compute: (v) => {
    const balance = num(v.balance);
    const apr = num(v.apr);
    const fee = num(v.fee);
    const promo = num(v.promo);
    const payment = num(v.payment);
    const after = num(v.after) ?? apr ?? 0;
    if (balance === null || apr === null || fee === null || promo === null || payment === null) return { saving: null };
    if (balance <= 0 || apr < 0 || fee < 0 || promo < 1 || payment < 0 || after < 0) return { saving: null };
    const months = Math.round(promo);

    const feeAmt = balance * (fee / 100);
    const stay = simulate(balance, apr, payment, months);
    const move = simulate(balance + feeAmt, 0, payment, months);
    const saving = stay.interest - feeAmt;

    const breakEven = stay.cum.findIndex((c, i) => i > 0 && c >= feeAmt);
    const good = saving > 0;

    const x = Array.from({ length: months + 1 }, (_, i) => i);
    const rem = move.end;
    const afterNote = rem > 0.005
      ? ` About ${money(rem, 0)} would still be owed when the promo ends and would start charging ${after}% (roughly ${money((rem * after) / 100 / 12, 2)} in the first month), so a higher payment helps.`
      : ' The new card would be paid off before the promo ends.';

    return {
      saving,
      interestStay: stay.interest,
      feeAmt,
      endStay: stay.end,
      endTransfer: move.end,
      tone: good ? 'good' : 'warn',
      badge: good ? `Saves ${money(saving, 0)}` : 'Fee costs more than it saves',
      chart: {
        type: 'line',
        title: 'Balance left, month by month',
        x,
        xLabel: 'Month',
        yFormat: { format: 'currency' },
        series: [
          { name: 'Keep old card', values: stay.balances },
          { name: 'Transfer (with fee)', values: move.balances },
        ],
      },
      steps: [
        `Fee = ${money(balance, 2)} × ${fee}% = ${money(feeAmt, 2)}, so the new card starts at ${money(balance + feeAmt, 2)}`,
        `Old card: ${months} months at ${apr}% APR (${+(apr / 12).toFixed(4)}% a month) with ${money(payment, 2)} payments charges ${money(stay.interest, 2)} interest`,
        `New card: 0% for ${months} months, interest ${money(0, 2)}`,
        `Net saving = ${money(stay.interest, 2)} − ${money(feeAmt, 2)} = ${money(saving, 2)}`,
        breakEven > 0 ? `Break-even: month ${breakEven}, when old-card interest first reaches the fee` : `Interest on the old card never reaches the fee within the promo`,
      ],
      note: (good
        ? `Moving the balance would save about ${money(saving, 0)} over the ${months}-month promo, and the fee is covered by month ${breakEven}.`
        : `Over ${months} months the old card would charge ${money(stay.interest, 0)} in interest, less than the ${money(feeAmt, 0)} fee, so the transfer would not pay for itself.`) + afterNote + ' Rates, fees and approval vary by card; this is an estimate, not advice.',
    };
  },
  content: {
    formula: [
      'Transfer fee = balance × fee %',
      'Old card: each month, interest = balance × APR ÷ 12, then subtract your payment',
      'New card: starts at balance + fee, no interest during the promo, subtract your payment each month',
      'Net saving = interest the old card would charge during the promo − transfer fee',
    ],
    body: [
      'A balance transfer moves card debt to a new card that charges 0% interest for a promo period, usually in exchange for a one-time fee. It only helps if the interest you avoid is more than that fee, and if you actually pay the balance down while the promo lasts.',
      'Enter your balance, your current APR, the transfer fee and the promo length, plus what you can pay each month. The calculator runs both cards month by month with the same payment, and compares the interest the old card would charge with the fee.',
      'Many quick estimators divide the fee by one month of interest. That shortcut ignores that your balance shrinks as you pay. This page uses a real month-by-month payoff, so the break-even month is more realistic.',
    ],
    sections: [
      {
        heading: 'What happens when the promo ends',
        paragraphs: [
          'Any balance left when the promo ends starts charging the regular rate. The result shows how much would be left and the interest it would start to cost. If you cannot clear it in time, a bigger monthly payment or a longer promo changes the answer. Check the terms: some offers also charge a minimum fee, and new purchases may not get the 0% rate.',
        ],
      },
    ],
    faq: [
      { q: 'How is the saving worked out?', a: 'It is the interest your old card would charge over the promo months, minus the transfer fee. Both cards use the same monthly payment.' },
      { q: 'What does $5,000 at 24% with a 3% fee and 18 months look like?', a: 'Paying $300 a month, the old card charges about $1,117.54 in interest. The fee is $150, so you save about $967.54, and you break even in month 2. The new card is paid off before the promo ends.' },
      { q: 'What if I cannot pay the balance in time?', a: 'What is left starts accruing the post-promo APR. The calculator shows the amount left and a first-month interest estimate.' },
      { q: 'Does the fee go on the balance?', a: 'Yes, here the fee is added to the new balance, which is how most cards bill it.' },
      { q: 'Is a transfer always worth it?', a: 'No. With a short promo, a low APR or a big fee, the fee can exceed the interest you avoid. The badge tells you when that happens.' },
    ],
    sources: [
      { label: 'CFPB: What is a balance transfer?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-balance-transfer-en-81/' },
    ],
  },
  related: ['debt-payoff-planner', 'credit-card-payoff', 'credit-card-annual-fee', 'points-value', 'daily-interest'],
  examples: [
    {
      // r = 2%/month; stay: balance 5,000 -> 717.54 after 18 payments of 300, interest = 5,400 − 4,282.46 = 1,117.54; fee 150; saving 967.54; transfer: 5,150 − 5,400 < 0 so 0.
      values: { balance: 5000, apr: 24, fee: 3, promo: 18, payment: 300, after: 24 },
      expect: { saving: 967.54, interestStay: 1117.54, feeAmt: 150, endStay: 717.54, endTransfer: 0 },
      tolerance: 0.01,
    },
    {
      // r = 1.5%/month; 2,000 with $100 payments for 12 months: interest 287.12, end 1,087.12; fee 5% = 100; saving 187.12; transfer 2,100 − 1,200 = 900.
      values: { balance: 2000, apr: 18, fee: 5, promo: 12, payment: 100, after: 20 },
      expect: { saving: 187.12, interestStay: 287.12, feeAmt: 100, endStay: 1087.12, endTransfer: 900 },
      tolerance: 0.01,
    },
  ],
});
