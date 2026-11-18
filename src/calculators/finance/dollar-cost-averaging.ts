import { defineCalculator } from '../../lib/types';
import { num } from '../../lib/math';
import { money } from '../../lib/helpers/finance';

export default defineCalculator({
  slug: 'dollar-cost-averaging',
  title: 'Dollar-Cost Averaging Calculator',
  category: 'finance',
  description: 'See what investing a fixed amount every month would have earned: shares bought, average cost, final value, and how it compares with one lump sum.',
  keywords: ['dollar cost averaging calculator', 'dca calculator', 'monthly investing calculator', 'average cost per share dca', 'dca vs lump sum'],
  updated: '2026-11-18',
  popular: false,
  inputs: [
    { id: 'amount', label: 'Amount invested each month', type: 'number', prefix: '$', default: 100, min: 0, step: 10, info: 'The same dollar amount you buy with at every price.' },
    { id: 'prices', label: 'Share price each month', type: 'list', default: '10, 8, 5, 8, 10, 12', placeholder: 'e.g. 10, 8, 5, 8, 10, 12', help: 'One price per month, in order', info: 'The price on each buy date, oldest first. Separate with commas or spaces. The last price is also used as today\'s value.' },
  ],
  outputs: [
    { id: 'avgCost', label: 'Your average cost per share', format: 'currency', precision: 2, primary: true, info: 'Total invested ÷ total shares. Always at or below the simple average of the prices.' },
    { id: 'shares', label: 'Total shares', format: 'number', precision: 3, info: 'Sum of amount ÷ price for each month.' },
    { id: 'invested', label: 'Total invested', format: 'currency', info: 'Monthly amount × number of months.' },
    { id: 'value', label: 'Value at the last price', format: 'currency', info: 'Total shares × the last price in your list.' },
    { id: 'gain', label: 'Gain or loss', format: 'currency', info: 'Value minus total invested.' },
    { id: 'avgPrice', label: 'Simple average of the prices', format: 'currency', precision: 2, info: 'What the average price would be if you bought the same number of shares each month.' },
    { id: 'lumpGain', label: 'Gain if all invested at the first price', format: 'currency', info: 'Putting the whole total in at month 1 and holding to the last price.' },
  ],
  compute: (v) => {
    const amount = num(v.amount);
    const prices = (Array.isArray(v.prices) ? (v.prices as unknown[]) : []).map((p) => Number(p)).filter((p) => Number.isFinite(p));
    if (amount === null || prices.length === 0) return { avgCost: null };
    if (amount <= 0) return { avgCost: null, error: 'Enter an amount above zero.' };
    if (prices.some((p) => p <= 0)) return { avgCost: null, error: 'Every share price must be above zero.' };
    const n = prices.length;
    let shares = 0;
    const sharesAfter: number[] = [];
    for (const p of prices) {
      shares += amount / p;
      sharesAfter.push(shares);
    }
    const invested = amount * n;
    const last = prices[n - 1];
    const value = shares * last;
    const gain = value - invested;
    const avgCost = invested / shares;
    const avgPrice = prices.reduce((a, b) => a + b, 0) / n;
    const lumpGain = (invested / prices[0]) * last - invested;
    return {
      avgCost,
      shares,
      invested,
      value,
      gain,
      avgPrice,
      lumpGain,
      tone: gain >= 0 ? 'good' : 'bad',
      chart: {
        type: 'line',
        title: 'Portfolio value vs money put in',
        x: prices.map((_, i) => i + 1),
        xLabel: 'Month',
        yFormat: { format: 'currency', precision: 0 },
        series: [
          { name: 'Value', values: sharesAfter.map((s, i) => s * prices[i]) },
          { name: 'Invested', values: prices.map((_, i) => amount * (i + 1)) },
        ],
      },
      steps: [
        `Shares = sum of ${money(amount)} ÷ each price = ${shares.toFixed(3)}`,
        `Average cost = ${money(invested)} ÷ ${shares.toFixed(3)} = ${money(avgCost, 2)}`,
        `Value = ${shares.toFixed(3)} × ${money(last, 2)} = ${money(value)}, so gain = ${money(gain)}`,
      ],
      note: `Buying a fixed dollar amount gives you more shares when prices are low, so your average cost (${money(avgCost, 2)}) is at or below the simple average price (${money(avgPrice, 2)}). Past prices do not predict future returns.`,
    } as never;
  },
  content: {
    formula: ['Shares bought each month = amount ÷ price that month', 'Average cost = total invested ÷ total shares (a harmonic mean of the prices)', 'Value = total shares × last price', 'Gain = value − total invested'],
    body: [
      'Dollar-cost averaging (DCA) means investing the same amount at regular intervals, whatever the price. You buy more shares when the price is low and fewer when it is high.',
      'Say you invest $100 a month for six months at prices of $10, $8, $5, $8, $10 and $12. You buy 10, 12.5, 20, 12.5, 10 and 8.333 shares: 73.333 in total for $600. Your average cost is $8.18, below the simple average price of $8.83. At the last price of $12 your shares are worth $880, a gain of $280. Putting all $600 in at the first price of $10 would have bought 60 shares, worth $720.',
      'DCA does not beat a lump sum every time. When prices rise steadily, investing everything early wins; when prices dip along the way, spreading purchases wins. Its main benefit is behavioural: it removes the pressure of picking a moment.',
      'This tool uses prices you type in, ignores fees, dividends and tax, and is a maths tool rather than investment advice.',
    ],
    faq: [
      { q: 'How do I calculate dollar-cost averaging?', a: 'Divide your fixed amount by the price on each date to get shares, add them up, then divide total money invested by total shares. That is your average cost per share.' },
      { q: 'Why is my average cost below the average price?', a: 'Because the same dollars buy more shares at low prices, low prices count for more. Mathematically your average cost is the harmonic mean of the prices, which is never above the simple average.' },
      { q: 'Is DCA better than a lump sum?', a: 'Not always. If the price only rises, a lump sum at the start wins. If it falls first, DCA wins. The calculator shows both for the prices you enter.' },
      { q: 'What price is used for the final value?', a: 'The last price in your list, treated as today\'s price.' },
    ],
    sources: [
      { label: 'Dollar-cost averaging (Investopedia)', url: 'https://www.investopedia.com/terms/d/dollarcostaveraging.asp' },
      { label: 'Harmonic mean (Wolfram MathWorld)', url: 'https://mathworld.wolfram.com/HarmonicMean.html' },
    ],
  },
  related: ['investment', 'average-cost-basis', 'stock-profit-calculator', 'compound-interest', 'position-size-calculator'],
  examples: [
    { values: { amount: 100, prices: [10, 8, 5, 8, 10, 12] }, expect: { shares: 73.3333333333, invested: 600, value: 880, gain: 280, avgCost: 8.181818182, avgPrice: 8.833333333, lumpGain: 120 }, tolerance: 1e-6 },
    { values: { amount: 100, prices: [50, 50] }, expect: { shares: 4, avgCost: 50, gain: 0 }, tolerance: 1e-6 },
  ],
});
