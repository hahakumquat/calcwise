import { defineCalculator } from '../../lib/types';
import type { ChartSpec } from '../../lib/types';
import { num } from '../../lib/math';
import { money, CURRENCY } from '../../lib/helpers/finance';

interface Run {
  netWorth: number;
  debtLeft: number;
  /** Net worth (investments minus debt) at each month 0..months. */
  series: number[];
}

/**
 * Month by month: interest accrues on the debt, then the payment goes to the debt
 * (capped at what is owed). Whatever part of the monthly budget (minimum + extra)
 * is not needed for the debt is invested at month end. When `payExtra` is false only the
 * minimum goes to the debt and the extra is invested.
 */
function simulate(debt: number, aprPct: number, minPay: number, extra: number, retPct: number, months: number, payExtra: boolean): Run {
  const r = aprPct / 1200;
  const i = retPct / 1200;
  const budget = minPay + extra;
  let d = debt;
  let inv = 0;
  const series = [-debt];
  for (let m = 1; m <= months; m++) {
    let paid = 0;
    if (d > 0) {
      d += d * r;
      paid = Math.min(payExtra ? budget : minPay, d);
      d -= paid;
      if (d < 1e-9) d = 0;
    }
    inv = inv * (1 + i) + (budget - paid);
    series.push(inv - d);
  }
  return { netWorth: inv - d, debtLeft: d, series };
}

/** Months to clear the debt paying `pay` a month, and the interest paid along the way (the whole life of the debt). */
function payoff(debt: number, aprPct: number, pay: number): { months: number; interest: number } {
  const r = aprPct / 1200;
  let d = debt;
  let interest = 0;
  let m = 0;
  while (d > 1e-9 && m < 1200) {
    m++;
    const it = d * r;
    interest += it;
    d += it;
    d -= Math.min(pay, d);
  }
  return { months: m, interest };
}

const when = (m: number) => {
  const y = Math.floor(m / 12);
  const mo = m % 12;
  return `Month ${m} (${y ? `${y} yr ` : ''}${mo ? `${mo} mo` : ''}`.trim() + ')';
};

