import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';
import { DEFAULT_MARKET, drawReturns, FIRE_UPDATED, percentilePaths, safeRate, SOURCES, successRate } from '../../lib/helpers/fire';

const SIMS = 2000;
const RATES = [3, 3.5, 4, 4.5, 5, 5.5, 6];

export default defineCalculator({
  slug: 'safe-withdrawal-rate',
  title: 'Safe Withdrawal Rate Calculator',
  seoTitle: 'Safe Withdrawal Rate Calculator (Monte Carlo)',
  metaDescription: 'Test the 4% rule with a 2,000-run Monte Carlo simulation: the chance your money lasts, the highest safe withdrawal rate, and best and worst-case balances.',
  updated: FIRE_UPDATED,
  category: 'fire',
  description: 'Run 2,000 simulated markets to see the chance your portfolio lasts and the highest withdrawal rate that survives.',
  keywords: ['safe withdrawal rate', '4% rule', 'Monte Carlo retirement', 'retirement success rate', 'SWR', 'will my money last', 'sequence of returns risk'],
  popular: true,
  inputs: [
    { id: 'portfolio', label: 'Portfolio at retirement', type: 'number', prefix: '$', default: 1250000, min: 0, step: 10000, info: 'The amount invested on the day you stop working.' },
    { id: 'spending', label: 'Annual withdrawal', type: 'number', prefix: '$', default: 50000, min: 0, step: 1000, info: 'What you take out in the first year. It rises with inflation each year after, so it keeps the same buying power.' },
    { id: 'years', label: 'Years in retirement', type: 'number', suffix: 'years', default: 40, min: 1, max: 80, step: 1, info: 'How long the money needs to last. Traditional retirement plans use 30 years; someone retiring at 45 might plan for 45–50.' },
    { id: 'stocks', label: 'Stock allocation', type: 'number', suffix: '% stocks', default: 80, min: 0, max: 100, step: 5, info: 'The share of your portfolio in stocks; the rest is in bonds, rebalanced every year. Historically 60–100% stocks has supported the highest withdrawal rates over long retirements.' },
    { id: 'stockReturn', label: 'Stock return after inflation', type: 'number', suffix: '% / yr', default: DEFAULT_MARKET.stockMean * 100, step: 0.1, optional: true, info: 'Average yearly real return on stocks. US stocks have averaged roughly 8% a year above inflation (arithmetic mean) over the long run; 7% is a slightly cautious default.' },
    { id: 'stockVol', label: 'Stock volatility', type: 'number', suffix: '% / yr', default: DEFAULT_MARKET.stockSd * 100, min: 0, step: 0.5, optional: true, info: 'How much stock returns swing from year to year (standard deviation). About 17–20% is typical for a broad stock index.' },
    { id: 'bondReturn', label: 'Bond return after inflation', type: 'number', suffix: '% / yr', default: DEFAULT_MARKET.bondMean * 100, step: 0.1, optional: true, info: 'Average yearly real return on bonds. 1.5–2.5% above inflation is a common assumption.' },
  ],
  outputs: [
    { id: 'success', label: 'Chance your money lasts', primary: true, format: 'percent', precision: 1, info: 'The share of 2,000 simulated markets in which you never run out of money over your retirement.' },
    { id: 'rate', label: 'Your withdrawal rate', format: 'percent', precision: 2, info: 'First-year withdrawal divided by your portfolio.' },
    { id: 'safe95', label: 'Highest rate with 95% success', format: 'percent', precision: 2, info: 'The largest starting withdrawal rate that lasted in at least 95% of the simulations. A common target for a confident plan.' },
    { id: 'safeAmount', label: 'Safe yearly withdrawal (95%)', format: 'currency', precision: 0, info: 'Your portfolio multiplied by the 95%-success rate: the yearly spending these simulations suggest is safe.' },
    { id: 'median', label: 'Typical ending balance', format: 'currency', precision: 0, info: 'The median balance left at the end, in today\'s dollars. Half of simulations end above, half below.' },
    { id: 'p10', label: 'Bad-case ending balance (10th percentile)', format: 'currency', precision: 0, info: 'Only 1 in 10 simulations ended with less than this. Zero means at least 10% of simulations ran out.' },
  ],
  compute: (v) => {
    const start = num(v.portfolio);
    const spending = num(v.spending);
    const years = Math.round(num(v.years) ?? 0);
    const stocks = num(v.stocks);
    if (start === null || spending === null || stocks === null || start <= 0 || spending < 0 || years < 1 || years > 80) return { success: null };
    const m = {
      stockShare: Math.min(100, Math.max(0, stocks)) / 100,
      stockMean: (num(v.stockReturn) ?? DEFAULT_MARKET.stockMean * 100) / 100,
      stockSd: (num(v.stockVol) ?? DEFAULT_MARKET.stockSd * 100) / 100,
      bondMean: (num(v.bondReturn) ?? DEFAULT_MARKET.bondMean * 100) / 100,
      bondSd: DEFAULT_MARKET.bondSd,
    };
    const returns = drawReturns(m, SIMS, years);
    const success = successRate(returns, start, spending, years);
    const safe = safeRate(returns, start, years, 0.95);
    const p = percentilePaths(returns, start, spending, years);
    const rate = (spending / start) * 100;
    const yrs = Array.from({ length: years + 1 }, (_, i) => i);
    return {
      success,
      tone: success >= 0.95 ? 'good' : success >= 0.85 ? 'ok' : success >= 0.7 ? 'warn' : 'bad',
      badge: success >= 0.95 ? 'Very likely to last' : success >= 0.85 ? 'Likely to last' : success >= 0.7 ? 'Risky' : 'Likely to run out',
      rate: rate / 100,
      safe95: safe / 100,
      safeAmount: (start * safe) / 100,
      median: p.p50[years],
      p10: p.p10[years],
      chart: [
        {
          type: 'line',
          title: 'Portfolio over retirement (today\'s $)',
          x: yrs,
          xLabel: 'Years into retirement',
          yFormat: CURRENCY,
          series: [
            { name: 'Bad markets (10th pct)', values: p.p10 },
            { name: 'Typical (median)', values: p.p50 },
            { name: 'Good markets (75th pct)', values: p.p75 },
          ],
        },
        {
          type: 'bar',
          title: 'Success rate by withdrawal rate',
          categories: RATES.map((r) => `${r}%`),
          series: [{ name: 'Chance money lasts', values: RATES.map((r) => successRate(returns, start, (start * r) / 100, years)) }],
          format: { format: 'percent' },
          highlight: RATES.findIndex((r) => Math.abs(r - rate) < 0.25),
        },
      ],
      steps: [
        `Withdrawal rate = ${money(spending, 0)} ÷ ${money(start, 0)} = ${rate.toFixed(2)}%`,
        `${SIMS.toLocaleString()} simulations × ${years} years; each year: balance = (balance − withdrawal) × (1 + random real return)`,
        `Portfolio return = ${stocks}% × stocks (mean ${(m.stockMean * 100).toFixed(1)}%, sd ${(m.stockSd * 100).toFixed(1)}%) + ${100 - stocks}% × bonds (mean ${(m.bondMean * 100).toFixed(1)}%, sd ${(m.bondSd * 100).toFixed(1)}%)`,
        `Money lasted in ${Math.round(success * SIMS).toLocaleString()} of ${SIMS.toLocaleString()} simulations`,
      ],
      note: success >= 0.95 ? 'A success rate above 95% is generally considered a robust plan.' : success >= 0.85 ? 'Between 85% and 95%: workable if you are willing to cut spending after a bad run of markets.' : 'Below 85%: consider a lower withdrawal, a longer working period, or part-time income early in retirement.',
    };
  },
  content: {
    formula: ['Withdrawal rate = first-year withdrawal ÷ starting portfolio', 'Each simulated year: balance = (balance − withdrawal) × (1 + real return)', 'Success rate = simulations that never run out ÷ 2,000'],
    body: [
      'A safe withdrawal rate is the share of your portfolio you can spend in the first year of retirement — then keep spending, adjusted for inflation — without running out of money. The famous answer is 4% for 30 years, but the right number for you depends on how long you will be retired, how your money is invested, and how much risk you can accept.',
      'This calculator runs a Monte Carlo simulation. It generates 2,000 different 40-year (or however long you choose) market histories, with yearly stock and bond returns drawn at random around the averages you set, and plays your retirement out in each one. The share that never runs out is your success rate.',
      'Everything is in today\'s dollars: returns are real (after inflation) and your withdrawal stays the same in real terms. The simulation uses a fixed random seed, so the same inputs always give the same answer and you can compare scenarios fairly.',
    ],
    sections: [
      {
        heading: 'Why early retirees need a lower withdrawal rate',
        paragraphs: [
          'The original 4% research looked at 30-year retirements. Stretching the horizon to 40–60 years means more chances to hit a bad stretch of markets and less margin to recover. Try changing "Years in retirement" from 30 to 50 and watch the 95% safe rate fall.',
          'The biggest danger is sequence-of-returns risk: a crash in the first few years of retirement, when you are withdrawing from a portfolio that has just fallen, does far more damage than the same crash 20 years later. That is why the bad-case line on the chart can fall away quickly even when average returns look fine.',
        ],
      },
      {
        heading: 'Limitations of this simulation',
        paragraphs: [
          'Returns are drawn independently each year from a normal distribution. Real markets have fat tails, long periods of high valuations followed by poor returns, and stock-bond correlations that change over time. Historical backtests, such as those in the Trinity study and the Early Retirement Now series, capture some of these effects. Use this tool to compare scenarios and set a cautious margin, not as a guarantee.',
        ],
      },
    ],
    faq: [
      { q: 'Is the 4% rule still safe?', a: 'For a 30-year retirement with a stock-heavy portfolio, 4% has historically worked in the large majority of periods. For 40+ year retirements, or if you expect below-average returns, 3.25–3.75% gives a more comfortable margin.' },
      { q: 'What success rate should I aim for?', a: 'Many planners target 85–95%. A 100% target forces you to spend very little in exchange for protection against the very worst cases. Being willing to trim spending in bad years lets you accept a lower simulated success rate.' },
      { q: 'Why do my results differ from FIRECalc or cFIREsim?', a: 'Those tools replay actual historical market sequences, while this one simulates random markets around average returns. Each approach has strengths; if they broadly agree, you can be more confident in your plan.' },
      { q: 'Does this include Social Security or fees?', a: 'No. To include fees, lower the expected returns by your fund expense ratio. To include later income such as Social Security, reduce your withdrawal by a portion of it, or run separate scenarios before and after benefits start.' },
    ],
    sources: [SOURCES.bengen, SOURCES.trinity, SOURCES.ern],
  },
  related: ['fire-number', 'how-long-will-money-last', 'fire-calculator', 'fat-fire', 'retirement'],
  examples: [
    { values: { portfolio: 1000000, spending: 0, years: 30, stocks: 80, stockReturn: null, stockVol: null, bondReturn: null }, expect: { success: 1, rate: 0 } },
    { values: { portfolio: 1000000, spending: 100000, years: 30, stocks: 0, stockReturn: 0, stockVol: 0, bondReturn: 0 }, expect: { success: 0 } },
  ],
});
