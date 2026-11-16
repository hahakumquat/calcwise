import { defineCalculator, type ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, sampleIdx } from '../../lib/helpers/finance';

const MAX_MONTHS = 1200;
const SLOTS = [1, 2, 3, 4];

interface Debt {
  name: string;
  balance: number;
  rate: number; // monthly
  apr: number;
  min: number;
}

/**
 * Month-by-month payoff. Each month: interest accrues on every open debt, every
 * minimum is paid (capped at the balance), then whatever is left of the fixed
 * budget (extra + all minimums, including those freed by paid-off debts) goes to
 * the target debt, spilling to the next one in priority order.
 */
function simulate(debts: Debt[], extra: number, order: number[]) {
  const b = debts.map((d) => d.balance);
  const budget = debts.reduce((s, d) => s + d.min, 0) + extra;
  const totals = [b.reduce((s, x) => s + x, 0)];
  const paidOff: number[] = [];
  let months = 0;
  let interest = 0;
  while (totals[totals.length - 1] > 1e-9 && months < MAX_MONTHS) {
    debts.forEach((d, i) => {
      if (b[i] > 1e-9) {
        const it = b[i] * d.rate;
        interest += it;
        b[i] += it;
      }
    });
    let pool = budget;
    debts.forEach((d, i) => {
      if (b[i] > 1e-9) {
        const p = Math.min(d.min, b[i]);
        b[i] -= p;
        pool -= p;
      }
    });
    for (const i of order) {
      if (pool <= 1e-12) break;
      if (b[i] > 1e-9) {
        const p = Math.min(pool, b[i]);
        b[i] -= p;
        pool -= p;
      }
    }
    months++;
    totals.push(b.reduce((s, x) => s + x, 0));
    order.forEach((i) => {
      if (b[i] <= 1e-9 && !paidOff.includes(i)) paidOff.push(i);
    });
    // Order of payoff for debts that finish in the same month follows priority order.
  }
  return { months, interest, totals, paidOff, done: totals[totals.length - 1] <= 1e-9 };
}

const duration = (m: number) => {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  return [y ? `${y} yr` : '', mo ? `${mo} mo` : ''].filter(Boolean).join(' ') || '0 mo';
};

const debtInputs = SLOTS.flatMap((n) => {
  const optional = n > 2;
  const d = [
    { bal: 4000, apr: 24.99, min: 100 },
    { bal: 1500, apr: 19.99, min: 45 },
    { bal: 6000, apr: 7, min: 150 },
  ][n - 1];
  const tail = optional ? ' Leave blank if you have fewer debts.' : '';
  return [
    { id: `b${n}`, label: `Debt ${n} balance`, type: 'number' as const, prefix: '$', min: 0, optional, ...(d && n <= 3 ? { default: d.bal } : {}), info: `What you owe on debt ${n} today (card, personal loan, car loan, etc.).${tail}` },
    { id: `r${n}`, label: `Debt ${n} APR`, type: 'number' as const, suffix: '%', min: 0, step: 0.01, optional, ...(d && n <= 3 ? { default: d.apr } : {}), info: `Annual interest rate on debt ${n}, from your statement.` },
    { id: `m${n}`, label: `Debt ${n} minimum payment`, type: 'number' as const, prefix: '$', min: 0, optional, ...(d && n <= 3 ? { default: d.min } : {}), info: `The smallest monthly payment debt ${n} requires, from your statement.` },
  ];
});

