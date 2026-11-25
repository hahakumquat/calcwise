import { defineCalculator } from '../../lib/types';
import type { Input } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

const fmt = (n: number, d = 2) => (+n.toFixed(d)).toLocaleString('en-US', { maximumFractionDigits: d });

const ROWS = 6;
const rowInputs: Input[] = [];
for (let i = 1; i <= ROWS; i++) {
  rowInputs.push(
    { id: `b${i}`, label: `Balance ${i}`, type: 'number', prefix: '$', min: 0, step: 50, optional: true, default: i === 1 ? 1000 : i === 2 ? 1500 : undefined, help: i === 1 ? 'Balance outstanding for the days in the next field' : undefined, info: 'The card balance during this stretch of the cycle. Leave unused rows blank.' },
    { id: `d${i}`, label: `Days at balance ${i}`, type: 'number', min: 0, step: 1, optional: true, default: i === 1 ? 10 : i === 2 ? 20 : undefined, info: 'How many days of the cycle the balance stayed at this amount. All rows together should add up to the cycle days.' },
  );
}

export default defineCalculator({
  slug: 'average-daily-balance-interest',
  title: 'Average Daily Balance Interest Calculator',
  category: 'finance',
  description: 'Enter your balances and how many days each lasted to find the average daily balance and the credit card interest charged for the billing cycle.',
  keywords: ['average daily balance calculator', 'credit card interest calculator', 'average daily balance method', 'billing cycle interest', 'how credit card interest is calculated'],
  updated: '2026-11-25',
  popular: false,
  inputs: [
    { id: 'apr', label: 'APR', type: 'number', default: 24, min: 0, max: 100, step: 0.25, suffix: '%', info: 'Yearly interest rate on your statement. The daily rate used here is APR ÷ 365.' },
    { id: 'cycle', label: 'Days in billing cycle', type: 'number', default: 30, min: 1, max: 62, step: 1, info: 'Most cycles are 28 to 31 days. See your statement for the exact count.' },
    ...rowInputs,
  ],
  outputs: [
    { id: 'interest', label: 'Interest for the cycle', format: 'currency', precision: 2, primary: true, info: 'ADB × APR ÷ 365 × cycle days.' },
    { id: 'adb', label: 'Average daily balance', format: 'currency', precision: 2, info: 'Sum of balance × days ÷ cycle days.' },
    { id: 'rate', label: 'Effective cycle rate', format: 'percent', precision: 3, info: 'Interest ÷ ADB, which equals APR × cycle days ÷ 365.' },
  ],
  compute: (v) => {
    const apr = num(v.apr);
    const cycleRaw = num(v.cycle);
    if (apr === null || cycleRaw === null || apr < 0 || cycleRaw < 1) return { interest: null };
    const cycle = Math.round(cycleRaw);
    const rows: { b: number; d: number }[] = [];
    for (let i = 1; i <= ROWS; i++) {
      const b = num(v[`b${i}`]);
      const d = num(v[`d${i}`]);
      if (b === null && d === null) continue;
      if (b === null || d === null || b < 0 || d < 0) return { interest: null };
      rows.push({ b, d });
    }
    if (rows.length === 0) return { interest: null };
    const totalDays = rows.reduce((a, r) => a + r.d, 0);
    if (totalDays <= 0) return { interest: null };
    const weighted = rows.reduce((a, r) => a + r.b * r.d, 0);
    const adb = weighted / cycle;
    const interest = adb * (apr / 100) / 365 * cycle;
    const rate = interest / (adb || 1);
    const mismatch = totalDays !== cycle;
    const warning = mismatch
      ? ` Warning: your rows add up to ${fmt(totalDays, 2)} days but the cycle has ${cycle}. The result divides by ${cycle} days, so ${totalDays < cycle ? 'uncovered days count as a zero balance' : 'the extra days still count toward the total'}.`
      : '';

    // Day-by-day balance for the chart, filling rows in order and truncating at the cycle length.
    const x: number[] = [];
    const daily: number[] = [];
    let day = 0;
    for (const r of rows) {
      for (let k = 0; k < Math.round(r.d) && day < cycle; k++) { day++; x.push(day); daily.push(r.b); }
    }
    while (day < cycle) { day++; x.push(day); daily.push(0); }

    return {
      interest,
      adb,
      rate: adb > 0 ? rate : 0,
      tone: mismatch ? 'warn' : 'ok',
      badge: `${money(interest)} on a ${money(adb)} average balance`,
      note: `An average daily balance of ${money(adb)} at ${fmt(apr)}% APR costs ${money(interest)} over ${cycle} days.${warning} Your statement may differ slightly because issuers may use a 360-day year or compound daily.`,
      chart: {
        type: 'line' as const,
        title: 'Balance by day of the cycle',
        x,
        xLabel: 'Day of cycle',
        yFormat: { format: 'currency' as const },
        series: [
          { name: 'Daily balance', values: daily },
          { name: 'Average daily balance', values: daily.map(() => adb) },
        ],
      },
      steps: [
        `Balance × days = ${rows.map((r) => `${money(r.b)} × ${fmt(r.d)}`).join(' + ')} = ${money(weighted)}`,
        `Average daily balance = ${money(weighted)} ÷ ${cycle} = ${money(adb)}`,
        `Interest = ${money(adb)} × ${fmt(apr)}% ÷ 365 × ${cycle} = ${money(interest)}`,
        `Effective cycle rate = ${fmt(apr)}% × ${cycle} ÷ 365 = ${fmt(rate * 100, 3)}%`,
      ],
    };
  },
  content: {
    formula: [
      'Average daily balance (ADB) = sum of (balance × days at that balance) ÷ days in cycle',
      'Daily rate = APR ÷ 365',
      'Interest = ADB × daily rate × days in cycle',
      'Effective cycle rate = interest ÷ ADB = APR × cycle days ÷ 365',
    ],
    body: [
      'Most credit cards charge interest on your average daily balance. Instead of using one snapshot, the issuer adds up your balance for every day of the billing cycle and divides by the number of days. A large purchase early in the cycle raises the average more than the same purchase near the end, and a payment early in the cycle lowers it more.',
      'Example: you carry $1,000 for 10 days, then $1,500 for 20 days in a 30-day cycle at 24% APR. The sum is 1,000 × 10 + 1,500 × 20 = 40,000. Divided by 30 that is an ADB of $1,333.33. Interest is 1,333.33 × 24% ÷ 365 × 30 = $26.30, an effective cycle rate of 1.973%.',
      'Enter each balance and the number of days it lasted. The days should add up to the cycle length. If they do not, the calculator still divides by the cycle days and shows a warning, so uncovered days count as a zero balance. This calculator uses simple interest on the ADB with a 365-day year. Some issuers use 360 days or compound daily, so your statement can differ by a small amount. Everything runs in your browser and nothing is saved.',
    ],
    faq: [
      { q: 'What is an average daily balance?', a: 'It is your balance on each day of the billing cycle added together and divided by the days in the cycle. With $1,000 for 10 days and $1,500 for 20 days in a 30-day cycle, it is $1,333.33.' },
      { q: 'How is the daily interest rate worked out?', a: 'This calculator divides the APR by 365. A 24% APR gives a daily rate of about 0.0658%. Some issuers divide by 360 instead, which makes interest slightly higher.' },
      { q: 'Why does my statement differ from this result?', a: 'This calculator uses simple interest on the ADB. Many issuers compound daily, add new purchases at different times or use a 360-day year, so the statement can differ slightly.' },
      { q: 'What if my days do not add up to the cycle?', a: 'The result still divides by the cycle days and shows a warning. Days you leave out count as a zero balance, which lowers the ADB.' },
      { q: 'How can I lower the interest?', a: 'Pay earlier in the cycle, because each day at a lower balance reduces the average. Paying $500 at day 10 instead of day 25 on a 24% APR card cuts interest by about $4.93 for the cycle.' },
    ],
    sources: [
      { label: 'CFPB: Credit card tools and guidance', url: 'https://www.consumerfinance.gov/consumer-tools/credit-cards/' },
    ],
  },
  related: ['credit-card-payoff', 'late-payment-cost', 'minimum-payment-trap'],
  examples: [
    // sum = 1000*10 + 1500*20 = 40000; ADB = 40000/30 = 1333.3333; interest = 40000*.24/365 = 26.3014; rate = .24*30/365 = .019726
    { values: { apr: 24, cycle: 30, b1: 1000, d1: 10, b2: 1500, d2: 20 }, expect: { adb: 1333.33, interest: 26.3, rate: 0.019726 }, tolerance: 0.001 },
    // single balance: ADB 2000; interest = 2000*.18/365*30 = 29.5890; rate = .18*30/365 = .014795
    { values: { apr: 18, cycle: 30, b1: 2000, d1: 30 }, expect: { adb: 2000, interest: 29.59, rate: 0.014795 }, tolerance: 0.001 },
    // days short of cycle (25 of 30): sum = 500*5 + 800*20 = 18500; ADB = 616.6667; interest = 18500*.12/365 = 6.0822
    { values: { apr: 12, cycle: 30, b1: 500, d1: 5, b2: 800, d2: 20 }, expect: { adb: 616.67, interest: 6.08 }, tolerance: 0.01 },
  ],
});
