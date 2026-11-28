import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';

const usd = (n: number) => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const p1 = (f: number) => `${+(f * 100).toFixed(1)}%`;

export default defineCalculator({
  slug: 'margin-loan-cost',
  title: 'Margin Loan Cost and Margin Call Drop',
  category: 'finance',
  description: 'See what a margin loan costs in interest, your leverage, and how far your portfolio can fall before a margin call, plus the equity return if prices move.',
  keywords: ['margin loan calculator', 'margin interest calculator', 'margin call calculator', 'maintenance margin calculator', 'margin leverage drop to margin call'],
  updated: '2026-11-28',
  inputs: [
    { id: 'equity', label: 'Your own equity', type: 'number', prefix: '$', default: 30000, min: 0, step: 1000, info: 'Cash or securities you own outright, before borrowing.' },
    { id: 'loan', label: 'Amount borrowed on margin', type: 'number', prefix: '$', default: 20000, min: 0, step: 1000, info: 'The margin loan balance.' },
    { id: 'rate', label: 'Margin interest rate', type: 'number', suffix: '% per year', default: 9, min: 0, step: 0.25, info: 'Annual rate your broker charges on the loan.' },
    { id: 'months', label: 'Months held', type: 'number', default: 12, min: 0, step: 1, info: 'How long the loan stays open.' },
    { id: 'maint', label: 'Maintenance requirement', type: 'number', suffix: '%', default: 25, min: 0, max: 100, step: 1, info: 'Minimum equity as a share of portfolio value. 25% is the regulatory minimum; brokers often set higher.' },
    { id: 'move', label: 'What-if portfolio move', type: 'number', suffix: '%', default: -20, step: 1, optional: true, info: 'Leave blank to skip. Enter a gain or loss in the whole portfolio, for example -20.' },
  ],
  outputs: [
    { id: 'drop', label: 'Drop that triggers a margin call', format: 'percent', precision: 1, primary: true, info: '1 - margin call value ÷ portfolio value. Gaps and fast moves can force sales earlier.' },
    { id: 'interest', label: 'Interest cost', format: 'currency', info: 'Loan x rate x months ÷ 12, simple interest.' },
    { id: 'value', label: 'Portfolio value', format: 'currency', info: 'Equity plus loan.' },
    { id: 'leverage', label: 'Leverage', format: 'number', precision: 2, suffix: 'x', info: 'Portfolio value ÷ equity.' },
    { id: 'interestPct', label: 'Interest as share of portfolio', format: 'percent', precision: 1, info: 'Interest ÷ portfolio value: the hurdle the portfolio must beat.' },
    { id: 'callValue', label: 'Portfolio value at margin call', format: 'currency', info: 'Loan ÷ (1 - maintenance requirement).' },
    { id: 'eqReturn', label: 'Return on your equity (what-if)', format: 'percent', precision: 1, info: '(value x move - interest) ÷ equity.' },
  ],
  compute: (v) => {
    const eq = num(v.equity), loan = num(v.loan), rate = num(v.rate), mo = num(v.months), m = num(v.maint), g = num(v.move);
    if (eq === null || loan === null || rate === null || mo === null || m === null) return { drop: null };
    if (eq <= 0 || loan <= 0) return { drop: null, error: 'Equity and amount borrowed must be above 0.' };
    if (rate < 0 || mo < 0) return { drop: null, error: 'Rate and months cannot be negative.' };
    if (m < 0 || m >= 100) return { drop: null, error: 'Maintenance requirement must be at least 0 and below 100.' };
    const value = eq + loan;
    const interest = (loan * (rate / 100) * mo) / 12;
    const leverage = value / eq;
    const interestPct = interest / value;
    const callValue = loan / (1 - m / 100);
    const drop = 1 - callValue / value;
    const out: Record<string, any> = { drop, interest, value, leverage, interestPct, callValue };
    const steps = [
      `Portfolio value = ${usd(eq)} + ${usd(loan)} = ${usd(value)}; leverage = ${leverage.toFixed(2)}x`,
      `Interest = ${usd(loan)} x ${rate}% x ${mo} ÷ 12 = ${usd(interest)} (${p1(interestPct)} of the portfolio)`,
      `Margin call value = ${usd(loan)} ÷ (1 - ${m}%) = ${usd(callValue)}`,
      drop > 0
        ? `Drop to margin call = 1 - ${usd(callValue)} ÷ ${usd(value)} = ${p1(drop)}`
        : 'The portfolio is already at or below the margin call value: a call is due now.',
    ];
    if (g !== null) {
      const r = (value * (g / 100) - interest) / eq;
      out.eqReturn = r;
      steps.push(`If the portfolio moves ${g}%: (${usd(value * (g / 100))} - ${usd(interest)}) ÷ ${usd(eq)} = ${p1(r)} on your equity`);
    }
    return {
      ...out,
      tone: drop <= 0 ? 'bad' : drop < 0.25 ? 'warn' : 'ok',
      badge: drop <= 0 ? 'Margin call now' : `Call at -${p1(drop)}`,
      chart: {
        type: 'bar',
        title: 'Portfolio value',
        categories: ['Today', 'Margin call value'],
        series: [{ name: 'Value', values: [value, callValue] }],
        format: { format: 'currency' },
        highlight: 1,
      },
      steps,
      note: 'Education, not advice. Gaps and fast drops can force sales before the call value, and brokers can raise requirements at any time. The 25% figure is the regulatory minimum; confirm at finra.org and with your broker.',
    };
  },
  content: {
    formula: [
      'Portfolio value = equity + loan',
      'Interest = loan x annual rate x months ÷ 12 (simple, no compounding)',
      'Leverage = portfolio value ÷ equity',
      'Margin call value = loan ÷ (1 - maintenance requirement)',
      'Equity return = (portfolio value x move - interest) ÷ equity',
    ],
    body: [
      'A margin loan lets you buy more than your cash allows, with the portfolio as collateral. That magnifies gains and losses, and you pay interest whatever happens.',
      'Your broker requires equity to stay above a maintenance percentage of the portfolio. Below it, you get a margin call and may have to deposit cash or sell. This calculator finds the portfolio value where that happens and how far prices can fall to reach it.',
      'Real brokers can sell without notice, use different requirements per security and change them quickly. Treat the drop shown as a best case, not a safe distance.',
    ],
    faq: [
      { q: 'What is the result in the example?', a: '$30,000 of equity plus $20,000 borrowed makes a $50,000 portfolio, 1.67x leverage. At 9% for 12 months the interest is $1,800, 3.6% of the portfolio. A 25% requirement means a call at $26,667, a drop of 46.7%.' },
      { q: 'What if prices rise 10%?', a: 'The portfolio gains $5,000. After $1,800 of interest your $30,000 earns $3,200, a 10.7% return.' },
      { q: 'What if prices fall 20%?', a: 'The portfolio loses $10,000. With $1,800 of interest your equity falls $11,800, a return of -39.3%.' },
      { q: 'What if I borrow more?', a: 'A $40,000 loan on $30,000 equity makes a $70,000 portfolio. The call value is $53,333, so only a 23.8% drop triggers it. More leverage means less room.' },
    ],
    sources: [{ label: 'FINRA: Margin accounts', url: 'https://www.finra.org/' }],
  },
  related: ['portfolio-rebalance', 'loan-comparison'],
  examples: [
    // V = 50000; interest 20000*0.09*12/12 = 1800; leverage 50000/30000 = 1.6667; 1800/50000 = 0.036
    // call 20000/0.75 = 26666.67; drop 1 - 26666.67/50000 = 0.466667; g=-20%: (-10000-1800)/30000 = -0.393333
    { values: { equity: 30000, loan: 20000, rate: 9, months: 12, maint: 25, move: -20 }, expect: { value: 50000, interest: 1800, leverage: 1.6667, interestPct: 0.036, callValue: 26666.67, drop: 0.466667, eqReturn: -0.393333 }, tolerance: 0.01 },
    // g=+10%: (5000-1800)/30000 = 0.106667
    { values: { equity: 30000, loan: 20000, rate: 9, months: 12, maint: 25, move: 10 }, expect: { eqReturn: 0.106667 }, tolerance: 0.01 },
    // loan 40000: V 70000; call 40000/0.75 = 53333.33; drop 1 - 53333.33/70000 = 0.238095
    { values: { equity: 30000, loan: 40000, rate: 9, months: 12, maint: 25, move: 0 }, expect: { value: 70000, callValue: 53333.33, drop: 0.238095 }, tolerance: 0.01 },
  ],
});
