import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY, money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'dividend-income-goal',
  title: 'Dividend Income Goal Calculator',
  seoTitle: 'Dividend Income Goal Calculator',
  metaDescription: 'Work backwards from the monthly income you want to the portfolio it takes at a given dividend yield, with an optional tax rate and what you still need.',
  updated: '2026-11-22',
  category: 'finance',
  description: 'Find the portfolio you need for $X a month of dividend income at your yield.',
  keywords: ['dividend income goal', 'how much to invest for $1000 a month in dividends', 'portfolio needed for passive income', 'dividend portfolio size', 'monthly dividend income calculator'],
  popular: false,
  inputs: [
    { id: 'goal', label: 'Monthly income you want', type: 'number', prefix: '$', default: 1000, min: 0, step: 100, info: 'The amount you want to keep each month, after tax if you enter a tax rate below.' },
    { id: 'yield', label: 'Dividend yield', type: 'number', suffix: '%', default: 4, min: 0.1, max: 30, step: 0.1, info: 'Yearly dividends as a share of the portfolio. Check the real yield of what you hold; it changes.' },
    { id: 'tax', label: 'Tax on dividends', type: 'number', suffix: '%', default: 0, min: 0, max: 60, step: 1, info: 'Optional. If above 0, the portfolio is sized so that income after this tax meets your goal.' },
    { id: 'current', label: 'Invested today', type: 'number', prefix: '$', default: 25000, min: 0, step: 1000, info: 'What you already hold in dividend-paying investments. Leave at 0 to ignore.' },
  ],
  outputs: [
    { id: 'needed', label: 'Portfolio needed', format: 'currency', precision: 0, primary: true, info: 'Gross yearly income ÷ dividend yield.' },
    { id: 'gap', label: 'Still to invest', format: 'currency', precision: 0, info: 'Portfolio needed minus what you hold today (0 if you are there).' },
    { id: 'progress', label: 'Progress', format: 'percent', precision: 1, info: 'What you hold today as a share of the portfolio needed, capped at 100%.' },
    { id: 'yearly', label: 'Gross dividends per year', format: 'currency', precision: 0, info: 'Goal × 12 ÷ (1 − tax rate).' },
  ],
  compute: (v) => {
    const goal = num(v.goal);
    const y = num(v.yield);
    const t = num(v.tax) ?? 0;
    const cur = num(v.current) ?? 0;
    if (goal === null || y === null) return { needed: null };
    if (goal <= 0) return { needed: null, error: 'Enter a monthly income above $0.' };
    if (y <= 0) return { needed: null, error: 'Enter a dividend yield above 0%.' };
    if (t < 0 || t >= 100) return { needed: null, error: 'Tax rate must be at least 0% and below 100%.' };
    if (cur < 0) return { needed: null, error: 'Invested today cannot be negative.' };
    const yearly = (goal * 12) / (1 - t / 100);
    const needed = yearly / (y / 100);
    const gap = Math.max(0, needed - cur);
    const progress = Math.min(1, cur / needed) * 100;

    const yields = [2, 3, 4, 5, 6, 8];
    const steps = [
      `Gross dividends per year = ${money(goal, 0)} × 12${t > 0 ? ` ÷ (1 − ${t}%)` : ''} = ${money(yearly, 0)}`,
      `Portfolio needed = ${money(yearly, 0)} ÷ ${y}% = ${money(needed, 0)}`,
      `Still to invest = ${money(needed, 0)} − ${money(cur, 0)} = ${money(gap, 0)}`,
    ];
    const idx = yields.indexOf(y);
    return {
      needed,
      gap,
      progress,
      yearly,
      tone: 'ok',
      badge: `${money(needed, 0)} needed`,
      chart: {
        type: 'bar',
        title: 'Portfolio needed at different yields',
        categories: yields.map((r) => `${r}%`),
        series: [{ name: 'Portfolio needed', values: yields.map((r) => Math.round(yearly / (r / 100))) }],
        format: CURRENCY,
        highlight: idx >= 0 ? idx : undefined,
      },
      steps,
      note: `At a ${y}% yield, ${money(goal, 0)} a month takes about ${money(needed, 0)}. A higher yield needs less money but usually carries more risk, and dividends can be cut.`,
    };
  },
  content: {
    formula: [
      'Gross dividends per year = monthly goal × 12 ÷ (1 − tax rate)',
      'Portfolio needed = gross dividends per year ÷ dividend yield',
      'Still to invest = portfolio needed − invested today',
    ],
    body: [
      'Most dividend calculators start with a balance and project forward. This one starts with the income you want and works backwards to the size of the portfolio that would pay it at a given yield.',
      'For $1,000 a month at a 4% yield with no tax, you need $12,000 a year of dividends, so $12,000 ÷ 0.04 = $300,000. At 2% the same goal takes $600,000, and at 6% it takes $200,000.',
    ],
    sections: [
      {
        heading: 'Why the yield matters so much',
        paragraphs: [
          'The portfolio needed is inversely proportional to the yield: halve the yield and you need twice the money. A very high yield can be a warning sign, because it may mean the share price has fallen or the payout may be cut. The chart shows the same goal at several yields so you can see the trade-off.',
          'Dividends are not guaranteed, and this is not advice on what to buy. Tax rules vary by country and account type, so the tax input is a simple flat rate you set yourself.',
        ],
      },
    ],
    faq: [
      { q: 'How much do I need invested to earn $1,000 a month in dividends?', a: 'At a 4% yield with no tax you need $300,000 ($12,000 a year ÷ 0.04). At 3% it is $400,000 and at 5% it is $240,000.' },
      { q: 'How does the tax rate change the answer?', a: 'The calculator grosses up your goal so the income left after tax meets it. $1,000 a month at a 4% yield and 15% tax needs $12,000 ÷ 0.85 = $14,117.65 a year of dividends, so $352,941 of portfolio.' },
      { q: 'Is a higher yield better?', a: 'It needs less money, but a high yield can signal risk and dividends can be cut. Compare the yield with how long the company has paid it.' },
      { q: 'Does this include growth?', a: 'No. It sizes the portfolio for today’s income at the yield you enter. To see how a balance grows, use the dividend calculator or the savings goal calculator.' },
    ],
    sources: [{ label: 'Investor.gov (SEC) — Dividend yield: yearly dividends divided by share price' }],
  },
  related: ['dividend-calculator', 'yield-on-cost', 'savings-goal', 'portfolio-income-per-day'],
  examples: [
    // 1000*12 = 12000; /0.04 = 300000; gap 275000; progress 25000/300000 = 8.3333%
    { values: { goal: 1000, yield: 4, tax: 0, current: 25000 }, expect: { yearly: 12000, needed: 300000, gap: 275000, progress: 8.3333 }, tolerance: 0.001 },
    // 12000/0.85 = 14117.647; /0.04 = 352941.18
    { values: { goal: 1000, yield: 4, tax: 15, current: 0 }, expect: { needed: 352941.1765, gap: 352941.1765, progress: 0 }, tolerance: 0.001 },
  ],
});
