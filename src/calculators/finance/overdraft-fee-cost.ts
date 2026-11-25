import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

export default defineCalculator({
  slug: 'overdraft-fee-cost',
  title: 'Overdraft Fee Cost: Yearly Total and APR',
  category: 'finance',
  description: 'See what overdraft fees cost per year and over 5 years, and the APR a flat fee equals when you are overdrawn a small amount for only a few days.',
  keywords: ['overdraft fee calculator', 'overdraft fee apr', 'cost of overdraft fees per year', 'overdraft fee as interest rate', 'bank overdraft cost'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'fee', label: 'Fee per overdraft', type: 'number', prefix: '$', default: 35, min: 0, step: 1, info: 'The flat fee your bank charges each time. Check your fee schedule; many banks charge $0 to $35.' },
    { id: 'count', label: 'Overdrafts per year', type: 'number', default: 4, min: 0, step: 1, info: 'How many times a year you are overdrawn and charged.' },
    { id: 'amount', label: 'Average amount overdrawn', type: 'number', prefix: '$', default: 20, min: 0, step: 5, info: 'How far below zero the account goes on a typical overdraft.' },
    { id: 'days', label: 'Days until repaid', type: 'number', default: 3, min: 1, step: 1, info: 'How many days the account stays negative before a deposit covers it.' },
  ],
  outputs: [
    { id: 'yearly', label: 'Overdraft fees per year', format: 'currency', precision: 2, primary: true, info: 'Fee × overdrafts per year.' },
    { id: 'pct', label: 'Fee as a share of the amount borrowed', format: 'percent', precision: 2, info: 'Fee ÷ amount overdrawn, for one overdraft.' },
    { id: 'apr', label: 'Equivalent APR (simple)', format: 'percent', precision: 0, info: 'Fee ÷ amount × 365 ÷ days. Simple annualized rate, no compounding.' },
    { id: 'five', label: 'Fees over 5 years', format: 'currency', precision: 2, info: 'Yearly cost × 5, at the same pace and fee.' },
  ],
  compute: (v) => {
    const fee = num(v.fee);
    const count = num(v.count);
    const amount = num(v.amount);
    const days = num(v.days);
    if (fee === null || count === null || amount === null || days === null) return { yearly: null };
    if (fee < 0 || count < 0 || amount <= 0 || days < 1) return { yearly: null };
    const d = Math.round(days);
    const yearly = fee * count;
    const five = yearly * 5;
    const pct = fee / amount;
    const apr = pct * 365 / d;
    return {
      yearly,
      pct,
      apr,
      five,
      tone: yearly > 0 ? 'warn' : 'ok',
      badge: `${money(yearly)} a year in fees`,
      note: `A ${money(fee)} fee on ${money(amount)} repaid in ${d} days is ${fmt(pct * 100, 2)}% of the amount, which works out to a simple APR of ${fmt(apr * 100, 0)}%. At ${fmt(count, 0)} a year that is ${money(yearly)}, or ${money(five)} over 5 years. Bank fees and grace rules vary.`,
      chart: {
        type: 'bar' as const,
        title: 'Cumulative overdraft fees',
        categories: ['Year 1', 'Year 2', 'Year 3', 'Year 4', 'Year 5'],
        yFormat: { format: 'currency' as const },
        series: [{ name: 'Fees paid', values: [1, 2, 3, 4, 5].map((y) => yearly * y) }],
      },
      steps: [
        `Yearly cost = ${money(fee)} × ${fmt(count, 0)} = ${money(yearly)}`,
        `Share of amount = ${money(fee)} ÷ ${money(amount)} = ${fmt(pct * 100, 2)}%`,
        `Simple APR = ${fmt(pct * 100, 2)}% × 365 ÷ ${d} = ${fmt(apr * 100, 0)}%`,
        `5 years = ${money(yearly)} × 5 = ${money(five)}`,
      ],
    };
  },
  content: {
    formula: [
      'Yearly cost = fee per overdraft × overdrafts per year',
      'Share of amount = fee ÷ amount overdrawn',
      'Simple APR = fee ÷ amount × 365 ÷ days until repaid',
      '5-year cost = yearly cost × 5',
    ],
    body: [
      'An overdraft fee is a flat charge, not an interest rate, but it is paid for what is really a very short loan. Because the amount is often small and the loan lasts only days, the fee works out to a huge annual rate. This calculator shows the yearly total, the 5-year total and that equivalent rate.',
      'Example: a $35 fee on $12 overdrawn and repaid in 3 days. The fee is 35 ÷ 12 = 291.67% of the amount. Scaled to a year, 35 ÷ 12 × 365 ÷ 3 = 354.86, which is a simple APR of about 35,486%. At 3 overdrafts a year that is $105 in fees, or $525 over 5 years.',
      'The APR here is simple, not compounded. Compounding the same fee over a full year of back-to-back loans would give an absurdly large number that does not describe anything real, so it is not shown. Fees, grace periods, minimum overdraft thresholds and opt-in rules differ by bank and change over time, so check your own fee schedule. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'How much do overdraft fees cost per year?', a: 'The fee times the number of overdrafts. At $35 and 3 overdrafts a year that is $105, and $525 over 5 years.' },
      { q: 'What APR does a $35 fee on $12 equal?', a: 'Over 3 days it is 35 ÷ 12 × 365 ÷ 3 = 354.86, or about 35,486% as a simple annual rate. The fee itself is 291.67% of the amount borrowed.' },
      { q: 'Why is the APR so high?', a: 'The fee is flat, the amount is small and the loan is short. Annualizing a large percentage paid over a few days multiplies it by 365 divided by the days.' },
      { q: 'Is this the same as a real APR on my account?', a: 'No. Banks do not quote overdraft fees as an APR, and many charge nothing. This is an illustration of the cost, not a rate in your agreement.' },
      { q: 'Why is there no compounded rate?', a: 'Repeating a loan with a fee of hundreds of percent every few days compounds to an astronomical figure that is not meaningful, so only the simple rate is shown.' },
      { q: 'How can I avoid overdraft fees?', a: 'Ask your bank about low-balance alerts, linked savings transfers, a grace period or an account with no overdraft fee. Policies vary by bank.' },
    ],
    sources: [
      { label: 'CFPB: What is an overdraft fee?', url: 'https://www.consumerfinance.gov/ask-cfpb/what-is-an-overdraft-fee-en-1019/' },
      { label: 'CFPB: Overdraft and account fees', url: 'https://www.consumerfinance.gov/consumer-tools/bank-accounts/' },
    ],
  },
  related: ['late-payment-cost', 'apr', 'daily-interest', 'credit-card-payoff'],
  examples: [
    // yearly 35*3 = 105; pct 35/12 = 2.916667; apr 2.916667*365/3 = 354.8611; five 525
    { values: { fee: 35, count: 3, amount: 12, days: 3 }, expect: { yearly: 105, pct: 2.9167, apr: 354.8611, five: 525 }, tolerance: 0.001 },
    // yearly 350; pct 35/100 = .35; apr .35*365/7 = 18.25; five 1750
    { values: { fee: 35, count: 10, amount: 100, days: 7 }, expect: { yearly: 350, pct: 0.35, apr: 18.25, five: 1750 } },
  ],
});
