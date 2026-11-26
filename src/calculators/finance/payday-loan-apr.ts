import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'payday-loan-apr',
  title: 'Payday Loan APR Calculator',
  category: 'finance',
  description: 'Turn a payday loan fee into an APR. Enter the amount, fee and term in days to see the yearly rate and the total fees if you roll the loan over.',
  keywords: ['payday loan apr calculator', 'payday loan fee to apr', 'cash advance apr', 'short term loan apr', 'payday loan rollover cost'],
  updated: '2026-11-26',
  popular: false,
  inputs: [
    { id: 'amount', label: 'Amount borrowed', type: 'number', prefix: '$', default: 100, min: 1, step: 50, info: 'The cash you receive.' },
    { id: 'fee', label: 'Fee or finance charge', type: 'number', prefix: '$', default: 15, min: 0, step: 1, info: 'The total fee charged for one term, for example $15 per $100.' },
    { id: 'days', label: 'Loan term', type: 'number', default: 14, min: 1, max: 365, step: 1, suffix: 'days', info: 'Days until the loan is due, often 14 days or a single pay period.' },
    { id: 'rollovers', label: 'Rollovers', type: 'number', default: 0, min: 0, max: 52, step: 1, suffix: 'times', info: 'How many times the loan is renewed by paying the fee again.' },
  ],
  outputs: [
    { id: 'apr', label: 'APR (simple, not compounded)', format: 'percent', precision: 1, primary: true, info: 'Fee ÷ amount × 365 ÷ days.' },
    { id: 'fees', label: 'Total fees paid', format: 'currency', precision: 2, info: 'Fee × (1 + rollovers).' },
    { id: 'feePct', label: 'Fees as % of amount borrowed', format: 'percent', precision: 1, info: 'Total fees ÷ amount borrowed.' },
  ],
  compute: (v) => {
    const P = num(v.amount);
    const F = num(v.fee);
    const dRaw = num(v.days);
    const rRaw = num(v.rollovers);
    if (P === null || F === null || dRaw === null || rRaw === null) return { apr: null };
    const d = Math.round(dRaw);
    const r = Math.round(rRaw);
    if (P <= 0 || F < 0 || d < 1 || r < 0) return { apr: null };
    const apr = (F / P) * (365 / d);
    const fees = F * (1 + r);
    const feePct = fees / P;
    const aprPct = apr * 100;
    return {
      apr,
      fees,
      feePct,
      tone: apr > 0.36 ? ('warn' as const) : ('ok' as const),
      badge: `${fmt(aprPct, 1)}% APR`,
      note: `A ${money(F)} fee on ${money(P)} for ${d} days works out to about ${fmt(aprPct, 1)}% APR. With ${r} rollover${r === 1 ? '' : 's'} you would pay ${money(fees)} in fees, ${fmt(feePct * 100, 1)}% of the amount borrowed. This is an estimate using simple interest; local limits and your lender's disclosure may differ.`,
      chart: {
        type: 'bar' as const,
        title: 'Fees paid by number of rollovers',
        categories: ['0', '1', '2', '3', '4'].map((x) => (x === '0' ? 'None' : `${x}x`)),
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Total fees', values: [0, 1, 2, 3, 4].map((k) => F * (1 + k)) }],
      },
      steps: [
        `Fee ÷ amount = ${money(F)} ÷ ${money(P)} = ${fmt(F / P, 4)}`,
        `Periods per year = 365 ÷ ${d} = ${fmt(365 / d, 3)}`,
        `APR = ${fmt(F / P, 4)} × ${fmt(365 / d, 3)} = ${fmt(aprPct, 2)}%`,
        `Total fees = ${money(F)} × (1 + ${r}) = ${money(fees)}`,
      ],
    };
  },
  content: {
    formula: [
      'APR = fee ÷ amount borrowed × 365 ÷ term in days',
      'Total fees = fee × (1 + number of rollovers)',
      'Fees as % of amount = total fees ÷ amount borrowed',
    ],
    body: [
      'Payday loans are quoted as a flat fee per $100 rather than a yearly rate, which hides how expensive a short loan is. Annualizing the fee, in the simple-interest style of the Truth in Lending APR, makes it comparable with a credit card or personal loan.',
      'Example: borrow $100, pay a $15 fee, and repay in 14 days. The fee is 15% of the amount, and 365 ÷ 14 = 26.07 such periods fit in a year, so the APR is 0.15 × 26.07 = 391.1%. A $300 loan with a $45 fee over 14 days is the same 391.1%, and a $500 loan with a $100 fee over 30 days is 0.20 × 12.17 = 243.3%.',
      'Rollovers matter most. If you cannot repay and pay the fee again to extend the loan, each renewal adds another fee: $15 rolled over 3 times means 4 fees, or $60 on a $100 loan.',
      'This is an estimate using simple, not compounded, interest. Local limits and rules vary, so check your loan disclosure for the official APR. Nothing is stored and everything runs in your browser.',
    ],
    faq: [
      { q: 'How do you convert a payday loan fee to an APR?', a: 'Divide the fee by the amount borrowed, then multiply by 365 divided by the days in the term. For $15 on $100 over 14 days, that is 0.15 × 26.07 = 391.1%.' },
      { q: 'Why is a $15 fee per $100 such a high APR?', a: 'Because the term is short. The 15% fee is charged every 14 days, and about 26 of those periods fit in a year, so the yearly rate is roughly 391%.' },
      { q: 'Does the loan size change the APR?', a: 'Not if the fee scales with it. $300 with a $45 fee over 14 days is also 391.1%. A $500 loan with a $100 fee over 30 days is lower, at 243.3%, because the term is longer.' },
      { q: 'What does a rollover cost?', a: 'Each rollover means paying the fee again. With a $15 fee on $100 rolled over 3 times you pay 4 fees, $60 in total, which is 60% of the amount borrowed.' },
      { q: 'Is this the same as the APR on my loan paperwork?', a: 'It is an estimate using simple interest, not compounding. Your lender must disclose an official APR, and local limits vary, so use the paperwork for the legal figure.' },
    ],
    sources: [],
  },
  related: ['loan', 'apr', 'simple-interest', 'late-payment-cost'],
  examples: [
    // 15/100 = 0.15; 365/14 = 26.0714; APR = 3.9107 (391.07%); fees = 15; 15%
    { values: { amount: 100, fee: 15, days: 14, rollovers: 0 }, expect: { apr: 3.9107, fees: 15, feePct: 0.15 }, tolerance: 0.001 },
    // 45/300 = 0.15; same APR 3.9107
    { values: { amount: 300, fee: 45, days: 14, rollovers: 0 }, expect: { apr: 3.9107, fees: 45, feePct: 0.15 }, tolerance: 0.001 },
    // 100/500 = 0.2; 365/30 = 12.1667; APR = 2.4333 (243.3%)
    { values: { amount: 500, fee: 100, days: 30, rollovers: 0 }, expect: { apr: 2.4333, fees: 100, feePct: 0.2 }, tolerance: 0.001 },
    // 3 rollovers -> 4 fees: 15 x 4 = 60; 60/100 = 0.6
    { values: { amount: 100, fee: 15, days: 14, rollovers: 3 }, expect: { apr: 3.9107, fees: 60, feePct: 0.6 }, tolerance: 0.001 },
  ],
});
