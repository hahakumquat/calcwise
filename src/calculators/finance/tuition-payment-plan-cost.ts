import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'tuition-payment-plan-cost',
  title: 'Tuition Payment Plan Fee vs Paying in Full',
  category: 'finance',
  description: 'Is a tuition payment plan worth the enrollment fee? See the fee as an effective APR on the money you defer, and what the delay is worth to you.',
  keywords: ['tuition payment plan', 'tuition payment plan fee', 'is a payment plan worth it', 'pay tuition in installments', 'tuition installment plan cost', 'effective APR of a payment plan'],
  inputs: [
    { id: 'bill', label: 'Total tuition bill', type: 'number', prefix: '$', default: 6000, min: 0, step: 100, info: 'The amount you would pay if you settled the whole bill today.' },
    { id: 'enrollFee', label: 'Enrollment fee for the plan', type: 'number', prefix: '$', default: 50, min: 0, step: 5, info: 'The one-time fee to join the plan. It is paid up front and is not part of the tuition.' },
    { id: 'n', label: 'Number of instalments', type: 'number', suffix: 'payments', default: 5, min: 1, max: 36, step: 1, info: 'Equal monthly payments. The first is due one month from now, the last at the end of month n.' },
    { id: 'rate', label: 'Annual rate you would otherwise earn or pay', type: 'number', suffix: '%', default: 4, min: 0, max: 40, step: 0.1, info: 'What the money would earn in savings, or cost you on a card or loan if you paid in full. Use 0 to see the fee alone.' },
  ],
  outputs: [
    { id: 'netCost', label: 'Net cost of the plan', format: 'currency', primary: true, info: 'Fee minus the value of the deferral. Negative means the plan comes out ahead of paying in full at your rate.' },
    { id: 'fee', label: 'Total cost of the plan (the fee)', format: 'currency', info: 'The enrollment fee. Tuition itself is the same either way.' },
    { id: 'apr', label: 'Fee as an effective APR', format: 'percent', precision: 2, info: 'Fee divided by the average balance you owe, over the plan length in years. Compare it with the rate in the box above.' },
    { id: 'deferral', label: 'Value of the deferral at your rate', format: 'currency', info: 'Simple interest on the balance still unpaid each month, at your annual rate divided by 12.' },
    { id: 'instalment', label: 'Each instalment', format: 'currency', info: 'Tuition bill divided by the number of instalments.' },
    { id: 'feePer', label: 'Fee per instalment', format: 'currency', info: 'Fee divided by the number of instalments.' },
  ],
  compute: (v) => {
    const T = num(v.bill);
    const F = num(v.enrollFee);
    const nn = num(v.n);
    const r = num(v.rate);
    if (T === null || F === null || nn === null || r === null) return { netCost: null };
    if (T <= 0 || F < 0 || nn < 1 || r < 0) return { netCost: null };
    const n = Math.round(nn);
    const rate = r / 100;
    // Balance owed during month j (j = 1..n) is T x (1 - (j-1)/n), because payments land at the end of each month.
    // Average of those n balances = T x (n + 1) / (2n).
    const avg = (T * (n + 1)) / (2 * n);
    const years = n / 12;
    const apr = F / (avg * years);
    const deferral = (avg * n * rate) / 12;
    const net = F - deferral;
    const inst = T / n;
    const win = net < -0.005;
    const lose = net > 0.005;
    const xs = Array.from({ length: n + 1 }, (_, k) => k);
    return {
      netCost: net,
      fee: F,
      apr,
      deferral,
      instalment: inst,
      feePer: F / n,
      tone: win ? 'good' : lose ? 'warn' : 'ok',
      badge: win ? 'Plan comes out ahead' : lose ? 'Paying in full is cheaper' : 'Break-even',
      chart: {
        type: 'line',
        title: 'Tuition still owed, by month',
        x: xs,
        xLabel: 'Months from now',
        xFormat: { format: 'integer' },
        yFormat: { format: 'currency', precision: 0 },
        series: [{ name: 'Balance still owed', values: xs.map((k) => T * (1 - k / n)) }],
      },
      steps: [
        `Instalment = ${money(T)} ÷ ${n} = ${money(inst)}, paid at the end of each month`,
        `Average balance owed = ${money(T)} × (${n} + 1) ÷ (2 × ${n}) = ${money(avg)}`,
        `Fee as APR = ${money(F)} ÷ (${money(avg)} × ${n} ÷ 12) = ${pct(apr, 2)}`,
        `Value of deferral = ${money(avg)} × ${n} × ${pct(rate, 2)} ÷ 12 = ${money(deferral)}`,
        `Net cost = ${money(F)} − ${money(deferral)} = ${money(net)}`,
      ],
      note: 'Average-balance method: the fee is divided by the average amount you owe, times the plan length in years. Simple interest, no tax, and no late fees or per-payment charges.',
    };
  },
  content: {
    formula: [
      'Instalment = tuition bill ÷ n',
      'Average balance owed = bill × (n + 1) ÷ (2n)  (payments at the end of each month)',
      'Fee as APR = fee ÷ (average balance × n ÷ 12)',
      'Value of deferral = average balance × n × annual rate ÷ 12',
      'Net cost = fee − value of deferral',
    ],
    body: [
      'A tuition payment plan lets you spread a bill over several months instead of paying it all at once. Schools usually charge a flat enrollment fee rather than interest, which makes the cost hard to compare with a loan or a credit card. This calculator turns that fee into an effective APR so you can judge it against the rate you could earn or pay elsewhere.',
      'The method is average balance outstanding. With equal payments at the end of each month, you owe the full bill in month 1, a bit less in month 2, and so on down to one instalment in the last month. The average of those balances is bill × (n + 1) ÷ (2n). The fee divided by that average, scaled to a year, is the effective APR.',
      'The deferral has a value too. Money you keep for a few more months can earn interest in savings, or avoid interest on a card or loan. At your chosen rate, that value is average balance × n × rate ÷ 12. If it is bigger than the fee, the plan beats paying in full. If it is smaller, paying in full is cheaper. At a rate of 0 the plan simply costs the fee.',
      'Short plans make a flat fee look expensive as an APR, and long plans make it look cheap. A $50 fee on a two-payment plan costs far more per dollar deferred than on a ten-payment plan. Check your school\'s terms for late fees, a down payment due at enrollment, or rules that block registration if a payment is missed, none of which are modelled here.',
    ],
    faq: [
      { q: 'How is the effective APR worked out?', a: 'Fee ÷ (average balance × n ÷ 12). With the defaults, $6,000 over 5 payments has an average balance of $3,600, so $50 ÷ ($3,600 × 5 ÷ 12) = 3.33%.' },
      { q: 'Why is the average balance only $3,600 on a $6,000 bill?', a: 'Because you pay it down each month. You owe $6,000, $4,800, $3,600, $2,400 and $1,200 in months 1 to 5, and their average is $3,600, which equals $6,000 × 6 ÷ 10.' },
      { q: 'What does the value of the deferral mean?', a: 'It is the interest your money could earn, or avoid paying, by holding it longer. With the defaults at 4%, it is $3,600 × 5 × 4% ÷ 12 = $60, which is more than the $50 fee, so the plan nets $10 ahead.' },
      { q: 'What rate should I enter?', a: 'If you would otherwise pay from savings, use your savings APY. If you would put the bill on a card or take a loan, use that APR. Use 0 to see the plan cost as just the fee.' },
      { q: 'Does this include late fees or a down payment?', a: 'No. It models one up-front fee and equal payments at the end of each month. If your plan requires a first payment at enrollment, the average balance is lower and the effective APR is higher than shown.' },
    ],
    sources: [
      { label: 'Federal Student Aid: Types of aid and paying for college', url: 'https://studentaid.gov/understand-aid' },
      { label: 'CFPB: Paying for college', url: 'https://www.consumerfinance.gov/paying-for-college/' },
    ],
  },
  related: ['college-net-price', 'bnpl-true-cost', 'annual-vs-monthly-plan', 'student-loan-payoff'],
  examples: [
    // Defaults: avg = 6000 x 6 / 10 = 3600 (balances 6000,4800,3600,2400,1200 sum 18000 / 5 = 3600).
    // APR = 50 / (3600 x 5/12) = 50 / 1500 = 0.033333. Deferral = 3600 x 5 x 0.04 / 12 = 60. Net = 50 - 60 = -10. Instalment 1200, fee each 10.
    { values: { bill: 6000, enrollFee: 50, n: 5, rate: 4 }, expect: { netCost: -10, fee: 50, apr: 0.03333333333333333, deferral: 60, instalment: 1200, feePer: 10 } },
    // 3000, fee 40, n 4, rate 0: balances 3000,2250,1500,750 sum 7500 / 4 = 1875 (= 3000 x 5 / 8).
    // APR = 40 / (1875 x 4/12) = 40 / 625 = 0.064. Deferral 0. Net 40. Instalment 750, fee each 10.
    { values: { bill: 3000, enrollFee: 40, n: 4, rate: 0 }, expect: { netCost: 40, apr: 0.064, deferral: 0, instalment: 750, feePer: 10 } },
    // 10000, fee 75, n 10, rate 5: avg = 10000 x 11 / 20 = 5500. APR = 75 / (5500 x 10/12) = 75 / 4583.33 = 0.0163636.
    // Deferral = 5500 x 10 x 0.05 / 12 = 229.1667. Net = 75 - 229.1667 = -154.1667.
    { values: { bill: 10000, enrollFee: 75, n: 10, rate: 5 }, expect: { netCost: -154.16666666666666, apr: 0.016363636363636365, deferral: 229.16666666666666 } },
  ],
});
