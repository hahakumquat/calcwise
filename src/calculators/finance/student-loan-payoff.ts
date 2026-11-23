import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, MONTH_S, amortizedPayment, money, sampleIdx, toMonths } from '../../lib/helpers/finance';

const MAX_MONTHS = 1200;
const EPS = 0.005; // half a cent: treat as paid off

/**
 * Month by month: interest accrues on the balance, then the payment (capped at what is owed) is applied.
 * `lump` is paid on day one, before the first month's interest.
 */
function simulate(balance: number, apr: number, payment: number, lump: number) {
  const r = apr / 1200;
  let b = Math.max(0, balance - lump);
  const balances = [b];
  let interest = 0;
  let months = 0;
  while (b > EPS && months < MAX_MONTHS) {
    const it = b * r;
    interest += it;
    b = b + it - Math.min(payment, b + it);
    months++;
    balances.push(b > EPS ? b : 0);
  }
  return { months, interest, balances, done: b <= EPS };
}

const duration = (m: number) => {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  return [y ? `${y} yr` : '', mo ? `${mo} mo` : ''].filter(Boolean).join(' ') || '0 mo';
};

export default defineCalculator({
  slug: 'student-loan-payoff',
  title: 'Student Loan Payoff Calculator: Extra Payments',
  seoTitle: 'Student Loan Payoff Calculator',
  category: 'finance',
  description: 'See how much sooner you can be free of student loans, and how much interest you save, by adding an extra monthly payment or a one-time lump sum.',
  keywords: ['student loan payoff', 'student loan extra payment', 'pay off student loans early', 'student loan interest saved', 'student loan calculator'],
  inputs: [
    { id: 'balance', label: 'Loan balance', type: 'number', prefix: '$', default: 35000, min: 0, info: 'What you owe today across the loans you want to model, from your loan servicer.' },
    { id: 'rate', label: 'Interest rate (APR)', type: 'number', suffix: '%', default: 5.5, min: 0, step: 0.01, info: 'The yearly interest rate. If you have several loans, use the weighted average. 0 is allowed.' },
    { id: 'term', label: 'Remaining term', type: 'number', unit: 'time', units: ['mo', 'yr'], defaultUnit: 'yr', default: 10, info: 'How long is left on the loan under your current plan. Used to work out your standard monthly payment.' },
    { id: 'payment', label: 'Current monthly payment', type: 'number', prefix: '$', min: 0, optional: true, info: 'Optional. Leave blank to use the standard payment that pays the loan off exactly at the end of the remaining term.' },
    { id: 'extra', label: 'Extra monthly payment', type: 'number', prefix: '$', default: 100, min: 0, optional: true, info: 'Money on top of your regular payment each month. Ask your servicer to apply it to principal.' },
    { id: 'lump', label: 'One-time lump sum', type: 'number', prefix: '$', default: 0, min: 0, optional: true, info: 'A single extra payment made right now, such as a bonus or tax refund. 0 is fine.' },
  ],
  outputs: [
    { id: 'monthsSaved', label: 'Time saved', format: 'integer', suffix: 'months', primary: true, info: 'How many fewer monthly payments you make with your extra payments.' },
    { id: 'interestSaved', label: 'Interest saved', format: 'currency', info: 'Total interest on your current plan minus total interest with extra payments.' },
    { id: 'savedText', label: 'Time saved (years and months)', format: 'text', info: 'The time saved written as years and months.' },
    { id: 'standardPayment', label: 'Regular monthly payment', format: 'currency', info: 'Your payment without extras: the number you entered, or the standard payment for the remaining term.' },
    { id: 'standardMonths', label: 'Payoff on current plan', format: 'integer', suffix: 'months', info: 'Months until the balance is zero paying only the regular payment.' },
    { id: 'standardText', label: 'Payoff time on current plan', format: 'text', info: 'The current-plan payoff time as years and months.' },
    { id: 'extraMonths', label: 'Payoff with extra payments', format: 'integer', suffix: 'months', info: 'Months until the balance is zero with the extra monthly payment and any lump sum.' },
    { id: 'extraText', label: 'Payoff time with extra payments', format: 'text', info: 'The payoff time with extras as years and months.' },
    { id: 'standardInterest', label: 'Total interest (current plan)', format: 'currency', info: 'All interest you would pay over the life of the loan with no extras.' },
    { id: 'extraInterest', label: 'Total interest (with extra)', format: 'currency', info: 'All interest you would pay with the extra payments.' },
  ],
  compute: (v) => {
    const none = { monthsSaved: null };
    const bal = num(v.balance);
    const apr = num(v.rate);
    const termS = num(v.term);
    const extra = num(v.extra) ?? 0;
    const lump = num(v.lump) ?? 0;
    if (bal === null || bal <= 0) return { ...none, error: 'Enter your loan balance.' };
    if (apr === null || apr < 0) return { ...none, error: 'Enter the interest rate (0 is fine).' };
    if (extra < 0 || lump < 0) return { ...none, error: 'Extra payments cannot be negative.' };
    const entered = num(v.payment);
    let pay: number;
    if (entered !== null && entered > 0) {
      pay = entered;
    } else {
      const n = termS === null ? 0 : toMonths(termS);
      if (n <= 0) return { ...none, error: 'Enter the remaining term, or your current monthly payment.' };
      pay = amortizedPayment(bal, apr, n);
    }
    const r = apr / 1200;
    const firstInterest = bal * r;
    if (pay <= firstInterest)
      return { ...none, error: `A payment of ${money(pay)} doesn't cover the ${money(firstInterest)} of interest added in the first month, so the balance would never go down. Raise the payment.` };

    const std = simulate(bal, apr, pay, 0);
    const ext = simulate(bal, apr, pay + extra, lump);
    if (!std.done || !ext.done) return { ...none, error: 'This plan would take more than 100 years to finish. Raise your payment.' };

    const monthsSaved = std.months - ext.months;
    const interestSaved = std.interest - ext.interest;
    const x = sampleIdx(std.months, 100);
    const at = (t: number[], m: number) => (m < t.length ? t[m] : 0);
    const chart: ChartSpec[] = [
      {
        type: 'line', title: 'Loan balance over time', x, xLabel: 'Months', yFormat: CURRENCY,
        series: [
          { name: 'Current plan', values: x.map((m) => at(std.balances, m)) },
          { name: 'With extra payments', values: x.map((m) => at(ext.balances, m)) },
        ],
      },
      { type: 'bar', title: 'Total interest paid', categories: ['Current plan', 'With extra'], series: [{ name: 'Interest', values: [std.interest, ext.interest] }], format: CURRENCY },
    ];
    const tone = monthsSaved === 0 ? 'neutral' : monthsSaved >= 24 ? 'good' : 'ok';
    return {
      monthsSaved,
      interestSaved,
      savedText: duration(monthsSaved),
      standardPayment: pay,
      standardMonths: std.months,
      standardText: duration(std.months),
      extraMonths: ext.months,
      extraText: duration(ext.months),
      standardInterest: std.interest,
      extraInterest: ext.interest,
      chart,
      tone: tone === 'neutral' ? undefined : tone,
      badge: monthsSaved > 0 ? `Debt-free ${duration(monthsSaved)} sooner` : 'No time saved',
      steps: [
        `Monthly rate r = ${apr}% ÷ 12 = ${(r * 100).toFixed(4)}%`,
        `Regular payment = ${money(pay)}${entered !== null && entered > 0 ? ' (entered)' : ' (standard payment for the remaining term)'}`,
        `With extras you pay ${money(pay + extra)} a month${lump > 0 ? ` after a ${money(lump)} lump sum` : ''}`,
        'Each month: add interest (balance × r), then subtract the payment, until the balance reaches zero',
      ],
      note: monthsSaved > 0
        ? `You finish ${duration(monthsSaved)} sooner and keep ${money(interestSaved)} of interest.`
        : 'Add an extra payment or lump sum to see the effect.',
    };
  },
  content: {
    formula: [
      'Each month: balance ← balance × (1 + APR ÷ 12) − payment',
      'Standard payment = P · r ÷ (1 − (1 + r)^−n), with r = APR ÷ 12 and n = remaining months',
      'Extra payments and any lump sum go straight to principal, so less interest accrues every month after.',
    ],
    body: [
      'Student loan interest builds up every month on whatever you still owe. Because each extra dollar you pay reduces the balance right away, it stops earning interest for the rest of the loan. That is why even a modest extra payment can take months or years off the schedule.',
      'Enter your balance, interest rate and remaining term. The calculator works out your standard monthly payment (or use your own payment if you know it), then compares that plan with one that adds a monthly extra and an optional lump sum. You see the payoff time, total interest and the savings side by side.',
      'Results assume a fixed rate, interest added once a month, and every extra dollar applied to principal. Real servicers may use daily interest, and variable-rate or income-driven plans will differ.',
    ],
    sections: [
      {
        heading: 'Do extra payments really save money?',
        paragraphs: [
          'Yes. Interest is charged on the outstanding balance, so a lower balance means less interest next month, and the month after. Extra payments early in the loan save the most because they remove principal that would have accrued interest for years.',
          'The savings grow with your interest rate. At 3% the benefit is modest; at 7% or more, paying ahead is often a strong guaranteed return compared with most savings accounts.',
        ],
      },
      {
        heading: 'Is there a prepayment penalty?',
        paragraphs: [
          'Federal student loans have no prepayment penalty, so you can pay extra whenever you like. Private loans are also generally penalty-free, but check your agreement.',
          'Tell your servicer to apply extra money to principal (and to the highest-rate loan first if you have several). Otherwise it may be treated as an early payment on your next bill instead of reducing the balance.',
        ],
      },
      {
        heading: 'Before you pay extra',
        paragraphs: [
          'Build a small emergency fund first so a surprise bill does not push you into higher-interest debt. If you have credit card balances, they usually cost much more than student loans and deserve the extra money first.',
          'If you are pursuing forgiveness (for example through an income-driven plan or Public Service Loan Forgiveness), paying extra could reduce the amount that is forgiven, so check the rules before paying ahead.',
        ],
      },
    ],
    faq: [
      { q: 'How much time and interest do I save with the defaults?', a: 'On a $35,000 loan at 5.5% over 10 years the standard payment is about $379.84 a month, with about $10,581 of total interest. Adding $100 a month finishes in 89 months (7 yr 5 mo) instead of 120, which saves 31 months and about $2,880 of interest.' },
      { q: 'What does a one-time lump sum do?', a: 'It lowers the balance immediately, so less interest accrues from then on. With the defaults, a $5,000 lump sum plus no monthly extra finishes in 99 months (8 yr 3 mo), 21 months early, and saves about $3,251 of interest.' },
      { q: 'Are there prepayment penalties on student loans?', a: 'Federal student loans have no prepayment penalty, and most private lenders do not charge one either. Check your loan agreement if you are unsure.' },
      { q: 'Why does the calculator say my payment is too low?', a: 'If your payment is not larger than the interest added in the first month (balance × APR ÷ 12), the balance never goes down. Raise the payment or the remaining term will not help.' },
      { q: 'Does this work for income-driven plans or variable rates?', a: 'Not exactly. It assumes a fixed rate and a fixed payment. Income-driven payments change with your income and may end in forgiveness, so treat the results as a rough guide.' },
    ],
    sources: [
      { label: 'Federal Student Aid: Repay your loans', url: 'https://studentaid.gov/manage-loans/repayment' },
      { label: 'CFPB: Student loans', url: 'https://www.consumerfinance.gov/consumer-tools/student-loans/' },
    ],
  },
  related: ['loan', 'debt-payoff-planner', 'credit-card-payoff', 'emergency-fund', 'degree-payback'],
  examples: [
    // 0% APR: $12,000 over 5 yr -> payment 12000 / 60 = $200. Extra $100 -> $300/month -> 12000 / 300 = 40 months. Interest 0.
    { values: { balance: 12000, rate: 0, term: 60 * MONTH_S, payment: null, extra: 100, lump: 0 }, expect: { standardPayment: 200, standardMonths: 60, extraMonths: 40, monthsSaved: 20, standardInterest: 0, extraInterest: 0, interestSaved: 0 } },
    // Defaults: payment = 35000*r/(1-(1+r)^-120), r = 0.055/12 = 379.84; 89 months with +$100. Verified with an independent Python script.
    { values: { balance: 35000, rate: 5.5, term: 120 * MONTH_S, payment: null, extra: 100, lump: 0 }, expect: { standardPayment: 379.84, standardMonths: 120, standardInterest: 10581.04, extraMonths: 89, extraInterest: 7700.56, monthsSaved: 31, interestSaved: 2880.48 }, tolerance: 0.01 },
    // $10,000 at 6% over 5 yr (payment 193.33, the loan.ts example), +$50/month and $1,000 lump sum. Verified with an independent script.
    { values: { balance: 10000, rate: 6, term: 60 * MONTH_S, payment: null, extra: 50, lump: 1000 }, expect: { standardPayment: 193.328, standardMonths: 60, standardInterest: 1599.68, extraMonths: 41, extraInterest: 976.39, monthsSaved: 19, interestSaved: 623.29 }, tolerance: 0.01 },
    // Lump sum only on the defaults.
    { values: { balance: 35000, rate: 5.5, term: 120 * MONTH_S, payment: null, extra: 0, lump: 5000 }, expect: { extraMonths: 99, extraInterest: 7329.76, monthsSaved: 21, interestSaved: 3251.27 }, tolerance: 0.01 },
  ],
});
