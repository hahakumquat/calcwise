import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money, pct } from '../../lib/helpers/finance';
import { FIRE_UPDATED } from '../../lib/helpers/fire';

export default defineCalculator({
  slug: 'withdrawal-guardrails',
  title: 'Retirement Withdrawal Guardrails Calculator',
  seoTitle: 'Guyton-Klinger Guardrails Calculator',
  metaDescription: 'Simplified Guyton-Klinger guardrails: enter your portfolio and last withdrawal to see if this year\'s spending stays, rises or is cut, and the new rate.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'See whether this year\'s retirement withdrawal should stay, rise or be cut under simplified Guyton-Klinger guardrails.',
  keywords: ['guyton klinger calculator', 'withdrawal guardrails', 'guardrails retirement spending', 'dynamic withdrawal strategy', 'capital preservation rule', 'prosperity rule', 'retirement spending rules'],
  inputs: [
    { id: 'start', label: 'Portfolio at retirement', type: 'number', prefix: '$', default: 1000000, min: 0, step: 10000, info: 'The portfolio value on the day you started withdrawing. It sets your first-year withdrawal.' },
    { id: 'rate', label: 'Initial withdrawal rate', type: 'number', suffix: '%', default: 5, min: 0, max: 100, step: 0.1, info: 'First-year withdrawal as a percent of the starting portfolio. Guardrail plans often start higher than a flat 4% because spending can be cut later.' },
    { id: 'current', label: 'Portfolio today', type: 'number', prefix: '$', default: 800000, min: 0, step: 10000, info: 'The portfolio value now, before this year\'s withdrawal.' },
    { id: 'last', label: 'Last year\'s withdrawal', type: 'number', prefix: '$', default: 50000, min: 0, step: 500, info: 'What you actually withdrew last year. In year one, use your initial withdrawal.' },
    { id: 'inflation', label: 'Inflation', type: 'number', suffix: '%', default: 3, min: -10, max: 50, step: 0.1, info: 'Inflation over the past year. Your withdrawal is raised by this before the guardrails are checked.' },
    { id: 'band', label: 'Guardrail band', type: 'number', suffix: '%', default: 20, min: 0, max: 100, step: 1, info: 'How far the current rate may drift from the initial rate, in relative terms. 20% means guardrails at 80% and 120% of the initial rate.' },
    { id: 'adjust', label: 'Adjustment size', type: 'number', suffix: '%', default: 10, min: 0, max: 100, step: 1, info: 'How much to cut or raise the withdrawal when a guardrail is crossed.' },
  ],
  outputs: [
    { id: 'recommended', label: 'This year\'s withdrawal', primary: true, format: 'currency', precision: 0, info: 'The inflation-adjusted withdrawal, cut or raised if a guardrail was crossed.' },
    { id: 'decision', label: 'Decision', format: 'text', info: 'Keep, cut or raise, based on whether the current rate is inside the guardrails.' },
    { id: 'initial', label: 'Initial withdrawal', format: 'currency', precision: 0, info: 'Starting portfolio times initial rate.' },
    { id: 'thisYear', label: 'After inflation, before guardrails', format: 'currency', precision: 0, info: 'Last year\'s withdrawal times (1 + inflation).' },
    { id: 'currentRate', label: 'Current withdrawal rate', format: 'percent', precision: 2, info: 'Inflation-adjusted withdrawal divided by today\'s portfolio.' },
    { id: 'upper', label: 'Upper guardrail (cut above)', format: 'percent', precision: 2, info: 'Initial rate times (1 + band). A current rate above this triggers a cut.' },
    { id: 'lower', label: 'Lower guardrail (raise below)', format: 'percent', precision: 2, info: 'Initial rate times (1 - band). A current rate below this triggers a raise.' },
    { id: 'newRate', label: 'New withdrawal rate', format: 'percent', precision: 2, info: 'This year\'s withdrawal divided by today\'s portfolio.' },
  ],
  compute: (v) => {
    const start = num(v.start), rate = num(v.rate), cur = num(v.current), last = num(v.last);
    const infl = num(v.inflation), band = num(v.band), adj = num(v.adjust);
    if (start === null || rate === null || cur === null || last === null || infl === null || band === null || adj === null) return { recommended: null, note: 'Fill in every field.' };
    if (start <= 0 || rate <= 0 || cur <= 0) return { recommended: null, error: 'Starting portfolio, initial rate and current portfolio must be above 0.' };
    if (last < 0) return { recommended: null, error: 'Last year\'s withdrawal cannot be negative.' };
    if (infl <= -100 || band < 0 || band > 100 || adj < 0 || adj > 100) return { recommended: null, error: 'Band and adjustment must be between 0 and 100%, and inflation must be above -100%.' };
    const initial = start * (rate / 100);
    const thisYear = last * (1 + infl / 100);
    const currentRate = thisYear / cur;
    const upper = (rate / 100) * (1 + band / 100);
    const lower = (rate / 100) * (1 - band / 100);
    let recommended = thisYear;
    let decision = 'Keep';
    if (currentRate > upper) { recommended = thisYear * (1 - adj / 100); decision = 'Cut'; }
    else if (currentRate < lower) { recommended = thisYear * (1 + adj / 100); decision = 'Raise'; }
    const newRate = recommended / cur;
    const p = (f: number) => pct(f, 2);
    return {
      recommended,
      decision: decision === 'Keep' ? 'Keep (inside guardrails)' : decision === 'Cut' ? `Cut ${adj}% (above upper guardrail)` : `Raise ${adj}% (below lower guardrail)`,
      initial,
      thisYear,
      currentRate,
      upper,
      lower,
      newRate,
      tone: decision === 'Cut' ? 'warn' : decision === 'Raise' ? 'good' : 'ok',
      badge: decision === 'Cut' ? 'Cut spending' : decision === 'Raise' ? 'Room to raise' : 'Inside guardrails',
      chart: {
        type: 'bar',
        title: 'Withdrawal this year',
        categories: ['Last year', 'After inflation', 'Guardrail result'],
        series: [{ name: 'Withdrawal', values: [Math.round(last), Math.round(thisYear), Math.round(recommended)] }],
        format: CURRENCY,
        highlight: 2,
      },
      note: 'A simplified version of the published rules, not a plan. The original also skips the inflation raise after a down year and limits cuts late in retirement.',
      steps: [
        `Initial withdrawal = ${money(start, 0)} × ${rate}% = ${money(initial, 0)}`,
        `This year before guardrails = ${money(last, 0)} × (1 + ${infl}%) = ${money(thisYear, 0)}`,
        `Current rate = ${money(thisYear, 0)} ÷ ${money(cur, 0)} = ${p(currentRate)}`,
        `Guardrails = ${rate}% × (1 ± ${band}%) = ${p(lower)} to ${p(upper)}`,
        decision === 'Keep' ? `${p(currentRate)} is inside the guardrails, so keep ${money(thisYear, 0)}` : `${p(currentRate)} is ${decision === 'Cut' ? 'above' : 'below'} the ${decision === 'Cut' ? 'upper' : 'lower'} guardrail, so ${decision.toLowerCase()} by ${adj}% to ${money(recommended, 0)} (${p(newRate)} of the portfolio)`,
      ],
    };
  },
  content: {
    formula: [
      'Initial withdrawal = starting portfolio × initial rate',
      'This year = last year\'s withdrawal × (1 + inflation)',
      'Current rate = this year ÷ current portfolio',
      'Upper guardrail = initial rate × (1 + band); lower guardrail = initial rate × (1 − band)',
      'If current rate > upper: cut by the adjustment. If below lower: raise by it. Otherwise keep.',
    ],
    body: [
      'Guardrails are a dynamic spending rule. Instead of withdrawing a fixed inflation-adjusted amount no matter what, you check once a year whether your withdrawal rate has drifted too far from where it started. If a falling portfolio pushes the rate above the upper guardrail, you cut. If a rising portfolio pulls it below the lower guardrail, you give yourself a raise.',
      'The approach is associated with Jonathan Guyton and William Klinger (2006). In exchange for accepting occasional cuts, their work suggested a higher starting rate than a flat 4% could support. This calculator uses a simplified version: it applies the inflation raise every year and has no rule for the final years of retirement. The published rules also skip the inflation raise after a year when the portfolio lost money and limit cuts in late retirement. Check the paper for the exact rules before relying on them.',
      'Example: $1,000,000 at 5% gives $50,000. Later the portfolio is $800,000 and inflation was 3%, so the withdrawal grows to $51,500, which is 6.44% of $800,000. The upper guardrail is 5% × 1.2 = 6.0%, so the withdrawal is cut 10% to $46,350, or 5.79% of the portfolio.',
      'This is general education, not financial advice or a retirement plan. Taxes, fees, other income and your own risk tolerance all matter.',
    ],
    faq: [
      { q: 'What are the default guardrails?', a: 'With a 5% initial rate and a 20% band, the guardrails are 4.0% (lower) and 6.0% (upper). Cuts and raises are 10% by default. You can edit all of them.' },
      { q: 'What happens if my portfolio fell to $800,000?', a: 'With $50,000 withdrawn last year and 3% inflation, this year is $51,500, a 6.44% rate. That is above 6.0%, so the withdrawal is cut 10% to $46,350, which is 5.79% of $800,000.' },
      { q: 'What happens if my portfolio grew to $1,400,000?', a: '$51,500 is 3.68% of $1,400,000, below the 4.0% lower guardrail, so the withdrawal is raised 10% to $56,650.' },
      { q: 'Is this the exact Guyton-Klinger method?', a: 'No. It is a simplified version. The published rules also skip the inflation raise after a down year and limit cuts near the end of retirement. Confirm the rules in Guyton and Klinger (2006).' },
      { q: 'How often should I check the guardrails?', a: 'Once a year is typical, using your portfolio value and last year\'s actual withdrawal.' },
    ],
    sources: [
      { label: 'Guyton JT, Klinger WJ (2006). Decision Rules and Maximum Initial Withdrawal Rates. Journal of Financial Planning, 19(3).' },
    ],
  },
  related: ['safe-withdrawal-rate', 'how-long-will-money-last'],
  examples: [
    // 1,000,000 x 5% = 50,000; 50,000 x 1.03 = 51,500; 51,500/800,000 = 6.4375% > 6.0% -> cut 10% = 46,350; 46,350/800,000 = 5.79375%
    { values: { start: 1000000, rate: 5, current: 800000, last: 50000, inflation: 3, band: 20, adjust: 10 }, expect: { initial: 50000, thisYear: 51500, currentRate: 0.064375, upper: 0.06, lower: 0.04, recommended: 46350, newRate: 0.0579375 }, tolerance: 1e-6 },
    // 51,500/1,400,000 = 3.6786% < 4.0% -> raise 10% = 56,650
    { values: { start: 1000000, rate: 5, current: 1400000, last: 50000, inflation: 3, band: 20, adjust: 10 }, expect: { currentRate: 0.0367857143, recommended: 56650 }, tolerance: 1e-6 },
    // 51,500/1,000,000 = 5.15%: inside 4.0%-6.0% -> keep 51,500
    { values: { start: 1000000, rate: 5, current: 1000000, last: 50000, inflation: 3, band: 20, adjust: 10 }, expect: { recommended: 51500, newRate: 0.0515 }, tolerance: 1e-6 },
  ],
});