export default defineCalculator({
  slug: 'debt-vs-invest',
  title: 'Pay Off Debt or Invest Calculator',
  category: 'finance',
  description: 'Extra money each month: pay down debt or invest it? Compare net worth after your chosen years, interest saved and the break-even return rate.',
  keywords: ['pay off debt or invest', 'debt vs invest calculator', 'should I pay off debt or invest', 'extra payment vs investing', 'debt payoff vs stock market', 'break-even return'],
  updated: '2026-11-22',
  popular: false,
  inputs: [
    { id: 'extra', label: 'Extra money per month', type: 'number', prefix: '$', default: 500, min: 0, step: 50, info: 'What you can spare on top of the minimum payment, every month.' },
    { id: 'years', label: 'Time horizon', type: 'number', suffix: 'years', default: 5, min: 1, max: 40, step: 1, info: 'Both strategies are compared at the end of this many years.' },
    { id: 'balance', label: 'Debt balance', type: 'number', prefix: '$', default: 15000, min: 0, step: 500, info: 'What you owe today.' },
    { id: 'apr', label: 'Debt interest rate (APR)', type: 'number', suffix: '%', default: 8, min: 0, max: 40, step: 0.25, info: 'The yearly rate on the debt, charged monthly. Paying the debt down earns you exactly this, with no risk.' },
    { id: 'minPay', label: 'Minimum monthly payment', type: 'number', prefix: '$', default: 300, min: 0, step: 25, info: 'The required payment. It must be larger than the first month\'s interest.' },
    { id: 'ret', label: 'Expected investment return', type: 'number', suffix: '%', default: 7, min: -10, max: 30, step: 0.5, info: 'An assumption, not a promise. Real returns change every year and can be negative. Compounded monthly.' },
  ],
  outputs: [
    { id: 'diff', label: 'Pay debt first vs invest: difference', format: 'currency', primary: true, info: 'Net worth of paying the debt first minus net worth of paying only the minimum and investing. Positive means paying the debt first wins.' },
    { id: 'winner', label: 'Winner', format: 'text', info: 'Which strategy ends with the higher net worth at the end of your horizon.' },
    { id: 'nwA', label: 'Net worth: pay debt first', format: 'currency', info: 'Investments minus any debt left, when all extra money goes to the debt first and the freed-up payment is then invested.' },
    { id: 'nwB', label: 'Net worth: minimum + invest', format: 'currency', info: 'Investments minus any debt left, when you pay only the minimum and invest the extra from day one.' },
    { id: 'interestA', label: 'Total interest: pay debt first', format: 'currency', info: 'All interest paid until the debt is gone, even if that is after your horizon.' },
    { id: 'interestB', label: 'Total interest: minimum + invest', format: 'currency', info: 'All interest paid until the debt is gone, even if that is after your horizon.' },
    { id: 'freeA', label: 'Debt-free: pay debt first', format: 'text', info: 'The month the last payment is made.' },
    { id: 'freeB', label: 'Debt-free: minimum + invest', format: 'text', info: 'The month the last payment is made. It can fall after your horizon.' },
    { id: 'breakEven', label: 'Break-even return', format: 'percent', precision: 2, info: 'The yearly investment return at which both strategies end with the same net worth, found by bisection. It equals the debt APR, because paying debt is a guaranteed return of that rate.' },
  ],
  compute: (v) => {
    const extra = num(v.extra) ?? 0;
    const yearsIn = num(v.years);
    const balance = num(v.balance);
    const apr = num(v.apr);
    const minPay = num(v.minPay);
    const ret = num(v.ret);
    if (yearsIn === null || balance === null || apr === null || minPay === null || ret === null) return { diff: null };
    if (extra < 0 || balance < 0 || apr < 0 || minPay < 0) return { diff: null, error: 'Amounts and rates cannot be negative.' };
    if (balance === 0) return { diff: null, error: 'Enter a debt balance above zero.' };
    if (yearsIn < 1) return { diff: null, error: 'Enter at least 1 year.' };
    if (ret <= -100) return { diff: null, error: 'The return must be above -100%.' };
    if (minPay <= (balance * apr) / 1200) return { diff: null, error: 'The minimum payment must be larger than the first month\'s interest, or the debt never shrinks.' };
    if (extra === 0) return { diff: null, error: 'Enter an extra monthly amount above zero.' };
    const years = Math.round(yearsIn);
    const months = years * 12;

    const A = simulate(balance, apr, minPay, extra, ret, months, true);
    const B = simulate(balance, apr, minPay, extra, ret, months, false);
    const pa = payoff(balance, apr, minPay + extra);
    const pb = payoff(balance, apr, minPay);
    const diff = A.netWorth - B.netWorth;

    // Break-even return: the investment return at which diff = 0 (diff falls as the return rises).
    let lo = -50;
    let hi = 100;
    for (let k = 0; k < 60; k++) {
      const mid = (lo + hi) / 2;
      const g = simulate(balance, apr, minPay, extra, mid, months, true).netWorth - simulate(balance, apr, minPay, extra, mid, months, false).netWorth;
      if (g > 0) lo = mid;
      else hi = mid;
    }
    const breakEven = (lo + hi) / 2;

    const x: number[] = [];
    const sa: number[] = [];
    const sb: number[] = [];
    for (let y = 0; y <= years; y++) {
      x.push(y);
      sa.push(A.series[y * 12]);
      sb.push(B.series[y * 12]);
    }
    const chart: ChartSpec = {
      type: 'line',
      title: 'Net worth over time (investments minus debt)',
      x,
      xLabel: 'Years',
      xFormat: { format: 'integer' },
      yFormat: CURRENCY,
      series: [
        { name: 'Pay debt first', values: sa },
        { name: 'Minimum + invest', values: sb },
      ],
    };

    const tie = Math.abs(diff) < 0.5;
    const winner = tie ? 'Tie' : diff > 0 ? 'Pay debt first' : 'Minimum + invest';
    return {
      diff,
      winner,
      nwA: A.netWorth,
      nwB: B.netWorth,
      interestA: pa.interest,
      interestB: pb.interest,
      freeA: when(pa.months),
      freeB: when(pb.months),
      breakEven: breakEven / 100,
      tone: tie ? 'ok' : diff > 0 ? 'good' : 'warn',
      badge: tie ? 'Dead heat' : diff > 0 ? 'Paying debt first wins' : 'Investing wins on paper',
      chart,
      steps: [
        `Monthly budget = ${money(minPay)} minimum + ${money(extra)} extra = ${money(minPay + extra)}`,
        `Pay debt first: all of it goes to the ${money(balance, 0)} debt at ${apr}% until it is gone (${when(pa.months)}), then the whole ${money(minPay + extra)} is invested at ${ret}%`,
        `Minimum + invest: ${money(minPay)} goes to the debt (gone in ${when(pb.months)}), ${money(extra)} is invested every month at ${ret}%`,
        `After ${years} years: ${money(A.netWorth, 0)} vs ${money(B.netWorth, 0)} (investments minus any debt left), a difference of ${money(Math.abs(diff), 0)}`,
      ],
      note: tie
        ? 'Both strategies end level. Paying debt is a guaranteed return equal to the APR, so at this return it is a coin toss on paper.'
        : `${diff > 0 ? 'Paying the debt first' : 'Investing'} comes out ${money(Math.abs(diff), 0)} ahead after ${years} years if returns are exactly ${ret}% every year. Paying debt earns a guaranteed ${apr}%; the market return is not guaranteed. Taxes, fees and risk are ignored.`,
    };
  },
  content: {
    formula: [
      'Each month the debt grows by APR ÷ 12, then your payment is subtracted; investments grow by return ÷ 12, then new money is added',
      'Pay debt first: minimum + extra goes to the debt; once it is cleared, that whole amount is invested',
      'Minimum + invest: only the minimum goes to the debt, the extra is invested, and the freed minimum is invested once the debt is gone',
      'Net worth = investments − remaining debt; break-even return is found by bisection and equals the APR',
    ],
    body: [
      'Paying off debt is a guaranteed return equal to the interest rate. Clearing an 8% loan is like earning 8% a year with no risk. Investing might earn more, or less, and nothing guarantees it. So the question comes down to whether you expect your investments to beat the interest rate by enough to justify the risk.',
      'With a $15,000 debt at 8%, a $300 minimum payment and $500 extra a month for 5 years, paying the debt first clears it in month 21 and ends with about $35,827. Paying only the minimum and investing the $500 at 7% ends with about $35,492 and still owes about $305. Paying debt first wins by about $335, and saves about $2,229 in interest.',
      'This is a simplified comparison. It assumes a constant return, ignores taxes, fees and inflation, and it does not account for tax-deductible interest or an employer match, which can change the answer. Keep an emergency fund either way, and if your employer matches contributions, that match is usually worth taking first.',
    ],
    faq: [
      { q: 'Should I pay off debt or invest?', a: 'Compare the debt\'s APR with the return you can realistically expect. Paying debt earns the APR for certain. With an 8% debt and a 7% assumed return, paying the debt first ends about $335 ahead after 5 years, and it carries no market risk.' },
      { q: 'What is the break-even return?', a: 'It is the investment return at which both strategies end equal. It matches the debt\'s APR (8% here). Above it, investing wins on paper; below it, paying the debt wins. Because returns are uncertain, the debt payoff is the safer side of that bet.' },
      { q: 'How much interest does paying the debt first save?', a: 'With the default numbers, paying $800 a month clears the debt in 21 months and costs about $1,077 in interest. Paying only $300 a month takes 62 months and costs about $3,307, a saving of about $2,229.' },
      { q: 'Are the investment returns guaranteed?', a: 'No. The 7% default is an assumption, not a promise. Real markets go up and down, and the return can be negative in any year. This calculator uses a constant rate so the two strategies can be compared simply.' },
      { q: 'What does this leave out?', a: 'Taxes, investment fees, inflation, tax-deductible interest (such as some student loan interest), employer matches and the value of an emergency fund. Check these before you decide.' },
    ],
    sources: [
      { label: 'Consumer Financial Protection Bureau: managing debt', url: 'https://www.consumerfinance.gov/consumer-tools/debt-collection/' },
      { label: 'Investor.gov (SEC): compound interest and investing basics', url: 'https://www.investor.gov/introduction-investing' },
    ],
  },
  related: ['debt-payoff-planner', 'windfall-split', 'extra-mortgage-payment', 'compound-interest', 'credit-card-payoff', 'investment', 'emergency-fund'],
  examples: [
    // Defaults, month-by-month script. A: debt cleared month 21 (interest 1,077.35), then invests 800/mo; net worth 35,827.05.
    // B: pays 300 (cleared month 62, interest 3,306.70), invests 500/mo at 7%; at month 60 owes 304.63 and holds 35,796.45; net worth 35,491.82. Diff 335.23.
    { values: { extra: 500, years: 5, balance: 15000, apr: 8, minPay: 300, ret: 7 }, expect: { nwA: 35827.05, nwB: 35491.82, diff: 335.23, interestA: 1077.35, interestB: 3306.7, breakEven: 0.08 }, tolerance: 0.01 },
    // 0% debt, 0% return: 12,000 owed, 500 min + 500 extra. A: paid off in month 12, then invests 1,000 x 12 = 12,000. B: 500 x 24 = 12,000 paid off in month 24 while investing 500 x 24 = 12,000. Both net worth 12,000, no interest.
    { values: { extra: 500, years: 2, balance: 12000, apr: 0, minPay: 500, ret: 0 }, expect: { nwA: 12000, nwB: 12000, diff: 0, interestA: 0, interestB: 0 }, tolerance: 1e-6 },
    // 6,000 at 12% (1%/mo), 200 min + 200 extra, 6% return, 3 years. Script: A net worth 8,244.71, B 7,897.98, diff 346.73; interest A 533.65 (cleared month 17), B 1,169.24 (cleared month 36).
    { values: { extra: 200, years: 3, balance: 6000, apr: 12, minPay: 200, ret: 6 }, expect: { nwA: 8244.71, nwB: 7897.98, diff: 346.73, interestA: 533.65, interestB: 1169.24 }, tolerance: 0.01 },
  ],
});
