import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, sampleIdx } from '../../lib/helpers/finance';

const MAX_MONTHS = 1200;

/** Interest accrues monthly, then the payment is applied. `pay(balanceBeforeInterest)` gives that month's payment. */
function simulate(balance: number, monthlyRate: number, pay: (b: number) => number) {
  let b = balance;
  let months = 0;
  let interest = 0;
  const balances = [balance];
  while (b > 1e-9 && months < MAX_MONTHS) {
    const i = b * monthlyRate;
    interest += i;
    b += i;
    b -= Math.min(pay(b - i), b);
    months++;
    balances.push(b);
  }
  return { months, interest, balances, done: b <= 1e-9 };
}

const duration = (m: number) => {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  return [y ? `${y} yr` : '', mo ? `${mo} mo` : ''].filter(Boolean).join(' ') || '0 mo';
};

export default defineCalculator({
  slug: 'minimum-payment-trap',
  title: 'Minimum Payment Trap Calculator',
  category: 'finance',
  description: 'See how long a credit card takes to pay off at the minimum payment versus a fixed payment equal to the first minimum, and the extra interest it costs.',
  keywords: ['minimum payment calculator', 'credit card minimum payment', 'minimum payment trap', 'how long to pay off credit card minimum', 'minimum vs fixed payment'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'balance', label: 'Card balance', type: 'number', prefix: '$', default: 5000, min: 0, step: 100, info: 'What you owe on the card now. The calculator assumes no new charges.' },
    { id: 'apr', label: 'Interest rate (APR)', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 0.1, info: 'The purchase APR on your statement. Monthly interest is balance × APR ÷ 12.' },
    { id: 'pct', label: 'Minimum payment, percent of balance', type: 'number', suffix: '%', default: 2, min: 0, max: 100, step: 0.1, info: 'Issuers often set the minimum as a percent of the balance, commonly 1% to 3%, sometimes plus interest. This calculator uses percent of balance only.' },
    { id: 'floor', label: 'Minimum payment floor', type: 'number', prefix: '$', default: 25, min: 0, step: 1, info: 'The lowest amount the issuer will ask for. The minimum each month is the larger of this and the percent of the balance.' },
  ],
  outputs: [
    { id: 'minTime', label: 'Time to pay off at the minimum', format: 'text', primary: true, info: 'Months until the balance reaches zero if you pay the minimum each month, recomputed on the shrinking balance.' },
    { id: 'minInterest', label: 'Total interest at the minimum', format: 'currency', info: 'All interest charged until payoff. Blank if the card would never be paid off.' },
    { id: 'fixTime', label: 'Time to pay off at a fixed payment', format: 'text', info: 'Months if you pay the same amount as your first minimum every month.' },
    { id: 'fixInterest', label: 'Total interest at a fixed payment', format: 'currency', info: 'All interest charged when you keep the payment at the first month\'s minimum. Blank if never paid off.' },
    { id: 'firstPayment', label: 'First month\'s minimum payment', format: 'currency', info: 'The larger of the floor and the percent of your starting balance. This is also the fixed payment.' },
    { id: 'saved', label: 'Interest saved by paying fixed', format: 'currency', info: 'Total interest at the minimum minus total interest at the fixed payment. Blank if either plan never ends.' },
    { id: 'minMonths', label: 'Months at the minimum', format: 'integer', info: 'The same time as above, as a plain number of months. Blank if never paid off.' },
    { id: 'fixMonths', label: 'Months at a fixed payment', format: 'integer', info: 'The same time as above, as a plain number of months. Blank if never paid off.' },
  ],
  compute: (v) => {
    const balance = num(v.balance);
    const apr = num(v.apr);
    const p = num(v.pct);
    const floor = num(v.floor);
    if (balance === null || apr === null || p === null || floor === null) return { minTime: null };
    if (balance < 0 || apr < 0 || p < 0 || floor < 0) return { minTime: null, error: 'Values cannot be negative.' };
    if (balance === 0) return { minTime: '0 mo', fixTime: '0 mo', minInterest: 0, fixInterest: 0, firstPayment: 0, saved: 0, minMonths: 0, fixMonths: 0, note: 'Nothing to pay off.' };

    const r = apr / 1200;
    const minPay = (b: number) => Math.max(floor, (p / 100) * b);
    const first = Math.min(minPay(balance), balance * (1 + r));
    if (first <= 0) return { minTime: null, error: 'Set a minimum percent or a floor above zero.' };
    const a = simulate(balance, r, minPay);
    const f = simulate(balance, r, () => first);
    const label = (s: ReturnType<typeof simulate>) => (s.done ? duration(s.months) : 'Never (over 100 years)');
    const saved = a.done && f.done ? a.interest - f.interest : null;

    const n = Math.max(a.done ? a.months : 0, f.done ? f.months : 0) || 60;
    const idx = sampleIdx(n, 80);
    const at = (s: ReturnType<typeof simulate>, m: number) => (m < s.balances.length ? s.balances[m] : 0);
    const chart: ChartSpec[] = [
      { type: 'line', title: 'Balance over time', x: idx, xLabel: 'Months', yFormat: CURRENCY, series: [{ name: 'Minimum payment', values: idx.map((m) => at(a, m)) }, { name: 'Fixed payment', values: idx.map((m) => at(f, m)) }] },
    ];
    if (a.done && f.done) chart.push({ type: 'bar', title: 'Total interest', categories: ['Minimum payment', 'Fixed payment'], series: [{ name: 'Interest', values: [a.interest, f.interest] }], format: CURRENCY });

    const interestPerMonth = balance * r;
    return {
      minTime: label(a),
      minInterest: a.done ? a.interest : null,
      fixTime: label(f),
      fixInterest: f.done ? f.interest : null,
      firstPayment: first,
      saved,
      minMonths: a.done ? a.months : null,
      fixMonths: f.done ? f.months : null,
      tone: !a.done ? 'bad' : a.months > 120 ? 'warn' : 'ok',
      badge: a.done ? `${duration(a.months)} at the minimum` : 'Never paid off',
      chart,
      steps: [
        `First month: interest = ${money(balance, 0)} × ${apr}% ÷ 12 = ${money(interestPerMonth)}`,
        `Minimum = max(${money(floor, 0)}, ${p}% × balance) = ${money(first)} in month 1, recomputed each month`,
        `Fixed payment = ${money(first)} every month`,
        ...(first <= interestPerMonth ? [`The first payment does not cover the ${money(interestPerMonth)} of monthly interest, so the balance does not fall at first.`] : []),
      ],
      note: a.done && f.done
        ? `Paying the minimum costs ${money(a.interest)} in interest over ${duration(a.months)}. Paying the same ${money(first)} every month ends in ${duration(f.months)} with ${money(f.interest)} of interest, saving ${money(a.interest - f.interest)}.`
        : `At least one plan never pays the card off within ${MAX_MONTHS} months (100 years), usually because the payment is no larger than the monthly interest. Increase the payment or lower the rate.`,
    };
  },
  content: {
    formula: [
      'Each month: interest = balance × APR ÷ 12, added first, then the payment is subtracted',
      'Minimum payment = max(floor, percent × balance), recomputed on the new balance each month',
      'Fixed payment = the first month\'s minimum, held constant',
    ],
    body: [
      'Because the minimum payment is a percentage of what you owe, it shrinks as the balance shrinks. That keeps each bill small, but it also means very little goes to the actual debt, and the payoff stretches out for years. This calculator compares that path with paying a fixed amount every month, set equal to your very first minimum.',
      'The model is deliberately simple and documented. Monthly interest is balance × APR ÷ 12 and is added before the payment. The minimum is the larger of your floor and the percent of the balance. Many issuers instead use a percent of the balance plus interest, or a different floor, so check your card agreement and enter the percent and floor that match. The calculator ignores late fees, new purchases and changing rates, and stops after 1,200 months. If the plan has not paid off by then it says "Never".',
      'The card is never paid off if a payment is not larger than the interest it has to cover. With a percent minimum, that happens when the percent is below the monthly rate, which is APR ÷ 12. For example, a 2% minimum cannot reduce a balance on a card charging 24% APR or more, since 24% ÷ 12 is already 2% a month.',
    ],
    sections: [
      {
        heading: 'How to escape the trap',
        paragraphs: [
          'Pay a fixed amount at least equal to your first minimum, and round it up when you can. Stop new charges on the card, and consider a lower-rate balance transfer or consolidation if the fee is smaller than the interest saved. The credit card payoff calculator shows how any fixed payment changes the timeline.',
        ],
      },
    ],
    faq: [
      { q: 'How long does a $5,000 balance take at the minimum?', a: 'At 20% APR with a minimum of 2% of the balance and a $25 floor, it takes 524 months, about 43 years and 8 months, and costs about $20,210 in interest.' },
      { q: 'What if I pay the first minimum every month instead?', a: 'On the same card the first minimum is $100. Paying $100 every month clears the balance in 109 months, about 9 years and 1 month, with about $5,840 of interest. That is roughly $14,370 less interest than paying the shrinking minimum.' },
      { q: 'Can a card never be paid off at the minimum?', a: 'Yes. If the minimum percent is not above the monthly rate (APR ÷ 12), the balance does not fall. A $2,000 balance at 24% APR with a 2% minimum has a $40 payment and $40 of interest, so it never ends.' },
      { q: 'Is this exactly what my card issuer does?', a: 'No. Issuers use their own formulas, often percent of balance plus interest, and charge interest on the average daily balance. Use this as a close estimate and enter your own percent and floor.' },
    ],
    sources: [
      { label: 'CFPB: Credit card minimum payment warning', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-a-minimum-payment-on-a-credit-card-en-1953/' },
      { label: 'CFPB: Credit card interest calculation', url: 'https://www.consumerfinance.gov/ask-cfpb/how-is-credit-card-interest-calculated-en-51/' },
    ],
  },
  related: ['credit-card-payoff', 'debt-payoff-planner', 'balance-transfer', 'apr'],
  examples: [
    {
      // Zero APR, balance 1,000, 10%, floor 25. Fixed: first = 100 -> 10 payments of 100.
      // Minimum: balance 1000×0.9^n while ≥ 250 (13 payments -> 254.24), then month 14 pays 25.42 -> 228.82,
      // then 25/month: 228.82 / 25 = 9.15 -> 10 more payments, 24 total. Checked by script.
      values: { balance: 1000, apr: 0, pct: 10, floor: 25 },
      expect: { minMonths: 24, fixMonths: 10, firstPayment: 100, minInterest: 0, fixInterest: 0, saved: 0 },
      tolerance: 1e-9,
    },
    {
      // $5,000, 20% APR, 2% / $25: month-by-month script (interest then payment).
      // Minimum: 524 months, interest 20,209.99. Fixed $100: 109 months, interest 5,840.10 (script).
      values: { balance: 5000, apr: 20, pct: 2, floor: 25 },
      expect: { minMonths: 524, fixMonths: 109, firstPayment: 100, minInterest: 20209.99, fixInterest: 5840.1, saved: 14369.9 },
      tolerance: 0.01,
    },
    {
      // $2,000 at 24%: 2% = $40 = monthly interest $40, so it never falls.
      values: { balance: 2000, apr: 24, pct: 2, floor: 25 },
      expect: { minTime: 'Never (over 100 years)', fixTime: 'Never (over 100 years)', firstPayment: 40 },
    },
  ],
});