export default defineCalculator({
  slug: 'debt-payoff-planner',
  title: 'Debt Payoff Planner: Snowball vs Avalanche',
  seoTitle: 'Debt Snowball vs Avalanche Calculator',
  category: 'finance',
  description: 'Compare the debt snowball and avalanche methods for up to four debts: see your debt-free date, total interest and how much the avalanche saves.',
  keywords: ['debt snowball', 'debt avalanche', 'debt payoff planner', 'snowball vs avalanche', 'pay off multiple debts', 'debt free date'],
  inputs: [
    ...debtInputs,
    { id: 'extra', label: 'Extra monthly payment', type: 'number', prefix: '$', default: 200, min: 0, info: 'Money on top of all your minimum payments that you can put toward debt every month. Zero is fine.' },
  ],
  outputs: [
    { id: 'months', label: 'Debt-free in (avalanche)', format: 'integer', suffix: 'months', primary: true, info: 'Months until every debt is at zero if you target the highest interest rate first.' },
    { id: 'duration', label: 'In years and months', format: 'text', info: 'The avalanche payoff time written as years and months.' },
    { id: 'avalancheInterest', label: 'Total interest (avalanche)', format: 'currency', info: 'All interest paid across every debt using the avalanche order.' },
    { id: 'snowballMonths', label: 'Debt-free in (snowball)', format: 'integer', suffix: 'months', info: 'Months until every debt is at zero if you target the smallest balance first.' },
    { id: 'snowballInterest', label: 'Total interest (snowball)', format: 'currency', info: 'All interest paid across every debt using the snowball order.' },
    { id: 'saved', label: 'Interest saved by avalanche', format: 'currency', info: 'Snowball interest minus avalanche interest. Near zero means the two methods are practically the same for your debts.' },
    { id: 'avalancheOrder', label: 'Avalanche payoff order', format: 'text', info: 'The order your debts reach zero when targeting the highest APR first.' },
    { id: 'snowballOrder', label: 'Snowball payoff order', format: 'text', info: 'The order your debts reach zero when targeting the smallest balance first.' },
  ],
  compute: (v) => {
    const none = { months: null };
    const extra = num(v.extra);
    if (extra === null || extra < 0) return { ...none, error: 'Enter your extra monthly payment (0 is fine).' };
    const debts: Debt[] = [];
    for (const n of SLOTS) {
      const bal = num(v[`b${n}`]);
      const apr = num(v[`r${n}`]);
      const min = num(v[`m${n}`]);
      if (n > 2 && (bal === null || bal === 0) && apr === null && min === null) continue;
      if (bal === null || bal < 0) return { ...none, error: `Enter the balance for debt ${n}.` };
      if (bal === 0) continue;
      if (apr === null || apr < 0) return { ...none, error: `Enter the APR for debt ${n} (0 if it has no interest).` };
      if (min === null || min <= 0) return { ...none, error: `Enter the minimum monthly payment for debt ${n}.` };
      debts.push({ name: `Debt ${n}`, balance: bal, apr, rate: apr / 1200, min });
    }
    if (!debts.length) return { ...none, error: 'Enter at least one debt with a balance above zero.' };

    const idx = debts.map((_, i) => i);
    const avalancheOrder = [...idx].sort((a, b) => debts[b].apr - debts[a].apr || debts[a].balance - debts[b].balance);
    const snowballOrder = [...idx].sort((a, b) => debts[a].balance - debts[b].balance || debts[b].apr - debts[a].apr);
    const budget = debts.reduce((s, d) => s + d.min, 0) + extra;
    const firstInterest = debts.reduce((s, d) => s + d.balance * d.rate, 0);
    if (budget <= firstInterest)
      return { ...none, error: `Your total payments of ${money(budget)} a month don't cover the ${money(firstInterest)} of monthly interest, so the balances would never go down. Raise a payment.` };

    const av = simulate(debts, extra, avalancheOrder);
    const sn = simulate(debts, extra, snowballOrder);
    if (!av.done || !sn.done) return { ...none, error: 'This plan would take more than 100 years to finish. Raise your payments.' };

    const saved = sn.interest - av.interest;
    const names = (o: number[]) => o.map((i) => debts[i].name).join(' → ');
    const maxM = Math.max(av.months, sn.months);
    const at = (t: number[], m: number) => (m < t.length ? t[m] : 0);
    const x = sampleIdx(maxM, 100);
    const chart: ChartSpec[] = [
      {
        type: 'line', title: 'Total debt over time', x, xLabel: 'Months', yFormat: CURRENCY,
        series: [
          { name: 'Avalanche', values: x.map((m) => at(av.totals, m)) },
          { name: 'Snowball', values: x.map((m) => at(sn.totals, m)) },
        ],
      },
      { type: 'bar', title: 'Total interest by method', categories: ['Avalanche', 'Snowball'], series: [{ name: 'Interest', values: [av.interest, sn.interest] }], format: CURRENCY },
    ];
    const tone = av.months <= 36 ? 'good' : av.months <= 60 ? 'ok' : av.months <= 120 ? 'warn' : 'bad';
    return {
      months: av.months,
      duration: duration(av.months),
      avalancheInterest: av.interest,
      snowballMonths: sn.months,
      snowballInterest: sn.interest,
      saved,
      avalancheOrder: names(av.paidOff),
      snowballOrder: names(sn.paidOff),
      chart,
      tone,
      badge: `Debt-free in ${duration(av.months)}`,
      steps: [
        `Total budget each month = all minimums + extra = ${money(budget)}`,
        `Each month: add interest (APR ÷ 12) to every debt, pay every minimum, then send the rest to the target debt`,
        `Avalanche targets the highest APR first; snowball targets the smallest balance first`,
        `When a debt hits zero, its payment rolls into the next target, so the monthly total never drops`,
      ],
      note: saved >= 1
        ? `The avalanche order saves ${money(saved)} of interest versus the snowball${sn.months > av.months ? ` and finishes ${sn.months - av.months} month${sn.months - av.months === 1 ? '' : 's'} sooner` : ''}.`
        : 'For these debts the two methods cost almost the same, so pick the one you will stick with.',
    };
  },
  content: {
    formula: [
      'Each month: balance ← balance × (1 + APR ÷ 12) − payment',
      'Budget = sum of all minimum payments + extra payment (stays the same every month)',
      'Avalanche: extra goes to the highest APR first. Snowball: extra goes to the smallest balance first.',
    ],
    body: [
      'When you owe money on several accounts, the order you attack them in changes how much interest you pay and how motivated you stay. Enter up to four debts with their balance, APR and minimum payment, add whatever extra you can afford each month, and this planner simulates both popular strategies side by side.',
      'Both methods start the same way: pay the minimum on every debt. The difference is where the extra money goes. The avalanche method sends it to the debt with the highest interest rate. The snowball method sends it to the debt with the smallest balance. When a debt is cleared, its minimum payment is added to the extra and rolled onto the next debt, so your total monthly payment never shrinks.',
      'The results assume a fixed APR, no new charges, and interest added once a month. Real statements use daily balances and can differ by a few dollars, but the comparison between methods holds.',
    ],
    sections: [
      {
        heading: 'Snowball vs avalanche: how they differ',
        paragraphs: [
          'The avalanche method is the mathematically cheapest order: every extra dollar goes where interest is most expensive, so total interest is as low as it can be for a given monthly budget. It can feel slow if your highest-rate debt is also your largest.',
          'The snowball method clears small balances first. You close accounts sooner, which gives quick wins and frees up minimum payments earlier. It usually costs a little more interest, and the gap is bigger when your large debts carry high rates.',
        ],
      },
      {
        heading: 'Which one should you choose?',
        paragraphs: [
          'Look at the "interest saved" result. If it is small, the methods are nearly equal and the one that keeps you motivated is the better choice. If it is large, the avalanche is worth the patience.',
          'The best plan is the one you finish. Research on debt repayment has found that people who see progress on individual accounts are more likely to keep paying, so a small extra cost for the snowball can be a fair trade if it keeps you going.',
        ],
      },
      {
        heading: 'Tips to get debt-free faster',
        paragraphs: [
          'Even a small extra payment shortens the timeline noticeably, because it is applied to principal and stops interest from compounding on that amount. Try changing the extra payment to see the effect.',
          'Ask lenders about lower rates, consider a 0% balance transfer only if the fee is lower than the interest you would save, and keep a small emergency fund so a surprise bill does not push you back onto a card. Avoid adding new charges while you pay down balances.',
        ],
      },
    ],
    faq: [
      { q: 'What is the difference between the debt snowball and avalanche?', a: 'The avalanche sends extra money to the debt with the highest APR first, which minimizes interest. The snowball sends it to the smallest balance first, which clears accounts sooner. In both, you pay the minimum on every other debt.' },
      { q: 'How much does the avalanche save in the default example?', a: 'With debts of $4,000 at 24.99% (minimum $100), $1,500 at 19.99% (minimum $45) and $6,000 at 7% (minimum $150) plus $200 extra a month, the avalanche finishes in 27 months with about $1,774 of interest. The snowball takes 28 months with about $1,868, so the avalanche saves about $94.' },
      { q: 'What if I only pay the minimums and nothing extra?', a: 'It takes longer and costs more. With the same three debts and $0 extra, you are debt-free in 57 months with about $5,243 of interest using the avalanche, because the minimums on cleared debts still roll forward. The snowball is nearly identical at about $5,244.' },
      { q: 'Can the two methods give the same result?', a: 'Yes. If your smallest debt also has the highest rate, or all rates are equal, both methods choose the same order and give identical results. With a 0% APR on every debt, for example, interest is zero either way.' },
      { q: 'Why does the planner say my payments are too low?', a: 'If your total monthly payments are not larger than the interest your debts generate in the first month, the balances never fall. Raise a minimum or add extra money. Cases that would take more than 100 years are also rejected.' },
      { q: 'Does this include new purchases, fees or changing rates?', a: 'No. It assumes a fixed APR on each debt, no new charges and no late fees. Variable-rate cards or promotional rates that expire will change your real timeline.' },
    ],
    sources: [
      { label: 'CFPB: Ask CFPB — how can I pay off my debt?', url: 'https://www.consumerfinance.gov/ask-cfpb/' },
      { label: 'CFPB: Debt collection and managing debt tools', url: 'https://www.consumerfinance.gov/consumer-tools/debt-collection/' },
    ],
  },
  related: ['credit-card-payoff', 'emergency-fund', 'loan', 'rent-affordability'],
  examples: [
    // Two debts: $1,000 at 24% (min $50) and $500 at 12% (min $25), $100 extra. Budget = $175/month.
    // Avalanche targets debt 1 (24%); snowball targets debt 2 ($500). Checked with an independent script.
    { values: { b1: 1000, r1: 24, m1: 50, b2: 500, r2: 12, m2: 25, b3: null, r3: null, m3: null, b4: null, r4: null, m4: null, extra: 100 }, expect: { months: 10, avalancheInterest: 121.14, snowballMonths: 10, snowballInterest: 147.21, saved: 26.07, avalancheOrder: 'Debt 1 → Debt 2', snowballOrder: 'Debt 2 → Debt 1' }, tolerance: 0.01 },
    // 0% APR: $1,300 total at $150/month = 8.67 -> 9 months, no interest. Equal rates tie-break on smaller balance.
    { values: { b1: 1000, r1: 0, m1: 100, b2: 300, r2: 0, m2: 50, b3: null, r3: null, m3: null, b4: null, r4: null, m4: null, extra: 0 }, expect: { months: 9, avalancheInterest: 0, snowballMonths: 9, saved: 0, avalancheOrder: 'Debt 2 → Debt 1' } },
    // Three debts (the defaults). Verified with an independent script.
    { values: { b1: 4000, r1: 24.99, m1: 100, b2: 1500, r2: 19.99, m2: 45, b3: 6000, r3: 7, m3: 150, b4: null, r4: null, m4: null, extra: 200 }, expect: { months: 27, avalancheInterest: 1773.5, snowballMonths: 28, snowballInterest: 1867.57 }, tolerance: 0.01 },
    { values: { b1: 4000, r1: 24.99, m1: 100, b2: 1500, r2: 19.99, m2: 45, b3: 6000, r3: 7, m3: 150, b4: null, r4: null, m4: null, extra: 0 }, expect: { months: 57, avalancheInterest: 5242.95, snowballInterest: 5243.88 }, tolerance: 0.01 },
  ],
});
