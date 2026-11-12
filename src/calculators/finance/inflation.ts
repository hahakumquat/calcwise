import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { CURRENCY } from '../../lib/helpers/finance';
import { money, pct } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'inflation',
  title: 'Inflation Calculator',
  category: 'finance',
  description: 'See what an amount of money is worth in another year, and how much purchasing power it loses, at an annual inflation rate you choose.',
  keywords: ['inflation', 'purchasing power', 'value of a dollar', 'future value of money', 'real value', 'cost of living'],
  inputs: [
    { id: 'amount', label: 'Amount', type: 'number', prefix: '$', default: 100, min: 0, info: 'The sum of money you want to compare across years.' },
    { id: 'startYear', label: 'From year', type: 'number', default: 2000, step: 1, info: 'The year the amount is from.' },
    { id: 'endYear', label: 'To year', type: 'number', default: 2026, step: 1, info: 'The year you want to express the amount in. It can be earlier than the start year to convert backwards.' },
    { id: 'rate', label: 'Average annual inflation', type: 'number', suffix: '%', default: 2.6, step: 0.1, help: 'U.S. CPI inflation has averaged roughly 2.5–3% a year over recent decades.', info: 'Average yearly inflation over the period. U.S. CPI has averaged around 2.5–3% over recent decades.' },
  ],
  outputs: [
    { id: 'equivalent', label: 'Equivalent amount', format: 'currency', primary: true, info: 'The amount in the \'to\' year that buys the same as the original amount did in the \'from\' year.' },
    { id: 'cumulative', label: 'Cumulative price change', format: 'percent', precision: 2, info: 'How much prices rose (or fell) in total over the whole period.' },
    { id: 'purchasingPower', label: 'Original amount\'s buying power', format: 'currency', help: 'What the original amount buys, measured in start-year money.', info: 'What the original amount is worth in start-year money once inflation over the period is removed.' },
    { id: 'powerLost', label: 'Purchasing power lost', format: 'percent', precision: 2, info: 'The share of buying power the original amount loses over the period.' },
  ],
  compute: (v) => {
    const amount = num(v.amount);
    const y1 = num(v.startYear);
    const y2 = num(v.endYear);
    const rate = num(v.rate);
    if (amount === null || y1 === null || y2 === null || rate === null || amount < 0 || rate <= -100) return { equivalent: null };
    const years = y2 - y1;
    const factor = (1 + rate / 100) ** years;
    const equivalent = amount * factor;
    const purchasingPower = amount / factor;
    const span = Math.abs(years);
    const stepY = Math.max(1, Math.ceil(span / 100));
    const ks: number[] = [];
    for (let k = 0; k <= span; k += stepY) ks.push(k);
    if (ks[ks.length - 1] !== span) ks.push(span);
    const dir = years >= 0 ? 1 : -1;
    return {
      equivalent,
      cumulative: factor - 1,
      purchasingPower,
      powerLost: 1 - 1 / factor,
      chart: { type: 'line', title: `${money(amount, 0)} from ${y1} over time`, x: ks.map((k) => String(Math.round(y1 + dir * k))), xLabel: 'Year', yFormat: CURRENCY, series: [{ name: 'Equivalent amount', values: ks.map((k) => amount * (1 + rate / 100) ** (dir * k)) }, { name: 'Buying power of the original', values: ks.map((k) => amount / (1 + rate / 100) ** (dir * k)) }] },
      steps: [`Years = ${y2} − ${y1} = ${years}`, `Factor = (1 + ${rate}%)^${years} = ${factor.toFixed(6)}`, `${money(amount)} × ${factor.toFixed(6)} = ${money(equivalent)}`],
      note:
        years >= 0
          ? `${money(amount)} in ${y1} has the same buying power as ${money(equivalent)} in ${y2}.`
          : `${money(amount)} in ${y1} had the same buying power as ${money(equivalent)} in ${y2}.`,
    };
  },
  content: {
    formula: ['Equivalent = amount × (1 + i)^(to year − from year)', 'Purchasing power lost = 1 − 1 ÷ (1 + i)^years'],
    body: [
      'Inflation is the general rise in prices over time. When prices rise, each dollar buys less, so the same amount of money is worth less in the future and was worth more in the past. This calculator compounds an average annual inflation rate across the years you choose.',
      'Use it in either direction. Enter a past year first to see what an old price is in today\'s money, or a future year second to see how much you will need later to match today\'s buying power. Setting the "to" year before the "from" year converts backwards.',
      'Because it uses one average rate, the result is an approximation. Actual inflation varies a lot year to year — U.S. consumer prices rose about 1% in some years of the 2010s and about 8% in 2022. For exact historical comparisons, use the Bureau of Labor Statistics CPI data for the specific years.',
    ],
    faq: [
      { q: 'What inflation rate should I use for planning?', a: 'The U.S. Federal Reserve targets 2% a year over the long run. Many planners use 2.5–3% to stay on the safe side for long-term goals like retirement.' },
      { q: 'How fast does inflation halve the value of money?', a: 'Divide 72 by the inflation rate. At 3%, prices double — and money\'s buying power halves — in about 24 years.' },
    ],
  },
  related: ['compound-interest', 'investment', 'retirement', 'cd'],
  examples: [
    { values: { amount: 100, startYear: 2000, endYear: 2026, rate: 3 }, expect: { equivalent: 215.659127 }, tolerance: 1e-6 },
    { values: { amount: 100, startYear: 2020, endYear: 2010, rate: 0 }, expect: { equivalent: 100, powerLost: 0 } },
  ],
});
