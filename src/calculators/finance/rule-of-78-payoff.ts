import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'rule-of-78-payoff',
  title: 'Rule of 78 Payoff Rebate Calculator',
  category: 'finance',
  description: 'See how much finance charge a Rule of 78 loan refunds when you pay it off early, next to the straight-line rebate, using your own loan terms.',
  keywords: ['rule of 78 calculator', 'rule of 78 payoff', 'sum of the digits loan rebate', 'precomputed interest early payoff', 'unearned interest refund'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'charge', label: 'Total finance charge', type: 'number', prefix: '$', default: 600, min: 0, step: 50, info: 'All the interest over the full term, as printed in your loan contract.' },
    { id: 'term', label: 'Loan term', type: 'number', default: 12, min: 2, max: 120, step: 1, suffix: 'months', info: 'Number of scheduled monthly payments.' },
    { id: 'paid', label: 'Payments made so far', type: 'number', default: 3, min: 0, step: 1, suffix: 'payments', info: 'Payments already made when you pay off the loan.' },
  ],
  outputs: [
    { id: 'rebate', label: 'Rule of 78 rebate', format: 'currency', precision: 2, primary: true, info: 'Unearned finance charge refunded under the Rule of 78.' },
    { id: 'earned', label: 'Finance charge already earned', format: 'currency', precision: 2, info: 'Finance charge minus the rebate.' },
    { id: 'straight', label: 'Straight-line rebate', format: 'currency', precision: 2, info: 'Charge × unpaid months ÷ term, for comparison.' },
    { id: 'diff', label: 'Extra refund under straight-line', format: 'currency', precision: 2, info: 'Straight-line rebate minus Rule of 78 rebate: what the Rule of 78 keeps.' },
  ],
  compute: (v) => {
    const F = num(v.charge);
    const nRaw = num(v.term);
    const kRaw = num(v.paid);
    if (F === null || nRaw === null || kRaw === null) return { rebate: null };
    const n = Math.round(nRaw);
    const k = Math.round(kRaw);
    if (F < 0 || n < 2 || k < 0 || k > n) return { rebate: null };
    const S = (n * (n + 1)) / 2;
    const remaining = n - k;
    const remDigits = (remaining * (remaining + 1)) / 2;
    const rebate = (F * remDigits) / S;
    const earned = F - rebate;
    const straight = (F * remaining) / n;
    const diff = straight - rebate;
    return {
      rebate,
      earned,
      straight,
      diff,
      tone: 'ok' as const,
      badge: `${money(rebate)} rebate after ${k} of ${n} payments`,
      note: `Under the Rule of 78 you would get back ${money(rebate)} of the ${money(F)} finance charge, compared with ${money(straight)} on a straight-line basis, a gap of ${money(diff)}. Check your contract and your state's rules: the method is limited or banned in many places.`,
      chart: {
        type: 'bar' as const,
        title: 'Rebate by method',
        categories: ['Rule of 78', 'Straight-line'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Rebate', values: [rebate, straight] }],
      },
      steps: [
        `Sum of digits = ${n} × ${n + 1} ÷ 2 = ${fmt(S, 0)}`,
        `Digits for the ${remaining} unpaid months = ${remaining} × ${remaining + 1} ÷ 2 = ${fmt(remDigits, 0)}`,
        `Rebate = ${money(F)} × ${fmt(remDigits, 0)} ÷ ${fmt(S, 0)} = ${money(rebate)}`,
        `Earned = ${money(F)} - ${money(rebate)} = ${money(earned)}`,
        `Straight-line rebate = ${money(F)} × ${remaining} ÷ ${n} = ${money(straight)}`,
      ],
    };
  },
  content: {
    formula: [
      'Sum of digits S = n × (n + 1) ÷ 2, where n is the term in months',
      'Unpaid months m = n - payments made; their digits = m × (m + 1) ÷ 2',
      'Rebate = finance charge × digits of the unpaid months ÷ S',
      'Straight-line rebate = finance charge × m ÷ n',
    ],
    body: [
      'The Rule of 78, also called the sum of the digits method, front-loads a precomputed finance charge. In a 12-month loan, month 1 is given 12 shares, month 2 gets 11 and so on down to 1, for 78 shares in total. Early payments therefore carry more of the charge, and paying off early refunds less than an even split would.',
      'Example: a $600 finance charge on a 12-month loan, paid off after 3 payments. The 9 unpaid months hold digits 9 + 8 + ... + 1 = 45, so the rebate is 600 × 45 ÷ 78 = $346.15 and $253.85 has been earned. A straight-line split would refund 600 × 9 ÷ 12 = $450, so the Rule of 78 keeps $103.85 more.',
      'You enter the finance charge, term and payments made from your own contract. Whether the Rule of 78 applies at all, and whether the lender may add a fee or minimum charge, depends on your contract and your state, so check your contract and state rules and ask your lender for a written payoff figure. This is an estimate only; nothing is stored and everything runs in your browser.',
    ],
    faq: [
      { q: 'How is the Rule of 78 rebate calculated?', a: 'Add up the digits 1 to n for the term to get the total, add the digits for the unpaid months, and multiply the finance charge by that ratio. For $600, 12 months and 3 payments made, it is 600 × 45 ÷ 78 = $346.15.' },
      { q: 'How much more does the Rule of 78 keep than a straight-line refund?', a: 'In that same example, a straight-line refund would be $450.00, so the Rule of 78 keeps $103.85 more. The gap is largest for early payoffs on longer terms.' },
      { q: 'Is the Rule of 78 allowed on my loan?', a: 'It depends on your contract and state. Rules differ and many places restrict or ban it, so check your contract and state rules before relying on this figure.' },
      { q: 'Does this include payoff fees or the principal balance?', a: 'No. It only splits the finance charge. Your actual payoff also includes remaining principal and any fees your contract allows, so request a payoff quote.' },
      { q: 'What if I make no payments or all of them?', a: 'With 0 payments you are refunded the whole finance charge. With every payment made, the rebate is $0.' },
    ],
    sources: [],
  },
  related: ['loan', 'late-payment-cost', 'apr', 'auto-loan'],
  examples: [
    // S=78; unpaid 9 -> digits 45; rebate 600*45/78 = 346.1538; earned 253.8462; straight 600*9/12 = 450; diff 103.8462
    { values: { charge: 600, term: 12, paid: 3 }, expect: { rebate: 346.15, earned: 253.85, straight: 450, diff: 103.85 }, tolerance: 0.01 },
    // n=24: S=300; paid 6 -> unpaid 18 -> digits 171; rebate 1200*171/300 = 684; earned 516; straight 1200*18/24 = 900; diff 216
    { values: { charge: 1200, term: 24, paid: 6 }, expect: { rebate: 684, earned: 516, straight: 900, diff: 216 } },
  ],
});
