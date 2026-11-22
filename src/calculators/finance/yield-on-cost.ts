import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'yield-on-cost',
  title: 'Yield on Cost Calculator',
  category: 'finance',
  description: 'Work out your dividend yield on cost, compare it with the current yield, and see how growing dividends lift yield on cost and income over the years.',
  keywords: ['yield on cost calculator', 'yield on cost', 'dividend yield on cost', 'yoc calculator', 'dividend growth yield on cost', 'current yield vs yield on cost'],
  updated: '2026-11-21',
  inputs: [
    { id: 'shares', label: 'Shares owned', type: 'number', default: 100, min: 0, step: 1, info: 'How many shares you hold.' },
    { id: 'cost', label: 'Purchase price per share', type: 'number', prefix: '$', default: 50, min: 0, step: 0.01, info: 'What you paid per share (average cost if you bought more than once).' },
    { id: 'price', label: 'Current price per share', type: 'number', prefix: '$', default: 80, min: 0, step: 0.01, info: 'Today\'s market price.' },
    { id: 'dps', label: 'Current annual dividend per share', type: 'number', prefix: '$', default: 2, min: 0, step: 0.01, info: 'Total dividends paid per share over the last 12 months.' },
    { id: 'growth', label: 'Annual dividend growth', type: 'number', suffix: '% a year', default: 7, step: 0.1, info: 'How fast you expect the dividend per share to rise each year. Use 0 for no growth.' },
    { id: 'years', label: 'Years to project', type: 'number', default: 10, min: 1, max: 60, step: 1, info: 'How many years ahead to look.' },
  ],
  outputs: [
    { id: 'yoc', label: 'Yield on cost now', format: 'percent', precision: 2, primary: true, info: 'Annual dividend ÷ the price you paid.' },
    { id: 'currentYield', label: 'Current yield', format: 'percent', precision: 2, info: 'Annual dividend ÷ today\'s price. What a new buyer earns.' },
    { id: 'yocFuture', label: 'Yield on cost after the projection', format: 'percent', precision: 2, info: 'Dividend × (1 + growth)^years ÷ the price you paid.' },
    { id: 'incomeNow', label: 'Annual dividend income now', format: 'currency', info: 'Shares × annual dividend per share.' },
    { id: 'incomeFuture', label: 'Annual dividend income after the projection', format: 'currency', info: 'Income now × (1 + growth)^years.' },
    { id: 'totalCost', label: 'Original cost', format: 'currency', info: 'Shares × purchase price.' },
  ],
  compute: (v) => {
    const shares = num(v.shares);
    const cost = num(v.cost);
    const price = num(v.price);
    const dps = num(v.dps);
    const g = num(v.growth);
    const n = num(v.years);
    if (shares === null || cost === null || price === null || dps === null || g === null || n === null) return { yoc: null };
    if (shares < 0 || cost < 0 || price < 0 || dps < 0) return { yoc: null, error: 'Values cannot be negative.' };
    if (cost === 0) return { yoc: null, error: 'Purchase price must be above zero.' };
    if (price === 0) return { yoc: null, error: 'Current price must be above zero.' };
    if (n < 1 || n > 60) return { yoc: null, error: 'Years must be between 1 and 60.' };
    if (g <= -100) return { yoc: null, error: 'Dividend growth must be above -100%.' };
    const years = Math.floor(n);
    const gr = g / 100;
    const factor = Math.pow(1 + gr, years);
    const totalCost = shares * cost;
    const incomeNow = shares * dps;
    const incomeFuture = incomeNow * factor;
    const yoc = dps / cost;
    const currentYield = dps / price;
    const yocFuture = (dps * factor) / cost;
    const xs: number[] = [];
    const yocSeries: number[] = [];
    const curSeries: number[] = [];
    for (let t = 0; t <= years; t++) {
      const d = dps * Math.pow(1 + gr, t);
      xs.push(t);
      yocSeries.push(d / cost);
      curSeries.push(d / price);
    }
    const fmt = (x: number) => `${+(x * 100).toFixed(2)}%`;
    return {
      yoc,
      currentYield,
      yocFuture,
      incomeNow,
      incomeFuture,
      totalCost,
      tone: 'ok',
      badge: `${fmt(yoc)} on cost now, ${fmt(yocFuture)} in ${years} years`,
      note: 'Dividends are not guaranteed and can be cut or stopped. The projection assumes the dividend grows at a steady rate and ignores tax, fees and reinvestment. Not financial advice.',
      chart: {
        type: 'line',
        title: 'Yield on cost vs current yield as dividends grow',
        x: xs,
        xLabel: 'Years',
        yFormat: { format: 'percent' },
        series: [
          { name: 'Yield on cost (your price)', values: yocSeries },
          { name: 'Yield at today\'s price (new buyer)', values: curSeries },
        ],
      },
      steps: [
        `Original cost = ${shares} × ${money(cost)} = ${money(totalCost)}.`,
        `Yield on cost now = ${money(dps)} ÷ ${money(cost)} = ${fmt(yoc)}; current yield = ${money(dps)} ÷ ${money(price)} = ${fmt(currentYield)}.`,
        `After ${years} years at ${g}% growth the dividend is ${money(dps * factor)} a share, so yield on cost is ${fmt(yocFuture)} and income is ${money(incomeFuture)} a year.`,
      ],
    };
  },
  content: {
    formula: [
      'Yield on cost = annual dividend per share ÷ purchase price per share',
      'Current yield = annual dividend per share ÷ current price per share',
      'Yield on cost after N years = dividend × (1 + growth)^N ÷ purchase price',
    ],
    body: [
      'Yield on cost (YoC) measures your dividend against what you originally paid, not what the shares are worth today. If you bought at $50 and the stock now pays $2 a share, your yield on cost is 4%, even if a new buyer at today\'s higher price earns less.',
      'It is a way to see how your own income has grown, which is why dividend growth investors like it. It is not a measure of return: it ignores the share price today, so a stock that has fallen can show a high YoC while your money is worth less.',
      'Enter your shares, price paid, current price and dividend, then add a growth rate and a number of years. The chart shows how yield on cost climbs as the dividend grows, while the yield at today\'s price rises more slowly. Dividends are not guaranteed, so treat the projection as an illustration.',
    ],
    sections: [
      {
        heading: 'Worked example',
        paragraphs: [
          '100 shares bought at $50 cost $5,000. With a $2 dividend per share the income is $200 a year, a yield on cost of $2 ÷ $50 = 4%. If the share price is now $80, the current yield is $2 ÷ $80 = 2.5%.',
          'If the dividend grows 7% a year for 10 years it becomes $2 × 1.07^10 = $3.93 a share. Yield on cost is then 7.87% and income is $393.43 a year.',
        ],
      },
    ],
    faq: [
      { q: 'What is yield on cost?', a: 'The annual dividend divided by the price you originally paid. 100 shares bought at $50 that now pay $2 each have a yield on cost of 4%.' },
      { q: 'How is yield on cost different from current yield?', a: 'Current yield uses today\'s price, yield on cost uses your purchase price. With a $2 dividend, a $50 purchase price and an $80 share price, yield on cost is 4% and current yield is 2.5%.' },
      { q: 'How does dividend growth change yield on cost?', a: 'The dividend rises while your cost stays fixed, so YoC rises. At 7% growth for 10 years, a $2 dividend becomes $3.93 and yield on cost goes from 4% to 7.87%.' },
      { q: 'Is a high yield on cost a good sign?', a: 'Not by itself. It shows income relative to what you paid, not how the investment has performed, and dividends are not guaranteed. This is general information, not tax or investment advice.' },
    ],
    sources: [{ label: 'SEC Investor.gov: Dividend yield', url: 'https://www.investor.gov/introduction-investing/investing-basics/glossary/dividend-yield' }],
  },
  related: ['dividend-calculator', 'dividend-payout-ratio-calculator', 'compound-interest', 'investment', 'dividend-income-goal'],
  examples: [
    // cost 100*50 = 5000; income 100*2 = 200; YoC 2/50 = 0.04; current yield 2/80 = 0.025
    // 1.07^10 = 1.96715136; dividend 2*1.96715136 = 3.93430271; YoC 3.93430271/50 = 0.0786861; income 393.43
    { values: { shares: 100, cost: 50, price: 80, dps: 2, growth: 7, years: 10 }, expect: { yoc: 0.04, currentYield: 0.025, yocFuture: 0.0786861, incomeNow: 200, incomeFuture: 393.43, totalCost: 5000 } },
    // no growth: everything stays flat; 50 shares at $20, $1 dividend, price $25: YoC 5%, current 4%, income 50
    { values: { shares: 50, cost: 20, price: 25, dps: 1, growth: 0, years: 5 }, expect: { yoc: 0.05, currentYield: 0.04, yocFuture: 0.05, incomeNow: 50, incomeFuture: 50, totalCost: 1000 } },
  ],
});
